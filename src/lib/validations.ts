import { z } from "zod";

import {
  CUSTOM_COUNTRY_OPTION,
  isValidCountry,
  PAKISTAN_COUNTRY,
  resolveCountryForSubmit,
} from "@/lib/countries";
import { passwordFieldSchema } from "@/lib/password-policy";

export const LoginSchema = z.object({
  email: z.string().email(),
  /** Login only: no complexity check (preserves existing accounts). */
  password: z.string().min(1, "Password required"),
  rememberMe: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === true || value === "true"),
});

/**
 * A single optional team member. Used both standalone (Participant Panel CRUD)
 * and as an optional array on registration. All fields trim and are required
 * *when a member is being added* — the section as a whole stays optional.
 */
export const TeamMemberSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  serviceNumber: z.string().trim().min(1, "Service number is required"),
  serviceArm: z.string().trim().min(1, "Service / Arm is required"),
  gender: z.enum(["Male", "Female", "Other"]),
});

export type TeamMemberInput = z.infer<typeof TeamMemberSchema>;

export const RegisterSchema = z
  .object({
    email: z.string().email("Valid military email required"),
    password: passwordFieldSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    rank: z.string().min(1, "Required"),
    gender: z.enum(["Male", "Female", "Other"]),
    unitType: z.enum(["Regular", "Reserve", "UOTC", "International"]),
    jointPatrol: z.boolean(),
    branch: z.enum(["Army", "Navy", "Air Force"]),
    unitName: z.string().min(1, "Required"),
    country: z.string().min(1, "Required"),
    customCountry: z.string().optional(),
    nationality: z.string().optional(),
    bdeOrFmn: z.string().min(1, "Required"),
    divOrFmn: z.string().min(1, "Required"),
    arm: z.string().min(1, "Required"),
    service: z.string().min(1, "Required"),
    unitAddress: z.string().min(1, "Required"),
    postcode: z.string().min(1, "Required"),
    telephoneMil: z.string().min(1, "Required"),
    telephoneCiv: z.string().min(1, "Required"),
    secondPocEmail: z.string().email().optional().or(z.literal("")),
    thirdPocEmail: z.string().email().optional().or(z.literal("")),
    additionalInfo: z.string().optional(),
    coName: z.string().min(1, "Required"),
    coEmail: z.string().email("Valid email required"),
    coPhone: z.string().min(1, "Required"),
    coRank: z.string().min(1, "Required"),
    coSalutations: z.string().optional(),
    canAccommodateIntl: z.boolean(),
    preferredIntlPatrol: z.string().optional(),
    longStandingRelation: z.boolean(),
    /** Optional team members captured during registration — never blocks submit. */
    teamMembers: z.array(TeamMemberSchema).optional(),
    privacyAccepted: z.literal(true, {
      error: "You must accept the privacy policy",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => isValidCountry(d.country), {
    message: "Select a valid country",
    path: ["country"],
  })
  .refine(
    (d) =>
      d.country !== CUSTOM_COUNTRY_OPTION ||
      (d.customCountry?.trim().length ?? 0) > 0,
    {
      message: "Please enter your country",
      path: ["customCountry"],
    }
  )
  .refine((d) => {
    const resolved = resolveCountryForSubmit(d.country, d.customCountry);
    return (
      resolved === PAKISTAN_COUNTRY || (d.nationality?.trim().length ?? 0) > 0
    );
  }, {
    message: "Required for international participants",
    path: ["nationality"],
  });

export const UnitUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  rank: z.string().min(1),
  unitType: z.enum(["Regular", "Reserve", "UOTC", "International"]),
  jointPatrol: z.boolean(),
  branch: z.enum(["Army", "Navy", "Air Force"]),
  unitName: z.string().min(1),
  bdeOrFmn: z.string().min(1),
  divOrFmn: z.string().min(1),
  arm: z.string().min(1),
  service: z.string().min(1),
  unitAddress: z.string().min(1),
  postcode: z.string().min(1),
  telephoneMil: z.string().min(1),
  telephoneCiv: z.string().min(1),
  secondPocEmail: z.string().email().optional().or(z.literal("")),
  thirdPocEmail: z.string().email().optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
  coName: z.string().min(1),
  coEmail: z.string().email(),
  coPhone: z.string().min(1),
  coRank: z.string().min(1),
  coSalutations: z.string().optional(),
});

export const NewsPostSchema = z.object({
  title: z.string().min(1, "Title required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  content: z.string().min(1, "Content required"),
  publishedAt: z.union([z.string().datetime(), z.coerce.date()]),
  published: z.boolean().optional(),
});

/** Metadata for a gallery image. The binary is uploaded separately (multipart). */
export const GalleryImageSchema = z.object({
  title: z.string().min(1, "Title required").max(160),
  caption: z.string().max(500).optional().or(z.literal("")),
  // number sets the year; "" or null clears it; absent leaves it unchanged (partial patch).
  year: z
    .union([
      z.coerce.number().int().min(1900).max(2100),
      z.literal("").transform(() => null),
      z.null(),
    ])
    .optional(),
  category: z.string().max(80).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
});

/** Update variant — all metadata fields optional (partial patch). */
export const GalleryImageUpdateSchema = GalleryImageSchema.partial();

export const KeyDateSchema = z.object({
  label: z.string().min(1, "Label required"),
  value: z.string().min(1, "Value required"),
  sortOrder: z.number().int().min(0),
});

const tickerPriorityValues = ["CRITICAL", "HIGH", "MEDIUM", "NORMAL"] as const;
const tickerStatusValues = ["ACTIVE", "DRAFT", "DISABLED", "EXPIRED"] as const;
const tickerVisibilityValues = [
  "HOMEPAGE",
  "LOGIN",
  "DASHBOARD_BANNER",
  "GLOBAL",
] as const;

export const TickerScrollSpeedSchema = z.enum([
  "SLOW",
  "NORMAL",
  "FAST",
  "VERY_FAST",
]);

export const TickerAnnouncementSchema = z.object({
  message: z.string().min(1, "Message required").max(500),
  priority: z.enum(tickerPriorityValues),
  status: z.enum(tickerStatusValues),
  visibility: z.enum(tickerVisibilityValues),
  isUrgent: z.boolean(),
  sortOrder: z.number().int().min(0),
  expiresAt: z
    .union([z.string(), z.literal(""), z.null()])
    .optional()
    .transform((v) => {
      if (v == null || v === "") return null;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString();
    }),
});

export const PasswordResetSchema = z.object({
  email: z.string().email(),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordFieldSchema,
});

/** Accepts a datetime-local / ISO string (or empty/null) → Date | null. */
const nullableDeadline = z
  .union([z.string(), z.literal(""), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  });

export const SiteSettingsSchema = z.object({
  registrationOpen: z.boolean(),
  intlRegistrationOpen: z.boolean(),
  registrationDeadline: nullableDeadline,
  paymentDeadline: nullableDeadline,
  exerciseYear: z.number().int().min(2024).max(2099),
  exerciseDates: z.string().min(1),
  privacyPolicyUrl: z.string().min(1),
  feeNoticeText: z.string(),
  approvalNoticeText: z.string(),
  facebookUrl: z.union([z.string().url(), z.literal("#")]),
  twitterUrl: z.union([z.string().url(), z.literal("#")]),
  instagramUrl: z.union([z.string().url(), z.literal("#")]),
  merchandiseQrUrl: z.union([z.string().url(), z.string().email(), z.literal("#")]),
  photographyQrUrl: z.union([z.string().url(), z.string().email(), z.literal("#")]),
  defaultPaymentAmount: z.coerce.number().positive(),
  paymentCurrency: z.string().min(1).max(10),
  paymentBankName: z.string().min(1),
  paymentBankAccountTitle: z.string().min(1),
  paymentBankAccountNumber: z.string().min(1),
  paymentBankIban: z.string(),
  paymentWiseEmail: z.string().min(1),
  paymentWiseName: z.string().min(1),
  paymentMobileNumber: z.string().min(1),
  paymentMobileTitle: z.string().min(1),
  paymentRemitlyEmail: z.string().min(1),
  paymentRemitlyName: z.string().min(1),
});

export const AdminUserUpdateSchema = z.object({
  approved: z.boolean().optional(),
  firstName: z.string().trim().min(1, "Required").optional(),
  lastName: z.string().trim().min(1, "Required").optional(),
  email: z.string().email("Valid email required").optional(),
  rank: z.string().trim().min(1, "Required").optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  role: z.enum(["user", "sdbs", "mtd", "admin"]).optional(),
  applicationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  paymentStatus: z
    .enum([
      "PENDING",
      "SUBMITTED",
      "VERIFIED",
      "REJECTED",
      "APPROVED",
      "UNDER_REVIEW",
    ])
    .optional(),
  adminNotes: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
  suspended: z.boolean().optional(),
});

export const AdminResetPasswordSchema = z.object({
  newPassword: passwordFieldSchema,
});

export const AdminCreateUserSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  rank: z.string().trim().min(1, "Required"),
  gender: z.enum(["Male", "Female", "Other"]),
  role: z.enum(["user", "sdbs", "mtd", "admin"]),
  password: passwordFieldSchema,
});

