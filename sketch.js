// ============================================================
// Week 9 Example 3 — Higher or Lower
// ============================================================
// A card guessing game across 3 JSON-driven levels.
// A card is shown face up. Guess whether the next card in
// the deck is higher or lower. Reach the target score to
// advance to the next level. Guess wrong and it's game over.
//
// This example has NO debug panel.
// Your job in the side quest is to add one.
//
// FILE STRUCTURE:
//   sketch.js        — all game logic
//   data/level1.json — 8 cards, target score 5
//   data/level2.json — 13 cards, target score 8
//   data/level3.json — 26 cards (2 suits), target score 12
//
// WHAT TO ADD (side quest):
//   - A debug panel toggled with D
//   - At least 3 keyboard shortcuts for jumping between
//     levels and screens without playing through
//   - Display the shortcuts in the debug panel so you
//     don't have to remember them
// ============================================================

// ------------------------------------------------------------
// GAME STATES
// ------------------------------------------------------------
const STATE_START = "start";
const STATE_PLAY = "play";
const STATE_WIN = "win";
const STATE_OVER = "over";

let gameState = STATE_START;
let currentLevel = 1;
const MAX_LEVELS = 3;

// ------------------------------------------------------------
// CARD LAYOUT
// ------------------------------------------------------------
const CARD_W = 160;
const CARD_H = 220;

// ------------------------------------------------------------
// LEVEL DATA
// All three levels loaded in preload() and stored by number.
// levelData[1], levelData[2], levelData[3]
// ------------------------------------------------------------
let levelData = {};

// ------------------------------------------------------------
// GAME DATA
// deck        — shuffled array of card objects for this level
// deckIndex   — which card in the deck is currently shown
// currentCard — the card currently face up
// nextCard    — the card about to be revealed
// score       — correct guesses this level
// targetScore — guesses needed to win this level (from JSON)
// result      — "correct", "wrong", or "" — shown briefly after guess
// resultTimer — counts down to clear the result message
// ------------------------------------------------------------
let deck = [];
let deckIndex = 0;
let currentCard = null;
let nextCard = null;
let score = 0;
let targetScore = 0;
let totalScore = 0;

let result = "";
let resultTimer = 0;
const RESULT_FRAMES = 45; // how long to show correct/wrong message

// ------------------------------------------------------------
// BUTTONS
// Higher and Lower buttons — built in loadLevel() and
// checked in mousePressed().
// ------------------------------------------------------------
let btnHigher = { x: 0, y: 0, w: 140, h: 50, label: "HIGHER ▲" };
let btnLower = { x: 0, y: 0, w: 140, h: 50, label: "LOWER  ▼" };

// ============================================================
// preload()
// Loads all three level JSON files before the sketch starts.
// ============================================================
function preload() {
  levelData[1] = loadJSON("data/level1.json");
  levelData[2] = loadJSON("data/level2.json");
  levelData[3] = loadJSON("data/level3.json");
}

// ============================================================
// setup()
// ============================================================
function setup() {
  createCanvas(600, 500);
  textFont("monospace");
}

// ============================================================
// draw()
// ============================================================
function draw() {
  background(20, 20, 35);

  if (gameState === STATE_START) {
    drawStartScreen();
  } else if (gameState === STATE_PLAY) {
    updateResult();
    drawGame();
    drawHUD();
  } else if (gameState === STATE_WIN) {
    drawWinScreen();
  } else if (gameState === STATE_OVER) {
    drawGameOver();
  }
}

// ------------------------------------------------------------
// loadLevel(num)
// Reads level JSON, shuffles the deck, sets up buttons,
// and resets per-level tracking.
// ------------------------------------------------------------
function loadLevel(num) {
  currentLevel = num;
  let data = levelData[num];

  if (!data || !data.cards) {
    console.log("Level " + num + " data not ready");
    return;
  }

  targetScore = data.targetScore;

  // Copy and shuffle the deck using Fisher-Yates
  let raw = data.cards.slice(); // copy so JSON stays intact
  for (let i = raw.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    let tmp = raw[i];
    raw[i] = raw[j];
    raw[j] = tmp;
  }
  deck = raw;
  deckIndex = 0;
  score = 0;
  result = "";

  // Deal the first card
  currentCard = deck[deckIndex];
  deckIndex++;
  nextCard = deck[deckIndex] || null;

  // Position buttons below the card
  let cardX = (width - CARD_W) / 2;
  let cardY = 120;
  let btnY = cardY + CARD_H + 30;
  let gap = 20;

  btnHigher.x = cardX - 80;
  btnHigher.y = btnY;
  btnLower.x = cardX + CARD_W - btnLower.w + 80;
  btnLower.y = btnY;
}

