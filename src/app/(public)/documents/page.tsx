import type { Metadata } from "next";
import Link from "next/link";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.marketing.documents.meta.title,
    description: t.marketing.documents.meta.description,
  };
}

type SectionKey = keyof Dictionary["marketing"]["documents"]["sections"];

/**
 * Booklet topics, in booklet order. The visible title comes from
 * `t.marketing.documents.sections[key]`; `page` is the printed booklet page.
 */
const BOOKLET_SECTIONS: readonly {
  page: number;
  key: SectionKey;
  href: string;
}[] = [
  { page: 3, key: "overview", href: "/#mission" },
  { page: 5, key: "history", href: "/international" },
  { page: 6, key: "concept", href: "/#mission" },
  { page: 7, key: "layout", href: "/operations" },
  { page: 8, key: "conduct", href: "/operations" },
  { page: 17, key: "teamComposition", href: "/awards" },
  { page: 18, key: "scoresAwards", href: "/awards" },
  { page: 19, key: "weaponEquipment", href: "/operations" },
  { page: 21, key: "coordinatingPoints", href: "/operations" },
];

export default async function DocumentsPage() {
  const { t } = await getDictionary();
  const docs = t.marketing.documents;

  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow={docs.hero.eyebrow}
        title={docs.hero.title}
        subtitle={docs.hero.subtitle}
        meta={[
          { label: docs.hero.metaSource, value: docs.hero.metaSourceValue },
          { label: docs.hero.metaAccess, value: docs.hero.metaAccessValue },
        ]}
      />

      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow={docs.library.eyebrow}
            title={docs.library.title}
            description={docs.library.description}
          />
        </ScrollReveal>

        <div className="mt-8 flex flex-wrap gap-4">
          {/* Filename is the actual asset in /public — not user-visible copy. */}
          <a
            href="/Cambrian Patrol 2025 Results.v2.pdf"
            className="pats-btn pats-btn--gold"
            download
          >
            {docs.downloadResults}
          </a>
          <Link href="/operations" className="pats-btn">
            {docs.interactiveOperations}
          </Link>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOOKLET_SECTIONS.map((doc) => (
            <li key={doc.page}>
              <Link
                href={doc.href}
                className="pats-panel block transition-colors hover:border-[var(--pats-gold)]/50"
              >
                <p className="pats-eyebrow !text-[10px]">
                  {docs.bookletPage(doc.page)}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-barlow)] text-base font-bold uppercase tracking-[0.06em] text-white">
                  {docs.sections[doc.key]}
                </h3>
                <p className="pats-body mt-3 text-sm">{docs.openBrief}</p>
              </Link>
            </li>
          ))}
        </ul>
      </PatsSection>
    </div>
  );
}
