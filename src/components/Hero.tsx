import { useShader } from '../gl/useShader';
import { artist } from '../content';

export function Hero() {
  const ref = useShader('hero', { quality: 0.9, interactive: true, seed: 0.31 });

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
      </div>

      <div className="scroll-cue">
        <span className="bar" />
        <span className="label">This is running live</span>
      </div>
    </header>
  );
}
