// One fragment shader per piece. Each defines `vec3 scene(vec2 uv)` and inherits the
// uniforms, noise basis and film finish from prelude.ts.
//
// These are deliberately readable rather than maximally clever: they are the public
// face of the work, and someone will open devtools.

export const HERO = /* glsl */ `
// A mycelial / cosmic-web filament network. The signature image of the practice:
// one structure that reads as very small and very large at the same time.
// Built from cellular F2-F1 edges rather than noise ridges — a real network of
// junctions and struts, which is what both mycelium and the cosmic web actually are.
vec3 scene(vec2 uv){
  vec2 p = uv * 1.55;
  p *= rot(u_time * 0.014);
  p += vec2(u_time * 0.010, u_time * 0.005);
  p += u_mouse * 0.11;
  p += (fbm(p * 0.72 + u_time * 0.018) - 0.5) * 0.62;   // organic curvature

  float swell = 1.0 + u_bass * 0.85;

  vec3 c1 = cells(p * 2.10);
  vec3 c2 = cells(p * 4.55 + 13.0);
  vec3 c3 = cells(p * 9.30 + 31.0);

  float web = 0.0;
  web += smoothstep(0.055, 0.0, c1.y - c1.x) * 1.00;
  web += smoothstep(0.048, 0.0, c2.y - c2.x) * 0.52;
  web += smoothstep(0.040, 0.0, c3.y - c3.x) * 0.26;

  float node = smoothstep(0.11, 0.0, c1.x)
             + smoothstep(0.065, 0.0, c2.x) * 0.55;

  float rad  = length(uv);
  float ring = exp(-pow((rad - u_hit * 1.5) * 7.0, 2.0)) * u_hit;

  vec3 cold = vec3(0.15, 0.66, 0.84);
  vec3 warm = vec3(1.00, 0.90, 0.72);

  vec3 col = vec3(0.0);
  col += web * cold * 0.58 * swell;
  col += pow(web, 3.0) * warm * 0.42;
  col += node * vec3(0.52, 1.00, 0.88) * 0.50 * (0.35 + u_mid);
  col += ring * vec3(0.45, 0.95, 0.85) * 0.70;
  col += vec3(0.005, 0.010, 0.017);
  col += u_high * 0.025 * vec3(0.30, 0.60, 0.80);
  return col;
}
`;

export const AS_ABOVE = /* glsl */ `
// Continuous scale zoom: three nested octaves of the same network cross-fade, so the
// structure you are looking at is always turning out to be part of a larger one.
vec3 scene(vec2 uv){
  float z = u_time * 0.085 + u_bass * 0.30;
  vec3 col = vec3(0.0);

  for(int k = 0; k < 3; k++){
    float fi = float(k);
    float ph = fract(z + fi / 3.0);
    float s  = exp2(ph * 3.0);
    float w  = sin(ph * PI); w *= w;                 // fade in, fade out

    vec2 p = uv * s * 2.2 + vec2(fi * 17.3, fi * 9.1);
    p += (fbm(p * 0.6) - 0.5) * 0.5;

    vec3 c  = cells(p);
    float net = smoothstep(0.070, 0.0, c.y - c.x);
    float nd  = smoothstep(0.10, 0.0, c.x);

    vec3 tint = mix(vec3(0.16, 0.56, 0.78), vec3(0.85, 0.92, 1.00), ph);
    col += w * (net * tint * 0.85 + nd * vec3(0.60, 0.95, 1.00) * 0.35);
  }

  col += vec3(0.006, 0.011, 0.020);
  return col * (0.9 + u_high * 0.5);
}
`;

export const FAULT = /* glsl */ `
// A disordered bond lattice under load. Brightness is the force a bond carries;
// load concentrates into branching chains, and a transient tears a front across it.
vec3 scene(vec2 uv){
  vec2 p = uv * 2.3 + u_seed * 5.0;

  vec3 cl   = cells(p * 3.2);
  float bond = smoothstep(0.075, 0.004, cl.y - cl.x);

  float chain = fbm(p * 1.15 + vec2(u_time * 0.04, u_time * 0.02));
  float load  = smoothstep(0.40, 0.74, chain);
  float tense = load * (0.30 + u_bass * 1.35);

  float front = u_hit * 2.6 - 1.3;
  float crack = exp(-pow((uv.x - front) * 9.0, 2.0)) * u_hit;

  float micro = step(0.9965, hash21(floor(p * 34.0) + floor(u_time * 24.0)))
              * pow(u_mid, 3.0) * 6.0;

  vec3 cool = vec3(0.16, 0.22, 0.34);
  vec3 hot  = vec3(1.00, 0.55, 0.20);

  vec3 col = vec3(0.0);
  col += bond * mix(cool, hot, clamp(tense, 0.0, 1.0)) * (0.45 + tense * 2.2);
  col += bond * crack * vec3(1.0, 0.82, 0.55) * 4.0;
  col += micro * vec3(1.0, 0.75, 0.45) * bond;
  col += vec3(0.012, 0.014, 0.022);
  return col;
}
`;

