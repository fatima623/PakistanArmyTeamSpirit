"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { resolveLoginErrorMessage } from "@/lib/auth-login-errors";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * `dialog` drops the card's own frame — the dialog panel around it already
   * provides one — and tightens the vertical rhythm.
   */
  variant?: "page" | "dialog";
  /** Rendered under the submit row (the "back to landing" affordance). */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * The sign-in surface: heading, the two fields, Remember Me, submit.
 *
 * Deliberately self-contained — no site chrome, no marketing column, nothing
 * that reserves space it does not use — so the same card fits both the bare
 * `/event/login` route and the dialog the landing page opens over itself.
 *
 * Its styling lives in the `.pats-signin` block in globals.css rather than in
 * the `.army-site`-scoped auth-shell rules, because the dialog renders through
 * a portal at the document root, outside that shell. On the `/event/login`
 * route — which IS inside that shell — the page wrapper carries
 * `.pats-auth-shell`, whose only job there is to claim the exemption from the
 * site-wide square-off rule so these fields keep their softened radius.
 */
export function SignInCard({ variant = "page", footer, className }: Props) {
  const { t, locale, dir } = useI18n();
  const L = t.publicSite.login;
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const isRegistered = searchParams.get("registered") === "true";
  const isPasswordReset = searchParams.get("passwordReset") === "true";
  const isVerified = searchParams.get("verified") === "true";
  const nextPath = searchParams.get("next");
  const announcedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError =
    email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? L.validation.invalidEmail
      : null;
  const passwordError =
    password.length > 0 && password.trim().length === 0
      ? L.validation.passwordRequired
      : null;

  const clearError = () => {
    if (error) setError(null);
  };

  // Post-registration / reset / verification notices arrive as query flags.
  // They are announced once, then stripped so a refresh cannot repeat them.
  useEffect(() => {
    if (announcedRef.current) return;

    let message: string | null = null;
    if (isRegistered) {
      message = L.toasts.registered;
    } else if (isPasswordReset) {
      message = L.toasts.passwordReset;
    } else if (isVerified) {
      message = L.toasts.verified;
    }

    if (!message) return;

    toast.success(message);
    announcedRef.current = true;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("registered");
    params.delete("passwordReset");
    params.delete("verified");
    const query = params.toString();
    router.replace(query ? `/event/login?${query}` : "/event/login", {
      scroll: false,
    });
  }, [isPasswordReset, isRegistered, isVerified, router, searchParams, L]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailError || passwordError || !email.trim() || !password) {
      setError(
        emailError ?? passwordError ?? L.validation.emailPasswordRequired
      );
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        rememberMe: remember,
        callbackUrl: nextPath ?? "/event/dashboard",
        redirect: false,
      });

      // NextAuth returns HTTP 200 even when credentials fail; check `error` first.
      if (result?.error) {
        setError(resolveLoginErrorMessage(result.code ?? result.error));
        return;
      }

      if (result?.ok) {
        router.replace(nextPath ?? "/event/dashboard");
        return;
      }

      setError(resolveLoginErrorMessage(result?.code ?? result?.error));
    } catch {
      setError(resolveLoginErrorMessage(null));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      lang={locale}
      dir={dir}
      className={cn(
        "pats-signin",
        variant === "dialog" && "pats-signin--dialog",
        className
      )}
    >
      <header className="pats-signin__header">
        <h1 className="pats-signin__title">{L.card.title}</h1>
      </header>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="signin-error"
            role="alert"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pats-signin__alert"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <form
        className="pats-signin__form"
        onSubmit={handleSubmit}
        aria-busy={loading}
      >
        <div className="pats-signin__field">
          <label className="pats-signin__label" htmlFor="signin-email">
            {L.card.emailLabel}
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            className="pats-signin__input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            disabled={loading}
            aria-invalid={Boolean(emailError) || undefined}
          />
          {emailError ? (
            <p className="pats-signin__hint pats-signin__hint--error">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="pats-signin__field">
          <div className="pats-signin__label-row">
            <label className="pats-signin__label" htmlFor="signin-password">
              {L.card.passwordLabel}
            </label>
            <Link
              href="/event/forgot-password"
              className="pats-signin__forgot"
              tabIndex={loading ? -1 : 0}
            >
              {L.card.forgot}
            </Link>
          </div>
          <input
            id="signin-password"
            name="password"
            type="password"
            className="pats-signin__input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            autoComplete="current-password"
            required
            disabled={loading}
            aria-invalid={Boolean(passwordError) || undefined}
          />
          {passwordError ? (
            <p className="pats-signin__hint pats-signin__hint--error">
              {passwordError}
            </p>
          ) : null}
        </div>

        <label className="pats-signin__remember">
          <input
            type="checkbox"
            className="pats-signin__checkbox"
            checked={remember}
            disabled={loading}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="pats-signin__remember-text">
            <span className="pats-signin__remember-label">
              {L.card.rememberMe}
            </span>
            <span className="pats-signin__hint">
              {remember ? L.card.rememberHintOn : L.card.rememberHintOff}
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="pats-signin__submit"
          disabled={loading || Boolean(emailError || passwordError)}
        >
          {loading ? (
            <>
              <Loader2 className="pats-signin__spinner" aria-hidden />
              <span>{L.card.signingIn}</span>
            </>
          ) : (
            L.card.login
          )}
        </button>
      </form>

      {footer ? <div className="pats-signin__footer">{footer}</div> : null}
    </div>
  );
}
