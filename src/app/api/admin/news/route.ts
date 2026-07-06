import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateNewsPaths } from "@/lib/revalidate-public";
import { NewsPostSchema } from "@/lib/validations";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireAdmin();

    const posts = await prisma.newsPost.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = NewsPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, slug, content, publishedAt, published } = parsed.data;

    const existing = await prisma.newsPost.findUnique({ where: { slug } });
    if (existing) {
      throw new ApiError("Slug already in use", 409);
    }

    const post = await prisma.newsPost.create({
      data: {
        title,
        slug,
        content: sanitizeNewsContent(content),
        publishedAt: new Date(publishedAt),
        published: published ?? true,
      },
    });

    revalidateNewsPaths();

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