export const MAYA = /* glsl */ `
// A jaali read as a symmetry group. It holds precisely still, then the bass lets the
// lines go of each other and it resolves into the shards it was always made of.
vec3 scene(vec2 uv){
  float shatter = smoothstep(0.28, 0.95, u_bass);

  vec2 p = uv * 2.0;
  p *= rot(u_time * 0.010);

  float rad = length(p);
  float ang = atan(p.y, p.x);
  float n   = 12.0;
  float af  = mod(ang, TAU / n) - PI / n;
  vec2  q   = vec2(cos(af), sin(af)) * rad;

  // the dissolve: each wedge-cell drifts off its own seat
  vec2 cellId = floor(q * 2.2);
  q += (hash22(cellId) - 0.5) * shatter * 0.85;

  float rings = band(rad * 2.4, 0.030);
  float ribs  = smoothstep(0.022, 0.003, abs(q.y));
  float lens  = smoothstep(0.026, 0.003, abs(length(q - vec2(0.62, 0.0)) - 0.46));
  float lens2 = smoothstep(0.026, 0.003, abs(length(q - vec2(1.20, 0.0)) - 0.46));
  float star  = smoothstep(0.024, 0.003, abs(abs(q.y) - 0.30 * q.x));

  float line = max(max(max(rings, ribs), max(lens, lens2)), star * step(0.15, q.x));
  line *= smoothstep(2.1, 1.85, rad);                // the screen has an edge

  float shimmer = 0.62 + 0.38 * sin(rad * 6.0 - u_time * 1.3) * u_high;

  vec3 stone = vec3(0.86, 0.72, 0.50);
  vec3 lit   = vec3(1.00, 0.92, 0.78);

  vec3 col = vec3(0.0);
  col += line * mix(stone, lit, shimmer) * (1.05 + shatter * 1.6);
  col += line * shatter * vec3(0.40, 0.58, 1.00) * 1.1;
  col += vec3(0.014, 0.012, 0.016);
  return col;
}
`;

export const MONSOON = /* glsl */ `
// A fixed camera on one street corner. A sodium lamp, rain that arrives and does not
// stop, and someone who does not move out of it.
vec3 scene(vec2 uv){
  vec3 col = vec3(0.020, 0.024, 0.036);

  vec2 lamp = vec2(-0.42, 0.30);
  float d   = length((uv - lamp) * vec2(1.0, 1.35));
  col += vec3(1.00, 0.68, 0.32) * glow(d, 0.040, 1.35) * (0.55 + u_mid * 0.35);

  float wet = 0.0;
  for(int i = 0; i < 3; i++){
    float fi = float(i);
    vec2 q = uv * vec2(30.0 + fi * 11.0, 3.4 + fi * 1.1);
    q.x += q.y * 0.30;
    q.y -= u_time * (6.5 + fi * 3.4) * (1.0 + u_high * 0.8);
    vec2 ip = floor(q), fp = fract(q);
    float h = hash21(ip + fi * 37.0);
    float drop = smoothstep(0.55, 0.0, abs(fp.x - 0.5) * 7.0)
               * smoothstep(1.0, 0.15, fp.y)
               * step(0.80, h);
    wet += drop * (0.55 - fi * 0.13);
  }
  col += wet * vec3(0.62, 0.74, 0.92) * (0.6 + u_bass * 0.9);

  float puddle = smoothstep(-0.10, -0.45, uv.y);
  float ripple = sin((uv.y * 34.0) - u_time * 2.2 + fbm(uv * 6.0) * 5.0) * 0.5 + 0.5;
  col += puddle * ripple * vec3(0.85, 0.55, 0.28) * 0.14 * (0.5 + u_mid);

  // listeners peeling off the pavement on an accented kick
  for(int i = 0; i < 4; i++){
    float fi = float(i);
    float x  = -0.34 + fi * 0.22;
    float on = step(fi * 0.24, u_hit * 1.2);
    float f  = smoothstep(0.075, 0.0, abs(uv.x - x))
             * smoothstep(-0.34, 0.06, uv.y) * smoothstep(0.18, 0.02, uv.y);
    col -= f * on * vec3(0.05, 0.05, 0.06);
  }
  return col;
}
`;

