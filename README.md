# phenome — interactive press kit

A React site whose centrepiece is the work itself: thirteen live WebGL shaders, one per
piece in the catalogue, all driven by the same band-envelope signal a real show runs on.
A booker opening the page is watching the craft, not a description of it.

```
src/content.ts        ← ALL copy, credits and asset links live here
src/gl/shaders.ts     one fragment shader per piece
src/gl/renderer.ts    one shared WebGL context for the whole page
src/gl/audio.ts       the drive signal: synthetic / microphone / manual
.github/workflows/    build + publish to GitHub Pages
```

## Run it

Needs Node 20+.

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # → dist/
```

## Edit it

**Everything you will want to change is in `src/content.ts`.** Nothing else needs touching
to keep the kit current.

| What | Where |
|---|---|
| Booking address (currently `TODO@example.com`) | `artist.email` |
| Tagline, blurb, availability | `artist` |
| The three positioning claims | `thesis` |
| Piece titles, one-liners, long copy, tags | `works` |
| The Anadol / Max Cooper comparison | `lineage` |
| What you can be booked for | `formats` |
| Technical rider content | `rig` |
| Show history | `shows` — year, name, venue, optional `note`. Empty renders an honest in-progress panel |
| Press | `press` — same |
| Instagram | `instagramFeed` — see below |
| Downloads | `assets` — see below |

Empty `shows` / `press` never show filler, and the "add it to content.ts" hint only appears
on the dev server, never to a visitor. The kit is safe to send at any point.

### Instagram

`instagramFeed.latestReel` is the large featured embed; `instagramFeed.recentPosts` is the
row of three underneath (they stack on mobile). Paste post or reel permalinks, e.g.
`https://www.instagram.com/p/XXXXXXXXX/`.

An entry whose `url` is `null` is skipped, so a half-filled list never shows a broken
embed. If everything is `null`, the section collapses to a single link to `profileUrl`
instead of rendering empty.

Each embed sits in a fixed-aspect slot with a **View on Instagram** link behind it, so the
section still works if an extension, a tracker blocker or a CSP stops the embed script.
The slot releases its aspect ratio once Instagram's iframe arrives, since the real embed is
taller than any ratio worth reserving.

**There is currently no Content-Security-Policy on this site.** If you add one (on GitHub
Pages that means a `<meta http-equiv="Content-Security-Policy">` in `index.html`, since you
cannot set headers), it must allow:

```
script-src  https://www.instagram.com
frame-src   https://www.instagram.com
```

Instagram's embed script also pulls styles and images from `*.cdninstagram.com`, so
`img-src` and `style-src` need it too.

### Downloads

Each `assets` entry renders one of three ways, from its `href`:

| `href` | Renders as |
|---|---|
| `null` | dimmed, "Coming soon", not a link |
| `#press`, `#work`, … | in-page jump, "Jump to" |
| `https://…` | opens in a new tab, "Open" |
| anything else (`rider.pdf`) | a download from `public/`, "Download" |

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. The repo must
be **public** — Pages on private repos needs a paid plan.

**Required once, by hand: Settings → Pages → Source = GitHub Actions.** The workflow
cannot do this for you — the Actions token is allowed to deploy to an existing Pages site
but not to create one, so until the toggle is set every run fails at `configure-pages`
with `Resource not accessible by integration`. Set it, then re-run the job from the
Actions tab.

`BASE_PATH` is set to `/<repo-name>/` automatically, which is what a project page needs.

### Moving to a custom domain

1. Put the domain in a `CNAME` file in `public/` (one line, no protocol).
2. Change `BASE_PATH` in the workflow from `/${{ github.event.repository.name }}/` to `/`.
3. Point your DNS at GitHub, then set the domain under Settings → Pages.

The social preview is `public/og.jpg` (regenerate any time by screenshotting the hero at
1200×630). Most scrapers want an absolute URL, so once the domain is settled, make the
`og:image` in `index.html` the full `https://…/og.jpg`.

## How the live rendering works

Thirteen live shaders would mean thirteen WebGL contexts, and browsers evict them after
about sixteen. Instead `renderer.ts` keeps **one** context: each piece renders into a
viewport-sized corner of a single offscreen canvas and is blitted to its own 2D canvas.
Pieces off screen do not render at all; on-screen ones share a budget of two redraws per
frame, round-robin, and whatever the pointer is on gets every frame. `prefers-reduced-motion`
draws a few frames and then holds a still.

`audio.ts` is the same shape as the real rig — band envelopes with fast attack and slow
release, never raw amplitude. Three sources: the visitor's microphone (**asked for on load** —
a visitor from a cold email won't go looking for a switch), a synthetic 124 BPM pattern with a
16-bar build, and manual faders. If the mic is refused or missing, the page runs on the demo
beat and the hero says so. In a quiet room the demo beat fills in softly until the mic hears
something, so the page never looks dead. An explicit choice of Demo or Manual is remembered, so
a reload doesn't ask again.

The hero carries a plain-language cue ("This page is listening…") with buttons to play a track,
allow the mic, or take the faders. The track is `demoTrack` in `content.ts` (YouTube, embed
allowed; `null` removes it). The page can't read the iframe's audio because it comes from
another origin. It hears the track the way it hears a club, through the mic off the speakers,
so it does nothing on headphones.

## Assets that would make this stronger

Listed hardest-hitting first. Everything here has a place already prepared in `content.ts`.

1. **A 60–90 second showreel, cut to one track.** The single highest-value asset. Real
   footage of projections on a real wall with a real crowd beats any shader. Drop it in
   `public/`, point `assets[3].href` at it, and it can also become a hero background.
2. **Photographs of installed work** — the projection on the wall, the mapped surface, the
   LED screen, the room with people in it. Wide, and shot from where the audience stood.
   Phone footage is fine; the room is the proof, not the resolution.
3. **Screen captures of each piece running**, 1080p, 10–20 seconds each. These would sit
   behind the shader tiles as video, with the shader as the poster frame.
4. **One good photograph of you**, working — hands on the controller, screens lit. The
   reference kit is 60% artist portrait; a visual artist's kit needs one human anchor.
5. **The real show list**: every date, venue and artist you have played for, however small.
   This is the section a promoter scrolls to first.
6. **The technical rider as a one-page PDF** — the `rig` section already contains its
   content, so this is a formatting job.
7. **A before/after of a mapped surface** — the bare wall, then the wall running. The
   clearest possible demonstration of what you do.
8. **Any quote at all** from a promoter, artist or venue you have worked with.
