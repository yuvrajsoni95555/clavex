"use client";
import { createContext, useContext, useState } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { StudioEnvironment } from "./StudioEnvironment";

/** true once the device has proved too slow: the stone switches to its cheaper fallback material */
const LowQuality = createContext(false);
export const useLowQuality = () => useContext(LowQuality);

type Props = Omit<CanvasProps, "children"> & {
  children: React.ReactNode;
  /** false when off-screen: stops rendering entirely */
  active?: boolean;
  /** render only when something changes (reduced motion, idle viewers) */
  onDemand?: boolean;
};

/** Shared canvas setup for every 3D view: transparent, antialiased, pixel ratio 1–2, studio lighting. */
export function Scene3D({ children, active = true, onDemand = false, ...rest }: Props) {
  // start sharp; if the frame rate keeps dropping, render at 1×, and if it still can't keep up, cheapen the stone
  const [maxDpr, setMaxDpr] = useState(2);
  const [low, setLow] = useState(false);

  return (
    <Canvas
      dpr={[1, maxDpr]}
      frameloop={!active ? "never" : onDemand ? "demand" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      {...rest}
    >
      <PerformanceMonitor
        flipflops={2}
        onDecline={() => setMaxDpr(1)}
        onFallback={() => {
          setMaxDpr(1);
          setLow(true);
        }}
      />
      <LowQuality.Provider value={low}>
        <StudioEnvironment>{children}</StudioEnvironment>
      </LowQuality.Provider>
    </Canvas>
  );
}
