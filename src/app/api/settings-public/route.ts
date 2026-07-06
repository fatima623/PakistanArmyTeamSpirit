import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-data";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    registrationOpen: settings.registrationOpen,
    intlRegistrationOpen: settings.intlRegistrationOpen,
    exerciseYear: settings.exerciseYear,
    exerciseDates: settings.exerciseDates,
  });
}