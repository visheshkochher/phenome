// Shared GLSL scaffolding. Every scene shader is PRELUDE + its own `scene()` + EPILOGUE,
// so all of them get the same uniforms, noise basis and film finish.

export const PRELUDE = /* glsl */ `
precision highp float;

uniform vec2  u_res;    // pixel resolution of the viewport being drawn
uniform float u_time;   // seconds
uniform vec2  u_mouse;  // -1..1 within the viewport, y up
uniform float u_bass;   // 0..1  kick / low band
uniform float u_mid;    // 0..1  body
uniform float u_high;   // 0..1  air
uniform float u_hit;    // 0..1  decaying transient envelope
uniform float u_seed;   // per-instance constant

#define PI 3.14159265359
#define TAU 6.28318530718

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

float hash11(float p){ p=fract(p*0.1031); p*=p+33.33; p*=p+p; return fract(p); }

float hash21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx)*0.1031);
  p3 += dot(p3, p3.yzx+33.33);
  return fract((p3.x+p3.y)*p3.z);
}

vec2 hash22(vec2 p){
  vec3 p3 = fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));
  p3 += dot(p3, p3.yxz+33.33);
  return fract((p3.xx+p3.yz)*p3.zy);
}

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), u.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v += a*vnoise(p); p = rot(0.61)*p*2.02; a *= 0.5; }
  return v;
}

// Ridged fbm — gives filaments rather than clouds.
float ridged(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v += a*(1.0-abs(vnoise(p)*2.0-1.0)); p = rot(0.83)*p*2.07; a *= 0.55; }
  return v;
}

// Cheap divergence-free-ish flow field. The curl of an fbm potential.
vec2 curl(vec2 p){
  float e = 0.08;
  float a = fbm(p + vec2(0.0, e));
  float b = fbm(p - vec2(0.0, e));
  float c = fbm(p + vec2(e, 0.0));
  float d = fbm(p - vec2(e, 0.0));
  return vec2(a-b, d-c) / (2.0*e);
}

// F1/F2 cellular. x = nearest distance, y = second, z = cell id.
vec3 cells(vec2 p){
  vec2 ip = floor(p), fp = fract(p);
  float f1 = 8.0, f2 = 8.0, id = 0.0;
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
    vec2 g = vec2(float(x), float(y));
    vec2 o = hash22(ip+g);
    float d = length(g + o - fp);
    if(d < f1){ f2=f1; f1=d; id=hash21(ip+g); }
    else if(d < f2){ f2=d; }
  }
  return vec3(f1, f2, id);
}

// A periodic stripe: a line of half-width w wherever fract(x) passes 0.5.
// (Write it this way, never as abs(fract(x)-0.5)-k, which fills instead of draws.)
float band(float x, float w){ return smoothstep(w, 0.0, abs(fract(x) - 0.5)); }

float lineDist(vec2 p, vec2 a, vec2 b){
  vec2 pa = p-a, ba = b-a;
  float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
  return length(pa - ba*h);
}

// Soft additive glow around a value that peaks at 0.
float glow(float d, float r, float p){ return pow(r/max(d, 1e-4), p); }
`;

export const EPILOGUE = /* glsl */ `
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
  vec3 c = scene(uv);

  c = max(c, 0.0);
  c = c / (c + 0.78);                 // reinhard-ish shoulder, keeps highlights from clipping flat
  c = pow(c, vec3(0.4545));           // to sRGB

  float g = hash21(gl_FragCoord.xy + fract(u_time)*443.7);
  c += (g - 0.5) * 0.030;             // grain, matches the print-noise of the reference kit

  c *= clamp(1.0 - 0.62*dot(uv,uv), 0.0, 1.0);   // vignette
  gl_FragColor = vec4(c, 1.0);
}
`;

export const VERT = /* glsl */ `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;
