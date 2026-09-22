import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Drive } from './components/Drive';
import { WorkSection } from './components/Work';
import { Instagram } from './components/Instagram';
import { Reveal } from './components/Reveal';
import { useShader } from './gl/useShader';
import {
  artist, about, thesis, lineage, formats, rig, shows, press, assets, emptyStates,
  type Asset,
} from './content';

/** Editing hints belong to whoever is running the dev server, never to a visitor. */
const DEV = import.meta.env.DEV;

function FormatVis({ shader, i }: { shader: string; i: number }) {
  const ref = useShader(shader, { quality: 0.5, seed: 0.4 + i * 0.09 });
  return <div className="fmt-vis"><canvas ref={ref} aria-hidden /></div>;
}

function Thesis() {
  return (
    <section className="section" id="thesis">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Position · 00</span>
          <div>
            <h2 className="section-title">What makes it different, in three claims.</h2>
          </div>
        </Reveal>

        <div className="thesis-list">
          {thesis.map((t, i) => (
            <Reveal key={t.n} delay={i * 80} className="thesis-row">
              <span className="label">{t.n}</span>
              <h3 className="thesis-head">{t.head}</h3>
              <p className="thesis-body">{t.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">The artist · 02</span>
          <div>
            <h2 className="section-title">{about.head}</h2>
            <p className="lede">{about.intro}</p>
          </div>
        </Reveal>

        <div className="about">
          <Reveal className="about-body">
            {about.body.map((p) => <p key={p}>{p}</p>)}
          </Reveal>
          <Reveal className="about-facts" delay={100}>
            <dl>
              {about.facts.map((f) => (
                <div key={f.k}>
                  <dt className="label">{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Lineage() {
  return (
    <section className="section" id="lineage">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Lineage · 03</span>
          <div>
            <h2 className="section-title">{lineage.head}</h2>
            <p className="lede">{lineage.intro}</p>
          </div>
        </Reveal>

        <Reveal className="lineage">
          {lineage.rows.map((r) => (
            <div className={`lin-row ${r.self ? 'self' : ''}`} key={r.who}>
              <div className="lin-who">{r.who}</div>
              <div className="lin-what">{r.what}</div>
              <div className="lin-how">{r.how}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className="coda" delay={120}>
          <h3 className="coda-head">{lineage.coda.head}</h3>
          <p className="coda-body">{lineage.coda.body}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Formats() {
  return (
    <section className="section" id="formats">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Booking · 04</span>
          <div>
            <h2 className="section-title">Five things you can book.</h2>
            <p className="lede">
              The same engine underneath, pointed at a different surface. Anything here can be built
              around a specific artist, room or brief rather than pulled off a shelf.
            </p>
          </div>
        </Reveal>

        <div className="formats">
          {formats.map((f, i) => (
            <Reveal key={f.n} delay={i * 60} className="fmt">
              <span className="label">{f.n}</span>
              <div>
                <h3 className="fmt-title">{f.title}</h3>
                <p className="fmt-line">{f.line}</p>
              </div>
              <ul className="fmt-bullets">
                {f.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
              <FormatVis shader={f.shader} i={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rig() {
  return (
    <section className="section" id="rig">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Technical · 05</span>
          <div>
            <h2 className="section-title">{rig.head}</h2>
            <p className="lede">{rig.intro}</p>
          </div>
        </Reveal>

        <Reveal className="rig-grid">
          {rig.groups.map((g) => (
            <div className="rig-cell" key={g.title}>
              <span className="label">{g.title}</span>
              <h3>{g.head}</h3>
              <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </Reveal>

        <Reveal className="needs" delay={100}>
          <div className="rig-cell">
            <span className="label">I need</span>
            <h3>From the venue</h3>
            <ul>{rig.needs.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
          <div className="rig-cell">
            <span className="label">I bring</span>
            <h3>Everything else</h3>
            <ul>{rig.brings.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Shows() {
  return (
    <section className="section" id="shows">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Live · 06</span>
          <div>
            <h2 className="section-title">Shows &amp; press.</h2>
          </div>
        </Reveal>

        {shows.length > 0 ? (
          <Reveal className="rows">
            {shows.map((s) => (
              <div className="row-item" key={`${s.year}-${s.name}`}>
                <span className="label">{s.year}</span>
                <div className="row-name">{s.name}</div>
                <div className="row-venue">
                  {s.venue}
                  {s.note && <span className="row-note">{s.note}</span>}
                </div>
              </div>
            ))}
          </Reveal>
        ) : (
          <Reveal className="empty">
            <h3>{emptyStates.shows.head}</h3>
            <p>{emptyStates.shows.body}</p>
            {DEV && <p><code>shows</code> in <code>src/content.ts</code> — year, night, venue, what you played.</p>}
          </Reveal>
        )}

        <div className="press-anchor" id="press" />

        {press.length > 0 ? (
          <Reveal className="rows">
            {press.map((p) => (
              <a className="row-item" href={p.url} key={p.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <span className="label">{p.date ?? ''}</span>
                <div className="row-name">{p.outlet}</div>
                <div className="row-venue">{p.headline}</div>
              </a>
            ))}
          </Reveal>
        ) : (
          <Reveal className="empty" delay={80}>
            <h3>{emptyStates.press.head}</h3>
            <p>{emptyStates.press.body}</p>
            {DEV && <p><code>press</code> in <code>src/content.ts</code> — outlet, headline, link.</p>}
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** #press is an in-page jump, https:// opens a tab, anything else is a file. */
function AssetCard({ a }: { a: Asset }) {
  if (!a.href) {
    return (
      <div className="asset is-disabled" aria-disabled="true">
        <h3>{a.label}</h3>
        <p>{a.note}</p>
        <span className="state">Coming soon</span>
      </div>
    );
  }

  const internal = a.href.startsWith('#');
  const external = /^https?:\/\//.test(a.href);

  return (
    <a
      className="asset ready"
      href={a.href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...(!internal && !external ? { download: true } : {})}
    >
      <h3>{a.label}</h3>
      <p>{a.note}</p>
      <span className="state">{internal ? 'Jump to' : external ? 'Open' : 'Download'}</span>
    </a>
  );
}

function Assets() {
  return (
    <section className="section" id="assets">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Downloads · 08</span>
          <div>
            <h2 className="section-title">Everything a programmer needs to say yes.</h2>
          </div>
        </Reveal>

        <Reveal className="assets">
          {assets.map((a) => <AssetCard key={a.label} a={a} />)}
        </Reveal>
      </div>
    </section>
  );
}

function Contact() {
  const ref = useShader('hero', { quality: 0.6, seed: 0.9, interactive: false });

  return (
    <section className="contact" id="contact">
      <canvas ref={ref} className="contact-canvas" aria-hidden />
      <div className="contact-veil" />
      <div className="contact-inner wrap">
        <span className="label">Contact · 09</span>
        <h2 className="contact-big">
          Tell me the room<br />and the record.
        </h2>

        <div className="contact-links">
          <a href={artist.instagramUrl} target="_blank" rel="noreferrer">
            <span className="label">Instagram</span>
            <span className="v">@{artist.instagram}</span>
          </a>
          <a href={`mailto:${artist.email}`}>
            <span className="label">Booking</span>
            <span className="v">{artist.email}</span>
          </a>
          <span>
            <span className="label">Based</span>
            <span className="v">{artist.based}</span>
          </span>
        </div>

        <div className="foot">
          <span className="label">{artist.name} · {about.name} · press kit · 2026</span>
          <span className="label">Every visual on this page is generated live</span>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <main>
        <Thesis />
        <WorkSection />
        <About />
        <Lineage />
        <Formats />
        <Rig />
        <Shows />
        <Instagram />
        <Assets />
      </main>
      <Contact />
      <Drive />
    </>
  );
}
