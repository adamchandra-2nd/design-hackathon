import { useState } from "react";
import { Button } from "../components/Button";
import { Character } from "../components/Character";
import { Icon } from "../components/Icon";
import { OUTFIT_CATEGORIES, outfitSummary, type Outfit, type OutfitCategory } from "../data/outfits";
import { ROOMS } from "../data/rooms";
import "./Customize.css";

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
        <Character say={worn.length ? `Pakai ${worn.join(", ")}!` : `Halo, aku ${name}!`} />
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
        <Button block onClick={() => onConfirm(outfit)}>
          Selesai, aku masuk!
        </Button>
      </div>
    </main>
  );
}
