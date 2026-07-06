"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type AwardMedalPreview = {
  name: string;
  range: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
  highQuality?: boolean;
};

type Props = {
  medal: AwardMedalPreview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AwardMedalLightbox({ medal, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pats-award-lightbox gap-0 overflow-hidden p-0">
        {medal ? (
          <>
            <DialogTitle className="sr-only">{medal.name}</DialogTitle>
            <DialogDescription className="sr-only">{medal.range}</DialogDescription>
            <div className="pats-award-lightbox__stage">
              <Image
                src={medal.imageSrc}
                alt={medal.imageAlt}
                fill
                className="pats-award-lightbox__image"
                unoptimized={medal.highQuality}
                quality={100}
                priority
                sizes="94vw"
              />
            </div>
            <div className="pats-award-lightbox__caption">
              <p className="pats-award-lightbox__name">{medal.name}</p>
              <p className="pats-award-lightbox__range">{medal.range}</p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
