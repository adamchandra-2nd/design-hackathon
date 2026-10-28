import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav, type NavTab } from "./components/BottomNav";
import { Button } from "./components/Button";
import { Dialog } from "./components/Dialog";
import { Icon } from "./components/Icon";
import type { RewardState } from "./components/RoomHeader";
import { SystemState } from "./components/SystemState";
import { Toast, ToastIcon } from "./components/Toast";
import { COUNTDOWN_ENABLED, DEMO_NOW, KENALAN_TARGET } from "./config";
import { AGENDA, currentItem, eventEndedAt } from "./data/agenda";
import { SAMPLE_QUESTIONS, type AskedQuestion } from "./data/questions";
import { ROOMS, roomIndexById } from "./data/rooms";
import { AdminApp } from "./admin/AdminApp";
import { McApp } from "./stage/McApp";
import { PerformerApp } from "./stage/PerformerApp";
import { AskScreen } from "./screens/AskScreen";
import { EventFeedback } from "./screens/EventFeedback";
import { GUESTS, SAMPLE_COLLECTED } from "./data/guests";
import { SAMPLE_PHOTOS, SAMPLE_PICKS, type GalleryPhoto, type PickedPhoto } from "./data/gallery";
import { EMPTY_OUTFIT, type Outfit } from "./data/outfits";
import { AgendaScreen } from "./screens/AgendaScreen";
import { CheckIn, type CheckInScenario } from "./screens/CheckIn";
import { CountdownScreen } from "./screens/CountdownScreen";
import { Customize } from "./screens/Customize";
import { DoorOpen } from "./screens/DoorOpen";
import { FeedbackScreen } from "./screens/FeedbackScreen";
import { GalleryScreen, type GalleryFilter } from "./screens/GalleryScreen";
import { PhotoViewer } from "./screens/PhotoViewer";
import { readPicked, usePhotoPicker, type PickResult } from "./screens/PhotoPicker";
import { UploadScreen } from "./screens/UploadScreen";
import { KenalanScreen } from "./screens/KenalanScreen";
import { MainArea, type MainScenario } from "./screens/MainArea";
import { MyQr } from "./screens/MyQr";
import { Narasi } from "./screens/Narasi";
import { QuestionCard } from "./screens/QuestionCard";
import { Review } from "./screens/Review";
import { Rsvp } from "./screens/Rsvp";
import { Start } from "./screens/Start";
import { Thanks } from "./screens/Thanks";
import { Voucher } from "./screens/Voucher";

type Stage = "rsvp" | "thanks" | "countdown" | "start" | "checkin" | "door" | "narasi" | "customize" | "app" | "review";
type Overlay =
  | { type: "guest"; id: string }
  | { type: "myqr" }
  | { type: "voucher" }
  | { type: "reward" }
  | { type: "ask"; eventId: string }
  | { type: "photo"; id: string; confirmDelete?: boolean }
  | { type: "upload"; initial: PickResult }
  | null;

type AppState = {
  stage: Stage;
  tab: NavTab;
  name: string;
  outfit: Outfit;
  roomIndex: number;
  visited: number[];
  collected: Record<string, string>;
  rewardClaimed: boolean;
  feedbackSent: boolean;
  countdownEnabled: boolean;
  /** Rundown clock (minutes since 00:00). */
  now: number;
  checkIn: CheckInScenario;
  mainScenario: MainScenario;
  guestsPresent: boolean;
  changedId?: string;
  offline: boolean;
  questions: AskedQuestion[];
  /** Rundown minute the guest became "hadir"; only events ending after this ask for feedback. */
  hadirAt: number;
  /** Per-event feedback already sent (event id → rating). */
  eventFeedback: Record<string, number>;
  feedbackOffline: boolean;
  askClosed: boolean;
  askOffline: boolean;
  /** Review case: the MC reads the question while the guest is editing it. */
  askRace: boolean;
  /** Shared gallery (sample feed + this guest's uploads). */
  photos: GalleryPhoto[];
  galleryFilter: GalleryFilter;
  /** Unseen photos from other guests: dot on the Galeri tab. */
  newPhotos: boolean;
  galleryLoading: boolean;
  /** Review case: sharing fails (no connection). */
  uploadOffline: boolean;
  system: "loading" | "error" | "offline" | null;
  overlay: Overlay;
};

