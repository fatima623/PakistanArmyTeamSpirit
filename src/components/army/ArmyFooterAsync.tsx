import { ArmyFooter } from "@/components/army/ArmyFooter";
import { CinematicFooter } from "@/components/cinematic/CinematicFooter";
import { DEFAULT_SOCIAL, getPublicSocialLinks } from "@/lib/site-data";

export async function ArmyFooterAsync({ dayTheme = false }: { dayTheme?: boolean }) {
  const social = await getPublicSocialLinks().catch(() => DEFAULT_SOCIAL);
  if (dayTheme) {
    return <CinematicFooter social={social} />;
  }
  return <ArmyFooter />;
}
