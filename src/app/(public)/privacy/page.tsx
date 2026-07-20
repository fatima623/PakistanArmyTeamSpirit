import type { Metadata } from "next";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { HQ_ORG, SITE_NAME, SUPPORT_EMAIL } from "@/lib/branding";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSiteSettings } from "@/lib/site-data";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.privacy };
}

export default async function PrivacyPage() {
  const [settings, { t }] = await Promise.all([
    getSiteSettings(),
    getDictionary(),
  ]);
  const p = t.publicSite.pages.privacy;

  return (
    <>
      <PatsPageHero eyebrow={p.heroEyebrow} title={p.heroTitle} />
      <PatsSection variant="navy">
        <div className="pats-prose-panel space-y-4">
          <p className="pats-body">{p.body1(SITE_NAME)}</p>
          <p className="pats-body">{p.body2(SITE_NAME, HQ_ORG)}</p>
          <p className="pats-body">
            {p.body3Prefix}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
          {settings?.privacyPolicyUrl &&
            settings.privacyPolicyUrl !== "/privacy" && (
              <p className="pats-body">
                <a
                  href={settings.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.externalLink}
                </a>
              </p>
            )}
        </div>
      </PatsSection>
    </>
  );
}
