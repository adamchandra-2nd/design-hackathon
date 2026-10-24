export type Room = {
  id: string;
  name: string;
};

/** The 5 Potara rooms, in swipe order. */
export const ROOMS: Room[] = [
  { id: "halaman-depan", name: "Halaman Depan" },
  { id: "ruang-kerja-utama", name: "Ruang Kerja Utama" },
  { id: "ruang-kerja-dalam", name: "Ruang Kerja Dalam" },
  { id: "ruang-meeting", name: "Ruang Meeting" },
  { id: "ruang-omakase", name: "Ruang Omakase" },
];

/** Sample live state until the rundown backend exists. */
export const LIVE_ROOM_ID = "ruang-omakase";
