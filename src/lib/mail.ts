type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail(options: SendMailOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ?? "noreply@example.com";

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[mail] SMTP not configured — email not sent.");
      console.warn(`[mail] To: ${options.to}\n${options.text}`);
    }
    return false;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true";

  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br>"),
  });

  return true;
}

export function buildPasswordResetUrl(token: string): string {
  const base =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/event/reset-password?token=${encodeURIComponent(token)}`;
}

export function buildEmailVerificationUrl(token: string): string {
  const base =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/event/verify-email?token=${encodeURIComponent(token)}`;
}
