/**
 * Migrates legacy public/uploads/payments files into private storage/payment-proofs/.
 *
 * Usage:
 *   node scripts/migrate-payment-proofs-to-storage.mjs
 *   node scripts/migrate-payment-proofs-to-storage.mjs --dry-run
 */

import "dotenv/config";
import { access, copyFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { buildPaymentProofFileName } from "./lib/payment-proof-naming.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LEGACY_DIR = path.join(ROOT, "public", "uploads", "payments");
const STORAGE_ROOT =
  process.env.PAYMENT_PROOF_STORAGE_DIR?.trim()
    ? path.isAbsolute(process.env.PAYMENT_PROOF_STORAGE_DIR)
      ? process.env.PAYMENT_PROOF_STORAGE_DIR
      : path.join(ROOT, process.env.PAYMENT_PROOF_STORAGE_DIR)
    : path.join(ROOT, "uploads", "payment-proofs");

const dryRun = process.argv.includes("--dry-run");

function extFromMime(mime) {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  return "jpg";
}

function buildPaths(userId, uploaderName, ext, uploadedAt) {
  const fileName = buildPaymentProofFileName({
    userId,
    uploaderName,
    extension: ext,
    uploadedAt,
  });
  const now = uploadedAt ?? new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const internalFilePath = `${userId.replace(/[^a-zA-Z0-9_-]/g, "")}/${yyyy}/${mm}/${fileName}`;
  return { internalFilePath, fileName };
}

async function main() {
  const prisma = new PrismaClient();

  const payments = await prisma.payment.findMany({
    where: {
      proofFileName: { not: null },
      internalFilePath: null,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  console.log(`Found ${payments.length} payment(s) to migrate.`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const payment of payments) {
    const legacyName = payment.proofFileName
      ? path.basename(payment.proofFileName)
      : null;

    if (!legacyName) {
      console.warn(`  SKIP ${payment.id}: no legacy proofFileName`);
      skip++;
      continue;
    }

    const source = path.join(LEGACY_DIR, legacyName);
    try {
      await access(source);
    } catch {
      console.warn(`  SKIP ${payment.id}: missing file ${legacyName}`);
      skip++;
      continue;
    }

    const mime = payment.proofMimeType || "image/jpeg";
    const ext = extFromMime(mime);
    const uploaderName = `${payment.user.firstName} ${payment.user.lastName}`.trim();
    const uploadedAt = payment.proofUploadedAt ?? payment.createdAt;
    const { internalFilePath } = buildPaths(
      payment.userId,
      uploaderName,
      ext,
      uploadedAt
    );
    const dest = path.join(STORAGE_ROOT, internalFilePath);

    if (dryRun) {
      console.log(`  DRY-RUN ${payment.id} -> ${internalFilePath}`);
      ok++;
      continue;
    }

    try {
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(source, dest);

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          internalFilePath,
          proofOriginalFileName: legacyName,
          proofUploadedAt: payment.proofUploadedAt ?? payment.createdAt,
          uploaderName,
          uploaderEmail: payment.user.email,
        },
      });

      console.log(`  OK ${payment.id} -> ${internalFilePath}`);
      ok++;
    } catch (e) {
      console.error(`  FAIL ${payment.id}:`, e.message);
      fail++;
    }
  }

  await prisma.$disconnect();
  console.log(`Done. migrated=${ok} skipped=${skip} failed=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
