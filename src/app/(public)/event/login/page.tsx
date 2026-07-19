import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/public/LoginForm";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.login };
}

export default async function EventLoginPage() {
  const { t, locale, dir } = await getDictionary();
  const L = t.publicSite.login;

  return (
    <div lang={locale} dir={dir}>
      <PatsPageHero
        eyebrow={L.hero.eyebrow}
        title={L.hero.title}
        subtitle={L.hero.subtitle}
      />
      <PatsSection variant="navy">
        <div className="pats-auth-shell">
          <div className="pats-auth-shell__intro">
            <p className="pats-eyebrow">{L.intro.eyebrow}</p>
            <h2 className="pats-section-title">{L.intro.title}</h2>
            <p className="pats-body mt-4">{L.intro.body}</p>
            <ul className="pats-auth-shell__checklist">
              {L.intro.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </PatsSection>
    </div>
  );
}
