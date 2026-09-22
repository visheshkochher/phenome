// ─────────────────────────────────────────────────────────────────────────────
// EVERYTHING EDITABLE LIVES HERE.
//
// Anything marked TODO is a placeholder. Nothing invented is presented as fact:
// empty arrays render as a deliberate "in progress" state rather than as filler,
// so the kit is always safe to send.
// ─────────────────────────────────────────────────────────────────────────────

export const artist = {
  name: 'phenome',
  wordmark: 'phenome',
  // A phenome is the full set of traits an organism actually expresses. The whole
  // practice is in the word: visible form emerging from underlying rules.
  gloss: 'phe·nome  /ˈfiːnəʊm/ — the complete set of traits a system expresses',
  tagline: 'Live simulation, played to the room.',
  blurb:
    'I build visual systems in TouchDesigner and play them live, standing next to the DJ, ' +
    'reacting to whatever the room is hearing. Clubs, galleries, walls, the occasional festival.',
  based: 'New Delhi, India',
  instagram: 'projektphenome',
  instagramUrl: 'https://instagram.com/projektphenome',
  email: 'vishesh.kochher@gmail.com',
  availability: 'New Delhi · formed in Berlin · happy to travel',
};

export const thesis = [
  {
    n: '01',
    head: 'Not loops. Pieces that go somewhere.',
    body:
      'A loop is a screensaver with a beat detector. Every phenome piece is a simulation with a ' +
      'first state and a last one: a material that will eventually fracture, a wall that will ' +
      'eventually be a garden, a zoom that travels from a fungal filament to the cosmic web and ' +
      'closes. The night gets an arc because the visuals have one.',
  },
  {
    n: '02',
    head: 'The room is the input.',
    body:
      'Nothing is pre-rendered. A mic listens to the room, and kick, bass and air push the piece ' +
      'forward rather than just flashing it. I move between chapters by hand, on the cues, so the ' +
      'DJ never has to play to my timeline. No two nights end the same way.',
  },
  {
    n: '03',
    head: 'Written, not assembled.',
    body:
      'Every piece is code: geometry, shaders, physics solved every frame. No bought templates, no ' +
      'stock packs. You can tell when someone made the whole thing. It also means a piece can be ' +
      'rebuilt around one track, one room or one wall instead of just recoloured.',
  },
];

export type Work = {
  key: string;            // shader key in src/gl/shaders.ts
  title: string;
  kicker: string;
  line: string;           // one sentence, reads under the title
  body: string;           // expanded
  tech: string;           // the credibility note
  tags: string[];
  duration?: string;
};

