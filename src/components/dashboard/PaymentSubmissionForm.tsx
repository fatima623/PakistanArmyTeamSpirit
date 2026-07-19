"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  CornerUpLeft,
  Image as ImageIcon,
  Info,
  Loader2,
  Lock,
  Receipt,
  Send,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PaymentInstructions } from "@/components/dashboard/PaymentInstructions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import {
  PAYMENT_STATUS,
  isPaymentVerified,
  normalizePaymentStatus,
} from "@/lib/constants";
import {
  DEFAULT_PAYMENT_SETTINGS,
  formatRegistrationFee,
} from "@/lib/payment-settings";
import type { ParticipantPaymentData } from "@/lib/participant-payment-data";
import { PaymentProofFileRow } from "@/components/payments/PaymentProofFileRow";
import { PaymentStatusTimeline } from "@/components/payments/PaymentStatusTimeline";
import { apiErrorMessage } from "@/lib/i18n/api-error-i18n";
import { formatDateShort, formatDateTimePK } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";

function SummaryTile({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">
        {label}
      </span>
      <span className="break-words text-[0.875rem] font-bold text-slate-900">
        {value || "—"}
      </span>
    </div>
  );
}

export function PaymentSubmissionForm({
  initialData,
}: {
  initialData: ParticipantPaymentData;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const pf = t.payment.form;
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(initialData.canSubmit);
  const [paymentStatus, setPaymentStatus] = useState(initialData.paymentStatus);
  const [payments, setPayments] = useState(initialData.payments);
  const [paymentSettings, setPaymentSettings] = useState(
    initialData.paymentSettings ?? DEFAULT_PAYMENT_SETTINGS
  );
  const [amount, setAmount] = useState(
    String(initialData.paymentSettings.registrationFee ?? initialData.defaultAmount)
  );
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCanSubmit(initialData.canSubmit);
    setPayments(initialData.payments);
    setPaymentStatus(initialData.paymentStatus);
    setPaymentSettings(initialData.paymentSettings ?? DEFAULT_PAYMENT_SETTINGS);
    setAmount(
      String(
        initialData.paymentSettings.registrationFee ?? initialData.defaultAmount
      )
    );
  }, [initialData]);

  useEffect(() => {
    if (!proof) {
      setProofPreview(null);
      return;
    }
    const url = URL.createObjectURL(proof);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proof]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof) {
      toast.error(pf.toastAttachProof);
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("paymentDate", paymentDate);
    formData.append("transactionReference", transactionReference);
    if (notes.trim()) formData.append("notes", notes.trim());
    formData.append("proof", proof);

    // The upload must not be able to strand the form: if fetch rejects (offline,
    // connection reset, aborted upload) the busy flag has to be cleared, or the
    // submit button stays disabled on the spinner until a full page reload.
    try {
      const res = await fetch("/api/user/payment", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success(pf.toastSubmitSuccess);
        router.push("/event/dashboard");
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(apiErrorMessage(body, locale, t.common.toasts.genericError));
      }
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const feeLabel = formatRegistrationFee(
    paymentSettings.registrationFee,
    paymentSettings.currency
  );

  /* —— Latest payment: proof + verification summary (reference design) —— */
  const latest = payments[0] ?? null;
  const latestStatus = latest ? normalizePaymentStatus(latest.status) : null;
  const latestVerified = latest ? isPaymentVerified(latest.status) : false;
  const latestAmountLabel = latest
    ? formatRegistrationFee(latest.amount, paymentSettings.currency)
    : feeLabel;

  const summaryBanner = latest
    ? latestVerified
      ? {
          classes:
            "border-emerald-200 bg-emerald-50 text-emerald-900 [&_svg]:text-emerald-700",
          icon: CheckCircle2,
          text: pf.banners.verified,
        }
      : latestStatus === PAYMENT_STATUS.REJECTED
        ? {
            classes: "border-red-200 bg-red-50 text-red-900 [&_svg]:text-red-600",
            icon: XCircle,
            text: pf.banners.rejected,
          }
        : latestStatus === PAYMENT_STATUS.RETURNED
          ? {
              classes:
                "border-orange-200 bg-orange-50 text-orange-900 [&_svg]:text-orange-600",
              icon: CornerUpLeft,
              text: pf.banners.returned,
            }
          : {
              classes:
                "border-sky-200 bg-sky-50 text-sky-900 [&_svg]:text-sky-700",
              icon: Clock,
              text: pf.banners.pending,
            }
    : null;
  const SummaryIcon = summaryBanner?.icon ?? CheckCircle2;

  const verificationResult = !latest
    ? "—"
    : latestVerified
      ? pf.result.verified
      : latestStatus === PAYMENT_STATUS.REJECTED
        ? pf.result.rejected
        : latestStatus === PAYMENT_STATUS.RETURNED
          ? pf.result.returned
          : pf.result.pending;

  return (
    <div className="space-y-8">
      <PaymentInstructions settings={paymentSettings} compact />

      {payments.length > 0 && (
        <section>
          <h2 className="m-0 mb-3 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900">
            {pf.submittedPayments}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5"
              >
                <span
                  className="pp-proof-filerow__icon flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700"
                  aria-hidden
                >
                  <Receipt className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[0.875rem] font-bold text-slate-900">
                    {formatRegistrationFee(p.amount, paymentSettings.currency)}{" "}
                    {pf.submittedRef(p.transactionReference ?? "—")}
                  </p>
                  <p className="m-0 mt-0.5 text-[0.75rem] text-slate-500">
                    {pf.submittedOn(formatDateShort(p.createdAt))}
                    {p.paymentDate
                      ? pf.paidSuffix(formatDateShort(p.paymentDate))
                      : ""}
                  </p>
                </div>
                <div className="flex flex-none items-center gap-2">
                  <PaymentStatusBadge status={p.status} showPrefix={false} />
                  <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* —— Payment Proof (latest submission) ————————————————— */}
      {latest && (latest.internalFilePath || latest.proofFileName) ? (
        <section className="pp-card">
          <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span
              className="pp-proof-filerow__icon flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700"
              aria-hidden
            >
              <ImageIcon className="h-4 w-4" />
            </span>
            <h2 className="m-0 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900">
              {pf.paymentProof}
            </h2>
          </div>
          <PaymentProofFileRow
            paymentId={latest.id}
            access="user"
            fileName={latest.proofOriginalFileName ?? latest.proofFileName}
            fileSize={latest.proofFileSize}
            mimeType={latest.proofMimeType}
          />
        </section>
      ) : null}

      {/* —— Verification Summary (latest submission) ————————— */}
      {latest && summaryBanner ? (
        <section className="pp-card">
          <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span
              className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700"
              aria-hidden
            >
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="m-0 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900">
              {pf.verificationSummary}
            </h2>
          </div>

          <div className="space-y-4">
            <div
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-[1.45] [&_svg]:mt-px [&_svg]:flex-shrink-0 ${summaryBanner.classes}`}
            >
              <SummaryIcon className="h-4 w-4" aria-hidden />
              <span>{summaryBanner.text}</span>
            </div>

            {latest.rejectionReason &&
            (latestStatus === PAYMENT_STATUS.REJECTED ||
              latestStatus === PAYMENT_STATUS.RETURNED) ? (
              <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[0.8125rem] leading-[1.5] text-amber-900">
                <span className="font-bold">{pf.messageFromPats}</span>{" "}
                {latest.rejectionReason}
              </p>
            ) : null}

            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-slate-400">
                  {pf.paymentStatus}
                </span>
                <span>
                  <PaymentStatusBadge
                    status={latest.status}
                    showPrefix={false}
                    density="table"
                  />
                </span>
              </div>
              <SummaryTile label={pf.amountDue} value={latestAmountLabel} />
              <SummaryTile label={pf.verificationResult} value={verificationResult} />
              <SummaryTile
                label={pf.lastUpdated}
                value={formatDateTimePK(latest.updatedAt)}
              />
            </div>

            {latest.rejectionHistory.length > 0 ? (
              <PaymentStatusTimeline
                status={latest.status}
                history={latest.rejectionHistory}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {canSubmit ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          <h2 className="m-0 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900">
            {pf.uploadTitle}
          </h2>
          <p className="m-0 mt-1 text-[0.8125rem] text-slate-500">
            {pf.uploadDesc(feeLabel)}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* —— Drop zone ————————————————————————————————— */}
            <div
              role="button"
              tabIndex={0}
              aria-label={pf.uploadAria}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) setProof(file);
              }}
              className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                dragOver
                  ? "border-emerald-500 bg-emerald-50/70"
                  : "border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
            >
              {proofPreview && proof?.type.startsWith("image/") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={proofPreview}
                  alt={pf.selectedPreviewAlt}
                  className="max-h-36 rounded-lg border border-slate-200 object-contain"
                />
              ) : (
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
                  aria-hidden
                >
                  <UploadCloud className="h-6 w-6" />
                </span>
              )}
              {proof ? (
                <div>
                  <p className="m-0 text-[0.875rem] font-bold text-slate-900">
                    {proof.name}
                  </p>
                  <p className="m-0 mt-1 text-[0.75rem] text-slate-500">
                    {pf.chooseDifferent}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="m-0 text-[0.875rem] font-semibold text-slate-700">
                    {pf.dropHerePre}{" "}
                    <span className="font-bold text-emerald-700">
                      {pf.browse}
                    </span>
                  </p>
                  <p className="m-0 mt-1 text-[0.75rem] text-slate-400">
                    {pf.fileTypes}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="proof"
                type="file"
                accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf"
                onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            {/* —— Fields ———————————————————————————————————— */}
            <div className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="amount">
                    {pf.amountPaid(paymentSettings.currency)}
                    <strong className="ml-0.5 text-red-500" aria-hidden>
                      *
                    </strong>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="1"
                    min="0"
                    required
                    readOnly
                    value={amount}
                    className="mt-1.5 font-semibold opacity-90"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentDate">
                    {pf.paymentDate}
                    <strong className="ml-0.5 text-red-500" aria-hidden>
                      *
                    </strong>
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="transactionReference">
                  {pf.transactionRef}
                  <strong className="ml-0.5 text-red-500" aria-hidden>
                    *
                  </strong>
                </Label>
                <Input
                  id="transactionReference"
                  required
                  placeholder={pf.transactionRefPlaceholder}
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="paymentNotes">{pf.notes}</Label>
                <textarea
                  id="paymentNotes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={pf.notesPlaceholder}
                  className="mt-1.5 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              disabled={submitting}
              className="pp-btn pp-btn--primary"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {pf.uploading}
                </>
              ) : (
                <>
                  <Send className="mr-1 h-4 w-4" aria-hidden />
                  {pf.submitForVerification}
                </>
              )}
            </Button>
            <p className="m-0 inline-flex items-center gap-1.5 text-[0.75rem] text-slate-500">
              <Lock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              {pf.secureNote}
            </p>
          </div>
        </form>
      ) : null}

      {payments.length > 0 && !isPaymentVerified(paymentStatus) ? (
        <p className="m-0 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-[0.8125rem] leading-relaxed text-sky-900">
          <Info className="mt-px h-4 w-4 flex-shrink-0 text-sky-600" aria-hidden />
          {pf.willBeVerified}
        </p>
      ) : null}
    </div>
  );
}
