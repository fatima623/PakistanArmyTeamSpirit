import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Users2 } from "lucide-react";
import { Prisma } from "@prisma/client";

import { AdminExportButton } from "@/components/admin/AdminExportButton";
import { AdminUsersPagination } from "@/components/admin/AdminUsersPagination";
import {
  CountryFilterSelect,
  type CountryFilterOption,
} from "@/components/admin/CountryFilterSelect";
import { FilterMemory } from "@/components/admin/FilterMemory";
import { LiveSearchInput } from "@/components/admin/LiveSearchInput";
import { UsersManagementTable } from "@/components/admin/UsersManagementTable";
import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/admin-session";
import {
  PARTICIPANT_ROLE,
  ROLES,
  canApproveRegistration,
} from "@/lib/auth-routes";
import { cn } from "@/lib/utils";
import { adminNavLabel } from "@/lib/admin-navigation";
import {
  APPLICATION_STATUS,
  LEGACY_PAYMENT_STATUS,
  PAYMENT_STATUS,
  type ApplicationStatus,
} from "@/lib/constants";
import { normalizeApplicationStatus } from "@/lib/user-status";
import {
  segmentedChipClasses,
  adminUsersControls,
  adminUsersPage,
  adminUsersPagination,
  adminUsersPanel,
  adminUsersToolbarSearch,
} from "@/lib/admin-ui";

export const metadata: Metadata = {
  title: adminNavLabel("users"),
};

const PAGE_SIZE = 20;

/** Session cookie remembering the last-selected overall-status filter. */
const USERS_FILTER_COOKIE = "admin_users_filter";
const VALID_USER_FILTERS = new Set([
  "all",
  "pending",
  "approved",
  "under_review",
  "returned",
  "rejected",
]);

/** Overall-status chips: All / Pending / Approved / Under Review /
 *  Returned / Rejected. Pending is the SD Directorate's landing view. */
const STATUS_FILTERS: {
  key: string;
  label: string;
  status?: ApplicationStatus;
}[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending", status: APPLICATION_STATUS.PENDING },
  { key: "approved", label: "Approved", status: APPLICATION_STATUS.APPROVED },
  {
    key: "under_review",
    label: "Under Review",
    status: APPLICATION_STATUS.UNDER_REVIEW,
  },
  { key: "returned", label: "Returned", status: APPLICATION_STATUS.RETURNED },
  { key: "rejected", label: "Rejected", status: APPLICATION_STATUS.REJECTED },
];

/** Sentinel `country` value for the participants who have no country recorded
 *  (created through the admin console before it captured one). */
const COUNTRY_NOT_SET = "__none__";

type SearchParams = Promise<{
  page?: string;
  search?: string;
  filter?: string;
  appStatus?: string;
  payStatus?: string;
  country?: string;
}>;

