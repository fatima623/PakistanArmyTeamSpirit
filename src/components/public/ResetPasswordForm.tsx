"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PatsSection } from "@/components/pats/PatsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateNewPassword } from "@/lib/password-policy";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const { t } = useI18n();
  const R = t.publicSite.resetPassword;
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">(
    "checking"
  );
  const [pageError, setPageError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const checks = useMemo(
    () => [
      { label: R.checks.length, passed: newPassword.length >= 8 },
      { label: R.checks.uppercase, passed: /[A-Z]/.test(newPassword) },
      { label: R.checks.lowercase, passed: /[a-z]/.test(newPassword) },
      { label: R.checks.number, passed: /[0-9]/.test(newPassword) },
      { label: R.checks.special, passed: /[^A-Za-z0-9]/.test(newPassword) },
    ],
    [newPassword, R.checks]
  );
  const strengthScore = checks.filter((item) => item.passed).length;
  const strengthLabel =
    strengthScore <= 2
      ? R.strength.weak
      : strengthScore <= 4
        ? R.strength.good
        : R.strength.strong;
  const passwordsMatch =
    confirmPassword.length === 0 || newPassword === confirmPassword;

  useEffect(() => {
    fetch("/api/auth/csrf-token")
      .then((res) => res.json())
      .then((data: { csrfToken?: string }) => setCsrfToken(data.csrfToken ?? ""))
      .catch(() => setCsrfToken(""));
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setPageError(R.tokenMissing);
      return;
    }

    let cancelled = false;

    fetch(`/api/password-reset/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | { valid?: boolean; error?: string }
          | null;
        if (cancelled) return;
        if (res.ok && data?.valid) {
          setStatus("ready");
          setPageError(null);
          return;
        }
        setStatus("invalid");
        setPageError(data?.error ?? R.invalidFallback);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("invalid");
        setPageError(R.validateFailed);
      });

    return () => {
      cancelled = true;
    };
  }, [token, R.tokenMissing, R.invalidFallback, R.validateFailed]);

  useEffect(() => {
    if (!newPassword) {
      setFieldError(null);
      return;
    }
    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      setFieldError(R.policyError);
      return;
    }
    if (confirmPassword && !passwordsMatch) {
      setFieldError(R.passwordsDoNotMatch);
      return;
    }
    setFieldError(null);
  }, [
    confirmPassword,
    newPassword,
    passwordsMatch,
    R.policyError,
    R.passwordsDoNotMatch,
  ]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);

    if (!csrfToken) {
      setPageError(R.csrf);
      return;
    }

    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      setFieldError(R.policyError);
      return;
    }

    if (!passwordsMatch) {
      setFieldError(R.passwordsDoNotMatch);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, csrfToken }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (res.ok) {
        toast.success(R.toastUpdated);
        router.replace("/event/login?passwordReset=true");
        return;
      }

      if (res.status === 410) {
        setStatus("invalid");
      }
      setPageError(data?.error ?? R.generic);
      toast.error(data?.error ?? R.unableReset);
    } catch {
      setPageError(R.generic);
      toast.error(R.unableReset);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PatsSection variant="navy">
      <div className="pats-auth-shell">
        <div className="pats-auth-shell__intro">
          <p className="pats-eyebrow">{R.intro.eyebrow}</p>
          <h2 className="pats-section-title">{R.intro.title}</h2>
          <p className="pats-body mt-4">{R.intro.body}</p>
          <ul className="pats-auth-shell__checklist">
            {R.intro.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="pats-login-card cp-form-card w-full max-w-none p-7 sm:p-10">
          <div className="pats-login-card__header">
            <p className="pats-eyebrow !mb-0">{R.card.eyebrow}</p>
            <h3 className="pats-login-card__title">{R.card.title}</h3>
            <p className="pats-login-card__description">{R.card.policy}</p>
          </div>

          {status === "checking" ? (
            <div className="flex min-h-40 items-center justify-center text-sm text-white/80">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {R.validating}
            </div>
          ) : status === "invalid" ? (
            <div className="space-y-5">
              <div className="cp-alert-error login-alert-error p-4 text-sm">
                {pageError ?? R.invalidFallback}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="pats-btn pats-btn--gold">
                  <Link href="/event/forgot-password">{R.requestNewLink}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/event/login">{R.back}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {pageError ? (
                <div className="cp-alert-error login-alert-error p-4 text-sm">
                  {pageError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-[minmax(10.5rem,12.5rem)_1fr] sm:gap-x-7">
                <label htmlFor="new-password" className="pats-form-label">
                  {R.newPasswordLabel}
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="h-12 text-base"
                />

                <label htmlFor="confirm-password" className="pats-form-label">
                  {R.confirmPasswordLabel}
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{R.strengthLabel}</span>
                  <span>{strengthLabel}</span>
                </div>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-[var(--pats-accent)] transition-all"
                    style={{ width: `${(strengthScore / 5) * 100}%` }}
                  />
                </div>
                <ul className="space-y-2 text-sm text-white/80">
                  {checks.map((item) => (
                    <li key={item.label} className={item.passed ? "text-emerald-300" : ""}>
                      {item.label}
                    </li>
                  ))}
                  {!passwordsMatch && confirmPassword ? (
                    <li className="text-red-300">{R.passwordsMustMatch}</li>
                  ) : null}
                </ul>
              </div>

              {fieldError ? (
                <p className="text-sm text-red-300">{fieldError}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  disabled={submitting || !csrfToken}
                  className="pats-btn pats-btn--gold inline-flex h-12 min-w-[10rem] items-center justify-center gap-2 px-9"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {R.updating}
                    </>
                  ) : (
                    R.update
                  )}
                </Button>
                <Link href="/event/login" className="login-form-link text-sm hover:underline">
                  {R.back}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PatsSection>
  );
}
