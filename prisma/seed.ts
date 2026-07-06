import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  APPLICATION_STATUS,
  PAYMENT_STATUS,
} from "../src/lib/constants";
import { BCRYPT_ROUNDS } from "../src/lib/password-policy";
import {
  TICKER_PRIORITY,
  TICKER_STATUS,
  TICKER_VISIBILITY,
} from "../src/lib/ticker";
import { saveNewsPdf } from "../src/lib/storage/news-pdf";

/** Minimal valid PDF for the sole seeded news attachment (2025 results). */
function buildSeedNewsPdf(): Buffer {
  const core = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF`;
  const minBytes = 1001;
  if (Buffer.byteLength(core, "utf-8") >= minBytes) {
    return Buffer.from(core, "utf-8");
  }
  const padLen = minBytes - Buffer.byteLength(core, "utf-8");
  const padding = `% ${"PATS seed placeholder PDF. ".repeat(Math.ceil(padLen / 24))}`.slice(
    0,
    padLen
  );
  return Buffer.from(core.replace("%PDF-1.4\n", `%PDF-1.4\n${padding}\n`), "utf-8");
}

const DUMMY_RESULTS_2025_PDF = buildSeedNewsPdf();

const NEWS_DUMMY_SLUG = "results-2025";
/** Only occurrence of this title in the repository (seeded news + PDF). */
const NEWS_DUMMY_TITLE = "Cambrian Patrol 2025 Results";

const prisma = new PrismaClient();

const TEST_PASSWORD = "TestPass123!";
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123!";

/** Legacy seeded accounts removed on re-seed to avoid duplicate test users. */
const LEGACY_TEST_EMAILS = [
  "admin@cambrian.test",
  "pending@cambrian.test",
  "approved@cambrian.test",
  "payment@cambrian.test",
  "verified@cambrian.test",
  "rejected@cambrian.test",
];

async function upsertParticipant(params: {
  email: string;
  firstName: string;
  lastName: string;
  applicationStatus: string;
  paymentStatus: string;
  approved?: boolean;
  rejectionReason?: string;
  unitName?: string;
  withPayment?: boolean;
  paymentRecordStatus?: string;
}) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, BCRYPT_ROUNDS);
  const approved =
    params.approved ??
    params.applicationStatus === APPLICATION_STATUS.APPROVED;

  const user = await prisma.user.upsert({
    where: { email: params.email.toLowerCase() },
    update: {
      passwordHash,
      applicationStatus: params.applicationStatus,
      paymentStatus: params.paymentStatus,
      approved,
      rejectionReason: params.rejectionReason ?? null,
      approvedAt:
        params.applicationStatus === APPLICATION_STATUS.APPROVED
          ? new Date()
          : null,
      emailVerifiedAt: new Date(),
      rejectedAt:
        params.applicationStatus === APPLICATION_STATUS.REJECTED
          ? new Date()
          : null,
    },
    create: {
      email: params.email.toLowerCase(),
      passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      rank: "Capt",
      gender: "Male",
      role: "user",
      applicationStatus: params.applicationStatus,
      paymentStatus: params.paymentStatus,
      approved,
      rejectionReason: params.rejectionReason ?? null,
      approvedAt:
        params.applicationStatus === APPLICATION_STATUS.APPROVED
          ? new Date()
          : null,
      emailVerifiedAt: new Date(),
      privacyAccepted: true,
      privacyAcceptedAt: new Date(),
    },
  });

  if (params.unitName) {
    await prisma.unit.upsert({
      where: { userId: user.id },
      update: { unitName: params.unitName },
      create: {
        userId: user.id,
        unitType: "Regular",
        jointPatrol: false,
        branch: "Army",
        unitName: params.unitName,
        bdeOrFmn: "Test Bde",
        divOrFmn: "Test Div",
        arm: "Infantry",
        service: "Pakistan Army",
        unitAddress: "1 Test Street",
        postcode: "44000",
        telephoneMil: "12345",
        telephoneCiv: "03001234567",
        coName: "CO Test",
        coEmail: "co.test@example.com",
        coPhone: "03001234568",
        coRank: "Lt Col",
        canAccommodateIntl: false,
        longStandingRelation: false,
      },
    });
  }

  if (params.withPayment) {
    const existing = await prisma.payment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (!existing) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: 150,
          status: params.paymentRecordStatus ?? PAYMENT_STATUS.SUBMITTED,
          transactionReference: `TEST-${user.id.slice(0, 8)}`,
          paymentDate: new Date(),
        },
      });
    }
  }

  return user;
}

async function main() {
  const removed = await prisma.user.deleteMany({
    where: {
      email: { in: LEGACY_TEST_EMAILS.map((e) => e.toLowerCase()) },
    },
  });
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} legacy @cambrian.test account(s).`);
  }

  const adminEmail = (
    process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL
  ).toLowerCase().trim();
  const adminPassword =
    process.env.ADMIN_PASSWORD_PLAIN ?? DEFAULT_ADMIN_PASSWORD;

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "admin",
      approved: true,
      applicationStatus: APPLICATION_STATUS.APPROVED,
      paymentStatus: PAYMENT_STATUS.VERIFIED,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: "HQ",
      lastName: "Admin",
      rank: "Admin",
      gender: "Other",
      role: "admin",
      approved: true,
      applicationStatus: APPLICATION_STATUS.APPROVED,
      paymentStatus: PAYMENT_STATUS.VERIFIED,
      emailVerifiedAt: new Date(),
      privacyAccepted: true,
      privacyAcceptedAt: new Date(),
    },
  });

  console.log(`Admin: ${adminEmail} / ${adminPassword}`);

  // Staff accounts for testing the MTD (approver) and SDBS (viewer) roles.
  const staffPasswordHash = await bcrypt.hash(TEST_PASSWORD, BCRYPT_ROUNDS);
  const staffAccounts = [
    {
      email: "mtd@example.com",
      firstName: "Maya",
      lastName: "Approver",
      rank: "Maj",
      role: "mtd",
      note: "MTD (approver)",
    },
    {
      email: "sdbs@example.com",
      firstName: "Sam",
      lastName: "Viewer",
      rank: "Capt",
      role: "sdbs",
      note: "SDBS (viewer)",
    },
  ] as const;

  for (const staff of staffAccounts) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        passwordHash: staffPasswordHash,
        role: staff.role,
        approved: true,
        applicationStatus: APPLICATION_STATUS.APPROVED,
        paymentStatus: PAYMENT_STATUS.VERIFIED,
        emailVerifiedAt: new Date(),
        suspended: false,
      },
      create: {
        email: staff.email,
        passwordHash: staffPasswordHash,
        firstName: staff.firstName,
        lastName: staff.lastName,
        rank: staff.rank,
        gender: "Other",
        role: staff.role,
        approved: true,
        applicationStatus: APPLICATION_STATUS.APPROVED,
        paymentStatus: PAYMENT_STATUS.VERIFIED,
        emailVerifiedAt: new Date(),
        privacyAccepted: true,
        privacyAcceptedAt: new Date(),
      },
    });
  }

  console.log(`Staff (password: ${TEST_PASSWORD}):`);
  for (const staff of staffAccounts) {
    console.log(`  ${staff.email} — ${staff.note}`);
  }

  const testAccounts = [
    {
      email: "pending@example.com",
      firstName: "Pat",
      lastName: "Pending",
      applicationStatus: APPLICATION_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      approved: false,
      unitName: "1st Pending Unit",
      note: "application pending",
    },
    {
      email: "approved@example.com",
      firstName: "Ann",
      lastName: "Approved",
      applicationStatus: APPLICATION_STATUS.APPROVED,
      paymentStatus: PAYMENT_STATUS.PENDING,
      unitName: "2nd Approved Unit",
      note: "approved, payment due",
    },
    {
      email: "payment@example.com",
      firstName: "Pay",
      lastName: "Submitted",
      applicationStatus: APPLICATION_STATUS.APPROVED,
      paymentStatus: PAYMENT_STATUS.SUBMITTED,
      unitName: "3rd Payment Unit",
      withPayment: true,
      paymentRecordStatus: PAYMENT_STATUS.SUBMITTED,
      note: "payment submitted",
    },
    {
      email: "verified@example.com",
      firstName: "Val",
      lastName: "Verified",
      applicationStatus: APPLICATION_STATUS.APPROVED,
      paymentStatus: PAYMENT_STATUS.VERIFIED,
      unitName: "4th Verified Unit",
      withPayment: true,
      paymentRecordStatus: PAYMENT_STATUS.VERIFIED,
      note: "fully verified",
    },
    {
      email: "rejected@example.com",
      firstName: "Reg",
      lastName: "Rejected",
      applicationStatus: APPLICATION_STATUS.REJECTED,
      paymentStatus: PAYMENT_STATUS.PENDING,
      approved: false,
      rejectionReason: "Incomplete unit documentation for 2026 cycle.",
      unitName: "5th Rejected Unit",
      note: "application rejected",
    },
  ] as const;

  for (const account of testAccounts) {
    await upsertParticipant(account);
  }

  console.log(`Test participants (password: ${TEST_PASSWORD}):`);
  for (const account of testAccounts) {
    console.log(`  ${account.email} — ${account.note}`);
  }

  // Sample support tickets (idempotent) owned by the approved participant.
  const ticketOwner = await prisma.user.findUnique({
    where: { email: "approved@example.com" },
  });
  if (ticketOwner) {
    const existingTickets = await prisma.supportTicket.count({
      where: { userId: ticketOwner.id },
    });
    if (existingTickets === 0) {
      const ownerName = `${ticketOwner.firstName} ${ticketOwner.lastName}`;
      await prisma.supportTicket.create({
        data: {
          userId: ticketOwner.id,
          subject: "Unable to upload payment proof",
          category: "PAYMENT",
          priority: "HIGH",
          status: "OPEN",
          lastReplyAt: new Date(),
          messages: {
            create: {
              authorId: ticketOwner.id,
              authorRole: "user",
              authorName: ownerName,
              body: "The upload button does not respond when I try to attach my receipt.",
            },
          },
        },
      });
      await prisma.supportTicket.create({
        data: {
          userId: ticketOwner.id,
          subject: "Question about unit phase selection",
          category: "REGISTRATION",
          priority: "NORMAL",
          status: "IN_PROGRESS",
          lastReplyAt: new Date(),
          messages: {
            create: [
              {
                authorId: ticketOwner.id,
                authorRole: "user",
                authorName: ownerName,
                body: "Can we change our preferred phase after approval?",
              },
              {
                authorRole: "staff",
                authorName: "HQ Admin",
                body: "Yes — please contact the CP Helpdesk and we will review the request.",
              },
            ],
          },
        },
      });
      console.log("Seeded 2 support tickets for approved@example.com");
    }
  }

  // Deadlines in the future so registration/payment stay open and the timeline
  // shows a live countdown. Set one to a past date in admin to test the block.
  const registrationDeadline = new Date("2026-07-31T23:59:00");
  const paymentDeadline = new Date("2026-08-31T23:59:00");

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      feeNoticeText: "",
      approvalNoticeText:
        "Your application is under review by PATS. You will be notified when approved.",
      defaultPaymentAmount: 15000,
      registrationDeadline,
      paymentDeadline,
    },
    create: {
      id: "singleton",
      feeNoticeText: "",
      approvalNoticeText:
        "Your application is under review by PATS. You will be notified when approved.",
      registrationDeadline,
      paymentDeadline,
    },
  });

  const keyDates = [
    { label: "DIN", value: "January 2026", sortOrder: 0, date: new Date("2026-01-15") },
    {
      label: "Opening date for applications",
      value:
        "27 February 2026 for all teams (including International Patrols (IPs))",
      sortOrder: 1,
      date: new Date("2026-02-27"),
    },
    {
      label: "Closing dates",
      value:
        "UK Applications - 2359 5 June 2026\nIPs to register - 2359 1 May 2026",
      sortOrder: 2,
    },
    {
      label: "Participation (incl phase) confirmed by",
      value: "UK Applications - 2359hrs 19 June 2026",
      sortOrder: 3,
    },
    {
      label:
        "Confirmed places to be communicated to IP Team Managers and Defence Attaches by",
      value: "2359 hrs 29 May 2026",
      sortOrder: 4,
    },
    { label: "JIs", value: "31 July 2026", sortOrder: 5, date: new Date("2026-07-31") },
    {
      label: "WngOs",
      value: "Dispatched D-21 from deployment date.",
      sortOrder: 6,
    },
    {
      label: "Refunds",
      value:
        "Withdrawals received prior to the Warning Order being issued will be eligible for a refund.",
      sortOrder: 7,
    },
  ];

  await prisma.keyDate.deleteMany();
  await prisma.keyDate.createMany({ data: keyDates });

  await prisma.newsPost.deleteMany({
    where: { slug: "cambrian-patrol-2025-results" },
  });

  const newsDummy = await prisma.newsPost.upsert({
    where: { slug: NEWS_DUMMY_SLUG },
    update: {
      title: NEWS_DUMMY_TITLE,
      published: true,
      content:
        "<p>Download the attached PDF for the 2025 competition results.</p>",
    },
    create: {
      title: NEWS_DUMMY_TITLE,
      slug: NEWS_DUMMY_SLUG,
      content:
        "<p>Download the attached PDF for the 2025 competition results.</p>",
      published: true,
      publishedAt: new Date("2025-05-18T12:00:00.000Z"),
    },
  });

  const pdfMeta = await saveNewsPdf({
    postId: newsDummy.id,
    buffer: DUMMY_RESULTS_2025_PDF,
    originalFileName: "2025-results.pdf",
    declaredMime: "application/pdf",
  });

  await prisma.newsPost.update({
    where: { id: newsDummy.id },
    data: {
      pdfPath: pdfMeta.pdfPath,
      pdfOriginalName: pdfMeta.pdfOriginalName,
      pdfMimeType: pdfMeta.pdfMimeType,
      pdfFileSize: pdfMeta.pdfFileSize,
    },
  });

  const tickerAnnouncements = [
    {
      message: "Registration for PATS Competition 2026 is now open",
      priority: TICKER_PRIORITY.HIGH,
      status: TICKER_STATUS.ACTIVE,
      visibility: TICKER_VISIBILITY.HOMEPAGE,
      isUrgent: false,
      sortOrder: 0,
    },
    {
      message: "International team participation confirmations underway",
      priority: TICKER_PRIORITY.MEDIUM,
      status: TICKER_STATUS.ACTIVE,
      visibility: TICKER_VISIBILITY.GLOBAL,
      isUrgent: false,
      sortOrder: 1,
    },
    {
      message: "Key operational dates updated for 2026 cycle",
      priority: TICKER_PRIORITY.NORMAL,
      status: TICKER_STATUS.ACTIVE,
      visibility: TICKER_VISIBILITY.HOMEPAGE,
      isUrgent: false,
      sortOrder: 2,
    },
    {
      message:
        "Approved teams must complete payment verification before deadline",
      priority: TICKER_PRIORITY.CRITICAL,
      status: TICKER_STATUS.ACTIVE,
      visibility: TICKER_VISIBILITY.GLOBAL,
      isUrgent: true,
      sortOrder: 3,
    },
    {
      message: "GHQ Rawalpindi operational coordination active for PATS 2026",
      priority: TICKER_PRIORITY.NORMAL,
      status: TICKER_STATUS.ACTIVE,
      visibility: TICKER_VISIBILITY.HOMEPAGE,
      isUrgent: false,
      sortOrder: 4,
    },
  ];

  await prisma.tickerAnnouncement.deleteMany();
  await prisma.tickerAnnouncement.createMany({ data: tickerAnnouncements });

  await prisma.dataEntryPeriod.deleteMany();
  await prisma.dataEntryPeriod.createMany({
    data: [
      { openDate: new Date("2026-07-04"), label: "Patrol manager" },
      { openDate: new Date("2026-08-03"), label: "Patrol composition" },
      { openDate: new Date("2026-09-11"), label: "Unit Visits" },
      {
        openDate: new Date("2026-09-11"),
        label: "Start standard declaration",
      },
      {
        openDate: new Date("2026-09-18"),
        label: "Weapons and Equipment Register",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
