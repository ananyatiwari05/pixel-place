const containers = [
  { id: 1, image: "./assets/cone.png", type: "cone" },
  { id: 2, image: "./assets/cup.png", type: "cup" },
  { id: 3, image: "./assets/glass.png", type: "glass" },
];

const scoop1 = [
  { id: 1, image: "./assets/vanilla.png", type: "vanilla" },
  { id: 2, image: "./assets/chocolate.png", type: "chocolate" },
  { id: 3, image: "./assets/orange.png", type: "orange" },
];

const scoop2 = [
  { id: 1, image: "./assets/black-currant.png", type: "black currant" },
  { id: 2, image: "./assets/mango.png", type: "mango" },
  { id: 3, image: "./assets/mint.png", type: "mint" },
];

const toppings = [
  { id: 1, image: "./assets/sprinkles.png", type: "sprinkles" },
  { id: 2, image: "./assets/chocochips.png", type: "choco chips" },
  { id: 3, image: "./assets/cherry.png", type: "cherry" },
];

// Sample Orders
const orders = [
  { container: 1, scoop1: 1, scoop2: 1, topping: 1 },
  { container: 2, scoop1: 2, scoop2: 2, topping: 2 },
  { container: 3, scoop1: 3, scoop2: 3, topping: 3 },
  { container: 1, scoop1: 1, scoop2: 2, topping: 1 },
  { container: 2, scoop1: 3, scoop2: 1, topping: 2 },
  { container: 3, scoop1: 2, scoop2: 3, topping: 3 },
  { container: 1, scoop1: 2, scoop2: 1, topping: 3 },
  { container: 2, scoop1: 1, scoop2: 3, topping: 1 },
];

// Game State
let currentOrder = {};
let score = 0;
let ordersCompleted = 0;
let level = 1;
let gameTime = 0;
let gameInterval;
let orderIndex = 0;
let currentStation = 2;
let conveyorStations = [{}, {}, {}, {}, {}];

function initGame() {
  score = 0;
  ordersCompleted = 0;
  level = 1;
  gameTime = 0;
  orderIndex = 0;
  currentStation = 2;
  conveyorStations = [{}, {}, {}, {}, {}];

  updateDisplay();
  generateNewOrder();
  startTimer();
  updateConveyorDisplay();

  document.querySelectorAll(".ingredient-btn").forEach((btn) => {
    btn.addEventListener("click", selectIngredient);
  });
}

function startTimer() {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    gameTime++;
    updateDisplay();
  }, 1000);
}

