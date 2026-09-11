"use client";

import { Suspense } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { SignInCard } from "@/components/auth/SignInCard";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * The sign-in dialog the landing page opens over itself.
 *
 * It uses the Radix primitives directly rather than the shared `DialogContent`
 * wrapper so the panel can carry its own frame and the overlay can blur the
 * landing page behind it instead of merely dimming it.
 */
export function LandingLoginDialog({ open, onOpenChange }: Props) {
  const { t, dir } = useI18n();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="pats-signin-overlay" />
        {/* The card carries the only heading, so the panel needs no separate
            description — `aria-describedby={undefined}` tells Radix that is
            deliberate rather than an omission. */}
        <DialogPrimitive.Content
          className="pats-signin-dialog"
          dir={dir}
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            {t.publicSite.login.card.title}
          </DialogPrimitive.Title>

          <DialogPrimitive.Close
            className="pats-signin-dialog__close"
            aria-label={t.publicSite.gallery.close}
          >
            <X aria-hidden strokeWidth={1.75} />
          </DialogPrimitive.Close>

          {/* `SignInCard` reads the `next` / `registered` query flags. */}
          <Suspense fallback={null}>
            <SignInCard variant="dialog" />
          </Suspense>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
