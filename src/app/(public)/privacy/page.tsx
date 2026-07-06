import type { Metadata } from "next";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { HQ_ORG, SITE_NAME, SUPPORT_EMAIL } from "@/lib/branding";
import { getSiteSettings } from "@/lib/site-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PatsPageHero eyebrow="Legal" title="Privacy policy" />
      <PatsSection variant="navy">
        <div className="pats-prose-panel space-y-4">
          <p className="pats-body">
            {SITE_NAME} is committed to protecting your personal information. This
            policy explains how we collect, use, and safeguard data submitted through
            this registration portal.
          </p>
          <p className="pats-body">
            By registering on this website you consent to the processing of your
            data for the purposes of administering participation in {SITE_NAME},
            including communication with your unit and coordination with {HQ_ORG}.
          </p>
          <p className="pats-body">
            For full policy details or to exercise your data rights, contact{" "}
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
                  View external privacy policy
                </a>
              </p>
            )}
        </div>
      </PatsSection>
    </>
  );
}
