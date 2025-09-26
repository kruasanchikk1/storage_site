// asalthan.js - логика игры Асалтыхан
class AsalthanGame {
    constructor() {
        this.boardSize = 7;
        this.board = [];
        this.playerPosition = { row: 3, col: 3 };
        this.enemyPositions = [];
        this.honorPoints = [];
        this.obstacles = [];
        this.gameActive = false;
        this.score = 0;
        this.honor = 100;
        this.round = 1;
        this.timeSurvived = 0;
        this.gameTimer = null;
        this.enemyMoveTimer = null;
        this.enemySpeed = 1500;
        this.shieldActive = false;
        this.slowActive = false;
        this.abilities = {
            shield: 3,
            slow: 2
        };

        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.setupEventListeners();
        this.updateUI();
    }

    createBoard() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));

        // Расставляем игрока
        this.board[this.playerPosition.row][this.playerPosition.col] = 'player';

        // Создаем начальных врагов
        this.createEnemies(3);

        // Создаем точки чести
        this.createHonorPoints(5);

        // Создаем препятствия
        this.createObstacles(8);
    }

    createEnemies(count) {
        for (let i = 0; i < count; i++) {
            this.addEnemy();
        }
    }

    addEnemy() {
        let row, col;
        let attempts = 0;

        do {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * this.boardSize);
            attempts++;
        } while (this.board[row][col] !== null && attempts < 50);

        if (attempts < 50) {
            this.enemyPositions.push({ row, col });
            this.board[row][col] = 'enemy';
        }
    }

    createHonorPoints(count) {
        for (let i = 0; i < count; i++) {
            this.addHonorPoint();
        }
    }

    addHonorPoint() {
        let row, col;
        let attempts = 0;

        do {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * this.boardSize);
            attempts++;
        } while (this.board[row][col] !== null && attempts < 50);

        if (attempts < 50) {
            this.honorPoints.push({ row, col });
            this.board[row][col] = 'honor';
        }
    }

    createObstacles(count) {
        for (let i = 0; i < count; i++) {
            this.addObstacle();
        }
    }

    addObstacle() {
        let row, col;
        let attempts = 0;

        do {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * this.boardSize);
            attempts++;
        } while (this.board[row][col] !== null && attempts < 50);

        if (attempts < 50) {
            this.obstacles.push({ row, col });
            this.board[row][col] = 'obstacle';
        }
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        gameBoard.style.display = 'grid';
        gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        gameBoard.style.gap = '2px';
        gameBoard.style.width = '500px';
        gameBoard.style.height = '500px';
        gameBoard.style.margin = '0 auto';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell rounded flex items-center justify-center relative';
                cell.style.aspectRatio = '1';

                const content = this.board[row][col];
                if (content) {
                    const element = document.createElement('div');
                    element.className = this.getElementClass(content);
                    cell.appendChild(element);
                }

                if (this.gameActive && this.isValidMove(row, col)) {
                    cell.classList.add('valid-move');
                    cell.addEventListener('click', () => this.movePlayer(row, col));
                }

                gameBoard.appendChild(cell);
            }
        }
    }

    getElementClass(type) {
        const classes = {
            'player': `player w-4/5 h-4/5 rounded-full ${this.shieldActive ? 'honor-glow' : ''}`,
            'enemy': `enemy w-4/5 h-4/5 rounded-full ${this.slowActive ? 'opacity-50' : ''}`,
            'honor': 'honor-point w-3/5 h-3/5 rounded-full pulse',
            'obstacle': 'obstacle w-4/5 h-4/5 rounded-lg'
        };
        return classes[type] || '';
    }

    isValidMove(targetRow, targetCol) {
        if (!this.gameActive) return false;
        if (this.board[targetRow][targetCol] !== null) return false;

        const rowDiff = Math.abs(targetRow - this.playerPosition.row);
        const colDiff = Math.abs(targetCol - this.playerPosition.col);

        return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
    }

    movePlayer(targetRow, targetCol) {
        if (!this.gameActive || !this.isValidMove(targetRow, targetCol)) return;

        this.board[this.playerPosition.row][this.playerPosition.col] = null;

        if (this.board[targetRow][targetCol] === 'honor') {
            this.collectHonorPoint(targetRow, targetCol);
        }

        this.playerPosition = { row: targetRow, col: targetCol };
        this.board[targetRow][targetCol] = 'player';

        this.renderBoard();
        this.moveEnemies();
        this.checkCollisions();
    }

    collectHonorPoint(row, col) {
        this.score += 10;
        this.honor = Math.min(100, this.honor + 5);

        const pointIndex = this.honorPoints.findIndex(p => p.row === row && p.col === col);
        if (pointIndex > -1) {
            this.honorPoints.splice(pointIndex, 1);
        }

        this.addHonorPoint();
        this.updateUI();
    }

    moveEnemies() {
        this.enemyPositions.forEach((enemy) => {
            this.board[enemy.row][enemy.col] = null;

            const directions = this.getPathToPlayer(enemy);
            if (directions.length > 0) {
                const move = directions[0];
                enemy.row = move.row;
                enemy.col = move.col;
            }

            this.board[enemy.row][enemy.col] = 'enemy';
        });

        this.renderBoard();
    }

    getPathToPlayer(enemy) {
        const queue = [{ row: enemy.row, col: enemy.col, path: [] }];
        const visited = new Set([`${enemy.row},${enemy.col}`]);

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.row === this.playerPosition.row && current.col === this.playerPosition.col) {
                return current.path;
            }

            const directions = [
                { row: -1, col: 0 }, { row: 1, col: 0 },
                { row: 0, col: -1 }, { row: 0, col: 1 },
                { row: -1, col: -1 }, { row: -1, col: 1 },
                { row: 1, col: -1 }, { row: 1, col: 1 }
            ];

            for (const dir of directions) {
                const newRow = current.row + dir.row;
                const newCol = current.col + dir.col;

                if (this.isValidEnemyMove(newRow, newCol) && !visited.has(`${newRow},${newCol}`)) {
                    visited.add(`${newRow},${newCol}`);
                    queue.push({
                        row: newRow,
                        col: newCol,
                        path: [...current.path, { row: newRow, col: newCol }]
                    });
                }
            }
        }

        return [];
    }

    isValidEnemyMove(row, col) {
        return row >= 0 && row < this.boardSize &&
               col >= 0 && col < this.boardSize &&
               this.board[row][col] !== 'obstacle' &&
               this.board[row][col] !== 'enemy';
    }

    checkCollisions() {
        const collision = this.enemyPositions.some(enemy =>
            enemy.row === this.playerPosition.row && enemy.col === this.playerPosition.col
        );

        if (collision) {
            if (this.shieldActive) {
                this.shieldActive = false;
                this.honor -= 10;
            } else {
                this.honor -= 25;
            }

            if (this.honor <= 0) {
                this.endGame();
            }

            this.updateUI();
            this.updateGameStatus();
        }
    }

    startGame() {
        if (this.gameActive) return;

        this.gameActive = true;
        this.timeSurvived = 0;

        this.gameTimer = setInterval(() => {
            this.timeSurvived++;
            this.updateUI();

            if (this.timeSurvived % 30 === 0) {
                this.increaseDifficulty();
            }
        }, 1000);

        this.enemyMoveTimer = setInterval(() =>