export const RESIDUE = /* glsl */ `
// Every particle draws. What is on screen is not a picture of the system — it is the
// record of everywhere the system has been.
vec3 scene(vec2 uv){
  float t = u_time * 0.055;

  vec2 w = uv * 1.7;
  for(int i = 0; i < 5; i++) w += curl(w * 0.80 + t) * (0.080 + u_mid * 0.035);

  // iso-lines of a scalar carried along the flow read as particle paths
  float s1 = fbm(w * 1.5) * 3.2 + w.y * 2.6 - t * 3.0;
  float s2 = fbm(w * 1.1 + 21.0) * 2.6 + w.x * 2.2 + t * 2.0;

  float l1 = band(s1, 0.050);
  float l2 = band(s2, 0.042);

  vec3 neon1 = vec3(0.20, 0.95, 0.80);
  vec3 neon2 = vec3(0.95, 0.30, 0.72);

  float e = 0.55 + u_bass * 1.15;
  vec3 col = vec3(0.0);
  col += l1 * neon1 * e;
  col += l2 * neon2 * e * 0.85;
  col += (pow(l1, 3.0) + pow(l2, 3.0)) * vec3(1.0, 0.97, 0.94) * 0.55;   // bright cores
  col += vec3(0.010, 0.008, 0.020);
  return col;
}
`;

export const PAINTER = /* glsl */ `
// A canvas that paints itself. Every kick lays a bundle of filaments through a curl
// field; the drop does not wipe the canvas, it smears it.
vec3 scene(vec2 uv){
  float smear = u_hit;
  float t = u_time * 0.045;

  vec2 w = uv * 1.5;
  for(int i = 0; i < 5; i++) w += curl(w * 0.70 + t) * (0.095 + smear * 0.22);

  float field = fbm(w * 1.4);
  float s = field * 3.0 + w.x * 3.0;

  float stroke = band(s, 0.115);                       // wet, loaded marks
  float bundle = smoothstep(0.30, 0.80, fbm(w * 0.65 + 7.0));
  stroke *= 0.30 + bundle * 1.1;

  // the palette walks across the set, and across the canvas
  float walk = u_time * 0.030 + u_seed;
  vec3 ink = 0.5 + 0.5 * cos(TAU * (walk + field * 1.4 + w.y * 0.22 + vec3(0.0, 0.30, 0.58)));
  ink = mix(vec3(dot(ink, vec3(0.33))), ink, 1.25);    // push saturation

  vec3 ground = vec3(0.048, 0.045, 0.042);
  vec3 col = ground;
  col += stroke * ink * (1.05 + u_bass * 1.4);
  col += pow(stroke, 5.0) * vec3(1.0, 0.96, 0.90) * 0.45;
  return col;
}
`;

export const RHIZOME = /* glsl */ `
// Below the surface. A mycelial mat spreading nearly isotropically, fusing where it
// touches, with light pulses running the graph.
vec3 scene(vec2 uv){
  vec2 p = uv * 1.9 + vec2(u_time * 0.020, -u_time * 0.032);
  p += (fbm(p * 0.8) - 0.5) * 0.45;

  vec3 c1 = cells(p * 2.6);
  vec3 c2 = cells(p * 5.4 + 17.0);

  float hyph = smoothstep(0.060, 0.0, c1.y - c1.x)
             + smoothstep(0.050, 0.0, c2.y - c2.x) * 0.55;
  float fuse = smoothstep(0.10, 0.0, c1.x);

  // a pulse travelling out along the network
  float dist  = length(uv) * 3.0;
  float pulse = sin(dist - u_time * 2.2) * 0.5 + 0.5;
  pulse = pow(pulse, 6.0) * (0.35 + u_bass * 1.6);

  float soil = 0.5 + 0.5 * fbm(uv * 3.0 + 40.0);

  vec3 col = vec3(0.028, 0.020, 0.014) * soil;
  col += hyph * vec3(0.88, 0.74, 0.48) * 0.70;
  col += hyph * pulse * vec3(1.00, 0.92, 0.66) * 1.5;
  col += fuse * vec3(0.72, 1.00, 0.68) * 0.55 * (0.35 + u_high);
  return col;
}
`;

