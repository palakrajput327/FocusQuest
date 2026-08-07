// State Management
const DEFAULT_TIME =  25*60; // 25 minutes in seconds
let timeLeft = DEFAULT_TIME;
let timerInterval = null;
let isRunning = false;

// Player Gamification State
let playerLevel = 1;
let playerXP = 0;
let playerGold = 0;

// Shop & Inventory State
const shopItems = [
    { id: "potion", name: "Health Potion", cost: 100 },
    { id: "elixir", name: "Mana Elixir", cost: 100 },
    { id: "sword", name: "Wooden Sword", cost: 250 }
];
const playerInventory = [];

// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

const levelDisplay = document.getElementById('current-level');
const xpDisplay = document.getElementById('current-xp');
const goldDisplay = document.getElementById('current-gold');

const questInput = document.getElementById('quest-input');
const addQuestBtn = document.getElementById('add-quest-btn');
const questList = document.getElementById('quest-list');

const shopItemsContainer = document.getElementById('shop-items');
const inventoryGrid = document.getElementById('inventory-grid');

// Utility: Format seconds into MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    
    // Add a leading zero if less than 10
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const displaySeconds = remainderSeconds < 10 ? `0${remainderSeconds}` : remainderSeconds;
    
    return `${displayMinutes}:${displaySeconds}`;
}

// Update the DOM Display
function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    levelDisplay.textContent = playerLevel;
    xpDisplay.textContent = playerXP;
    goldDisplay.textContent = playerGold;
}

// Gamification Logic
function rewardPlayer() {
    playerXP += 50;
    playerGold += 25;
    
    if (playerXP >= 100) {
        playerLevel++;
        playerXP -= 100;
        alert(`Level Up! You are now Level ${playerLevel}!`);
    }
}

// Quest Logic
function addQuest() {
    const questName = questInput.value.trim();
    if (questName === "") return;
    
    const newQuest = document.createElement("li");
    
    const textNode = document.createElement("span");
    textNode.textContent = questName;
    newQuest.appendChild(textNode);
    
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.className = "complete-btn";
    completeBtn.addEventListener("click", function() {
        playerXP += 20;
        playerGold += 10;
        
        if (playerXP >= 100) {
            playerLevel++;
            playerXP -= 100;
            alert(`Level Up! You are now Level ${playerLevel}!`);
        }
        
        updateDisplay();
        newQuest.remove();
    });
    
    newQuest.appendChild(completeBtn);
    questList.appendChild(newQuest);
    
    questInput.value = "";
}

// Shop Logic
function renderShop() {
    shopItemsContainer.innerHTML = '';
    
    shopItems.forEach(item => {
        const itemDiv = document.createElement("div");
        
        const nameSpan = document.createElement("span");
        nameSpan.textContent = `${item.name} (${item.cost}g)`;
        
        const buyBtn = document.createElement("button");
        buyBtn.textContent = "Buy";
        buyBtn.className = "complete-btn";
        
        buyBtn.addEventListener("click", () => {
            if (playerGold >= item.cost) {
                playerGold -= item.cost;
                playerInventory.push(item);
                updateDisplay();
                renderInventory();
                alert(`Purchased ${item.name}!`);
            } else {
                alert(`Not enough gold for ${item.name}! You need ${item.cost - playerGold} more gold.`);
            }
        });
        
        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(buyBtn);
        shopItemsContainer.appendChild(itemDiv);
    });
}

function renderInventory() {
    inventoryGrid.innerHTML = '';
    
    playerInventory.forEach(item => {
        const slot = document.createElement("div");
        slot.className = "inventory-slot";
        slot.textContent = item.name;
        inventoryGrid.appendChild(slot);
    });
}

// Timer Logic
function startTimer() {
    if (isRunning) return; // Prevent multiple intervals
    if (timeLeft <= 0) return; // Prevent starting if time is up
    
    isRunning = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        // When timer hits 0
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            rewardPlayer(); // Grant XP and Gold
            timeLeft = DEFAULT_TIME; // Reset for next session
            updateDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = DEFAULT_TIME;
    updateDisplay();
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addQuestBtn.addEventListener('click', addQuest);

// Initialize Display
updateDisplay();
renderShop();
renderInventory();
