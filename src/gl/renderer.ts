// One WebGL context for the whole page.
//
// A dozen live shaders means a dozen contexts if you do the naive thing, and browsers
// cap you at ~16 before they start evicting. Instead: one offscreen GL canvas, each
// piece renders into a viewport-sized corner of it and is blitted to its own 2D
// canvas. Off-screen pieces do not render at all; on-screen ones share a per-frame
// budget round-robin, and whatever the pointer is on gets every frame.

import { PRELUDE, EPILOGUE, VERT } from './prelude';
import { SHADERS } from './shaders';
import { drive } from './audio';

/** The shared GL canvas. No client may ask for a backing store larger than this. */
export const MAX_W = 2048;
export const MAX_H = 1280;
const BUDGET = 2; // background pieces redrawn per frame

type Uni = Record<string, WebGLUniformLocation | null>;

export type Client = {
  id: number;
  key: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  seed: number;
  dpr: number;
  visible: boolean;
  hot: boolean;              // pointer is over it — render every frame
  mouse: [number, number];
  w: number;
  h: number;
};

class Pool {
  private gl: WebGLRenderingContext | null = null;
  private glCanvas: HTMLCanvasElement | null = null;
  private progs = new Map<string, { p: WebGLProgram; u: Uni }>();
  private clients: Client[] = [];
  private nextId = 1;
  private cursor = 0;
  private raf = 0;
  private last = 0;
  private t0 = 0;
  /** Null until the first init attempt; false means this browser cannot run the page's GL. */
  supported: boolean | null = null;

  private init(): boolean {
    if (this.supported !== null) return this.supported;
    const c = document.createElement('canvas');
    c.width = MAX_W; c.height = MAX_H;
    const gl = (c.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' }) ||
      c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) { this.supported = false; return false; }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    c.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.progs.clear();
      this.supported = false;
      cancelAnimationFrame(this.raf); this.raf = 0;
    });

    this.gl = gl; this.glCanvas = c; this.supported = true;
    this.t0 = performance.now() / 1000;
    return true;
  }

  private compile(key: string) {
    const gl = this.gl!;
    const body = SHADERS[key] ?? SHADERS.hero;
    const fsSrc = PRELUDE + body + EPILOGUE;

    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(`[phenome] shader "${key}" failed:\n`, gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = mk(gl.VERTEX_SHADER, VERT);
    const fs = mk(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;

    const p = gl.createProgram()!;
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(`[phenome] link "${key}" failed:`, gl.getProgramInfoLog(p));
      return null;
    }
    const loc = gl.getAttribLocation(p, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u: Uni = {};
    for (const n of ['u_res', 'u_time', 'u_mouse', 'u_bass', 'u_mid', 'u_high', 'u_hit', 'u_seed'])
      u[n] = gl.getUniformLocation(p, n);

    const entry = { p, u };
    this.progs.set(key, entry);
    return entry;
  }

  add(canvas: HTMLCanvasElement, key: string, seed = Math.random()): Client | null {
    if (!this.init()) return null;
    const client: Client = {
      id: this.nextId++, key, canvas,
      ctx: canvas.getContext('2d'),
      seed, dpr: 1, visible: false, hot: false, mouse: [0, 0], w: 0, h: 0,
    };
    this.clients.push(client);
    this.start();
    return client;
  }

  remove(client: Client) {
    this.clients = this.clients.filter((c) => c !== client);
    if (!this.clients.length) { cancelAnimationFrame(this.raf); this.raf = 0; }
  }

  private start() {
    if (this.raf) return;
    this.last = performance.now() / 1000;
    const tick = () => {
      this.raf = requestAnimationFrame(tick);
      this.frame();
    };
    this.raf = requestAnimationFrame(tick);
  }

  private frame() {
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - this.last);
    this.last = now;
    const t = now - this.t0;
    drive.update(t, dt);

    const live = this.clients.filter((c) => c.visible && c.w > 0 && c.h > 0);
    if (!live.length) return;

    const hot = live.filter((c) => c.hot);
    const cold = live.filter((c) => !c.hot);

    const todo = [...hot];
    for (let i = 0; i < Math.min(BUDGET, cold.length); i++) {
      todo.push(cold[(this.cursor + i) % cold.length]);
    }
    this.cursor = cold.length ? (this.cursor + BUDGET) % cold.length : 0;

    for (const c of todo) this.draw(c, t);
  }

  private draw(c: Client, t: number) {
    const gl = this.gl!;
    const entry = this.progs.get(c.key) ?? this.compile(c.key);
    if (!entry) return;

    const w = Math.min(c.w, MAX_W), h = Math.min(c.h, MAX_H);
    gl.useProgram(entry.p);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(entry.u.u_res, w, h);
    gl.uniform1f(entry.u.u_time, t);
    gl.uniform2f(entry.u.u_mouse, c.mouse[0], c.mouse[1]);
    gl.uniform1f(entry.u.u_bass, drive.bands.bass);
    gl.uniform1f(entry.u.u_mid, drive.bands.mid);
    gl.uniform1f(entry.u.u_high, drive.bands.high);
    gl.uniform1f(entry.u.u_hit, drive.bands.hit);
    gl.uniform1f(entry.u.u_seed, c.seed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // GL's origin is bottom-left; drawImage reads from the top. Take the bottom strip.
    c.ctx?.drawImage(this.glCanvas!, 0, MAX_H - h, w, h, 0, 0, w, h);
  }
}

export const pool = new Pool();
