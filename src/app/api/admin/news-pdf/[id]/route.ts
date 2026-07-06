import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("[PDF ROUTE HIT] id:", id);

  try {
    const post = await prisma.newsPost.findUnique({
      where: { id },
      select: { pdfPath: true, title: true },
    });

    if (!post || !post.pdfPath) {
      console.log("[PDF ROUTE] no post or pdfPath for id:", id);
      return new NextResponse("No PDF associated with this post", {
        status: 404,
      });
    }

    const safeName = path.basename(post.pdfPath);
    const filePath = path.join(
      process.cwd(),
      "storage",
      "news-pdfs",
      safeName
    );

    console.log("[PDF ROUTE] filePath:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("[PDF ROUTE] file missing on disk:", filePath);
      return new NextResponse("PDF file not found on disk", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    if (!fileBuffer || fileBuffer.length < 100) {
      console.log("[PDF ROUTE] file empty or too small, bytes:", fileBuffer?.length);
      return new NextResponse("PDF file is empty or corrupt", { status: 500 });
    }

    console.log(
      "[PDF ROUTE] serving OK, bytes:",
      fileBuffer.length,
      "Content-Type: application/pdf"
    );

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[PDF SERVE ERROR]", err);
    return new NextResponse("Server error while serving PDF", { status: 500 });
  }
}
