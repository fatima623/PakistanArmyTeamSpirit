import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { publicNavLabel } from "@/lib/i18n/public-nav-labels";
import { requireTourAccess } from "@/lib/require-tour";
import { TOUR_SECTIONS } from "@/lib/tour-navigation";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.tour };
}

/**
 * Index of the tour — the former public marketing site, now reachable only from
 * inside the portal. Sections keep their original URLs; this page (and the tour
 * navbar) are the way in.
 */
export default async function TourPage() {
  await requireTourAccess();
  const { t } = await getDictionary();
  const p = t.publicSite.pages.tour;

  return (
    <>
      <PatsPageHero
        eyebrow={p.heroEyebrow}
        title={p.heroTitle}
        subtitle={p.heroSubtitle}
      />
      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={p.sectionEyebrow}
            title={p.sectionTitle}
            description={p.sectionDescription}
          />
        </ScrollReveal>
        <ScrollReveal className="mt-8">
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {TOUR_SECTIONS.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  prefetch={false}
                  className="pats-tour-card group flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 no-underline transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <span className="pats-body pats-body--bright font-semibold">
                    {publicNavLabel(t, section.href, section.label)}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 flex-none opacity-60 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </PatsSection>
    </>
  );
}