export const works: Work[] = [
  {
    key: 'fault',
    title: 'Fault',
    kicker: 'Material under load',
    line: 'Twenty thousand bonds, pulled until they break — and the scar stays.',
    body:
      'Most visuals treat a build-up as waiting. This one makes the build the event. A disordered ' +
      'lattice is solved every frame with position-based dynamics — a real quasi-static stress solve, ' +
      'not an animation of one. During a build almost nothing moves; what moves is the stress, which ' +
      'concentrates into branching filaments that crawl and re-route. Bond brightness is how close ' +
      'that bond is to its own breaking strain, so within half a minute the room is reading ' +
      'brightness as how close. Micro-cracks go as the cube of the tension signal: nothing for most ' +
      'of the climb, then the last bars are visibly frantic. On the drop a fracture nucleates and ' +
      'tears the slab across the frame in half a second. Then it heals, and the fault stays — ' +
      'permanently weaker, and it is where the next one goes.',
    tech: 'Position-based dynamics, 20k constraints, solved per frame at 60 fps.',
    tags: ['Club & festival', 'LED', 'Peak-time'],
    duration: 'Full set',
  },
  {
    key: 'as_above',
    title: 'As Above',
    kicker: 'One unbroken zoom',
    line: 'A hypha, a web, a leaf, a delta, a galaxy — and the cosmic web is hyphae again.',
    body:
      'One continuous zoom for the whole set, with no cut anywhere in it. Every forty seconds or so ' +
      'what fills the screen turns out to be a small part of something larger, across nine orders of ' +
      'magnitude. The last reveal is the payload and it is true: the large-scale structure of the ' +
      'universe really does look like mycelium. The piece closes on itself, so it can run for two ' +
      'hours and there is no seam to find.',
    tech: 'Scale-invariant procedural geometry; cross-faded octaves, no repeated frame.',
    tags: ['Festival', 'Projection', 'Gallery'],
    duration: 'Unbounded',
  },
  {
    key: 'maya',
    title: 'Maya',
    kicker: 'Jaali, then dissolve',
    line: 'A jaali holds so precisely still that the room reads it as architecture. Then it lets go.',
    body:
      'The lattice draws itself in and holds: a kick moves it by one percent, a shimmer crosses it on ' +
      'the high band, and that is all — deliberately the least reactive object in the catalogue. That ' +
      'stillness is what buys the "is that projected or is it built?" beat when it is mapped onto a ' +
      'real arch or pillar. Then the bass arrives, the lines let go of each other, the wall resolves ' +
      'into the shards it was always made of, and they reassemble into a different symmetry group.',
    tech: 'Wallpaper symmetry groups as a live parameter; built for mapped architectural surfaces.',
    tags: ['Mapping', 'Architectural', 'Gallery'],
    duration: '6–12 min',
  },
  {
    key: 'monsoon',
    title: 'Monsoon',
    kicker: 'A harmonium in the rain',
    line: 'A street corner, weather that arrives and does not stop, and a crowd the track assembles.',
    body:
      'A fixed camera on one corner. The first third is dry: he is already playing, the evening crowd ' +
      'is already going home, and the wind gets up. Then it starts, and he does not move. One by one ' +
      'people stop walking — each new listener peels off the pavement on an accented kick and takes a ' +
      'place at his side, so the crowd that gathers is built by the track rather than by a timer.',
    tech: 'Eight chapters walked by accent detection; every figure is drawn geometry, no footage.',
    tags: ['Narrative', 'Festival', 'Screen'],
    duration: '~9 min',
  },
  {
    key: 'residue',
    title: 'Residue',
    kicker: 'The painting is memory',
    line: 'Every particle draws. What you see is the record of everywhere the system has been.',
    body:
      'Each frame, each particle lays a short luminous segment from where it was to where it is, and ' +
      'those segments composite into a canvas that holds them. What is on screen is not a picture of ' +
      'a particle system — it is its memory. Neon on black with a genuinely dark ground, so the unlit ' +
      'parts of a mapped surface stay unlit.',
    tech: 'GPU particle advection into an accumulating feedback buffer; bloom on luminance only.',
    tags: ['Club', 'LED', 'Mapping'],
    duration: 'Full set',
  },
  {
    key: 'reclaim',
    title: 'Reclaim',
    kicker: 'Nature takes a wall back',
    line: 'A photographed brick wall is traced to its mortar, cracked, and grown through.',
    body:
      'A crack opens, an L-system plant pushes through it, grows, blooms and draws bees — then a ' +
      'second plant cracks its own brick and does the same, then the next, eight in all with their ' +
      'scenes overlapping, until the wall is a garden and the garden stays. There is no stage machine ' +
      'and nothing loops: the show is a single playhead in story-seconds.',
    tech: 'Edge-traced from a photograph of the actual venue wall; L-systems grown per frame.',
    tags: ['Site-specific', 'Mapping', 'Installation'],
    duration: '~4 min',
  },
  {
    key: 'rhizome',
    title: 'Rhizome',
    kicker: 'Below the surface',
    line: 'A mycelial mat fills the soil, light runs the graph, and at the end it fruits.',
    body:
      'Hyphae spread nearly isotropically and fuse wherever they touch, filling the soil edge to edge. ' +
      'Light pulses travel the network as a real graph traversal, so the propagation is structural ' +
      'rather than drawn. At the end it puts up fruiting bodies — the mycelium becoming visible, ' +
      'which is the actual life cycle and a better ending than a green shoot.',
    tech: 'Graph grown toward attractors; pulses propagate along real edges.',
    tags: ['Gallery', 'Installation', 'Ambient'],
    duration: '~7 min',
  },
  {
    key: 'dispersal',
    title: 'Dispersal',
    kicker: 'Drawn in light',
    line: 'A seed head, the bass that blows it apart, and what it reassembles out of the fallout.',
    body:
      'There is not a single textured quad in the scene — everything is lines. A seed is a drawn glyph ' +
      'and a head is the same glyph at a different radius, so a thousand of them converging is a real ' +
      'radial line burst rather than a ball of sprites, and a bursting head visibly un-draws itself. ' +
      'Three cycles, each larger; the third assembles in mid-air out of nothing but what fell.',
    tech: 'Conserved particle count; instanced line geometry, no sprites anywhere.',
    tags: ['Club', 'LED', 'Peak-time'],
    duration: '~4.5 min',
  },
  {
    key: 'painter',
    title: 'The Painter',
    kicker: 'The canvas paints',
    line: 'Every kick lays a stroke. The drop does not wipe the canvas — it smears it.',
    body:
      'The frame starts as blank ground. Every kick traces a bundle of filaments through a curl field ' +
      'and the palette walks across the set, so what accumulates is a drawing nobody planned. The ' +
      'conceit is that the set is being painted in real time and the record is the residue.',
    tech: 'Curl-noise flow field; palette walk keyed to set position, not to a clock.',
    tags: ['Club', 'Release visual', 'Screen'],
    duration: 'Full set',
  },
  {
    key: 'stellar_veil',
    title: 'Stellar Veil',
    kicker: 'Calm in silence',
    line: 'Parallax star layers, a gas giant turning, and comet ghosts on a self-limiting feedback loop.',
    body:
      'Bass swells the field and the planet, air speeds the twinkle, and every kick punches the trail ' +
      'outward. The discipline is that every audio mapping rests at exactly its idle value, so the ' +
      'piece is a complete, calm composition in silence and only spends brightness when the music ' +
      'earns it. That is what makes it safe for a long ambient opening or a foyer.',
    tech: 'Maximum-operand feedback (an additive loop washes to white); silent-safe idle state.',
    tags: ['Ambient', 'Installation', 'Opening'],
    duration: 'Unbounded',
  },
  {
    key: 'bayou',
    title: 'Bayou',
    kicker: 'A character walks',
    line: 'One continuous journey, and seven times he stops because the world will not stop being interesting.',
    body:
      'A locked side-on camera and a swamp that scrolls past. Seven times on the way he finds ' +
      'something and stops, turns his head, rears, and his eye opens into rings. The stopping is the ' +
      'whole piece: a creature that walks the whole way is a screensaver; one that keeps being ' +
      'stopped by what it finds is a character.',
    tech: 'Procedural creature rig; stops triggered by musical accent, not by a timeline.',
    tags: ['Narrative', 'Screen', 'Festival'],
    duration: 'Full set',
  },
  {
    key: 'tunnel',
    title: 'Tunnel Drive',
    kicker: 'Flight rig',
    line: 'Audio sets a speed, not a position — so a quiet passage means slower, never reverse.',
    body:
      'Driving camera position straight from an audio level is the obvious thing and it is wrong: the ' +
      'camera snaps backwards the instant the level drops. Here audio sets a speed and distance is the ' +
      'running total, then the speed itself is slew-limited, which is what "smooth" actually means for ' +
      'a flight — finite acceleration. Verified over a thousand consecutive frames: zero backward ' +
      'frames, and a transient that was 44× the mean step change before the limiter is 7× after.',
    tech: 'Integrated speed with slew limiting; measured, not eyeballed. Retargets to any camera rig.',
    tags: ['Club', 'Peak-time', 'Reusable rig'],
    duration: 'Full set',
  },
];

