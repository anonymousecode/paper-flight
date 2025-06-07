// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBhWKadr1JSHab7e-6hyAN4I3PD7x2sx9g",
  authDomain: "paper-flight-9fd4d.firebaseapp.com",
  projectId: "paper-flight-9fd4d",
  storageBucket: "paper-flight-9fd4d.appspot.com",
  messagingSenderId: "808707291981",
  appId: "1:808707291981:web:7afbbaa7246b58f0f01504",
  databaseURL: "https://paper-flight-9fd4d-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const birdImg = new Image();
birdImg.src = 'images/plane.png'; // Make sure this path is correct

let bX = 50;
let bY = 150;
const bWidth = 80;
const bHeight = 40;
let velocityY = 0;
const gravity = 0.1;
const lift = -4;

const pipeWidth = 50;
const gap = 250;
let pipes = [];

function pipe() {
  const minPipeHeight = 50;
  const maxTop = canvas.height - gap - minPipeHeight;
  let top = Math.random() * (maxTop - minPipeHeight) + minPipeHeight;

  pipes.push({
    x: canvas.width,
    top: top,
    bottom: canvas.height - (top + gap)
  });
}

document.addEventListener('keydown', (e) => {
  if (e.code === "Space") {
    if (gameOver) {
      resetGame();
    } else {
      velocityY = lift;
    }
  }
});

function resetGame() {
  bX = 50;
  bY = 150;
  velocityY = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  window.scoreSaved = false;
  document.getElementById("scoreModal").style.display = "none";
  document.getElementById("gameOverModal").style.display = "none";
  loop();
}

function saveScore(score) {
  const scoresRef = database.ref("scores");
  const newScoreRef = scoresRef.push();
  newScoreRef.set({
    score: score,
    timestamp: Date.now()
  }).then(() => {
    console.log("✅ Score saved to Firebase!");
  }).catch((err) => {
    console.error("❌ Failed to save:", err);
  });
}

async function getHighestScore() {
  const scoresRef = database.ref("scores");
  const snapshot = await scoresRef.orderByChild('score').limitToLast(1).once('value');
  let highest = 0;
  snapshot.forEach(childSnapshot => {
    const data = childSnapshot.val();
    if (data.score > highest) {
      highest = data.score;
    }
  });
  return highest;
}

let frame = 0;
let score = 0;
let gameOver = false;
let highestScore = 0;

function loop() {
  if (gameOver) {
    if (!window.scoreSaved) {
      window.scoreSaved = true;

      if (score > highestScore) {
        console.log("New high score! Showing scoreModal");

        // Save the score automatically here
        saveScore(score);

        document.getElementById("finalScore").textContent = score;
        document.getElementById("scoreModal").style.display = "flex";

        // Auto hide modal and restart after 3 seconds
        setTimeout(() => {
          document.getElementById("scoreModal").style.display = "none";
          resetGame();
        }, 3000);

      } else {
        document.getElementById("gameOverScore").textContent = score;
        document.getElementById("gameOverModal").style.display = "flex";
      }
    }
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  velocityY += gravity;
  bY += velocityY;

  ctx.drawImage(birdImg, bX, bY, bWidth, bHeight);

  if (frame % 150 === 0) {
    pipe();
  }

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    p.x -= 2;

    ctx.fillStyle = 'green';
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    ctx.fillRect(p.x, canvas.height - p.bottom, pipeWidth, p.bottom);

    if (
      bX < p.x + pipeWidth &&
      bX + bWidth > p.x &&
      (bY < p.top || bY + bHeight > canvas.height - p.bottom)
    ) {
      gameOver = true;
    }

    if (p.x + pipeWidth === bX) {
      score++;
    }
  }

  if (bY + bHeight > canvas.height || bY < 0) {
    gameOver = true;
  }

  ctx.fillStyle = 'black';
  ctx.font = '30px Bebas Neue';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Highscore: ${highestScore}`, 10, 60);

  frame++;
  requestAnimationFrame(loop);
}

document.getElementById("restartGame").addEventListener("click", () => {
  document.getElementById("gameOverModal").style.display = "none";
  resetGame();
});

document.addEventListener('keydown', (e) => {
  // If game over modal or score modal is visible, close them on any key press
  const scoreModal = document.getElementById("scoreModal");
  const gameOverModal = document.getElementById("gameOverModal");

  if (scoreModal.style.display === "flex" || gameOverModal.style.display === "flex") {
    scoreModal.style.display = "none";
    gameOverModal.style.display = "none";
    resetGame(); // restart the game on key press
  }
});


// Start the game
async function startGame() {
  highestScore = await getHighestScore();
  console.log("Highest score loaded:", highestScore);
  pipe();
  loop();
}

startGame();
