import { useEffect, useRef, useState } from 'react';
import { drive, type Source } from '../gl/audio';

const BANDS = [
  ['Bass', 'bass'],
  ['Mid', 'mid'],
  ['Air', 'high'],
] as const;

/**
 * The page's own control surface. It is the pitch in miniature: the same band
 * envelopes that drive a show are driving everything on screen, and a visitor can
 * take hold of them.
 */
export function Drive() {
  const [source, setSource] = useState<Source>('demo');
  const [err, setErr] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [folded, setFolded] = useState(false);
  const [pinned, setPinned] = useState(false);   // the visitor touched it — stop folding
  const fills = useRef<(HTMLDivElement | null)[]>([]);

  // Read the live band values straight off the drive each frame — no React state in
  // the hot path.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = [drive.bands.bass, drive.bands.mid, drive.bands.high];
      fills.current.forEach((el, i) => {
        if (el) el.style.transform = `scaleX(${Math.min(1, v[i]).toFixed(3)})`;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Tuck the panel away over the contact block so it never covers the address.
  useEffect(() => {
    const el = document.getElementById('contact');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Full width over the hero, where it is an invitation. Folds to a pill once the
  // visitor is reading, so it never sits on top of the work.
  useEffect(() => {
    if (pinned) { setFolded(false); return; }
    const onScroll = () => setFolded(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pinned]);

  const pick = async (s: Source) => {
    if (s === 'mic') {
      const ok = await drive.enableMic();
      setErr(ok ? null : drive.micError);
      setSource(ok ? 'mic' : 'demo');
      return;
    }
    if (drive.micReady) drive.disableMic();
    drive.source = s;
    setSource(s);
    setErr(null);
  };

  return (
    <aside
      className={`drive ${hidden ? 'hidden' : ''} ${folded ? 'folded' : ''}`}
      aria-label="Visual drive signal"
      onClick={() => { if (folded) { setPinned(true); setFolded(false); } }}
      onMouseEnter={() => setFolded(false)}
      onMouseLeave={() => { if (!pinned) setFolded(window.scrollY > window.innerHeight * 0.6); }}
    >
      <div className="drive-top">
        <span className="label">Drive</span>
        <div className="drive-src">
          {(['demo', 'mic', 'manual'] as Source[]).map((s) => (
            <button key={s} className={source === s ? 'on' : ''} onClick={() => { setPinned(true); pick(s); }}>
              {s === 'mic' ? 'Room' : s}
            </button>
          ))}
        </div>
      </div>

      {BANDS.map(([label, key], i) => (
        <div className="meter" key={key}>
          <span className="label">{label}</span>
          {source === 'manual' ? (
            <input
              type="range" min={0} max={1} step={0.01}
              defaultValue={drive.manual[key]}
              onChange={(e) => { drive.manual[key] = Number(e.target.value); }}
              aria-label={`${label} level`}
            />
          ) : (
            <div className="meter-track">
              <div className="meter-fill" ref={(el) => { fills.current[i] = el; }} />
            </div>
          )}
        </div>
      ))}

      <p className={`drive-note ${err ? 'err' : ''}`}>
        {err
          ? err
          : source === 'mic'
            ? 'Listening. Play something — every piece on this page is reacting to it.'
            : source === 'manual'
              ? 'You have the faders. This is the surface a show is performed on.'
              : 'Synthetic 124 BPM with a 16-bar build. Switch to Room to use your own audio.'}
      </p>
    </aside>
  );
}
