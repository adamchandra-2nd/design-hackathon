import { Button } from "../components/Button";
import { Character } from "../components/Character";
import { OfflineBanner } from "../components/SystemState";
import { formatTime } from "../data/agenda";
import type { GalleryPhoto } from "../data/gallery";
import { ROOMS, roomIndexById } from "../data/rooms";
import "./Gallery.css";

export type GalleryFilter = "semua" | "fotoku";

type Props = {
  photos: GalleryPhoto[];
  filter: GalleryFilter;
  loading: boolean;
  offline: boolean;
  onFilter: (f: GalleryFilter) => void;
  onUpload: () => void;
  onOpen: (photo: GalleryPhoto) => void;
};

/** Galeri: every photo shared by guests who are here, newest first. Anyone can download; you can delete your own. */
export function GalleryScreen({ photos, filter, loading, offline, onFilter, onUpload, onOpen }: Props) {
  const sorted = [...photos].sort((a, b) => b.at - a.at);
  const mine = sorted.filter((p) => p.mine);
  const shown = filter === "fotoku" ? mine : sorted;
  const authors = new Set(photos.map((p) => p.author)).size;

  return (
    <div className="page__scroll screen-enter">
      <header className="page__header">
        <div className="gallery__title-row">
          <h1 className="t-display-h6 page__title">Galeri</h1>
          <Button size="small" icon="Upload" onClick={onUpload}>
            Unggah foto
          </Button>
        </div>
        <p className="t-p-h5 page__sub">
          {photos.length > 0 ? `${photos.length} foto dari ${authors} tamu. ` : ""}Semua tamu yang hadir bisa melihat dan mengunduhnya.
        </p>
      </header>

      {offline && <OfflineBanner />}

      <div className="gallery__filters" role="tablist" aria-label="Filter foto">
        {(["semua", "fotoku"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`gallery__filter t-p-h5-bold${filter === f ? " is-active clay clay-dark" : ""}`}
            onClick={() => onFilter(f)}
          >
            {f === "semua" ? `Semua · ${photos.length}` : `Fotoku · ${mine.length}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="gallery__grid" aria-busy="true" aria-label="Memuat foto">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="gallery__tile gallery__tile--skeleton" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <section className="card gallery__empty">
          {filter === "semua" ? (
            <>
              <div className="gallery__empty-art">
                <Character say="Belum ada foto…" />
              </div>
              <h3 className="t-p-h3-bold panel__title">Jadi yang pertama berbagi!</h3>
              <p className="t-p-h5 panel__body">Pilih foto dari galeri HP-mu, maksimal 5 sekali unggah.</p>
            </>
          ) : (
            <>
              <h3 className="t-p-h3-bold panel__title">Kamu belum berbagi foto</h3>
              <p className="t-p-h5 panel__body">Foto yang kamu unggah muncul di sini. Kamu bisa menghapusnya kapan saja.</p>
            </>
          )}
          <Button block icon="Upload" onClick={onUpload}>
            Unggah foto
          </Button>
        </section>
      ) : (
        <div className="gallery__grid">
          {shown.map((p) => (
            <button key={p.id} type="button" className="gallery__tile" onClick={() => onOpen(p)} aria-label={`Foto dari ${p.author}`}>
              <img src={p.src} alt="" loading="lazy" />
              <span className="gallery__tile-meta">
                <span className="t-p-h5-bold one-line">{p.mine ? "Kamu" : p.author}</span>
                <span className="t-p-h5 one-line">
                  {formatTime(p.at)} · {ROOMS[roomIndexById(p.roomId)].name}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
