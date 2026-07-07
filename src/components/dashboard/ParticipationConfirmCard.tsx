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
import "@/app/participation-confirm.css";

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
    <div className="pconfirm__unit">
      <div className="pconfirm__unit-value">
        {String(value).padStart(2, "0")}
      </div>
      <div className="pconfirm__unit-label">{label}</div>
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
    return new Date(deadlineIso).toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [deadlineIso]);

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
          toast.success("Registration confirmed — welcome aboard!");
          router.replace("/event/dashboard");
          router.refresh();
        } else {
          toast.info("Registration rejected. Signing you out…");
          startTransition(() => {
            void logoutAction();
          });
        }
      } catch {
        toast.error(TOAST.GENERIC_ERROR);
        setSubmitting(null);
      }
    },
    [router]
  );

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-2 py-8">
      <section
        className="pconfirm"
        role="alertdialog"
        aria-labelledby="participation-title"
        aria-describedby="participation-desc"
      >
        <div className="pconfirm__header">
          <span className="pconfirm__icon">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="pconfirm__eyebrow">Action required</div>
            <h1 id="participation-title" className="pconfirm__title">
              Confirm your participation
            </h1>
            <div className="pconfirm__meta">
              {firstName} {lastName}
              {unitName ? ` · ${unitName}` : ""}
            </div>
          </div>
        </div>

        <div className="pconfirm__body">
          <p id="participation-desc" className="pconfirm__desc">
            Before entering the Participant Dashboard, please confirm whether
            your team will be available to participate in the exercise.
            Confirming grants access to the next registration stages. Rejecting
            signs you out — you may log back in and confirm any time before the
            deadline below.
          </p>

          {previouslyDeclined && !expired ? (
            <div className="pconfirm__notice pconfirm__notice--warn">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <div>
                You previously rejected the registration. You can still confirm
                before the deadline expires.
              </div>
            </div>
          ) : null}

          <div className="pconfirm__deadline">
            <div className="pconfirm__deadline-head">
              <CalendarClock className="h-4 w-4" aria-hidden />
              Confirmation deadline
            </div>
            {deadlineIso ? (
              <>
                <div className="pconfirm__deadline-date">{deadlineLabel}</div>
                {expired ? (
                  <div className="pconfirm__notice pconfirm__notice--error mt-3">
                    <XCircle className="h-5 w-5" aria-hidden />
                    <div>
                      The confirmation deadline has passed. Confirmation is no
                      longer possible. Please contact the organizers for
                      assistance.
                    </div>
                  </div>
                ) : countdown ? (
                  <div
                    className="pconfirm__count"
                    aria-label="Time remaining to confirm"
                  >
                    <CountdownUnit value={countdown.days} label="Days" />
                    <CountdownUnit value={countdown.hours} label="Hours" />
                    <CountdownUnit value={countdown.minutes} label="Min" />
                    <CountdownUnit value={countdown.seconds} label="Sec" />
                    <div className="pconfirm__count-caption">remaining</div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="pconfirm__deadline-date">
                To be announced by the organizers.
              </div>
            )}
          </div>

          {confirmingReject && !expired ? (
            <div className="pconfirm__reject-panel">
              <div className="pconfirm__reject-msg">
                Reject registration and sign out? You can log back in and
                confirm later, as long as the deadline has not expired.
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="pconfirm-btn pconfirm-btn--danger-solid pconfirm-btn--sm"
                  disabled={submitting !== null}
                  onClick={() => submit("decline")}
                >
                  {submitting === "decline" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <XCircle className="h-4 w-4" aria-hidden />
                  )}
                  Yes, reject and sign out
                </button>
                <button
                  type="button"
                  className="pconfirm-btn pconfirm-btn--neutral pconfirm-btn--sm"
                  disabled={submitting !== null}
                  onClick={() => setConfirmingReject(false)}
                >
                  Go back
                </button>
              </div>
            </div>
          ) : (
            <div className="pconfirm__actions">
              <button
                type="button"
                className="pconfirm-btn pconfirm-btn--primary"
                disabled={submitting !== null || expired}
                onClick={() => submit("confirm")}
                title={
                  expired
                    ? "The confirmation deadline has passed"
                    : "Confirm your registration"
                }
              >
                {submitting === "confirm" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                )}
                Confirm 
              </button>
              <button
                type="button"
                className="pconfirm-btn pconfirm-btn--danger"
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
                {expired ? "Sign out" : "Reject "}
              </button>
            </div>
          )}

          <div className="pconfirm__foot">
            Your decision is recorded with a timestamp for the organizing
            staff. Need help? Contact support from the login page.
          </div>
        </div>
      </section>
    </div>
  );
}
