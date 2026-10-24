import { useCallback, useEffect, useRef, useState } from "react";
import { BottomNav, type NavTab } from "./components/BottomNav";
import { Button } from "./components/Button";
import { Dialog } from "./components/Dialog";
import { Icon } from "./components/Icon";
import { Toast } from "./components/Toast";
import { COUNTDOWN_ENABLED, KENALAN_TARGET } from "./config";
import { colorById } from "./data/characterColors";
import { SAMPLE_COLLECTED, type Guest } from "./data/guests";
import { AgendaScreen } from "./screens/AgendaScreen";
import { CheckIn } from "./screens/CheckIn";
import { CountdownScreen } from "./screens/CountdownScreen";
import { Customize } from "./screens/Customize";
import { DoorOpen } from "./screens/DoorOpen";
import { FeedbackScreen } from "./screens/FeedbackScreen";
import { KenalanScreen } from "./screens/KenalanScreen";
import { MainArea } from "./screens/MainArea";
import { Narasi } from "./screens/Narasi";
import { QuestionCard } from "./screens/QuestionCard";
import { Rsvp } from "./screens/Rsvp";
import { Start } from "./screens/Start";
import { Thanks } from "./screens/Thanks";

type Stage = "rsvp" | "thanks" | "countdown" | "start" | "checkin" | "door" | "narasi" | "customize" | "app";

type AppState = {
  stage: Stage;
  tab: NavTab;
  name: string;
  colorId: string;
  roomIndex: number;
  visited: number[];
  collected: Record<string, string>;
  eventEnded: boolean;
  feedbackSent: boolean;
  introPlayed: boolean;
};

const INITIAL: AppState = {
  stage: "rsvp",
  tab: "ruangan",
  name: "David",
  colorId: "oranye",
  roomIndex: 0,
  visited: [0],
  collected: {},
  eventEnded: false,
  feedbackSent: false,
  introPlayed: false,
};

/** Review links: open any screen directly with #token on the URL. */
const DEEP_LINKS: Record<string, Partial<AppState>> = {
  rsvp: { stage: "rsvp" },
  "terima-kasih": { stage: "thanks" },
  countdown: { stage: "countdown" },
  mulai: { stage: "start" },
  "check-in": { stage: "checkin" },
  pintu: { stage: "door" },
  narasi: { stage: "narasi" },
  karakter: { stage: "customize" },
  ruangan: { stage: "app", tab: "ruangan" },
  agenda: { stage: "app", tab: "agenda", introPlayed: true },
  kenalan: { stage: "app", tab: "kenalan", introPlayed: true },
  feedback: { stage: "app", tab: "feedback", eventEnded: true, introPlayed: true },
  "memory-card": { stage: "app", tab: "feedback", eventEnded: true, feedbackSent: true, introPlayed: true },
};
const APP_SAMPLE: Partial<AppState> = { collected: SAMPLE_COLLECTED, visited: [0, 1, 4] };

function fromHash(): AppState {
  const link = DEEP_LINKS[window.location.hash.slice(1)];
  if (!link) return INITIAL;
  return { ...INITIAL, ...(link.stage === "app" ? APP_SAMPLE : {}), ...link };
}

