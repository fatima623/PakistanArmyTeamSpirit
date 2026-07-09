"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PaymentInstructions } from "@/components/dashboard/PaymentInstructions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentStatusBadge } from "@/components/admin/StatusBadges";
import { isPaymentVerified } from "@/lib/constants";
import {
  DEFAULT_PAYMENT_SETTINGS,
  formatRegistrationFee,
} from "@/lib/payment-settings";
import type { ParticipantPaymentData } from "@/lib/participant-payment-data";
import { PaymentProofViewer } from "@/components/payments/PaymentProofViewer";
import { PaymentStatusTimeline } from "@/components/payments/PaymentStatusTimeline";
import { TOAST } from "@/lib/toast";
import "@/app/payment-status-timeline.css";
import { formatDateShort } from "@/lib/utils";

export function PaymentSubmissionForm({
  initialData,
}: {
  initialData: ParticipantPaymentData;
}) {
  const router = useRouter();
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
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

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
      toast.error("Please attach payment proof (screenshot or receipt)");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("paymentDate", paymentDate);
    formData.append("transactionReference", transactionReference);
    formData.append("proof", proof);

    const res = await fetch("/api/user/payment", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success(TOAST.PAYMENT_SUBMIT_SUCCESS);
      router.push("/event/dashboard");
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? TOAST.GENERIC_ERROR);
    }
    setSubmitting(false);
  };

  const feeLabel = formatRegistrationFee(
    paymentSettings.registrationFee,
    paymentSettings.currency
  );

  return (
    <div className="space-y-8">
      <PaymentInstructions settings={paymentSettings} compact />

      {payments.length > 0 && (
        <section>
          <h2 className="portal-h2">Submitted payments</h2>
          <ul className="space-y-4">
            {payments.map((p) => (
              <li key={p.id} className="portal-card-muted">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-ink">
                      {formatRegistrationFee(p.amount, paymentSettings.currency)}{" "}
                      — ref. {p.transactionReference ?? "—"}
                    </p>
                    <p className="portal-muted mt-1 text-xs">
                      Submitted {formatDateShort(p.createdAt)}
                      {p.paymentDate
                        ? ` · Paid ${formatDateShort(p.paymentDate)}`
                        : ""}
                    </p>
                  </div>
                  <PaymentStatusBadge status={p.status} variant="participant" />
                </div>
                <PaymentStatusTimeline
                  status={p.status}
                  history={p.rejectionHistory}
                />
                {(p.internalFilePath || p.proofFileName) && (
                  <div className="mt-4 border-t border-brand-line pt-4">
                    <p className="portal-subtitle mb-2">Uploaded proof</p>
                    <PaymentProofViewer
                      paymentId={p.id}
                      access="user"
                      mimeType={p.proofMimeType}
                      fileName={
                        p.proofOriginalFileName ?? p.proofFileName ?? undefined
                      }
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {canSubmit ? (
        <form onSubmit={handleSubmit} className="portal-form-card">
          <h2 className="portal-section-title">Submit payment proof</h2>
          <p className="portal-muted">
            After sending <strong className="text-brand-ink">{feeLabel}</strong> via bank
            wire transfer, Wise, a mobile wallet, or Remitly, upload your screenshot
            or receipt and transaction reference. Accepted: PNG, JPG, JPEG, PDF (max 5MB).
          </p>
          <div className="portal-card-accent-olive text-sm">
            Amount to report: <strong className="text-brand-ink">{feeLabel}</strong>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount ({paymentSettings.currency})</Label>
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
              <Label htmlFor="paymentDate">Payment date</Label>
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
            <Label htmlFor="transactionReference">Transaction / reference ID</Label>
            <Input
              id="transactionReference"
              required
              placeholder="e.g. bank ref, Wise / Remitly ID, wallet TID"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="proof">Payment proof (screenshot or receipt)</Label>
            <Input
              id="proof"
              type="file"
              accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf"
              required
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
              className="mt-1.5"
            />
            {proofPreview && proof?.type.startsWith("image/") && (
              <div className="mt-3">
                <p className="portal-subtitle mb-1">Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proofPreview}
                  alt="Selected proof preview"
                  className="max-h-40 rounded border border-brand-line object-contain"
                />
              </div>
            )}
            {proof && proof.type === "application/pdf" && (
              <p className="portal-muted mt-2 text-xs">PDF selected: {proof.name}</p>
            )}
          </div>
          <Button type="submit" disabled={submitting} className="cp-btn-primary w-full sm:w-auto">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading proof…
              </>
            ) : (
              "Submit payment for verification"
            )}
          </Button>
        </form>
      ) : isPaymentVerified(paymentStatus) ? (
        <p className="portal-alert-success">
          Payment verified by PATS. No further action is required.
        </p>
      ) : (
        <p className="portal-alert-info">
          Payment proof submitted. Waiting for manual verification by PATS —
          you will be notified when verified or if rejected.
        </p>
      )}
    </div>
  );
}
