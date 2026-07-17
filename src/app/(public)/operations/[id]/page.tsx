import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MissionBrief } from "@/components/operations/MissionBrief";
import { PatsSection } from "@/components/pats/PatsSection";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { translatePatsText } from "@/lib/i18n/pats-content-i18n";
import { getDrillById, TACTICAL_DRILLS } from "@/lib/pats-content";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return TACTICAL_DRILLS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { t, locale } = await getDictionary();
  const drill = getDrillById(id);
  if (!drill) return { title: t.marketing.operations.brief.fallbackTitle };
  return {
    title: translatePatsText(drill.title, locale),
    description: translatePatsText(drill.purpose, locale),
  };
}

export default async function DrillDetailPage({ params }: Props) {
  const { id } = await params;
  const drill = getDrillById(id);
  if (!drill) notFound();

  const opIndex = TACTICAL_DRILLS.findIndex((d) => d.id === id);

  return (
    <PatsSection variant="deepest">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <MissionBrief drill={drill} opIndex={opIndex} />
      </div>
    </PatsSection>
  );
}
