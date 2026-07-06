"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { MISSION_SOLDIER_PLACEHOLDER } from "@/lib/army-content";
import { PATS_CROP } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  quote: string;
  body: string;
  motto?: string;
};

const REVEAL_MS = 900;
const STAGGER_MS = 150;

export function PatsMissionShowcase({
  eyebrow = "Concept / Purpose",
  quote,
  body,
  motto,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-mission-reveal]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const reveal = () => {
      targets.forEach((el, index) => {
        window.setTimeout(() => {
          el.classList.add("is-visible");
        }, index * STAGGER_MS);
      });
    };

    const showIfInView = () => {
      const rect = root.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
        reveal();
        return true;
      }
      return false;
    };

    if (showIfInView()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="pats-mission-showcase">
      <div className="pats-mission-showcase__watermark" aria-hidden>
        <Image
          src={PATS_CROP.logoFull}
          alt=""
          width={500}
          height={500}
          className="pats-mission-showcase__watermark-img"
          priority={false}
        />
      </div>
      <div className="pats-mission-showcase__vignette" aria-hidden />

      <div className="pats-mission-showcase__grid">
        <div
          className={cn(
            "pats-mission-showcase__col pats-mission-showcase__col--soldier",
            "pats-mission-showcase__reveal pats-mission-showcase__reveal--soldier"
          )}
          data-mission-reveal
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
        >
          <div className="pats-mission-showcase__soldier-stage">
            <div className="pats-mission-showcase__soldier-frame group">
              <Image
                src={MISSION_SOLDIER_PLACEHOLDER}
                alt=""
                fill
                sizes="(max-width: 1023px) 72vw, 28vw"
                className="pats-mission-showcase__soldier-img"
                priority={false}
              />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "pats-mission-showcase__col pats-mission-showcase__col--content",
            "pats-mission-showcase__reveal pats-mission-showcase__reveal--content"
          )}
          data-mission-reveal
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
        >
          <div className="pats-mission-showcase__content-stage">
            <div className="pats-mission">
              <p className="pats-eyebrow">{eyebrow}</p>
              <div className="pats-gold-rule pats-gold-rule--center" aria-hidden />
              <h2 className="pats-mission__quote">{quote}</h2>
              <p className="pats-body pats-body--bright pats-mission-showcase__body">
                {body}
              </p>
              {motto ? (
                <div className="pats-mission-showcase__motto-row">
                  <span className="pats-mission-showcase__motto-line" aria-hidden />
                  <p className="pats-mission__motto pats-mission-showcase__motto">
                    {motto}
                  </p>
                  <span className="pats-mission-showcase__motto-line" aria-hidden />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "pats-mission-showcase__col pats-mission-showcase__col--badges",
            "pats-mission-showcase__reveal pats-mission-showcase__reveal--badges"
          )}
          data-mission-reveal
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
        >
          <div className="pats-mission-showcase__badges-stage">
            <div className="pats-mission-showcase__badges-float">
              <Image
                src={PATS_CROP.photo28Footer}
                alt="PATS international competition marks"
                width={680}
                height={680}
                quality={95}
                sizes="(max-width: 1023px) 52vw, 340px"
                className="pats-mission-showcase__badges-img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
