/**
 * Shared gallery between guests and the admin. In the prototype it lives in localStorage and syncs across tabs
 * (open #galeri and #admin-galeri side by side: a photo the admin censors blurs on the guest's phone);
 * production uses the backend.
 */
import { useCallback, useEffect, useState } from "react";
import { SAMPLE_PHOTOS, type GalleryPhoto } from "./gallery";

export type GalleryState = {
  photos: GalleryPhoto[];
  /** Photos the committee has already looked at. */
  checked: string[];
};

const KEY = "hmd-gallery-v1";

/** Older photos are already checked; the three newest wait for the committee. */
export const GALLERY_BASE = (photos: GalleryPhoto[] = SAMPLE_PHOTOS): GalleryState => ({
  photos,
  checked: photos.filter((p) => !["p1", "p2", "p3"].includes(p.id)).map((p) => p.id),
});

function read(): GalleryState | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return s && Array.isArray(s.photos) ? s : null;
  } catch {
    return null;
  }
}
function write(s: GalleryState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: this tab still works on its own */
  }
}

/** `seed` (a review case) replaces the shared gallery; without it, pick up whatever the other side left. */
export function useGallery(seed?: GalleryState) {
  const [state, setState] = useState<GalleryState>(() => {
    const s = seed ?? read() ?? GALLERY_BASE();
    write(s);
    return s;
  });
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      const s = read();
      if (s) setState(s);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const update = useCallback((fn: (s: GalleryState) => GalleryState) => {
    setState((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);
  return [state, update] as const;
}

export const censor = (photos: GalleryPhoto[], ids: string[]) => photos.map((p) => (ids.includes(p.id) ? { ...p, censored: true } : p));
