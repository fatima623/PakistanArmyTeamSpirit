import { sendMail } from "@/lib/mail";

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

export async function sendRegistrationApprovedEmail(user: {
  email: string;
  firstName: string;
}): Promise<void> {
  const dashboardLink = participantDashboardUrl();
  const greeting = user.firstName.trim() || "Participant";

  await sendMail({
    to: user.email,
    subject: "PATS 2026 — Your Registration Has Been Approved",
    text: [
      `Congratulations, ${greeting}. Your registration for the Pakistan Army Team Spirit (PATS) 2026 competition has been approved.`,
      "",
      `Please log in to your participant dashboard at ${dashboardLink} with your registered credentials to view payment details and complete the next step.`,
    ].join("\n"),
  });
}

export async function sendPaymentConfirmedEmail(user: {
  email: string;
  firstName: string;
}): Promise<void> {
  const greeting = user.firstName.trim() || "Participant";

  await sendMail({
    to: user.email,
    subject: "PATS 2026 — Payment Confirmed, Participation Finalized",
    text: [
      `Dear ${greeting}, your payment has been verified and your participation in PATS 2026 is now fully confirmed.`,
      "",
      "Welcome to the team. Further coordination details will follow.",
    ].join("\n"),
  });
}
