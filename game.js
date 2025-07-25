// JUMPMAN RETRO — рабочая версия

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 480;

const startMenu = document.getElementById("startMenu");
const startBtn = document.getElementById("startBtn");

const GROUND_Y = 400;
const GRAVITY = 0.6;

let gameStarted = false;
let flappyMode = false;
let jumperMode = false;
let isSpeedBoosted = false;
let flappyTimer = 0;
let jumperTimer = 0;
let speedBoostTimer = 0;
let invincibleTimer = 0;
let score = 0;
let objects = [];

let jumpman = {
  x: 60,
  y: GROUND_Y,
  vy: 0,
  width: 32,
  height: 32,
  lives: 3,
  grounded: true,
  invincible: false,
  spriteIndex: 0
};

const runSprite = new Image();
runSprite.src = "jumpman_sprites.png";

const airFrames = [new Image(), new Image()];
airFrames[0].src = "jumpman_air_frame_1.png";
airFrames[1].src = "jumpman_air_frame_2.png";
let airFrameIndex = 0, airFrameCounter = 0;

const heartImg = new Image();
heartImg.src = "heart.png";

// --- Draw Jumpman ---
function drawJumpman() {
  if (flappyMode) {
    airFrameCounter++;
    if (airFrameCounter % 8 === 0) airFrameIndex = (airFrameIndex + 1) % 2;
    ctx.drawImage(airFrames[airFrameIndex], jumpman.x, jumpman.y, 32, 32);
    if (isSpeedBoosted) drawSpeedTrail();
  } else {
    jumpman.spriteIndex = Math.floor(Date.now() / 100) % 3;
    ctx.drawImage(runSprite, jumpman.spriteIndex * 32, 0, 32, 32, jumpman.x, jumpman.y, 32, 32);
    if (isSpeedBoosted) drawSpeedTrail();
  }
}
function drawSpeedTrail() {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(jumpman.x - 10, jumpman.y + 16, 16, 8, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}
function drawLives() {
  for (let i = 0; i < jumpman.lives; i++) {
    ctx.drawImage(heartImg, 10 + i * 36, 10, 24, 24);
  }
}

// --- OBJECTS ---
function spawnObject() {
  const types = ["coin", "boost", "shoes", "magnet", "logo", "debuff", "obstacle"];
  const type = types[Math.floor(Math.random() * types.length)];
  let y = GROUND_Y;
  if (type === "coin") y = Math.random() < 0.5 ? GROUND_Y : 220 + Math.random() * 60;
  else if (type === "obstacle") y = Math.random() < 0.5 ? GROUND_Y : 150 + Math.random() * 100;
  else if (type === "logo") y = 120;
  objects.push({ x: canvas.width + 20, y, type, width: 24, height: 24 });
}
function updateObjects() {
  objects.forEach(obj => {
    obj.x -= isSpeedBoosted ? 6 : 3;
    if (
      jumpman.x < obj.x + obj.width &&
      jumpman.x + jumpman.width > obj.x &&
      jumpman.y < obj.y + obj.height &&
      jumpman.y + jumpman.height > obj.y
    ) {
      handleCollision(obj.type);
      obj.collected = true;
    }
  });
  objects = objects.filter(obj => !obj.collected && obj.x > -50);
}
function handleCollision(type) {
  if (type === "coin") score += 10;
  else if (type === "boost") {
    isSpeedBoosted = true; speedBoostTimer = 600; jumpman.invincible = true; invincibleTimer = 180;
  }
  else if (type === "shoes") { jumperMode = true; jumperTimer = 600; }
  else if (type === "logo") { flappyMode = true; flappyTimer = 900; jumpman.invincible = true; invincibleTimer = 180; }
  else if (type === "debuff" || type === "obstacle") {
    if (!jumpman.invincible) { jumpman.lives--; jumpman.invincible = true; invincibleTimer = 180; }
  }
}

// --- GAME LOOP ---
function update() {
  if (flappyMode) {
    flappyTimer--;
    jumpman.y += jumpman.vy;
    jumpman.vy += GRAVITY * 0.7;
    if (jumpman.y < 20) jumpman.y = 20;
    if (jumpman.y > canvas.height - 48) jumpman.y = canvas.height - 48;
    if (flappyTimer <= 0) flappyMode = false;
  } else if (jumperMode) {
    jumperTimer--;
    jumpman.y += jumpman.vy;
    jumpman.vy += GRAVITY * 0.81;
    if (jumpman.y > GROUND_Y) {
      jumpman.y = GROUND_Y;
      jumpman.vy = 0;
      jumpman.grounded = true;
      jumperMode = false;
    }
  } else {
    jumpman.y += jumpman.vy;
    jumpman.vy += GRAVITY;
    if (jumpman.y > GROUND_Y) {
      jumpman.y = GROUND_Y;
      jumpman.vy = 0;
      jumpman.grounded = true;
    }
  }
  if (speedBoostTimer > 0) speedBoostTimer--;
  else isSpeedBoosted = false;

  if (invincibleTimer > 0) invincibleTimer--;
  else jumpman.invincible = false;

  updateObjects();

  if (jumpman.lives <= 0 && gameStarted) {
    gameStarted = false;
    setTimeout(() => {
      canvas.style.display = "none";
      startMenu.classList.remove("hidden");
    }, 1500);
  }
  if (Math.random() < 0.04) spawnObject();
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#222";
  ctx.fillRect(0, GROUND_Y + 32, canvas.width, canvas.height - GROUND_Y);
  drawJumpman();
  drawLives();
  objects.forEach(obj => {
    ctx.fillStyle = getColorByType(obj.type);
    ctx.beginPath();
    ctx.arc(obj.x + 12, obj.y + 12, 12, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.fillStyle = "#fff";
  ctx.font = "12px 'Press Start 2P'";
  ctx.fillText("SCORE: " + score, 10, 60);
}
function getColorByType(type) {
  switch (type) {
    case "coin": return "gold";
    case "boost": return "#3cf";
    case "shoes": return "#f00";
    case "logo": return "#ffcc00";
    case "magnet": return "#9cf";
    case "debuff": return "#444";
    case "obstacle": return "#999";
    default: return "#fff";
  }
}

// --- CONTROL & MAIN LOOP ---
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (flappyMode) jumpman.vy = -6;
    else if (jumpman.grounded) { jumpman.vy = -10; jumpman.grounded = false; }
  }
});
// Touch для мобилки
canvas.addEventListener("touchstart", (e) => {
  if (flappyMode) jumpman.vy = -6;
  else if (jumpman.grounded) { jumpman.vy = -10; jumpman.grounded = false; }
});

startBtn.addEventListener("click", () => {
  startMenu.classList.add("hidden");
  canvas.style.display = "block";
  resetGame();
});
function resetGame() {
  jumpman.x = 60;
  jumpman.y = GROUND_Y;
  jumpman.vy = 0;
  jumpman.lives = 3;
  score = 0;
  objects = [];
  flappyMode = false;
  jumperMode = false;
  isSpeedBoosted = false;
  invincibleTimer = 0;
  gameStarted = true;
}
function loop() {
  if (gameStarted) {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}
loop();
