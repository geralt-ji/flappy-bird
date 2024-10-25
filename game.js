//场景过渡
const TRANSITION_DURATION = 500; // 总过渡时间，单位毫秒
 
// 简化的过渡函数
function transition(callback) {
    const transitionOverlay = document.getElementById('transition-overlay');
    
    if (!transitionOverlay) {
        console.error('Transition overlay element is missing');
        return;
    }

    // 开始过渡
    transitionOverlay.classList.add('active');

    // 在过渡中间执行回调
    setTimeout(() => {
        if (callback && typeof callback === 'function') {
            callback();
        }

        // 开始淡出过渡
        transitionOverlay.classList.remove('active');
    }, TRANSITION_DURATION / 2);
}

// 获取画布和上下文
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 获取页面1的start按钮, 页面2的开始div(非按钮, 占满了屏幕), start-title, guide-title, 暂停按钮, 分数显示, 游戏页面的重新开始按钮, 主页面和游戏页面的切换
const startButton = document.getElementById('start-button');
const gameOverlay = document.getElementById('game-overlay');
const startTitle = document.getElementById('start-title');
const guideTitle = document.getElementById('guide-title');
const pauseButton = document.getElementById('pause-button');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restart-button');
const indexScreen = document.getElementById('index-screen');
const guideScreen = document.getElementById('game-screen');

// 设置画布尺寸
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// 游戏状态
let gameRunning = false;
let pipes = [];
let bird;

// 在游戏状态中添加得分
let score = 0;

// 添加暂停状态
let isPaused = false;

// 管道和地面移动速度
let PIPE_SPEED = 2;

// 图片资源
const images = {
    background: new Image(),
    ground: new Image(),
    bird: new Image(),
    pipe: new Image()
};

// 加载图片
function loadImages() {
    images.background.src = 'flappy-bird-assets-master/sprites/background-day.png';
    images.ground.src = 'flappy-bird-assets-master/sprites/base.png';
    images.bird.src = 'flappy-bird-assets-master/sprites/yellowbird-midflap.png';
    images.pipe.src = 'flappy-bird-assets-master/sprites/pipe-green.png';

    // 加载数字图片
    for (let i = 0; i <= 9; i++) {
        const img = new Image();
        img.src = `flappy-bird-assets-master/sprites/${i}.png`;
        images[`number${i}`] = img;
    }

    // 等待所有图片加载完成
    Promise.all(Object.values(images).map(img => new Promise(resolve => img.onload = resolve)))
        .then(() => {
            init();
        });
}

// 初始化函数
function init() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    resetGame();
    
    gameOverlay.style.display = 'block'; 
    pauseButton.style.display = 'none';
    scoreDisplay.style.display = 'none';
    guideTitle.style.display = 'block';

    // 开始预览动画
    previewAnimation();
}

// 重置游戏状态
function resetGame() {
    bird = {
        x: 50,
        y: canvas.height / 2,
        radius: 20,
        velocity: 0,
        gravity: 0.3, // 重力
        jump: -7 // 跳跃
    };
    pipes = [];
    score = 0;
    generatePipe(); // 生成初始管道
}

// 地面位置坐标, 用于循环播放地面
let groundX = 0;

// 新增函数：绘制循环播放的地面
function drawScrollingGround(speed = 0) {
    // 更新地面位置
    groundX -= speed;
    if (groundX <= -canvas.width) {
        groundX = 0;
    }

    // 计算地面的高度（画布高度的20%）
    const groundHeight = canvas.height * 0.2;
    // 计算地面的Y坐标（画布高度的80%处）
    const groundY = canvas.height * 0.8;

    // 绘制两个相邻的地面图像，拉伸以适应画布大小
    ctx.drawImage(images.ground, groundX, groundY, canvas.width, groundHeight);
    ctx.drawImage(images.ground, groundX + canvas.width, groundY, canvas.width, groundHeight);
}

