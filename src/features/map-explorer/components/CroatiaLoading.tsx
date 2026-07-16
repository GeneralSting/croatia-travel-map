"use client";

import { useRef } from "react";
import { SEARCH_PATH, SHAPE_URL } from "@/features/map-explorer/constants/searchPath";
import { useCroatiaLoadingAnimation } from "@/features/map-explorer/hooks/useCroatiaAnimation";

interface CroatiaLoadingProps {
  size?: number;
  speed?: number;
  zoom?: number;
  label?: string;
}

export default function CroatiaLoading({
  size = 220,
  speed = 1,
  zoom = 2.2,
  label = "Loading",
}: CroatiaLoadingProps) {
  const magnifierRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLSpanElement>(null);

  const [startX, startY] = SEARCH_PATH[0];
  const lensRadius = 88; // lens interior radius (220/2 - 22 border)

  // Trigger our custom animation loop hook
  useCroatiaLoadingAnimation({
    magnifierRef,
    lensRef,
    dotsRef,
    speed,
    zoom,
    lensRadius,
  });

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

          {/* Magnifying glass */}
          <div
            ref={magnifierRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              willChange: "transform",
              transform: `translate(${startX}px, ${startY}px)`,
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
