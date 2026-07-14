"use client";

import dynamic from "next/dynamic";

import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";

const loading = () => <AdminPanelSkeleton />;

export const TickerManager = dynamic(
  () =>
    import("@/components/admin/TickerManager").then((m) => ({
      default: m.TickerManager,
    })),
  { loading, ssr: false }
);

export const TickerAnnouncementForm = dynamic(
  () =>
    import("@/components/admin/TickerAnnouncementForm").then((m) => ({
      default: m.TickerAnnouncementForm,
    })),
  { loading, ssr: false }
);

export const SettingsForm = dynamic(
  () =>
    import("@/components/admin/SettingsForm").then((m) => ({
      default: m.SettingsForm,
    })),
  { loading, ssr: false }
);

export const KeyDatesManager = dynamic(
  () =>
    import("@/components/admin/KeyDatesManager").then((m) => ({
      default: m.KeyDatesManager,
    })),
  { loading, ssr: false }
);

export const HostFormationsManager = dynamic(
  () =>
    import("@/components/admin/HostFormationsManager").then((m) => ({
      default: m.HostFormationsManager,
    })),
  { loading, ssr: false }
);

export const NewsPostForm = dynamic(
  () =>
    import("@/components/admin/NewsPostForm").then((m) => ({
      default: m.NewsPostForm,
    })),
  { loading, ssr: false }
);

export const UnitsTable = dynamic(
  () =>
    import("@/components/admin/UnitsTable").then((m) => ({
      default: m.UnitsTable,
    })),
  { loading, ssr: false }
);

export const PaymentReviewPanel = dynamic(
  () =>
    import("@/components/admin/PaymentReviewPanel").then((m) => ({
      default: m.PaymentReviewPanel,
    })),
  { loading, ssr: false }
);

export const ApplicationReviewPanel = dynamic(
  () =>
    import("@/components/admin/ApplicationReviewPanel").then((m) => ({
      default: m.ApplicationReviewPanel,
    })),
  { loading, ssr: false }
);

export const RegistrationVerificationPanel = dynamic(
  () =>
    import("@/components/admin/RegistrationActions").then((m) => ({
      default: m.RegistrationVerificationPanel,
    })),
  { loading, ssr: false }
);
