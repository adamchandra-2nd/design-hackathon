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
