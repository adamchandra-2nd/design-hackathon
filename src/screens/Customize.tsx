import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Character } from "../components/Character";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { OUTFIT_CATEGORIES, outfitSummary, type Outfit, type OutfitCategory } from "../data/outfits";
import { ROOMS } from "../data/rooms";
import "./Customize.css";

const WARN_AFTER_MS = 3000;

type Props = {
  /** From the invitation; guests can't rename themselves. */
  name: string;
  initialOutfit: Outfit;
  onConfirm: (outfit: Outfit) => void;
};

/** Character customisation: outfit only (the dragon stays orange). Confirming here marks the guest "hadir". */
export function Customize({ name, initialOutfit, onConfirm }: Props) {
  const [outfit, setOutfit] = useState<Outfit>(initialOutfit);
  const [cat, setCat] = useState<OutfitCategory>("baju");
  const category = OUTFIT_CATEGORIES.find((c) => c.id === cat)!;
  const worn = outfitSummary(outfit);

  const [idle, setIdle] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // After a few quiet seconds, the character reminds the guest that the outfit is final.
  useEffect(() => {
    setIdle(false);
    const t = window.setTimeout(() => setIdle(true), WARN_AFTER_MS);
    return () => clearTimeout(t);
  }, [outfit, cat]);

  const pick = (item: string | null) => setOutfit({ ...outfit, [cat]: item });

  return (
    <main className="flow customize screen-enter">
      <div className="flow__bg" style={{ backgroundImage: `url(${ROOMS[0].image})` }} />
      <div className="flow__top">
        <section className="panel glass">
          <h1 className="t-display-h6 panel__title">Buat karaktermu</h1>
          <p className="t-p-h5 panel__body">Pilih pakaian untuk karaktermu, {name}.</p>
        </section>
      </div>
      <div className="flow__stage">
        <Character say={idle ? "Pilih yang pas ya! Nanti nggak bisa ganti 🙈" : worn.length ? `Pakai ${worn.join(", ")}!` : `Halo, aku ${name}!`} />
      </div>
      <div className="flow__bottom">
        <section className="panel glass customize__panel">
          <div className="customize__tabs" role="tablist" aria-label="Kategori pakaian">
            {OUTFIT_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={c.id === cat}
                className={`customize__tab t-p-h5-bold${c.id === cat ? " is-active clay clay-dark" : ""}`}
                onClick={() => setCat(c.id)}
              >
                {c.label}
                {outfit[c.id] && <span className="customize__tab-dot" aria-label="dipilih" />}
              </button>
            ))}
          </div>
          <div className="customize__items" role="radiogroup" aria-label={category.label}>
            {[null, ...category.items].map((item) => {
              const selected = outfit[cat] === item;
              return (
                <button
                  key={item ?? "none"}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`customize__item clay clay-light${selected ? " is-selected" : ""}`}
                  onClick={() => pick(item)}
                >
                  <span className="customize__thumb">
                    <Icon name={item ? "Sparkle" : "Close"} size={20} />
                  </span>
                  <span className="t-p-h5-bold customize__item-label">{item ?? "Tanpa"}</span>
                  {selected && (
                    <span className="customize__check">
                      <Icon name="Check" size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <Button block onClick={() => setConfirm(true)}>
          Selesai, aku masuk!
        </Button>
      </div>
      {confirm && (
        <Dialog
          title="Yakin sama gayamu?"
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button block onClick={() => onConfirm(outfit)}>
                Yakin, masuk!
              </Button>
              <Button block style="tertiary" onClick={() => setConfirm(false)}>
                Pilih lagi
              </Button>
            </>
          }
        >
          Nanti nggak bisa ganti baju lagi. Malu kalau ada yang lihat!
        </Dialog>
      )}
    </main>
  );
}
