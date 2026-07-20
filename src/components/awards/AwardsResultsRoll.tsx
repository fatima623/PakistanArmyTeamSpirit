"use client";

import { useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateAwardUnit } from "@/lib/i18n/award-unit-i18n";
import { AWARD_MEDALS, type AwardMedal } from "@/lib/awards-data";

export type AwardsRollRow = {
  id: string;
  callSign: string;
  unit: string;
  medal: string;
};

type Props = {
  rows: AwardsRollRow[];
  year: number;
};

/** Maps a medal onto the tier-colour modifier defined in globals.css. */
const MEDAL_TIER_CLASS: Record<AwardMedal, string> = {
  GOLD: "gold",
  SILVER: "silver",
  BRONZE: "bronze",
  COIN: "coin",
  DNF: "dnf",
};

function isKnownMedal(medal: string): medal is AwardMedal {
  return (AWARD_MEDALS as readonly string[]).includes(medal);
}

export function AwardsResultsRoll({ rows, year }: Props) {
  const { t, locale } = useI18n();
  const p = t.publicSite.pages.awards;
  const [activeMedal, setActiveMedal] = useState<AwardMedal | "ALL">("ALL");

  // Localized medal label. Gold/silver/bronze reuse the existing meta labels so
  // the roll and the tier cards never drift apart in wording.
  const medalLabel: Record<AwardMedal, string> = {
    GOLD: p.metaGold,
    SILVER: p.metaSilver,
    BRONZE: p.metaBronze,
    COIN: p.rollMedalCoin,
    DNF: p.rollMedalDnf,
  };

  const counts = useMemo(() => {
    const tally = { GOLD: 0, SILVER: 0, BRONZE: 0, COIN: 0, DNF: 0 };
    for (const row of rows) {
      if (isKnownMedal(row.medal)) tally[row.medal] += 1;
    }
    return tally;
  }, [rows]);

  const visibleRows = useMemo(
    () =>
      activeMedal === "ALL"
        ? rows
        : rows.filter((row) => row.medal === activeMedal),
    [rows, activeMedal]
  );

  if (rows.length === 0) return null;

  return (
    <div className="pats-awards-roll">
      <div className="pats-awards-standings__header">
        <div>
          <h3 className="pats-awards-standings__title">{p.rollTitle}</h3>
          <p className="pats-awards-standings__subtitle">{p.rollSubtitle}</p>
        </div>
        <span className="pats-awards-standings__badge">{year}</span>
      </div>

      <div
        className="pats-awards-roll__filters"
        role="group"
        aria-label={p.rollFilterAria}
      >
        <button
          type="button"
          className="pats-awards-roll__chip"
          aria-pressed={activeMedal === "ALL"}
          onClick={() => setActiveMedal("ALL")}
        >
          {p.rollFilterAll}
          <span className="pats-awards-roll__chip-count">{rows.length}</span>
        </button>
        {AWARD_MEDALS.map((medal) => (
          <button
            key={medal}
            type="button"
            className={`pats-awards-roll__chip pats-awards-standings__tier-row--${MEDAL_TIER_CLASS[medal]}`}
            aria-pressed={activeMedal === medal}
            onClick={() => setActiveMedal(medal)}
          >
            {medalLabel[medal]}
            <span className="pats-awards-roll__chip-count">
              {counts[medal]}
            </span>
          </button>
        ))}
      </div>

      <div className="pats-awards-standings__scroll">
        <table className="pats-awards-standings__table">
          <caption className="sr-only">{p.rollSubtitle}</caption>
          <thead>
            <tr>
              <th scope="col">{p.rollColCallSign}</th>
              <th scope="col">{p.rollColUnit}</th>
              <th scope="col">{p.rollColAward}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const tier = isKnownMedal(row.medal)
                ? MEDAL_TIER_CLASS[row.medal]
                : "certificate";
              const label = isKnownMedal(row.medal)
                ? medalLabel[row.medal]
                : row.medal;
              return (
                <tr
                  key={row.id}
                  className={`pats-awards-standings__tier-row pats-awards-standings__tier-row--${tier}`}
                >
                  <th scope="row" data-label={p.rollColCallSign}>
                    <span className="pats-awards-roll__callsign">
                      {row.callSign}
                    </span>
                  </th>
                  <td data-label={p.rollColUnit}>
                    {translateAwardUnit(row.unit, locale)}
                  </td>
                  <td data-label={p.rollColAward}>
                    <span className="pats-awards-roll__medal">
                      <span
                        className="pats-awards-standings__dot"
                        aria-hidden
                      />
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visibleRows.length === 0 && (
        <p className="pats-awards-roll__empty">{p.rollEmpty}</p>
      )}
    </div>
  );
}
