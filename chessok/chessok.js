// game.js - логика игры Стунвиндисеп
class StunvindisepGame {
    constructor() {
        this.boardSize = 5;
        this.board = [];
        this.deerPosition = { row: 0, col: 2 };
        this.hunterPositions = [
            { row: 4, col: 0 },
            { row: 4, col: 1 },
            { row: 4, col: 3 },
            { row: 4, col: 4 }
        ];
        this.currentPlayer = 'deer'; // deer или hunters
        this.gameActive = true;
        this.turnCount = 1;
        this.deerWins = 0;
        this.hunterWins = 0;

        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.updateStats();
        this.setupEventListeners();
    }

    createBoard() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));

        // Расставляем оленя
        this.board[this.deerPosition.row][this.deerPosition.col] = 'deer';

        // Расставляем охотников
        this.hunterPositions.forEach(pos => {
            this.board[pos.row][pos.col] = 'hunter';
        });
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        // Создаем сетку 5x5
        gameBoard.style.display = 'grid';
        gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        gameBoard.style.gap = '4px';
        gameBoard.style.width = '400px';
        gameBoard.style.height = '400px';
        gameBoard.style.margin = '0 auto';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell rounded-lg flex items-center justify-center';
                cell.style.aspectRatio = '1';

                // Добавляем фигуры
                if (this.board[row][col] === 'deer') {
                    const deer = document.createElement('div');
                    deer.className = 'deer w-4/5 h-4/5 rounded-full pulse';
                    cell.appendChild(deer);
                } else if (this.board[row][col] === 'hunter') {
                    const hunter = document.createElement('div');
                    hunter.className = 'hunter w-4/5 h-4/5 rounded-full';
                    cell.appendChild(hunter);
                }

                // Обработка кликов
                if (this.gameActive) {
                    cell.addEventListener('click', () => this.handleCellClick(row, col));
                }

                // Подсветка возможных ходов
                if (this.isValidMove(row, col)) {
                    cell.classList.add('valid-move');
                }

                gameBoard.appendChild(cell);
            }
        }
    }

    isValidMove(targetRow, targetCol) {
        if (!this.gameActive) return false;
        if (this.board[targetRow][targetCol] !== null) return false;

        if (this.currentPlayer === 'deer') {
            // Олень ходит по диагонали
            const rowDiff = Math.abs(targetRow - this.deerPosition.row);
            const colDiff = Math.abs(targetCol - this.deerPosition.col);
            return rowDiff === 1 && colDiff === 1;
        } else {
            // Охотники ходят по вертикали/горизонтали
            return this.hunterPositions.some(hunter => {
                const rowDiff = Math.abs(targetRow - hunter.row);
                const colDiff = Math.abs(targetCol - hunter.col);
                return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
            });
        }
    }

    handleCellClick(row, col) {
        if (!this.gameActive || !this.isValidMove(row, col)) return;

        if (this.currentPlayer === 'deer') {
            this.moveDeer(row, col);
        } else {
            this.moveHunter(row, col);
        }

        this.checkGameEnd();
        this.switchPlayer();
        this.renderBoard();
        this.updateGameStatus();
    }

    moveDeer(targetRow, targetCol) {
        this.board[this.deerPosition.row][this.deerPosition.col] = null;
        this.deerPosition = { row: targetRow, col: targetCol };
        this.board[targetRow][targetCol] = 'deer';
    }

    moveHunter(targetRow, targetCol) {
        // Находим ближайшего охотника, который может сделать ход
        const movingHunter = this.hunterPositions.find(hunter => {
            const rowDiff = Math.abs(targetRow - hunter.row);
            const colDiff = Math.abs(targetCol - hunter.col);
            return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        });

        if (movingHunter) {
            this.board[movingHunter.row][movingHunter.col] = null;
            movingHunter.row = targetRow;
            movingHunter.col = targetCol;
            this.board[targetRow][targetCol] = 'hunter';
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'deer' ? 'hunters' : 'deer';
        if (this.currentPlayer === 'deer') {
            this.turnCount++;
            document.getElementById('turnCounter').textContent = this.turnCount;
        }
    }

    checkGameEnd() {
        // Проверка победы оленя (достиг противоположного края)
        if (this.deerPosition.row === this.boardSize - 1) {
            this.endGame('deer');
            return;
        }

        // Проверка победы охотников (олень окружен)
        const deerMoves = this.getValidDeerMoves();
        if (deerMoves.length === 0) {
            this.endGame('hunters');
        }
    }

    getValidDeerMoves() {
        const moves = [];
        const directions = [
            { row: -1, col: -1 }, { row: -1, col: 1 },
            { row: 1, col: -1 }, { row: 1, col: 1 }
        ];

        directions.forEach(dir => {
            const newRow = this.deerPosition.row + dir.row;
            const newCol = this.deerPosition.col + dir.col;

            if (newRow >= 0 && newRow < this.boardSize &&
                newCol >= 0 && newCol < this.boardSize &&
                this.board[newRow][newCol] === null) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    endGame(winner) {
        this.gameActive = false;

        if (winner === 'deer') {
            this.deerWins++;
            document.getElementById('gameStatus').innerHTML =
                '<p class="text-green-400 font-bold text-lg pulse">ОЛЕНЬ ПОБЕДИЛ! 🎉</p>';
        } else {
            this.hunterWins++;
            document.getElementById('gameStatus').innerHTML =
                '<p class="text-electric-blue font-bold text-lg pulse">ОХОТНИКИ ПОБЕДИЛИ! 🏹</p>';
        }

        this.updateStats();
    }

    updateGameStatus() {
        const status = document.getElementById('gameStatus');
        if (this.gameActive) {
            status.innerHTML = `<p class="text-electric-blue font-bold text-lg">${
                this.currentPlayer === 'deer' ? 'ХОД ОЛЕНЯ' : 'ХОД ОХОТНИКОВ'
            }</p>`;
        }
    }

    updateStats() {
        document.getElementById('deerWins').textContent = this.deerWins;
        document.getElementById('hunterWins').textContent = this.hunterWins;
    }

    setupEventListeners() {
        // Добавляем обработчики для модального окна
        window.showRules = () => {
            document.getElementById('rulesModal').classList.remove('hidden');
            document.getElementById('rulesModal').classList.add('flex');
        };

        window.hideRules = () => {
            document.getElementById('rulesModal').classList.add('hidden');
            document.getElementById('rulesModal').classList.remove('flex');
        };
    }

    reset() {
        this.deerPosition = { row: 0, col: 2 };
        this.hunterPositions = [
            { row: 4, col: 0 },
            { row: 4, col: 1 },
            { row: 4, col: 3 },
            { row: 4, col: 4 }
        ];
        this.currentPlayer = 'deer';
        this.gameActive = true;
        this.turnCount = 1;

        this.createBoard();
        this.renderBoard();
        this.updateGameStatus();
        document.getElementById('turnCounter').textContent = '1';
    }
}

// Глобальные функции для кнопок
let game;

function initGame() {
    game = new StunvindisepGame();
}

function resetGame() {
    if (game) {
        game.reset();
    } else {
        initGame();
    }
}

function showRules() {
    const modal = document.getElementById('rulesModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideRules() {
    const modal = document.getElementById('rulesModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);