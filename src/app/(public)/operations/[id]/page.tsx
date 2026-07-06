import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MissionBrief } from "@/components/operations/MissionBrief";
import { PatsSection } from "@/components/pats/PatsSection";
import { getDrillById, TACTICAL_DRILLS } from "@/lib/pats-content";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return TACTICAL_DRILLS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const drill = getDrillById(id);
  if (!drill) return { title: "Operation" };
  return {
    title: drill.title,
    description: drill.purpose,
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
