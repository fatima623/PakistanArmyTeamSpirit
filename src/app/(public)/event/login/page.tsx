import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/public/LoginForm";
import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";

export const metadata: Metadata = {
  title: "Log in",
};

export default function EventLoginPage() {
  return (
    <>
      <PatsPageHero
        eyebrow="Participant portal"
        title="Log in"
        subtitle="Access your patrol dashboard and registration status."
      />
      <PatsSection variant="navy">
        <div className="pats-auth-shell">
          <div className="pats-auth-shell__intro">
            <p className="pats-eyebrow">Secure access</p>
            <h2 className="pats-section-title">Participant login</h2>
            <p className="pats-body mt-4">
              Use your approved patrol credentials to access the participant
              dashboard, monitor fee status, and review key coordination steps
              before movement.
            </p>
            <ul className="pats-auth-shell__checklist">
              <li>Approved patrol accounts only</li>
              <li>Payment and registration status tracking</li>
              <li>Direct access to participant actions and updates</li>
            </ul>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </PatsSection>
    </>
  );
}
