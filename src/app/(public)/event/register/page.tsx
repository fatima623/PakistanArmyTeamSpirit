import type { Metadata } from "next";

import { RegisterForm } from "@/components/public/RegisterForm";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getSiteSettings } from "@/lib/site-data";
import { isPastDeadline } from "@/lib/deadlines";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.register };
}

export default async function RegisterPage() {
  const settings = await getSiteSettings();
  const registrationClosed = isPastDeadline(settings.registrationDeadline);
  const { t, locale, dir } = await getDictionary();

  return (
    <div lang={locale} dir={dir}>
      <PatsPageHero
        eyebrow={t.register.hero.eyebrow}
        title={t.register.hero.title}
        subtitle={t.register.hero.subtitle}
      />
      <PatsSection variant="navy">
        {registrationClosed ? (
          <div className="portal-alert-warning mx-auto max-w-xl">
            <p className="mb-1 text-sm font-bold">{t.register.closed.title}</p>
            <p className="portal-body text-sm">{t.register.closed.body}</p>
          </div>
        ) : (
          <RegisterForm
            initialIntlRegistrationOpen={settings.intlRegistrationOpen}
          />
        )}
      </PatsSection>
    </div>
  );
}
