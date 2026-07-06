import Link from "next/link";

import { ARMY_NAME, HQ_ORG, SITE_NAME, SUPPORT_EMAIL } from "@/lib/branding";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t-2 border-cp-brass/30 bg-cp-gunmetal text-cp-khaki">
      <div className="h-px bg-gradient-to-r from-transparent via-cp-brass/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-white">
              {SITE_NAME}
            </p>
            <p className="mt-1 text-xs text-cp-khaki">
              {HQ_ORG} · {ARMY_NAME}
            </p>
            <p className="mt-3 text-xs">© 2019–2026 {SITE_NAME}</p>
          </div>

          <div className="text-xs leading-relaxed">
            <p className="mb-1 font-semibold uppercase tracking-wide text-cp-brass-light">
              Contact
            </p>
            <p>Tel. Military: 94351 2438</p>
            <p>Tel. Civilian: 01874 613 438</p>
            <p className="mt-1 break-all">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-cp-brass-light hover:text-white hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/privacy"
              className="text-sm font-medium text-cp-brass-light transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/event/login"
              className="text-xs text-cp-khaki transition-colors hover:text-white"
            >
              Participant login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
