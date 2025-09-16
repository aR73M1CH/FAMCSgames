const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎", "🎰"];
const payoutMultipliers = {
  "🍒": 2,
  "🍋": 3,
  "🍊": 4,
  "🍇": 5,
  "🔔": 10,
  "⭐": 20,
  "💎": 50,
};
const betOptions = [10, 20, 50, 100];
const gridSize = 3;
let balance = 1000;
let currentBet = 10;
let grid = [];
let freeSpins = 0;
let isFreeSpinMode = false;

const slotGrid = document.getElementById("slot-grid");
const balanceDisplay = document.getElementById("balance");
const messageDisplay = document.getElementById("message");
const betDisplay = document.getElementById("bet-display");
const spinButton = document.getElementById("spin-button");
const betUpButton = document.getElementById("bet-up");
const betDownButton = document.getElementById("bet-down");
const rulesButton = document.getElementById("rules-button");
const rulesModal = document.getElementById("rules-modal");
const closeRules = document.getElementById("close-rules");
const bigWinModal = document.getElementById("big-win-modal");
const bigWinAmount = document.getElementById("big-win-amount");
const closeBigWin = document.getElementById("close-big-win");
const freeSpinsCounter = document.getElementById("free-spins-counter");
const gameEndModal = document.getElementById("game-end-modal");
const gameEndMessage = document.getElementById("game-end-message");
const restartGame = document.getElementById("restart-game");

// Initialize grid
for (let i = 0; i < gridSize * gridSize; i++) {
  const cell = document.createElement("div");
  cell.className = "slot-cell";
  slotGrid.appendChild(cell);
}
const cells = document.querySelectorAll(".slot-cell");

// Update bet display
function updateBetDisplay() {
  betDisplay.textContent = `Ставка: ${currentBet} кредитоов`;
  spinButton.textContent = isFreeSpinMode
    ? `Бесплатный вращение`
    : `Вращения (${currentBet} кредитов)`;
  betUpButton.disabled =
    currentBet === betOptions[betOptions.length - 1] || isFreeSpinMode;
  betDownButton.disabled = currentBet === betOptions[0] || isFreeSpinMode;
  freeSpinsCounter.textContent = isFreeSpinMode
    ? `Бесплатные вращения: ${freeSpins}`
    : "";
}

// Change bet
betUpButton.addEventListener("click", () => {
  const currentIndex = betOptions.indexOf(currentBet);
  if (currentIndex < betOptions.length - 1) {
    currentBet = betOptions[currentIndex + 1];
    updateBetDisplay();
  }
});
betDownButton.addEventListener("click", () => {
  const currentIndex = betOptions.indexOf(currentBet);
  if (currentIndex > 0) {
    currentBet = betOptions[currentIndex - 1];
    updateBetDisplay();
  }
});

// Generate grid with adjusted probabilities for 50/50 win/lose chance
function generateGrid() {
  grid = [];
  const scatterRows = [];
  for (let i = 0; i < gridSize; i++) {
    const row = [];
    const hasScatter = Math.random() < 0.3;
    let scatterCol = hasScatter ? Math.floor(Math.random() * gridSize) : -1;
    while (scatterCol !== -1 && scatterRows.includes(scatterCol)) {
      scatterCol = Math.floor(Math.random() * gridSize);
    }
    if (scatterCol !== -1) scatterRows.push(scatterCol);
    for (let j = 0; j < gridSize; j++) {
      if (j === scatterCol) {
        row.push("🎰");
      } else {
        const winChance = Math.random();
        if (winChance < 0.4) {
          row.push(["🍒", "🍋", "🍊"][Math.floor(Math.random() * 3)]);
        } else if (winChance < 0.7) {
          row.push(["🍇", "🔔"][Math.floor(Math.random() * 2)]);
        } else {
          row.push(["⭐", "💎"][Math.floor(Math.random() * 2)]);
        }
      }
    }
    grid.push(row);
  }
}

// Spin animation
async function spin() {
  if (!isFreeSpinMode && balance < currentBet) {
    messageDisplay.textContent = "Недостаточно средств!";
    return;
  }
  if (!isFreeSpinMode) {
    balance -= currentBet;
    updateBalance();
  } else {
    freeSpins--;
    updateBetDisplay();
  }
  clearLines();
  spinButton.disabled = true;
  betUpButton.disabled = true;
  betDownButton.disabled = true;

  cells.forEach((cell) => {
    cell.classList.add("spinning");
    let spinIndex = 0;
    const spinInterval = setInterval(() => {
      cell.textContent = symbols[spinIndex % symbols.length];
      spinIndex++;
    }, 50);
    cell.spinInterval = spinInterval;
  });

  generateGrid();

  for (let col = 0; col < gridSize; col++) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    for (let row = 0; row < gridSize; row++) {
      const index = row * gridSize + col;
      clearInterval(cells[index].spinInterval);
      cells[index].classList.remove("spinning");
      cells[index].textContent = grid[row][col];
    }
  }

  const result = checkWins();
  if (result.scatterCount >= 3 && !isFreeSpinMode) {
    freeSpins = 10;
    isFreeSpinMode = true;
    messageDisplay.textContent =
      "Бонусная игра! 10 бесплатных вращений с 2x множителем!";
    updateBetDisplay();
  } else if (result.scatterCount >= 3 && isFreeSpinMode) {
    freeSpins += 10;
    isFreeSpinMode = true;
    messageDisplay.textContent = "Еще 10 бесплатных вращений!";
    updateBetDisplay();
  }
  spinButton.disabled = false;
  if (!isFreeSpinMode) updateBetDisplay();
  if (isFreeSpinMode && freeSpins === 0) {
    isFreeSpinMode = false;
    messageDisplay.textContent = "Бонусная игра окончена!";
    updateBetDisplay();
  }

  if (balance >= 5000) {
    showBigWinThenEnd("5000");
  } else if (balance <= 0) {
    endGame("Игра окончена! Вы проиграли с 0 кредитами!");
  }
}

