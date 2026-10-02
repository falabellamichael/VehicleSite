import { useEffect, useRef, type RefObject } from "react";
import { publicAsset } from "../lib";
import "./HeroBackdrop.css";

/** Replace image paths with owned assets; empty slots render original design studies. */
const designs = [
  { id: "contour", title: "Sculpted lines", image: "" },
  { id: "architecture", title: "Light & space", image: "" },
  { id: "velocity", title: "Made of motion", image: "" },
  { id: "horizon", title: "New horizons", image: "" },
] as const;
type Design = (typeof designs)[number]["id"];

function DesignStudy({ design }: { design: Design }) {
  return (
    <svg viewBox="0 0 360 420" fill="none" aria-hidden="true" focusable="false">
      {design === "contour" && <>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M${-80 + i * 18} 382 C${42 + i * 13} 245 ${50 + i * 17} 125 ${220 + i * 12} 102 S410 214 395 282`}
            stroke="currentColor" strokeWidth={i === 4 ? 1.7 : .7} opacity={i === 4 ? .95 : .48} />
        ))}
        <ellipse cx="208" cy="265" rx="108" ry="57" stroke="currentColor" opacity=".22" transform="rotate(-28 208 265)" />
        <path d="M57 283h246M187 86v268" stroke="currentColor" strokeDasharray="3 8" opacity=".19" />
        <circle cx="238" cy="180" r="5" fill="currentColor" />
        <circle cx="238" cy="180" r="20" stroke="currentColor" opacity=".35" />
      </>}
      {design === "architecture" && <>
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${38 + i * 21} 357 V${159 + i * 4} A${142 - i * 21} ${112 - i * 14} 0 0 1 ${322 - i * 21} ${159 + i * 4} V357`}
            stroke="currentColor" strokeWidth={i === 0 ? 1.7 : .8} opacity={.75 - i * .075} />
        ))}
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M12 ${315 + i * 15} H348`} stroke="currentColor" opacity={.08 + i * .03} />)}
        <path d="M180 167L30 392M180 167L330 392" stroke="currentColor" opacity=".24" />
        <circle cx="180" cy="166" r="28" fill="currentColor" opacity=".1" />
      </>}
      {design === "velocity" && <>
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M-55 ${180 + i * 17} L${210 + i * 7} ${57 + i * 18} L415 ${140 + i * 17}`}
            stroke="currentColor" strokeWidth={i === 4 ? 2 : .8} opacity={i % 3 === 0 ? .7 : .3} />
        ))}
        <ellipse cx="160" cy="244" rx="100" ry="82" stroke="currentColor" opacity=".28" />
        <ellipse cx="160" cy="244" rx="72" ry="59" stroke="currentColor" opacity=".19" />
        <path d="M73 284l174-82" stroke="currentColor" strokeWidth="3" opacity=".6" />
      </>}
      {design === "horizon" && <>
        <circle cx="206" cy="162" r="77" stroke="currentColor" opacity=".7" />
        <circle cx="206" cy="162" r="59" stroke="currentColor" opacity=".18" />
        <path d="M-30 307L69 237L146 271L238 202L385 289" stroke="currentColor" opacity=".8" />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-25 ${305 + i * 16} Q180 ${232 + i * 19} 390 ${291 + i * 16}`} stroke="currentColor" opacity={.48 - i * .045} />)}
        <path d="M20 194h320" stroke="currentColor" strokeDasharray="2 9" opacity=".25" />
      </>}
    </svg>
  );
}

/** Decorative, mouse-led motion only: no automatic movement or touch interception. */
export default function HeroBackdrop({ hostRef, motion }: {
  hostRef: RefObject<HTMLDivElement | null>;
  motion: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current, root = rootRef.current;
    const track = trackRef.current, group = groupRef.current;
    if (!host || !root || !track || !group) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    let period = 1, phase = 0, depth = 0, measured = false;
    let target = 0, velocity = 0, visible = true;
    let frame: number | null = null, last: number | null = null;
    const enabled = () => motion && !reduced.matches && pointer.matches;
    const paint = () => {
      track.style.transform = `translate3d(${(phase - period).toFixed(3)}px, 0, 0)`;
      root.style.setProperty("--backdrop-grid-x", `${depth.toFixed(3)}px`);
    };
    const measure = () => {
      const next = group.getBoundingClientRect().width;
      if (next <= 0) return;
      phase = measured ? phase / period * next : next * .24;
      period = next;
      measured = true;
      paint();
    };
    const halt = () => {
      target = velocity = 0;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = last = null;
      root.dataset.direction = "still";
      root.dataset.moving = "false";
    };
    const tick = (now: number) => {
      frame = null;
      if (!enabled() || !visible || document.hidden) { halt(); return; }
      const dt = last === null ? 1 / 60 : Math.min((now - last) / 1000, .05);
      last = now;
      velocity += (target - velocity) * (1 - Math.exp(-9 * dt));
      phase = ((phase + velocity * dt) % period + period) % period;
      depth = (depth + velocity * dt * .28) % 80;
      paint();
      if (Math.abs(velocity) > .12 || target !== 0) frame = requestAnimationFrame(tick);
      else halt();
    };
    const start = () => {
      if (frame !== null) return;
      last = null;
      root.dataset.moving = "true";
      frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      target = 0;
      root.dataset.direction = "still";
      if (Math.abs(velocity) <= .12) halt();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !enabled() || !visible || document.hidden) return;
      if (document.querySelector("dialog[open]")) { halt(); return; }
      const bounds = host.getBoundingClientRect();
      if (!bounds.width) return;
      const position = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      // A tiny neutral strip prevents direction jitter exactly at the midpoint.
      const direction = Math.abs(position) < .035 ? 0 : position < 0 ? -1 : 1;
      target = direction * (24 + 64 * Math.abs(position));
      root.dataset.direction = direction < 0 ? "left" : direction > 0 ? "right" : "still";
      if (target !== 0 || Math.abs(velocity) > .12) start();
    };
    const preference = () => { root.dataset.enabled = String(enabled()); halt(); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab" || event.key === "Escape") halt(); };
    const resize = new ResizeObserver(measure);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) halt(); });
    resize.observe(group);
    intersection.observe(host);
    measure();
    preference();
    host.addEventListener("pointerenter", move, { passive: true });
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave, { passive: true });
    host.addEventListener("pointercancel", halt, { passive: true });
    host.addEventListener("pointerdown", halt, { passive: true });
    window.addEventListener("blur", halt);
    window.addEventListener("scroll", halt, { passive: true });
    window.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", halt);
    reduced.addEventListener("change", preference);
    pointer.addEventListener("change", preference);
    return () => {
      halt();
      resize.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointerenter", move);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointercancel", halt);
      host.removeEventListener("pointerdown", halt);
      window.removeEventListener("blur", halt);
      window.removeEventListener("scroll", halt);
      window.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", halt);
      reduced.removeEventListener("change", preference);
      pointer.removeEventListener("change", preference);
    };
  }, [hostRef, motion]);

  return (
    <div ref={rootRef} className="hero-motion-backdrop" aria-hidden="true" data-direction="still" data-moving="false">
      <div className="hero-backdrop-window">
        <div className="hero-backdrop-grid" />
        <div ref={trackRef} className="hero-design-track">
          {[0, 1, 2].map(copy => (
            <div key={copy} ref={copy === 0 ? groupRef : undefined} className="hero-design-group">
              {designs.map((design, index) => (
                <div key={design.id} className={`hero-design-panel design-${design.id}`}>
                  <span className="hero-design-code">VS / DESIGN STUDY 0{index + 1}</span>
                  <DesignStudy design={design.id} />
                  {design.image && <img src={publicAsset(design.image)} alt="" decoding="async" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />}
                  <div className="hero-design-caption"><span>0{index + 1}</span><div>{design.title}<small>VISUAL PLACEHOLDER</small></div></div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="hero-backdrop-wash" />
      </div>
      <div className="hero-backdrop-hint"><span className="backdrop-left">←</span><span>MOVE TO SET THE SCENE</span><span className="backdrop-right">→</span></div>
    </div>
  );
}
