import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { TextField } from "../components/TextField";
import type { Guest } from "../data/guests";
import "./QuestionCard.css";

type Props = {
  guest: Guest;
  savedAnswer?: string;
  onBack: () => void;
  onSave: (answer: string) => void;
};

/** Figma: Question Card — ask the guest in person, then note their answer to collect the card. */
export function QuestionCard({ guest, savedAnswer, onBack, onSave }: Props) {
  const [answer, setAnswer] = useState(savedAnswer ?? "");
  const saved = savedAnswer !== undefined;

  return (
    <div className="question screen-enter">
      <div className="page__scroll question__scroll">
        <div className="topbar">
          <button type="button" className="icon-btn clay clay-light" onClick={onBack} aria-label="Kembali">
            <Icon name="ArrowLeft" />
          </button>
          <span className="t-p-h3-bold">Kartu kenalan</span>
        </div>

        <section className="card question__guest">
          <Avatar initial={guest.name.charAt(0)} size="L" />
          <div className="question__who">
            <span className="t-display-h6">{guest.name}</span>
            <span className="t-p-h5 guest-card__role">{guest.role}</span>
          </div>
          {saved && <Badge type="hadir">Kartu didapat</Badge>}
        </section>

        {/* The question is the hero of this screen */}
        <section className="question__card clay clay-dark">
          <span className="t-p-h5-bold question__eyebrow">Tanyakan langsung ke {guest.name}</span>
          <p className="t-display-h6 question__text">“{guest.question}”</p>
        </section>

        {saved ? (
          <section className="card">
            <span className="t-p-h5-bold field__label">Jawaban {guest.name}</span>
            <p className="t-p-h4 question__answer">{savedAnswer}</p>
          </section>
        ) : (
          <TextField
            label={`Jawaban ${guest.name}`}
            value={answer}
            onChange={setAnswer}
            placeholder="Catat jawabannya di sini"
            hint="Tidak ada jawaban yang salah. Ngobrol dulu, baru catat."
            multiline
            maxLength={160}
          />
        )}
      </div>
      <div className="page__bottom question__bottom">
        {saved ? (
          <Button block style="secondary" onClick={onBack}>
            Kembali ke daftar
          </Button>
        ) : (
          <Button block disabled={!answer.trim()} onClick={() => onSave(answer.trim())}>
            Simpan kartu
          </Button>
        )}
      </div>
    </div>
  );
}
