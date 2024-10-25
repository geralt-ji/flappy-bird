// 获取画布和上下文
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 图片资源
const images = {
    background: new Image(),
    ground: new Image(),
    bird: new Image(),
};

// 加载图片
function loadImages() {
    images.background.src = 'flappy-bird-assets-master/sprites/background-day.png';
    images.ground.src = 'flappy-bird-assets-master/sprites/base.png';
    images.bird.src = 'flappy-bird-assets-master/sprites/yellowbird-midflap.png';

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
    
    // 绘制场景
    drawScene();
}

// 绘制场景
function drawScene() {
    // 绘制背景
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    
    // 绘制地面
    const groundHeight = canvas.height * 0.2;
    const groundY = canvas.height * 0.8;
    ctx.drawImage(images.ground, 0, groundY, canvas.width, groundHeight);

    // 绘制小鸟
    const birdSize = 40;
    const birdX = canvas.width / 2 - birdSize / 2;
    const birdY = canvas.height / 2 - birdSize / 2;
    ctx.drawImage(images.bird, birdX, birdY, birdSize, birdSize);
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawScene();
});

// 开始加载图片
loadImages();