// ── About ────────────────────────────────────────────────────────────────────
// The person behind the name. Contemporary only: what I do now and the training it
// comes from, no family history.
// TODO: add specifics as `facts` rows if you want them — years in Berlin, the kind
// of data work (e.g. forecasting, audio, computer vision), employers, education.
export const about = {
  name: 'Vishesh Kochher',
  head: 'phenome is Vishesh Kochher.',
  intro: 'A data scientist who took the models into the club.',
  body: [
    'Before this I worked in Berlin as a data scientist, turning noisy signals into models ' +
      'people could act on. I still think that way. I just point it at a room now.',
    'A room is a noisy signal. Every piece listens to it the way a model would: it learns the ' +
      'room’s own floor, separates the kick from the air, and decides what counts as an event. ' +
      'Then it runs a simulation, rules instead of keyframes, and lets the result play out. The ' +
      'visuals on this page work the same way. They run live on your device, on the same code.',
    'Berlin is also where I learned what a night can be, in the rooms listed below. I am now ' +
      'based in New Delhi, bringing that here, and I travel for everything else.',
  ],
  facts: [
    { k: 'Background', v: 'Data scientist, Berlin' },
    { k: 'Now', v: 'Visual artist, New Delhi' },
    { k: 'Tools', v: 'TouchDesigner, GLSL, code written from scratch' },
    { k: 'Plays', v: 'Clubs, festivals, galleries, walls' },
  ],
};