// ------------------------------------------------------------
// updateResult()
// Counts down the result display timer each frame.
// When it reaches 0 the result message clears.
// If the result was "wrong" the game ends.
// If the result was "correct" and score reached target,
// advance to the next level or win.
// ------------------------------------------------------------
function updateResult() {
  if (resultTimer <= 0) return;

  resultTimer--;

  if (resultTimer === 0) {
    if (result === "wrong") {
      gameState = STATE_OVER;
      return;
    }

    result = "";

    // Check win condition
    if (score >= targetScore) {
      if (currentLevel < MAX_LEVELS) {
        setTimeout(() => {
          loadLevel(currentLevel + 1);
        }, 400);
      } else {
        gameState = STATE_WIN;
      }
      return;
    }

    // Advance to the next card
    currentCard = nextCard;
    deckIndex++;
    nextCard = deck[deckIndex] || null;

    // Ran out of cards before reaching target — game over
    if (!nextCard && score < targetScore) {
      gameState = STATE_OVER;
    }
  }
}

// ------------------------------------------------------------
// guess(direction)
// Called when the player clicks Higher or Lower.
// Compares currentCard and nextCard values.
// Sets result and starts the result timer.
// ------------------------------------------------------------
function guess(direction) {
  if (!nextCard || resultTimer > 0) return;

  let correct = false;

  if (direction === "higher" && nextCard.value > currentCard.value) {
    correct = true;
  } else if (direction === "lower" && nextCard.value < currentCard.value) {
    correct = true;
  }
  // Equal cards count as wrong — the player must commit to a direction

  if (correct) {
    score++;
    totalScore++;
    result = "correct";
    resultTimer = RESULT_FRAMES;
  } else {
    result = "wrong";
    resultTimer = RESULT_FRAMES;
  }
}

// ============================================================
// DRAW FUNCTIONS
// ============================================================

// ------------------------------------------------------------
// drawGame()
// Draws the current card, the hidden next card, buttons,
// and the result message.
// ------------------------------------------------------------
function drawGame() {
  let cardX = (width - CARD_W) / 2;
  let cardY = 120;

  // --- Current card (face up) ---
  drawCard(currentCard, cardX, cardY, true);

  // --- Next card (face down) ---
  drawCard(null, cardX + CARD_W + 20, cardY, false);

  // --- Result message ---
  if (result === "correct") {
    fill(80, 220, 120);
    textAlign(CENTER);
    textSize(22);
    text("Correct!", width / 2, cardY + CARD_H + 90);
  } else if (result === "wrong") {
    fill(220, 80, 80);
    textAlign(CENTER);
    textSize(22);
    // Show what the next card actually was
    text(
      "Wrong! It was " +
        (nextCard ? nextCard.label + (nextCard.suit ? nextCard.suit : "") : ""),
      width / 2,
      cardY + CARD_H + 90,
    );
  }

  // --- Buttons (only shown when no result is displaying) ---
  if (result === "") {
    drawButton(btnHigher);
    drawButton(btnLower);
  }
}

// ------------------------------------------------------------
// drawCard(card, x, y, faceUp)
// Draws a single playing card.
// If faceUp is true, shows the card's label and suit.
// If faceUp is false, draws the card back.
// card can be null for a face-down card.
// ------------------------------------------------------------
function drawCard(card, x, y, faceUp) {
  push();

  if (faceUp && card) {
    // Card face
    fill(240, 238, 230);
    stroke(180);
    strokeWeight(2);
    rect(x, y, CARD_W, CARD_H, 12);

    // Suit colour — red for hearts/diamonds, dark for spades/clubs
    let isRed = card.suit === "♥" || card.suit === "♦";
    fill(isRed ? color(200, 40, 40) : color(20, 20, 40));
    noStroke();

    // Value label — top left and bottom right
    textSize(22);
    textAlign(LEFT);
    text(card.label, x + 12, y + 30);

    textAlign(RIGHT);
    text(card.label, x + CARD_W - 12, y + CARD_H - 14);

    // Suit symbol — centred
    if (card.suit) {
      textSize(52);
      textAlign(CENTER);
      text(card.suit, x + CARD_W / 2, y + CARD_H / 2 + 18);
    } else {
      // No suit — just show a large value
      textSize(64);
      textAlign(CENTER);
      text(card.label, x + CARD_W / 2, y + CARD_H / 2 + 22);
    }
  } else {
    // Card back
    fill(60, 60, 90);
    stroke(80, 80, 120);
    strokeWeight(2);
    rect(x, y, CARD_W, CARD_H, 12);

    // Inner border pattern
    noFill();
    stroke(80, 80, 130);
    strokeWeight(1);
    rect(x + 10, y + 10, CARD_W - 20, CARD_H - 20, 8);

    // Question mark centred
    fill(80, 80, 120);
    noStroke();
    textSize(64);
    textAlign(CENTER);
    text("?", x + CARD_W / 2, y + CARD_H / 2 + 22);
  }

  pop();
}

