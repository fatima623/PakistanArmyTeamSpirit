import Link from "next/link";
import type { ReactNode } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from "@/components/public/social-icons";
import type { PublicNavSettings } from "@/lib/public-nav-settings";
import {
  ARMY_NAME,
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_DISCLAIMER,
  NAV_BRAND_TITLE,
  SUPPORT_EMAIL,
} from "@/lib/branding";
import { FOOTER_LINKS } from "@/lib/pats-public";
import { cn } from "@/lib/utils";

type Props = {
  social: PublicNavSettings;
};

const PORTAL_LINKS = [
  { href: "/operations", label: "Operations" },
  { href: "/international", label: "International" },
  { href: "/awards", label: "Awards" },
  { href: "/gallery", label: "Gallery" },
  { href: "/documents", label: "Documents" },
  { href: "/event/login", label: "Participant login" },
  { href: "/key-dates", label: "Key dates" },
  { href: "/privacy", label: "Privacy policy" },
] as const;

function FooterLabel({ children }: { children: ReactNode }) {
  return <p className="cinematic-footer-label">{children}</p>;
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="cinematic-footer-link">
      {children}
    </Link>
  );
}

function FooterSocial({ social }: { social: PublicNavSettings }) {
  const items = [
    { href: social.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { href: social.twitterUrl, label: "Twitter / X", Icon: TwitterIcon },
    { href: social.instagramUrl, label: "Instagram", Icon: InstagramIcon },
  ] as const;

  return (
    <div className="flex items-center gap-2.5" aria-label="Social media">
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="cinematic-footer-social"
          aria-label={label}
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" />
        </a>
      ))}
    </div>
  );
}

export function CinematicFooter({ social }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="cinematic-footer relative overflow-hidden border-t border-white/10 bg-tactical-void"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-tactical-brass/55 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-tactical-navy/30 via-tactical-void to-black/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-tactical-grid bg-grid-48 opacity-[0.07]"
        aria-hidden
      />
      <div
        className="cinematic-noise pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="cinematic-heading font-display text-2xl font-extrabold uppercase tracking-[0.12em] text-white">
              {NAV_BRAND_TITLE}
            </p>
            <p className="cinematic-body mt-1 font-condensed text-sm font-semibold uppercase tracking-[0.14em] text-white">
              {ARMY_NAME}
            </p>
            <p className="cinematic-body mt-3 max-w-xs text-sm leading-relaxed text-white">
              {FOOTER_BRAND_DESCRIPTION}
            </p>
            <div
              className="mt-4 h-px w-12 bg-gradient-to-r from-tactical-brass to-transparent"
              aria-hidden
            />
          </div>

          <div>
            <FooterLabel>Authority</FooterLabel>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((org) => (
                <li key={org.label}>
                  <p className="font-condensed text-sm font-bold uppercase tracking-wide text-white">
                    {org.label}
                  </p>
                  <p className="cinematic-body mt-0.5 text-sm text-white">
                    {org.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterLabel>Portal</FooterLabel>
            <ul className="flex flex-col gap-2.5">
              {PORTAL_LINKS.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterLabel>Contact</FooterLabel>
            <ul className="cinematic-body space-y-2.5 font-condensed text-sm text-white">
              <li>
                <span className="block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Military
                </span>
                <a href="tel:943512438" className="cinematic-footer-link mt-0.5 text-base">
                  94351 2438
                </a>
              </li>
              <li>
                <span className="block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Civilian
                </span>
                <a
                  href="tel:01874613438"
                  className="cinematic-footer-link mt-0.5 text-base"
                >
                  01874 613 438
                </a>
              </li>
              <li>
                <span className="block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Email
                </span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="cinematic-footer-link mt-0.5 break-all text-base"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "mt-8 flex flex-col gap-5 border-t border-white/10 pt-6",
            "lg:flex-row lg:items-center lg:justify-between"
          )}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="cinematic-body font-condensed text-sm text-white">
              © {year} {NAV_BRAND_TITLE} · {ARMY_NAME}. All rights reserved.
            </p>
            <p className="cinematic-body max-w-2xl text-xs leading-relaxed text-white">
              {FOOTER_DISCLAIMER}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 lg:shrink-0">
            <div className="flex items-center gap-3">
              <span className="cinematic-footer-label mb-0 hidden sm:inline">
                Follow
              </span>
              <FooterSocial social={social} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
