# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-file browser tool (`g-macro.html`) that generates Logitech Gaming Software (LGS) Lua macro scripts for game automation. `paladin.lua` is a sample output — the canonical source is the HTML generator.

No build step. No dependencies. No server. Open `g-macro.html` directly in a browser.

## Architecture

Everything lives in `g-macro.html` as one self-contained file:
- **CSS** — retro pixel/CRT aesthetic (Press Start 2P + VT323 fonts, scanline overlays, pixel grid)
- **UI panels** — config inputs map 1:1 to Lua `config {}` fields
- **Code generator** — JavaScript that templates a complete Lua script from UI state
- **Output** — rendered in a `<textarea>` for copy-paste into LGS

## Generated Lua Script Structure (`paladin.lua` is an example)

The output script has a fixed shape:
1. `config {}` — global settings (trigger button, jitter %, walk mode, screen dims)
2. `walkDirections {}` — WASD direction weights
3. `walkConfig {}` — duration/interval for walking
4. `sequence {}` — ordered key actions with delay/hold/times
5. `mouseSkills {}` — post-sequence mouse-move-then-keypress actions
6. `buffs {}` — periodic keys fired on interval timers (e.g. every 5 min)
7. **Engine** — `StartMacro()`, `DoWalk()`, `RunSequence()`, `FireDueBuffs()`, etc.

Key engine behaviors:
- CapsLock = emergency stop (checked every 25ms via `SleepChecked`)
- Jitter wraps every sleep/hold to randomize timing by ±`config.jitter`%
- Buffs have `preLockout` — sequence/mouse skills won't start if a buff is due within that window
- `lastSharedRunTime` enforces `sequenceCooldown` between sequence and mouse skills
- Walk modes: `"keyboard"` (WASD press/release) vs `"mouse"` (click-to-move with `MoveMouseTo`)

## Editing Guidelines

When modifying `g-macro.html`, the JS generator must stay in sync with the Lua engine template — every `config` key the UI exposes must appear in the generated output.

When modifying the Lua engine logic in `g-macro.html`, verify the generated output by opening the file in a browser and exporting a test script.
