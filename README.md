# Sizzle & Serve

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/yologie/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/yologie/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A fast-paced lunch-rush cooking game, built for the [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) competition on [make.fun](https://make.fun).

## How it plays

You run a tiny kitchen through a three-minute shift. Orders roll in on the
board at the top, each with its own countdown. Build every dish on your
plate from the ingredients along the bottom counter, grill the patty on the
grill (raw, then cooked — leave it too long and it burns), and serve the
finished plate to the matching order before its timer runs out.

- **Score** — dish price plus a tip worth up to half the price for fast
  service, multiplied by your combo for consecutive on-time serves (up to 2x).
- **Wrong order** — serving a plate that doesn't match costs $5 and resets
  the combo. Three orders walking out ends the shift early.
- **Controls** — click ingredients or press keys 1–7, S to serve, X to trash
  the plate, P to pause, M to mute. Mouse and keyboard both work.

## What's inside

- `game/` — the playable game as plain static files: `index.html` plus
  `src/` (config, seeded random, WebAudio synth sounds, orders, grill and
  plate stations, input, rendering, game logic, screenshot states, boot).
  All art is drawn in code and all sound is synthesized — no downloads, no
  external assets, no network requests at all.
- `screenshots/` — real renders of the game's own code.
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored make.fun
  library (`vendor/makefun-game.ts`).

## Play it

Serve `game/` with any static server and open it in a desktop browser:

```sh
python3 -m http.server 8080 --directory game
```

or run the included server (`node serve.ts` serves `game/` on
http://localhost:8080). No build step, no dependencies.

## License

MIT — see [LICENSE](LICENSE).
