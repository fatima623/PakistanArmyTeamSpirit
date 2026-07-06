import type { Metadata } from "next";
import Link from "next/link";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";

export const metadata: Metadata = {
  title: "Documents",
};

const BOOKLET_SECTIONS = [
  { page: 3, title: "Overview — PATS", href: "/#mission" },
  { page: 5, title: "History — International teams", href: "/international" },
  { page: 6, title: "Concept of PATS", href: "/#mission" },
  { page: 7, title: "Layout of events", href: "/operations" },
  { page: 8, title: "Conduct of events (part 1)", href: "/operations" },
  { page: 17, title: "Team composition", href: "/awards" },
  { page: 18, title: "Scores & awards", href: "/awards" },
  { page: 19, title: "Weapon & equipment", href: "/operations" },
  { page: 21, title: "Coordinating points", href: "/operations" },
] as const;

export default function DocumentsPage() {
  return (
    <div className="space-y-0">
      <PatsPageHero
        eyebrow="Reference library"
        title="Document center"
        subtitle="Official PATS competition reference — browse interactive briefs aligned to the information booklet."
        meta={[
          { label: "Source", value: "Official booklet" },
          { label: "Access", value: "Digital briefs" },
        ]}
      />

      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Reference"
            title="Competition library"
            description="Each topic links to the matching section on this site. Full booklet scans are not shown — use the structured briefs below."
          />
        </ScrollReveal>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/Cambrian Patrol 2025 Results.v2.pdf"
            className="pats-btn pats-btn--gold"
            download
          >
            Download results PDF
          </a>
          <Link href="/operations" className="pats-btn">
            Interactive operations →
          </Link>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOOKLET_SECTIONS.map((doc) => (
            <li key={doc.page}>
              <Link
                href={doc.href}
                className="pats-panel block transition-colors hover:border-[var(--pats-gold)]/50"
              >
                <p className="pats-eyebrow !text-[10px]">Booklet p.{doc.page}</p>
                <h3 className="mt-2 font-[family-name:var(--font-barlow)] text-base font-bold uppercase tracking-[0.06em] text-white">
                  {doc.title}
                </h3>
                <p className="pats-body mt-3 text-sm">Open brief →</p>
              </Link>
            </li>
          ))}
        </ul>
      </PatsSection>
    </div>
  );
}