export const RECLAIM = /* glsl */ `
// A photographed wall traced to its mortar lines, a crack, and what comes through it.
vec3 scene(vec2 uv){
  vec2 b = uv * vec2(4.6, 9.5);
  b.x += 0.5 * floor(b.y);
  vec2 fb = fract(b) - 0.5;
  float mortar = smoothstep(0.40, 0.49, max(abs(fb.x), abs(fb.y) * 1.9));

  // the growth front climbs the wall over the length of the piece
  float front = fract(u_time * 0.040) * 2.2 - 0.8;
  float rise  = smoothstep(front + 0.30, front - 0.60, uv.y);

  // vines: noise stretched along the climb direction reads as strands, not cracks
  vec2 gp = vec2(uv.x * 2.4, uv.y * 0.85 - u_time * 0.015);
  gp += (fbm(gp * 1.1) - 0.5) * 0.85;
  float strand = ridged(vec2(gp.x * 3.2, gp.y * 1.1));
  float vine = smoothstep(0.66, 0.82, strand) * rise;

  float leaf = smoothstep(0.72, 0.88, ridged(vec2(gp.x * 7.0, gp.y * 3.4) + 11.0)) * vine;

  vec2 bcell = floor(gp * 5.0);
  float bloom = step(0.93, hash21(bcell))
              * smoothstep(0.30, 0.0, length(fract(gp * 5.0) - 0.5))
              * rise * (0.6 + u_high * 2.0);

  vec3 col = vec3(0.0);
  col += mortar * vec3(0.20, 0.18, 0.17) * (0.85 - rise * 0.45);
  col += vine * vec3(0.26, 0.80, 0.36) * (1.3 + u_mid * 1.1);
  col += leaf * vec3(0.55, 1.00, 0.50) * 0.9;
  col += bloom * vec3(1.00, 0.62, 0.82) * 3.0;
  col += vec3(0.016, 0.014, 0.012);
  return col;
}
`;

export const DISPERSAL = /* glsl */ `
// A seed head drawn in light, the bass that blows it apart, and what it reassembles
// out of. A seed and a head are the same glyph at two radii.
vec3 scene(vec2 uv){
  float burst = smoothstep(0.25, 0.95, u_bass);
  float ang = atan(uv.y, uv.x);
  float rad = length(uv);

  float hairs = 0.0;
  for(int i = 0; i < 2; i++){
    float fi = float(i);
    float n = 84.0 + fi * 52.0;
    float k = floor((ang / TAU + 0.5) * n);
    float h = hash11(k + fi * 61.0 + u_seed);
    float a0 = (k + 0.5) / n * TAU - PI;
    float len = 0.17 + h * 0.16 + burst * (0.30 + h * 0.60);
    float wob = sin(u_time * (0.6 + h) + h * 9.0) * 0.02 * (1.0 + burst * 4.0);
    vec2 tip = vec2(cos(a0 + wob), sin(a0 + wob)) * len;
    float d = lineDist(uv, vec2(0.0), tip);
    hairs += smoothstep(0.008, 0.0, d) * (1.0 - smoothstep(0.65, 1.0, rad / max(len, 1e-3)));
  }
  hairs = min(hairs, 1.4);

  float bud = smoothstep(0.038, 0.0, rad) * (1.0 - burst * 0.75);

  vec3 gold = vec3(1.00, 0.76, 0.30);
  vec3 pale = vec3(1.00, 0.97, 0.90);

  vec3 col = vec3(0.0);
  col += hairs * mix(pale, gold, burst * 0.85) * 0.60;
  col += bud * gold * 2.4;
  col += vec3(0.012, 0.011, 0.017);
  return col;
}
`;

export const STELLAR_VEIL = /* glsl */ `
// Three parallax layers of stars under a blurred nebula band, with a self-limiting
// feedback trail. Every mapping rests at its idle value, so silence is still a
// composition.
vec3 scene(vec2 uv){
  vec3 col = vec3(0.010, 0.012, 0.026);

  float neb = fbm(uv * vec2(1.2, 2.6) + vec2(u_time * 0.012, 0.0));
  col += smoothstep(0.42, 0.85, neb) * vec3(0.20, 0.13, 0.36) * (0.8 + u_mid * 0.8);

  for(int i = 0; i < 3; i++){
    float fi = float(i);
    float s  = 9.0 + fi * 11.0;
    vec2 q   = uv * s + vec2(u_time * (0.035 + fi * 0.045), 0.0);
    vec3 cl  = cells(q);
    float star = smoothstep(0.13 + u_bass * 0.06, 0.0, cl.x);
    float tw   = 0.55 + 0.45 * sin(u_time * (1.6 + fi) * (0.5 + u_high * 3.0) + cl.z * 40.0);
    col += star * tw * mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.93, 0.82), cl.z) * (0.55 - fi * 0.12);
  }

  vec2 pc = uv - vec2(0.30, -0.10);
  float pr = length(pc * vec2(1.0, 1.0));
  float disc = smoothstep(0.24 + u_bass * 0.02, 0.225, pr);
  float bands = 0.5 + 0.5 * sin(pc.y * 44.0 + fbm(pc * 6.0 + u_time * 0.05) * 4.0);
  col = mix(col, mix(vec3(0.42, 0.30, 0.20), vec3(0.72, 0.58, 0.40), bands), disc * 0.9);
  col += disc * smoothstep(0.23, 0.19, pr) * 0.0;

  col += u_hit * exp(-pow((length(uv) - u_hit * 1.4) * 8.0, 2.0)) * vec3(0.55, 0.62, 1.0);
  return col;
}
`;

