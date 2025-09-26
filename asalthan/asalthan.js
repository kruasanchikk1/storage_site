// asalthan.js - полная логика игры Асалтыхан
class AsalthanGame {
    constructor() {
        this.boardSize = 8;
        this.board = [];
        this.playerPosition = { row: 0, col: 0 };
        this.hunters = [];
        this.honorPoints = [];
        this.gameActive = false;
        this.score = 0;
        this.honor = 100;
        this.timeSurvived = 0;
        this.round = 1;
        this.gameSpeed = 1500; // миллисекунды между ходами
        this.gameInterval = null;
        this.timeInterval = null;
        
        // Способности
        this.abilities = {
            shield: 3,
            slow: 2
        };
        this.shieldActive = false;
        this.slowActive = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        this.setupEventListeners();
        
        // Показываем правила при первом запуске
        this.showWelcomeRules();
    }

    createBoard() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        
        // Размещаем игрока в левом верхнем углу
        this.board[this.playerPosition.row][this.playerPosition.col] = 'player';
        
        // Создаем охотников
        this.createHunters();
        
        // Создаем точки чести
        this.createHonorPoints();
    }

    createHunters() {
        this.hunters = [];
        const hunterCount = Math.min(3 + this.round, 6);
        
        for (let i = 0; i < hunterCount; i++) {
            let position;
            do {
                position = {
                    row: Math.floor(Math.random() * this.boardSize),
                    col: Math.floor(Math.random() * this.boardSize)
                };
            } while (this.board[position.row][position.col] !== null);
            
            this.hunters.push(position);
            this.board[position.row][position.col] = 'hunter';
        }
    }

    createHonorPoints() {
        this.honorPoints = [];
        const pointCount = Math.min(2 + this.round, 5);
        
        for (let i = 0; i < pointCount; i++) {
            let position;
            do {
                position = {
                    row: Math.floor(Math.random() * this.boardSize),
                    col: Math.floor(Math.random() * this.boardSize)
                };
            } while (this.board[position.row][position.col] !== null);
            
            this.honorPoints.push(position);
            this.board[position.row][position.col] = 'honor';
        }
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.style.display = 'grid';
        gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        gameBoard.style.gap = '2px';
        gameBoard.style.width = '400px';
        gameBoard.style.height = '400px';
        gameBoard.style.margin = '0 auto';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell relative flex items-center justify-center transition-all duration-200';
                cell.style.aspectRatio = '1';
                cell.style.background = 'rgba(108, 195, 238, 0.05)';
                cell.style.border = '1px solid rgba(108, 195, 238, 0.2)';
                cell.style.cursor = this.gameActive ? 'pointer' : 'default';

                // Добавляем содержимое клетки
                if (this.board[row][col] === 'player') {
                    const player = document.createElement('div');
                    player.className = 'player absolute w-4/5 h-4/5 rounded-full flex items-center justify-center';
                    player.style.background = this.shieldActive ? 'linear-gradient(45deg, #ffd700, #ffed4e)' : '#10b981';
                    player.style.border = '2px solid #059669';
                    player.innerHTML = this.shieldActive ? '🛡️' : '🏃';
                    player.style.fontSize = '16px';
                    cell.appendChild(player);
                } else if (this.board[row][col] === 'hunter') {
                    const hunter = document.createElement('div');
                    hunter.className = 'hunter absolute w-4/5 h-4/5 rounded-full flex items-center justify-center';
                    hunter.style.background = this.slowActive ? '#6b7280' : '#ef4444';
                    hunter.style.border = '2px solid #dc2626';
                    hunter.innerHTML = this.slowActive ? '🐌' : '🏹';
                    hunter.style.fontSize = '14px';
                    cell.appendChild(hunter);
                } else if (this.board[row][col] === 'honor') {
                    const honor = document.createElement('div');
                    honor.className = 'honor absolute w-3/5 h-3/5 rounded-full flex items-center justify-center';
                    honor.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
                    honor.style.border = '2px solid #f59e0b';
                    honor.innerHTML = '⭐';
                    honor.style.fontSize = '12px';
                    cell.appendChild(honor);
                }

                // Подсветка возможных ходов
                if (this.gameActive && this.isValidMove(row, col)) {
                    if (this.board[row][col] === 'honor') {
                        // Золотая подсветка для звезд
                        cell.style.background = 'rgba(255, 215, 0, 0.3)';
                        cell.style.borderColor = '#ffd700';
                        cell.style.boxShadow = '0 0 12px rgba(255, 215, 0, 0.5)';
                    } else {
                        // Зеленая подсветка для пустых клеток
                        cell.style.background = 'rgba(16, 185, 129, 0.2)';
                        cell.style.borderColor = '#10b981';
                        cell.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.3)';
                    }
                }

                // Обработка кликов
                if (this.gameActive) {
                    cell.addEventListener('click', () => this.handleCellClick(row, col));
                }

                gameBoard.appendChild(cell);
            }
        }
    }

    isValidMove(targetRow, targetCol) {
        if (!this.gameActive) return false;
        
        // Нельзя ходить на клетки с охотниками, но можно на пустые и со звездами
        if (this.board[targetRow][targetCol] === 'hunter') return false;

        const rowDiff = Math.abs(targetRow - this.playerPosition.row);
        const colDiff = Math.abs(targetCol - this.playerPosition.col);
        
        // Игрок может ходить на соседние клетки (включая диагонали)
        return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
    }

    handleCellClick(row, col) {
        if (!this.gameActive || !this.isValidMove(row, col)) return;

        // Очищаем старую позицию игрока
        this.board[this.playerPosition.row][this.playerPosition.col] = null;
        
        // Проверяем, что на новой позиции
        if (this.board[row][col] === 'honor') {
            // Собираем звезду
            this.collectHonor(row, col);
        } else if (this.board[row][col] === 'hunter') {
            this.handleCollision();
            return;
        }

        // Перемещаем игрока
        this.playerPosition = { row, col };
        this.board[row][col] = 'player';
        
        this.renderBoard();
        this.updateUI();
    }

    collectHonor(row, col) {
        this.score += 10;
        this.honor = Math.min(100, this.honor + 20);
        
        // Удаляем точку чести
        const honorIndex = this.honorPoints.findIndex(p => p.row === row && p.col === col);
        if (honorIndex !== -1) {
            this.honorPoints.splice(honorIndex, 1);
        }
        
        // Очищаем клетку от звезды
        this.board[row][col] = null;
        
        this.updateUI();
        this.updateGameStatus(`⭐ +10 очков! Честь: ${this.honor}%`);
        
        // Возвращаем обычное сообщение через 2 секунды
        setTimeout(() => {
            if (this.gameActive) {
                this.updateGameStatus('🏃 Продолжайте уклоняться от охотников!');
            }
        }, 2000);
    }

    handleCollision() {
        if (this.shieldActive) {
            // Щит защищает от потери чести
            this.score += 5;
            this.updateGameStatus('🛡️ Щит защитил вас! +5 очков за отвагу!');
            
            // Возвращаем обычное сообщение через 2 секунды
            setTimeout(() => {
                if (this.gameActive) {
                    this.updateGameStatus('🏃 Продолжайте уклоняться от охотников!');
                }
            }, 2000);
            return;
        }
        
        this.honor = Math.max(0, this.honor - 25);
        
        if (this.honor <= 0) {
            this.endGame();
        } else {
            this.updateGameStatus(`💥 Столкновение! Честь: ${this.honor}% (осталось ${this.honor/25} столкновений)`);
            
            // Возвращаем обычное сообщение через 2 секунды
            setTimeout(() => {
                if (this.gameActive) {
                    this.updateGameStatus('🏃 Продолжайте уклоняться от охотников!');
                }
            }, 2000);
        }
        
        this.updateUI();
    }

    startGame() {
        if (this.gameActive) return;
        
        this.gameActive = true;
        this.score = 0;
        this.honor = 100;
        this.timeSurvived = 0;
        this.round = 1;
        this.gameSpeed = 1500;
        
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        
        // Запускаем игровой цикл
        this.gameInterval = setInterval(() => this.gameTick(), this.gameSpeed);
        this.timeInterval = setInterval(() => {
            this.timeSurvived++;
            this.updateUI();
        }, 1000);
        
        this.updateGameStatus('🎮 ИГРА НАЧАЛАСЬ! Кликайте на зеленые клетки для движения!');
        
        // Показываем подсказку через 3 секунды
        setTimeout(() => {
            if (this.gameActive) {
                this.updateGameStatus('⭐ Собирайте золотые звезды для очков и чести!');
            }
        }, 3000);
    }

    gameTick() {
        if (!this.gameActive) return;
        
        // Двигаем охотников к игроку (только один раз за ход)
        this.moveHunters();
        
        // Проверяем столкновения
        this.checkCollisions();
        
        // Проверяем, нужно ли создать новый раунд
        if (this.honorPoints.length === 0) {
            this.nextRound();
        }
        
        this.renderBoard();
        this.updateUI();
    }

    moveHunters() {
        this.hunters.forEach(hunter => {
            const oldRow = hunter.row;
            const oldCol = hunter.col;
            
            // Простой AI: двигаемся к игроку, но не слишком агрессивно
            const rowDiff = this.playerPosition.row - hunter.row;
            const colDiff = this.playerPosition.col - hunter.col;
            
            let newRow = hunter.row;
            let newCol = hunter.col;
            
            // Двигаемся только на одну клетку за ход
            if (Math.abs(rowDiff) > Math.abs(colDiff)) {
                // Двигаемся по вертикали
                newRow += rowDiff > 0 ? 1 : -1;
            } else if (colDiff !== 0) {
                // Двигаемся по горизонтали
                newCol += colDiff > 0 ? 1 : -1;
            }
            
            // Проверяем границы и препятствия
            if (newRow >= 0 && newRow < this.boardSize && 
                newCol >= 0 && newCol < this.boardSize &&
                this.board[newRow][newCol] === null) {
                
                this.board[oldRow][oldCol] = null;
                hunter.row = newRow;
                hunter.col = newCol;
                this.board[newRow][newCol] = 'hunter';
            }
        });
    }

    checkCollisions() {
        // Проверяем столкновения с охотниками
        this.hunters.forEach(hunter => {
            if (hunter.row === this.playerPosition.row && hunter.col === this.playerPosition.col) {
                this.handleCollision();
            }
        });
    }

    nextRound() {
        this.round++;
        this.gameSpeed = Math.max(500, this.gameSpeed - 100); // Увеличиваем скорость
        
        // Очищаем интервал и создаем новый
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.gameTick(), this.gameSpeed);
        
        // Создаем новые точки чести
        this.createHonorPoints();
        
        this.updateGameStatus(`РАУНД ${this.round}! СОБИРАЙТЕ ТОЧКИ ЧЕСТИ!`);
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.gameInterval);
        clearInterval(this.timeInterval);
        
        this.updateGameStatus(`ИГРА ОКОНЧЕНА! Очки: ${this.score}, Время: ${this.timeSurvived}с`);
    }

    resetGame() {
        this.gameActive = false;
        clearInterval(this.gameInterval);
        clearInterval(this.timeInterval);
        
        this.score = 0;
        this.honor = 100;
        this.timeSurvived = 0;
        this.round = 1;
        this.gameSpeed = 1500;
        this.shieldActive = false;
        this.slowActive = false;
        this.abilities = { shield: 3, slow: 2 };
        
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        this.updateGameStatus('НАЖМИТЕ "НАЧАТЬ ИГРУ"');
    }

