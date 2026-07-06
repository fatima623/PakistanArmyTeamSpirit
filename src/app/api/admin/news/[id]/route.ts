import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateNewsPaths } from "@/lib/revalidate-public";
import { NewsPostSchema } from "@/lib/validations";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { deleteNewsPdfFile } from "@/lib/storage/news-pdf";
import {
  ApiError,
  handleApiError,
  requireAdmin,
  requireJsonContentType,
} from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const post = await prisma.newsPost.findUnique({ where: { id } });
    if (!post) {
      throw new ApiError("News post not found", 404);
    }

    return NextResponse.json({ post });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    requireJsonContentType(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = NewsPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("News post not found", 404);
    }

    const { title, slug, content, publishedAt, published } = parsed.data;

    if (slug !== existing.slug) {
      const slugTaken = await prisma.newsPost.findUnique({ where: { slug } });
      if (slugTaken) {
        throw new ApiError("Slug already in use", 409);
      }
    }

    const post = await prisma.newsPost.update({
      where: { id },
      data: {
        title,
        slug,
        content: sanitizeNewsContent(content),
        publishedAt: new Date(publishedAt),
        ...(published !== undefined ? { published } : {}),
      },
    });

    revalidateNewsPaths();

    return NextResponse.json({ post });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("News post not found", 404);
    }

    await deleteNewsPdfFile(existing.pdfPath, id);
    await prisma.newsPost.delete({ where: { id } });

    revalidateNewsPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
