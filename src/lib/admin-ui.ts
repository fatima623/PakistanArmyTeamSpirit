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

export { filterChipTone, filterChipToneProps } from "@/lib/filter-chip-tones";

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
export const adminUsersPage = "admin-users-page";
export const adminUsersPanel = "admin-users-panel";
export const adminUsersControls = "admin-users-controls";
export const adminUsersToolbar = "admin-users-controls";
export const adminUsersToolbarSearch = "admin-users-toolbar-search";
export const adminUsersFilterTabs = "admin-users-filter-tabs";
export const adminUsersPagination = "admin-users-pagination";

/** Payment verification */
export const adminPaymentsPage = "admin-payments-page";
export const adminPaymentsPanel = "admin-payments-panel";
export const adminPaymentsControls = "admin-payments-controls";
export const adminPaymentsToolbarSearch = "admin-payments-toolbar-search";
export const adminPaymentsFilterTabs = "admin-payments-filter-tabs";

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
export const adminTableRow = "border-t border-cp-border/80";
export const adminTableCell = "px-4 py-3.5 text-sm text-cp-ink";
export const adminTableCellMuted = "admin-td-muted";
export const adminTableCellMeta = "admin-td-meta";
export const adminTableEmpty = "px-4 py-12 text-center text-cp-ink-muted";

/** Forms */
export const adminInput = "admin-input";
export const adminTextarea = "admin-textarea";
export const adminFormPanel = "admin-form-panel";
export const adminFormPanelTitle = "admin-form-panel-title";
export const adminFormGrid = "admin-form-grid";
export const adminSettingsLayout = "admin-settings-layout";
export const adminSettingsCard = "admin-settings-card";
export const adminDialogContent =
  "border-cp-border bg-white text-cp-ink shadow-[0_8px_30px_rgba(28,33,25,0.12)]";
export const adminAlertBanner = "admin-alert-banner";

/** Metrics */
export const adminStatCard = "portal-stat-card";
export const adminStatValue = "portal-stat-value";
export const adminStatLabel = "portal-stat-label";
export const adminStatIconWrap = "portal-stat-icon-wrap";
export const adminQuickAction = "portal-quick-action ops-btn ops-btn-secondary";