// 绘制场景(游戏第一次打开时会调用)
function drawScene() {
    // 绘制背景
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    
    // 绘制循环播放的地面，速度为0（静止）
    drawScrollingGround(0);

    // 绘制小鸟
    ctx.drawImage(images.bird, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
}

// 开始游戏
function startGame() {
    resetGame(); // 重新生成游戏元素
    gameRunning = true;
    startTitle.style.display = 'none';
    guideTitle.style.display = 'none';
    gameOverlay.style.display = 'none';
    restartButton.style.display = 'none';
    pauseButton.style.display = 'block';
    scoreDisplay.style.display = 'block';
    updateScoreDisplay(); // 额外触发一次更新分数显示
    jump(); // 在这里触发一次跳跃
    gameLoop();
}

// 游戏循环(游戏运行时会调用)
function gameLoop() {
    if (!gameRunning || isPaused) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景（天空）
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    // 绘制和更新管道
    drawPipes();

    // 绘制循环播放的地面，使用 PIPE_SPEED
    drawScrollingGround(PIPE_SPEED);

    // 更新分数
    updateScore();

    // 更新和绘制鸟
    updateBird();
    drawBird();

    // 如果游戏正在运行，继续循环
    requestAnimationFrame(gameLoop);
}

//得分图标
function updateScoreDisplay() {
    scoreDisplay.innerHTML = ''; // 清空现有内容
    const scoreString = score.toString();
    for (let digit of scoreString) {
        const img = document.createElement('img');
        img.src = `flappy-bird-assets-master/sprites/${digit}.png`;
        img.alt = digit;
        scoreDisplay.appendChild(img);
    }
}

// 更新分数的函数
function updateScore() {
    for (let pipe of pipes) {
        if (pipe.x + 50 < bird.x && !pipe.passed) {
            score++;
            pipe.passed = true;
            updateScoreDisplay(); // 更新分数显示
        }
    }
}
// 在画布上真实绘制管道
function drawPipes() {
    for (let pipe of pipes) {
        // 绘制上方管道（旋转180度并水平翻转）
        ctx.save();
        ctx.translate(pipe.x + 25, pipe.topY + pipe.topHeight / 2);
        ctx.rotate(Math.PI);
        ctx.scale(-1, 1); // 水平翻转
        ctx.drawImage(images.pipe, -25, -pipe.topHeight / 2);  //若后面加了宽高则需要删除
        ctx.restore();

        // 绘制方管道
        ctx.drawImage(images.pipe, pipe.x, pipe.bottomY);
        
        // 移动管道
        pipe.x -= PIPE_SPEED;
    }

    // 移除屏幕外的管道
    pipes = pipes.filter(pipe => pipe.x + 50 > 0);

    // 生成新管道
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        generatePipe();
    }
}

// 绘制鸟
function drawBird() {
    ctx.drawImage(images.bird, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
}

// 更新游戏状态
function updateGameState() {
    // 更新小鸟位置
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // 更新管道位置
    for (let pipe of pipes) {
        pipe.x -= 2; // 管道移动速度
    }
    
    // 生成新管道
    if (pipes[pipes.length - 1].x < canvas.width - 300) {
        generatePipe();
    }
    
    // 移除屏幕外的管道
    if (pipes[0].x + 50 < 0) {
        pipes.shift();
    }
    
    // 碰撞检测和得分逻辑
    // ... 添加碰撞检测和得分更新的代码 ...
}

// 生成管道参数和位置
function generatePipe() {
    const groundHeight = canvas.height * 0.2;
    const totalPipeHeight = canvas.height * 0.5;

    const minPipeHeight = canvas.height * 0.05; // 最小高度为画布的 10%
    const maxPipeHeight = canvas.height * 0.45; // 最大高度为画布的 40%

    const pipeAHeight = minPipeHeight + Math.random() * (maxPipeHeight - minPipeHeight);
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
    pauseButton.style.display = 'none';
    restartButton.style.display = 'block';
}

// 显示guide页面
function showGuide() {
    transition(() => {
        indexScreen.style.display = 'none';
        guideScreen.style.display = 'block';
    });
}

// 使用 window.location.href 跳转到 index 页面
function goToIndex() {
    transition(() => {
        // 隐藏 guide 页面, 显示 index 页面
        guideScreen.style.display = 'none';
        indexScreen.style.display = 'block';

        // 隐藏重新开始按钮, 显示开始按钮
        restartButton.style.display = 'none';
        startButton.style.display = 'block';
        
        // 显示开始标题（如果有的话）
        startTitle.style.display = 'block';
        
        // 重新初始化游戏
        init();
    });
}

// 监听窗口大小变化
window.addEventListener('resize', resizeCanvas);

// 开始div点击事件
gameOverlay.addEventListener('click', startGame);

// 重新开始按钮点击事件
restartButton.addEventListener('click', goToIndex);

// 开始按钮点击事件
startButton.addEventListener('click', showGuide);

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
    const pauseButtonImg = pauseButton.querySelector('img');
    if (isPaused) {
        pauseButtonImg.src = 'flappy-bird-assets-master/sprites/pts1.png';  // 替换为播放图标的路径
        pauseButtonImg.alt = 'Play';
    } else {
        pauseButtonImg.src = 'flappy-bird-assets-master/sprites/pts2.png';  // 使用原来的暂停图标
        pauseButtonImg.alt = 'Pause';
        if (gameRunning) {
            gameLoop();
        }
    }
});

// 初始调整画布大小
resizeCanvas();

// 初始隐藏暂停按钮
pauseButton.style.display = 'none';

// 初始化游戏
init();
// 预览动画
function previewAnimation() {
    if (gameRunning) return;
    
    // 缓慢移动管道
    for (let pipe of pipes) {
        pipe.x -= 0.5;
    }
    
    // 如果最后一个管道移出屏幕，生成新管道
    if (pipes[pipes.length - 1].x < canvas.width - 300) {
        generatePipe();
    }
    
    // 移除屏幕外的管道
    if (pipes[0].x + 50 < 0) {
        pipes.shift();
    }
    
    // 重新绘制场景
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene();
    
    requestAnimationFrame(previewAnimation);
}
// 开始预览动画
previewAnimation();

// 修改这里以先加载图片
loadImages();
