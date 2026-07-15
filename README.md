# Week 9 Example 3 — Higher or Lower

## What This Example Demonstrates

> **Note for students:** This section is included in example files only to help you study. Do not include it in your Side Quest submissions.

This example introduces a Higher or Lower card guessing game across 3 JSON-driven levels. A card is shown face up — guess whether the next card in the shuffled deck is higher or lower. Reach the target score to advance. Guess wrong and it's game over.

**This example has no debug panel — adding one is your side quest task.**

- **Three JSON levels** — same `loadJSON()` pattern as Example 2; all three files loaded in `preload()` and stored by number in `levelData`
- **`loadLevel(num)`** — reads the JSON for that level, shuffles the deck with Fisher-Yates, positions the buttons, and resets per-level tracking; same pattern as Example 2
- **Deck as an array** — the JSON cards array is copied with `.slice()` before shuffling so the original JSON data is never modified; `deckIndex` tracks which card is currently shown
- **`guess(direction)`** — compares `currentCard.value` and `nextCard.value`; sets `result` and starts `resultTimer`; equal values count as wrong
- **`resultTimer`** — counts down in `updateResult()` each frame; when it reaches 0 the game either ends, advances to the next level, or shows the next card depending on the result
- **`setTimeout()`** — same pattern as Example 2; waits 400ms before loading the next level so the player sees the completed state briefly
- **Progress bar** — `map()` converts `score` to a bar fill width; fills left to right as correct guesses accumulate
- **Two-column card layout** — current card on the left, face-down next card on the right; both drawn with `drawCard()`
- **`keyPressed()` is empty** — the comment inside tells you exactly where to add your debug shortcuts

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.

Click **Higher ▲** or **Lower ▼** to guess. Reach the target score shown in the HUD to advance to the next level. Equal cards count as wrong — you must commit to a direction.

**Opening the Chrome Console**

- **Windows:** Press `F12` or `Ctrl + Shift + J`, then click the **Console** tab
- **Mac:** Press `Cmd + Option + J`

## Assets

No external assets used. All visuals are generated with p5.js.

## References

N/A
