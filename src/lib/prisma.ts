import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // The binary media columns (added for serverless-safe uploads) are large,
    // so omit them globally: ordinary list/detail queries never pull megabytes
    // of image/video bytes into memory. The /uploads serving route selects them
    // explicitly, and an explicit `select` overrides this `omit`.
    omit: {
      newsPost: { imageData: true },
      galleryImage: { imageData: true, posterData: true },
      event: { thumbnailData: true },
      heroSlide: { imageData: true },
      payment: { proofData: true },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