export const BAYOU = /* glsl */ `
// One continuous side-on journey. The camera is locked to him and the swamp scrolls
// past; seven times he stops, and his eye opens into rings.
vec3 scene(vec2 uv){
  float scroll = u_time * 0.085;

  vec3 col = mix(vec3(0.030, 0.052, 0.052), vec3(0.075, 0.105, 0.090),
                 smoothstep(-0.12, 0.48, uv.y));
  col += vec3(0.20, 0.14, 0.06) * exp(-pow((uv.y - 0.04) * 4.5, 2.0)) * 0.55;  // horizon

  // three parallax silhouette bands — nearer is darker and sits lower
  for(int i = 0; i < 3; i++){
    float fi = float(i);
    float x  = uv.x + scroll * (0.22 + fi * 0.42);
    float top = 0.06 - fi * 0.055
              + 0.11 * fbm(vec2(x * (2.2 + fi * 1.4), fi * 7.0))
              + 0.045 * sin(x * (5.0 + fi * 4.0));
    float m = smoothstep(top + 0.012, top - 0.012, uv.y);
    col = mix(col, vec3(0.016, 0.040, 0.034) * (1.0 - fi * 0.30), m);
  }

  // water, and what the sky leaves on it
  float water  = smoothstep(-0.14, -0.20, uv.y);
  float ripple = band(uv.y * 26.0 - u_time * 1.3 + sin(uv.x * 5.0 + scroll * 3.0) * 1.5, 0.30);
  col += water * ripple * vec3(0.22, 0.46, 0.42) * (0.20 + u_mid * 0.35);

  // the eye, off to one side, opening into rings when something stops him
  vec2  ec = (uv - vec2(0.30, -0.04)) * vec2(1.0, 1.3);
  float er = length(ec);
  float rings = band(er * 11.0 - u_time * 0.7, 0.020) * smoothstep(0.22, 0.0, er);
  col += rings * vec3(1.00, 0.76, 0.28) * (0.40 + u_bass * 1.9);
  col += smoothstep(0.018, 0.0, er) * vec3(1.00, 0.86, 0.46) * 1.8;
  return col;
}
`;

export const TUNNEL = /* glsl */ `
// Audio sets a speed and distance is the running total, so a quiet passage means
// slower and never reverse. The flight is slew-limited: finite acceleration.
vec3 scene(vec2 uv){
  float ang = atan(uv.y, uv.x);
  float rad = max(length(uv), 1e-3);

  float drive = u_time * 0.60 + u_bass * 1.0;
  float depth = 0.90 / rad;          // ~7 rings across the visible cone
  vec2  q = vec2(ang / TAU * 8.0, depth + drive);

  // hide the far field where the rings would alias into grey
  float dens = smoothstep(0.10, 0.30, rad);

  float ring = band(q.y, 0.060) * dens;
  float rib  = band(q.x, 0.055) * smoothstep(0.05, 0.30, rad);
  float wall = fbm(vec2(q.x * 1.5, q.y * 0.9)) * dens;

  vec3 tint = 0.5 + 0.5 * cos(TAU * (q.y * 0.05 + vec3(0.0, 0.28, 0.55)));

  vec3 col = vec3(0.0);
  col += ring * tint * (0.85 + u_mid * 1.3);
  col += rib  * tint * 0.22;
  col += wall * vec3(0.07, 0.11, 0.19) * 0.9;
  col += smoothstep(0.10, 0.0, rad) * vec3(0.50, 0.76, 1.00) * (0.15 + u_hit * 1.3);
  col += vec3(0.009, 0.011, 0.018);
  return col;
}
`;

export const SHADERS: Record<string, string> = {
  hero: HERO,
  as_above: AS_ABOVE,
  fault: FAULT,
  maya: MAYA,
  monsoon: MONSOON,
  residue: RESIDUE,
  painter: PAINTER,
  rhizome: RHIZOME,
  reclaim: RECLAIM,
  dispersal: DISPERSAL,
  stellar_veil: STELLAR_VEIL,
  bayou: BAYOU,
  tunnel: TUNNEL,
};
