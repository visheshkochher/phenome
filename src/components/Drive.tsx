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

const trackUrl = demoTrack ? import.meta.env.BASE_URL + demoTrack.src : '';

/** Open and start the demo track. Must run inside the click, or phones won't play it. */
export function playSong() {
  if (!demoTrack) return;
  drive.playTrack(trackUrl);
  song.set(true);
  panelRequest.set(true);
}

function closeSong() {
  drive.stopTrack();
  song.set(false);
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Play/pause, progress and the credit. The page reacts to the track itself, not the mic. */
function TrackPlayer({ track, playing }: { track: NonNullable<typeof demoTrack>; playing: boolean }) {
  const bar = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = drive.track;
      if (!el || !bar.current || !time.current) return;
      const d = el.duration || 0;
      bar.current.style.transform = `scaleX(${d ? (el.currentTime / d).toFixed(4) : 0})`;
      time.current.textContent = clock(el.currentTime) + (d ? ` / ${clock(d)}` : '');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = drive.track;
    if (!el?.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * el.duration;
  };

  return (
    <div className="track">
      <div className="track-row">
        <button
          className="track-toggle" aria-label={playing ? 'Pause' : 'Play'}
          onClick={(e) => { e.stopPropagation(); if (playing) drive.pauseTrack(); else drive.playTrack(trackUrl); }}
        >{playing ? '❚❚' : '▶'}</button>
        <div className="track-meta">
          <span className="track-title">{track.title}</span>
          <span className="track-artist">{track.artist}</span>
        </div>
        <span className="track-time" ref={time} />
      </div>
      <div className="track-bar" onPointerDown={(e) => { e.stopPropagation(); seek(e); }}>
        <div className="track-fill" ref={bar} />
      </div>
      <p className="track-credit">
        {track.credit} · <a href={track.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Full track ↗</a>
      </p>
    </div>
  );
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
    d.trackPlaying ? `Driven by “${demoTrack?.title}”. Pause it and the switch below takes over again.`
    : source === 'mic' ? (d.needsTap ? 'Tap anywhere to let it listen.' : d.hearing ? 'Hearing the room.' : 'Listening — play something out loud.')
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
          <TrackPlayer track={demoTrack} playing={d.trackPlaying} />
          <div className="drive-player-row">
            <span className="drive-note">The page is reading the track directly — headphones are fine.</span>
            <button className="drive-close" onClick={(e) => { e.stopPropagation(); closeSong(); }}>Close</button>
          </div>
        </div>
      )}

      {BANDS.map(([label, key], i) => (
        <div className="meter" key={key}>
          <span className="label">{label}</span>
          {source === 'manual' && !d.trackPlaying ? (
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
          ▶ Play “{demoTrack.title}” — {demoTrack.artist}
        </button>
      )}
    </aside>
  );
}
