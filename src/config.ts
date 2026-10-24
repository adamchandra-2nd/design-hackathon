/** Event settings. Change these when the final rundown is confirmed. */
export const EVENT = {
  name: "House Moving Day",
  host: "Potara Studio",
  dateLabel: "Minggu, 8 November 2026",
  place: "Kantor baru Potara",
  /** Countdown target. Start time is a placeholder until the rundown is final. */
  startsAt: new Date("2026-11-08T09:00:00+07:00"),
};

/** Turn off for Test Day so "Ya" goes straight to "Mulai masuk Potara". */
export const COUNTDOWN_ENABLED = true;

/** Guests need this many kenalan cards for the reward. */
export const KENALAN_TARGET = 5;

/** Prototype codes (replace with backend checks). */
export const DOOR_CODE = "1108";
export const PANITIA_PIN = "2026";
/** This guest's own kenalan code, shown under their QR. */
export const MY_KENALAN_CODE = "4821";

/** Prototype clock for the rundown (minutes since 00:00) until the real event day. */
export const DEMO_NOW = { live: 9 * 60 + 50, soon: 9 * 60 + 25, between: 11 * 60 + 20, ended: 13 * 60 + 50 };
