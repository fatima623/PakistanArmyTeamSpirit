/**
 * Admin panel layout utilities for tables and action groups.
 * Buttons: use `<Button variant="adminPrimary" | "adminApprove" | "adminOutline" | "adminWarning" | "adminDestructive" />`
 * with `size="sm"` in tables or default/lg for page actions.
 */
export const adminTableActions = "admin-table-actions";
export const adminTableActionsCenter =
  "admin-table-actions admin-table-actions--center";
export const adminTableActionsEnd = "admin-table-actions admin-table-actions--end";
export const adminTableActionsStack = "admin-table-actions-stack";

/** Shared flex container for review panels and toolbars */
export const adminActionGroup = "ops-action-group";

/** Filter/status pills on list pages */
export const adminFilterChip = "ops-filter-chip";
export const adminFilterChipActive = "ops-filter-chip-active";
export const adminFilterChipInactive = "ops-filter-chip-inactive";
export const adminFilterGroup = "portal-filter-group";

export {
  filterChipClasses,
  filterChipTone,
  filterChipToneProps,
  segmentedChipClasses,
} from "@/lib/filter-chip-tones";

/** Compact table row actions (View / Delete / Verify / Edit) */
export const portalTableActionBtn = "portal-table-action-btn";
export const portalTableActionView =
  "portal-table-action-btn portal-table-action-btn--view";
export const portalTableActionDanger =
  "portal-table-action-btn portal-table-action-btn--danger";
export const portalTableActionPrimary =
  "portal-table-action-btn portal-table-action-btn--primary";

/** Square icon-only variants for table row actions (pencil / eye / trash). */
export const portalTableActionIcon =
  "portal-table-action-btn portal-table-action-btn--icon";
export const portalTableActionIconView =
  "portal-table-action-btn portal-table-action-btn--view portal-table-action-btn--icon";
export const portalTableActionIconDanger =
  "portal-table-action-btn portal-table-action-btn--danger portal-table-action-btn--icon";

/** Participation requests / user management */
export const adminUsersPage = "flex w-full flex-col";
export const adminUsersPanel =
  "flex w-full flex-col gap-3.5 rounded-2xl border border-black/[0.04] bg-white px-[1.125rem] pb-[1.125rem] pt-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_32px_rgba(0,0,0,0.06)]";
export const adminUsersControls = "flex flex-col gap-2.5";
export const adminUsersToolbar = adminUsersControls;
export const adminUsersToolbarSearch =
  "grid w-full grid-cols-[minmax(0,1fr)_auto] items-stretch gap-2.5";
export const adminUsersFilterTabs =
  "flex w-full flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-2";
export const adminUsersPagination =
  "flex flex-row flex-wrap items-center justify-between gap-4 border-t border-brand-line/60 pt-2";

/* Status-pill + approve-button overrides that admin-users-reference.css
   used to force inside users tables (all stock palette values). Applied as
   arbitrary-variant utilities on the <table> so the cascade contest with
   pats-refresh/admin-typography resolves identically until those sheets
   die in phase 3d. */
export const adminTablePillStyles =
  "[&_.ops-status-pill]:!inline-flex [&_.ops-status-pill]:!min-w-[5.75rem] [&_.ops-status-pill]:!max-w-full [&_.ops-status-pill]:!items-center [&_.ops-status-pill]:!justify-center [&_.ops-status-pill]:!whitespace-nowrap [&_.ops-status-pill]:!rounded-full [&_.ops-status-pill]:!border [&_.ops-status-pill]:!border-transparent [&_.ops-status-pill]:!px-3 [&_.ops-status-pill]:!py-1 [&_.ops-status-pill]:!text-xs [&_.ops-status-pill]:!font-bold [&_.ops-status-pill]:!leading-[1.25] [&_.ops-status-approved]:!border-green-200 [&_.ops-status-approved]:!bg-green-100 [&_.ops-status-approved]:!text-green-600 [&_.ops-status-pending]:!border-amber-200 [&_.ops-status-pending]:!bg-yellow-100 [&_.ops-status-pending]:!text-yellow-600 [&_.ops-status-review]:!border-amber-200 [&_.ops-status-review]:!bg-yellow-100 [&_.ops-status-review]:!text-yellow-600 [&_.ops-status-rejected]:!border-red-200 [&_.ops-status-rejected]:!bg-red-100 [&_.ops-status-rejected]:!text-red-600 [&_.ops-status-neutral]:!border-slate-200 [&_.ops-status-neutral]:!bg-slate-100 [&_.ops-status-neutral]:!text-slate-900";

