// The drive signal behind every shader on the page.
//
// Three sources, same shape: the visitor's microphone (asked for on load, because a
// visitor who doesn't know the page listens will never go looking for a switch), a
// synthetic bar-aware pattern (the fallback, and what fills in while the room is
// quiet), or the manual sliders. This mirrors the real rig — band envelopes with
// attack/decay, never raw amplitude.

export type Bands = { bass: number; mid: number; high: number; hit: number };
export type Source = 'demo' | 'mic' | 'manual';

const BPM = 124;

export class AudioDrive {
  source: Source = 'demo';
  manual: Bands = { bass: 0.25, mid: 0.35, high: 0.25, hit: 0 };
  bands: Bands = { bass: 0, mid: 0, high: 0, hit: 0 };

  /** Set when the mic is live, so the UI can show a real state rather than a hope. */
  micReady = false;
  micError: string | null = null;
  /** True while the mic is picking up something above room tone. */
  hearing = false;
  /** The mic is granted but the browser wants a tap before audio can run. */
  needsTap = false;

  private listeners = new Set<() => void>();
  private version = 0;
  /** For useSyncExternalStore: bumps whenever source, mic state or `hearing` change. */
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  getVersion = () => this.version;
  private emit() { this.version++; this.listeners.forEach((fn) => fn()); }

  setSource(s: Source) { this.source = s; this.emit(); }

  // How much of the mic is in the mix. In a quiet room the mic reads flat, and a flat
  // page looks broken, so the synthetic pattern fills in until something is heard.
  private started = false;
  private presence = 0;
  private lastHeard = -1e9;

  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private freq: Uint8Array<ArrayBuffer> | null = null;
  private hitEnv = 0;
  private prevBass = 0;

  // Per-band auto-calibration. Room tone — traffic, air-conditioning, the mic's own
  // noise — is almost all low frequency, so a fixed gain pins bass in any real room.
  // Instead each band tracks its own quiet floor and recent peak, and reports where
  // the current level sits between them. Nothing to tune, and it re-calibrates when
  // the room changes.
  private floor: Bands = { bass: 1, mid: 1, high: 1, hit: 0 };
  private peak: Bands = { bass: 0, mid: 0, high: 0, hit: 0 };

  /**
   * Called once on load. Goes straight for the mic unless the visitor has already
   * refused it, or chose another source on an earlier visit.
   */
  async autoStart() {
    if (this.started) return;
    this.started = true;
    let pref: string | null = null;
    try { pref = localStorage.getItem('drive-source'); } catch {}
    if (pref === 'demo' || pref === 'manual') { this.setSource(pref); return; }
    try {
      // Some browsers never settle this query; don't let it hold up the mic.
      const perm = await Promise.race([
        navigator.permissions?.query({ name: 'microphone' as PermissionName }),
        new Promise<undefined>((r) => setTimeout(r, 400)),
      ]);
      if (perm?.state === 'denied') { this.micError = 'Microphone is blocked for this site.'; this.emit(); return; }
    } catch {}
    await this.enableMic();
  }

  /** Remember an explicit choice, so a reload doesn't re-ask someone who said no. */
  remember(s: Source) {
    try { localStorage.setItem('drive-source', s); } catch {}
  }

