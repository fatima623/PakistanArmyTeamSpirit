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
  SUPPORT_EMAIL,
} from "@/lib/branding";
import { PATS_CROP } from "@/lib/media";
import { FOOTER_LINKS } from "@/lib/pats-public";

const FOOTER_COLUMNS = [
  {
    heading: "About",
    links: [
      { href: "/", label: "Home" },
      { href: "/operations", label: "Operations" },
      { href: "/awards", label: "Awards" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
  {
    heading: "Operations",
    links: [
      { href: "/operations", label: "Mission pillars" },
      { href: "/documents", label: "Documents" },
      { href: "/key-dates", label: "Key dates" },
    ],
  },
  {
    heading: "Training",
    links: [
      { href: "/event/register", label: "Register team" },
      { href: "/event/login", label: "Participant login" },
      { href: "/gallery", label: "Field gallery" },
    ],
  },
  {
    heading: "International",
    links: [
      { href: "/international", label: "Participation" },
      ...FOOTER_LINKS.map((l) => ({
        href: "/international",
        label: l.label,
      })),
    ],
  },
  {
    heading: "Media",
    links: [
      { href: "/gallery", label: "Gallery" },
      { href: "/#updates", label: "News" },
      { href: "/documents", label: "Official documents" },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { key: "facebook", Icon: FacebookIcon },
  { key: "twitter", Icon: TwitterIcon },
  { key: "instagram", Icon: InstagramIcon },
] as const;

type Props = {
  social: PublicNavSettings;
};

export function ArmyFooter({ social }: Props) {
  const year = new Date().getFullYear();

  const socialHrefs = {
    facebook: social.facebookUrl,
    twitter: social.twitterUrl,
    instagram: social.instagramUrl,
  } as const;

  return (
    <footer className="paf-footer paf-footer--photo28">
      <div
        className="paf-footer__photo"
        style={{ backgroundImage: `url(${PATS_CROP.photo28Footer})` }}
        aria-hidden
      />
      <div className="paf-footer__shade" aria-hidden />

      <div className="pats-footer-inner">
        <nav className="pats-footer-columns" aria-label="Footer navigation">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading} className="pats-footer-col">
              <span className="pats-footer-col__title">{col.heading}</span>
              <ul className="pats-footer-col__list">
                {col.links.map((link) => (
                  <li key={`${col.heading}-${link.label}`}>
                    <Link href={link.href} prefetch className="pats-footer-col__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <hr className="pats-footer-divider" />

        <div className="pats-footer-bar">
          <div className="pats-footer-bar__left">
            <span className="pats-footer-bar__icon" aria-hidden>
              ✉
            </span>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="pats-footer-bar__email">
              {SUPPORT_EMAIL}
            </a>
            <span className="pats-footer-bar__tagline">
              {COMPETITION_NAME} · {SITE_NAME}
            </span>
          </div>
          <div className="pats-footer-bar__actions">
            <Link href="/event/register" prefetch className="pats-footer-bar__btn">
              Register now
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="pats-footer-bar__btn">
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
          <p className="pats-footer-brand__description">{FOOTER_BRAND_DESCRIPTION}</p>
        </div>

        <hr className="pats-footer-divider" />

        <div className="pats-footer-social" aria-label="Social media">
          {SOCIAL_LINKS.map(({ key, Icon }) => (
            <a
              key={key}
              href={socialHrefs[key]}
              target="_blank"
              rel="noopener noreferrer"
              className="pats-footer-social__btn"
              aria-label={key}
            >
              <Icon className="pats-footer-social__icon" />
            </a>
          ))}
        </div>

        <p className="pats-footer-legal">{FOOTER_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
