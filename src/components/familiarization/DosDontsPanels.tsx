import { DONTS, DOS } from "@/lib/familiarization-content";
import type { Locale } from "@/lib/i18n/config";
import { translatePatsList } from "@/lib/i18n/pats-content-i18n";

type Props = {
  locale: Locale;
  dosTitle: string;
  dontsTitle: string;
};

/**
 * The do / don't split. Kept as two visually distinct columns rather than one
 * mixed list — several of the don'ts carry a points penalty or outright
 * disqualification, so the distinction has to survive a skim.
 */
export function DosDontsPanels({ locale, dosTitle, dontsTitle }: Props) {
  const dos = translatePatsList(DOS, locale);
  const donts = translatePatsList(DONTS, locale);

  return (
    <div className="fam-dos-donts">
      <section className="fam-dos-card fam-dos-card--do">
        <h3 className="fam-dos-card__title">{dosTitle}</h3>
        <ul className="fam-dos-card__list">
          {dos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="fam-dos-card fam-dos-card--dont">
        <h3 className="fam-dos-card__title">{dontsTitle}</h3>
        <ul className="fam-dos-card__list">
          {donts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
