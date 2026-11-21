"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { applyScaleVars } from "@/lib/scale";

/** Keeps the stage scale in sync with the window and turns stage links into client navigations. */
export default function StageRuntime() {
  const router = useRouter();

  useEffect(() => {
    applyScaleVars();
    const observer = new ResizeObserver(applyScaleVars);
    observer.observe(document.documentElement);
    window.addEventListener("resize", applyScaleVars);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href^='/']");
      if (!link) return;
      event.preventDefault();
      router.push(link.getAttribute("href")!);
    };
    document.addEventListener("click", onClick);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyScaleVars);
      document.removeEventListener("click", onClick);
    };
  }, [router]);

  return null;
}
