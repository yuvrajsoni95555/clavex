"use client";
import { useState } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { StudioEnvironment } from "./StudioEnvironment";

type Props = Omit<CanvasProps, "children"> & {
  children: React.ReactNode;
  /** false when off-screen: stops rendering entirely */
  active?: boolean;
  /** render only when something changes (reduced motion, idle viewers) */
  onDemand?: boolean;
};

/** Shared canvas setup for every 3D view: transparent, antialiased, pixel ratio 1–2, studio lighting. */
export function Scene3D({ children, active = true, onDemand = false, ...rest }: Props) {
  // start sharp; if the frame rate keeps dropping, render at 1×. The stone itself never downgrades:
  // its refraction only costs the few pixels it covers, and a cheap stand-in looked flat and grey.
  const [maxDpr, setMaxDpr] = useState(2);

  return (
    <Canvas
      dpr={[1, maxDpr]}
      frameloop={!active ? "never" : onDemand ? "demand" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      {...rest}
    >
      <PerformanceMonitor flipflops={2} onDecline={() => setMaxDpr(1)} onFallback={() => setMaxDpr(1)} />
      <StudioEnvironment>{children}</StudioEnvironment>
    </Canvas>
  );
}
