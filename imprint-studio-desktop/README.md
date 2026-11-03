# Imprint Studio — Desktop (Windows)

A desktop version of Imprint Studio for your admin team (Product Manager & Part
Setup). It's an Electron shell that opens your Imprint Studio app in its own
window — with a Start-menu + desktop shortcut and its own icon, no browser needed.

## What you need once
- **Node.js** installed (nodejs.org — the LTS version). Check: `node -v`

## Step 1 — Point it at your app
Open `main.js` and set `APP_URL` near the top:

- **Testing with your dev server:** leave it as `http://localhost:3000`
  (run `npm run dev` in your `krossover-studio` folder first).
- **Real app for the team:** set it to your deployed URL, e.g.
  `https://imprint.yourdomain.com` (your Vercel URL once deployed).

```js
const APP_URL = process.env.IMPRINT_URL || "http://localhost:3000";
```

## Step 2 — Install dependencies
In **this** folder (`imprint-studio-desktop`), open a terminal and run:
```powershell
npm install
```

## Step 3 — Run it (to try it out)
```powershell
npm start
```
The app opens in its own window. (If it shows "Can't reach Imprint Studio", your
`APP_URL` server isn't running yet — start `npm run dev` in krossover-studio, or
set `APP_URL` to your live site.)

## Step 4 — Build the installable .exe
```powershell
npm run dist
```
When it finishes, your installer is in the **`dist/`** folder:
`Imprint Studio Setup 1.0.0.exe` — double-click to install, and it adds a desktop
+ Start-menu shortcut. Share that one `.exe` with anyone on the team.

> The `.exe` must be built on Windows (which you're on). Each teammate just runs
> the installer — they don't need Node.

## Updating the app
- If `APP_URL` points at your **live site**, the desktop app always shows the
  latest version automatically — no rebuild needed when you push website changes.
- Only rebuild the `.exe` when you change this shell (icon, title, URL, menus).

## Notes
- Internet is required (it loads your hosted app). For a fully offline admin tool
  that bundles the pages, tell me and I'll ship that variant.
- To change the app name or icon: edit `productName` in `package.json` and replace
  `icon.ico`.
- macOS build: change `--win` to `--mac` in the `dist` script (must build on a Mac).
