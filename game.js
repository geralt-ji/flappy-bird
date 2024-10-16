const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const scoreElement = document.getElementById('score');

// 设置画布大小
canvas.width = 288;
canvas.height = 512;

// 游戏变量
let bX = 10;
let bY = 150;
let gravity = 1;
let score = 0;
let pipe = [];
pipe[0] = {
    x: canvas.width,
    y: 0
};

// 颜色设置
const colors = {
    background: '#70c5ce',
    bird: '#f4ce14',
    pipe: '#3c9c4e',
    foreground: '#ddd894'
};

// 尺寸设置
const sizes = {
    bird: { width: 34, height: 24 },
    pipe: { width: 52, height: 320 }
};

// 监听键盘和鼠标事件
document.addEventListener('keydown', moveUp);
canvas.addEventListener('click', moveUp);

function moveUp(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    bY -= 30;
}

// 开始游戏
startButton.addEventListener('click', startGame);

function startGame() {
    startButton.style.display = 'none';
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    // 绘制背景
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制管道
    for (let i = 0; i < pipe.length; i++) {
        const constant = sizes.pipe.height + 80;
        ctx.fillStyle = colors.pipe;
        ctx.fillRect(pipe[i].x, pipe[i].y, sizes.pipe.width, sizes.pipe.height);
        ctx.fillRect(pipe[i].x, pipe[i].y + constant, sizes.pipe.width, sizes.pipe.height);
        pipe[i].x--;

        if (pipe[i].x == 125) {
            pipe.push({
                x: canvas.width,
                y: Math.floor(Math.random() * (canvas.height - constant - 100)) - sizes.pipe.height + 50
            });
        }

        // 碰撞检测
        if (bX + sizes.bird.width >= pipe[i].x && bX <= pipe[i].x + sizes.pipe.width &&
            (bY <= pipe[i].y + sizes.pipe.height || bY + sizes.bird.height >= pipe[i].y + constant) ||
            bY + sizes.bird.height >= canvas.height - 100) {
            location.reload();
        }

        if (pipe[i].x == 5) {
            score++;
            scoreElement.innerHTML = score;
        }
    }

    // 绘制前景
    ctx.fillStyle = colors.foreground;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // 绘制小鸟
    ctx.fillStyle = colors.bird;
    ctx.fillRect(bX, bY, sizes.bird.width, sizes.bird.height);
    bY += gravity;

    requestAnimationFrame(gameLoop);
}
