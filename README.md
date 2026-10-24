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

RSVP → (Tidak → Terima kasih, can switch back) → Countdown → Mulai masuk Potara → Check-in (QR / kode pintu / panitia) → Pintu keycard → Narasi → Buat karakter (outfit only; the name comes from the invitation; confirming = hadir) → App: Ruangan · Agenda · Kenalan · Feedback (after the event) → Memory card.

Open `#review` for a hub that links every screen and case (42 of them), including Tanya pembicara (`#tanya`, `#tanya-ditutup`, `#tanya-gagal`) and the required per-event feedback (`#feedback-acara`, `#feedback-acara-gagal`). Each case is also a direct hash link, e.g. `#check-in-kamera`, `#ruangan-jeda`, `#kenalan-hampir`, `#voucher`.

Prototype codes (replace with backend checks): door code `1108`, committee PIN `2026`, Nanda's kenalan code `1357`. Progress is saved in localStorage so reopening resumes where the guest left off.

Set `COUNTDOWN_ENABLED = false` in `src/config.ts` for Test Day ("Ya" goes straight to "Mulai masuk Potara").

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
