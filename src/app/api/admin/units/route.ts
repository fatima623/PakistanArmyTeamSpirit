import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireAdmin, userSelect } from "@/lib/api-helpers";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    const units = await prisma.unit.findMany({
      include: {
        user: { select: userSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      const headers = [
        "unitId",
        "unitName",
        "unitType",
        "branch",
        "service",
        "userEmail",
        "userFirstName",
        "userLastName",
        "userRank",
        "userCountry",
        "userNationality",
        "approved",
        "patrolsRequested",
        "preferredPhase",
      ];

      const rows = units.map((u) => [
        u.id,
        u.unitName,
        u.unitType,
        u.branch,
        u.service,
        u.user.email,
        u.user.firstName,
        u.user.lastName,
        u.user.rank,
        u.user.country ?? "",
        u.user.nationality ?? "",
        u.user.approved,
        u.patrolsRequested,
        u.preferredPhase ?? "",
      ]);

      return new NextResponse(toCsv(headers, rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="units.csv"',
        },
      });
    }

    return NextResponse.json({ units });
  } catch (error) {
    return handleApiError(error);
  }
}
