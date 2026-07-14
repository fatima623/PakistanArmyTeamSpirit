"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { logoutAction } from "@/lib/actions/auth";
import { TOAST } from "@/lib/toast";
import { useI18n } from "@/lib/i18n/I18nProvider";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function computeCountdown(deadlineMs: number, nowMs: number): CountdownParts {
  const diff = deadlineMs - nowMs;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    expired: false,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[3.25rem] rounded-[10px] border border-slate-200 bg-white px-2.5 py-1.5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="text-[1.125rem] font-bold leading-[1.2] tabular-nums !text-slate-900">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] !text-slate-400">{label}</div>
    </div>
  );
}

/**
 * First-login availability dialog. The participant must confirm their
 * registration before the admin-configured deadline to access the portal;
 * rejecting signs them out to the login screen (they may return and confirm
 * any time before the deadline).
 */
export function ParticipationConfirmCard({
  firstName,
  lastName,
  unitName,
  deadlineIso,
  initialExpired,
  previouslyDeclined,
}: {
  firstName: string;
  lastName: string;
  unitName: string | null;
  deadlineIso: string | null;
  initialExpired: boolean;
  previouslyDeclined: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const c = t.confirm;
  const [submitting, setSubmitting] = useState<"confirm" | "decline" | null>(
    null
  );
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [, startTransition] = useTransition();

  const deadlineMs = useMemo(
    () => (deadlineIso ? new Date(deadlineIso).getTime() : null),
    [deadlineIso]
  );
  const [countdown, setCountdown] = useState<CountdownParts | null>(() =>
    deadlineMs ? computeCountdown(deadlineMs, Date.now()) : null
  );

  useEffect(() => {
    if (!deadlineMs) return;
    const tick = () => setCountdown(computeCountdown(deadlineMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadlineMs]);

  const expired = initialExpired || (countdown?.expired ?? false);

  const deadlineLabel = useMemo(() => {
    if (!deadlineIso) return null;
    return new Date(deadlineIso).toLocaleString(c.dateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [deadlineIso, c.dateLocale]);

  const submit = useCallback(
    async (action: "confirm" | "decline") => {
      setSubmitting(action);
      try {
        const res = await fetch("/api/user/participation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error(data.error ?? TOAST.GENERIC_ERROR);
          setSubmitting(null);
          return;
        }
        if (action === "confirm") {
          toast.success(c.toastConfirmed);
          router.replace("/event/dashboard");
          router.refresh();
        } else {
          toast.info(c.toastRejected);
          startTransition(() => {
            void logoutAction();
          });
        }
      } catch {
        toast.error(TOAST.GENERIC_ERROR);
        setSubmitting(null);
      }
    },
    [router, c.toastConfirmed, c.toastRejected]
  );

  return (
    <div className="mx-auto flex w-full max-w-xl items-center justify-center px-2 py-4">
      <section
        className="relative w-full overflow-hidden !rounded-2xl !border !border-slate-200 !bg-white !shadow-[0_1px_3px_rgba(15,23,42,0.08),0_12px_32px_rgba(15,23,42,0.14)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-green-900 before:via-green-700 before:to-yellow-600 before:content-['']"
        role="alertdialog"
        aria-labelledby="participation-title"
        aria-describedby="participation-desc"
      >
        <div className="flex items-center gap-3.5 border-b border-slate-100 bg-slate-50/60 px-6 py-3.5">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 !text-green-700 [&_svg]:!text-green-700">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] !text-slate-400">{c.actionRequired}</div>
            <h1 id="participation-title" className="mt-0.5 text-lg font-bold leading-[1.25] tracking-[-0.01em] !text-slate-900">
              {c.title}
            </h1>
            <div className="mt-1 text-sm font-medium !text-slate-500">
              {firstName} {lastName}
              {unitName ? ` · ${unitName}` : ""}
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-6 pb-5 pt-4 [&_p]:!text-slate-600">
          <p id="participation-desc" className="text-[0.85rem] leading-[1.5] !text-slate-600">
            {c.description}
          </p>

          {previouslyDeclined && !expired ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-[1.55] !text-amber-800 [&_div]:!text-amber-800 [&_svg]:mt-0.5 [&_svg]:flex-shrink-0 [&_svg]:!text-amber-600">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <div>{c.previouslyDeclined}</div>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-[1.125rem] pb-3 pt-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] !text-slate-500 [&_svg]:!text-green-700">
              <CalendarClock className="h-4 w-4" aria-hidden />
              {c.confirmationDeadline}
            </div>
            {deadlineIso ? (
              <>
                <div className="mt-2 text-[0.95rem] font-semibold !text-slate-800">{deadlineLabel}</div>
                {expired ? (
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold leading-[1.55] !text-red-700 [&_div]:!text-red-700 [&_svg]:mt-0.5 [&_svg]:flex-shrink-0 [&_svg]:!text-red-600">
                    <XCircle className="h-5 w-5" aria-hidden />
                    <div>{c.deadlineExpired}</div>
                  </div>
                ) : countdown ? (
                  <div
                    className="mt-2.5 flex flex-wrap items-center gap-2"
                    aria-label={c.timeRemainingAria}
                  >
                    <CountdownUnit value={countdown.days} label={c.days} />
                    <CountdownUnit value={countdown.hours} label={c.hours} />
                    <CountdownUnit value={countdown.minutes} label={c.min} />
                    <CountdownUnit value={countdown.seconds} label={c.sec} />
                    <div className="text-xs font-medium !text-slate-400">{c.remaining}</div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-2 text-[0.95rem] font-semibold !text-slate-800">
                {c.toBeAnnounced}
              </div>
            )}
          </div>

          {confirmingReject && !expired ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-[1.125rem] py-4">
              <div className="mb-3 text-sm font-medium leading-[1.55] !text-red-800">
                {c.rejectPrompt}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 !rounded-[10px] px-5 py-3 text-sm font-semibold tracking-[0.01em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-55 flex-none px-3.5 py-2 text-[0.8125rem] !border !border-red-800 !bg-red-600 !text-white hover:!bg-red-700"
                  disabled={submitting !== null}
                  onClick={() => submit("decline")}
                >
                  {submitting === "decline" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <XCircle className="h-4 w-4" aria-hidden />
                  )}
                  {c.yesReject}
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 !rounded-[10px] px-5 py-3 text-sm font-semibold tracking-[0.01em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-55 flex-none px-3.5 py-2 text-[0.8125rem] !border !border-slate-300 !bg-white !text-slate-600 hover:!bg-slate-50"
                  disabled={submitting !== null}
                  onClick={() => setConfirmingReject(false)}
                >
                  {c.goBack}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 !rounded-[10px] px-5 py-3 text-sm font-semibold tracking-[0.01em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-55 !border !border-green-900 !bg-gradient-to-b !from-green-700 !to-green-800 !text-white shadow-[0_1px_2px_rgba(22,101,52,0.35)] hover:!from-green-800 hover:!to-green-900"
                disabled={submitting !== null || expired}
                onClick={() => submit("confirm")}
                title={expired ? c.deadlinePassedAttr : c.confirmTitleAttr}
              >
                {submitting === "confirm" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                )}
                {c.confirm}
              </button>
              <button
                type="button"
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 !rounded-[10px] px-5 py-3 text-sm font-semibold tracking-[0.01em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-55 !border !border-red-300 !bg-white !text-red-700 hover:!border-red-400 hover:!bg-red-50"
                disabled={submitting !== null}
                onClick={() =>
                  expired
                    ? startTransition(() => {
                        void logoutAction();
                      })
                    : setConfirmingReject(true)
                }
              >
                <XCircle className="h-4 w-4" aria-hidden />
                {expired ? c.signOut : c.reject}
              </button>
            </div>
          )}

          <div className="mt-0.5 border-t border-slate-100 pt-3 text-xs leading-[1.5] !text-slate-400">
            {c.footer}
          </div>
        </div>
      </section>
    </div>
  );
}
