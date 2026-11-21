/**
 * Every page is a fixed-size "stage" captured at three reference screens.
 * These CSS variables hold the factor that scales each stage to the current window.
 *
 *  --sd / --st / --sm      scrolling page: scale by width (desktop / tablet / mobile)
 *  --hd-c / --ht-c / --hm-c  full-screen pages: content fits inside the window
 *  --hd-v / --ht-v / --hm-v  full-screen pages: background covers the window
 */
export const REF = {
  d: { w: 1366, h: 768 },
  t: { w: 820, h: 1180 },
  m: { w: 390, h: 844 },
} as const;

export type VariantKey = keyof typeof REF;

export function applyScaleVars() {
  const root = document.documentElement;
  const w = root.clientWidth;
  const h = window.innerHeight;
  const set = (name: string, value: number) =>
    root.style.setProperty(name, String(value));

  set("--sd", w / REF.d.w);
  set("--st", w / REF.t.w);
  set("--sm", w / REF.m.w);
  for (const key of ["d", "t", "m"] as const) {
    const fitW = w / REF[key].w;
    const fitH = h / REF[key].h;
    set(`--h${key}-c`, Math.min(fitW, fitH));
    set(`--h${key}-v`, Math.max(fitW, fitH));
  }
}

/** Same logic as applyScaleVars, inlined in <body> so the first paint is already scaled. */
export const scaleBootScript = `(function(){var R=${JSON.stringify(
  REF,
)},r=document.documentElement,w=(r.classList.add("js"),r.clientWidth),h=window.innerHeight,s=function(n,v){r.style.setProperty(n,v)};s('--sd',w/R.d.w);s('--st',w/R.t.w);s('--sm',w/R.m.w);['d','t','m'].forEach(function(k){var a=w/R[k].w,b=h/R[k].h;s('--h'+k+'-c',Math.min(a,b));s('--h'+k+'-v',Math.max(a,b))})})()`;