export const lineage = {
  head: 'Who I learned from',
  intro:
    'This practice took shape in Berlin. These are the artists and rooms that made me want to do it.',
  rows: [
    {
      who: 'Refik Anadol',
      what: 'Data can be a material you stand inside.',
      how: 'The first time I saw numbers turned into something you feel rather than read.',
      self: false,
    },
    {
      who: 'Max Cooper',
      what: 'A set can carry an idea from the first minute to the last.',
      how: 'Science as the story, not the decoration. He is why every piece here has a beginning and an end.',
      self: false,
    },
    {
      who: 'Himmel unter Berlin',
      what: 'Light and sound in the city’s forgotten underground.',
      how: 'Installations in cellars and catacombs that exist for a few weeks and then vanish. It is where I learned that the room is half the work.',
      self: false,
    },
    {
      who: 'Dark Matter, Berlin',
      what: 'Darkness is part of the material.',
      how: 'A room of light and motion in total black. It is why I keep my blacks truly black.',
      self: false,
    },
    {
      who: 'phenome',
      what: 'What I am adding: simulations that tell a story and finish it live.',
      how: 'The arc is written in advance. The timing belongs to the room.',
      self: true,
    },
  ],
  coda: {
    head: 'And the things I grew up around, used as rules rather than decoration.',
    body:
      'A jaali read as a symmetry pattern that can change mid-set. A monsoon street corner where the ' +
      'crowd gathers on the kick. A brick wall that growth takes back. These are not motifs laid over ' +
      'someone else’s template. They are the logic the pieces run on, and they come from places I know.',
  },
};

export type Format = {
  n: string;
  title: string;
  line: string;
  bullets: string[];
  shader: string;
};

export const formats: Format[] = [
  {
    n: '01',
    title: 'Club & festival AV set',
    line: 'A continuous piece or a chaptered show, played live next to the DJ.',
    bullets: [
      '45 to 120 minutes, shaped around the set',
      'Listens to the room through a mic, or a direct line from the mixer if it is very loud',
      'I move between chapters by hand, on the music',
      'If the sound drops out, the visuals keep going quietly, never a black screen',
    ],
    shader: 'dispersal',
  },
  {
    n: '02',
    title: 'Projection mapping',
    line: 'Walls, arches, pillars, sets. Made for the surface it lands on.',
    bullets: [
      'Composed for the actual structure, not stretched onto it',
      'A site visit or a good photo of the surface is enough to start',
      'Real blacks, so the parts of the building meant to be dark stay dark',
    ],
    shader: 'maya',
  },
  {
    n: '03',
    title: 'LED & stage content',
    line: 'Screens of any shape or size.',
    bullets: [
      'Generative, so it stays sharp at any size or shape',
      'Played live, or handed over as video files if that suits the production',
      'Composed for the real screen, not squeezed into it',
    ],
    shader: 'residue',
  },
  {
    n: '04',
    title: 'Interactive installation',
    line: 'Movement and presence. The people in the room become part of the piece.',
    bullets: [
      'Movement and silhouettes drive the same system the music does',
      'Long-running installations run on their own, with a calm resting state',
      'For live installations I am there in person, running it',
      'Camera-based pieces need steady lighting on the audience',
    ],
    shader: 'rhizome',
  },
  {
    n: '05',
    title: 'Commissioned piece',
    line: 'Something made for one track, one room or one idea.',
    bullets: [
      'Visuals for a release or a single track',
      'Pieces built around a specific space or occasion',
      'Handed over as a project that can be rebuilt, not a locked video',
    ],
    shader: 'as_above',
  },
];

export const rig = {
  head: 'The setup',
  intro:
    'It is simple. Usually it is me, a laptop and a controller, next to the DJ or at the production ' +
    'desk, listening and switching scenes on cue.',
  groups: [
    {
      title: 'Input',
      head: 'What it listens to',
      items: [
        'A mic picking up the room. Usually that is all it needs',
        'A direct line from the mixer, if the room is very loud or needs a cleaner signal',
        'A camera, only for interactive installations',
      ],
    },
    {
      title: 'Control',
      head: 'How it is played',
      items: [
        'I switch scenes by hand, on cue with the music',
        'Long-running installations are fully automated',
        'Live installations: I am there in person, running everything',
      ],
    },
    {
      title: 'Output',
      head: 'What comes out',
      items: [
        'One video signal to your projector or screen',
        'Mapped to the surface on site',
        'HD or 4K, whatever the projector or screen takes',
      ],
    },
    {
      title: 'Failsafe',
      head: 'Nothing goes black',
      items: [
        'Every scene holds up with no sound at all',
        'A kill switch to black out or freeze, always one key away',
        'Backups of every show file, and a quick restart if anything goes wrong',
      ],
    },
  ],
  needs: [
    'Projectors or screens, and the surfaces to project on',
    'Cables from my table to the projector or screen',
    'A table and power next to the DJ or at the production desk',
    'For camera-based installations, lighting planned so the camera can see people clearly',
  ],
  brings: [
    'Laptop, mic, controller and all show files',
    'Backups of everything',
  ],
};

