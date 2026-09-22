import { useEffect } from 'react';
import { useShader } from '../gl/useShader';
import { drive } from '../gl/audio';
import { useDrive, song, panelRequest } from '../gl/useDrive';
import { pickSource, playSong } from './Drive';
import { artist, demoTrack } from '../content';

export function Hero() {
  const ref = useShader('hero', { quality: 0.9, interactive: true, seed: 0.31 });

  // Ask for the room once the hero has had a moment to render, so the prompt lands
  // next to the line that explains it rather than on a blank page.
  useEffect(() => {
    const t = setTimeout(() => drive.autoStart(), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <header className="hero" id="top">
      <canvas ref={ref} className="hero-canvas" aria-hidden />
      <div className="hero-veil" />

      <div className="hero-inner wrap">
        <h1 className="wordmark">{artist.wordmark}</h1>
        <div className="hero-gloss">{artist.gloss}</div>

        <div className="hero-grid">
          <div>
            <div className="hero-tag">{artist.tagline}</div>
            <div className="hero-meta">
              <span className="label">{artist.based}</span>
              <span className="label">{artist.availability}</span>
            </div>
          </div>
          <p className="hero-blurb">{artist.blurb}</p>
        </div>

        <LiveCue />
      </div>
    </header>
  );
}

/**
 * The invitation. A visitor from a cold email doesn't know the page listens, so this
 * says so plainly and hands them the two ways to see it: sound, or the faders.
 */
function LiveCue() {
  const d = useDrive();
  const songOpen = song.use();
  const hearing = d.source === 'mic' && d.hearing;

  const line =
    d.trackPlaying ? `Everything on this page is moving with “${demoTrack?.title}” — read straight from the track.`
    : d.source === 'mic'
      ? d.needsTap ? 'This page listens to your room. Tap anywhere to let it hear.'
      : hearing ? 'It can hear you. Everything on this page is moving with the sound in your room.'
      : 'This page is listening. Play some music out loud, or clap — and watch it move.'
    : d.source === 'manual' ? 'You’re driving it. Drag the faders and every piece on the page follows.'
    : d.micError ? 'Running on a demo beat. The real thing reacts to sound — let it listen, or take the faders.'
    : 'This page reacts to sound. Allow the microphone and it will move with your room.';

  return (
    <div className={`hero-live ${hearing ? 'hearing' : ''}`} role="status">
      <div className="hero-live-line">
        <span className="live-dot" />
        <span>{line}</span>
      </div>
      <div className="hero-live-actions">
        {demoTrack && !songOpen && (
          <button className="cue-btn primary" onClick={playSong}>
            ▶ Play “{demoTrack.title}” — {demoTrack.artist}
          </button>
        )}
        {d.source !== 'mic' && (
          <button className="cue-btn" onClick={() => pickSource('mic')}>Let it listen</button>
        )}
        {d.source !== 'manual' ? (
          <button className="cue-btn" onClick={() => { pickSource('manual'); panelRequest.set(true); }}>Take the faders</button>
        ) : (
          <button className="cue-btn" onClick={() => pickSource('mic')}>Back to the room</button>
        )}
      </div>
      <span className="hero-live-fine">Sound is analysed on your device. Nothing is recorded or sent.</span>
    </div>
  );
}
