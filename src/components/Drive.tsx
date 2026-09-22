import { useEffect, useRef, useState } from 'react';
import { drive, type Source } from '../gl/audio';
import { useDrive, song, panelRequest } from '../gl/useDrive';
import { demoTrack } from '../content';

const BANDS = [
  ['Bass', 'bass'],
  ['Mid', 'mid'],
  ['Air', 'high'],
] as const;

const phone = () => window.matchMedia('(max-width: 720px)').matches;

/** Switch source from a click: remembers the choice, and asks for the mic inside the gesture. */
export async function pickSource(s: Source) {
  drive.remember(s);
  if (s === 'mic') { await drive.enableMic(); return; }
  if (drive.micReady) drive.disableMic();
  drive.setSource(s);
}

/** Open the demo track. It needs the mic to be heard, so ask in the same tap. */
export function playSong() {
  song.set(true);
  if (drive.source !== 'mic') pickSource('mic');
}

/**
 * The page's own control surface. It is the pitch in miniature: the same band
 * envelopes that drive a show are driving everything on screen, and a visitor can
 * take hold of them.
 */
export function Drive() {
  const d = useDrive();
  const source = d.source;
  const songOpen = song.use();
  const openReq = panelRequest.use();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hover, setHover] = useState(false);
  // 'auto' folds on scroll (always on a phone); 'open' / 'closed' are the visitor's call.
  const [mode, setMode] = useState<'auto' | 'open' | 'closed'>('auto');
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The hero cue asks for the panel (e.g. "take the faders").
  useEffect(() => {
    if (openReq) { setMode('open'); panelRequest.set(false); }
  }, [openReq]);

  // Full width over the hero on a desktop, where it is an invitation. On a phone the
  // hero carries the invitation itself, so the panel starts as a pill.
  const folded = mode === 'closed' || (mode === 'auto' && (scrolled || phone()) && !hover);

  const status =
    source === 'mic' ? (d.needsTap ? 'Tap anywhere to let it listen.' : d.hearing ? 'Hearing the room.' : 'Listening — play something out loud.')
    : source === 'manual' ? 'You have the faders. This is the surface a show is performed on.'
    : d.micError ? `${d.micError} Running on a synthetic 124 BPM beat.`
    : 'Synthetic 124 BPM beat. Switch to Room and the page listens to your audio.';

  return (
    <aside
      className={`drive ${hidden ? 'hidden' : ''} ${folded ? 'folded' : ''} ${source === 'mic' ? 'listening' : ''} ${d.hearing && source === 'mic' ? 'hearing' : ''}`}
      aria-label="Visual drive signal"
      onClick={() => { if (folded) setMode('open'); }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHover(false); }}
    >
      <div className="drive-top">
        <span className="label"><span className="drive-dot" />Drive</span>
        <div className="drive-src">
          {(['mic', 'demo', 'manual'] as Source[]).map((s) => (
            <button key={s} className={source === s ? 'on' : ''} onClick={() => { setMode('open'); pickSource(s); }}>
              {s === 'mic' ? 'Room' : s}
            </button>
          ))}
          <button
            className="drive-fold" aria-label="Fold panel"
            onClick={(e) => { e.stopPropagation(); setHover(false); setMode('closed'); }}
          >–</button>
        </div>
      </div>

      {songOpen && demoTrack && (
        <div className="drive-player">
          <div className="drive-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${demoTrack.youtubeId}?autoplay=1&playsinline=1&rel=0`}
              title={`${demoTrack.artist} — ${demoTrack.title}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="drive-player-row">
            <span className="drive-note">
              {source === 'mic'
                ? 'Play it out loud — the page hears it through the mic. On headphones it can’t.'
                : 'Switch to Room so the page can hear it.'}
            </span>
            <button className="drive-close" onClick={(e) => { e.stopPropagation(); song.set(false); }}>Close</button>
          </div>
        </div>
      )}

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

      <p className={`drive-note ${d.micError && source === 'demo' ? 'err' : ''}`}>{status}</p>

      {demoTrack && !songOpen && (
        <button className="drive-song" onClick={(e) => { e.stopPropagation(); playSong(); }}>
          ▶ Play {demoTrack.title.replace(/ \(.*\)$/, '')} — {demoTrack.artist}
        </button>
      )}
    </aside>
  );
}
