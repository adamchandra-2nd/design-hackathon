/**
 * Shared live state between the MC and the speaker. In the prototype it lives in localStorage and syncs
 * across tabs (open #mc and #pembicara side by side to see them talk to each other); production uses the backend.
 */
import { useCallback, useEffect, useState } from "react";
import { SAMPLE_STAGE_QUESTIONS, SESSIONS, type McSignal, type ScriptPart, type SpeakerHelp, type StageQuestion } from "./data";

export type StagePhase = "pre" | "live" | "ended";
export type SpeakerStatus = "belum" | "siap" | "live" | "bantuan" | "selesai";

export type StageState = {
  phase: StagePhase;
  /** Session on stage now, and the real time (ms) it started. */
  liveId: string | null;
  startedAt: number;
  doneIds: string[];
  questions: StageQuestion[];
  speaker: SpeakerStatus;
  speakerHelp?: SpeakerHelp;
  /** Last signal each way; the receiver shows it when `at` is newer than what it has seen. */
  mcSignal: { kind: McSignal; at: number } | null;
  speakerSignal: { kind: "siap" | "bantuan" | "selesai"; help?: SpeakerHelp; at: number } | null;
  announcements: { title: string; body: string; roomId: string | null; at: number }[];
  /** Script lines the MC ticked, per session. */
  checked: Record<string, number[]>;
  scriptVariant: Record<string, number>;
  /** Admin changed the rundown since the MC last looked. */
  rundownChanged: boolean;
  /** MC asked the committee for help (reason + time), shown in the admin bell. */
  panitiaCalled: boolean;
  panitiaCall?: { reason: string; at: number };
  /** Scripts the committee edited in the admin (otherwise Claude's suggestion is used). */
  scripts?: Record<string, ScriptPart[]>;
};

const KEY = "hmd-stage-v1";
const minutesAgo = (m: number) => Date.now() - m * 60_000;

/** Talkshow on stage, 47½ minutes in (12:30 left). */
export const LIVE_BASE = (): StageState => ({
  phase: "live",
  liveId: "talkshow",
  startedAt: minutesAgo(47.5),
  doneIds: ["pembukaan"],
  questions: SAMPLE_STAGE_QUESTIONS,
  speaker: "live",
  mcSignal: null,
  speakerSignal: null,
  announcements: [{ title: "Talkshow segera mulai", body: "Kursi di Ruang Omakase masih banyak.", roomId: "ruang-omakase", at: 9 * 60 + 25 }],
  checked: { talkshow: [0, 1] },
  scriptVariant: {},
  rundownChanged: false,
  panitiaCalled: false,
});

export function read(): StageState | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return s && s.phase ? s : null;
  } catch {
    return null;
  }
}
function write(s: StageState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: this tab still works on its own */
  }
}

/** `seed` (a review case) replaces the shared state; without it, pick up whatever the other side left. */
export function useStage(seed?: StageState) {
  const [state, setState] = useState<StageState>(() => {
    const s = seed ?? read() ?? LIVE_BASE();
    write(s);
    return s;
  });
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      const s = read();
      if (s) setState(s);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const update = useCallback((fn: (s: StageState) => StageState) => {
    setState((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);
  return [state, update] as const;
}

/** Ticks every second (timers). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
}

/** Keep the screen awake during the event (ignored where the browser says no). */
export function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock
      ?.request("screen")
      .then((l) => (lock = l))
      .catch(() => undefined);
    return () => {
      lock?.release().catch(() => undefined);
    };
  }, []);
}

export const sortedSessions = () => [...SESSIONS].sort((a, b) => a.start - b.start);

/** Seconds left on the live session (negative = overtime). */
export function remainingS(state: StageState, now: number) {
  const s = SESSIONS.find((x) => x.id === state.liveId);
  if (!s) return 0;
  return Math.round((s.end - s.start) * 60 - (now - state.startedAt) / 1000);
}

/** The session after the live one (or the first one before the event). */
export function nextSession(state: StageState) {
  const list = sortedSessions().filter((s) => !state.doneIds.includes(s.id) && s.id !== state.liveId);
  return list[0];
}

/** Scheduled clock minute "now" maps to, for display ("09.50"). */
export function clockMinute(state: StageState, now: number) {
  const s = SESSIONS.find((x) => x.id === state.liveId);
  if (!s) {
    if (state.phase === "ended") return 13 * 60 + 50;
    // Between sessions: right after the last one that finished (not a fixed morning time)
    const done = SESSIONS.filter((x) => state.doneIds.includes(x.id));
    return done.length ? Math.max(...done.map((x) => x.end)) : 8 * 60 + 45;
  }
  return s.start + Math.floor((now - state.startedAt) / 60_000);
}

export const fmtClock = (secs: number) => {
  const a = Math.abs(secs);
  return `${secs < 0 ? "+" : ""}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
};

/** For the admin side: change the shared state without holding it (the MC/speaker tabs pick it up). */
export function patchStage(fn: (s: StageState) => StageState) {
  write(fn(read() ?? LIVE_BASE()));
}

/** For the admin side: be told when the MC or speaker changes something. */
export function useStageWatch(cb: (s: StageState) => void) {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      const s = read();
      if (s) cb(s);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [cb]);
}
