import type { CSSProperties } from "react";
import Animator, { type PageAnims } from "@/components/Animator";
import type { VariantKey } from "@/lib/scale";

type Section = { id: string; w: number; h: number; bg: string; html: string };
type Content = { variants: Record<VariantKey, Section[]>; anims: PageAnims };

/** A long scrolling page: stacked sections, each scaled to the window width. */
export default function ScrollPage({ content }: { content: Content }) {
  return (
    <main className="scroll-page">
      <Animator anims={content.anims} />
      {(Object.keys(content.variants) as VariantKey[]).map((key) => (
        <div key={key} className={`variant variant-${key}`}>
          {content.variants[key].map((section, index) => (
            <section
              key={section.id}
              className="section"
              data-sec={index}
              data-variant={key}
              style={
                {
                  "--w": `${section.w}px`,
                  "--h": `${section.h}px`,
                  backgroundColor: section.bg,
                } as CSSProperties
              }
            >
              <div
                className="stage"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </section>
          ))}
        </div>
      ))}
    </main>
  );
}
