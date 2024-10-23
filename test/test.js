document.addEventListener('DOMContentLoaded', function() {
    // 创建一个 img 元素
    var img = document.createElement('img');
    img.src = '../flappy-bird-assets-master/sprites/yellowbird-act.gif';

    // 将 img 添加到容器中
    document.getElementById('gif-container').appendChild(img);

    // 检查 gif.js 中定义的主要函数或类
    if (typeof Gif !== 'undefined') {
        console.log('Using Gif class');
        var gif = new Gif({
            src: img.src,
            container: document.getElementById('gif-container'),
            autoplay: true
        });
    } else if (typeof GIF !== 'undefined') {
        console.log('Using GIF class');
        var gif = new GIF({
            src: img.src,
            container: document.getElementById('gif-container'),
            autoplay: true
        });
    } else {
        console.error('No Gif or GIF class found in gif.js');
        // 如果没有找到预期的类，至少显示静态图片
        return;
    }

    // 如果 gif 对象有 load 方法，使用它
    if (typeof gif.load === 'function') {
        gif.load(function() {
            console.log('GIF loaded successfully');
        });
    }
});
