import { SITE_NAME } from "@/lib/branding";
import { computeExerciseYear } from "@/lib/exercise-year";
import { sendMail } from "@/lib/mail";

/**
 * Outbound notifications for every admin decision a participant can feel.
 *
 * Two rules hold for the whole module:
 *
 *  1. **Never throw.** These are sent from inside the request that performed
 *     the decision. An SMTP outage must not roll back an approval or hand the
 *     admin a 500 for an action the database already committed — so each
 *     sender swallows its own failure and logs it.
 *  2. **Never name the deciding directorate.** Participants see the decision
 *     as coming from PATS; who inside PATS took it is not their business (the
 *     same rule the dashboard copy follows).
 */

function appBaseUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function participantDashboardUrl(): string {
  return `${appBaseUrl()}/event/dashboard`;
}

/** e.g. "PATS 2026" — the edition the participant is registered for. */
function edition(): string {
  return `${SITE_NAME} ${computeExerciseYear()}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Notification = {
  to: string;
  firstName: string;
  subject: string;
  /** Opening sentence, after the greeting. */
  headline: string;
  /** Further paragraphs. */
  body?: string[];
  /** Admin-supplied reason or note, quoted verbatim when present. */
  note?: string | null;
  noteLabel?: string;
  /** Closing call to action; defaults to "open your dashboard". */
  action?: string;
  link?: string;
};

/**
 * Renders and sends one notification. Returns whether it actually went out —
 * `false` covers both "SMTP is not configured" and "sending failed", neither
 * of which the caller should react to beyond logging.
 */
async function notifyParticipant(n: Notification): Promise<boolean> {
  const greeting = n.firstName.trim() || "Participant";
  const link = n.link ?? participantDashboardUrl();
  const action =
    n.action ??
    `Log in to your participant dashboard at ${link} to see the details.`;

  const paragraphs = [
    `Dear ${greeting},`,
    n.headline,
    ...(n.body ?? []),
    ...(n.note?.trim()
      ? [`${n.noteLabel ?? "Message from PATS"}: ${n.note.trim()}`]
      : []),
    action,
    `— ${edition()} Organizing Team`,
  ];

  try {
    return await sendMail({
      to: n.to,
      subject: n.subject,
      text: paragraphs.join("\n\n"),
      html: paragraphs
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join("\n")
        // The dashboard URL is the one thing worth making clickable.
        .replace(escapeHtml(link), `<a href="${escapeHtml(link)}">${escapeHtml(link)}</a>`),
    });
  } catch (error) {
    console.error("[participant-email] send failed", {
      to: n.to,
      subject: n.subject,
      error,
    });
    return false;
  }
}

type Participant = { email: string; firstName: string };

/* ------------------------------------------------ registration decisions */

export function sendRegistrationApprovedEmail(user: Participant) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Your registration has been approved`,
    headline: `Congratulations — your registration for the Pakistan Army Team Spirit (${SITE_NAME}) ${computeExerciseYear()} competition has been approved and your place is confirmed.`,
    body: [
      "No further action is required on the registration itself. Hosting and arrival information will be published to your dashboard as it is finalized.",
    ],
  });
}

export function sendRegistrationUnderReviewEmail(user: Participant) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Your registration is under review`,
    headline:
      "Your registration is now under review. Every step you submitted is being verified.",
    body: [
      "You do not need to do anything right now — we will email you again as soon as a decision is recorded.",
    ],
  });
}

export function sendRegistrationReturnedEmail(
  user: Participant,
  reason?: string | null
) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Your registration needs a correction`,
    headline:
      "Your registration has been returned for correction. It has not been rejected — it simply needs an update before it can be approved.",
    note: reason,
    noteLabel: "What needs correcting",
    action: `Log in to your participant dashboard at ${participantDashboardUrl()}, make the correction and submit the registration again.`,
  });
}

export function sendRegistrationRejectedEmail(
  user: Participant,
  reason?: string | null
) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Decision on your registration`,
    headline: `We regret to inform you that your registration for ${edition()} has not been accepted.`,
    note: reason,
    noteLabel: "Reason given",
    action: `You can review the decision on your participant dashboard at ${participantDashboardUrl()}. If you believe this is in error, raise a support ticket from your dashboard.`,
  });
}

/* --------------------------------------------------- account suspension */

export function sendAccountSuspendedEmail(user: Participant) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Your account has been suspended`,
    headline:
      "Your participant account has been suspended, so you will not be able to sign in for now.",
    action:
      "If you believe this is a mistake, please contact the PATS administration.",
  });
}

export function sendAccountReinstatedEmail(user: Participant) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Your account has been reinstated`,
    headline:
      "Your participant account has been reinstated. You can sign in again and continue where you left off.",
  });
}

/* -------------------------------------------------- team size decisions */

export function sendTeamSizeApprovedEmail(
  user: Participant,
  requestedCount: number,
  note?: string | null
) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Team size request approved`,
    headline: `Your request to register ${requestedCount} team members has been approved. Your roster limit has been raised to ${requestedCount}.`,
    note,
    action: `Log in to your participant dashboard at ${participantDashboardUrl()} to add the additional members.`,
  });
}

export function sendTeamSizeRejectedEmail(
  user: Participant,
  requestedCount: number,
  note?: string | null
) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Team size request declined`,
    headline: `Your request to register ${requestedCount} team members has not been approved. Your existing roster limit is unchanged.`,
    note,
    noteLabel: "Reason given",
  });
}

/* ------------------------------------------------------ flight details */

export function sendFlightsFinalizedEmail(user: Participant) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Your flight details have been finalized`,
    headline:
      "Your team's flight details have been reviewed and finalized. They are now read-only.",
    body: [
      "Hosting and arrival information becomes available on your dashboard once the organizers publish it.",
    ],
  });
}

export function sendFlightsReopenedEmail(user: Participant) {
  return notifyParticipant({
    to: user.email,
    firstName: user.firstName,
    subject: `${edition()} — Your flight details have been reopened`,
    headline:
      "Your team's flight details have been reopened for editing, so you can update passports, tickets and travel information again.",
    action: `Log in to your participant dashboard at ${participantDashboardUrl()} to make the changes.`,
  });
}
