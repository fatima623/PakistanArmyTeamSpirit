import Link from "next/link";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { Button } from "@/components/ui/button";
import { hashOpaqueToken } from "@/lib/auth-token";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

type VerificationState = {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
  success: boolean;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const { t, locale, dir } = await getDictionary();
  const V = t.publicSite.verifyEmail;

  const state: VerificationState = {
    title: V.invalidTitle,
    body: V.invalidBody,
    actionHref: "/event/register",
    actionLabel: V.registerAgain,
    success: false,
  };

  if (token) {
    const verification = await prisma.emailVerification.findUnique({
      where: { tokenHash: hashOpaqueToken(token) },
      include: {
        user: {
          select: { id: true, firstName: true, emailVerifiedAt: true },
        },
      },
    });

    if (
      verification &&
      !verification.usedAt &&
      verification.expiresAt >= new Date()
    ) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: verification.userId },
          data: { emailVerifiedAt: new Date() },
        }),
        prisma.emailVerification.deleteMany({
          where: { userId: verification.userId },
        }),
      ]);

      state.title = V.successTitle;
      state.body = V.successBody(verification.user.firstName ?? "");
      state.actionHref = "/event/login?verified=true";
      state.actionLabel = V.goToLogin;
      state.success = true;
    }
  }

  return (
    <div lang={locale} dir={dir}>
      <PatsPageHero
        eyebrow={V.hero.eyebrow}
        title={V.hero.title}
        subtitle={V.hero.subtitle}
      />
      <PatsSection variant="navy">
        <div className="mx-auto flex w-full max-w-3xl justify-center">
          <div className="pats-login-card cp-form-card w-full max-w-2xl p-7 sm:p-10">
            <div className="pats-login-card__header">
              <p className="pats-eyebrow !mb-0">
                {state.success ? V.eyebrowComplete : V.eyebrowRequired}
              </p>
              <h2 className="pats-login-card__title">{state.title}</h2>
              <p className="pats-login-card__description">{state.body}</p>
            </div>

            <div className={state.success ? "cp-alert-success p-4 text-sm" : "cp-alert-error login-alert-error p-4 text-sm"}>
              {state.success ? V.successAlert : V.invalidAlert}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 border-t border-white/10 pt-6">
              <Button asChild className="pats-btn pats-btn--gold">
                <Link href={state.actionHref}>{state.actionLabel}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/event/login">{V.back}</Link>
              </Button>
            </div>
          </div>
        </div>
      </PatsSection>
    </div>
  );
}
