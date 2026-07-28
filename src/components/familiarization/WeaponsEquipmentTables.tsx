import {
  WEAPONS_EQUIPMENT,
  type EquipmentRow,
} from "@/lib/familiarization-content";
import type { Locale } from "@/lib/i18n/config";
import { translatePatsText } from "@/lib/i18n/pats-content-i18n";

type Props = {
  locale: Locale;
  /** Column headers: item name, per-individual scale, per-team scale. */
  itemHeading: string;
  indlHeading: string;
  teamHeading: string;
  /** Caption per group, keyed by `EquipmentGroup.id`. */
  groupLabels: Record<string, string>;
  /** Accessible replacement for the "—" shown where a row is not scaled. */
  notApplicable: string;
};

/**
 * Weapons & equipment scale, transcribed from the booklet's two-table spread.
 *
 * Each group is one `<table>` rendered twice side by side on wide screens (the
 * booklet splits its rows into two columns to fit the page) and stacked below
 * `md`. Real table markup rather than a grid so the column headers stay
 * associated with their cells for screen readers.
 */
export function WeaponsEquipmentTables({
  locale,
  itemHeading,
  indlHeading,
  teamHeading,
  groupLabels,
  notApplicable,
}: Props) {
  function renderTable(rows: readonly EquipmentRow[], caption: string) {
    return (
      <div className="fam-table-wrap">
        <table className="fam-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{itemHeading}</th>
              <th scope="col" className="fam-table__num">
                {indlHeading}
              </th>
              <th scope="col" className="fam-table__num">
                {teamHeading}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.item}>
                <th scope="row">{translatePatsText(row.item, locale)}</th>
                <td className="fam-table__num">
                  <Scale value={row.indl} locale={locale} empty={notApplicable} />
                </td>
                <td className="fam-table__num">
                  <Scale value={row.team} locale={locale} empty={notApplicable} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="fam-equipment">
      {WEAPONS_EQUIPMENT.map((group) => {
        const caption = groupLabels[group.id] ?? group.id;
        // Split down the middle so the two tables end up the same height and
        // their edges line up; the larger half goes first.
        const half = Math.ceil(group.rows.length / 2);
        return (
          <section key={group.id} className="fam-equipment__group">
            <h3 className="fam-subheading">{caption}</h3>
            <div className="fam-equipment__split">
              {renderTable(group.rows.slice(0, half), caption)}
              {renderTable(group.rows.slice(half), caption)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** A scale cell: the translated quantity, or a dash with an accessible label. */
function Scale({
  value,
  locale,
  empty,
}: {
  value: string | null;
  locale: Locale;
  empty: string;
}) {
  if (value === null) {
    return (
      <>
        <span aria-hidden>—</span>
        <span className="sr-only">{empty}</span>
      </>
    );
  }
  return <>{translatePatsText(value, locale)}</>;
}
