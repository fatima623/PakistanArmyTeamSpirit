"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TOAST } from "@/lib/toast";

export function PrivacyForm({
  initialAccepted,
}: {
  initialAccepted: boolean;
}) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(initialAccepted);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });
      if (res.ok) {
        toast.success("Privacy policy accepted");
        router.push("/event/dashboard");
        return;
      }
      toast.error(TOAST.GENERIC_ERROR);
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-form-card mt-6 max-w-lg">
      <p className="portal-body mb-6">
        Please read and agree to our privacy policy by ticking the box below.
      </p>

      <Button className="cp-btn-secondary mb-6" asChild>
        <Link href="/privacy" target="_blank" rel="noopener noreferrer">
          View policy <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>

      <div className="mb-8 flex items-center gap-3">
        <Checkbox
          id="privacy-check"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
        />
        <label htmlFor="privacy-check" className="portal-body cursor-pointer">
          I agree to the privacy policy
        </label>
      </div>

      <Button
        onClick={handleSave}
        disabled={loading || !accepted}
        className="cp-btn-primary px-8 rounded-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save
      </Button>
    </div>
  );
}