// ------------------------------------------------------------
// drawButton(btn)
// Draws a clickable button with a hover highlight.
// ------------------------------------------------------------
function drawButton(btn) {
  let hover = isMouseOverButton(btn);

  push();
  fill(hover ? color(80, 100, 160) : color(50, 55, 90));
  stroke(hover ? color(120, 150, 220) : color(80, 85, 130));
  strokeWeight(2);
  rect(btn.x, btn.y, btn.w, btn.h, 8);

  fill(hover ? 255 : 200);
  noStroke();
  textSize(15);
  textAlign(CENTER);
  text(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 6);
  pop();
}

// ------------------------------------------------------------
// drawHUD()
// Shows level, score progress, and target score.
// ------------------------------------------------------------
function drawHUD() {
  noStroke();
  fill(160);
  textSize(13);
  textAlign(LEFT);
  text("Level " + currentLevel + " / " + MAX_LEVELS, 16, 30);
  text("Target: " + targetScore + " correct", 16, 48);

  textAlign(RIGHT);
  fill(200);
  text("Score: " + score + " / " + targetScore, width - 16, 30);
  text("Total: " + totalScore, width - 16, 48);

  // Progress bar
  let barW = width - 32;
  let barH = 8;
  let barX = 16;
  let barY = 58;
  let fillW = map(score, 0, targetScore, 0, barW);

  fill(40);
  rect(barX, barY, barW, barH, 4);

  fill(80, 200, 120);
  rect(barX, barY, fillW, barH, 4);
}

// ------------------------------------------------------------
// drawStartScreen()
// ------------------------------------------------------------
function drawStartScreen() {
  fill(255);
  textAlign(CENTER);
  textSize(42);
  text("HIGHER OR LOWER", width / 2, height / 2 - 80);

  fill(160);
  textSize(14);
  text("A card is shown face up.", width / 2, height / 2 - 30);
  text(
    "Guess if the next card is higher or lower.",
    width / 2,
    height / 2 - 10,
  );
  text("Reach the target score to advance.", width / 2, height / 2 + 10);
  text(
    "Equal cards count as wrong — commit to a direction!",
    width / 2,
    height / 2 + 30,
  );

  fill(255);
  textSize(16);
  text("Click to start", width / 2, height / 2 + 80);

  // Hint for students — no debug panel yet
  fill(60);
  textSize(11);
  text("No debug panel yet — that's your job!", width / 2, height - 20);
}

// ------------------------------------------------------------
// drawWinScreen()
// ------------------------------------------------------------
function drawWinScreen() {
  background(20, 20, 35);

  fill(80, 220, 160);
  textAlign(CENTER);
  textSize(44);
  text("You won!", width / 2, height / 2 - 60);

  fill(200);
  textSize(18);
  text("All 3 levels complete!", width / 2, height / 2 - 10);

  fill(255, 220, 80);
  textSize(22);
  text("Total correct: " + totalScore, width / 2, height / 2 + 30);

  fill(160);
  textSize(14);
  text("Click to play again", width / 2, height / 2 + 75);
}

// ------------------------------------------------------------
// drawGameOver()
// ------------------------------------------------------------
function drawGameOver() {
  background(20, 20, 35);

  fill(220, 80, 80);
  textAlign(CENTER);
  textSize(44);
  text("Game Over", width / 2, height / 2 - 60);

  fill(200);
  textSize(18);
  text(
    "You got " + score + " out of " + targetScore + " on level " + currentLevel,
    width / 2,
    height / 2 - 10,
  );

  fill(160);
  textSize(14);
  text("Click to try again", width / 2, height / 2 + 40);
}

// ============================================================
// INPUT
// ============================================================

// ------------------------------------------------------------
// mousePressed()
// Handles clicks on all screens and buttons.
// ------------------------------------------------------------
function mousePressed() {
  if (gameState === STATE_START) {
    totalScore = 0;
    loadLevel(1);
    gameState = STATE_PLAY;
    return;
  }

  if (gameState === STATE_WIN || gameState === STATE_OVER) {
    totalScore = 0;
    gameState = STATE_START;
    return;
  }

  if (gameState === STATE_PLAY && result === "") {
    if (isMouseOverButton(btnHigher)) guess("higher");
    if (isMouseOverButton(btnLower)) guess("lower");
  }
}

// ------------------------------------------------------------
// keyPressed()
// No debug shortcuts yet — add them here in the side quest!
//
// Hint: use key === "d" || key === "D" to toggle a debug panel.
// Use key === "1", "2", "3" to jump between levels.
// Use key === "s" or "w" to jump to start or win screens.
// ------------------------------------------------------------
function keyPressed() {
  // YOUR DEBUG CODE GOES HERE
}

// ------------------------------------------------------------
// isMouseOverButton(btn)
// Returns true if the mouse is inside the button rectangle.
// ------------------------------------------------------------
function isMouseOverButton(btn) {
  return (
    mouseX > btn.x &&
    mouseX < btn.x + btn.w &&
    mouseY > btn.y &&
    mouseY < btn.y + btn.h
  );
}
