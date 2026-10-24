import { useState } from "react";
import { Button } from "../components/Button";
import { Dots } from "../components/Dots";
import { ROOMS } from "../data/rooms";
import "./Narasi.css";

const SLIDES = [
  {
    room: 0,
    title: "Selamat datang di rumah baru Potara!",
    body: "Hari ini kami resmi pindahan. Terima kasih sudah datang merayakannya bareng kami.",
  },
  {
    room: 1,
    title: "Jelajahi 5 ruangan",
    body: "Geser layar ke kiri atau kanan untuk pindah ruangan. Tiap ruangan punya ceritanya sendiri.",
  },
  {
    room: 3,
    title: "Kenalan, kumpulkan kartu",
    body: "Sapa tamu lain dan tanyakan pertanyaan di kartunya. Kumpulkan 5 kartu untuk dapat hadiah.",
  },
  {
    room: 4,
    title: "Ikuti acaranya",
    body: "Saat acara dimulai, kami kabari dulu lalu antar kamu ke ruangannya.",
  },
];

/** Story slides after the door: tap anywhere to continue, skip any time. */
export function Narasi({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];
  const next = () => (last ? onDone() : setI(i + 1));

  return (
    <main className="flow narasi" onClick={next}>
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          className={`flow__bg narasi__bg${idx === i ? " is-active" : ""}`}
          style={{ backgroundImage: `url(${ROOMS[s.room].image})` }}
        />
      ))}
      <div className="flow__top narasi__top">
        <span className="narasi__dots">
          <Dots index={i} total={SLIDES.length} label={`Slide ${i + 1} dari ${SLIDES.length}`} />
        </span>
        {!last && (
          <button
            type="button"
            className="narasi__skip glass t-p-h5-bold"
            onClick={(e) => {
              e.stopPropagation();
              onDone();
            }}
          >
            Lewati
          </button>
        )}
      </div>
      <div className="flow__stage" />
      <div className="flow__bottom">
        <section key={i} className="panel glass narasi__panel">
          <span className="t-p-h5-bold narasi__step">
            {i + 1}/{SLIDES.length}
          </span>
          <h1 className="t-display-h6 panel__title">{slide.title}</h1>
          <p className="t-p-h4 panel__body">{slide.body}</p>
          {last ? (
            <div className="panel__actions">
              <Button block style="accent" icon="ArrowRight" onClick={onDone}>
                Buat karaktermu
              </Button>
            </div>
          ) : (
            <span className="t-p-h5 narasi__hint">Tap di mana saja untuk lanjut</span>
          )}
        </section>
      </div>
    </main>
  );
}