const INITIAL: AppState = {
  stage: "rsvp",
  tab: "ruangan",
  name: "David",
  outfit: EMPTY_OUTFIT,
  roomIndex: 0,
  visited: [0],
  collected: {},
  rewardClaimed: false,
  feedbackSent: false,
  countdownEnabled: COUNTDOWN_ENABLED,
  now: DEMO_NOW.live,
  checkIn: "ok",
  mainScenario: "intro",
  guestsPresent: true,
  offline: false,
  questions: SAMPLE_QUESTIONS,
  hadirAt: DEMO_NOW.live,
  eventFeedback: {},
  feedbackOffline: false,
  askClosed: false,
  askOffline: false,
  askRace: false,
  photos: SAMPLE_PHOTOS,
  galleryFilter: "semua",
  newPhotos: false,
  galleryLoading: false,
  uploadOffline: false,
  system: null,
  overlay: null,
};

/** In-app sample: 3 cards collected, a couple of rooms visited. */
const ALL_FEEDBACK = Object.fromEntries(AGENDA.map((a) => [a.id, 5]));
const APP: Partial<AppState> = {
  stage: "app",
  collected: SAMPLE_COLLECTED,
  visited: [0, 1, 4],
  mainScenario: "none",
  hadirAt: 9 * 60,
  eventFeedback: { pembukaan: 4 },
};
/** Right after the talkshow ends, guest still in Ruang Omakase. */
const TALKSHOW_DONE = 10 * 60 + 31;
const FOUR = { ...SAMPLE_COLLECTED, raka: "Kucing oren, katanya." };
const FIVE = { ...FOUR, laras: "Kopi pagi yang pas." };

/** Review cases for the upload screen: n photos "picked" from the gallery. */
const picked = (n: number): PickResult => ({ picks: SAMPLE_PICKS(n), notImage: 0, tooBig: 0, overLimit: 0 });

