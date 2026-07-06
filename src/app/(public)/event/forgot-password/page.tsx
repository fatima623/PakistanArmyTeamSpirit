"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailError = useMemo(() => {
    if (!email) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? null
      : "Enter a valid email address.";
  }, [email]);

  useEffect(() => {
    fetch("/api/auth/csrf-token")
      .then((res) => res.json())
      .then((data: { csrfToken?: string }) => setCsrfToken(data.csrfToken ?? ""))
      .catch(() => setCsrfToken(""));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrfToken) {
      setError("Security check failed. Refresh and try again.");
      return;
    }
    if (emailError) {
      setError(emailError);
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrfToken }),
      });
      const data = (await res.json().catch(() => null)) as
        | { message?: string; error?: string; errors?: Record<string, string[]> }
        | null;

      if (res.ok) {
        const successMessage =
          data?.message ??
          "Reset link sent to your email address. Please check your inbox.";
        setMessage(successMessage);
        toast.success(successMessage);
      } else {
        const nextError =
          data?.errors?.email?.[0] ??
          data?.error ??
          "Something went wrong. Please try again.";
        setError(nextError);
        toast.error(nextError);
      }
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <>
      <PatsPageHero
        eyebrow="Account recovery"
        title="Reset password"
        subtitle="Enter your registered email and we will send a secure reset link."
      />
      <PatsSection variant="navy">
        <div className="pats-auth-shell">
          <div className="pats-auth-shell__intro">
            <p className="pats-eyebrow">Recovery access</p>
            <h2 className="pats-section-title">Password recovery</h2>
            <p className="pats-body mt-4">
              Request a secure reset link for an approved participant account.
              Use the same registered email address tied to your team login.
            </p>
            <ul className="pats-auth-shell__checklist">
              <li>Registered participant email required</li>
              <li>Secure reset link with limited validity</li>
              <li>Return to login after password update</li>
            </ul>
          </div>
          <div className="pats-login-card cp-form-card w-full max-w-none p-7 sm:p-10">
            <div className="pats-login-card__header">
              <p className="pats-eyebrow !mb-0">Reset request</p>
              <h3 className="pats-login-card__title">Send reset link</h3>
              <p className="pats-login-card__description">
                Enter your participant email and we will send a secure reset link
                if the account exists.
              </p>
            </div>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 items-center gap-y-5 sm:grid-cols-[minmax(10.5rem,12.5rem)_1fr] sm:gap-x-7"
              >
                <label htmlFor="reset-email" className="pats-form-label">
                  Email address
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubmitted(false);
                    setError(null);
                    setMessage(null);
                  }}
                  required
                  className="h-12 text-base"
                />
                <div className="sm:col-start-2">
                  {emailError ? (
                    <p className="text-sm text-red-300">{emailError}</p>
                  ) : null}
                </div>

                <div className="hidden sm:block" aria-hidden="true" />
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="submit"
                    disabled={loading || !csrfToken || Boolean(emailError)}
                    className="pats-btn pats-btn--gold inline-flex h-12 min-w-[10rem] items-center justify-center gap-2 px-9"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </div>
              </form>
            ) : error ? (
              <div className="cp-alert-error login-alert-error p-4 text-sm">
                {error}
              </div>
            ) : (
              <div className="cp-alert-success p-4 text-sm">
                {message}
              </div>
            )}

            <p className="login-form-footer mt-8 border-t border-white/10 pt-5 text-sm">
              <Link href="/event/login" className="login-form-link hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </PatsSection>
    </>
  );
}
