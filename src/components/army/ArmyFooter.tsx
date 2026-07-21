import { COMPETITION_NAME, SITE_NAME } from "@/lib/branding";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Site footer. Intentionally carries no logo/crest artwork — neither the seal
 * nor the large background crest — so the brand text and legal line stay clean
 * and legible. The shade layer alone provides the footer's background tint.
 */
export async function ArmyFooter() {
  const year = new Date().getFullYear();
  const { t } = await getDictionary();
  const f = t.publicSite.footer;

  return (
    <footer className="paf-footer">
      <div className="paf-footer__shade" aria-hidden />

      <div className="pats-footer-inner">
        <div className="pats-footer-bar">
          <div className="pats-footer-bar__left">
            <span className="pats-footer-bar__icon" aria-hidden>
              🔗
            </span>
            <a href="https://ispr.gov.pk" target="_blank" rel="noopener noreferrer" className="pats-footer-bar__email">
              {f.isprWebsite}
            </a>
            <span className="pats-footer-bar__tagline">
              {COMPETITION_NAME} · {SITE_NAME}
            </span>
          </div>
        </div>

        <hr className="pats-footer-divider" />

        <div className="pats-footer-brand">
          <p className="pats-footer-brand__title">{SITE_NAME}</p>
          <p className="pats-footer-brand__copyright">
            {COMPETITION_NAME} © {year}
          </p>
        </div>

        <p className="pats-footer-legal">{f.disclaimer}</p>
      </div>
    </footer>
  );
}
