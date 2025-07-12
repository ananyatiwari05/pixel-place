// script.js
const movieSongPairs = [
  { id: 1, movie: 'Kabir Singh', song: 'Bekhayali' },
  { id: 2, movie: 'Ae Dil Hai Mushkil', song: 'Channa Mereya' },
  { id: 3, movie: 'Kal Ho Naa Ho', song: 'Kal Ho Naa Ho' },
  { id: 4, movie: 'Yeh Jawaani Hai Deewani', song: 'Ilahi' },
  { id: 5, movie: 'Tamasha', song: 'Agar Tum Saath Ho' },
  { id: 6, movie: 'Jab We Met', song: 'Tum Se Hi' },
  { id: 7, movie: 'DDLJ', song: 'Tujhe Dekha To' },
  { id: 8, movie: 'Rockstar', song: 'Kun Faya Kun' },
  { id: 9, movie: 'Kalank', song: 'Ghar More Pardesiya' },
  { id: 10, movie: 'Raazi', song: 'Ae Watan' },
  { id: 11, movie: 'Barfi', song: 'Phir Le Aaya Dil' },
  { id: 12, movie: 'K3G', song: 'Bole Chudiyan' },
  { id: 13, movie: 'Hum Dil De Chuke Sanam', song: 'Tadap Tadap' },
  { id: 14, movie: 'Zindagi Na Milegi Dobara', song: 'Senorita' },
  { id: 15, movie: 'Aashiqui 2', song: 'Tum Hi Ho' },
  { id: 16, movie: 'Tanu Weds Manu', song: 'Mat Ja Re' },
  { id: 17, movie: 'RHTDM', song: 'Zara Zara' },
  { id: 18, movie: 'Ludo', song: 'Aabaad Barbaad' }
];

let tiles = [], matched = [], flippedTiles = [], matchedPairs = 0, moves = 0;
let gameStarted = false, gameTime = 0, gameInterval, isPaused = false;
let hintsUsed = 0, isProcessing = false;

function initializeGame() {
  tiles = [], matched = [], flippedTiles = [];
  matchedPairs = 0; moves = 0;
  gameStarted = false; isPaused = false; hintsUsed = 0; isProcessing = false;

  const allTiles = [];
  movieSongPairs.forEach(pair => {
    allTiles.push({ type: 'movie', id: pair.id, value: pair.movie });
    allTiles.push({ type: 'song', id: pair.id, value: pair.song });
  });
  for (let i = allTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
  }

  tiles = [], matched = [];
  for (let i = 0; i < 6; i++) {
    tiles[i] = []; matched[i] = [];
    for (let j = 0; j < 6; j++) {
      tiles[i][j] = allTiles[i * 6 + j];
      matched[i][j] = 0;
    }
  }

  createBoard();
  updateDisplay();
  updateHintButton();
}

function createBoard() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile hidden';
      tile.dataset.row = i;
      tile.dataset.col = j;
      tile.onclick = () => flipTile(i, j);
      board.appendChild(tile);
    }
  }
}

function flipTile(row, col) {
  if (isPaused || isProcessing || flippedTiles.length >= 2 || matched[row][col] === 1) return;
  if (flippedTiles.some(tile => tile.row === row && tile.col === col)) return;

  if (!gameStarted) startGame();

  const tileEl = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  tileEl.classList.remove('hidden');
  tileEl.classList.add('flipped');

  flippedTiles.push({ row, col });

  if (flippedTiles.length === 2) {
    moves++;
    updateDisplay();
    isProcessing = true;
    setTimeout(() => {
      checkMatch();
      isProcessing = false;
    }, 1000);
  }
}

function checkMatch() {
  const [first, second] = flippedTiles;
  const t1 = tiles[first.row][first.col];
  const t2 = tiles[second.row][second.col];
  const e1 = document.querySelector(`[data-row="${first.row}"][data-col="${first.col}"]`);
  const e2 = document.querySelector(`[data-row="${second.row}"][data-col="${second.col}"]`);

  if (t1.id === t2.id && t1.type !== t2.type) {
    e1.classList.add('matched');
    e2.classList.add('matched');
    matched[first.row][first.col] = 1;
    matched[second.row][second.col] = 1;
    matchedPairs++;
    if (matchedPairs === 18) setTimeout(endGame, 500);
  } else {
    e1.classList.remove('flipped');
    e1.classList.add('hidden');
    e2.classList.remove('flipped');
    e2.classList.add('hidden');
  }

  flippedTiles = [];
  updateDisplay();
}

function useHint() {
  if (hintsUsed >= 2 || isPaused || isProcessing) return;

  const options = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if (!matched[i][j]) options.push({ row: i, col: j });
    }
  }
  if (options.length === 0) return;

  const rand = options[Math.floor(Math.random() * options.length)];
  const tileEl = document.querySelector(`[data-row="${rand.row}"][data-col="${rand.col}"]`);
  tileEl.classList.remove('hidden');
  tileEl.classList.add('flipped');

  isProcessing = true;
  hintsUsed++;
  updateDisplay();
  updateHintButton();

  setTimeout(() => {
    if (!matched[rand.row][rand.col]) {
      tileEl.classList.remove('flipped');
      tileEl.classList.add('hidden');
    }
    isProcessing = false;
  }, 5000);
}

function updateHintButton() {
  const btn = document.getElementById('hintBtn');
  btn.disabled = hintsUsed >= 2;
  btn.textContent = hintsUsed >= 2 ? 'NO HINTS' : 'HINT';
}

function startGame() {
  gameStarted = true;
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (!isPaused) {
      gameTime++;
      updateDisplay();
    }
  }, 1000);
}

function pauseGame() {
  isPaused = true;
}

function resumeGame() {
  isPaused = false;
}

function resetGame() {
  if (!gameStarted) return;
  clearInterval(gameInterval);
  gameTime = 0;
  initializeGame();
  startGame();
}

function newGame() {
  clearInterval(gameInterval);
  document.getElementById('gameOver').style.display = 'none';
  gameTime = 0;
  initializeGame();
  startGame();
}

function endGame() {
  clearInterval(gameInterval);
  document.getElementById('finalTime').textContent = formatTime(gameTime);
  document.getElementById('finalMoves').textContent = moves;
  document.getElementById('finalHints').textContent = hintsUsed;
  document.getElementById('gameOver').style.display = 'block';
}

function updateDisplay() {
  document.getElementById('timer').textContent = formatTime(gameTime);
  document.getElementById('moves').textContent = moves;
  document.getElementById('matches').textContent = matchedPairs;
  document.getElementById('remaining').textContent = 18 - matchedPairs;
  document.getElementById('hintsLeft').textContent = 2 - hintsUsed;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

window.onload = () => initializeGame();
