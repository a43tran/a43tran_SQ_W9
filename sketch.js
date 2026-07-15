
let debugMode = false;

const STATE_START = "start";
const STATE_PLAY = "play";
const STATE_WIN = "win";
const STATE_OVER = "over";

let gameState = STATE_START;
let currentLevel = 1;
const MAX_LEVELS = 3;

const CARD_W = 160;
const CARD_H = 220;

let levelData = {};

let deck = [];
let deckIndex = 0;
let currentCard = null;
let nextCard = null;
let score = 0;
let targetScore = 0;
let totalScore = 0;

let result = "";
let resultTimer = 0;
const RESULT_FRAMES = 45; 

let btnHigher = { x: 0, y: 0, w: 140, h: 50, label: "HIGHER ▲" };
let btnLower = { x: 0, y: 0, w: 140, h: 50, label: "LOWER  ▼" };


function preload() {
  levelData[1] = loadJSON("data/level1.json");
  levelData[2] = loadJSON("data/level2.json");
  levelData[3] = loadJSON("data/level3.json");
}

function setup() {
  createCanvas(600, 500);
  textFont("monospace");
}

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

  if (debugMode) drawDebugPanel();
}

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
}

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

function drawDebugPanel() {
  fill(0, 0, 0, 200);
  noStroke();
  rect(0, height - 80, width, 80);

  fill(0, 234, 255);
  textSize(11);
  textAlign(LEFT);
  text("DEBUG MODE (D to close)", 12, height - 62);

  let buttons = [
    { label: "S: Start", x: 10 },
    { label: "1: Level 1", x: 108 },
    { label: "2: Level 2", x: 206 },
    { label: "3: Level 3", x: 304 },
    { label: "W: Win", x: 402 },
    { label: "O: Game Over", x: 500}
  ];

  for (let i = 0; i < buttons.length; i++) {
    let b = buttons[i];

    fill(60, 60, 90);
    stroke(100, 100, 140);
    strokeWeight(1);
    rect(b.x, height - 50, 88, 34, 4);

    fill(200);
    noStroke();
    textSize(10);
    textAlign(LEFT);
    text(b.label, b.x + 8, height - 28);
  }
}

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

function keyPressed() {
  if (key === "d" || key === "D") {
    debugMode = !debugMode;
    return;
  }

  if (key === "s" || key === "S") {
    gameState = STATE_START;
    return;
  }

  if (key === "w" || key === "W") {
    gameState = STATE_WIN;
    return;
  }

  if (key === "o" || key === "O") {
    gameState = STATE_OVER;
    return;
  }

  if (key === "1") {
    loadLevel(1);
    gameState = STATE_PLAY;
  }
  if (key === "2") {
    loadLevel(2);
    gameState = STATE_PLAY;
  }
  if (key === "3") {
    loadLevel(3);
    gameState = STATE_PLAY;
  }
}

function isMouseOverButton(btn) {
  return (
    mouseX > btn.x &&
    mouseX < btn.x + btn.w &&
    mouseY > btn.y &&
    mouseY < btn.y + btn.h
  );
}
