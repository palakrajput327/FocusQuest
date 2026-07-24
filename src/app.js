// State Management
const DEFAULT_TIME = 25 * 60; // 25 minutes in seconds
let timeLeft = DEFAULT_TIME;
let timerInterval = null;
let isRunning = false;

// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

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
            // Phase 4 will hook in here to grant XP and Gold!
            alert("Focus Session Complete! (XP & Gold coming in Phase 4!)");
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

// Initialize Display
updateDisplay();
