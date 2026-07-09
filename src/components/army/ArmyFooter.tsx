import Link from "next/link";

import { PatsLogo } from "@/components/pats/PatsLogo";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from "@/components/public/social-icons";
import type { PublicNavSettings } from "@/lib/public-nav-settings";
import {
  COMPETITION_NAME,
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_DISCLAIMER,
  SITE_NAME,
} from "@/lib/branding";
import { PATS_CROP } from "@/lib/media";




export function ArmyFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="paf-footer paf-footer--photo28">
      <div
        className="paf-footer__photo"
        style={{ backgroundImage: `url(${PATS_CROP.photo28Footer})` }}
        aria-hidden
      />
      <div className="paf-footer__shade" aria-hidden />

      <div className="pats-footer-inner">
        <div className="pats-footer-bar">
          <div className="pats-footer-bar__left">
            <span className="pats-footer-bar__icon" aria-hidden>
              🔗
            </span>
            <a href="https://ispr.gov.pk" target="_blank" rel="noopener noreferrer" className="pats-footer-bar__email">
              ISPR Website
            </a>
            <span className="pats-footer-bar__tagline">
              {COMPETITION_NAME} · {SITE_NAME}
            </span>
          </div>
          <div className="pats-footer-bar__actions">
            <Link href="/event/register" prefetch className="pats-footer-bar__btn">
              Register now
            </Link>
            <a href="https://ispr.gov.pk" target="_blank" rel="noopener noreferrer" className="pats-footer-bar__btn">
              Contact us
            </a>
          </div>
        </div>

        <hr className="pats-footer-divider" />

        <div className="pats-footer-brand">
          <PatsLogo
            size={64}
            variant="nav"
            className="pats-footer-brand__seal paf-footer__logo"
            priority
          />
          <p className="pats-footer-brand__title">{SITE_NAME}</p>
          <p className="pats-footer-brand__copyright">
            {COMPETITION_NAME} © {year}
          </p>
        </div>

        <p className="pats-footer-legal">{FOOTER_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
