"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { useMemo, useState } from "react";

export type PatsVideoItem = {
  id: string;
  href: string;
  title: string;
  category: string;
  thumbnail: string;
};

type Props = {
  videos: readonly PatsVideoItem[];
  moreHref?: string;
};

const PAIR_SIZE = 2;

const SECTION_WRAPPER_STYLE = {
  overflow: "hidden",
  width: "100%",
  maxWidth: "100vw",
  boxSizing: "border-box",
} as const;

const CARDS_GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "24px",
  width: "100%",
  maxWidth: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
} as const;

const VIDEO_CARD_STYLE = {
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
} as const;

function slideCount(total: number) {
  return Math.max(1, Math.ceil(total / PAIR_SIZE));
}

function videosForSlide(videos: readonly PatsVideoItem[], slide: number) {
  const start = slide * PAIR_SIZE;
  return videos.slice(start, start + PAIR_SIZE);
}

function VideoCard({ video }: { video: PatsVideoItem }) {
  return (
    <Link
      href={video.href}
      className="pats-video-gallery__card"
      style={VIDEO_CARD_STYLE}
    >
      <Image
        src={video.thumbnail}
        alt=""
        fill
        className="pats-video-gallery__card-img"
        sizes="(max-width: 1023px) 100vw, 42vw"
      />
      <div className="pats-video-gallery__card-shade" aria-hidden />
      <span className="pats-video-gallery__card-play" aria-hidden>
        <Play className="h-3 w-3 fill-current" strokeWidth={0} />
      </span>
      <div className="pats-video-gallery__card-meta">
        <span className="pats-video-gallery__card-category">
          Video / {video.category}
        </span>
        <p className="pats-video-gallery__card-title">{video.title}</p>
      </div>
    </Link>
  );
}

export function PatsVideoGallery({ videos, moreHref = "/gallery" }: Props) {
  const slides = useMemo(() => slideCount(videos.length), [videos.length]);
  const [activeSlide, setActiveSlide] = useState(0);
  const visibleVideos = videosForSlide(videos, activeSlide);

  return (
    <div className="pats-video-gallery" data-pats-video-gallery>
      <div className="pats-video-gallery__layout">
        <header className="pats-video-gallery__intro">
          <h2 className="pats-video-gallery__title">
            <span className="pats-video-gallery__title-line">PATS</span>
            <span className="pats-video-gallery__title-line">Video Gallery</span>
          </h2>
          <div className="pats-video-gallery__title-rule" aria-hidden />
          <p className="pats-video-gallery__subtitle">
            Learn more about Pakistan Army Team Spirit
          </p>
        </header>

        <div className="pats-video-gallery__stage" style={SECTION_WRAPPER_STYLE}>
          <div style={CARDS_GRID_STYLE}>
            {visibleVideos.map((video) => (
              <VideoCard key={`${activeSlide}-${video.id}`} video={video} />
            ))}
          </div>

          <div className="pats-video-gallery__controls">
            {slides > 1 ? (
              <div
                className="pats-video-gallery__indicators"
                role="tablist"
                aria-label="Video gallery slides"
              >
                {Array.from({ length: slides }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={index === activeSlide}
                    aria-label={`Show videos ${index + 1} of ${slides}`}
                    className={
                      index === activeSlide
                        ? "pats-video-gallery__indicator is-active"
                        : "pats-video-gallery__indicator"
                    }
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
            ) : (
              <span className="pats-video-gallery__indicators-spacer" aria-hidden />
            )}

            <Link href={moreHref} className="pats-video-gallery__more">
              More videos
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
