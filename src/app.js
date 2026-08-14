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
let playerInventory = [];
let quests = [];

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

// Local Storage Logic
function saveState() {
    localStorage.setItem('focusQuest_level', playerLevel);
    localStorage.setItem('focusQuest_xp', playerXP);
    localStorage.setItem('focusQuest_gold', playerGold);
    localStorage.setItem('focusQuest_inventory', JSON.stringify(playerInventory));
    localStorage.setItem('focusQuest_quests', JSON.stringify(quests));
}

function loadState() {
    const savedLevel = localStorage.getItem('focusQuest_level');
    if (savedLevel) playerLevel = parseInt(savedLevel);
    
    const savedXP = localStorage.getItem('focusQuest_xp');
    if (savedXP) playerXP = parseInt(savedXP);
    
    const savedGold = localStorage.getItem('focusQuest_gold');
    if (savedGold) playerGold = parseInt(savedGold);
    
    const savedInventory = localStorage.getItem('focusQuest_inventory');
    if (savedInventory) playerInventory = JSON.parse(savedInventory);
    
    const savedQuests = localStorage.getItem('focusQuest_quests');
    if (savedQuests) quests = JSON.parse(savedQuests);
}

// Utility: Format seconds into MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    
    // Add a leading zero if less than 10
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const displaySeconds = remainderSeconds < 10 ? `0${remainderSeconds}` : remainderSeconds;
    
    return `${displayMinutes}:${displaySeconds}`;
}

// Function to add bounce animation
function animateStat(element) {
    element.classList.remove('stat-bounce');
    void element.offsetWidth; // trigger reflow
    element.classList.add('stat-bounce');
}

// Update the DOM Display
function updateDisplay() {
    const prevXP = parseInt(xpDisplay.textContent);
    const prevGold = parseInt(goldDisplay.textContent);
    const prevLevel = parseInt(levelDisplay.textContent);

    timeDisplay.textContent = formatTime(timeLeft);
    levelDisplay.textContent = playerLevel;
    xpDisplay.textContent = playerXP;
    goldDisplay.textContent = playerGold;
    
    if (!isNaN(prevXP) && playerXP !== prevXP) animateStat(xpDisplay);
    if (!isNaN(prevGold) && playerGold !== prevGold) animateStat(goldDisplay);
    if (!isNaN(prevLevel) && playerLevel !== prevLevel) animateStat(levelDisplay);
}

// Gamification Logic
function rewardPlayer() {
    playerXP += 50;
    playerGold += 25;
    
    if (playerXP >= 100) {
        playerLevel++;
        playerXP -= 100;
        document.body.classList.add('level-up-flash');
        setTimeout(() => document.body.classList.remove('level-up-flash'), 1000);
        setTimeout(() => alert(`Level Up! You are now Level ${playerLevel}!`), 50);
    }
    saveState();
}

// Quest Logic
function renderQuest(questName) {
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
            document.body.classList.add('level-up-flash');
            setTimeout(() => document.body.classList.remove('level-up-flash'), 1000);
            setTimeout(() => alert(`Level Up! You are now Level ${playerLevel}!`), 50);
        }
        
        quests.splice(quests.indexOf(questName), 1);
        saveState();
        
        updateDisplay();
        newQuest.remove();
    });
    
    newQuest.appendChild(completeBtn);
    questList.appendChild(newQuest);
}

function addQuest() {
    const questName = questInput.value.trim();
    if (questName === "") return;
    
    quests.push(questName);
    saveState();
    
    renderQuest(questName);
    questInput.value = "";
}

function renderAllQuests() {
    questList.innerHTML = '';
    quests.forEach(q => renderQuest(q));
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
                saveState();
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
    timeDisplay.classList.add('timer-running');
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        // When timer hits 0
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            timeDisplay.classList.remove('timer-running');
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
    timeDisplay.classList.remove('timer-running');
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeDisplay.classList.remove('timer-running');
    timeLeft = DEFAULT_TIME;
    updateDisplay();
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addQuestBtn.addEventListener('click', addQuest);

// Initialize Display
loadState();
updateDisplay();
renderShop();
renderInventory();
renderAllQuests();
