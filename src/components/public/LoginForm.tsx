"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { resolveLoginErrorMessage } from "@/lib/auth-login-errors";
import { cn } from "@/lib/utils";

export function LoginForm() {
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
      ? "Enter a valid email address."
      : null;
  const passwordError =
    password.length > 0 && password.trim().length === 0
      ? "Password is required."
      : null;

  const clearError = () => {
    if (error) setError(null);
  };

  useEffect(() => {
    if (announcedRef.current) return;

    let message: string | null = null;
    if (isRegistered) {
      message =
        "Registration submitted. Check your inbox for the verification link before logging in.";
    } else if (isPasswordReset) {
      message = "Password updated. Please sign in with your new password.";
    } else if (isVerified) {
      message = "Email verified. You can sign in now.";
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
  }, [isPasswordReset, isRegistered, isVerified, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailError || passwordError || !email.trim() || !password) {
      setError(emailError ?? passwordError ?? "Email and password are required.");
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
        setError(
          resolveLoginErrorMessage(result.code ?? result.error)
        );
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
    <div className="pats-login-card cp-form-card w-full max-w-none p-7 sm:p-10">
      <header className="pats-login-card__header">
        <p className="pats-eyebrow pats-login-card__eyebrow">Participant access</p>
        <h2 className="pats-login-card__title">Sign in to continue</h2>
        <p className="pats-login-card__description">
          Enter the email and password approved for your team account.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="login-error"
            role="alert"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="cp-alert-error login-alert-error mb-6 px-4 py-3.5 text-base font-medium leading-relaxed"
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-center gap-y-5 sm:grid-cols-[minmax(10.5rem,12.5rem)_1fr] sm:gap-x-7"
        aria-busy={loading}
        noValidate={false}
      >
        <label htmlFor="login-email" className="pats-form-label">
          Email address
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
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
          className={cn(
            "h-12 text-base transition-shadow focus-visible:ring-2 focus-visible:ring-brand-brass/50",
            error && "border-red-400/70 focus-visible:ring-red-400/40"
          )}
        />
        <div className="sm:col-start-2">
          {emailError ? <p className="text-sm text-red-300">{emailError}</p> : null}
        </div>

        <label htmlFor="login-password" className="pats-form-label">
          Password
        </label>
        <Input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
          autoComplete="current-password"
          required
          disabled={loading}
          className={cn(
            "h-12 text-base transition-shadow focus-visible:ring-2 focus-visible:ring-brand-brass/50",
            error && "border-red-400/70 focus-visible:ring-red-400/40"
          )}
        />
        <div className="sm:col-start-2">
          {passwordError ? (
            <p className="text-sm text-red-300">{passwordError}</p>
          ) : (
            <p className="pats-login-card__hint text-sm">
              {remember
                ? "This device will stay signed in for up to 30 days."
                : "Without Remember Me, your session expires after 24 hours."}
            </p>
          )}
        </div>

        <div className="hidden sm:block" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            disabled={loading}
            onCheckedChange={(v) => setRemember(v === true)}
          />
          <label htmlFor="remember" className="pats-form-choice">
            Remember Me
          </label>
        </div>

        <div className="hidden sm:block" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            disabled={loading || Boolean(emailError || passwordError)}
            className="pats-btn pats-btn--gold inline-flex h-12 min-w-[10rem] items-center justify-center gap-2 px-9"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                <span>Signing in…</span>
              </>
            ) : (
              "Login"
            )}
          </Button>
          <Link
            href="/event/forgot-password"
            className="login-form-link text-sm hover:underline"
            tabIndex={loading ? -1 : 0}
          >
            Forgot Your Password?
          </Link>
        </div>
      </form>

      <p className="login-form-footer mt-8 border-t pt-5 text-sm">
        If you have not registered please{" "}
        <Link href="/event/register" className="login-form-link hover:underline">
          click here to register your unit
        </Link>
        .
      </p>
    </div>
  );
}
