// ========== НАСТРОЙКИ ИГРЫ ==========
const GAME = {
    width: 800,
    height: 500,
    gravity: 0.1,
    kolobokSpeed: 3
};

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let canvas, ctx;
let kolobok = { x: 100, y: 300, width: 100, height: 100, speedX: GAME.kolobokSpeed, speedY: 0, rotation: 0 };
let backgroundImage = null;
let kolobokImage = null;
let score = { hits: 0, misses: 0 };
let ropes = [];
let gameState = 'playing'; // 'playing', 'hit', 'miss'

// ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ==========
function loadImages() {
    backgroundImage = new Image();
    backgroundImage.src = 'https://opengameart.org/sites/default/files/styles/medium/public/preview_208.png?itok=ABCD123'; // ЗАМЕНИТЕ НА СВОЙ ФОН
    
    kolobokImage = new Image();
    kolobokImage.src = 'images/kolobok.png'; // ваш файл
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Настройка canvas
    canvas.width = GAME.width;
    canvas.height = GAME.height;
    
    // Загрузка изображений
    loadImages();
    
    // Обработчики событий
    canvas.addEventListener('click', throwRope);
    
    // Запуск игрового цикла
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState !== 'playing') return;
    
    // Движение Колобка
    kolobok.x += kolobok.speedX;
    kolobok.y += kolobok.speedY;
    kolobok.rotation += 0.05;
    
    // Гравитация
    kolobok.speedY += GAME.gravity;
    
    // Отскок от земли
    if (kolobok.y + kolobok.height > GAME.height) {
        kolobok.y = GAME.height - kolobok.height;
        kolobok.speedY = -kolobok.speedY * 0.8;
    }
    
    // Возврат с краёв экрана
    if (kolobok.x > GAME.width) kolobok.x = -kolobok.width;
    if (kolobok.x < -kolobok.width) kolobok.x = GAME.width;
}

function draw() {
    // Очистка canvas
    ctx.clearRect(0, 0, GAME.width, GAME.height);
    
    // Рисование фона
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, GAME.width, GAME.height);
    }
    
    // Рисование Колобка
    if (kolobokImage.complete) {
        ctx.save();
        ctx.translate(kolobok.x + kolobok.width/2, kolobok.y + kolobok.height/2);
        ctx.rotate(kolobok.rotation);
        ctx.drawImage(kolobokImage, -kolobok.width/2, -kolobok.height/2, kolobok.width, kolobok.height);
        ctx.restore();
    }
    
    // Рисование петель
    drawRopes();
    
    // Рисование счёта
    drawScore();
}

function drawScore() {
    document.getElementById('score').innerHTML = 
        `Попаданий: <span>${score.hits}</span> | Промахов: <span>${score.misses}</span>`;
}

// ========== ЛОГИКА ПЕТЛИ ==========
function throwRope(event) {
    if (gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    ropes.push({
        x: clickX,
        y: 0,
        targetX: clickX,
        targetY: clickY,
        progress: 0,
        speed: 0.1
    });
    
    // Проверка попадания (упрощённая логика)
    const distance = Math.sqrt(
        Math.pow(clickX - (kolobok.x + kolobok.width/2), 2) + 
        Math.pow(clickY - (kolobok.y + kolobok.height/2), 2)
    );
    
    if (distance < 60) { // Попадание
        score.hits++;
        gameState = 'hit';
        setTimeout(() => gameState = 'playing', 1000);
        kolobok.speedX *= -1.2; // Отскок при попадании
    } else { // Промах
        score.misses++;
        gameState = 'miss';
        setTimeout(() => gameState = 'playing', 800);
    }
}

function drawRopes() {
    ropes.forEach((rope, index) => {
        rope.progress += rope.speed;
        
        if (rope.progress >= 1) {
            ropes.splice(index, 1);
            return;
        }
        
        const x = rope.x;
        const y = rope.y + (rope.targetY - rope.y) * rope.progress;
        
        // Рисование петли (простой круг)
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    });
}

// ========== ЗАПУСК ИГРЫ ==========
// Ждём загрузки страницы
window.addEventListener('load', init);