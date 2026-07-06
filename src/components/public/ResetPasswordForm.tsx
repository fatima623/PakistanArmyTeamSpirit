"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PatsSection } from "@/components/pats/PatsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PASSWORD_POLICY_SUMMARY, validateNewPassword } from "@/lib/password-policy";

type Props = {
  token: string;
};

function getPasswordChecks(password: string) {
  return [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter", passed: /[a-z]/.test(password) },
    { label: "Number", passed: /[0-9]/.test(password) },
    { label: "Special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

function getStrengthLabel(score: number) {
  if (score <= 2) return "Weak";
  if (score <= 4) return "Good";
  return "Strong";
}

export function ResetPasswordForm({ token }: Props) {
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

  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword]);
  const strengthScore = checks.filter((item) => item.passed).length;
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
      setPageError("Reset token is missing.");
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
        setPageError(
          data?.error ?? "This password reset link is invalid or has expired."
        );
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("invalid");
        setPageError("Unable to validate this reset link right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!newPassword) {
      setFieldError(null);
      return;
    }
    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      setFieldError(passwordError);
      return;
    }
    if (confirmPassword && !passwordsMatch) {
      setFieldError("Passwords do not match.");
      return;
    }
    setFieldError(null);
  }, [confirmPassword, newPassword, passwordsMatch]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);

    if (!csrfToken) {
      setPageError("Security check failed. Refresh and try again.");
      return;
    }

    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      setFieldError(passwordError);
      return;
    }

    if (!passwordsMatch) {
      setFieldError("Passwords do not match.");
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
        toast.success("Password updated. Please log in.");
        router.replace("/event/login?passwordReset=true");
        return;
      }

      if (res.status === 410) {
        setStatus("invalid");
      }
      setPageError(data?.error ?? "Something went wrong. Please try again.");
      toast.error(data?.error ?? "Unable to reset password.");
    } catch {
      setPageError("Something went wrong. Please try again.");
      toast.error("Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PatsSection variant="navy">
      <div className="pats-auth-shell">
        <div className="pats-auth-shell__intro">
          <p className="pats-eyebrow">Recovery access</p>
          <h2 className="pats-section-title">Set a new password</h2>
          <p className="pats-body mt-4">
            Use a strong password that meets the portal security policy.
          </p>
          <ul className="pats-auth-shell__checklist">
            <li>Reset links expire after 30 minutes</li>
            <li>Passwords are hashed with bcrypt before storage</li>
            <li>Reset links become invalid immediately after use</li>
          </ul>
        </div>

        <div className="pats-login-card cp-form-card w-full max-w-none p-7 sm:p-10">
          <div className="pats-login-card__header">
            <p className="pats-eyebrow !mb-0">Password reset</p>
            <h3 className="pats-login-card__title">Create a new password</h3>
            <p className="pats-login-card__description">{PASSWORD_POLICY_SUMMARY}</p>
          </div>

          {status === "checking" ? (
            <div className="flex min-h-40 items-center justify-center text-sm text-white/80">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating reset link...
            </div>
          ) : status === "invalid" ? (
            <div className="space-y-5">
              <div className="cp-alert-error login-alert-error p-4 text-sm">
                {pageError ?? "This password reset link is invalid or has expired."}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="pats-btn pats-btn--gold">
                  <Link href="/event/forgot-password">Request a new link</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/event/login">Back to login</Link>
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
                  New password
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
                  Confirm password
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
                  <span>Password strength</span>
                  <span>{getStrengthLabel(strengthScore)}</span>
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
                    <li className="text-red-300">Passwords must match</li>
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
                      Updating...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
                <Link href="/event/login" className="login-form-link text-sm hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PatsSection>
  );
}
