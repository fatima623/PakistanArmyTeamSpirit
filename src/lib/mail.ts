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
    // Always warn: callers treat mail as fire-and-forget, so an unconfigured
    // mailer is otherwise indistinguishable from a delivered email.
    console.warn(
      `[mail] SMTP not configured (missing ${["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]
        .filter((k) => !process.env[k])
        .join(", ")}) — email to ${options.to} not sent.`
    );
    if (process.env.NODE_ENV === "development") {
      // Bodies can carry reset/verification tokens, so only ever in dev.
      console.warn(`[mail] To: ${options.to}\n${options.text}`);
    }
    return false;
  }

  if (host.includes("@")) {
    console.error(
      `[mail] SMTP_HOST is "${host}" — that is an email address, not a mail ` +
        `server hostname (Gmail: smtp.gmail.com). Email to ${options.to} not sent.`
    );
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

  try {
    await transport.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>"),
    });
  } catch (error) {
    // Log before re-throwing: most callers swallow send failures on purpose,
    // so this is the only place the real SMTP error is ever visible.
    const { code, message } = error as { code?: string; message?: string };
    console.error(
      `[mail] send failed to ${options.to} via ${host}:${port} — ${code ?? "ERROR"}: ${message}`
    );
    throw error;
  }

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
