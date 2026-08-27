"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Send,
  Undo2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/i18n/api-error-i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateUnitOption } from "@/lib/i18n/unit-option-i18n";
import { displayCountry, isInternationalParticipant } from "@/lib/participant-country";
import { formatDateDisplay } from "@/lib/utils";
import type { WorkflowStageKey } from "@/lib/participant-workflow";

export type ApprovalParticipant = {
  firstName: string;
  lastName: string;
  rank: string;
  email: string;
  country: string | null;
  nationality: string | null;
  createdAt: string;
};

export type ApprovalUnit = {
  unitType: string;
  branch: string;
  unitName: string;
  arm: string;
  secondPocEmail: string | null;
  thirdPocEmail: string | null;
  additionalInfo: string | null;
  coName: string;
  coEmail: string;
  coPhone: string;
};

export type ApprovalMember = {
  id: string;
  fullName: string;
  rank: string;
  serviceNumber: string;
  serviceArm: string;
  gender: string;
};

export type ApprovalFlight = {
  id: string;
  travellerName: string;
  passengerName: string;
  passportNumber: string;
  hasPassport: boolean;
  hasTicket: boolean;
  hasReturnTicket: boolean;
};

const DASH = "—";

/** Section shell: heading on the left, an "Edit" link back to its step. */
function ReviewSection({
  title,
  step,
  editLabel,
  editAria,
  children,
}: {
  title: string;
  step: WorkflowStageKey;
  editLabel: string;
  editAria: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pp-card">
      <div className="pp-card__head">
        <div className="min-w-0">
          <h2 className="pp-card__title">{title}</h2>
        </div>
        <Link
          href={`/event/journey?step=${step}`}
          className="pp-btn pp-btn--ghost no-underline"
          aria-label={editAria}
        >
          <Pencil className="h-4 w-4" aria-hidden />
          {editLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}

function Field({ term, value }: { term: string; value: string | null }) {
  return (
    <div>
      <dt className="pp-dl__term">{term}</dt>
      <dd className="pp-dl__desc">{value?.trim() ? value : DASH}</dd>
    </div>
  );
}

/** Passport / ticket presence, as a pill per document. */
function DocPill({
  label,
  present,
  onFile,
  missing,
}: {
  label: string;
  present: boolean;
  onFile: string;
  missing: string;
}) {
  return (
    <span
      className={`pp-badge ${present ? "pp-badge--success" : "pp-badge--warning"}`}
      title={`${label}: ${present ? onFile : missing}`}
    >
      {present ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <XCircle className="h-3.5 w-3.5" aria-hidden />
      )}
      {label}
    </span>
  );
}

/**
 * Registration Approval — the participant's last step.
 *
 * It reads the finished registration back in full, section by section, each
 * one linking to the step that captured it so a mistake can be corrected in
 * place. Only the button at the bottom sends it to the SD: filling the earlier
 * steps in no longer does, so nothing reaches the approval queue that the
 * participant has not read over first.
 */
export function RegistrationApprovalPanel({
  participant,
  unit,
  members,
  flights,
  dataComplete,
  submittedAt,
  approved,
  locked,
}: {
  participant: ApprovalParticipant;
  unit: ApprovalUnit | null;
  members: ApprovalMember[];
  flights: ApprovalFlight[];
  /** Every earlier step is filled in — the submit button is live. */
  dataComplete: boolean;
  /** ISO timestamp once the participant has sent it to the SD queue. */
  submittedAt: string | null;
  /** SD has approved — nothing can be submitted or withdrawn any more. */
  approved: boolean;
  /** Administration has finalized the flight details: read-only from here. */
  locked: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const a = t.approval;
  const u = t.unit;
  const tt = t.team.table;
  const h = t.hostInfo;

  const [submitted, setSubmitted] = useState<string | null>(submittedAt);
  const [busy, setBusy] = useState(false);

  const send = async (submit: boolean) => {
    setBusy(true);
    try {
      const res = await fetch("/api/user/registration/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submit }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(
          apiErrorMessage(data, locale, t.common.toasts.genericError)
        );
        return;
      }
      const data = await res.json();
      setSubmitted(data.submittedForApprovalAt ?? null);
      toast.success(
        submit ? a.submit.submittedToast : a.submit.withdrawnToast
      );
      router.refresh();
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setBusy(false);
    }
  };

  const editAria = (section: string) => a.editAria(section);

  return (
    <div className="flex flex-col gap-4">
      <section className="pp-card">
        <div className="pp-card__head">
          <div className="min-w-0">
            <p className="pp-eyebrow">{a.eyebrow}</p>
            <h2 className="pp-card__title" style={{ marginTop: "0.15rem" }}>
              {a.title}
            </h2>
            <p className="pp-card__desc" style={{ marginTop: "0.2rem" }}>
              {a.desc}
            </p>
          </div>
        </div>
      </section>

      {/* —— Participant details ————————————————————————————— */}
      <ReviewSection
        title={a.sections.participant}
        step="unitInfo"
        editLabel={a.edit}
        editAria={editAria(a.sections.participant)}
      >
        <dl className="pp-dl">
          <Field term={u.fields.firstName} value={participant.firstName} />
          <Field term={u.fields.lastName} value={participant.lastName} />
          <Field term={u.fields.rank} value={participant.rank} />
          <Field term={t.registration.email} value={participant.email} />
          <Field
            term={t.registration.countryOfApplication}
            value={displayCountry(participant.country)}
          />
          {isInternationalParticipant(participant.country) ? (
            <Field
              term={t.registration.nationality}
              value={participant.nationality}
            />
          ) : null}
          <Field
            term={t.registration.dateRegistered}
            value={formatDateDisplay(participant.createdAt, locale)}
          />
        </dl>
      </ReviewSection>

      {/* —— Unit information ——————————————————————————————— */}
      <ReviewSection
        title={a.sections.unit}
        step="unitInfo"
        editLabel={a.edit}
        editAria={editAria(a.sections.unit)}
      >
        {unit ? (
          <dl className="pp-dl">
            <Field term={u.fields.unitName} value={unit.unitName} />
            <Field
              term={u.fields.unitType}
              value={translateUnitOption(unit.unitType, u.options)}
            />
            <Field
              term={u.fields.branch}
              value={translateUnitOption(unit.branch, u.options)}
            />
            <Field
              term={u.fields.arm}
              value={translateUnitOption(unit.arm, u.options)}
            />
            <Field
              term={u.fields.secondPocEmail}
              value={unit.secondPocEmail}
            />
            <Field term={u.fields.thirdPocEmail} value={unit.thirdPocEmail} />
            <Field
              term={u.fields.additionalInfo}
              value={unit.additionalInfo}
            />
          </dl>
        ) : (
          <p className="pp-muted">{DASH}</p>
        )}
      </ReviewSection>

      {/* —— CO / 2IC ————————————————————————————————————— */}
      <ReviewSection
        title={a.sections.co}
        step="unitInfo"
        editLabel={a.edit}
        editAria={editAria(a.sections.co)}
      >
        {unit ? (
          <dl className="pp-dl">
            <Field term={u.fields.coName} value={unit.coName} />
            <Field term={u.fields.coEmail} value={unit.coEmail} />
            <Field term={u.fields.coPhone} value={unit.coPhone} />
          </dl>
        ) : (
          <p className="pp-muted">{DASH}</p>
        )}
      </ReviewSection>

      {/* —— Team members ————————————————————————————————— */}
      <ReviewSection
        title={a.sections.roster}
        step="roster"
        editLabel={a.edit}
        editAria={editAria(a.sections.roster)}
      >
        {members.length === 0 ? (
          <p className="pp-muted">{a.noRoster}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="w-14 px-3 py-2.5">
                    {h.sNo}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {tt.fullName}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {tt.rank}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {tt.serialNumber}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {a.serviceArm}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {tt.gender}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {members.map((m, i) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {m.fullName || DASH}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {m.rank || DASH}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {m.serviceNumber || DASH}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {m.serviceArm || DASH}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {m.gender || DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReviewSection>

      {/* —— Flight details ————————————————————————————————— */}
      <ReviewSection
        title={a.sections.flights}
        step="flights"
        editLabel={a.edit}
        editAria={editAria(a.sections.flights)}
      >
        {flights.length === 0 ? (
          <p className="pp-muted">{a.noFlights}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="w-14 px-3 py-2.5">
                    {h.sNo}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {h.traveler}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {h.passengerName}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {h.passportNo}
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    {h.documents}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {flights.map((f, i) => (
                  <tr key={f.id}>
                    <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {f.travellerName || DASH}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {f.passengerName || DASH}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {f.passportNumber || DASH}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="flex flex-wrap gap-1.5">
                        <DocPill
                          label={h.passport}
                          present={f.hasPassport}
                          onFile={a.onFile}
                          missing={a.missing}
                        />
                        <DocPill
                          label={h.ticket}
                          present={f.hasTicket}
                          onFile={a.onFile}
                          missing={a.missing}
                        />
                        <DocPill
                          label={h.returnTicket}
                          present={f.hasReturnTicket}
                          onFile={a.onFile}
                          missing={a.missing}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReviewSection>

      {/* —— Submit ————————————————————————————————————————— */}
      <section className="pp-card">
        <div className="pp-card__head">
          <div className="flex min-w-0 items-start gap-3.5">
            <span
              className={`mt-0.5 flex h-11 w-11 flex-none items-center justify-center rounded-xl border ${
                approved || submitted
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
              aria-hidden
            >
              {approved || submitted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0">
              <h2 className="pp-card__title">
                {approved
                  ? a.submit.approvedTitle
                  : submitted
                    ? a.submit.submittedTitle
                    : a.submit.title}
              </h2>
              <p className="pp-card__desc" style={{ marginTop: "0.2rem" }}>
                {approved
                  ? a.submit.approvedSub
                  : submitted
                    ? a.submit.submittedSub(
                        formatDateDisplay(submitted, locale)
                      )
                    : dataComplete
                      ? a.submit.desc
                      : a.submit.incomplete}
              </p>
            </div>
          </div>
        </div>

        {approved || locked ? null : (
          <div className="flex flex-wrap gap-2">
            {submitted ? (
              <button
                type="button"
                className="pp-btn pp-btn--ghost"
                disabled={busy}
                onClick={() => send(false)}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Undo2 className="h-4 w-4" aria-hidden />
                )}
                {a.submit.withdraw}
              </button>
            ) : (
              <button
                type="button"
                className="pp-btn pp-btn--primary"
                disabled={busy || !dataComplete}
                onClick={() => send(true)}
                title={dataComplete ? a.submit.desc : a.submit.incomplete}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-4 w-4" aria-hidden />
                )}
                {a.submit.action}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
