import type { PaymentSettingsPublic } from "@/lib/payment-settings";
import { formatRegistrationFee } from "@/lib/payment-settings";
import { cn } from "@/lib/utils";

type Props = {
  settings: PaymentSettingsPublic;
  compact?: boolean;
};

type DetailRowProps = {
  label: string;
  value: string;
  mono?: boolean;
  scrollable?: boolean;
};

function DetailRow({ label, value, mono, scrollable }: DetailRowProps) {
  if (!value.trim()) return null;

  return (
    <div className="min-w-0">
      <p className="portal-subtitle mb-1 text-[11px]">{label}</p>
      <p
        className={cn(
          "text-base font-semibold leading-snug text-cp-ink",
          mono && "font-mono tracking-wide tabular-nums",
          scrollable
            ? "max-w-full overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch]"
            : "whitespace-nowrap"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PaymentMethodCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="portal-card-muted flex h-full min-w-0 flex-col">
      <h4 className="portal-subtitle mb-4 border-b border-cp-border pb-3">{title}</h4>
      <div className="flex flex-1 flex-col gap-4">{children}</div>
    </article>
  );
}

export function PaymentInstructions({ settings, compact }: Props) {
  const fee = formatRegistrationFee(
    settings.registrationFee,
    settings.currency
  );

  return (
    <section className={cn("min-w-0", compact ? "space-y-6" : "space-y-6")}>
      <header className="space-y-2">
        {!compact ? (
          <h2 className="portal-section-title">Payment instructions</h2>
        ) : (
          <h3 className="portal-section-title text-lg">How to pay</h3>
        )}
        <p className="portal-muted">
          Use one of the methods below to pay the registration fee in full.
        </p>
      </header>

      <div className="portal-card border-t-cp-brass/50">
        <p className="portal-subtitle">Registration fee</p>
        <p className="mt-2 font-display text-3xl font-bold tracking-tight text-cp-ink sm:text-4xl">
          {fee}
        </p>
        <p className="portal-muted mt-2 max-w-prose">
          Send exactly this amount before uploading your payment proof.
        </p>
      </div>

      <div>
        <p className="portal-subtitle mb-3">Payment methods</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 sm:items-stretch">
          <PaymentMethodCard title="Bank wire transfer">
            <DetailRow label="Bank name" value={settings.bankName} />
            <DetailRow label="Account title" value={settings.bankAccountTitle} />
            <DetailRow
              label="Account number"
              value={settings.bankAccountNumber}
              mono
            />
            {settings.bankIban.trim() ? (
              <DetailRow label="IBAN / SWIFT" value={settings.bankIban} mono scrollable />
            ) : null}
          </PaymentMethodCard>

          <PaymentMethodCard title="Wise transfer">
            <DetailRow label="Wise email" value={settings.wiseEmail} scrollable />
            <DetailRow label="Recipient name" value={settings.wiseName} />
          </PaymentMethodCard>

          <PaymentMethodCard title="Mobile wallets">
            <DetailRow label="Wallet number" value={settings.mobileNumber} mono />
            <DetailRow label="Account title" value={settings.mobileTitle} />
          </PaymentMethodCard>

          <PaymentMethodCard title="Remitly">
            <DetailRow label="Remitly email" value={settings.remitlyEmail} scrollable />
            <DetailRow label="Recipient name" value={settings.remitlyName} />
          </PaymentMethodCard>
        </div>
      </div>

      <div className="portal-alert-warning">
        <p className="mb-3 text-sm font-bold text-cp-ink">Steps to complete payment</p>
        <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed marker:font-semibold">
          <li>Send the registration fee using one of the methods above.</li>
          <li>Save your payment screenshot or receipt.</li>
          <li>Upload the payment proof with your transaction reference for verification.</li>
          
        </ol>
      </div>
    </section>
  );
}
