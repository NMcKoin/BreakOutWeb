const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

console.log("Canvas and context initialized"); // Debugging

// Ball Properties
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let score = 0;
let lastTime = 0;

// Paddle Properties
let paddleHeight = 10;
let paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Brick Properties
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let bricks = [];
let lastCollisionTime = 0;
const collisionCooldown = 120;
const colors = ["gray", "black", "green", "blue", "red"];

//Round Properties
let roundHits = 1; // Starting hits for first round
let roundIndex = 0; // Starting index for colors array
const MAX_HITS = 5;
let currentRound = 1;
let gameOverFlag = false;
let gameStarted = false;

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1, hits: roundHits };
  }
}

// Start Game Menu
function startGame() {
  console.log("Starting Game");
  canvas.removeEventListener("click", startGame);
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("keyup", handleKeyup);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keyup", handleKeyup);
  gameStarted = true;
  resetBallAndPaddle();
  draw();
  canvas.focus();
}

//Draw StartScreen
function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "48px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(
    "Round " + currentRound,
    canvas.width / 2 - 100,
    canvas.height / 2 - 20
  );
  ctx.font = "24px Arial";
  ctx.fillText("Click or", canvas.width / 2 - 60, canvas.height / 2 + 20);
  ctx.fillText(
    "SpaceBar to Start",
    canvas.width / 2 - 120,
    canvas.height / 2 + 50
  );
  canvas.addEventListener("click", startGame);
  document.addEventListener("keydown", handleKeydown);
}

function drawScore() {
  console.log("Drawing ScoreKeeper"); //Debugging
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

// Draw Ball
function drawBall() {
  console.log("Drawing Ball"); //Debugging
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Draw Paddle
function drawPaddle() {
  console.log("Drawing paddle"); // Debugging
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Draw Bricks
function drawBricks() {
  console.log("Drawing bricks"); // Debugging
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status > 0) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        let colorIndex = Math.min(bricks[c][r].hits - 1, colors.length - 1);
        ctx.fillStyle = colors[colorIndex];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function updateBallPosition(deltaTime) {
  console.log(`Updating ball position with deltaTime: ${deltaTime}`); // Debugging
  if (!isNaN(deltaTime) && isFinite(deltaTime)) {
    x += dx * deltaTime * 60; // Adjust to account for 60 FPS
    y += dy * deltaTime * 60;
    console.log(`Updated Ball position: (${x}, ${y})`); // Debugging
  } else {
    console.error(`Invalid deltaTime: ${deltaTime}`);
  }
}

// Collision Detection
function collisionDetection() {
  const currentTime = Date.now();
  if (currentTime - lastCollisionTime < collisionCooldown) {
    return;
  }

  // Ball collision with bricks
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        // Check for brick collision
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          handleBrickCollision(b);
          lastCollisionTime = currentTime;
          return; // Exit after handling a collision
        }
      }
    }
  }

  // Ball collision with paddle
  if (
    x > paddleX &&
    x < paddleX + paddleWidth &&
    y + ballRadius > canvas.height - paddleHeight
  ) {
    dy = -dy;
    lastCollisionTime = currentTime;
  }
}

function handleBrickCollision(brick) {
  dy = -dy;
  brick.hits--;
  score++;
  if (brick.hits === 0) {
    brick.status = 0;
  }
  roundComplete();
}

// Draw
function draw(timestamp) {
  if (!gameStarted) {
    drawStartScreen();
    return;
  }
  if (gameOverFlag) {
    return;
  }

  const deltaTime = (timestamp - lastTime) / 1000; // Convert ms to seconds
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawPaddle();
  drawScore();

  // Update ball position
  updateBallPosition(deltaTime);
  collisionDetection();

  // Draw the ball
  drawBall();
  console.log(`Ball position: (${x}, ${y})`); // Debugging

  // Bounce off the walls
  if (
    x + dx * deltaTime > canvas.width - ballRadius ||
    x + dx * deltaTime < ballRadius
  ) {
    dx = -dx;
  }
  if (y + dy * deltaTime < ballRadius) {
    dy = -dy;
  } else if (y + dy * deltaTime > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      console.log("Game over"); // Debugging
      gameOver();
      return;
    }
  }

  // Paddle movement
  const paddleSpeed = 400; // Adjust this value to make the paddle movement faster
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += paddleSpeed * deltaTime;
  }
  if (leftPressed && paddleX > 0) {
    paddleX -= paddleSpeed * deltaTime;
  }
  console.log(`Paddle position: ${paddleX}`); // Debugging

  lastTime = performance.now();
  requestAnimationFrame(draw);
}

// Keydown Event
document.addEventListener("keydown", handleKeydown);
function handleKeydown(e) {
  console.log("Keydown event:", e.key, e.code); // Debugging
  if (e.code === "Space" && !gameStarted) {
    startGame();
  } else if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "d" ||
    e.key === "D"
  ) {
    rightPressed = true;
  } else if (
    e.key === "Left" ||
    e.key === "ArrowLeft" ||
    e.key === "a" ||
    e.key === "A"
  ) {
    leftPressed = true;
  }
}

// Keyup Event
document.addEventListener("keyup", handleKeyup);
function handleKeyup(e) {
  console.log("Keyup event:", e.key, e.code); // Debugging
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "d" ||
    e.key === "D"
  ) {
    rightPressed = false;
  } else if (
    e.key === "Left" ||
    e.key === "ArrowLeft" ||
    e.key === "a" ||
    e.key === "A"
  ) {
    leftPressed = false;
  }
}

// GameOver Menu
function gameOver() {
  console.log("Game Over Screen");
  gameOverFlag = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "48px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Game Over", canvas.width / 2 - 140, canvas.height / 2);
  ctx.font = "36px Arial";
  ctx.fillText(
    "Score: " + score,
    canvas.width / 2 - 50,
    canvas.height / 2 + 40
  );
  ctx.font = "24px Arial";
  ctx.fillText("Try Again?", canvas.width / 2 - 50, canvas.height / 2 + 65);
  canvas.addEventListener("click", resetGame);
  document.addEventListener("keydown", resetGame);
}

//check all bricks

function roundComplete() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        return;
      }
    }
  }
  if (roundHits < MAX_HITS) {
    roundHits++; // Increase hits required for next round only if it's below MAX_HITS
  }
  currentRound++;
  gameStarted = false;
  roundIndex = (roundIndex + 1) % colors.length; // Move to next color
  resetBallAndPaddle();
  reinitializeBricks();
  draw();
}

function reinitializeBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
      if (roundHits === 1) {
        bricks[c][r].hits = 1;
      } else {
        bricks[c][r].hits = Math.min(roundHits, MAX_HITS); // Set the hits for the round, capped at MAX_HITS
      }
    }
  }
}

//Reset Game
function resetBallAndPaddle() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;
}
function resetGame() {
  canvas.removeEventListener("click", resetGame);
  document.removeEventListener("keydown", resetGame);
  gameOverFlag = false;
  gameStarted = false;
  score = 0;
  resetBallAndPaddle();
  reinitializeBricks();
  currentRound = 1;
  roundHits = 1;
  drawStartScreen();
}
lastTime = performance.now();
draw(lastTime);
