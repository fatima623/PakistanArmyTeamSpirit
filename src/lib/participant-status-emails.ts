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
      `Please log in to your participant dashboard at ${dashboardLink} with your registered credentials to continue with the next step of your registration.`,
    ].join("\n"),
  });
}

