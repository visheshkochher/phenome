import { useSyncExternalStore } from 'react';
import { drive } from './audio';

/** Re-renders when the drive's source, mic state or "hearing" flag change — never per frame. */
export function useDrive() {
  useSyncExternalStore(drive.subscribe, drive.getVersion);
  return drive;
}

// Small shared flags between the hero cue and the drive panel.
function flag() {
  let on = false;
  const ls = new Set<() => void>();
  const set = (v: boolean) => { on = v; ls.forEach((f) => f()); };
  const sub = (f: () => void) => { ls.add(f); return () => { ls.delete(f); }; };
  return { set, use: () => useSyncExternalStore(sub, () => on) };
}

/** The demo track's player. */
export const song = flag();
/** A request from outside (the hero cue) to open the panel, e.g. to hand over the faders. */
export const panelRequest = flag();
