// 获取画布和上下文
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 获取开始按钮
const startButton = document.getElementById('start-button');

// 获取暂停按钮和分数显示元素
const pauseButton = document.getElementById('pause-button');
const scoreDisplay = document.getElementById('score');

// 设置画布尺寸
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// 颜色配置
const colors = {
    sky: '#70c5ce',
    ground: '#ded895',
    pipe: 'green',
    bird: 'yellow'
};

// 游戏状态
let gameRunning = false;
let pipes = [];
let bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 20,
    velocity: 0,
    gravity: 0.2,
    jump: -5
};

// 在游戏状态中添加得分
let score = 0;

// 添加暂停状态
let isPaused = false;

// 初始化游戏
function initGame() {
    resizeCanvas();
    gameRunning = true;
    pipes = [];
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    generatePipe();
    startButton.style.display = 'none';  // 隐藏开始按钮
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    scoreDisplay.style.display = 'block';
    pauseButton.style.display = 'block';
    isPaused = false;
    pauseButton.textContent = '| |';
    gameLoop();
}

// 生成管道
function generatePipe() {
    const groundHeight = canvas.height * 0.2;
    const skyHeight = canvas.height * 0.8;
    const gapHeight = canvas.height * 0.3;
    const totalPipeHeight = canvas.height * 0.5;

    const pipeAHeight = Math.random() * totalPipeHeight;
    const pipeBHeight = totalPipeHeight - pipeAHeight;

    pipes.push({
        x: canvas.width,
        topY: 0,
        topHeight: pipeAHeight,
        bottomY: canvas.height - groundHeight - pipeBHeight,
        bottomHeight: pipeBHeight,
        passed: false  // 添加这个属性
    });
}

// 绘制鸟
function drawBird() {
    ctx.fillStyle = colors.bird;
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
}

// 更新鸟的位置
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // 防止鸟飞出屏幕顶部
    if (bird.y - bird.radius < 0) {
        bird.y = bird.radius;
        bird.velocity = 0;
    }

    // 检测鸟是否碰到地面
    if (bird.y + bird.radius > canvas.height * 0.8) {
        gameOver();
    }

    // 检测鸟是否碰到管道
    for (let pipe of pipes) {
        if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + 50) { // 50 是管道宽度
            // 检测是否碰到上方管道
            if (bird.y - bird.radius < pipe.topHeight) {
                gameOver();
            }
            // 检测是否碰到下方管道
            if (bird.y + bird.radius > pipe.bottomY) {
                gameOver();
            }
        }
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    startButton.style.display = 'block';  // 显示开始按钮
    pauseButton.style.display = 'none';
    // 不要隐藏分数显示
    // scoreDisplay.style.display = 'none';
}

// 游戏主循环
function gameLoop() {
    if (!gameRunning || isPaused) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制天空
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.8);

    // 绘制地面
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);

    // 绘制和移动管道
    ctx.fillStyle = colors.pipe;
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        // 绘制上方管道
        ctx.fillRect(pipe.x, pipe.topY, 50, pipe.topHeight);
        // 绘制下方管道
        ctx.fillRect(pipe.x, pipe.bottomY, 50, pipe.bottomHeight);
        
        // 移动管道
        pipe.x -= 2;

        // 如果管道移出屏幕，则删除
        if (pipe.x + 50 < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }

    // 更新分数
    for (let i = 0; i < pipes.length; i++) {
        if (pipes[i].x + 50 < bird.x && !pipes[i].passed) {
            score++;
            pipes[i].passed = true;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    }

    // 更新得分显示
    scoreDisplay.textContent = `Score: ${score}`;

    // 生成新管道
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        generatePipe();
    }

    // 更新和绘制鸟
    updateBird();
    drawBird();

    // 如果游戏正在运行，继续循环
    requestAnimationFrame(gameLoop);
}

// 监听窗口大小变化
window.addEventListener('resize', resizeCanvas);

// 开始按钮点击事件
startButton.addEventListener('click', initGame);

// 跳跃函数
function jump() {
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
}

// 添加键盘跳跃功能
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        jump();
    }
});

// 添加鼠标点击跳跃功能
canvas.addEventListener('click', jump);

// 添加触摸屏幕跳跃功能（对于移动设备）
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); // 防止默认的触摸行为
    jump();
});

// 暂停按钮点击事件
pauseButton.addEventListener('click', function() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseButton.textContent = '▶';
    } else {
        pauseButton.textContent = '| |';
        if (gameRunning) {
            gameLoop();
        }
    }
});

// 初始调整画布大小
resizeCanvas();

// 初始隐藏暂停按钮
pauseButton.style.display = 'none';
