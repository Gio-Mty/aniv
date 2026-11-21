"use client";

import { useEffect } from "react";
import type { VariantKey } from "@/lib/scale";

/** One keyframe: [time ms, dx, dy, extra rotation deg, scale, opacity], relative to the element's resting place. */
type Frame = number[];

type ElementAnim = {
  /** Index of the element inside its section (matches `data-i` in the markup). */
  i: number;
  /** The moving node is the `data-id` element nested inside the indexed one. */
  lb: boolean;
  kf: Frame[];
  /** Keeps turning forever (wax seal, vinyl record). */
  spin?: { base: number; period: number };
  /** Opacity pulse that repeats after the entrance (the heart). */
  loop?: { start: number; dur: number; kf: number[][] };
};

type SectionAnim = {
  els: ElementAnim[];
  /** Text blocks revealed word by word. */
  texts: { i: number; delay: number }[];
};

export type PageAnims = Record<VariantKey, Record<string, SectionAnim>>;

const WORD_STAGGER_MS = 76;
const MAX_TEXT_REVEAL_MS = 2200;

function animateElement(host: Element, spec: ElementAnim, out: Animation[]) {
  const target = spec.lb
    ? (host.querySelector("[data-id^='LB']") ?? host)
    : host;
  const rest = new DOMMatrixReadOnly(getComputedStyle(target).transform);
  // The resting transform is "move to place, then rotate"; keep the two apart so
  // the recorded offsets can be applied to the position and the angle separately.
  const linear = spec.spin
    ? `rotate(${spec.spin.base}deg)`
    : `matrix(${rest.a},${rest.b},${rest.c},${rest.d},0,0)`;
  const total = Math.max(1, spec.kf[spec.kf.length - 1][0]);

  out.push(
    target.animate(
      spec.kf.map(([t, dx, dy, dr, scale, opacity]) => ({
        offset: Math.min(1, t / total),
        transform: `translate(${rest.e + dx}px,${rest.f + dy}px) rotate(${dr}deg) scale(${scale}) ${linear}`,
        opacity,
      })),
      { duration: total, fill: "both" },
    ),
  );

  if (spec.spin) {
    out.push(
      target.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        { duration: spec.spin.period, iterations: Infinity, composite: "add" },
      ),
    );
  }

  if (spec.loop) {
    out.push(
      target.animate(
        spec.loop.kf.map(([offset, opacity]) => ({ offset, opacity })),
        { duration: spec.loop.dur, delay: spec.loop.start, iterations: Infinity },
      ),
    );
  }
}

/** Wraps every word of a text block in a span (once) and returns the words in reading order. */
function splitWords(host: Element): HTMLElement[][] {
  const paragraphs = Array.from(host.querySelectorAll("p"));
  if (!host.hasAttribute("data-split")) {
    host.setAttribute("data-split", "");
    for (const p of paragraphs) {
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
      for (const node of textNodes) {
        const fragment = document.createDocumentFragment();
        for (const part of node.data.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            fragment.append(part);
          } else {
            const word = document.createElement("span");
            word.dataset.word = "";
            word.textContent = part;
            fragment.append(word);
          }
        }
        node.replaceWith(fragment);
      }
    }
  }

  // Some headings are drawn twice (a second copy on top); both copies reveal together.
  const texts = paragraphs.map((p) => p.textContent);
  const half = paragraphs.length / 2;
  const doubled =
    paragraphs.length > 0 &&
    paragraphs.length % 2 === 0 &&
    texts.slice(0, half).join("\n") === texts.slice(half).join("\n");
  const groups = doubled
    ? [paragraphs.slice(0, half), paragraphs.slice(half)]
    : [paragraphs];
  return groups.map((group) =>
    group.flatMap((p) =>
      Array.from(p.querySelectorAll<HTMLElement>("[data-word]")),
    ),
  );
}

function animateText(host: Element, delay: number, out: Animation[]) {
  for (const words of splitWords(host)) {
    const stagger = Math.min(
      WORD_STAGGER_MS,
      MAX_TEXT_REVEAL_MS / Math.max(1, words.length),
    );
    words.forEach((word, index) => {
      out.push(
        word.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 1,
          delay: delay + index * stagger,
          fill: "both",
        }),
      );
    });
  }
}

/**
 * Plays the entrance animations of the page: each section starts once, the first
 * time any part of it is on screen. Elements wait hidden (`data-anim`) until then.
 */
export default function Animator({ anims }: { anims: PageAnims }) {
  useEffect(() => {
    const running: Animation[] = [];
    const started = new Set<Element>();
    const revealed: Element[] = [];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const play = (section: Element, spec: SectionAnim) => {
      const find = (i: number) => section.querySelector(`[data-i="${i}"]`);
      for (const el of spec.els) {
        const host = find(el.i);
        if (!host) continue;
        if (!reducedMotion) animateElement(host, el, running);
        host.setAttribute("data-go", "");
        revealed.push(host);
      }
      for (const text of spec.texts) {
        const host = find(text.i);
        if (!host) continue;
        if (!reducedMotion) animateText(host, text.delay, running);
        host.setAttribute("data-go", "");
        revealed.push(host);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const el = entry.target as HTMLElement;
        const spec = anims[el.dataset.variant as VariantKey]?.[el.dataset.sec!];
        if (spec) play(el, spec);
      }
    });

    // Watch the sections of whichever layout is showing; re-check when the window
    // crosses a breakpoint and another layout takes over.
    const watch = () => {
      document
        .querySelectorAll<HTMLElement>("[data-sec]")
        .forEach((section) => {
          if (started.has(section)) return;
          if (section.getClientRects().length === 0) return;
          started.add(section);
          observer.observe(section);
        });
    };
    watch();
    window.addEventListener("resize", watch);

    return () => {
      window.removeEventListener("resize", watch);
      observer.disconnect();
      running.forEach((animation) => animation.cancel());
      revealed.forEach((el) => el.removeAttribute("data-go"));
    };
  }, [anims]);

  return null;
}
