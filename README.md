# HMD Event Companion

Web app (mobile, no install) for guests of Potara's House Moving Day — Potara Hackathon, Team A.

Guests get a character that lives in the Potara office. The main area shows the character in the middle of a room, with every action floating on top; swipe left/right to move between the 5 rooms.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

```
src/
  styles/tokens.css   # design tokens, mirrored 1:1 from the Figma variables (file "Adam")
  styles/global.css   # fonts, text styles, clay + glass effects
  components/         # one component per Figma component page
  screens/MainArea    # main area screen
  data/rooms.ts       # the 5 rooms
```

## Design system rules

- Colors, radius, spacing, padding: use the CSS variables in `tokens.css`, never raw values.
- Text and icons on Orange Splash or Amber are white (`--text-on-accent`).
- Depth comes from clay effects (`.clay` + `.clay-accent | .clay-dark | .clay-grey | .clay-light`) and glass (`.glass`) for floating elements. No drop shadows.
- Icons: Remix Icon (line), see `components/iconPaths.ts`.
- Illustrations are placeholders (`Character`, room backgrounds) until Nanda's assets are in.
