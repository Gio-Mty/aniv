import type { CSSProperties } from "react";
import Animator, { type PageAnims } from "@/components/Animator";
import type { VariantKey } from "@/lib/scale";

type Section = {
  id: string;
  w: number;
  h: number;
  bg: string;
  bgHtml: string;
  fgHtml: string;
};
type Content = { variants: Record<VariantKey, Section[]>; anims: PageAnims };

/** A full-screen page: the background covers the window, the content fits inside it. */
export default function HeroPage({ content }: { content: Content }) {
  return (
    <main className="hero-page">
      <Animator anims={content.anims} />
      {(Object.keys(content.variants) as VariantKey[]).map((key) => {
        const section = content.variants[key][0];
        const size = {
          "--w": `${section.w}px`,
          "--h": `${section.h}px`,
        } as CSSProperties;
        return (
          <div key={key} className={`variant variant-${key}`}>
            <div
              className="layer layer-bg"
              style={size}
              dangerouslySetInnerHTML={{ __html: section.bgHtml }}
            />
            <div
              className="layer layer-fg"
              data-sec={0}
              data-variant={key}
              style={size}
              dangerouslySetInnerHTML={{ __html: section.fgHtml }}
            />
          </div>
        );
      })}
    </main>
  );
}
