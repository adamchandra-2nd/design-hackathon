import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../components/Button";
import { Character } from "../components/Character";
import { Icon } from "../components/Icon";
import { IconBadge, type IconTone } from "../components/IconBadge";
import type { IconName } from "../components/iconPaths";
import { formatTime } from "../data/agenda";
import { ROOMS } from "../data/rooms";
import type { StageQuestion } from "./data";
import "./stage.css";

/** Bottom sheet (phone pattern), centered on tablets. */
export function Sheet({ icon, tone, title, children, onClose }: { icon: IconName; tone: IconTone; title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <span className="sheet__grip" />
        <header className="sheet__head">
          <IconBadge icon={icon} tone={tone} size="S" />
          <h2 className="t-p-h3-bold stage-card__title">{title}</h2>
          <button type="button" className="icon-btn clay clay-light" aria-label="Tutup" onClick={onClose}>
            <Icon name="Close" size={20} />
          </button>
        </header>
        <div className="sheet__body">{children}</div>
      </section>
    </div>
  );
}

/** Error / 404 for the stage apps, same card as the login. */
export function StageSystem({ kind, onRetry }: { kind: "error" | "404"; onRetry: () => void }) {
  return (
    <main className="stage-login" style={{ backgroundImage: `url(${ROOMS[0].image})` }}>
      <section className="stage-login__card">
        <div style={{ height: 220, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
          <Character say={kind === "404" ? "Kok nyasar?" : "Waduh…"} />
        </div>
        <div className="stage-login__head">
          <h1 className="stage-login__title">{kind === "404" ? "Halaman tidak ditemukan" : "Ups, ada yang tidak beres"}</h1>
          <p className="t-p-h4 stage-login__body">
            {kind === "404" ? "Link ini tidak ada. Buka lagi link dari WhatsApp panitia." : "Server tidak merespons. Timer dan naskah tetap aman, coba lagi sebentar."}
          </p>
        </div>
        <Button block icon="ArrowRight" onClick={onRetry}>
          {kind === "404" ? "Ke Panggung" : "Coba lagi"}
        </Button>
      </section>
    </main>
  );
}

/** Question card. Swipe right = primary action, left = skip (buttons do the same). */
export function QCard({
  q,
  picked,
  primary,
  secondary,
  tag,
}: {
  q: StageQuestion;
  picked?: boolean;
  primary?: { label: string; icon: IconName; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
  tag?: ReactNode;
}) {
  const start = useRef<number | null>(null);
  const [dx, setDx] = useState(0);
  return (
    <li
      className={`q-card${picked ? " is-picked" : ""}${dx > 60 ? " swipe-right" : dx < -60 ? " swipe-left" : ""}`}
      style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
      onPointerDown={(e) => {
        if (!primary && !secondary) return;
        if ((e.target as HTMLElement).closest("button")) return;
        start.current = e.clientX;
      }}
      onPointerMove={(e) => start.current !== null && setDx(Math.max(-120, Math.min(120, e.clientX - start.current)))}
      onPointerUp={() => {
        if (dx > 80) primary?.onClick();
        else if (dx < -80) secondary?.onClick();
        start.current = null;
        setDx(0);
      }}
      onPointerCancel={() => {
        start.current = null;
        setDx(0);
      }}
    >
      <span className="q-card__meta t-p-h5">
        <span className="t-p-h5-bold">{q.author ?? "Anonim"}</span>
        <span>{formatTime(q.at)}</span>
      </span>
      <p className="q-card__text">{q.text}</p>
      {tag}
      {(primary || secondary) && (
        <div className="q-card__actions">
          {secondary ? (
            <Button size="small" style="tertiary" onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          ) : (
            <span />
          )}
          {primary && (
            <Button size="small" style="secondary" icon={primary.icon} onClick={primary.onClick}>
              {primary.label}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

/** Full-screen read mode: one question at a time, big text. */
export function ReadMode({
  list,
  note,
  doneLabel,
  onDone,
  onSkip,
  onClose,
}: {
  list: StageQuestion[];
  note?: string;
  doneLabel: string;
  onDone: (id: string) => void;
  onSkip: (id: string) => void;
  onClose: () => void;
}) {
  const q = list[0];
  return (
    <div className="read-mode screen-enter" role="dialog" aria-modal="true" aria-label="Mode baca">
      <div className="read-mode__top">
        <span className="t-p-h4-bold">{q ? `Pertanyaan · sisa ${list.length}` : "Mode baca"}</span>
        <button type="button" className="icon-btn clay clay-dark" aria-label="Tutup mode baca" onClick={onClose}>
          <Icon name="Close" />
        </button>
      </div>
      <div className="read-mode__body">
        {q ? (
          <>
            <span className="t-p-h4 read-mode__who">
              {q.author ?? "Anonim"} · {formatTime(q.at)}
            </span>
            <p className="read-mode__text">{q.text}</p>
            {note && <span className="t-p-h5 read-mode__who">{note}</span>}
          </>
        ) : (
          <p className="read-mode__text">Semua pertanyaan pilihan sudah selesai 🎉</p>
        )}
      </div>
      <div className="read-mode__actions">
        {q ? (
          <>
            <Button block icon="Check" onClick={() => onDone(q.id)}>
              {doneLabel}
            </Button>
            <Button block style="tertiary" onClick={() => onSkip(q.id)}>
              Lewati
            </Button>
          </>
        ) : (
          <Button block style="tertiary" onClick={onClose}>
            Tutup
          </Button>
        )}
      </div>
    </div>
  );
}
