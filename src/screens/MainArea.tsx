import { useEffect, useRef, useState } from "react";
import { AgendaMini } from "../components/AgendaMini";
import { BottomNav, type NavTab } from "../components/BottomNav";
import { Character } from "../components/Character";
import { RoomHeader } from "../components/RoomHeader";
import { RoomIndicator } from "../components/RoomIndicator";
import { SwipeHint } from "../components/SwipeHint";
import { Toast } from "../components/Toast";
import { LIVE_ROOM_ID, ROOMS } from "../data/rooms";
import "./MainArea.css";

const SWIPE_THRESHOLD = 50;

/** Main area: the character stands in the middle of a Potara room; every action floats on top. */
export function MainArea() {
  const [roomIndex, setRoomIndex] = useState(() => ROOMS.findIndex((r) => r.id === LIVE_ROOM_ID));
  const [tab, setTab] = useState<NavTab>("ruangan");
  const [toastVisible, setToastVisible] = useState(false);
  const dragStartX = useRef<number | null>(null);

  // Demo: another guest arrives shortly after opening, toast hides after 5s.
  useEffect(() => {
    const show = setTimeout(() => setToastVisible(true), 1200);
    const hide = setTimeout(() => setToastVisible(false), 6200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const goTo = (i: number) => setRoomIndex(Math.max(0, Math.min(ROOMS.length - 1, i)));
  const room = ROOMS[roomIndex];

  return (
    <main
      className="main-area"
      onPointerDown={(e) => (dragStartX.current = e.clientX)}
      onPointerUp={(e) => {
        if (dragStartX.current === null) return;
        const dx = e.clientX - dragStartX.current;
        dragStartX.current = null;
        if (Math.abs(dx) > SWIPE_THRESHOLD) goTo(roomIndex + (dx < 0 ? 1 : -1));
      }}
    >
      {/* Layer 1: room illustrations, side by side */}
      <div className="room-track" style={{ transform: `translateX(-${roomIndex * 100}%)` }}>
        {ROOMS.map((r) => (
          <section key={r.id} className="room" aria-hidden={r.id !== room.id}>
            <span className="room__label t-p-h5-bold">ILUSTRASI RUANGAN · {r.name.toUpperCase()}</span>
            <span className="room__floor" />
          </section>
        ))}
      </div>

      {/* Layer 2: floating actions */}
      <div className="main-area__top">
        <RoomHeader name="David" kenalanCount={3} kenalanTarget={5} />
        <AgendaMini
          eyebrow="Sekarang · Ruang Omakase"
          title="Talkshow"
          next="Berikutnya: Pengenalan kantor"
          onClick={() => setTab("agenda")}
        />
      </div>

      {toastVisible && (
        <div className="main-area__toast">
          <Toast name="Nanda" onGreet={() => setTab("kenalan")} />
        </div>
      )}

      <div className="main-area__stage">
        <Character />
        <RoomIndicator
          name={room.name}
          index={roomIndex}
          total={ROOMS.length}
          live={room.id === LIVE_ROOM_ID}
        />
      </div>

      {roomIndex > 0 && (
        <div className="main-area__edge main-area__edge--left">
          <SwipeHint direction="left" label={`Ke ${ROOMS[roomIndex - 1].name}`} onClick={() => goTo(roomIndex - 1)} />
        </div>
      )}
      {roomIndex < ROOMS.length - 1 && (
        <div className="main-area__edge main-area__edge--right">
          <SwipeHint direction="right" label={`Ke ${ROOMS[roomIndex + 1].name}`} onClick={() => goTo(roomIndex + 1)} />
        </div>
      )}

      <div className="main-area__bottom">
        <BottomNav active={tab} feedbackLocked onChange={setTab} />
      </div>
    </main>
  );
}
