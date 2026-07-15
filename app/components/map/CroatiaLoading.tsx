"use client";

// Loading animation for Croatia Explorer — ported from the Claude Design project
// "Loading Animation.dc.html". A magnifying glass travels a smooth (Catmull-Rom) search
// path over the Croatia relief map, with a real zoomed "lens" and a "Searching…" caption.
// Everything is laid out in a 1024×1024 logical space and scaled down to `size`.

import { useEffect, useRef } from "react";

const SHAPE_URL = "/loading-croatia-exploring.png";

// Closed search path over the country, in 1024-space.
const PATH: [number, number][] = [
  [290, 420],
  [330, 360],
  [450, 310],
  [530, 290],
  [480, 380],
  [610, 360],
  [730, 340],
  [700, 430],
  [560, 470],
  [470, 500],
  [430, 560],
  [500, 620],
  [570, 670],
  [640, 730],
  [540, 690],
  [440, 610],
  [360, 510],
];

const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};

interface CroatiaLoadingProps {
  /** Rendered pixel size of the square loader. */
  size?: number;
  /** Animation speed multiplier. */
  speed?: number;
  /** Lens magnification. */
  zoom?: number;
  /** Caption text before the animated dots. */
  label?: string;
}

export default function CroatiaLoading({
  size = 220,
  speed = 1,
  zoom = 2.2,
  label = "Loading",
}: CroatiaLoadingProps) {
  const magRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLSpanElement>(null);

  // Seed the first paint at the path's start (t = 0 → PATH[0]) so the magnifier never
  // flashes at translate(0,0) / the image's top-left before the first animation frame.
  const [startX, startY] = PATH[0];
  const lensRadius = 88; // lens interior radius (220/2 − 22 border)

  useEffect(() => {
    const pts = PATH;
    const n = pts.length;
    let t = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      t = (t + dt * speed * 0.55) % n;
      const i = Math.floor(t);
      const f = t - i;
      const P = (k: number) => pts[(i + k + n) % n];
      // ease within each segment for a dwell-and-dart "searching" feel
      const fe = f - Math.sin(f * Math.PI * 2) * 0.12;
      const cx = catmull(P(-1)[0], P(0)[0], P(1)[0], P(2)[0], fe);
      const cy = catmull(P(-1)[1], P(0)[1], P(1)[1], P(2)[1], fe);
      const bob = 1 + Math.sin(now / 300) * 0.015;

      if (magRef.current) {
        magRef.current.style.transform = `translate(${cx}px,${cy}px) scale(${bob})`;
      }
      if (lensRef.current) {
        const r = 88; // lens interior radius (220/2 − 22 border)
        lensRef.current.style.backgroundSize = `${1024 * zoom}px ${1024 * zoom}px`;
        lensRef.current.style.backgroundPosition = `${-(cx * zoom - r)}px ${-(cy * zoom - r)}px`;
      }
      if (dotsRef.current) {
        dotsRef.current.textContent = ".".repeat(Math.floor(now / 450) % 4);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, zoom]);

  return (
    <div
      className="flex flex-col items-center gap-7"
      role="status"
      aria-live="polite"
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1024,
            height: 1024,
            transformOrigin: "0 0",
            transform: `scale(${size / 1024})`,
          }}
        >
          {/* Base relief map */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${SHAPE_URL}')`,
              backgroundSize: "1024px 1024px",
            }}
          />

          {/* Magnifying glass — anchored at the path point, moved via transform */}
          <div
            ref={magRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              willChange: "transform",
              transform: `translate(${startX}px,${startY}px)`,
            }}
          >
            {/* Lens */}
            <div
              style={{
                position: "absolute",
                top: -110,
                left: -110,
                width: 220,
                height: 220,
                borderRadius: "50%",
                border: "22px solid #ffffff",
                boxSizing: "border-box",
                background: "#0b1c30",
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
              }}
            >
              <div
                ref={lensRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${SHAPE_URL}')`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${1024 * zoom}px ${1024 * zoom}px`,
                  backgroundPosition: `${-(startX * zoom - lensRadius)}px ${-(startY * zoom - lensRadius)}px`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  boxShadow: "inset 0 0 18px rgba(0,0,0,0.35)",
                  background:
                    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 42%)",
                }}
              />
            </div>

            {/* Handle */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: "rotate(-45deg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 100,
                  left: -24,
                  width: 48,
                  height: 118,
                  borderRadius: 24,
                  background: "#ffffff",
                  boxShadow: "0 8px 18px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2.5 uppercase"
        style={{ color: "#9fb3c8", fontSize: 15, letterSpacing: "0.16em" }}
      >
        <span>{label}</span>
        <span
          ref={dotsRef}
          style={{ display: "inline-block", width: 24, textAlign: "left" }}
        >
          …
        </span>
      </div>
    </div>
  );
}