export const PaymentSubmitSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentDate: z.coerce.date(),
  transactionReference: z.string().min(1, "Reference required"),
});

/** Shape-only validation; rejection reason rules are enforced in the admin payment API with DB context. */
export const AdminPaymentUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "SUBMITTED",
    "UNDER_REVIEW",
    "VERIFIED",
    "REJECTED",
    "RETURNED",
    "APPROVED",
  ]),
  adminNotes: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

export const AdminUnitUpdateSchema = UnitUpdateSchema.extend({
  preferredPhase: z.string().optional().nullable(),
  patrolsRequested: z.number().int().min(1).optional(),
  canAccommodateIntl: z.boolean().optional(),
  preferredIntlPatrol: z.string().optional().nullable(),
  longStandingRelation: z.boolean().optional(),
});

export const TicketCreateSchema = z.object({
  subject: z.string().trim().min(3, "Subject is too short").max(150),
  category: z
    .enum(["GENERAL", "REGISTRATION", "PAYMENT", "TECHNICAL"])
    .default("GENERAL"),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  message: z.string().trim().min(5, "Please describe your issue").max(5000),
});

export const TicketReplySchema = z.object({
  body: z.string().trim().min(1, "Message required").max(5000),
});

export const AdminTicketUpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
  assignedToId: z.string().optional().nullable(),
});

// Legacy aliases for gradual migration
export const loginSchema = LoginSchema;
export const registerSchema = RegisterSchema;
