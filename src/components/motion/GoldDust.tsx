"use client";
import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec4 a; // x, y, phase, size
uniform float t;
uniform float dpr;
out float tw;
void main() {
  // drift upward and wrap, with a slow sideways sway
  float y = mod(a.y + t * 0.012 * (0.5 + a.w), 2.2) - 1.1;
  float x = a.x + sin(t * 0.25 + a.z * 6.2831) * 0.03;
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = (1.0 + a.w * 2.2) * dpr;
  tw = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * (0.6 + a.w) + a.z * 40.0), 3.0); // twinkle
}`;

const FRAG = `#version 300 es
precision mediump float;
in float tw;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * tw * 0.7;
  o = vec4(vec3(0.79, 0.66, 0.43) * a, a); // champagne gold, premultiplied
}`;

/**
 * Ambient gold dust drawn by the GPU: one tiny raw-WebGL2 canvas, a single draw call, no three.js.
 * Sits behind a section's content; pauses off-screen; absent for reduced-motion visitors.
 */
export function GoldDust({ count = 90 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    const n = window.matchMedia("(max-width: 767px)").matches ? Math.round(count / 2) : count;

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return; // no dust is better than a broken canvas
    gl.useProgram(prog);

    const data = new Float32Array(n * 4).map((_, i) => (i % 4 < 2 ? Math.random() * 2.2 - 1.1 : Math.random()));
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const uT = gl.getUniformLocation(prog, "t");
    const uDpr = gl.getUniformLocation(prog, "dpr");

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let visible = false;
    const start = performance.now();
    const frame = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.uniform1f(uDpr, dpr);
      gl.drawArrays(gl.POINTS, 0, n);
      if (visible) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      // no loseContext() here: StrictMode re-runs this effect on the same canvas, which would get the dead context back
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
