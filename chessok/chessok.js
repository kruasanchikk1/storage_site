// Игра МИКАДО - корейская версия
class MikadoGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sticks = [];
        this.score = 0;
        this.moves = 0;
        this.totalSticks = 20;
        this.gameActive = false;
        this.mode = 'meditation';
        this.selectedStick = null;

        // Типы палочек с философскими значениями
        this.stickTypes = {
            red: {
                points: 10,
                color: '#ff6b6b',
                message: "Удача сопутствует терпеливым. Твоё спокойствие привлекает успех.",
                title: "Палочка Удачи 🍀",
                wisdom: "Удача приходит к тем, кто умеет ждать"
            },
            blue: {
                points: 5,
                color: '#4ecdc4',
                message: "Мудрость в каждом движении. Ты учишься видеть глубину в простоте.",
                title: "Палочка Мудрости 📜",
                wisdom: "Знание - это не количество, а качество понимания"
            },
            black: {
                points: 0,
                color: '#2d3436',
                message: "Испытание делает сильнее. Иногда проигрыш - лучший учитель.",
                title: "Палочка Испытания ⚡",
                wisdom: "Препятствия - это ступени к мудрости"
            },
            green: {
                points: 2,
                color: '#00b894',
                message: "Мир в душе - мир в игре. Ты находишь гармонию в каждом действии.",
                title: "Палочка Мира ☮️",
                wisdom: "Внутренний покой - основа всех достижений"
            },
            yellow: {
                points: 3,
                color: '#fdcb6e',
                message: "Предки наблюдают за тобой. Их мудрость направляет твою руку.",
                title: "Палочка Предков 👵",
                wisdom: "Уважение к прошлому открывает путь в будущее"
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showRulesModal();
        this.resizeCanvas();

        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupEventListeners() {
        // Кнопка начала игры
        document.getElementById('startGame').addEventListener('click', () => {
            this.closeRulesModal();
        });

        // Кнопка закрытия правил
        document.getElementById('closeRules').addEventListener('click', () => {
            this.closeRulesModal();
        });

        // Кнопка новой игры
        document.getElementById('throwBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Выбор режима
        document.getElementById('modeSelect').addEventListener('change', (e) => {
            this.mode = e.target.value;
            this.updateGameMode();
        });

        // Обработка кликов по canvas
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameActive) return;
            this.handleCanvasClick(e);
        });

        // Кнопка продолжения в сообщениях
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.hideMessage();
        });

        // Закрытие модального окна при клике вне его
        document.getElementById('rulesModal').addEventListener('click', (e) => {
            if (e.target.id === 'rulesModal') {
                this.closeRulesModal();
            }
        });
    }

    closeRulesModal() {
        document.getElementById('rulesModal').classList.add('hidden');
        this.startGame();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width - 40;
        this.canvas.height = Math.min(400, rect.width * 0.5);

        if (this.gameActive) {
            this.draw();
        }
    }

    startGame() {
        this.score = 0;
        this.moves = 0;
        this.totalSticks = 20;
        this.gameActive = true;
        this.selectedStick = null;

        this.generateSticks();
        this.updateUI();
        this.hideMessage();

        document.getElementById('currentPlayer').innerHTML =
            `Режим: <span class="text-landing-primary font-black">${this.mode === 'meditation' ? 'Медитация' : 'Соревнование'}</span>`;
    }

    generateSticks() {
        this.sticks = [];
        const padding = 50;

        for (let i = 0; i < this.totalSticks; i++) {
            const typeKeys = Object.keys(this.stickTypes);
            const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];

            let x, y, rotation, validPosition;
            let attempts = 0;

            // Генерация позиции без пересечений
            do {
                x = padding + Math.random() * (this.canvas.width - padding * 2);
                y = padding + Math.random() * (this.canvas.height - padding * 2);
                rotation = Math.random() * Math.PI;
                validPosition = this.isPositionValid(x, y, rotation);
                attempts++;
            } while (!validPosition && attempts < 100);

            this.sticks.push({
                x: x,
                y: y,
                rotation: rotation,
                type: randomType,
                id: i,
                isSelected: false,
                isRemoved: false
            });
        }

        this.draw();
    }

    isPositionValid(x, y, rotation) {
        // Проверка на пересечение с существующими палочками
        for (const stick of this.sticks) {
            if (this.checkStickCollision(x, y, rotation, stick.x, stick.y, stick.rotation)) {
                return false;
            }
        }
        return true;
    }

    checkStickCollision(x1, y1, rot1, x2, y2, rot2) {
        // Упрощенная проверка коллизии между двумя палочками
        const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        return distance < 30; // Минимальное расстояние между палочками
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Проверяем клик по палочке (с конца массива для верхних палочек)
        for (let i = this.sticks.length - 1; i >= 0; i--) {
            const stick = this.sticks[i];
            if (!stick.isRemoved && this.isClickOnStick(x, y, stick)) {
                this.selectStick(stick);
                return;
            }
        }
    }

    isClickOnStick(x, y, stick) {
        // Преобразование координат в систему палочки
        const cos = Math.cos(-stick.rotation);
        const sin = Math.sin(-stick.rotation);
        const dx = x - stick.x;
        const dy = y - stick.y;

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Проверка попадания в границы палочки
        return Math.abs(localX) < 30 && Math.abs(localY) < 3;
    }

    selectStick(stick) {
        if (stick.isSelected || stick.isRemoved) return;

        // Проверяем, нет ли палочек сверху
        if (this.hasSticksAbove(stick)) {
            this.showMessage("Осторожно!", "Сначала извлеките верхние палочки", 'error');
            return;
        }

        stick.isSelected = true;
        this.draw();

        // Имитация задержки для драматизма
        setTimeout(() => {
            this.removeStick(stick);
        }, 300);
    }

    hasSticksAbove(stick) {
        // Проверка, есть ли палочки над текущей
        for (const otherStick of this.sticks) {
            if (!otherStick.isRemoved && otherStick.id !== stick.id) {
                // Простая проверка по Y координате
                if (otherStick.y < stick.y - 5) {
                    const distance = Math.sqrt((stick.x - otherStick.x) ** 2 + (stick.y - otherStick.y) ** 2);
                    if (distance < 40) return true;
                }
            }
        }
        return false;
    }

    removeStick(stick) {
        if (this.checkCollision(stick)) {
            this.showMessage("Неудача!", "Вы задели другие палочки. Ход завершен.", 'error');
            this.moves++;
            stick.isSelected = false;
            this.draw();
            this.updateUI();
            return;
        }

        // Успешное извлечение
        stick.isRemoved = true;
        const stickType = this.stickTypes[stick.type];
        this.score += stickType.points;
        this.moves++;
        this.totalSticks--;

        this.showStickMessage(stick);
        this.draw();
        this.updateUI();

        // Проверка конца игры
        if (this.totalSticks === 0) {
            setTimeout(() => this.endGame(), 1000);
        }
    }

    checkCollision(stick) {
        // Упрощенная проверка коллизии при извлечении
        // В реальной игре здесь была бы сложная физика
        return Math.random() < 0.2; // 20% шанс на ошибку для демонстрации
    }

    showStickMessage(stick) {
        const stickType = this.stickTypes[stick.type];
        this.showMessage(stickType.title, stickType.message, 'success');
    }

    showMessage(title, text, type = 'info') {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        document.getElementById('gameMessage').classList.remove('hidden');

        // Добавляем класс в зависимости от типа сообщения
        const message = document.getElementById('gameMessage');
        message.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white p-6 rounded-lg text-center';
        if (type === 'error') {
            message.classList.add('shake');
        }
    }

    hideMessage() {
        document.getElementById('gameMessage').classList.add('hidden');
    }

    endGame() {
        this.gameActive = false;

        let message = "";
        if (this.score >= 80) {
            message = "Великая мудрость! Вы достигли гармонии с игрой.";
        } else if (this.score >= 50) {
            message = "Хороший результат! Вы на пути к мастерству.";
        } else {
            message = "Практика ведет к совершенству. Попробуйте еще раз!";
        }

        this.showMessage("Игра завершена!", `Ваш результат: ${this.score} очков мудрости. ${message}`, 'info');
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('remaining').textContent = this.totalSticks;
    }

    updateGameMode() {
        if (this.mode === 'competitive') {
            // Добавляем таймер для соревновательного режима
            document.getElementById('currentPlayer').innerHTML +=
                ' • <span class="text-stick-red">Таймер: 60с</span>';
        }
    }

    draw() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем фон (корейский узор)
        this.drawBackground();

        // Рисуем палочки
        this.sticks.forEach(stick => {
            if (!stick.isRemoved) {
                this.drawStick(stick);
            }
        });
    }

    drawBackground() {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.05)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.05)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Тонкий узор в виде сетки
        this.ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawStick(stick) {
        this.ctx.save();
        this.ctx.translate(stick.x, stick.y