  async enableMic(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.micError = 'No microphone available.'; this.emit(); return false;
    }
    if (this.micReady) { this.ctx?.resume().catch(() => {}); this.setSource('mic'); return true; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Without a user gesture the context may start suspended (autoplay policy). The
      // synthetic pattern covers for it until the first tap or key wakes it up.
      ctx.onstatechange = () => { this.needsTap = ctx.state !== 'running'; this.emit(); };
      ctx.resume().catch(() => {});
      if (ctx.state !== 'running') {
        this.needsTap = true;
        const wake = () => {
          ctx.resume().catch(() => {});
          ['pointerdown', 'keydown', 'touchend'].forEach((e) => window.removeEventListener(e, wake));
        };
        ['pointerdown', 'keydown', 'touchend'].forEach((e) => window.addEventListener(e, wake, { passive: true }));
      }
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      // The default window (-100..-30 dB) puts an empty room at a third of full scale.
      // This one treats anything under about -70 dB as silence.
      analyser.minDecibels = -72;
      analyser.maxDecibels = -18;
      src.connect(analyser);
      this.ctx = ctx; this.analyser = analyser; this.stream = stream;
      this.freq = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      this.floor = { bass: 1, mid: 1, high: 1, hit: 0 };
      this.peak = { bass: 0, mid: 0, high: 0, hit: 0 };
      this.presence = 0; this.lastHeard = -1e9;
      this.micReady = true; this.micError = null; this.source = 'mic';
      this.emit();
      return true;
    } catch (e: any) {
      this.micError = e?.name === 'NotAllowedError' ? 'Microphone permission denied.' : 'No microphone available.';
      this.source = 'demo';
      this.emit();
      return false;
    }
  }

  disableMic() {
    this.stream?.getTracks().forEach((t) => t.stop());
    if (this.ctx) this.ctx.onstatechange = null;
    this.ctx?.close().catch(() => {});
    this.ctx = null; this.analyser = null; this.stream = null; this.freq = null;
    this.micReady = false; this.hearing = false; this.needsTap = false;
    if (this.source === 'mic') this.source = 'demo';
    this.emit();
  }

  /** Called once per animation frame. `t` is seconds, `dt` the frame delta. */
  update(t: number, dt: number) {
    let target: Bands;
    if (this.source === 'mic' && this.analyser && this.freq) target = this.mixMic(t, dt);
    else if (this.source === 'manual') target = { ...this.manual, hit: this.manual.hit };
    else target = this.synth(t);

    // Slew-limit toward the target. Fast attack, slow release: the difference between
    // "reactive" and "twitchy".
    const k = (cur: number, to: number) => {
      const rate = to > cur ? 26 : 5.5;
      return cur + (to - cur) * Math.min(1, rate * dt);
    };
    this.bands.bass = k(this.bands.bass, target.bass);
    this.bands.mid = k(this.bands.mid, target.mid);
    this.bands.high = k(this.bands.high, target.high);

    // Transient envelope: derived from a rising edge on bass, then decays on its own.
    const rise = Math.max(0, target.bass - this.prevBass);
    this.prevBass = target.bass;
    this.hitEnv = Math.max(this.hitEnv * Math.exp(-dt * 2.6), Math.min(1, rise * 4.2), target.hit);
    this.bands.hit = this.hitEnv;
  }

  /** The mic when the room is making noise, the synthetic pattern (softer) when it isn't. */
  private mixMic(t: number, dt: number): Bands {
    const m = this.readMic(dt);
    if (Math.max(m.bass, m.mid, m.high) > 0.35) this.lastHeard = t;
    const heard = t - this.lastHeard < 2.5;
    this.presence += ((heard ? 1 : 0) - this.presence) * Math.min(1, (heard ? 4 : 0.7) * dt);
    if (heard !== this.hearing) { this.hearing = heard; this.emit(); }
    if (this.presence > 0.995) return m;
    const s = this.synth(t), p = this.presence, q = (1 - p) * 0.7;
    return { bass: m.bass * p + s.bass * q, mid: m.mid * p + s.mid * q, high: m.high * p + s.high * q, hit: 0 };
  }

  private readMic(dt: number): Bands {
    const a = this.analyser!, f = this.freq!;
    a.getByteFrequencyData(f);
    const rate = (this.ctx?.sampleRate ?? 48000) / 2;
    const bin = (hz: number) => Math.min(f.length - 1, Math.max(0, Math.round((hz / rate) * f.length)));
    const avg = (lo: number, hi: number) => {
      const a0 = bin(lo), a1 = Math.max(a0 + 1, bin(hi));
      let s = 0;
      for (let i = a0; i < a1; i++) s += f[i];
      return s / (a1 - a0) / 255;
    };
    return {
      bass: this.calibrate('bass', avg(30, 160), dt),
      mid: this.calibrate('mid', avg(200, 2000), dt),
      high: this.calibrate('high', avg(4000, 14000), dt),
      hit: 0,
    };
  }

  /**
   * Where `raw` sits between this band's quiet floor and its recent peak. The floor
   * drops instantly to any new quiet and creeps back up; the peak jumps to any new
   * loud and decays slowly. If the two are close together the room is only humming,
   * so the band reports nothing rather than amplifying noise into a signal.
   */
  private calibrate(key: 'bass' | 'mid' | 'high', raw: number, dt: number): number {
    const FLOOR_RISE = 0.10;   // per second, toward a louder baseline
    const PEAK_FALL = 0.30;    // per second, back down toward quiet
    const MIN_SPAN = 0.07;     // below this the band is indistinguishable from room tone

    const f = this.floor[key];
    this.floor[key] = raw < f ? raw : f + (raw - f) * Math.min(1, FLOOR_RISE * dt);

    const p = this.peak[key];
    this.peak[key] = raw > p ? raw : p + (raw - p) * Math.min(1, PEAK_FALL * dt);

    const span = this.peak[key] - this.floor[key];
    if (span < MIN_SPAN) return 0;
    return Math.max(0, Math.min(1, (raw - this.floor[key]) / span));
  }

  /** A 124 BPM pattern with a 32-bar build and drop, so the demo has an arc. */
  private synth(t: number): Bands {
    const beat = (t * BPM) / 60;
    const bar = beat / 4;
    const macro = (Math.sin((bar / 8) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5); // 0..1 over 16 bars
    const energy = 0.35 + 0.65 * Math.pow(macro, 1.6);

    const kick = Math.exp(-((beat % 1) * 7.5));
    const hat = Math.exp(-((beat % 0.5) * 16));
    const swell = 0.25 + 0.35 * (Math.sin(beat * 0.11) * 0.5 + 0.5);

    return {
      bass: Math.min(1, kick * (0.55 + 0.55 * energy)),
      mid: Math.min(1, swell * (0.6 + 0.8 * energy)),
      high: Math.min(1, (0.12 + hat * 0.55) * (0.5 + energy)),
      hit: 0,
    };
  }
}

export const drive = new AudioDrive();
