import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { KENALAN_TARGET } from "../config";
import { GUESTS, type Guest } from "../data/guests";
import "./KenalanScreen.css";

type Props = {
  collected: Record<string, string>;
  onOpenGuest: (guest: Guest) => void;
  onShowReward: () => void;
};

/** Kenalan: progress toward the reward + guests who are here now. */
export function KenalanScreen({ collected, onOpenGuest, onShowReward }: Props) {
  const count = Object.keys(collected).length;
  const complete = count >= KENALAN_TARGET;
  const slots = Array.from({ length: KENALAN_TARGET }, (_, i) => GUESTS.find((g) => g.id === Object.keys(collected)[i]));

  return (
    <div className="page__scroll screen-enter">
      <header className="page__header">
        <h1 className="t-display-h6 page__title">Kenalan</h1>
        <p className="t-p-h5 page__sub">Sapa tamu yang hadir dan tanyakan pertanyaan di kartunya. Tidak ada jawaban yang salah.</p>
      </header>

      {/* Figma: Kenalan Progress */}
      <section className="kenalan-progress clay clay-accent">
        <div className="kenalan-progress__head">
          <span className="t-p-h4-bold">{complete ? "Semua kartu terkumpul!" : `${count} dari ${KENALAN_TARGET} kartu`}</span>
          <Icon name="Gift" />
        </div>
        <div className="kenalan-progress__slots">
          {slots.map((g, i) => (
            <span key={i} className={`kenalan-progress__slot${g ? " is-filled" : ""}`}>
              {g ? <Avatar initial={g.name.charAt(0)} size="S" /> : <span className="t-p-h5-bold">{i + 1}</span>}
            </span>
          ))}
        </div>
        {complete ? (
          <Button block style="secondary" size="small" onClick={onShowReward}>
            Lihat hadiahmu
          </Button>
        ) : (
          <span className="t-p-h5 kenalan-progress__hint">Kumpulkan {KENALAN_TARGET} kartu untuk dapat hadiah dari Potara.</span>
        )}
      </section>

      <h2 className="t-p-h5-bold section-label">Hadir sekarang · {GUESTS.length} tamu</h2>
      <ul className="list guest-list">
        {GUESTS.map((g) => {
          const done = g.id in collected;
          return (
            <li key={g.id}>
              <button type="button" className="card guest-card" onClick={() => onOpenGuest(g)}>
                <Avatar initial={g.name.charAt(0)} />
                <span className="guest-card__text">
                  <span className="t-p-h4-bold">{g.name}</span>
                  <span className="t-p-h5 guest-card__role">{g.role}</span>
                </span>
                {done ? (
                  <Badge type="hadir">Kartu didapat</Badge>
                ) : (
                  <span className="guest-card__cta t-p-h5-bold">
                    Kenalan
                    <Icon name="ChevronRight" size={16} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