/** Review links: open any screen or case directly with #token (see the #review hub). */
const DEEP_LINKS: Record<string, Partial<AppState>> = {
  review: { stage: "review" },
  rsvp: { stage: "rsvp" },
  "test-day": { stage: "rsvp", countdownEnabled: false },
  "terima-kasih": { stage: "thanks" },
  countdown: { stage: "countdown" },
  mulai: { stage: "start" },
  "check-in": { stage: "checkin" },
  "check-in-qr-salah": { stage: "checkin", checkIn: "invalid" },
  "check-in-kamera": { stage: "checkin", checkIn: "denied" },
  "check-in-offline": { stage: "checkin", checkIn: "offline" },
  pintu: { stage: "door" },
  narasi: { stage: "narasi" },
  karakter: { stage: "customize" },
  ruangan: { ...APP, collected: {}, visited: [0], mainScenario: "intro" },
  "ruangan-ramai": { ...APP, mainScenario: "ramai", roomIndex: 1 },
  "ruangan-segera": { ...APP, now: DEMO_NOW.soon, mainScenario: "segera" },
  "ruangan-jeda": { ...APP, now: DEMO_NOW.between, roomIndex: 2 },
  "ruangan-berubah": { ...APP, mainScenario: "berubah", changedId: "pengenalan" },
  "ruangan-hadiah": { ...APP, collected: FIVE, mainScenario: "hadiah", roomIndex: 4 },
  "ruangan-selesai": { ...APP, now: DEMO_NOW.ended, eventFeedback: ALL_FEEDBACK },
  "ruangan-offline": { ...APP, offline: true, roomIndex: 4 },
  agenda: { ...APP, tab: "agenda" },
  "agenda-berubah": { ...APP, tab: "agenda", changedId: "pengenalan" },
  "agenda-selesai": { ...APP, tab: "agenda", now: DEMO_NOW.ended, eventFeedback: ALL_FEEDBACK },
  kenalan: { ...APP, tab: "kenalan" },
  "kenalan-kosong": { ...APP, tab: "kenalan", collected: {}, guestsPresent: false },
  "kenalan-kartu": { ...APP, tab: "kenalan", overlay: { type: "guest", id: "nanda" } },
  "kenalan-qr": { ...APP, tab: "kenalan", overlay: { type: "myqr" } },
  "kenalan-hampir": { ...APP, tab: "kenalan", collected: FOUR },
  "kenalan-hadiah": { ...APP, tab: "kenalan", collected: FIVE },
  voucher: { ...APP, tab: "kenalan", collected: FIVE, overlay: { type: "voucher" } },
  "kenalan-selesai": { ...APP, tab: "kenalan", collected: FIVE, rewardClaimed: true },
  feedback: { ...APP, tab: "feedback", now: DEMO_NOW.ended, eventFeedback: ALL_FEEDBACK },
  "memory-card": { ...APP, tab: "feedback", now: DEMO_NOW.ended, feedbackSent: true, eventFeedback: ALL_FEEDBACK },
  tanya: { ...APP, overlay: { type: "ask", eventId: "talkshow" } },
  "tanya-kosong": { ...APP, questions: [], overlay: { type: "ask", eventId: "talkshow" } },
  "tanya-ditutup": { ...APP, askClosed: true, overlay: { type: "ask", eventId: "talkshow" } },
  "tanya-gagal": { ...APP, askOffline: true, overlay: { type: "ask", eventId: "talkshow" } },
  "tanya-keburu-dibaca": { ...APP, askRace: true, overlay: { type: "ask", eventId: "talkshow" } },
  galeri: { ...APP, tab: "galeri" },
  "galeri-kosong": { ...APP, tab: "galeri", photos: [] },
  "galeri-fotoku": { ...APP, tab: "galeri", galleryFilter: "fotoku" },
  "galeri-fotoku-kosong": { ...APP, tab: "galeri", galleryFilter: "fotoku", photos: SAMPLE_PHOTOS.filter((p) => !p.mine) },
  "galeri-memuat": { ...APP, tab: "galeri", galleryLoading: true },
  "galeri-offline": { ...APP, tab: "galeri", offline: true },
  "galeri-foto": { ...APP, tab: "galeri", overlay: { type: "photo", id: "p1" } },
  "galeri-foto-milikku": { ...APP, tab: "galeri", overlay: { type: "photo", id: "p2" } },
  "galeri-hapus": { ...APP, tab: "galeri", overlay: { type: "photo", id: "p2", confirmDelete: true } },
  "galeri-unggah": { ...APP, tab: "galeri", roomIndex: 1, overlay: { type: "upload", initial: picked(3) } },
  "galeri-unggah-batas": { ...APP, tab: "galeri", roomIndex: 1, overlay: { type: "upload", initial: { ...picked(5), overLimit: 2 } } },
  "galeri-unggah-file-salah": { ...APP, tab: "galeri", roomIndex: 1, overlay: { type: "upload", initial: { ...picked(2), notImage: 1, tooBig: 1 } } },
  "galeri-unggah-gagal": { ...APP, tab: "galeri", roomIndex: 1, uploadOffline: true, overlay: { type: "upload", initial: picked(2) } },
  "ruangan-foto-baru": { ...APP, mainScenario: "foto-baru", newPhotos: true, roomIndex: 1 },
  "feedback-acara": { ...APP, now: TALKSHOW_DONE, roomIndex: 4 },
  "feedback-acara-gagal": { ...APP, now: TALKSHOW_DONE, roomIndex: 4, feedbackOffline: true },
  memuat: { system: "loading" },
  error: { system: "error" },
  offline: { system: "offline" },
};

const STORAGE_KEY = "hmd-progress-v2";
/** Only real progress is saved, so reopening the app resumes where the guest left off. */
const PERSISTED: (keyof AppState)[] = ["stage", "tab", "name", "outfit", "roomIndex", "visited", "collected", "rewardClaimed", "feedbackSent", "questions", "hadirAt", "eventFeedback"];

function load(): AppState {
  const token = window.location.hash.slice(1);
  const link = DEEP_LINKS[token];
  if (link) return { ...INITIAL, ...link };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved && saved.stage && saved.stage !== "review") return { ...INITIAL, ...saved, mainScenario: "none" };
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  return INITIAL;
}

/** Re-mount everything when a review link changes the hash, so each case starts fresh. */
export default function App() {
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    const onHash = () => setEpoch((e) => e + 1);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  // Admin (desktop) lives under #admin… links; everything else is the guest app.
  const token = window.location.hash.slice(1);
  if (token.startsWith("admin")) return <AdminApp key={epoch} token={token} />;
  // MC and speakers (phone + tablet) live under #mc… and #pembicara… links.
  if (token === "mc" || token.startsWith("mc-")) return <McApp key={epoch} token={token} />;
  if (token.startsWith("pembicara")) return <PerformerApp key={epoch} token={token} />;
  return <Flow key={epoch} />;
}

