# G-Macro Tool

Browser-based generator for **Logitech G HUB** Lua macro scripts. Configure your automation visually, save a `.lua` file, and paste a one-time loader snippet into G HUB.

**[Live Demo →](https://g-macro.vercel.app)**

---

## Features

- **Profiles** — multiple named configs stored in browser (`localStorage`)
- **Movement** — keyboard (WASD) or mouse click-to-move, with weighted random directions and jitter
- **Rotation (Skills)** — ordered key sequence with per-action delay, hold time, and repeat count
- **Timers** — periodic buff/cooldown keys fired on interval (e.g. every 5 min)
- **Preview Timeline** — 10-second visual of a full macro loop: buff markers → walk block → skill sequence
- **G HUB Loader** — inline `dofile()` snippet; paste once, never change. Every Save rewrites the `.lua` automatically.

## Usage

Open `index.html` directly in a browser — no build step, no server, no dependencies.

1. Configure sections 1–4
2. Click **SAVE AS** → pick a `.lua` destination on your machine
3. In Section 6, enter the folder path where you saved the file
4. Copy the loader code → paste into G HUB Scripting (do this once)
5. Future saves auto-update the same `.lua` file

CapsLock = emergency stop at any time while the macro runs.

## File Structure

```
index.html   — entire app (HTML + CSS + JS + Lua template, single file)
vercel.json  — cache-control headers for Vercel deployment
CLAUDE.md    — project notes for Claude Code
```

## Deployment

Static site — deploy anywhere. Vercel:

```bash
vercel deploy
```

## G HUB Setup

In G HUB → Scripting, paste the loader code from Section 6 once. Bind the trigger button (default: G9) in Core Settings.
