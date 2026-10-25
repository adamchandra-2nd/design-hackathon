import "./RsvpTag.css";

export type RsvpAnswer = "ya" | "tidak" | "belum";
const LABEL: Record<RsvpAnswer, string> = { ya: "Akan datang", belum: "Belum jawab", tidak: "Tidak bisa" };

/** Figma: Tag RSVP — outlined, squarer than status pills, with a coloured dot. Kept visually apart from attendance tags. */
export function RsvpTag({ answer }: { answer: RsvpAnswer }) {
  return (
    <span className={`rsvp-tag rsvp-tag--${answer} t-p-h5-bold`}>
      <span className="rsvp-tag__dot" />
      {LABEL[answer]}
    </span>
  );
}
