import { NextResponse } from "next/server";

import type { RegisteredCountry, RegisteredTeam } from "@/lib/country-iso";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

/**
 * Countries from which teams are registered, with each team's name + the year
 * it registered. A "team" = a participant (role "user") who has registered a
 * unit or completed team registration.
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "user", country: { not: null } },
      select: {
        country: true,
        createdAt: true,
        teamRegisteredAt: true,
        unit: { select: { unitName: true } },
      },
    });

    const byCountry = new Map<string, RegisteredTeam[]>();
    for (const u of users) {
      const country = (u.country ?? "").trim();
      if (!country) continue;
      // A registered team has a unit or has completed team registration.
      if (!u.unit && !u.teamRegisteredAt) continue;
      const name = u.unit?.unitName?.trim() || "Registered team";
      const when = u.teamRegisteredAt ?? u.createdAt;
      const year = new Date(when).getFullYear();
      const list = byCountry.get(country) ?? [];
      list.push({ name, year });
      byCountry.set(country, list);
    }

    const countries: RegisteredCountry[] = [...byCountry.entries()]
      .map(([country, teams]) => ({
        country,
        teams: teams.sort(
          (a, b) => b.year - a.year || a.name.localeCompare(b.name)
        ),
      }))
      .sort((a, b) => a.country.localeCompare(b.country));

    return NextResponse.json({ countries });
  } catch {
    return NextResponse.json({ countries: [] });
  }
}
