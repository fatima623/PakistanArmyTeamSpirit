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
  serviceNumber: z.string().trim().min(1, "Serial number is required"),
  rank: z.string().trim().min(1, "Rank is required"),
  /** Optional detail — may be empty. Kept as a plain string so the schema's
   *  input and output types match (react-hook-form resolver requirement). */
  serviceArm: z.string().trim().max(120),
  gender: z.enum(["Male", "Female", "Other"]),
});

export type TeamMemberInput = z.infer<typeof TeamMemberSchema>;

/** First-login participation availability decision. */
export const ParticipationActionSchema = z.object({
  action: z.enum(["confirm", "decline"]),
});

/** Request to exceed the team-member cap (justification goes to Admin). */
export const TeamSizeRequestSchema = z.object({
  requestedCount: z.coerce
    .number()
    .int()
    .min(14, "Requested team size must be at least 14")
    .max(200, "Requested size too large"),
  justification: z
    .string()
    .trim()
    .min(20, "Please provide a justification (at least 20 characters)")
    .max(2000),
});

export const AdminTeamSizeReviewSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reviewNote: z.string().trim().max(2000).optional().nullable(),
  })
  .refine(
    (d) => d.status !== "REJECTED" || (d.reviewNote?.trim().length ?? 0) > 0,
    {
      message: "A note is required when rejecting a request",
      path: ["reviewNote"],
    }
  );

/** Flight detail text fields (files validated separately in the API).
 *  Every flight record belongs to exactly ONE roster member — each traveller
 *  files their own passport and ticket. `teamMemberId` is therefore required
 *  on create; legacy team-level rows (teamMemberId = null) are adopted by
 *  re-linking them through PUT. */
export const FlightDetailFieldsSchema = z.object({
  teamMemberId: z
    .string()
    .trim()
    .min(1, "Select the traveller this flight belongs to"),
  passengerName: z.string().trim().min(1, "Passenger name is required").max(160),
  passportNumber: z
    .string()
    .trim()
    .min(3, "Passport number is required")
    .max(50)
    .regex(/^[A-Za-z0-9-]+$/, "Letters, digits and dashes only"),
});

export const AdminFlightFinalizeSchema = z.object({
  userId: z.string().trim().min(1),
  finalized: z.boolean(),
  /** Admin override: lock a team even though some travellers are incomplete. */
  force: z.boolean().optional(),
});

export const RegisterSchema = z
  .object({
    email: z.string().email("Valid military email required"),
    password: passwordFieldSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    rank: z.string().min(1, "Required"),
    gender: z.enum(["Male", "Female", "Other"]),
    unitType: z.enum(["Regular", "Reserve"]),
    branch: z.enum(["Army", "Navy", "Air Force"]),
    unitName: z.string().min(1, "Required"),
    country: z.string().min(1, "Required").max(100, "Too long"),
    customCountry: z.string().max(100, "Too long").optional(),
    nationality: z.string().max(100, "Too long").optional(),
    arm: z.string().min(1, "Required"),
    secondPocEmail: z.string().email().optional().or(z.literal("")),
    thirdPocEmail: z.string().email().optional().or(z.literal("")),
    additionalInfo: z.string().optional(),
    coName: z.string().min(1, "Required"),
    coEmail: z.string().email("Valid email required"),
    coPhone: z.string().min(1, "Required"),
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
  unitType: z.enum(["Regular", "Reserve"]),
  branch: z.enum(["Army", "Navy", "Air Force"]),
  unitName: z.string().min(1),
  arm: z.string().min(1),
  secondPocEmail: z.string().email().optional().or(z.literal("")),
  thirdPocEmail: z.string().email().optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
  coName: z.string().min(1),
  coEmail: z.string().email(),
  coPhone: z.string().min(1),
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

export const EventBreakdownItemSchema = z.object({
  label: z.string().min(1, "Label required").max(120),
  marks: z.coerce.number().int().min(0).max(9999),
});

export const EventSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  marks: z.coerce.number().int().min(0).max(9999).optional(),
  icon: z.string().max(60).optional().or(z.literal("")),
  category: z.string().min(1, "Category required").max(80),
  difficulty: z.string().min(1, "Difficulty required").max(40),
  duration: z.string().min(1, "Duration required").max(120),
  summary: z.string().min(1, "Summary required").max(600),
  details: z.string().min(1, "Details required").max(4000),
  participants: z.string().max(200).optional().or(z.literal("")),
  breakdown: z.array(EventBreakdownItemSchema).max(20).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
});