// Update balance display
function updateBalance() {
  balanceDisplay.textContent = `Баланс: ${balance} кредитов`;
}

// Clear win lines and effects
function clearLines() {
  document.querySelectorAll(".win-line").forEach((line) => {
    line.style.display = "none";
  });
  cells.forEach((cell) => {
    cell.classList.remove("winning");
  });
  messageDisplay.textContent = "";
  bigWinModal.style.display = "none";
}

// Show win line
function showLine(lineId, positions) {
  const line = document.getElementById(`line${lineId}`);
  if (lineId <= 3) {
    line.style.width = "456px";
    line.style.left = "0";
    line.style.top = `${58 + (lineId - 1) * 108}px`;
  } else if (lineId === 4) {
    line.style.width = "642px";
    line.style.left = "-93px";
    line.style.top = "168px";
    line.style.transform = "rotate(45deg)";
  } else if (lineId === 5) {
    line.style.width = "642px";
    line.style.left = "-93px";
    line.style.top = "168px";
    line.style.transform = "rotate(-45deg)";
  }
  line.style.display = "block";
  positions.forEach((index) => {
    cells[index].classList.add("winning");
  });
}

// Check for wins and scatters
function checkWins() {
  let totalWin = 0;
  let scatterCount = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === "🎰") scatterCount++;
    }
  }
  for (let i = 0; i < gridSize; i++) {
    if (
      grid[i][0] === grid[i][1] &&
      grid[i][1] === grid[i][2] &&
      grid[i][0] !== "🎰"
    ) {
      totalWin +=
        payoutMultipliers[grid[i][0]] * currentBet * (isFreeSpinMode ? 2 : 1);
      showLine(i + 1, [i * gridSize, i * gridSize + 1, i * gridSize + 2]);
    }
  }
  if (
    grid[0][0] === grid[1][1] &&
    grid[1][1] === grid[2][2] &&
    grid[0][0] !== "🎰"
  ) {
    totalWin +=
      payoutMultipliers[grid[0][0]] * currentBet * (isFreeSpinMode ? 2 : 1);
    showLine(4, [0, 4, 8]);
  }
  if (
    grid[0][2] === grid[1][1] &&
    grid[1][1] === grid[2][0] &&
    grid[0][2] !== "🎰"
  ) {
    totalWin +=
      payoutMultipliers[grid[0][2]] * currentBet * (isFreeSpinMode ? 2 : 1);
    showLine(5, [2, 4, 6]);
  }

  if (totalWin > 0) {
    balance += totalWin;
    messageDisplay.textContent = `ТЫ выиграл ${totalWin} кредитов!`;
    if (totalWin >= 15 * currentBet) {
      bigWinAmount.textContent = totalWin;
      bigWinModal.style.display = "flex";
    }
    updateBalance();
  } else if (!isFreeSpinMode || freeSpins > 0) {
    messageDisplay.textContent = "Нет выигрыша. Попробуйте еще раз.!";
  }
  return { totalWin, scatterCount };
}

// Show/hide rules modal
rulesButton.addEventListener("click", () => {
  rulesModal.style.display = "flex";
});
closeRules.addEventListener("click", () => {
  rulesModal.style.display = "none";
});

// Show/hide big win modal
closeBigWin.addEventListener("click", () => {
  bigWinModal.style.display = "none";
  if (balance >= 5000) {
    endGame("Поздравляем! Вы выиграли 5000 кредитов!");
  }
});

// End game with win/lose condition
function endGame(message) {
  gameEndMessage.textContent = message;
  gameEndModal.style.display = "flex";
  spinButton.disabled = true;
  betUpButton.disabled = true;
  betDownButton.disabled = true;
}

// Show Big Win modal, then Game Over if 5000 credits
function showBigWinThenEnd(amount) {
  bigWinAmount.textContent = amount;
  bigWinModal.style.display = "flex";
}

// Restart game
restartGame.addEventListener("click", () => {
  balance = 1000;
  currentBet = 10;
  freeSpins = 0;
  isFreeSpinMode = false;
  updateBalance();
  updateBetDisplay();
  gameEndModal.style.display = "none";
  bigWinModal.style.display = "none";
  spinButton.disabled = false;
  betUpButton.disabled = false;
  betDownButton.disabled = false;
  clearLines();
});

// Spin button event
spinButton.addEventListener("click", spin);

// Initial balance and bet display
updateBalance();
updateBetDisplay();
