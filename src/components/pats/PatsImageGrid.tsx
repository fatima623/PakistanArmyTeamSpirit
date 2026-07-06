"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";

export type PatsImageCard = {
  id: string;
  href: string;
  image: string;
  tag: string;
  title: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  imageRepeat?: "no-repeat" | "repeat";
};

type Props = {
  cards: readonly PatsImageCard[];
  journeyLabel?: string;
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "32px",
  overflow: "visible",
  position: "relative",
  isolation: "isolate",
  width: "100%",
  maxWidth: "100%",
};

function ParticipationCard({
  card,
  journeyLabel,
}: {
  card: PatsImageCard;
  journeyLabel: string;
}) {
  const [hovered, setHovered] = useState(false);

  const cardStyle: CSSProperties = {
    position: "relative",
    zIndex: hovered ? 10 : 1,
    minWidth: 0,
    width: "100%",
    maxWidth: "100%",
    margin: 0,
    display: "block",
    overflow: "hidden",
  };

  return (
    <Link
      href={card.href}
      className="pats-image-card group"
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div
        className="pats-image-card__media"
        style={{
          backgroundImage: `url(${card.image})`,
          backgroundPosition: card.imagePosition ?? "center",
          backgroundSize: card.imageFit ?? "cover",
          backgroundRepeat: card.imageRepeat ?? "no-repeat",
        }}
        aria-hidden
      />
      <div className="pats-image-card__overlay" aria-hidden />
      <div className="pats-image-card__bar" aria-hidden />
      <div className="pats-image-card__content">
        <span className="pats-image-card__tag">{card.tag || journeyLabel}</span>
        <h3 className="pats-image-card__title">{card.title}</h3>
        <div className="pats-image-card__rule" aria-hidden />
      </div>
    </Link>
  );
}

export function PatsImageGrid({
  cards,
  journeyLabel = "Start your journey with PATS",
}: Props) {
  return (
    <div className="pats-image-grid" style={gridStyle}>
      {cards.map((card) => (
        <ParticipationCard key={card.id} card={card} journeyLabel={journeyLabel} />
      ))}
    </div>
  );
}
