import { useEffect, useState } from 'react';
import { works, type Work } from '../content';
import { useShader } from '../gl/useShader';
import { Reveal } from './Reveal';

function Vis({ shader, seed, className }: { shader: string; seed: number; className?: string }) {
  const ref = useShader(shader, { quality: 0.55, seed });
  return <canvas ref={ref} className={className} aria-hidden />;
}

function Card({ work, i, onOpen }: { work: Work; i: number; onOpen: () => void }) {
  return (
    <Reveal delay={Math.min(i, 5) * 55}>
      <button className="work-card" onClick={onOpen} aria-label={`Open ${work.title}`}>
        <div className="work-vis">
          <Vis shader={work.key} seed={(i + 1) * 0.137} />
        </div>
        <div className="work-body">
          <div className="work-kicker">
            <span className="label">{work.kicker}</span>
            {work.duration && <span className="label">{work.duration}</span>}
          </div>
          <div className="work-title">{work.title}</div>
          <p className="work-line">{work.line}</p>
          <div className="tags">
            {work.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
          </div>
        </div>
      </button>
    </Reveal>
  );
}

function Sheet({ work, onClose }: { work: Work; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="sheet" onClick={onClose} role="dialog" aria-modal aria-label={work.title}>
      <div className="sheet-inner" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        <div className="sheet-vis">
          <Vis shader={work.key} seed={0.77} />
        </div>
        <div className="sheet-text">
          <span className="label">{work.kicker}{work.duration ? ` · ${work.duration}` : ''}</span>
          <h2 className="sheet-title">{work.title}</h2>
          <p className="sheet-line">{work.line}</p>
          <p className="sheet-body">{work.body}</p>
          <div className="tags">
            {work.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
          </div>
          <p className="sheet-tech">{work.tech}</p>
        </div>
      </div>
    </div>
  );
}

export function WorkSection() {
  const [open, setOpen] = useState<Work | null>(null);

  return (
    <section className="section" id="work">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Selected work · 01</span>
          <div>
            <h2 className="section-title">Twelve systems, none of them a loop.</h2>
            <p className="lede">
              Every tile below is running live in your browser right now — the real shader, driven by
              the same band signal a show runs on. They are sketches of the TouchDesigner pieces, not
              video of them. Open one to read what it actually does.
            </p>
          </div>
        </Reveal>

        <div className="work-grid">
          {works.map((w, i) => (
            <Card key={w.key} work={w} i={i} onOpen={() => setOpen(w)} />
          ))}
        </div>
      </div>

      {open && <Sheet work={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
