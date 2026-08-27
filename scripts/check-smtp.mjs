/**
 * SMTP diagnostic. Answers "why did the participant never get the email?"
 * without having to trigger a real admin decision first.
 *
 * Outbound mail is deliberately fire-and-forget everywhere in the app (an SMTP
 * outage must never roll back an approval), which means a broken SMTP config
 * fails silently. This script makes that failure loud and readable.
 *
 *   node scripts/check-smtp.mjs                  # connect + authenticate only
 *   node scripts/check-smtp.mjs you@example.com  # also send a real test email
 */
import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? "587");
const secure = process.env.SMTP_SECURE === "true";
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? "noreply@example.com";

const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter(
  (k) => !process.env[k]
);
if (missing.length) {
  console.error(`FAIL: missing ${missing.join(", ")} in .env — no mail is sent at all.`);
  process.exit(1);
}

console.log(`host   : ${host}`);
console.log(`port   : ${port} (secure=${secure})`);
console.log(`user   : ${user}`);
console.log(`from   : ${from}`);
console.log(`pass   : ${"*".repeat(Math.min(pass.length, 16))} (${pass.length} chars)\n`);

// The exact mistake that broke this once: SMTP_HOST holding an address, not a
// server name. DNS then fails with EBADNAME and every email dies on send.
if (host.includes("@")) {
  console.error(
    `FAIL: SMTP_HOST is "${host}" — that is an email address, not a mail server.\n` +
      `      Use your provider's server (Gmail: smtp.gmail.com). The address goes in SMTP_USER.`
  );
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
});

try {
  await transport.verify();
  console.log("OK: connected and authenticated.");
} catch (error) {
  console.error(`FAIL: ${error.code ?? "ERROR"} — ${error.message}`);
  if (error.code === "EAUTH" && /gmail/i.test(host)) {
    console.error(
      "\nGmail rejects normal account passwords over SMTP. SMTP_PASS must be a\n" +
        "16-character App Password generated at https://myaccount.google.com/apppasswords\n" +
        "(2-Step Verification has to be on for that page to exist)."
    );
  }
  if (error.code === "EDNS" || error.code === "ECONNECTION") {
    console.error("\nSMTP_HOST could not be reached — check the server name and port.");
  }
  process.exit(1);
}

const recipient = process.argv[2];
if (!recipient) {
  console.log("\nNo recipient given, so no test email was sent.");
  console.log("Run `node scripts/check-smtp.mjs someone@example.com` to send one.");
  process.exit(0);
}

try {
  const info = await transport.sendMail({
    from,
    to: recipient,
    subject: "PATS portal — SMTP test",
    text: "If you are reading this, the PATS portal can send email to this address.",
  });
  console.log(`\nOK: test email accepted for ${recipient} (id ${info.messageId}).`);
  console.log("If it does not arrive, check the Spam folder.");
} catch (error) {
  console.error(`\nFAIL sending to ${recipient}: ${error.code ?? "ERROR"} — ${error.message}`);
  process.exit(1);
}
