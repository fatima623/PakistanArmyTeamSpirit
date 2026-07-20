"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { PatsSection } from "@/components/pats/PatsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ForgotPasswordPage() {
  const { t, locale, dir } = useI18n();
  const F = t.publicSite.forgotPassword;
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
      : F.validation.invalidEmail;
  }, [email, F.validation.invalidEmail]);

  useEffect(() => {
    fetch("/api/auth/csrf-token")
      .then((res) => res.json())
      .then((data: { csrfToken?: string }) => setCsrfToken(data.csrfToken ?? ""))
      .catch(() => setCsrfToken(""));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csrfToken) {
      setError(F.validation.csrf);
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
        const successMessage = F.card.success;
        setMessage(successMessage);
        toast.success(successMessage);
      } else {
        const nextError =
          data?.errors?.email?.[0] ?? data?.error ?? F.validation.generic;
        setError(nextError);
        toast.error(nextError);
      }
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div lang={locale} dir={dir}>
      <PatsPageHero
        eyebrow={F.hero.eyebrow}
        title={F.hero.title}
        subtitle={F.hero.subtitle}
      />
      <PatsSection variant="navy">
        <div className="pats-auth-shell">
          <div className="pats-auth-shell__intro">
            <p className="pats-eyebrow">{F.intro.eyebrow}</p>
            <h2 className="pats-section-title">{F.intro.title}</h2>
            <p className="pats-body mt-4">{F.intro.body}</p>
            <ul className="pats-auth-shell__checklist">
              {F.intro.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="pats-login-card cp-form-card w-full max-w-none p-7 sm:p-10">
            <div className="pats-login-card__header">
              <p className="pats-eyebrow !mb-0">{F.card.eyebrow}</p>
              <h3 className="pats-login-card__title">{F.card.title}</h3>
              <p className="pats-login-card__description">{F.card.description}</p>
            </div>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 items-center gap-y-5 sm:grid-cols-[minmax(10.5rem,12.5rem)_1fr] sm:gap-x-7"
              >
                <label htmlFor="reset-email" className="pats-form-label">
                  {F.card.emailLabel}
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
                        {F.card.sending}
                      </span>
                    ) : (
                      F.card.send
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
                {F.card.back}
              </Link>
            </p>
          </div>
        </div>
      </PatsSection>
    </div>
  );
}