activateShield() {
    if (this.abilities.shield > 0 && this.gameActive) {
        this.shieldActive = true;
        this.abilities.shield--;
        this.updateUI();
            this.renderBoard();
            this.updateGameStatus('🛡️ Щит чести активирован! Защита на 5 секунд!');

        setTimeout(() => {
            this.shieldActive = false;
            this.renderBoard();
                this.updateGameStatus('🛡️ Щит чести закончился!');
        }, 5000); // Щит действует 5 секунд
        } else if (this.abilities.shield <= 0) {
            this.updateGameStatus('❌ Щит чести недоступен!');
        } else {
            this.updateGameStatus('❌ Сначала начните игру!');
    }
}

activateSlow() {
    if (this.abilities.slow > 0 && this.gameActive) {
        this.slowActive = true;
        this.abilities.slow--;
        this.updateUI();
            this.renderBoard();
            this.updateGameStatus('⏰ Замедление активировано! Охотники замедлены на 3 секунды!');

        setTimeout(() => {
            this.slowActive = false;
            this.renderBoard();
                this.updateGameStatus('⏰ Замедление закончилось!');
        }, 3000); // Замедление действует 3 секунды
        } else if (this.abilities.slow <= 0) {
            this.updateGameStatus('❌ Замедление недоступно!');
        } else {
            this.updateGameStatus('❌ Сначала начните игру!');
    }
}

updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('timeSurvived').textContent = this.timeSurvived;
    document.getElementById('honorValue').textContent = `${this.honor}%`;
    document.getElementById('honorBar').style.width = `${this.honor}%`;
    document.getElementById('roundCounter').textContent = this.round;
    document.getElementById('shieldCount').textContent = this.abilities.shield;
    document.getElementById('slowCount').textContent = this.abilities.slow;

        // Обновляем состояние кнопок способностей
        const shieldBtn = document.getElementById('shieldBtn');
        const slowBtn = document.getElementById('slowBtn');
        
        if (this.abilities.shield <= 0 || !this.gameActive) {
            shieldBtn.disabled = true;
            shieldBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            shieldBtn.disabled = false;
            shieldBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        
        if (this.abilities.slow <= 0 || !this.gameActive) {
            slowBtn.disabled = true;
            slowBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            slowBtn.disabled = false;
            slowBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    updateGameStatus(message) {
        document.getElementById('gameStatus').innerHTML = `<p class="text-honor-gold font-bold">${message}</p>`;
    }

    setupEventListeners() {
        // Добавляем обработчики для кнопок способностей
        document.getElementById('shieldBtn').addEventListener('click', () => {
            this.activateShield();
        });
        
        document.getElementById('slowBtn').addEventListener('click', () => {
            this.activateSlow();
        });
    }

    showWelcomeRules() {
        // Показываем правила при каждом заходе на страницу
        const rulesModal = document.getElementById('rulesModal');
        if (rulesModal) {
            rulesModal.classList.remove('hidden');
        }
    }

    resetRulesShown() {
        localStorage.removeItem('asalthanRulesShown');
        this.showWelcomeRules();
    }
}

// Глобальные функции
let game;

function initGame() {
    game = new AsalthanGame();
}

// Инициализация при загрузке страницы (если не инициализирована в HTML)
document.addEventListener('DOMContentLoaded', function() {
    if (!window.game) {
        initGame();
    }
});