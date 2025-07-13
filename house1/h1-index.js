// CSV data converted to JavaScript array
const movieSongData = [
  {
    song: "Pehla Nasha",
    movie: "Jo Jeeta Wohi Sikandar",
    file: "pehla-nasha.mp3",
  },
  {
    song: "Ek Ladki Ko Dekha To",
    movie: "A Love Story",
    file: "ek-ladki-ko-dekha.mp3",
  },
  {
    song: "You Are My Soniya",
    movie: "Kabhie Khushi Kabhie Gham",
    file: "you-are-my-soniya.mp3",
  },
  {
    song: "Dheere Dheere Se Meri Zindagi Me Aana",
    movie: "Aashiqui",
    file: "dheere-dheere-se.mp3",
  },
  {
    song: "Mai Koi Aisa Geet Gaoon",
    movie: "Yes Boss",
    file: "mai-koi-aisa-geet.mp3",
  },
  { song: "Chaiya Chaiya", movie: "Dil Se", file: "chaiya-chaiya.mp3" },
  { song: "Aankhein Khuli", movie: "Mohabbatein", file: "aankhein-khuli.mp3" },
  { song: "Aati Kya Khandala", movie: "Ghulam", file: "aati-kya-khandala.mp3" },
  { song: "Radha Kaise Na Jale", movie: "Lagaan", file: "radha-kaise-na.mp3" },
  { song: "Guzarish", movie: "Ghajini", file: "Guzarish.mp3" },
  {
    song: "Ladki Kyon Na Jane Kyon",
    movie: "Hum Tum",
    file: "Ladki Kyon Na Jane Kyon.mp3",
  },
  {
    song: "Ek Pal Ka Jeena",
    movie: "Kaho Naa Pyaar Hai",
    file: "Ek Pal Ka Jeena.mp3",
  },
  {
    song: "Kajra Re",
    movie: "Bunty Aur Babli",
    file: "Kajra Re Bunty Aur Babli.mp3",
  },
  {
    song: "Dance Pe Chance",
    movie: "Rab Ne Bana Di Jodi",
    file: "Dance Pe Chance.mp3",
  },
  {
    song: "Tumse Milke Dil Ka",
    movie: "Main Hoon Na",
    file: "Tumse Milke Dil Ka.mp3",
  },
  { song: "Dil Dooba", movie: "Khakee", file: "Dil Dooba Khakee (15sec).mp3" },
  {
    song: "Chura Ke Dil Mera",
    movie: "Main Khiladi Tu Anari",
    file: "Chura Ke Dil Mera (20sec).mp3",
  },
  {
    song: "Dil Se Ye Kaha Hai",
    movie: "Dhadkan",
    file: "Dil Ne Yeh Kaha Hain Dil Se Dhadkan(10sec).mp3",
  },
];

// Game state variables
let tiles = [];
let matched = [];
let flippedTiles = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let gameTime = 0;
let gameInterval;
let isPaused = false;
let hintsUsed = 0;
let isProcessing = false;
let currentAudio = null;

function initializeGame() {
  // Reset game state
  tiles = [];
  matched = [];
  flippedTiles = [];
  matchedPairs = 0;
  moves = 0;
  gameStarted = false;
  gameTime = 0;
  isPaused = false;
  hintsUsed = 0;
  isProcessing = false;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Create tiles array - 18 pairs from CSV data
  const allTiles = [];
  movieSongData.forEach((data, index) => {
    allTiles.push({
      type: "movie",
      id: index + 1,
      value: data.movie,
      audioFile: data.file,
    });
    allTiles.push({
      type: "song",
      id: index + 1,
      value: data.song,
      audioFile: data.file,
    });
  });

  // Shuffle tiles using Fisher-Yates algorithm
  for (let i = allTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
  }

  // Convert to 6x6 grid
  tiles = [];
  matched = [];
  for (let i = 0; i < 6; i++) {
    tiles[i] = [];
    matched[i] = [];
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
  const board = document.getElementById("gameBoard");
  board.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const tile = document.createElement("div");
      tile.className = `tile hidden ${tiles[i][j].type}`;
      tile.dataset.row = i;
      tile.dataset.col = j;
      tile.onclick = () => flipTile(i, j);

      // Add audio visualizer for song tiles
      if (tiles[i][j].type === "song") {
        const visualizer = document.createElement("div");
        visualizer.className = "audio-visualizer";
        const bar = document.createElement("div");
        bar.className = "audio-bar";
        visualizer.appendChild(bar);
        tile.appendChild(visualizer);
      }

      board.appendChild(tile);
    }
  }
}

function flipTile(row, col) {
  if (isPaused || isProcessing || flippedTiles.length >= 2) return;
  if (matched[row][col] === 1) return;
  if (flippedTiles.some((tile) => tile.row === row && tile.col === col)) return;

  if (!gameStarted) startGame();

  const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const tileData = tiles[row][col];

  tile.classList.remove("hidden");
  tile.classList.add("flipped");

  // Only show text for movie tiles, not song tiles
  if (tileData.type === "movie") {
    tile.textContent = tileData.value;
  } else {
    // For song tiles, just show a generic music note or leave empty
    tile.textContent = "";
  }

  // Play audio for song tiles
  if (tileData.type === "song") {
    playAudio(tileData.audioFile, tile);
  }

  flippedTiles.push({ row, col });

  if (flippedTiles.length === 2) {
    moves++;
    updateDisplay();
    isProcessing = true;

    setTimeout(() => {
      checkMatch();
      isProcessing = false;
    }, 1500);
  }
}

