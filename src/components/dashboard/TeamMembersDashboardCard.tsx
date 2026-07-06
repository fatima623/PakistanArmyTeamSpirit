import Link from "next/link";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TeamMembersDashboardCard({ count }: { count: number }) {
  const hasMembers = count > 0;

  return (
    <section className="portal-card pats-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="portal-h2 mb-1 flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0" aria-hidden />
            Team Members
          </h2>
          {hasMembers ? (
            <p className="portal-muted">
              You have added{" "}
              <strong className="text-cp-ink">{count}</strong>{" "}
              {count === 1 ? "team member" : "team members"}.
            </p>
          ) : (
            <p className="portal-muted">
              No team members added yet. Adding your team is optional.
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/event/team">
            {hasMembers ? "Manage Team Members" : "Add Team Member"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