function generateNewOrder() {
  if (orderIndex >= orders.length) {
    orderIndex = 0;
    level++;
    shuffleArray(orders);
  }

  currentOrder = { ...orders[orderIndex] };
  orderIndex++;
  displayOrder();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayOrder() {
  const orderDisplay = document.getElementById("target-order");
  orderDisplay.innerHTML = "";

  // Create stacked order display (TOP TO BOTTOM: topping, scoop2, scoop1, container)
  const layers = [];

  // Topping (top)
  const toppingDiv = document.createElement("div");
  toppingDiv.className =
    "order-item topping-layer"; /* Added topping-layer class */
  const toppingItem = toppings.find((t) => t.id === currentOrder.topping);
  toppingDiv.style.backgroundImage = `url('${toppingItem.image}')`;
  if (toppingItem.filter) toppingDiv.style.filter = toppingItem.filter;
  layers.push(toppingDiv);

  // Scoop2
  const scoop2Div = document.createElement("div"); /* Corrected variable name */
  scoop2Div.className = "order-item";
  const scoop2Item = scoop2.find((s) => s.id === currentOrder.scoop2);
  scoop2Div.style.backgroundImage = `url('${scoop2Item.image}')`;
  if (scoop2Item.filter) scoop2Div.style.filter = scoop2Item.filter;
  layers.push(scoop2Div);

  // Scoop1
  const scoop1Div = document.createElement("div"); /* Corrected variable name */
  scoop1Div.className = "order-item";
  const scoop1Item = scoop1.find((s) => s.id === currentOrder.scoop1);
  scoop1Div.style.backgroundImage = `url('${scoop1Item.image}')`;
  if (scoop1Item.filter) scoop1Div.style.filter = scoop1Item.filter;
  layers.push(scoop1Div);

  // Container (bottom)
  const containerDiv = document.createElement("div");
  containerDiv.className = "order-item";
  containerDiv.style.backgroundImage = `url('${
    containers.find((c) => c.id === currentOrder.container).image
  }')`;
  layers.push(containerDiv);

  // Add layers to display
  layers.forEach((layer) => orderDisplay.appendChild(layer));
}

function selectIngredient(event) {
  const btn = event.currentTarget;
  const type = btn.dataset.type;
  const id = parseInt(btn.dataset.id);

  // Clear previous selection of same type
  document.querySelectorAll(`[data-type="${type}"]`).forEach((b) => {
    b.classList.remove("selected");
  });

  // Select current button
  btn.classList.add("selected");

  // Add ingredient to current station
  if (!conveyorStations[currentStation]) {
    conveyorStations[currentStation] = {};
  }
  conveyorStations[currentStation][type] = id;

  updateConveyorDisplay();
}

// Removed moveConveyor function as per user request
// function moveConveyor(direction) {
//     if (direction === 'left' && currentStation > 0) {
//         currentStation--;
//     } else if (direction === 'right' && currentStation < 4) {
//         currentStation++;
//     }

//     updateConveyorDisplay();
//     updateMoveButtons();
// }

// Removed updateMoveButtons function as per user request
// function updateMoveButtons() {
//     document.getElementById('move-left').disabled = currentStation === 0;
//     document.getElementById('move-right').disabled = currentStation === 4;
// }

function updateConveyorDisplay() {
  // Update active station highlight
  document.querySelectorAll(".work-station").forEach((station, index) => {
    if (index === currentStation) {
      station.classList.add("active");
    } else {
      station.classList.remove("active");
    }
  });

  // Update all station displays with proper stacking (topping on top, container at bottom)
  conveyorStations.forEach((station, index) => {
    const stackElement = document.getElementById(`stack-${index}`);
    stackElement.innerHTML = "";

    if (station && Object.keys(station).length > 0) {
      // Create layers in reverse stacking order for proper visual stacking
      // Display order: topping, scoop2, scoop1, container (top to bottom)
      const layerOrder = ["topping", "scoop2", "scoop1", "container"];

      layerOrder.forEach((layerType) => {
        if (station[layerType]) {
          const layerDiv = document.createElement("div");
          layerDiv.className = "dessert-layer";
          if (layerType === "topping") {
            /* Added topping-layer class */
            layerDiv.classList.add("topping-layer");
          }

          let itemData;
          switch (layerType) {
            case "container":
              itemData = containers.find((c) => c.id === station[layerType]);
              break;
            case "scoop1":
              itemData = scoop1.find((s) => s.id === station[layerType]);
              break;
            case "scoop2":
              itemData = scoop2.find((s) => s.id === station[layerType]);
              break;
            case "topping":
              itemData = toppings.find((t) => t.id === station[layerType]);
              break;
          }

          if (itemData) {
            layerDiv.style.backgroundImage = `url('${itemData.image}')`;
            if (itemData.filter) layerDiv.style.filter = itemData.filter;
            stackElement.appendChild(layerDiv);
          }
        }
      });
    }
  });

  // Removed call to updateMoveButtons as per user request
  // updateMoveButtons();
}

function serveDessert() {
  const currentDessert = conveyorStations[currentStation];

  if (
    !currentDessert ||
    !currentDessert.container ||
    !currentDessert.scoop1 ||
    !currentDessert.scoop2 ||
    !currentDessert.topping
  ) {
    showFeedback("Complete the dessert first!", "error");
    return;
  }

  const isMatch =
    currentDessert.container === currentOrder.container &&
    currentDessert.scoop1 === currentOrder.scoop1 &&
    currentDessert.scoop2 === currentOrder.scoop2 &&
    currentDessert.topping === currentOrder.topping;

  if (isMatch) {
    score += 10 + level * 5;
    ordersCompleted++;
    showFeedback("Perfect! Order delivered!", "success");

    if (ordersCompleted % 5 === 0) {
      level++;
      showFeedback(`Level Up! Now Level ${level}`, "success");
    }
  } else {
    score = Math.max(0, score - 5);
    showFeedback("Wrong order! Try again.", "error");
  }

  clearDessert();
  generateNewOrder();
  updateDisplay();

  if (ordersCompleted >= 20) {
    endGame();
  }
}

function clearDessert() {
  conveyorStations[currentStation] = {};
  document.querySelectorAll(".ingredient-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });
  updateConveyorDisplay();
}

function skipOrder() {
  score = Math.max(0, score - 3);
  generateNewOrder();
  clearDessert();
  updateDisplay();
  showFeedback("Order skipped!", "error");
}

function showFeedback(message, type) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
  feedback.style.display = "block";

  setTimeout(() => {
    feedback.style.display = "none";
  }, 2000);
}

function updateDisplay() {
  document.getElementById("score").textContent = score;
  document.getElementById("orders-completed").textContent = ordersCompleted;
  document.getElementById("level").textContent = level;
  document.getElementById("timer").textContent = formatTime(gameTime);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function endGame() {
  clearInterval(gameInterval);
  document.getElementById("final-score").textContent = score;
  document.getElementById("final-orders").textContent = ordersCompleted;
  document.getElementById("final-time").textContent = formatTime(gameTime);
  document.getElementById("game-over").style.display = "block";
}

function newGame() {
  document.getElementById("game-over").style.display = "none";
  clearInterval(gameInterval);
  initGame();
}

// Initialize game when page loads
window.addEventListener("load", initGame);

// Handle page visibility
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(gameInterval);
  } else {
    startTimer();
  }
});
