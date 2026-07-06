import type { Metadata } from "next";

import { ScrollReveal } from "@/components/army/ScrollReveal";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { PatsSectionHeading } from "@/components/pats/PatsSectionHeading";
import { getKeyDates } from "@/lib/site-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Key Dates",
};

export default async function KeyDatesPage() {
  const keyDates = await getKeyDates();

  return (
    <>
      <PatsPageHero
        eyebrow="Schedule"
        title="Key dates"
        subtitle="Important dates for the PATS Competition cycle. All times are Pakistan Standard Time (PKT) unless stated otherwise."
      />
      <PatsSection variant="navy">
        <ScrollReveal>
          <PatsSectionHeading
            eyebrow="Timeline"
            title="Competition schedule"
            description="Official timeline for registration, exercise, and administrative milestones."
          />
        </ScrollReveal>
        <ScrollReveal className="mt-8">
          <div className="pats-data-table">
            {keyDates.length === 0 ? (
              <p className="pats-body p-6">No key dates configured.</p>
            ) : (
              keyDates.map((kd) => (
                <div
                  key={kd.id}
                  className="pats-data-table__row pats-data-table__row--split"
                >
                  <div className="pats-data-table__label">{kd.label}</div>
                  <div className="pats-data-table__value">{kd.value}</div>
                </div>
              ))
            )}
          </div>
        </ScrollReveal>
      </PatsSection>
    </>
  );
}