function buildHref(params: {
  filter: string;
  search: string;
  payStatus: string;
  country: string;
  page?: number;
}): string {
  const query = new URLSearchParams();
  /* `filter` is ALWAYS emitted, including "all". Omitting it left the URL with
     no filter param, which is exactly the signal the page uses to fall back to
     the remembered-filter cookie — so once any other chip had been clicked,
     clicking "All" bounced straight back to the remembered filter and the chip
     looked dead. An explicit ?filter=all is what actually clears it. */
  query.set("filter", params.filter || "all");
  if (params.search) query.set("search", params.search);
  if (params.payStatus && params.payStatus !== "all")
    query.set("payStatus", params.payStatus);
  if (params.country && params.country !== "all")
    query.set("country", params.country);
  query.set("page", String(params.page ?? 1));
  return `/admin/users?${query.toString()}`;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const viewerRole = await getAdminRole();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search ?? "";
  // First-load default is role-appropriate: the SD Directorate (who process
  // registrations) land on Pending new requests; MT lands on Under Review;
  // everyone else on All. An explicit ?filter= wins; otherwise the last-used
  // filter (remembered in a session cookie) is restored so the choice
  // survives navigating away and back to the page.
  const roleDefaultFilter =
    viewerRole === ROLES.SDBS
      ? "pending"
      : viewerRole === ROLES.MTD
        ? "under_review"
        : "all";
  const rememberedFilter = (await cookies()).get(USERS_FILTER_COOKIE)?.value;
  const defaultFilter =
    rememberedFilter && VALID_USER_FILTERS.has(rememberedFilter)
      ? rememberedFilter
      : roleDefaultFilter;
  const filter = params.filter ?? defaultFilter;
  const appStatus = params.appStatus ?? "";
  const payStatus = params.payStatus ?? "all";

  /* Country dropdown options come from the countries actually present among
     participants (unfiltered), so the list never offers an empty slice. */
  const countryGroups = await prisma.user.groupBy({
    by: ["country"],
    where: { role: PARTICIPANT_ROLE },
    _count: { _all: true },
  });

  const namedCountries = countryGroups
    .filter((group) => !!group.country?.trim())
    .map((group) => ({
      name: (group.country as string).trim(),
      count: group._count._all,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const notSetCount = countryGroups
    .filter((group) => !group.country?.trim())
    .reduce((sum, group) => sum + group._count._all, 0);
  const participantCount =
    notSetCount + namedCountries.reduce((sum, c) => sum + c.count, 0);

  const countryOptions: CountryFilterOption[] = [
    { value: "all", label: `All countries (${participantCount})` },
    ...namedCountries.map((c) => ({
      value: c.name,
      label: `${c.name} (${c.count})`,
    })),
    ...(notSetCount > 0
      ? [{ value: COUNTRY_NOT_SET, label: `Not set (${notSetCount})` }]
      : []),
  ];

  /* A stale/hand-typed ?country= that matches nothing falls back to "all"
     rather than silently rendering an empty table. */
  const requestedCountry = params.country ?? "all";
  const country = countryOptions.some((o) => o.value === requestedCountry)
    ? requestedCountry
    : "all";

  /* Base scope: everything except the status chip itself — the chip counts
     are computed against this same scope so the numbers always match. */
  /* Participants only. A `not: "admin"` denylist would also list SD/MT staff
     and Host Formation logins as if they were participation requests. */
  const baseWhere: Prisma.UserWhereInput = { role: PARTICIPANT_ROLE };
  if (search) {
    baseWhere.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }
  if (payStatus && payStatus !== "all") {
    baseWhere.paymentStatus =
      payStatus === PAYMENT_STATUS.VERIFIED
        ? { in: [PAYMENT_STATUS.VERIFIED, LEGACY_PAYMENT_STATUS.APPROVED] }
        : payStatus;
  }
  /* Country lives on baseWhere (not `where`) so it constrains the table, the
     row count, the status-chip counts AND the CSV export alike. `AND` is used
     for the "not set" case because `OR` is already taken by the search box. */
  if (country === COUNTRY_NOT_SET) {
    baseWhere.AND = [{ OR: [{ country: null }, { country: "" }] }];
  } else if (country !== "all") {
    baseWhere.country = country;
  }

  const where: Prisma.UserWhereInput = { ...baseWhere };

  const statusByFilter: Record<string, ApplicationStatus> = {
    approved: APPLICATION_STATUS.APPROVED,
    under_review: APPLICATION_STATUS.UNDER_REVIEW,
    returned: APPLICATION_STATUS.RETURNED,
    rejected: APPLICATION_STATUS.REJECTED,
    pending: APPLICATION_STATUS.PENDING,
  };
  if (statusByFilter[filter]) {
    where.applicationStatus = statusByFilter[filter];
  } else if (filter === "payment_pending") {
    // Legacy bookmark support
    where.applicationStatus = APPLICATION_STATUS.APPROVED;
    where.paymentStatus = PAYMENT_STATUS.PENDING;
  }
  if (appStatus) where.applicationStatus = appStatus;

  const [users, totalCount, grouped] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        rank: true,
        role: true,
        approved: true,
        applicationStatus: true,
        paymentStatus: true,
        suspended: true,
        createdAt: true,
        approvedAt: true,
        rejectedAt: true,
        country: true,
        nationality: true,
        unit: { select: { unitName: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ["applicationStatus"],
      where: baseWhere,
      _count: { _all: true },
    }),
  ]);

  /* Chip counts (normalised so legacy status strings still tally). */
  const statusCounts: Record<ApplicationStatus, number> = {
    PENDING: 0,
    UNDER_REVIEW: 0,
    APPROVED: 0,
    REJECTED: 0,
    RETURNED: 0,
  };
  let allCount = 0;
  for (const group of grouped) {
    const count = group._count._all;
    statusCounts[normalizeApplicationStatus(group.applicationStatus)] += count;
    allCount += count;
  }

  /* Chip row: All + the five application statuses (Pending first, as the
     SD Directorate's default review queue). */
  const chips = STATUS_FILTERS;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /* Export the WHOLE filtered set, not just the current page. `users` is capped
     at PAGE_SIZE, so exporting from it produced a CSV of 20 rows while the
     footer beside the button advertised the full count — a silent truncation
     that is indistinguishable from a complete export once opened. */
  const exportUsers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      rank: true,
      country: true,
      nationality: true,
      applicationStatus: true,
      paymentStatus: true,
      createdAt: true,
      unit: { select: { unitName: true } },
    },
  });

  const exportRows = exportUsers.map((u) => ({
    Name: `${u.firstName} ${u.lastName}`,
    Email: u.email,
    Rank: u.rank || "",
    Unit: u.unit?.unitName ?? "",
    Country: u.country ?? "",
    Nationality: u.nationality ?? "",
    Application: u.applicationStatus,
    Payment: u.paymentStatus,
    Registered: u.createdAt.toISOString().slice(0, 10),
  }));

  /* Every extra filter must ride along on the page links, or paging silently
     drops it. */
  const paginationExtraQuery = [
    payStatus && payStatus !== "all"
      ? `payStatus=${encodeURIComponent(payStatus)}`
      : "",
    country && country !== "all" ? `country=${encodeURIComponent(country)}` : "",
  ]
    .filter(Boolean)
    .join("&");

  return (
      <div className={cn(adminUsersPage, "admin-fade-in-up")}>
        <FilterMemory cookieName={USERS_FILTER_COOKIE} value={filter} />
        <div className={adminUsersPanel}>
          <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-brand-line/60 pb-3">
            <h2 className="m-0 flex items-center gap-2 text-[0.9375rem] font-bold tracking-[-0.01em] text-slate-900">
              <Users2
                size={17}
                className="flex-shrink-0 text-green-800"
                aria-hidden
              />
              Participation Requests
            </h2>

            <div className="flex flex-wrap items-center gap-1.5">
              <nav
                className="flex flex-wrap items-center gap-1.5"
                aria-label="Filter by overall status"
              >
                {chips.map((chip) => {
                  const count = chip.status
                    ? statusCounts[chip.status]
                    : allCount;
                  const active = filter === chip.key;
                  return (
                    <Link
                      key={chip.key}
                      href={buildHref({
                        filter: chip.key,
                        search,
                        payStatus,
                        country,
                      })}
                      className={segmentedChipClasses(chip.key, active)}
                      aria-current={active ? "true" : undefined}
                    >
                      {chip.label} ({count})
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <section className={adminUsersControls}>
            <div
              className={cn(
                adminUsersToolbarSearch,
                "sm:grid-cols-[minmax(0,1fr)_minmax(0,13rem)_auto]"
              )}
            >
              <LiveSearchInput
                paramName="search"
                placeholder="Search name or email..."
                ariaLabel="Search users"
                className="relative min-w-0"
                inputClassName="h-11 w-full rounded-[10px] bg-white pl-10 pr-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-900/40 focus-visible:border-brand-olive/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-olive/15 focus-visible:ring-offset-0"
                iconClassName="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-900 opacity-45"
              />
              <CountryFilterSelect value={country} options={countryOptions} />
              <AdminExportButton
                rows={exportRows}
                columns={[
                  "Name",
                  "Email",
                  "Rank",
                  "Unit",
                  "Country",
                  "Nationality",
                  "Application",
                  "Payment",
                  "Registered",
                ]}
                filename="participation-requests.csv"
              />
            </div>
          </section>

          <UsersManagementTable
            users={users}
            canApprove={canApproveRegistration(viewerRole)}
          />

          <footer className={adminUsersPagination}>
            <p className="m-0 text-sm font-medium text-slate-900">
              Page {page} of {totalPages}
              <span className="text-slate-500"> · {totalCount} requests</span>
            </p>
            <AdminUsersPagination
              page={page}
              totalPages={totalPages}
              filter={filter}
              search={search}
              extraQuery={paginationExtraQuery}
            />
          </footer>
        </div>
      </div>
  );
}
