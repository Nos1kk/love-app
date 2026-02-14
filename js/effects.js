// js/effects.js — Визуальные эффекты

class Effects {
    constructor() {
        this.floatingContainer = null;
        this.sparkleContainer = null;
        this.init();
    }

    init() {
        this.setupContainers();
        this.createFloatingHearts();
        this.createSparkles();
    }

    setupContainers() {
        // Используем существующие контейнеры из HTML
        this.floatingContainer = document.getElementById('floatingHearts');
        this.sparkleContainer = document.getElementById('sparkleContainer');

        // Если нет — создаём
        if (!this.floatingContainer) {
            this.floatingContainer = document.createElement('div');
            this.floatingContainer.className = 'floating-hearts';
            this.floatingContainer.id = 'floatingHearts';
            document.body.prepend(this.floatingContainer);
        }

        if (!this.sparkleContainer) {
            this.sparkleContainer = document.createElement('div');
            this.sparkleContainer.className = 'sparkle-container';
            this.sparkleContainer.id = 'sparkleContainer';
            document.body.prepend(this.sparkleContainer);
        }
    }

    createFloatingHearts() {
        const hearts = ['💕', '💗', '💖', '💝', '❤️', '🩷', '🤍', '💜', '🌸', '🦋', '✨', '⭐'];

        // Очистить если уже есть
        this.floatingContainer.innerHTML = '';

        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart-float';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (8 + Math.random() * 12) + 's';
            heart.style.animationDelay = Math.random() * 10 + 's';
            heart.style.fontSize = (14 + Math.random() * 18) + 'px';
            this.floatingContainer.appendChild(heart);
        }
    }

    createSparkles() {
        this.sparkleContainer.innerHTML = '';

        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 3 + 's';
            sparkle.style.animationDuration = (2 + Math.random() * 3) + 's';
            this.sparkleContainer.appendChild(sparkle);
        }
    }

    launchConfetti(count = 60) {
        const colors = ['#FF85A2', '#C77DFF', '#FFD700', '#FF4778', '#FFDAB9', '#FF7F7F', '#E91E63'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
            confetti.style.animationDelay = Math.random() * 1 + 's';
            confetti.style.width = (6 + Math.random() * 6) + 'px';
            confetti.style.height = (10 + Math.random() * 10) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
    }

    launchHeartBurst(x, y) {
        const heartEmojis = ['💕', '💗', '💖', '💝', '❤️'];
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.style.position = 'fixed';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            heart.style.fontSize = (16 + Math.random() * 14) + 'px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '999';
            heart.style.transition = 'all 1s ease-out';
            heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            document.body.appendChild(heart);

            requestAnimationFrame(() => {
                heart.style.left = (x + (Math.random() - 0.5) * 200) + 'px';
                heart.style.top = (y - 50 - Math.random() * 150) + 'px';
                heart.style.opacity = '0';
                heart.style.transform = `scale(${1 + Math.random()}) rotate(${Math.random() * 360}deg)`;
            });

            setTimeout(() => heart.remove(), 1200);
        }
    }

    showFireworks() {
        // Простые визуальные вспышки
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.launchConfetti(20);
            }, i * 300);
        }
    }

    typeWriter(element, text, speed = 50) {
        return new Promise(resolve => {
            element.textContent = '';
            let i = 0;
            const timer = setInterval(() => {
                element.textContent += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }

    fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    shakeElement(element) {
        element.style.animation = 'none';
        requestAnimationFrame(() => {
            element.style.animation = 'shake 0.5s ease';
        });
    }

    pulseElement(element) {
        element.style.animation = 'none';
        requestAnimationFrame(() => {
            element.style.animation = 'bounce-heart 0.6s ease';
        });
    }
}

window.Effects = Effects;