export default function App() {
  const [state, setState] = useState<AppState>(fromHash);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [reward, setReward] = useState(false);
  const [pageToast, setPageToast] = useState<{ title: string; sub: string; icon: "Lock" | "Share" } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const set = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);

  useEffect(() => {
    const onHash = () => {
      setState(fromHash());
      setGuest(null);
      setReward(false);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const showPageToast = (t: NonNullable<typeof pageToast>) => {
    clearTimeout(toastTimer.current);
    setPageToast(t);
    toastTimer.current = window.setTimeout(() => setPageToast(null), 3000);
  };

  const toDoor = useCallback(() => set({ stage: "door" }), [set]);
  const toNarasi = useCallback(() => set({ stage: "narasi" }), [set]);
  const toCustomize = useCallback(() => set({ stage: "customize" }), [set]);
  const toStart = useCallback(() => set({ stage: "start" }), [set]);

  const color = colorById(state.colorId);
  const kenalanCount = Object.keys(state.collected).length;

  switch (state.stage) {
    case "rsvp":
      return <Rsvp onYes={() => set({ stage: COUNTDOWN_ENABLED ? "countdown" : "start" })} onNo={() => set({ stage: "thanks" })} />;
    case "thanks":
      return <Thanks onChangeToYes={() => set({ stage: COUNTDOWN_ENABLED ? "countdown" : "start" })} />;
    case "countdown":
      return <CountdownScreen name={state.name} onCancel={() => set({ stage: "thanks" })} onDday={toStart} />;
    case "start":
      return <Start name={state.name} onStart={() => set({ stage: "checkin" })} />;
    case "checkin":
      return <CheckIn name={state.name} onBack={toStart} onCheckedIn={toDoor} />;
    case "door":
      return <DoorOpen onDone={toNarasi} />;
    case "narasi":
      return <Narasi onDone={toCustomize} />;
    case "customize":
      return (
        <Customize
          initialName={state.name}
          initialColor={state.colorId}
          onConfirm={(name, colorId) => set({ name, colorId, stage: "app", tab: "ruangan", roomIndex: 0 })}
        />
      );
  }

  const onTab = (tab: NavTab) => {
    setGuest(null);
    set({ tab });
  };
  const onLockedFeedback = () =>
    showPageToast({ icon: "Lock", title: "Feedback belum dibuka", sub: "Dibuka setelah acara selesai. Nikmati dulu acaranya!" });
  const goToRoom = (roomIndex: number) =>
    set({ tab: "ruangan", roomIndex, visited: [...new Set([...state.visited, roomIndex])] });

  if (state.tab === "ruangan") {
    return (
      <MainArea
        name={state.name}
        hue={color.hue}
        kenalanCount={kenalanCount}
        roomIndex={state.roomIndex}
        onRoomChange={(roomIndex) => set({ roomIndex, visited: [...new Set([...state.visited, roomIndex])] })}
        onTab={onTab}
        feedbackLocked={!state.eventEnded}
        playIntro={!state.introPlayed}
        onIntroPlayed={() => set({ introPlayed: true })}
      />
    );
  }

  const saveCard = (g: Guest, answer: string) => {
    const collected = { ...state.collected, [g.id]: answer };
    set({ collected });
    setGuest(null);
    if (Object.keys(collected).length === KENALAN_TARGET) setReward(true);
  };

  return (
    <main className="page">
      {state.tab === "agenda" && <AgendaScreen currentRoomIndex={state.roomIndex} onGoToRoom={goToRoom} />}
      {state.tab === "kenalan" && (
        <KenalanScreen collected={state.collected} onOpenGuest={setGuest} onShowReward={() => setReward(true)} />
      )}
      {state.tab === "feedback" && (
        <FeedbackScreen
          name={state.name}
          hue={color.hue}
          kenalanCount={kenalanCount}
          roomsVisited={state.visited.length}
          submitted={state.feedbackSent}
          onSubmit={() => set({ feedbackSent: true })}
          onShareFallback={() =>
            showPageToast({ icon: "Share", title: "Screenshot kartumu", sub: "Lalu unggah ke Story Instagram dan tag @potara." })
          }
        />
      )}

      <div className="page__bottom">
        <BottomNav active={state.tab} feedbackLocked={!state.eventEnded} onChange={onTab} onLockedTap={onLockedFeedback} />
      </div>

      {pageToast && (
        <div className="page__toast">
          <Toast type="info" icon={pageToast.icon} title={pageToast.title} sub={pageToast.sub} />
        </div>
      )}

      {guest && (
        <QuestionCard
          key={guest.id}
          guest={guest}
          savedAnswer={state.collected[guest.id]}
          onBack={() => setGuest(null)}
          onSave={(answer) => saveCard(guest, answer)}
        />
      )}

      {reward && (
        <Dialog
          title={`${KENALAN_TARGET} kartu terkumpul!`}
          onClose={() => setReward(false)}
          lead={
            <span className="reward-icon clay clay-accent">
              <Icon name="Gift" size={32} />
            </span>
          }
          actions={
            <Button block onClick={() => setReward(false)}>
              Oke, siap!
            </Button>
          }
        >
          Tunjukkan layar ini ke panitia untuk ambil hadiahmu dari Potara.
        </Dialog>
      )}
    </main>
  );
}

