// Game configuration and state variables
const WIN_SCORE = 20;
const winningMessages = [
  'Amazing work! You hit your water goal!',
  'You won! Every can counts toward clean water!',
  'Great job! You collected enough cans to win!',
  'Nice! You collected enough water!',
  'Excellent work! All the water you collect makes a difference!'
];
const losingMessages = [
  'Nice effort! Try again and go for 20+ cans!',
  'So close! Give it another shot!',
  'Keep practicing, you can beat 20 next round!'
];

// Difficulty settings: spawn interval in milliseconds and game duration in seconds
const DIFFICULTY_SETTINGS = {
  easy: { spawn: 1200, duration: 45 },
  normal: { spawn: 1000, duration: 30 },
  hard: { spawn: 800, duration: 20 }
};

let currentCans = 0;
let timeLeft = 30;
let gameActive = false;
let spawnInterval;
let timerInterval;
let currentDifficulty = 'normal';

const scoreEl = document.getElementById('current-cans');
const timerEl = document.getElementById('timer');
const achievementsEl = document.getElementById('achievements');
const startButton = document.getElementById('start-game');
const restartButton = document.getElementById('restart-game');
const difficultySelect = document.getElementById('difficulty-select');

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

function updateScoreDisplay() {
  scoreEl.textContent = currentCans;
}

function updateTimerDisplay() {
  timerEl.textContent = timeLeft;
}

function clearBoard() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));
}

// Ensure the grid is created when the page loads
createGrid();

function startRound() {
  currentCans = 0;
  timeLeft = DIFFICULTY_SETTINGS[currentDifficulty].duration;
  achievementsEl.textContent = '';

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  createGrid();
  updateScoreDisplay();
  updateTimerDisplay();
  spawnWaterCan();

  const spawnRate = DIFFICULTY_SETTINGS[currentDifficulty].spawn;
  spawnInterval = setInterval(spawnWaterCan, spawnRate);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;

  const can = randomCell.querySelector('.water-can');
  can.addEventListener('click', () => {
    if (!gameActive) return;

    currentCans += 1;
    updateScoreDisplay();
    can.classList.add('hit-flash');
    can.style.pointerEvents = 'none';

    setTimeout(() => {
      if (gameActive) {
        randomCell.innerHTML = '';
      }
    }, 240);
  }, { once: true });

  const emptyCells = Array.from(cells).filter(cell => cell.innerHTML === '');
  if (emptyCells.length === 0) return;

  const obstacleCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  obstacleCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="obstacle-icon"></div>
    </div>
  `;

  const obstacle = obstacleCell.querySelector('.obstacle-icon');
  obstacle.addEventListener('click', () => {
    if (!gameActive) return;
    if (currentCans === 0) return;

    currentCans = Math.max(0, currentCans - 1);
    updateScoreDisplay();
    obstacle.classList.add('hit-flash');
    obstacle.style.pointerEvents = 'none';

    setTimeout(() => {
      if (gameActive) {
        obstacleCell.innerHTML = '';
      }
    }, 240);
  });
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return;

  gameActive = true;
  startButton.disabled = true;
  restartButton.classList.remove('hidden');

  startRound();
}

function restartGame() {
  if (!gameActive) return;
  startRound();
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearBoard();

  const didWin = currentCans >= WIN_SCORE;
  const messagePool = didWin ? winningMessages : losingMessages;
  const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
  achievementsEl.textContent = `Game over! ${randomMessage}`;

  startButton.disabled = false;
  restartButton.classList.add('hidden');
}

// Set up click handlers for the start and restart buttons
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Set up change handler for the difficulty selector
difficultySelect.addEventListener('change', (e) => {
  currentDifficulty = e.target.value;
  
  // If game is active, update the spawn interval immediately
  if (gameActive) {
    clearInterval(spawnInterval);
    const spawnRate = DIFFICULTY_SETTINGS[currentDifficulty];
    spawnInterval = setInterval(spawnWaterCan, spawnRate);
  }
});
