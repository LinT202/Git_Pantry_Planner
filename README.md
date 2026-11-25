# Pantry Planner

A responsive visual prototype for coordinating donations, pantry inventory, and weekly distributions.

## Run locally

```bash
npm install
npm run dev
```

The app is available through the Vite server URL shown in the terminal.

## Main files

- `src/App.jsx` contains the screens and local prototype data.
- `src/styles.css` contains the visual design and responsive layout.
- `src/main.jsx` starts the React app.

## Public deployment

The `main` branch automatically deploys to GitHub Pages through
`.github/workflows/deploy-pages.yml`. The public app URL is:

`https://lint202.github.io/Git_Pantry_Planner/`

Donation confirmations and inventory edits are stored in the browser with local storage. Donation messages are parsed with simple local patterns only; extracted details are suggestions, and item, quantity, and unit must be reviewed before confirmation.

The weekly plan calculates starting needs from the household count multiplied by an editable per-household amount. Whole-package units round up. The displayed math and stock-unit checks make assumptions visible; these are coordinator estimates, not food-safety decisions. Donor-request drafts are editable and are never sent automatically.

Default per-household estimates are in `defaultPlanAssumptions` in `src/App.jsx`. The intake questions and local text parsing are also in `src/App.jsx`.