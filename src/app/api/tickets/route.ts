import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { AUDIT_ENTITY, TICKET_STATUS } from "@/lib/constants";
import {
  handleApiError,
  requireAuth,
  requireJsonContentType,
} from "@/lib/api-helpers";
import { TicketCreateSchema } from "@/lib/validations";
import {
  buildAdminTicketUrl,
  notifyTicket,
} from "@/lib/tickets";

export async function GET() {
  try {
    const session = await requireAuth();
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { lastReplyAt: "desc" },
      select: {
        id: true,
        subject: true,
        category: true,
        status: true,
        priority: true,
        lastReplyAt: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = TicketCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const authorName = `${user.firstName} ${user.lastName}`.trim();

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: parsed.data.subject,
        category: parsed.data.category,
        priority: parsed.data.priority,
        status: TICKET_STATUS.OPEN,
        lastReplyAt: new Date(),
        messages: {
          create: {
            authorId: session.user.id,
            authorRole: "user",
            authorName,
            body: parsed.data.message,
          },
        },
      },
      select: { id: true, subject: true },
    });

    await createAuditLog({
      entityType: AUDIT_ENTITY.TICKET,
      entityId: ticket.id,
      action: "ticket_created",
      actorId: session.user.id,
      metadata: { subject: ticket.subject, category: parsed.data.category },
    });

    const staffInbox =
      process.env.SUPPORT_NOTIFY_EMAIL ?? process.env.SMTP_USER;
    if (staffInbox) {
      await notifyTicket({
        to: staffInbox,
        subject: `New support ticket: ${ticket.subject}`,
        text: [
          `A new support ticket was raised by ${authorName} (${user.email}).`,
          "",
          parsed.data.message,
          "",
          `Review: ${buildAdminTicketUrl(ticket.id)}`,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
