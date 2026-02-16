const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let bullets = [];
let enemies = [];
let particles = [];

let wave = 1;
let level = 1;

class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = 20;
        this.speed = 4;
        this.hp = 100;
        this.xp = 0;
    }

    update() {
        if (keys["w"]) this.y -= this.speed;
        if (keys["s"]) this.y += this.speed;
        if (keys["a"]) this.x -= this.speed;
        if (keys["d"]) this.x += this.speed;

        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }

    draw() {
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.speed = 8;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Enemy {
    constructor() {
        this.radius = 20;
        this.speed = 2 + Math.random() * wave;
        this.hp = 20 + wave * 5;

        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { this.x = 0; this.y = Math.random() * canvas.height; }
        if (edge === 1) { this.x = canvas.width; this.y = Math.random() * canvas.height; }
        if (edge === 2) { this.x = Math.random() * canvas.width; this.y = 0; }
        if (edge === 3) { this.x = Math.random() * canvas.width; this.y = canvas.height; }
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.life = 30;
        this.dx = (Math.random() - 0.5) * 6;
        this.dy = (Math.random() - 0.5) * 6;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life--;
    }

    draw() {
        ctx.fillStyle = "orange";
        ctx.fillRect(this.x, this.y, this.radius, this.radius);
    }
}

const player = new Player();

function spawnWave() {
    for (let i = 0; i < wave * 3; i++) {
        enemies.push(new Enemy());
    }
}

spawnWave();

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.update();
    player.draw();

    bullets.forEach((bullet, bIndex) => {
        bullet.update();
        bullet.draw();

        enemies.forEach((enemy, eIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (dist < enemy.radius) {
                enemy.hp -= 10;
                bullets.splice(bIndex, 1);
                particles.push(new Particle(enemy.x, enemy.y));
                if (enemy.hp <= 0) {
                    enemies.splice(eIndex, 1);
                    player.xp += 10;
                }
            }
        });
    });

    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < player.radius + enemy.radius) {
            player.hp -= 1;
        }
    });

    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
    });

    if (enemies.length === 0) {
        wave++;
        spawnWave();
    }

    if (player.xp >= level * 50) {
        level++;
        player.speed += 0.5;
    }

    document.getElementById("hp").innerText = player.hp;
    document.getElementById("level").innerText = level;
    document.getElementById("wave").innerText = wave;

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", e => {
    const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
    bullets.push(new Bullet(player.x, player.y, angle));
});

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

gameLoop();
