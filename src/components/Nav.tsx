import { useEffect, useState } from 'react';
import { artist } from '../content';

const LINKS = [
  ['Work', '#work'],
  ['About', '#about'],
  ['Lineage', '#lineage'],
  ['Formats', '#formats'],
  ['Rig', '#rig'],
  ['Recent', '#instagram'],
  ['Contact', '#contact'],
] as const;

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav ${solid ? 'solid' : ''}`}>
      <a className="nav-mark" href="#top">
        <span className="nav-dot" />
        {artist.name}
      </a>
      <div className="nav-links">
        {LINKS.map(([label, href]) => (
          <a key={href} href={href}>{label}</a>
        ))}
        <a href={artist.instagramUrl} target="_blank" rel="noreferrer">@{artist.instagram}</a>
      </div>
    </nav>
  );
}
