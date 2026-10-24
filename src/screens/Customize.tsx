import { useState } from "react";
import { Button } from "../components/Button";
import { Character } from "../components/Character";
import { Icon } from "../components/Icon";
import { TextField } from "../components/TextField";
import { CHARACTER_COLORS, colorById } from "../data/characterColors";
import { ROOMS } from "../data/rooms";
import dragonFront from "../assets/characters/dragon-front.webp";
import "./Customize.css";

type Props = {
  initialName: string;
  initialColor: string;
  onConfirm: (name: string, colorId: string) => void;
};

/** Character customisation. Confirming here is what marks the guest as "hadir". */
export function Customize({ initialName, initialColor, onConfirm }: Props) {
  const [name, setName] = useState(initialName);
  const [colorId, setColorId] = useState(initialColor);
  const color = colorById(colorId);
  const trimmed = name.trim();

  return (
    <main className="flow screen-enter">
      <div className="flow__bg" style={{ backgroundImage: `url(${ROOMS[0].image})` }} />
      <div className="flow__top">
        <section className="panel glass">
          <h1 className="t-display-h6 panel__title">Buat karaktermu</h1>
          <p className="t-p-h5 panel__body">Karakter ini yang menemanimu keliling Potara hari ini.</p>
        </section>
      </div>
      <div className="flow__stage">
        <Character hue={color.hue} say={trimmed ? `Halo, aku ${trimmed}!` : undefined} />
      </div>
      <div className="flow__bottom">
        <section className="panel glass">
          <span className="t-p-h5-bold customize__label">Warna · {color.name}</span>
          <div className="customize__colors" role="radiogroup" aria-label="Warna karakter">
            {CHARACTER_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={c.id === colorId}
                aria-label={c.name}
                className={`customize__swatch clay clay-light${c.id === colorId ? " is-selected" : ""}`}
                onClick={() => setColorId(c.id)}
              >
                <span
                  className="customize__face"
                  style={{ backgroundImage: `url(${dragonFront})`, filter: c.hue ? `hue-rotate(${c.hue}deg)` : undefined }}
                />
                {c.id === colorId && (
                  <span className="customize__check">
                    <Icon name="Check" size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <TextField label="Nama panggilan" value={name} onChange={setName} maxLength={16} />
          <div className="panel__actions">
            <Button block disabled={!trimmed} onClick={() => onConfirm(trimmed, colorId)}>
              Selesai, aku masuk!
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
