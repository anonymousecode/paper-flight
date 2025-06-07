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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Bird
const birdImg = new Image();
birdImg.src = 'images/plane.png'; // correct relative path

let bX = 50;
let bY = 150;
const bWidth = 80;
const bHeight = 40;
let velocityY = 0;
const gravity = 0.1;
const lift = -4;

// Pipes
const pipeWidth = 50;
const gap = 250;
let pipes = [];

function pipe() {
  const minPipeHeight = 50;  // minimum height for top or bottom pipe
  const maxTop = canvas.height - gap - minPipeHeight; // max top pipe height to leave space for gap and bottom pipe
  
  let top = Math.random() * (maxTop - minPipeHeight) + minPipeHeight;  // top height between minPipeHeight and maxTop
  
  pipes.push({
    x: canvas.width,
    top: top,
    bottom: canvas.height - (top + gap)
  });
}


// Controls
document.addEventListener('keydown', (e) => {
  if (e.code === "Space") {
    if (gameOver) {
      resetGame();
    } else {
      velocityY = lift;
    }
  }
});

// Restart
function resetGame() {
  bX = 50;
  bY = 150;
  velocityY = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  window.scoreSaved = false;
  loop();
}

// Save Score to Firebase
function saveScore(name, score) {
  const scoresRef = database.ref("scores");
  const newScoreRef = scoresRef.push();
  newScoreRef.set({
    name: name,
    score: score,
    timestamp: Date.now()
  }).then(() => {
    console.log("✅ Score saved to Firebase!");
  }).catch((err) => {
    console.error("❌ Failed to save:", err);
  });
}

// Get Highest Score from Firebase
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

// Game Loop Variables
let frame = 0;
let score = 0;
let gameOver = false;

function loop() {
  if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Bebas Neue';
    ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2 + 40);

    if (!window.scoreSaved) {
      const name = prompt("Enter your name:");
      if (name) {
        getHighestScore().then(highestScore => {
          if (score > highestScore) {
            saveScore(name, score);
          } else {
            console.log("Score not higher than current high score, not saving.");
          }
          window.scoreSaved = true;
        });
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

  frame++;
  requestAnimationFrame(loop);
}

pipe();
loop();