export const adminApproveBtnStyles =
  "[&_.admin-approve-btn]:!h-8 [&_.admin-approve-btn]:!min-h-8 [&_.admin-approve-btn]:!max-h-8 [&_.admin-approve-btn]:!min-w-[4.5rem] [&_.admin-approve-btn]:!rounded-lg [&_.admin-approve-btn]:!border [&_.admin-approve-btn]:!border-green-300 [&_.admin-approve-btn]:!bg-white [&_.admin-approve-btn]:!px-3 [&_.admin-approve-btn]:!text-xs [&_.admin-approve-btn]:!font-semibold [&_.admin-approve-btn]:!text-green-600 [&_.admin-approve-btn]:!shadow-none [&_.admin-approve-btn:hover]:!border-green-500 [&_.admin-approve-btn:hover]:!bg-green-50 [&_.admin-approve-btn:hover]:!text-green-700 [&_.admin-approve-btn:disabled]:!border-green-200 [&_.admin-approve-btn:disabled]:!bg-green-50 [&_.admin-approve-btn:disabled]:!text-green-600";

/** Payment verification */
export const adminPaymentsPage = "flex w-full flex-col pb-6";
export const adminPaymentsPanel = "admin-surface flex w-full flex-col gap-5 p-6 shadow-[0_2px_12px_rgba(15,23,42,0.05)]";
export const adminPaymentsControls = "flex flex-col gap-3.5 rounded-xl border border-slate-200 bg-slate-50 px-[1.125rem] py-4";
export const adminPaymentsToolbarSearch = "grid w-full grid-cols-[minmax(0,1fr)_auto] items-stretch gap-2.5";
export const adminPaymentsFilterTabs = "flex w-full flex-wrap items-center gap-2.5";

/** Surfaces & typography */
export const adminSurface = "admin-surface";
export const adminSurfacePadded = "admin-surface p-6";
export const adminPageTitle = "admin-page-title";
export const adminSectionTitle = "admin-section-title";
export const adminHeading = "admin-heading";
export const adminMuted = "admin-muted";
export const adminLabel = "admin-label";
export const adminLink = "admin-link";
export const adminIconAccent = "admin-icon-accent";

/** Tables */
export const adminDataTableShell = "admin-data-table-shell";
export const adminDataTable = "admin-data-table";
export const adminTableShell = "admin-data-table-shell";
export const adminTableHead = "admin-table-head";
export const adminTableRow = "border-t border-brand-line/80";
export const adminTableCell = "px-4 py-3.5 text-sm text-brand-ink";
export const adminTableCellMuted = "admin-td-muted";
export const adminTableCellMeta = "admin-td-meta";
export const adminTableEmpty = "px-4 py-12 text-center text-brand-ink-muted";

/** Forms */
export const adminInput = "admin-input";
export const adminTextarea = "admin-textarea";
export const adminFormPanel = "admin-form-panel";
export const adminFormPanelTitle = "admin-form-panel-title";
export const adminFormGrid = "admin-form-grid";
export const adminSettingsLayout = "admin-settings-layout";
export const adminSettingsCard = "admin-settings-card";
export const adminDialogContent =
  "border-brand-line bg-white text-brand-ink shadow-[0_8px_30px_rgba(28,33,25,0.12)]";
export const adminAlertBanner = "admin-alert-banner";

/** Metrics */
export const adminStatCard = "portal-stat-card";
export const adminStatValue = "portal-stat-value";
export const adminStatLabel = "portal-stat-label";
export const adminStatIconWrap = "portal-stat-icon-wrap";
export const adminQuickAction = "portal-quick-action ops-btn ops-btn-secondary";
