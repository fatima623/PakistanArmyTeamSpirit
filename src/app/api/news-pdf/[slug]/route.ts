import { NextResponse } from "next/server";

import {
  inlinePdfResponse,
  isPdfBuffer,
} from "@/lib/inline-pdf-response";
import { prisma } from "@/lib/prisma";
import { readNewsPdf } from "@/lib/storage/news-pdf";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const post = await prisma.newsPost.findFirst({
      where: { slug, published: true },
    });

    if (!post?.pdfPath) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readNewsPdf(post.pdfPath, post.id);

    if (!isPdfBuffer(buffer)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return inlinePdfResponse(buffer, {
      cacheControl: "public, max-age=3600",
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
