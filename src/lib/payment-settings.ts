import { prisma } from "@/lib/prisma";

export type PaymentSettingsPublic = {
  currency: string;
  registrationFee: number;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  wiseEmail: string;
  wiseName: string;
  mobileNumber: string;
  mobileTitle: string;
  remitlyEmail: string;
  remitlyName: string;
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsPublic = {
  currency: "PKR",
  registrationFee: 15000,
  bankName: "HBL",
  bankAccountTitle: "PATS",
  bankAccountNumber: "1234567890",
  bankIban: "PK00HABB0000000012345678",
  wiseEmail: "payments@pats.gov.pk",
  wiseName: "PATS Organising Committee",
  mobileNumber: "+92 300 1234567",
  mobileTitle: "PATS",
  remitlyEmail: "payments@pats.gov.pk",
  remitlyName: "PATS Organising Committee",
};

const PAYMENT_SETTINGS_SELECT = {
  defaultPaymentAmount: true,
  paymentCurrency: true,
  paymentBankName: true,
  paymentBankAccountTitle: true,
  paymentBankAccountNumber: true,
  paymentBankIban: true,
  paymentWiseEmail: true,
  paymentWiseName: true,
  paymentMobileNumber: true,
  paymentMobileTitle: true,
  paymentRemitlyEmail: true,
  paymentRemitlyName: true,
} as const;

export function formatRegistrationFee(
  amount: number | string | { toString(): string },
  currency = "PKR"
): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} —`;
  return `${currency} ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export async function getPaymentSettings(): Promise<PaymentSettingsPublic> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: PAYMENT_SETTINGS_SELECT,
  });

  if (!row) return { ...DEFAULT_PAYMENT_SETTINGS };

  return {
    currency: row.paymentCurrency || DEFAULT_PAYMENT_SETTINGS.currency,
    registrationFee:
      Number(row.defaultPaymentAmount) || DEFAULT_PAYMENT_SETTINGS.registrationFee,
    bankName: row.paymentBankName || DEFAULT_PAYMENT_SETTINGS.bankName,
    bankAccountTitle:
      row.paymentBankAccountTitle || DEFAULT_PAYMENT_SETTINGS.bankAccountTitle,
    bankAccountNumber:
      row.paymentBankAccountNumber || DEFAULT_PAYMENT_SETTINGS.bankAccountNumber,
    bankIban: row.paymentBankIban ?? "",
    wiseEmail: row.paymentWiseEmail || DEFAULT_PAYMENT_SETTINGS.wiseEmail,
    wiseName: row.paymentWiseName || DEFAULT_PAYMENT_SETTINGS.wiseName,
    mobileNumber: row.paymentMobileNumber || DEFAULT_PAYMENT_SETTINGS.mobileNumber,
    mobileTitle: row.paymentMobileTitle || DEFAULT_PAYMENT_SETTINGS.mobileTitle,
    remitlyEmail: row.paymentRemitlyEmail || DEFAULT_PAYMENT_SETTINGS.remitlyEmail,
    remitlyName: row.paymentRemitlyName || DEFAULT_PAYMENT_SETTINGS.remitlyName,
  };
}
