# HMD Event Companion

Web app (mobile, no install) for guests of Potara's House Moving Day — Potara Hackathon, Team A.

Guests get a character that lives in the Potara office. The main area shows the character in the middle of a room, with every action floating on top; swipe left/right to move between the 5 rooms.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Guest flow (user view)

RSVP → (Tidak → Terima kasih, can switch back) → Countdown → Mulai masuk Potara → Check-in (QR / kode pintu / panitia) → Pintu keycard → Cerita Potara (Stories-style chapters; real history still to fill in `src/data/story.ts`) → Buat karakter (outfit only; the name comes from the invitation; confirming = hadir) → App: Ruangan · Agenda · Kenalan · Feedback (after the event); Galeri and Notifikasi open from Ruangan → Memory card.

**Galeri** (`#galeri…`): opens from the floating button on the right edge of Ruangan. Guests share photos picked from their phone's gallery (no in-app camera), up to 5 at once with an optional caption each. Everyone who is hadir can view and download every photo; you can delete only your own. New photos show as a dot on the Galeri button and a toast in Ruangan (`#ruangan-foto-baru`). The admin can censor a photo from Admin → Galeri (`#admin-galeri…`): it blurs on every guest's phone, other guests can't open or download it, and the uploader sees "Disensor panitia"; censoring can be undone. Guests and admin share the gallery through localStorage in the prototype, so `#galeri` and `#admin-galeri` open in two tabs stay in sync. The sample feed uses the room illustrations as stand-in photos; uploads stay in the browser until a backend stores them.

**Notifikasi** (`#notifikasi…`): the bell next to the Kenalan chip in Ruangan shows the unread count and opens every notice worth reading again: committee announcements, schedule notices (starting soon, starting in a room, rundown changed), new photos in Galeri, reward ready, and questions read by the MC. Tapping one marks it read and goes to the right place; "Tandai dibaca" clears them all. Announcements sent from Admin → Pengumuman reach the guest app through localStorage in the prototype (`src/data/notifications.ts`): open `#admin-pengumuman` and `#ruangan` in two tabs, send one, and it pops up as a toast and lands in Notifikasi.

Open `#review` for a hub that links every screen and case (43 of them), including Tanya pembicara (`#tanya`, `#tanya-ditutup`, `#tanya-gagal`) and the required per-event feedback (`#feedback-acara`, `#feedback-acara-gagal`). Each case is also a direct hash link, e.g. `#check-in-kamera`, `#ruangan-jeda`, `#kenalan-hampir`, `#voucher`.

Prototype codes (replace with backend checks): door code `1108`, committee PIN `2026`, Nanda's kenalan code `1357`. Progress is saved in localStorage so reopening resumes where the guest left off.

Set `COUNTDOWN_ENABLED = false` in `src/config.ts` for Test Day ("Ya" goes straight to "Mulai masuk Potara").

## MC & Performance sides (phone + tablet)

For the people on stage, who may come from outside Potara. The admin sends each one a personal WhatsApp link (Admin → Pengisi acara); the first open is confirmed with a 6-digit code sent to the same number (demo code `246810`).

- **MC** (`#mc-…`): Panggung (now/next, big timer, PIC, Claude-assisted script, cues to the speaker, call the committee, read-only rundown), Pertanyaan (guest questions grouped by Claude, swipe to pick/skip, full-screen read mode), Sorotan (greeting lines, who just arrived, rewards), Umumkan (one-tap templates or write your own).
- **Performance / speaker** (`#pembicara-…`): Sesiku (Saya siap, timer, Butuh bantuan, Kembali ke MC), MC cues take over the screen, questions picked by the MC, and the session's feedback afterwards.
- Layout follows the guest app (one column, floating bottom nav) on phones and tablets; tablets are portrait-only, with a 24px gutter, full-width toasts and floating dialogs.
- In the prototype both sides share state through localStorage, so `#mc` and `#pembicara` open in two tabs talk to each other.

## Admin side (desktop)

Open `#admin-login` (email `admin@potara.id`, PIN `123456`) or `#admin` to skip sign-in. Same design system as the guest app; layout is an Ink sidebar + top bar + panels for 1440×900. Screens: Dashboard, Rundown (5 room columns, drag to move, drag the bottom edge to resize, click to edit), Pengumuman (with phone preview), Undangan WA (send RSVP links one by one or in bulk, CSV import with a review step before anything is added, editable message template; delivery is simulated here and goes through the WhatsApp Business API in production), Daftar tamu (manual check-in), Hadiah (committee PIN), Feedback (per event + final, anonymous), Pengaturan. Panels fill the screen and scroll inside; the bell opens notifications, and items that need action also pop up as a toast. Every admin case is listed under "Admin (desktop)" in `#review`. CSV export lives in `src/admin/csv.ts` so it's easy to remove.

## Buttons

Primary = Orange Splash (main action) · Secondary = Ink · Tertiary = white (back / cancel) · Danger = red. No text-only buttons.

## Structure

```
src/
  config.ts           # event info, countdown toggle, kenalan target
  styles/tokens.css   # design tokens, mirrored 1:1 from the Figma variables (file "Adam")
  styles/global.css   # fonts, text styles, clay + glass effects
  styles/layout.css   # shared screen layouts (flow screens, tab pages, panels)
  components/         # one component per Figma component page
  screens/            # one file per screen; App.tsx wires the flow
  data/               # rooms, sample rundown, sample guests, character colours
```

## Layout rules (from the main area)

- Three layers: full-bleed illustration, the character standing in the middle, floating UI grouped at the top and bottom.
- The middle stays clear for the character; only temporary toasts grow out from under the top card.
- Cards: tag row first (status, place), then one content row. 8px inside a group, 12px between groups, 16px card padding.
- One orange accent per area; Ink for primary actions and "now"; red only for LIVE.
- Never move the guest without warning; locked features look normal and explain themselves on tap.

## Design system rules

- Colors, radius, spacing, padding: use the CSS variables in `tokens.css`, never raw values.
- Text and icons on Orange Splash or Amber are white (`--text-on-accent`).
- Depth comes from clay effects (`.clay` + `.clay-accent | .clay-dark | .clay-grey | .clay-light`) and glass (`.glass`) for floating elements. No drop shadows.
- Icons: Remix Icon (line), see `components/iconPaths.ts`.
- Illustrations are placeholders (`Character`, room backgrounds) until Nanda's assets are in.