function Flow() {
  const [state, setState] = useState<AppState>(load);
  const [pageToast, setPageToast] = useState<{ icon: "Lock" | "Share" | "Check" | "Download" | "Trash" | "WifiOff" | "Image"; title: string; sub: string } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const set = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);

  useEffect(() => {
    try {
      const snapshot = Object.fromEntries(PERSISTED.map((k) => [k, state[k]]));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* private mode: progress just isn't remembered */
    }
  }, [state]);

  const showPageToast = (t: NonNullable<typeof pageToast>) => {
    clearTimeout(toastTimer.current);
    setPageToast(t);
    toastTimer.current = window.setTimeout(() => setPageToast(null), 3500);
  };

  // Galeri: photos come from the phone's photo library only (no in-app camera).
  const photoPicker = usePhotoPicker((files) => {
    const r = readPicked(files);
    if (r.picks.length) return set({ overlay: { type: "upload", initial: r } });
    showPageToast({
      icon: "Image",
      title: "Tidak ada foto yang bisa diunggah",
      sub: r.tooBig ? "Ukuran foto maksimal 10 MB." : "Pilih file gambar dari galeri HP-mu.",
    });
  });

  const toDoor = useCallback(() => set({ stage: "door" }), [set]);
  const toNarasi = useCallback(() => set({ stage: "narasi" }), [set]);
  const toCustomize = useCallback(() => set({ stage: "customize" }), [set]);
  const toStart = useCallback(() => set({ stage: "start" }), [set]);
  const onScenarioPlayed = useCallback(() => set({ mainScenario: "none" }), [set]);

  if (state.system) {
    return <SystemState type={state.system} onRetry={() => set({ system: state.system === "loading" ? null : "loading" })} />;
  }

  const afterYes = () => set({ stage: state.countdownEnabled ? "countdown" : "start" });
  switch (state.stage) {
    case "review":
      return <Review />;
    case "rsvp":
      return <Rsvp onYes={afterYes} onNo={() => set({ stage: "thanks" })} />;
    case "thanks":
      return <Thanks onChangeToYes={afterYes} />;
    case "countdown":
      return <CountdownScreen onCancel={() => set({ stage: "thanks" })} onDday={toStart} />;
    case "start":
      return <Start onStart={() => set({ stage: "checkin" })} />;
    case "checkin":
      return <CheckIn name={state.name} scenario={state.checkIn} onBack={toStart} onCheckedIn={toDoor} />;
    case "door":
      return <DoorOpen onDone={toNarasi} />;
    case "narasi":
      return <Narasi onDone={toCustomize} />;
    case "customize":
      return (
        <Customize
          name={state.name}
          initialOutfit={state.outfit}
          onConfirm={(outfit) => set({ outfit, stage: "app", tab: "ruangan", roomIndex: 0, mainScenario: "intro", hadirAt: state.now })}
        />
      );
  }

  // ---------- In the app (after check-in + customisation = hadir) ----------
  const ended = eventEndedAt(state.now);
  const count = Object.keys(state.collected).length;
  const reward: RewardState = count < KENALAN_TARGET ? "collecting" : state.rewardClaimed ? "claimed" : "ready";
  const guests = state.guestsPresent ? GUESTS : [];

  const onTab = (tab: NavTab) => set({ tab, overlay: null, ...(tab === "galeri" ? { newPhotos: false } : {}) });
  const goToRoom = (roomIndex: number) => set({ tab: "ruangan", roomIndex, visited: [...new Set([...state.visited, roomIndex])], overlay: null });
  const openReward = () => set({ tab: "kenalan", overlay: { type: "voucher" } });
  const live = ended ? undefined : currentItem(state.now);
  const openAsk = () => live && set({ overlay: { type: "ask", eventId: live.id } });
  const askEvent = state.overlay?.type === "ask" ? AGENDA.find((a) => a.id === (state.overlay as { eventId: string }).eventId) : undefined;
  const askScreen = askEvent && (
    <AskScreen
      event={askEvent}
      roomName={ROOMS[roomIndexById(askEvent.roomId)].name}
      questions={state.questions.filter((q) => q.eventId === askEvent.id)}
      closed={state.askClosed}
      offline={state.askOffline}
      onBack={() => set({ overlay: null })}
      onEdit={(id, text) => {
        if (state.askRace) {
          set({ questions: state.questions.map((q) => (q.id === id ? { ...q, status: "dibaca" } : q)) });
          return false;
        }
        set({ questions: state.questions.map((q) => (q.id === id ? { ...q, text, edited: true } : q)) });
        return true;
      }}
      onDelete={(id) => set({ questions: state.questions.filter((q) => q.id !== id) })}
      onSend={(text, anonymous) =>
        set({
          questions: [
            ...state.questions,
            { id: `q${Date.now()}`, eventId: askEvent.id, text, author: anonymous ? null : state.name, mine: true, status: "terkirim", at: state.now },
          ],
        })
      }
    />
  );

  // Per-event feedback is required: it takes over the screen until it's sent.
  const due = AGENDA.find((a) => a.end <= state.now && a.end > state.hadirAt && !(a.id in state.eventFeedback));
  if (due) {
    return (
      <EventFeedback
        key={due.id}
        event={due}
        roomName={ROOMS[roomIndexById(due.roomId)].name}
        offline={state.feedbackOffline}
        onSubmit={(rating) =>
          set({ eventFeedback: { ...state.eventFeedback, [due.id]: rating }, tab: "ruangan", overlay: null, mainScenario: "setelah-feedback" })
        }
      />
    );
  }

  if (state.tab === "ruangan") {
    return (
      <>
        <MainArea
          name={state.name}
          kenalanCount={count}
          reward={reward}
          roomIndex={state.roomIndex}
          onRoomChange={(roomIndex) => set({ roomIndex, visited: [...new Set([...state.visited, roomIndex])] })}
          onTab={onTab}
          now={state.now}
          ended={ended}
          offline={state.offline}
          scenario={state.mainScenario}
          onScenarioPlayed={onScenarioPlayed}
          onOpenReward={openReward}
          onAsk={openAsk}
          newPhotos={state.newPhotos}
        />
        {askScreen}
      </>
    );
  }

  const collect = (guestId: string, note: string) => {
    const collected = { ...state.collected, [guestId]: note };
    const g = GUESTS.find((x) => x.id === guestId)!;
    const done = Object.keys(collected).length === KENALAN_TARGET;
    set({ collected, overlay: done ? { type: "reward" } : null });
    if (!done) showPageToast({ icon: "Check", title: `Kartu ${g.name} didapat!`, sub: `${g.name} juga dapat kartumu.` });
  };

  const startUpload = () => {
    if (state.offline) return showPageToast({ icon: "WifiOff", title: "Unggah butuh internet", sub: "Sambungkan lagi, lalu coba unggah." });
    photoPicker.open();
  };
  const sharePhotos = (picks: PickedPhoto[]) => {
    const room = ROOMS[state.roomIndex].id;
    const added = picks.map((p, i) => ({ id: `mine-${Date.now()}-${i}`, src: p.src, author: state.name, mine: true, at: state.now, roomId: room, caption: p.caption.trim() || undefined }));
    set({ photos: [...added, ...state.photos], overlay: null, tab: "galeri" });
    showPageToast({ icon: "Check", title: `${picks.length} foto dibagikan`, sub: "Semua tamu yang hadir sekarang bisa melihatnya." });
  };
  const downloadPhoto = (p: GalleryPhoto) => {
    const a = document.createElement("a");
    a.href = p.src;
    a.download = `hmd-foto-${p.author.toLowerCase()}-${p.id}.jpg`;
    a.click();
    showPageToast({ icon: "Download", title: "Foto diunduh", sub: "Cek folder unduhan atau galeri HP-mu." });
  };
  const deletePhoto = (p: GalleryPhoto) => {
    set({ photos: state.photos.filter((x) => x.id !== p.id), overlay: null });
    showPageToast({ icon: "Trash", title: "Foto dihapus", sub: "Tamu lain tidak bisa melihatnya lagi." });
  };
  // The viewer pages through the same list the grid shows.
  const viewerPhotos = [...state.photos].sort((a, b) => b.at - a.at).filter((p) => state.galleryFilter === "semua" || p.mine);

  const overlay = state.overlay;
  const guest = overlay?.type === "guest" ? GUESTS.find((g) => g.id === overlay.id) : undefined;

  return (
    <main className="page">
      {state.tab === "agenda" && (
        <AgendaScreen
          now={state.now}
          currentRoomIndex={state.roomIndex}
          changedId={state.changedId}
          ended={ended}
          onGoToRoom={goToRoom}
          onFeedback={() => onTab("feedback")}
          onAsk={openAsk}
          feedbackSent={state.eventFeedback}
        />
      )}
      {state.tab === "kenalan" && (
        <KenalanScreen
          guests={guests}
          collected={state.collected}
          reward={reward}
          onOpenGuest={(g) => set({ overlay: { type: "guest", id: g.id } })}
          onMyQr={() => set({ overlay: { type: "myqr" } })}
          onReward={() => set({ overlay: { type: "voucher" } })}
        />
      )}
      {state.tab === "galeri" && (
        <GalleryScreen
          photos={state.photos}
          filter={state.galleryFilter}
          loading={state.galleryLoading}
          offline={state.offline}
          onFilter={(galleryFilter) => set({ galleryFilter })}
          onUpload={startUpload}
          onOpen={(p) => set({ overlay: { type: "photo", id: p.id } })}
        />
      )}
      {state.tab === "feedback" && (
        <FeedbackScreen
          name={state.name}
          kenalanCount={count}
          roomsVisited={state.visited.length}
          submitted={state.feedbackSent}
          onSubmit={() => set({ feedbackSent: true })}
          onShareFallback={() =>
            showPageToast({ icon: "Share", title: "Screenshot kartumu", sub: "Lalu unggah ke Story Instagram dan tag Potara." })
          }
        />
      )}

      <div className="page__bottom">
        <BottomNav
          active={state.tab}
          feedbackLocked={!ended}
          dots={{ galeri: state.newPhotos }}
          onChange={onTab}
          onLockedTap={() =>
            showPageToast({ icon: "Lock", title: "Feedback belum dibuka", sub: "Dibuka setelah acara selesai. Nikmati dulu acaranya!" })
          }
        />
      </div>

      {guest && (
        <QuestionCard
          key={guest.id}
          guest={guest}
          savedNote={state.collected[guest.id]}
          onBack={() => set({ overlay: null })}
          onCollected={(note) => collect(guest.id, note)}
        />
      )}
      {overlay?.type === "voucher" && (
        <Voucher
          name={state.name}
          claimed={state.rewardClaimed}
          onBack={() => set({ overlay: null })}
          onClaimed={() => set({ rewardClaimed: true })}
        />
      )}
      {askScreen}
      {photoPicker.input}
      {overlay?.type === "photo" && (
        <PhotoViewer
          photos={viewerPhotos}
          startId={overlay.id}
          confirmDelete={overlay.confirmDelete}
          onClose={() => set({ overlay: null })}
          onDownload={downloadPhoto}
          onDelete={deletePhoto}
        />
      )}
      {overlay?.type === "upload" && (
        <UploadScreen
          initial={overlay.initial}
          roomName={ROOMS[state.roomIndex].name}
          offline={state.uploadOffline || state.offline}
          onBack={() => set({ overlay: null })}
          onShared={sharePhotos}
        />
      )}
      {overlay?.type === "myqr" && <MyQr name={state.name} onClose={() => set({ overlay: null })} />}
      {overlay?.type === "reward" && (
        <Dialog
          title={`${KENALAN_TARGET} kartu terkumpul!`}
          onClose={() => set({ overlay: null })}
          lead={
            <span className="reward-icon clay clay-dark">
              <Icon name="Gift" size={32} />
            </span>
          }
          actions={
            <>
              <Button block onClick={() => set({ overlay: { type: "voucher" } })}>
                Tukar sekarang
              </Button>
              <Button block style="tertiary" onClick={() => set({ overlay: null })}>
                Nanti saja
              </Button>
            </>
          }
        >
          Hadiahmu dari Potara siap. Tukar di meja panitia sekarang, atau nanti sebelum pulang.
        </Dialog>
      )}

      {pageToast && (
        <div className="page__toast">
          <Toast
            lead={<ToastIcon icon={pageToast.icon} tone={pageToast.icon === "Check" ? "accent" : "neutral"} />}
            title={pageToast.title}
            sub={pageToast.sub}
          />
        </div>
      )}
    </main>
  );
}