function playAudio(audioFile, tileElement) {
  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Create new audio instance
  // IMPORTANT: Ensure your audio files are in a 'public/audio/' directory
  // e.g., public/audio/pehla-nasha.mp3
  currentAudio = new Audio(`../audio-assets/${audioFile}`);

  currentAudio.addEventListener(
    "canplaythrough",
    () => {
      currentAudio.play().catch((e) => {
        console.warn(
          "Audio play failed (user interaction might be required):",
          e
        );
      });
    },
    { once: true }
  );

  currentAudio.addEventListener("error", (e) => {
    console.error(`Error loading audio file: audio/${audioFile}`, e);
  });

  // Visual feedback for audio playing
  const visualizer = tileElement.querySelector(".audio-bar");
  if (visualizer) {
    currentAudio.addEventListener("timeupdate", () => {
      if (currentAudio.duration > 0) {
        visualizer.style.width = `${
          (currentAudio.currentTime / currentAudio.duration) * 100
        }%`;
      }
    });
    currentAudio.addEventListener("ended", () => {
      visualizer.style.width = "0%";
    });
  }
}

function checkMatch() {
  const [first, second] = flippedTiles;
  const firstTile = tiles[first.row][first.col];
  const secondTile = tiles[second.row][second.col];

  const firstElement = document.querySelector(
    `[data-row="${first.row}"][data-col="${first.col}"]`
  );
  const secondElement = document.querySelector(
    `[data-row="${second.row}"][data-col="${second.col}"]`
  );

  // Check if it's a valid match (same id, different types)
  if (firstTile.id === secondTile.id && firstTile.type !== secondTile.type) {
    // Match found!
    firstElement.classList.add("matched");
    secondElement.classList.add("matched");
    matched[first.row][first.col] = 1;
    matched[second.row][second.col] = 1;
    matchedPairs++;

    if (matchedPairs === 18) {
      setTimeout(endGame, 1000);
    }
  } else {
    // No match - flip back
    firstElement.classList.remove("flipped");
    firstElement.classList.add("hidden");
    firstElement.textContent = "";

    secondElement.classList.remove("flipped");
    secondElement.classList.add("hidden");
    secondElement.textContent = "";

    // Stop audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  }

  flippedTiles = [];
  updateDisplay();
}

function useHint() {
  if (hintsUsed >= 2 || isPaused) return;

  hintsUsed++;
  updateDisplay();
  updateHintButton();

  // Find all unmatched tiles
  const unmatchedTiles = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if (matched[i][j] === 0) {
        unmatchedTiles.push({ row: i, col: j });
      }
    }
  }

  // Randomly select one tile to reveal
  if (unmatchedTiles.length > 0) {
    const randomTile =
      unmatchedTiles[Math.floor(Math.random() * unmatchedTiles.length)];
    const tileElement = document.querySelector(
      `[data-row="${randomTile.row}"][data-col="${randomTile.col}"]`
    );
    const tileData = tiles[randomTile.row][randomTile.col];

    tileElement.classList.remove("hidden");
    tileElement.classList.add("flipped");

    // Only show text for movie tiles, not song tiles
    if (tileData.type === "movie") {
      tileElement.textContent = tileData.value;
    } else {
      tileElement.textContent = ""; // No text for song tiles
    }

    tileElement.style.border = "2px solid #ffff00"; // Highlight hint tile

    // Hide after 3 seconds
    setTimeout(() => {
      if (matched[randomTile.row][randomTile.col] === 0) {
        tileElement.classList.remove("flipped");
        tileElement.classList.add("hidden");
        tileElement.textContent = "";
        tileElement.style.border = "2px solid #ff69b4"; // Reset border
      }
    }, 3000);
  }
}

function updateHintButton() {
  const hintBtn = document.getElementById("hintBtn");
  if (hintsUsed >= 2) {
    hintBtn.disabled = true;
    hintBtn.textContent = "No Hints";
  } else {
    hintBtn.disabled = false;
    hintBtn.textContent = "Hint";
  }
}

function startGame() {
  gameStarted = true;
  gameInterval = setInterval(() => {
    if (!isPaused) {
      gameTime++;
      updateDisplay();
    }
  }, 1000);
}

function pauseGame() {
  isPaused = !isPaused;
  const pauseBtn = document.getElementById("pauseBtn");
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";

  if (currentAudio) {
    if (isPaused) {
      currentAudio.pause();
    } else {
      currentAudio.play().catch((e) => console.warn("Resume audio failed:", e));
    }
  }
}

function resetGame() {
  clearInterval(gameInterval);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  initializeGame();
}

function newGame() {
  clearInterval(gameInterval);
  document.getElementById("gameOver").style.display = "none";
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  initializeGame();
}

function endGame() {
  clearInterval(gameInterval);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  document.getElementById("finalTime").textContent = formatTime(gameTime);
  document.getElementById("finalMoves").textContent = moves;
  document.getElementById("finalHints").textContent = hintsUsed;
  document.getElementById("gameOver").style.display = "block";

  updateDisplay();
}

function updateDisplay() {
  document.getElementById("timer").textContent = formatTime(gameTime);
  document.getElementById("moves").textContent = moves;
  document.getElementById("matches").textContent = matchedPairs;
  document.getElementById("remaining").textContent = 18 - matchedPairs;
  document.getElementById("hintsLeft").textContent = 2 - hintsUsed;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Initialize game on page load
window.addEventListener("load", initializeGame);

// Handle page visibility for audio
document.addEventListener("visibilitychange", () => {
  if (document.hidden && currentAudio) {
    currentAudio.pause();
  }
});