/** Update variant — all fields optional (partial patch). */
export const EventUpdateSchema = EventSchema.partial();

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
  participationConfirmDeadline: nullableDeadline,
  teamRegistrationOpenDate: nullableDeadline,
  teamRegistrationCloseDate: nullableDeadline,
  flightDetailsDeadline: nullableDeadline,
  maxTeamMembers: z.coerce.number().int().min(1).max(200).default(13),
  hostInfoPublished: z.boolean().default(false),
  hostInfoContent: z.string().max(20000).optional().nullable(),
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
  applicationStatus: z
    .enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "RETURNED"])
    .optional(),
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
  /* Country is an admin-editable profile field — without it there is no way to
     correct a participant whose country was never captured. */
  country: z.string().trim().min(1, "Required").max(100, "Too long").optional(),
  customCountry: z.string().max(100, "Too long").optional(),
  nationality: z.string().trim().max(100, "Too long").optional().nullable(),
})
  .refine((d) => !d.country?.trim() || isValidCountry(d.country), {
    message: "Select a valid country",
    path: ["country"],
  })
  .refine(
    (d) =>
      d.country !== CUSTOM_COUNTRY_OPTION ||
      (d.customCountry?.trim().length ?? 0) > 0,
    { message: "Please enter the country", path: ["customCountry"] }
  );

export const AdminResetPasswordSchema = z.object({
  newPassword: passwordFieldSchema,
});

/**
 * Country is REQUIRED for participants (role "user") and mirrors the public
 * RegisterSchema rules — otherwise an admin-created participant lands with no
 * country and is invisible to every country column and country-wise tally.
 * Staff/host accounts are not participants, so country does not apply to them.
 */
export const AdminCreateUserSchema = z
  .object({
    email: z.string().email("Valid email required"),
    firstName: z.string().trim().min(1, "Required"),
    lastName: z.string().trim().min(1, "Required"),
    rank: z.string().trim().min(1, "Required"),
    gender: z.enum(["Male", "Female", "Other"]),
    role: z.enum(["user", "sdbs", "mtd", "admin"]),
    password: passwordFieldSchema,
    country: z.string().max(100, "Too long").optional(),
    customCountry: z.string().max(100, "Too long").optional(),
    nationality: z.string().max(100, "Too long").optional(),
  })
  .refine((d) => d.role !== "user" || (d.country?.trim().length ?? 0) > 0, {
    message: "Required for participants",
    path: ["country"],
  })
  .refine((d) => !d.country?.trim() || isValidCountry(d.country), {
    message: "Select a valid country",
    path: ["country"],
  })
  .refine(
    (d) =>
      d.country !== CUSTOM_COUNTRY_OPTION ||
      (d.customCountry?.trim().length ?? 0) > 0,
    { message: "Please enter the country", path: ["customCountry"] }
  )
  .refine(
    (d) => {
      if (d.role !== "user" || !d.country?.trim()) return true;
      const resolved = resolveCountryForSubmit(d.country, d.customCountry);
      return (
        resolved === PAKISTAN_COUNTRY || (d.nationality?.trim().length ?? 0) > 0
      );
    },
    { message: "Required for international participants", path: ["nationality"] }
  );

/**
 * Create a Host Formation together with its single `host`-role login account.
 * `name` is the formation (e.g. "HQ 37 Div"); firstName/lastName/email/password
 * provision the login. (`host` is deliberately absent from AdminCreateUserSchema
 * — host accounts are created only through this flow.)
 */
export const HostFormationCreateSchema = z.object({
  name: z.string().trim().min(1, "Formation name is required"),
  notes: z.string().trim().max(2000).optional(),
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  email: z.string().email("Valid email required"),
  password: passwordFieldSchema,
});

/** Edit a Host Formation's own details (not its login credentials). */
export const HostFormationUpdateSchema = z.object({
  name: z.string().trim().min(1, "Formation name is required"),
  notes: z.string().trim().max(2000).optional(),
});

/**
 * Assign/unassign a finalized team to a Host Formation. `null` unassigns.
 * The travel-ready business rule is enforced in the route with DB context.
 */
export const HostFormationAssignSchema = z.object({
  hostFormationId: z.string().trim().min(1).nullable(),
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
