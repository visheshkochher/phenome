import { useEffect, useRef } from 'react';
import { pool, MAX_W, MAX_H, type Client } from './renderer';

export type ShaderOpts = {
  /** Backing-store scale. Cards look fine well under 1; the hero wants more. */
  quality?: number;
  /** Pointer tracking and full-rate rendering on hover. */
  interactive?: boolean;
  seed?: number;
};

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Binds a <canvas> to a shader in the shared pool. Handles sizing, visibility,
 * pointer state and teardown.
 */
export function useShader(key: string, opts: ShaderOpts = {}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { quality = 0.75, interactive = true, seed } = opts;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const client = pool.add(canvas, key, seed ?? Math.random());
    if (!client) { canvas.dataset.glUnsupported = 'true'; return; }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = quality * Math.min(dpr, 1.6);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      let w = Math.max(1, Math.round(r.width * scale));
      let h = Math.max(1, Math.round(r.height * scale));

      // The blit source is the shared GL canvas, so a backing store bigger than it
      // would leave the rest of this canvas unpainted — black bands on a large
      // display. Scale both axes by the same factor to keep the aspect honest.
      const fit = Math.min(1, MAX_W / w, MAX_H / h);
      w = Math.max(1, Math.round(w * fit));
      h = Math.max(1, Math.round(h * fit));

      if (w === client.w && h === client.h) return;
      canvas.width = w; canvas.height = h;
      client.w = w; client.h = h;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const still = reduced();
    const io = new IntersectionObserver(
      ([e]) => {
        if (still) {
          // Draw a handful of frames so the piece has a composed look, then hold.
          client.visible = e.isIntersecting;
          if (e.isIntersecting) setTimeout(() => { client.visible = false; }, 300);
        } else {
          client.visible = e.isIntersecting;
        }
      },
      { rootMargin: '120px' },
    );
    io.observe(canvas);

    const onEnter = () => { client.hot = true; };
    const onLeave = () => { client.hot = false; client.mouse = [0, 0]; };
    const onMove = (ev: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      client.mouse = [
        ((ev.clientX - r.left) / r.width) * 2 - 1,
        -(((ev.clientY - r.top) / r.height) * 2 - 1),
      ];
    };

    if (interactive && !still) {
      canvas.addEventListener('pointerenter', onEnter);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('pointermove', onMove);
    }

    const onHidden = () => { if (document.hidden) client.visible = false; };
    document.addEventListener('visibilitychange', onHidden);

    return () => {
      ro.disconnect(); io.disconnect();
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onHidden);
      pool.remove(client as Client);
    };
  }, [key, quality, interactive, seed]);

  return ref;
}
