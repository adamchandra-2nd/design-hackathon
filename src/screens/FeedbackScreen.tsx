import { useState } from "react";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { MemoryCard } from "../components/MemoryCard";
import { TextField } from "../components/TextField";
import "./FeedbackScreen.css";

const MOODS = ["Acaranya seru", "Kantornya keren", "Makanannya enak", "Dapat kenalan baru", "Kurang lama!"];
const RATING_LABELS = ["", "Kurang", "Lumayan", "Oke", "Seru", "Seru banget!"];

type Props = {
  name: string;
  hue: number;
  kenalanCount: number;
  roomsVisited: number;
  submitted: boolean;
  onSubmit: () => void;
  onShareFallback: () => void;
};

/** Feedback (after the event) → thank-you with the shareable memory card. */
export function FeedbackScreen({ name, hue, kenalanCount, roomsVisited, submitted, onSubmit, onShareFallback }: Props) {
  const [rating, setRating] = useState(0);
  const [moods, setMoods] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const share = async () => {
    const text = `Aku ikut House Moving Day Potara! ${kenalanCount} kenalan baru hari ini.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "House Moving Day", text });
        return;
      }
    } catch {
      /* cancelled or blocked: fall through to the hint */
    }
    onShareFallback();
  };

  if (submitted) {
    return (
      <div className="page__scroll screen-enter">
        <header className="page__header">
          <h1 className="t-display-h6 page__title">Terima kasih, {name}!</h1>
          <p className="t-p-h5 page__sub">Ini kenang-kenanganmu dari rumah baru Potara.</p>
        </header>
        <MemoryCard name={name} hue={hue} kenalanCount={kenalanCount} roomsVisited={roomsVisited} />
        <Button block icon="Share" onClick={share}>
          Bagikan ke Instagram
        </Button>
      </div>
    );
  }

  return (
    <div className="page__scroll screen-enter">
      <header className="page__header">
        <h1 className="t-display-h6 page__title">Feedback</h1>
        <p className="t-p-h5 page__sub">Ceritakan pengalamanmu hari ini. Cuma butuh 1 menit.</p>
      </header>

      {/* Figma: Rating */}
      <section className="card">
        <h2 className="t-p-h3-bold panel__title">Gimana acara hari ini?</h2>
        <div className="rating" role="radiogroup" aria-label="Rating acara">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} bintang`}
              className={`rating__star${n <= rating ? " is-on" : ""}`}
              onClick={() => setRating(n)}
            >
              <Icon name={n <= rating ? "StarFill" : "Star"} size={32} />
            </button>
          ))}
        </div>
        <span className="t-p-h5-bold rating__label">{rating ? RATING_LABELS[rating] : "Tap bintangnya"}</span>
      </section>

      <section className="card">
        <h2 className="t-p-h3-bold panel__title">Yang paling berkesan?</h2>
        <div className="moods">
          {MOODS.map((m) => {
            const on = moods.includes(m);
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                className={`mood t-p-h5-bold${on ? " is-on clay clay-dark" : ""}`}
                onClick={() => setMoods(on ? moods.filter((x) => x !== m) : [...moods, m])}
              >
                {m}
              </button>
            );
          })}
        </div>
      </section>

      <TextField label="Pesan buat Potara (opsional)" value={note} onChange={setNote} placeholder="Tulis di sini…" multiline maxLength={280} />

      <Button block disabled={!rating} onClick={onSubmit}>
        Kirim feedback
      </Button>
    </div>
  );
}
