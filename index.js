//canvas

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial call


//bird

let bX = 50;
let bY = 150;
const bWidth = 30;
const bHeight = 30;
const gravity = 0.1;
const lift = -5;
let velocityY = 0;

//pipes

const pipeWidth = 50;
const gap = 200;
let pipes = [];

function pipe(){
    let top = Math.random() * (canvas.height - gap - 50);
    pipes.push({
        x: canvas.width,    
        top,
        bottom: canvas.height - (top + gap),
    });
}

pipe();
console.log('Initial pipes:', pipes);

//controls

document.addEventListener('keydown', () => {
    velocityY = lift;
    console.log('Key pressed, velocityY:', velocityY);
});


//loop

let frame = 0;
let score = 0;
let gameOver = false;

function loop() {
    if(gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 70, canvas.height / 2 + 40);
        return;
    }   

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    velocityY += gravity;
    bY += velocityY;

    ctx.fillStyle = 'blue';
    ctx.fillRect(bX, bY, bWidth, bHeight);

    if(frame % 100 === 0) {
        pipe();
    }

    for(let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        p.x -= 2;

        ctx.fillStyle = 'green';
        ctx.fillRect(p.x, 0, pipeWidth, p.top);
        ctx.fillRect(p.x, canvas.height - p.bottom, pipeWidth, p.bottom);

        if(bX < p.x + pipeWidth && 
           bX + bWidth > p.x && 
           (bY < p.top || bY + bHeight > canvas.height - p.bottom)) {
            console.log('Collision detected');
            gameOver = true;
        }
        if(p.x + pipeWidth == bX){
            score++
        }
    }

    if(bY+ bHeight > canvas.height || bY < 0) {
        console.log('Out of bounds');
        gameOver = true;
    }

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    frame++;
    requestAnimationFrame(loop);
}

loop();
