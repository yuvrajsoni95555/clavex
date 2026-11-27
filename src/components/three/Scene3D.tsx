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
  lite?: boolean;
};

/** Shared canvas setup for every 3D view: transparent, capped pixel ratio, studio lighting. */
export function Scene3D({ children, active = true, onDemand = false, lite = false, ...rest }: Props) {
  // start sharp; if the frame rate keeps dropping, render at 1× so the motion stays smooth
  const [maxDpr, setMaxDpr] = useState(lite ? 1.5 : 2);

  return (
    <Canvas
      dpr={[1, maxDpr]}
      frameloop={!active ? "never" : onDemand ? "demand" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      {...rest}
    >
      <PerformanceMonitor onDecline={() => setMaxDpr(1)} flipflops={2} onFallback={() => setMaxDpr(1)} />
      <StudioEnvironment>{children}</StudioEnvironment>
    </Canvas>
  );
}
