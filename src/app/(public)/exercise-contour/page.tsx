import type { Metadata } from "next";

import { ExerciseContourDashboard } from "@/components/exercise-contour/ExerciseContourDashboard";
import { localeDir } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.meta.exerciseContour,
    description:
      "The complete operational overview of Exercise Contour — competition events, weapon and equipment requirements, rules, evaluation system, international orientation and conduct of events.",
  };
}

export default async function ExerciseContourPage() {
  const locale = await getLocale();
  return (
    <div lang={locale} dir={localeDir(locale)}>
      <ExerciseContourDashboard />
    </div>
  );
}
