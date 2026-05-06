const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originText = document.querySelector("#origin-text p"); //Element//.innerHTML
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");

const wpmDisplay = document.querySelector("#wpm");
const errorDisplay = document.querySelector("#errors");
const scoreList = document.querySelector("#score-list");

// Load existing scores from Local Storage or start with an empty array
let topScores = JSON.parse(localStorage.getItem("typingScores")) || [];



// --- PROJECT DATA ---
const phrases = [
    "The quick brown fox jumps over the lazy dog.",
    "Web development requires patience and attention to detail.",
    "JavaScript allows for dynamic and interactive user experiences.",
    "Numerical methods provide approximations for complex math.",
    "Consistency is the key to mastering any new programming skill.",
    "Don't litter the plant, RESYCLE!"

];

let timer = [0, 0, 0, 0]; // [min, sec, hundredths, total_hundredths]
let interval;
let timerRunning = false;
let errors = 0;

// Add leading zero to numbers 9 or below (purely for aesthetics):
function leadingZero(time) {
    if (time <= 9) {
        time = "0" + time;
    }
    return time;
}
// Run a standard minute/second/hundredths timer:
function runTimer() {
    let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
    theTimer.innerHTML = currentTime;
    
    timer[3]++; // Track total hundredths for WPM math
    timer[0] = Math.floor((timer[3] / 100) / 60);
    timer[1] = Math.floor((timer[3] / 100) - (timer[0] * 60));
    timer[2] = Math.floor(timer[3] - (timer[1] * 100) - (timer[0] * 6000));
}

// Match the text entered with the provided text on the page:
function spellCheck() {
    let textEntered = testArea.value;
    let originTextValue = originText.innerText; //Element
    let originTextMatch = originTextValue.substring(0, textEntered.length);

// COMPLETION TRIGGER

    if (textEntered == originTextValue) {
        // Completion Trigger: Green
        clearInterval(interval);
        testWrapper.style.borderColor = "#429890"; //Green
        
        // Calculate WPM on finish
        let totalSeconds = timer[3] / 100;
        let wpm = ((textEntered.length / 5) / (totalSeconds / 60)).toFixed(2);
        console.log("WPM: " + wpm + " | Errors: " + errors);
        
        wpmDisplay.innerHTML = wpm;
        saveScore(totalSeconds); // Save to Local Storage

    } else {
        if (textEntered == originTextMatch) {
            testWrapper.style.borderColor = "#65CCf3";  // Matching: Blue
        } else {
            errors++;
            errorDisplay.innerHTML = errors; // Show live error count
            testWrapper.style.borderColor = "#E95D0F";  // Mismatch: Red/Orange
        }
    }
}
//    TIMER PRECISION.     

// Start the timer:
function start() {
    let textEnterLength = testArea.value.length;
    // Timer Precision: Only start if text area is empty and no timer is running
    if (textEnterLength === 0 && !timerRunning) { 
        timerRunning = true; //Lock the timer so another one cannot start
        interval = setInterval(runTimer, 10);
    }
}
// Reset everything:
function reset() {
    // Clear the technical state
    clearInterval(interval);

    //ready for a new setInterval later
    interval = null;
    timer = [0, 0, 0, 0];

    // Unlock the guard so the start() function can work again
    timerRunning = false;
    errors = 0;

    // Reset the UI
    testArea.value = "";
    theTimer.innerHTML = "00:00:00";
    testWrapper.style.borderColor = "grey";

    // Reset stats if you added the WPM/Error spans
    if (wpmDisplay) wpmDisplay.innerHTML = "0";
    if (errorDisplay) errorDisplay.innerHTML = "0";

    // Duplicate Prevention Logic
    let currentPhrase = originText.innerHTML;
    let nextPhrase = currentPhrase;

    while (nextPhrase === currentPhrase) {
        let randomIndex = Math.floor(Math.random() * phrases.length);
        nextPhrase = phrases[randomIndex];
    }

    // Update the screen with the new phrase
    originText.innerHTML = nextPhrase; 
}

// Event listeners for keyboard input and the reset button:
testArea.addEventListener("keypress", start, false);
testArea.addEventListener("keyup", spellCheck, false);
resetButton.addEventListener("click", reset, false);

// Function to pick a phrase on initial load
window.onload = reset;

function saveScore(seconds) {
    topScores.push(seconds);
    topScores.sort((a, b) => a - b); // Sort lowest to highest
    topScores = topScores.slice(0, 3); // Keep only the top 3
    
    localStorage.setItem("typingScores", JSON.stringify(topScores));
    displayScores();
}

function displayScores() {
    if (scoreList) {
        scoreList.innerHTML = topScores
            .map((score) => `<li>${score.toFixed(2)} seconds</li>`)
            .join("");
    }
}