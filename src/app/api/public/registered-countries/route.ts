import { NextResponse } from "next/server";

import type { RegisteredCountry, RegisteredTeam } from "@/lib/country-iso";
import {
  HISTORICAL_PARTICIPANTS,
  PREDEFINED_PARTICIPANTS,
  mergeRegisteredCountries,
} from "@/lib/international-participants";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

/**
 * Countries participating in the competition, with each team's name + year.
 *
 * The response is the union of three sources, de-duplicated by country:
 *   1. PREDEFINED_PARTICIPANTS — the confirmed current-edition PATS nations,
 *      always present.
 *   2. HISTORICAL_PARTICIPANTS — every previous International PATS edition
 *      (1st Intl 2016 → 8th Intl 2025), so the map carries the full year-wise
 *      record and each country's tooltip lists the years it took part.
 *   3. Live data — participants (role "user") who registered a unit or
 *      completed team registration. Any country added via the admin panel /
 *      database appears here automatically, no code change needed.
 *
 * If the database is unavailable the predefined set is still returned, so the
 * map never renders empty.
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

    const dynamicCountries: RegisteredCountry[] = [...byCountry.entries()].map(
      ([country, teams]) => ({ country, teams })
    );

    // Predefined first so its clean display names win on a key collision.
    const countries = mergeRegisteredCountries(
      PREDEFINED_PARTICIPANTS,
      HISTORICAL_PARTICIPANTS,
      dynamicCountries
    );

    return NextResponse.json({ countries });
  } catch {
    // DB unavailable — still return the full edition history.
    return NextResponse.json({
      countries: mergeRegisteredCountries(
        PREDEFINED_PARTICIPANTS,
        HISTORICAL_PARTICIPANTS
      ),
    });
  }
}
