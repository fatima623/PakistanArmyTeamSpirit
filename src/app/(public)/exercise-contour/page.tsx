import type { Metadata } from "next";

import { ExerciseContourDashboard } from "@/components/exercise-contour/ExerciseContourDashboard";

export const metadata: Metadata = {
  title: "Exercise Contour",
  description:
    "The complete operational overview of Exercise Contour — competition events, weapon and equipment requirements, rules, evaluation system, international orientation and conduct of events.",
};

export default function ExerciseContourPage() {
  return <ExerciseContourDashboard />;
}
