import { useEffect, useRef, useState } from "react";
import { AgendaMini } from "../components/AgendaMini";
import { BottomNav, type NavTab } from "../components/BottomNav";
import { Character } from "../components/Character";
import { RoomHeader } from "../components/RoomHeader";
import { RoomIndicator } from "../components/RoomIndicator";
import { Toast } from "../components/Toast";
import { LIVE_ROOM_ID, ROOMS } from "../data/rooms";
import "./MainArea.css";

const SWIPE_THRESHOLD = 60;
const DRAG_START = 8;
const EDGE_RESISTANCE = 0.3;

/** Main area: the character stands in the middle of a Potara room; every action floats on top. */
export function MainArea() {
  const [roomIndex, setRoomIndex] = useState(() => ROOMS.findIndex((r) => r.id === LIVE_ROOM_ID));
  const [tab, setTab] = useState<NavTab>("ruangan");
  const [toastVisible, setToastVisible] = useState(false);
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ x: number; y: number; active: boolean } | null>(null);

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
  const atEdge = (dx: number) => (dx > 0 && roomIndex === 0) || (dx < 0 && roomIndex === ROOMS.length - 1);

  const endDrag = (dx: number) => {
    if (drag.current?.active && Math.abs(dx) > SWIPE_THRESHOLD && !atEdge(dx)) goTo(roomIndex + (dx < 0 ? 1 : -1));
    drag.current = null;
    setDragX(0);
  };

  return (
    <main
      className="main-area"
      onPointerDown={(e) => (drag.current = { x: e.clientX, y: e.clientY, active: false })}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        // Only treat it as a room swipe once the gesture is clearly horizontal.
        if (!d.active && Math.abs(dx) > DRAG_START && Math.abs(dx) > Math.abs(e.clientY - d.y)) d.active = true;
        if (d.active) setDragX(atEdge(dx) ? dx * EDGE_RESISTANCE : dx);
      }}
      onPointerUp={(e) => drag.current && endDrag(e.clientX - drag.current.x)}
      onPointerCancel={() => endDrag(0)}
      onPointerLeave={(e) => drag.current && endDrag(e.clientX - drag.current.x)}
    >
      {/* Layer 1: room illustrations, side by side; follows the finger while dragging */}
      <div
        className={`room-track${dragX !== 0 ? " is-dragging" : ""}`}
        style={{ transform: `translateX(calc(-${roomIndex * 100}% + ${dragX}px))` }}
      >
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
      </div>

      <div className="main-area__bottom">
        <RoomIndicator name={room.name} index={roomIndex} total={ROOMS.length} live={room.id === LIVE_ROOM_ID} />
        <BottomNav active={tab} feedbackLocked onChange={setTab} />
      </div>
    </main>
  );
}
