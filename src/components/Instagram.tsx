import { useEffect, useRef, useState } from 'react';
import { instagramFeed, type InstaPost } from '../content';
import { Reveal } from './Reveal';

const EMBED_SCRIPT = 'https://www.instagram.com/embed.js';

/**
 * Instagram's embed script scans the DOM once, when it first loads. Anything React
 * renders afterwards stays an inert blockquote until `Embeds.process()` is called
 * again, so we load the script exactly once and re-process on every mount.
 */
let scriptLoad: Promise<void> | null = null;

function loadEmbedScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.instgrm) return Promise.resolve();
  if (scriptLoad) return scriptLoad;

  scriptLoad = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT}"]`);
    const el = existing ?? document.createElement('script');
    el.addEventListener('load', () => resolve());
    // Blocked by an extension, a CSP, or offline — the fallback link carries the section.
    el.addEventListener('error', () => reject(new Error('instagram embed blocked')));
    if (!existing) {
      el.src = EMBED_SCRIPT;
      el.async = true;
      document.body.appendChild(el);
    }
  }).catch((e) => {
    scriptLoad = null;        // let a later mount retry
    throw e;
  });

  return scriptLoad;
}

/**
 * One embed slot. Holds a fixed aspect while it is empty so the page does not jump,
 * then releases the ratio once Instagram has swapped in its iframe (which is taller
 * than any ratio we would pick, because of the caption).
 */
function Embed({ post, featured = false }: { post: InstaPost; featured?: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const url = post.url!;

  useEffect(() => {
    const el = slot.current;
    if (!el) return;

    // The iframe arrives asynchronously after process(); watch for it rather than
    // guessing at a delay.
    const mo = new MutationObserver(() => {
      if (el.querySelector('iframe')) { setLoaded(true); mo.disconnect(); }
    });
    mo.observe(el, { childList: true, subtree: true });

    let cancelled = false;
    loadEmbedScript()
      .then(() => { if (!cancelled) window.instgrm?.Embeds.process(); })
      .catch(() => { /* fallback link is already rendered underneath */ });

    return () => { cancelled = true; mo.disconnect(); };
  }, [url]);

  return (
    <div ref={slot} className={`ig-slot ${featured ? 'featured' : ''} ${loaded ? 'is-loaded' : ''}`}>
      <a className="ig-fallback" href={url} target="_blank" rel="noreferrer">
        <span className="ig-mark" aria-hidden />
        <span className="ig-fallback-label">View on Instagram</span>
        {post.caption && <span className="ig-fallback-cap">{post.caption}</span>}
      </a>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        data-instgrm-captioned={featured ? '' : undefined}
      />
    </div>
  );
}

export function Instagram() {
  const { latestReel, recentPosts, handle, profileUrl } = instagramFeed;

  const featured = latestReel?.url ? latestReel : null;
  const recent = recentPosts.filter((p): p is InstaPost & { url: string } => Boolean(p.url));
  const hasAny = Boolean(featured) || recent.length > 0;

  return (
    <section className="section" id="instagram">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="label">Recent · 06</span>
          <div>
            <h2 className="section-title">What it looks like in a room.</h2>
            <p className="lede">
              Clips from recent shows and studio work. The newest is first — everything else lives
              on <a className="inline-link" href={profileUrl} target="_blank" rel="noreferrer">@{handle}</a>.
            </p>
          </div>
        </Reveal>

        {hasAny ? (
          <>
            {featured && (
              <Reveal className="ig-featured">
                <Embed post={featured} featured />
                {featured.caption && <p className="ig-caption">{featured.caption}</p>}
              </Reveal>
            )}

            {recent.length > 0 && (
              <Reveal className="ig-row" delay={80}>
                {recent.map((p) => <Embed key={p.url} post={p} />)}
              </Reveal>
            )}
          </>
        ) : (
          <Reveal className="empty">
            <h3>The reel lives on Instagram.</h3>
            <p>
              Clips from recent shows are posted there rather than mirrored here.
            </p>
            <p>
              <a className="inline-link" href={profileUrl} target="_blank" rel="noreferrer">
                @{handle} →
              </a>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
