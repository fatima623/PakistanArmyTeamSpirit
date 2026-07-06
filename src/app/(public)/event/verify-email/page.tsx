import Link from "next/link";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { Button } from "@/components/ui/button";
import { hashOpaqueToken } from "@/lib/auth-token";
import { prisma } from "@/lib/prisma";

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

  const state: VerificationState = {
    title: "Verification link invalid",
    body: "This email verification link is invalid or has expired. Request a fresh registration or contact support if the issue persists.",
    actionHref: "/event/register",
    actionLabel: "Register again",
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

      state.title = "Email verified";
      state.body = `Your account is now active${verification.user.firstName ? `, ${verification.user.firstName}` : ""}. You can continue to login and complete the rest of your workflow.`;
      state.actionHref = "/event/login?verified=true";
      state.actionLabel = "Go to login";
      state.success = true;
    }
  }

  return (
    <>
      <PatsPageHero
        eyebrow="Account security"
        title="Verify email"
        subtitle="Confirm your email to activate portal access."
      />
      <PatsSection variant="navy">
        <div className="mx-auto flex w-full max-w-3xl justify-center">
          <div className="pats-login-card cp-form-card w-full max-w-2xl p-7 sm:p-10">
            <div className="pats-login-card__header">
              <p className="pats-eyebrow !mb-0">
                {state.success ? "Verification complete" : "Verification required"}
              </p>
              <h2 className="pats-login-card__title">{state.title}</h2>
              <p className="pats-login-card__description">{state.body}</p>
            </div>

            <div className={state.success ? "cp-alert-success p-4 text-sm" : "cp-alert-error login-alert-error p-4 text-sm"}>
              {state.success
                ? "Email verification succeeded."
                : "The verification token is not valid anymore."}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 border-t border-white/10 pt-6">
              <Button asChild className="pats-btn pats-btn--gold">
                <Link href={state.actionHref}>{state.actionLabel}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/event/login">Back to login</Link>
              </Button>
            </div>
          </div>
        </div>
      </PatsSection>
    </>
  );
}