// ── Shows & press ────────────────────────────────────────────────────────────
// Add real entries only. An empty array renders as an honest in-progress state.
export const emptyStates = {
  shows: {
    head: 'The list is just getting started.',
    body: 'Recent dates go here as they happen. Ask and I will send the latest.',
  },
  press: {
    head: 'Nothing written up yet.',
    body:
      'No coverage so far. Photos and clips from recent shows are on Instagram, and the work ' +
      'itself is running live on this page.',
  },
};

export type Show = { year: string; name: string; venue: string; note?: string };
export const shows: Show[] = [
  { year: '2026', name: 'Gujral Foundation', venue: 'New Delhi' },
  { year: '2022', name: 'Friends Club', venue: 'New Delhi' },         // TODO: confirm city
  { year: '2022', name: 'SOCIAL', venue: 'Nehru Place, New Delhi' },
  { year: '2021', name: 'Fio', venue: 'New Delhi' },
  { year: '2021', name: 'Music festivals', venue: 'Berlin' },
];

export type PressItem = { outlet: string; headline: string; url: string; date?: string };
export const press: PressItem[] = [
  // { outlet: 'Wild City', headline: '…', url: 'https://…' },
];

// ── Instagram ────────────────────────────────────────────────────────────────
// Paste post / reel permalinks (e.g. https://www.instagram.com/reel/XXXXXXXXX/).
// A null url is skipped at render time, so the page never shows a broken embed.
export type InstaPost = { url: string | null; kind: 'post' | 'reel'; caption?: string };

export const instagramFeed = {
  handle: 'projektphenome',
  profileUrl: 'https://www.instagram.com/projektphenome/',
  // The featured reel, rendered as a large embed.
  latestReel: { url: 'https://www.instagram.com/p/DdgwKdfqhCw/', kind: 'reel', caption: 'GLSL Based Audio Reactive Particles dancing to the tunes of ALBOE' } as InstaPost,   // TODO: paste reel link
  // The three most recent posts, newest first.
  recentPosts: [
    { url: 'https://www.instagram.com/p/Ddlphl4K4ru/', kind: 'post' },   // TODO
    { url: 'https://www.instagram.com/p/DdgT49fqdv3/', kind: 'post' },   // TODO
    { url: 'https://www.instagram.com/p/Ddgx2orKe2j/', kind: 'reel' },   // TODO
  ] as InstaPost[],
};

export type Asset = { label: string; note: string; href: string | null };
export const assets: Asset[] = [
  { label: 'Press', note: 'Coverage and write-ups', href: '#press' },
  { label: 'Latest reel', note: 'Most recent show, on Instagram', href: instagramFeed.latestReel.url },
  { label: 'Instagram', note: '@projektphenome', href: instagramFeed.profileUrl },
  { label: 'Press kit (PDF)', note: 'One-page version of this site', href: null },
  { label: 'Technical rider', note: 'What I need and what I bring', href: null },
  { label: 'Stills pack', note: '4K frames from the catalogue', href: null },
  { label: 'Showreel', note: '90 seconds, cut to one track', href: null },
];
// A track to hear the page react to. The clip is served from public/ (a 2 MB cut of the
// release), so it starts on the visitor's tap on any phone and the page analyses it
// directly. `src` is relative to the site root. Set to null to remove the button.
export const demoTrack: {
  title: string; artist: string; src: string; credit: string; url: string;
} | null = {
  title: 'Dhuan',
  artist: 'Alboe & Mai3ya',
  src: 'audio/dhuan.m4a',
  credit: 'Produced by Alboe · written by Vedant Chandra & Manreet Khara · ℗ 2026 Naye Records',
  url: 'https://www.youtube.com/watch?v=529qp9dqH1A',
};
