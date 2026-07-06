import type { Metadata } from "next";

import { RegisterForm } from "@/components/public/RegisterForm";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getSiteSettings } from "@/lib/site-data";
import { isPastDeadline } from "@/lib/deadlines";

export const metadata: Metadata = {
  title: "Register",
};

export default async function RegisterPage() {
  const settings = await getSiteSettings();
  const registrationClosed = isPastDeadline(settings.registrationDeadline);

  return (
    <>
      <PatsPageHero
        eyebrow="Registration"
        title="Register interest"
        subtitle="Submit patrol and liaison details for HQ review. Registration is not complete until patrol fees are confirmed."
      />
      <PatsSection variant="navy">
        {registrationClosed ? (
          <div className="portal-alert-warning mx-auto max-w-xl">
            <p className="mb-1 text-sm font-bold">Registration closed</p>
            <p className="portal-body text-sm">
              The registration deadline has passed. Please contact PATS
              administration if you believe this is in error.
            </p>
          </div>
        ) : (
          <RegisterForm
            initialIntlRegistrationOpen={settings.intlRegistrationOpen}
          />
        )}
      </PatsSection>
    </>
  );
}
