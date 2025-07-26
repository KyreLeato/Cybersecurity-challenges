// Number of questions per game
const QUESTIONS_PER_GAME = 15;

// Variables declaration
let currentScenarioIndex = 0;
let score = 0;
let selectedScenarios = [];
let selectedPopup = null;
let maxScore = QUESTIONS_PER_GAME + 2;
let scenariosData = null;
let popupTriggered = false;
let selectedDifficulty = null;
let questionHistory = [];
let attemptNumber = 0; 
let currentAttemptHistory = [];
let currentAttemptView = 0;
let popupTimer = null;
let popupTimeLeft = 20;
let tickSound = null;

// Objects Elements Connection
const loadingContainer = document.getElementById('loadingContainer');
const playerNameInput = document.getElementById('playerName');
const playerAgeInput = document.getElementById('playerAge');
const disclaimerSection = document.getElementById('disclaimerSection');
const difficultySection = document.getElementById('difficultySection');
const gameSection = document.getElementById('gameSection');
const agreeCheckbox = document.getElementById('agreeCheckbox');
const startButton = document.getElementById('startButton');
const scenarioContainer = document.getElementById('scenarioContainer');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackContainer = document.getElementById('feedback');
const nextButton = document.getElementById('nextButton');
const scoreValue = document.getElementById('scoreValue');
const progressBar = document.getElementById('progressBar');
const gameCompleted = document.getElementById('gameCompleted');
const finalScore = document.getElementById('finalScore');
const badgeContainer = document.getElementById('badgeContainer');
const restartButton = document.getElementById('restartButton');
const quitButton = document.getElementById('quitButton');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');


// Hide the guidebook button initially
const guidebookBtn = document.getElementById('guidebookBtn');
if (guidebookBtn) guidebookBtn.style.display = 'none';

// Popups containers
const popupContainer = document.createElement('div');
popupContainer.id = 'popupContainer';
popupContainer.style.display = 'none';
document.body.appendChild(popupContainer);

// Declare the max scores for each difficulty
const maxScores = {
    easy: 15,
    normal: 15,
    hard: 15
};

// Popups and leaderboard styles
const style = document.createElement('style');
style.textContent = `
    #popupContainer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(12, 12, 29, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .popup {
        background: #18182a;
        padding: 24px 18px;
        border-radius: 12px;
        box-shadow: 0 0 12px 3px #0f0, 0 0 0 2px #0f0 inset;
        max-width: 420px;
        text-align: center;
        border-left: 4px solid #0f0;
        border-right: 4px solid #0f0;
        color: #e0e0e0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        position: relative;
        animation: popup-glow 1.2s infinite alternate;
    }
    @keyframes popup-glow {
        0% { box-shadow: 0 0 12px 3px #0f0, 0 0 0 2px #0f0 inset; }
        100% { box-shadow: 0 0 20px 5px #0f0, 0 0 0 2px #0f0 inset; }
    }
    .popup.shake {
        animation: shake 0.1s ease-in-out infinite;
    }
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        50% { transform: translateX(3px); }
        75% { transform: translateX(-3px); }
        100% { transform: translateX(0); }
    }
    .popup h3 {
        color: #0f0;
        margin-bottom: 16px;
        font-size: Oligopoly;
        text-shadow: 0 0 5px #0f0;
    }
    .popup p {
        margin-bottom: 18px;
        color: #e0e0e0;
        font-size: 1.1em;
        text-shadow: 0 0 3px #0f0;
    }
    .popup .option-btn {
        margin: 8px 6px;
        padding: 10px 20px;
        background: #0f0;
        color: #18182a;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 1.05em;
        box-shadow: 0 0 5px #0f0;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    }
    .popup .option-btn:hover:not(:disabled) {
        background: #00cc00;
        color: #fff;
        box-shadow: 0 0 10px #0f0;
    }
    .popup .feedback {
        margin-top: 14px;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
        font-size: 1em;
    }
    .popup .feedback.correct {
        background: rgba(0, 255, 0, 0.15);
        border: 1px solid #0f0;
        color: #0f0;
        text-shadow: 0 0 4px #0f0;
    }
    .popup .feedback.incorrect {
        background: rgba(255, 0, 0, 0.12);
        border: 1px solid #f00;
        color: #f00;
        text-shadow: 0 0 4px #f00;
    }
    .popup .close-btn {
        margin-top: 14px;
        padding: 8px 16px;
        background: #0f0;
        color: #18182a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 1em;
        box-shadow: 0 0 4px #0f0;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    }
    .popup .close-btn:hover {
        background: #00cc00;
        color: #fff;
        box-shadow: 0 0 8px #0f0;
    }
    .popup .timer {
        position: absolute;
        top: 10px;
        right: 10px;
        color: #0f0;
        font-size: 1.2em;
        font-weight: bold;
        text-shadow: 0 0 4px #0f0;
        background: rgba(0, 0, 0, 0.6);
        padding: 6px 12px;
        border-radius: 6px;
        transition: background 0.5s, color 0.5s, transform 0.3s;
        animation: pulse 0.8s infinite alternate;
    }
    .popup .timer.urgent {
        color: #f00;
        text-shadow: 0 0 5px #f00;
        background: rgba(255, 0, 0, 0.3);
    }
    .popup .timer.critical {
        animation: pulse 0.4s infinite alternate, flash 0.2s infinite alternate;
    }
    @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
    }
    @keyframes flash {
        0% { background: rgba(255, 0, 0, 0.3); }
        100% { background: rgba(255, 0, 0, 0.5); }
    }
    /* Learning Curve Graph Styles */
    #learningCurveContainer {
        margin: 20px 0;
        width: 100%;
        max-width: 600px;
        height: 300px;
    }
    #learningCurveGraph {
        width: 100%;
        height: 100%;
    }
    /* Question History Styles */
    #questionHistoryContainer {
        margin-top: 20px;
        max-height: 300px;
        overflow-y: auto;
        background: #16213e;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #0f0;
        position: relative;
    }
    .history-item {
        margin-bottom: 15px;
        padding: 10px;
        border-bottom: 1px solid #0f0;
    }
    .history-item:last-child {
        border-bottom: none;
    }
    .history-question {
        color: #e0e0e0;
        font-size: 1em;
        margin-bottom: 5px;
    }
    .history-answer {
        color: #b2ffb2;
        font-size: 0.95em;
        margin-bottom: 5px;
    }
    .history-result {
        font-weight: bold;
        font-size: 0.95em;
    }
    .history-result.correct {
        color: #0f0;
    }
    .history-result.incorrect {
        color: #f00;
    }
    /* Navigation Buttons */
    .nav-buttons {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 10px;
    }
    .nav-button {
        padding: 5px 10px;
        background: #0f0;
        color: #18182a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8em;
        opacity: 1; /* Changed from 0 to always be visible */
        transition: opacity 0.3s;
    }
    .nav-button:hover {
        background: #00cc00;
        color: #fff;
    }
    .nav-button:disabled {
        background: #666;
        cursor: not-allowed;
    }
    /* Score Flash Animation */
    #scoreValue.flash-positive {
        animation: flash-positive 0.5s ease-in-out;
    }
    #scoreValue.flash-negative {
        animation: flash-negative 0.5s ease-in-out;
    }
    @keyframes flash-positive {
        0% { color: #0f0; transform: scale(1.2); }
        100% { color: #e0e0e0; transform: scale(1); }
    }
    @keyframes flash-negative {
        0% { color: #f00; transform: scale(1.2); }
        100% { color: #e0e0e0; transform: scale(1); }
    }
    /* Leaderboard Styles */
    #leaderboardSidebar {
        display: none; /* Hidden by default */
        background: #18182a;
        border: 2px solid #0f0;
        padding: 15px;
        border-radius: 10px;
    }
    #leaderboardSidebar h2 {
        color: #0f0;
        font-family: 'Courier New', monospace;
        margin-bottom: 15px;
    }
    .leaderboard-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }
    .tab-btn {
        padding: 8px 16px;
        background: #18182a;
        color: #e0e0e0;
        border: 1px solid #0f0;
        border-radius: 5px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
    }
    .tab-btn.active {
        background: #0f0;
        color: #18182a;
    }
    .tab-btn:hover:not(.active) {
        background: #00cc00;
        color: #fff;
    }
    .leaderboard-entry {
        display: flex;
        gap: 10px;
        padding: 5px;
        color: #e0e0e0;
        font-family: 'Courier New', monospace;
    }
    .leaderboard-entry.top1 { background: rgba(255, 215, 0, 0.2); }
    .leaderboard-entry.top2 { background: rgba(192, 192, 192, 0.2); }
    .leaderboard-entry.top3 { background: rgba(205, 127, 50, 0.2); }
    .rank { width: 10%; }
    .name { width: 60%; }
    .score { width: 30%; text-align: right; }
    #hideLeaderboardBtn {
        margin-top: 10px;
        padding: 8px;
        background: #0f0;
        color: #18182a;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
    }
    #hideLeaderboardBtn:hover {
        background: #00cc00;
    }
`;
document.head.appendChild(style);

// Load Chart.js for the learning curve graph
const chartJsScript = document.createElement('script');
chartJsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(chartJsScript);

// Firebase initialization
const firebaseConfig = {
    apiKey: "AIzaSyBs-13t3487Ft4LuY9OIBA53z7w95fcs50",
    authDomain: "cybersecurity-challenges.firebaseapp.com",
    projectId: "cybersecurity-challenges",
    storageBucket: "cybersecurity-challenges.firebasestorage.app",
    messagingSenderId: "773642549410",
    appId: "1:773642549410:web:6b5853f080ceda63a9bffb",
    measurementId: "G-GW0RP56H15"
};
if (!firebase.apps.length) {
    console.log("Initializing Firebase...");
    firebase.initializeApp(firebaseConfig);
} else {
    console.log("Firebase already initialized:", firebase.apps.length);
}
const db = firebase.firestore();
console.log("Firestore instance:", db);

// Fade out loading, show disclaimer
setTimeout(() => {
    if (!loadingContainer) return;
    loadingContainer.classList.add('fade-out');
    setTimeout(() => {
        loadingContainer.style.display = 'none';
        if (guidebookBtn) guidebookBtn.style.display = 'inline-block';
        if (disclaimerSection) disclaimerSection.style.display = 'block';
        showLeaderboard(); // Show leaderboard only after UI is ready
    }, 500);
}, 3000);

// Helper to show/hide validation messages
function showValidationMessage(input, message) {
    let msgElem = input.parentElement.querySelector('.validation-msg');
    if (!msgElem) {
        msgElem = document.createElement('div');
        msgElem.className = 'validation-msg';
        msgElem.style.color = '#f00';
        msgElem.style.fontSize = '0.95em';
        msgElem.style.marginTop = '2px';
        input.parentElement.appendChild(msgElem);
    }
    msgElem.textContent = message;
    msgElem.style.display = message ? 'block' : 'none';
}

// Validate player name (letters and spaces only)
function validateName() {
    const value = playerNameInput.value.trim();
    if (!value) {
        showValidationMessage(playerNameInput, 'Name is required.');
        return false;
    }
    if (!/^[A-Za-z\s]+$/.test(value)) {
        showValidationMessage(playerNameInput, 'Name must only contain letters.');
        return false;
    }
    showValidationMessage(playerNameInput, '');
    return true;
}

// Validate player age (numbers only, 1-120)
function validateAge() {
    const value = playerAgeInput.value.trim();
    if (!value) {
        showValidationMessage(playerAgeInput, 'Age is required.');
        return false;
    }
    if (!/^\d+$/.test(value)) {
        showValidationMessage(playerAgeInput, 'Age must be a number.');
        return false;
    }
    const age = parseInt(value, 10);
    if (age < 1 || age > 120) {
        showValidationMessage(playerAgeInput, 'Enter a valid age (1-120).');
        return false;
    }
    showValidationMessage(playerAgeInput, '');
    return true;
}

// Enable/disable disclaimer checkbox and start button
function updateDisclaimerState() {
    const nameValid = validateName();
    const ageValid = validateAge();
    agreeCheckbox.disabled = !(nameValid && ageValid);
    if (!agreeCheckbox.disabled) {
        agreeCheckbox.parentElement.style.opacity = 1;
    } else {
        agreeCheckbox.checked = false;
        startButton.disabled = true;
        agreeCheckbox.parentElement.style.opacity = 0.6;
    }
}

// Prevent back navigation during game
function preventBackNavigation() {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function(event) {
        window.history.pushState(null, null, window.location.href);
        showBackNavigationWarning();
    };
}

// Show warning modal when back button is pressed
function showBackNavigationWarning() {
    const warningModal = document.createElement('div');
    warningModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #18182a;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #0f0;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
        z-index: 1000;
        text-align: center;
        color: #e0e0e0;
    `;
    
    warningModal.innerHTML = `
        <h3 style="color: #0f0; margin-bottom: 15px;">Warning!</h3>
        <p style="margin-bottom: 20px;">You cannot go back during the game.</p>
        <button onclick="this.parentElement.remove()" style="
            background: #0f0;
            color: #18182a;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        ">Continue Game</button>
    `;
    
    document.body.appendChild(warningModal);
}

// Generate two random popup triggers
function getTwoPopupTriggers(totalQuestions) {
    const first = Math.floor(Math.random() * (7 - 3 + 1)) + 3;
    let second;
    do {
        second = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
    } while (second === first);
    return [first, second];
}
let POPUP_TRIGGER_QUESTIONS = getTwoPopupTriggers(QUESTIONS_PER_GAME);
let popupsShown = 0;

// Prevent typing numbers in name field
playerNameInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-z\s]/g, '');
    updateDisclaimerState();
});

// Prevent typing non-numbers in age field
playerAgeInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
    updateDisclaimerState();
});

// Validate on blur as well
playerNameInput.addEventListener('blur', validateName);
playerAgeInput.addEventListener('blur', validateAge);

// Prevent checking disclaimer box if fields are invalid
agreeCheckbox.addEventListener('click', function(e) {
    if (agreeCheckbox.disabled) {
        e.preventDefault();
        validateName();
        validateAge();
        alert('Please enter a valid name (letters only) and age (numbers only) before agreeing to the terms.');
    }
});

// Enable start button when checkbox is checked
agreeCheckbox.addEventListener('change', function() {
    startButton.disabled = !this.checked;
});

// Disable start button for checking inputs
agreeCheckbox.disabled = true;
agreeCheckbox.parentElement.style.opacity = 0.6;
startButton.disabled = true;

// Start button shows difficulty selection and hides leaderboard
startButton.addEventListener('click', function() {
    if (!disclaimerSection || !difficultySection) return;
    disclaimerSection.style.display = 'none';
    difficultySection.style.display = 'block';
    if (guidebookBtn) guidebookBtn.style.display = 'none';
    hideLeaderboard(); // Hide leaderboard when starting game
    preventBackNavigation(); // Prevent back navigation
});

// Difficulty selection
difficultyButtons.forEach(button => {
    button.addEventListener('click', async function() {
        if (!this.dataset.difficulty) return;
        selectedDifficulty = this.dataset.difficulty;
        if (!difficultySection || !gameSection) return;
        difficultySection.style.display = 'none';
        gameSection.style.display = 'block';
        preventBackNavigation(); // Prevent back navigation
        await initGame();
    });
});

// Next button
nextButton.addEventListener('click', function() {
    if (!feedbackContainer || !nextButton) return;
    feedbackContainer.style.display = 'none';
    nextButton.style.display = 'none';
    currentScenarioIndex++;
    if (
        popupsShown < 2 &&
        POPUP_TRIGGER_QUESTIONS.includes(currentScenarioIndex)
    ) {
        popupsShown++;
        showPopup();
    } else if (currentScenarioIndex < selectedScenarios.length) {
        loadScenario();
    } else {
        completeGame();
    }
});

// Restart button
restartButton.addEventListener('click', async function() {
    if (!gameCompleted || !difficultySection) return;
    gameCompleted.style.display = 'none';
    difficultySection.style.display = 'block';
    popupTriggered = false;
    selectedDifficulty = null;
    selectedScenarios = [];
    currentScenarioIndex = 0;
    score = 0;
    scoreValue.textContent = score;
    currentAttemptHistory = [];
});

// Quit button
quitButton.addEventListener('click', function() {
    const playerName = document.getElementById('playerName') ? document.getElementById('playerName').value : 'Anonymous';
    const playerAge = document.getElementById('playerAge') ? document.getElementById('playerAge').value : '';
    const result = `${score}/${maxScores[selectedDifficulty] || 15}`;
    const googleFormURL = `https://docs.google.com/forms/d/e/1FAIpQLSetaJQxQ_21zgpTOI-O1vFn6q2g3U5gQWlsNtDe19ypXz2Z2g/viewform?usp=pp_url`
        + `&entry.753452273=${encodeURIComponent(playerName)}`
        + `&entry.735828413=${encodeURIComponent(playerAge)}`
        + `&entry.1000316234=${encodeURIComponent(result)}`;
    window.open(googleFormURL, '_blank');
    window.location.href = 'gamequiz.html';
});

// Game Functions
async function fetchScenarios() {
    try {
        scenariosData = scenariosDataEmbedded;
        if (!scenariosData || !scenariosData.scenarios || !scenariosData.popups) {
            throw new Error('Embedded scenarios data is invalid or missing scenarios/popups');
        }
        return scenariosData;
    } catch (error) {
        alert('Failed to load questions. Please refresh the page or try again later.');
        if (gameSection && disclaimerSection) {
            gameSection.style.display = 'none';
            disclaimerSection.style.display = 'block';
        }
        return null;
    }
}

// Select random scenarios based on difficulty
function selectRandomScenarios() {
    if (!scenariosData || !scenariosData.scenarios) return [];
    if (!['easy', 'normal', 'hard'].includes(selectedDifficulty)) {
        alert('Invalid difficulty selected. Please choose a difficulty level.');
        return [];
    }
    const filteredScenarios = scenariosData.scenarios.filter(scenario => scenario.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    if (filteredScenarios.length < QUESTIONS_PER_GAME) {
        alert(`Not enough questions available for ${selectedDifficulty} difficulty. Please try another difficulty.`);
        return [];
    }
    const maxQuestions = Math.min(QUESTIONS_PER_GAME, filteredScenarios.length);
    const allScenarioIds = [...Array(filteredScenarios.length).keys()];
    for (let i = allScenarioIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allScenarioIds[i], allScenarioIds[j]] = [allScenarioIds[j], allScenarioIds[i]];
    }
    const selectedIds = allScenarioIds.slice(0, QUESTIONS_PER_GAME);
    return selectedIds.map(id => filteredScenarios[id]);
}

function selectRandomPopup() {
    if (!scenariosData || !scenariosData.popups) return null;
    const popupIds = [...Array(scenariosData.popups.length).keys()];
    const randomIndex = Math.floor(Math.random() * popupIds.length);
    return scenariosData.popups[popupIds[randomIndex]];
}

async function initGame() {
    attemptNumber++;
    currentAttemptView = attemptNumber;
    selectedDifficulty = selectedDifficulty || 'easy';
    playerName = document.getElementById('playerName')?.value || 'Anonymous';

    // Reset game state
    if (!scenariosData) {
        await fetchScenarios();
    }

    // If scenariosData is still not loaded, exit
    if (!scenariosData) return;
    currentScenarioIndex = 0;
    score = 0;
    scoreValue.textContent = score;
    selectedScenarios = selectRandomScenarios();

    // If no scenarios are selected, show difficulty section
    if (selectedScenarios.length === 0) {
        gameSection.style.display = 'none';
        difficultySection.style.display = 'block';
        return;
    }

    // Hide game section and show scenario container
    POPUP_TRIGGER_QUESTIONS = getTwoPopupTriggers(QUESTIONS_PER_GAME);
    popupsShown = 0;
    currentAttemptHistory = []; //Clear previous attempts history and start new attempt history
    loadScenario();
}

// Array shuffle function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function loadScenario() {
    if (!scenarioContainer || !optionsContainer || !scoreValue || !progressBar) return;
    if (currentScenarioIndex >= selectedScenarios.length) {
        completeGame();
        return;
    }
    const scenario = selectedScenarios[currentScenarioIndex];
    if (!scenario) {
        completeGame();
        return;
    }
    const progress = ((currentScenarioIndex) / QUESTIONS_PER_GAME) * 100;
    progressBar.style.width = `${progress}%`;
    scenarioContainer.innerHTML = `
        <h3>Cybersecurity Scenario</h3>
        <p>${scenario.question}</p>
        ${scenario.image ? `<img src="${scenario.image}" alt="Scenario Image" class="scenario-image">` : ''}
        <div class="scenario-category">Category: ${scenario.category.charAt(0).toUpperCase() + scenario.category.slice(1)}</div>
    `;
    document.getElementById('currentQuestionNum').textContent = currentScenarioIndex + 1;
    document.getElementById('totalQuestions').textContent = QUESTIONS_PER_GAME;
    optionsContainer.innerHTML = '';
    
    // Shuffle the options
    const shuffledOptions = shuffleArray(scenario.options);
    shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        button.addEventListener('click', function () {
            selectOption(index, option.correct, option.text, shuffledOptions);
        });
        optionsContainer.appendChild(button);
    });
}

function selectOption(index, isCorrect, selectedText, shuffledOptions) {
    if (!optionsContainer || !feedbackContainer || !nextButton || !scoreValue) return;
    const optionButtons = optionsContainer.querySelectorAll('button');
    optionButtons.forEach(button => {
        button.disabled = true;
    });
    optionButtons[index].style.borderColor = isCorrect ? '#0f0' : '#f00';
    const scenario = selectedScenarios[currentScenarioIndex];
    feedbackContainer.innerHTML = isCorrect ? scenario.feedback.correct : scenario.feedback.incorrect;
    feedbackContainer.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackContainer.style.display = 'block';

    // Update score and flash effect
    if (isCorrect) {
        score++;
        scoreValue.textContent = score;
        scoreValue.classList.add('flash-positive');
        setTimeout(() => scoreValue.classList.remove('flash-positive'), 500);
    }
    // Store current attempt's question history
    currentAttemptHistory.push({
        attempt: attemptNumber,
        question: scenario.question,
        answer: selectedText,
        correct: isCorrect,
        feedback: isCorrect ? `${scenario.feedback.correct} (+1 point)` : scenario.feedback.incorrect,
        scoreChange: isCorrect ? 1 : 0
    });
    nextButton.style.display = 'block';
}

// Simple tick sound using Web Audio API
function startTickSound() {
    if (tickSound) return; // Prevent multiple sounds
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    tickSound = ctx.createOscillator();
    tickSound.type = 'sine';
    tickSound.frequency.setValueAtTime(800, ctx.currentTime); // Time tick frequency
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // Low volume
    tickSound.connect(gainNode);
    gainNode.connect(ctx.destination);
    tickSound.start();
}

function stopTickSound() {
    if (tickSound) {
        tickSound.stop();
        tickSound = null;
    }
}

// Popup trigger function
function showPopup() {
    popupTriggered = true;
    selectedPopup = selectRandomPopup();
    if (!selectedPopup) {
        if (currentScenarioIndex < selectedScenarios.length) {
            loadScenario();
        } else {
            completeGame();
        }
        return;
    }
    popupTimeLeft = 20;
    const shuffledOptions = shuffleArray(selectedPopup.options);
    popupContainer.innerHTML = `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popupTitle" aria-describedby="popupDesc" tabindex="-1">
            <div class="timer" id="popupTimer">${popupTimeLeft}s</div>
            <h3 id="popupTitle">CRITICAL ALERT!</h3>
            <p id="popupDesc">${selectedPopup.question}</p>
            <button class="option-btn" data-index="0">${shuffledOptions[0].text}</button>
            <button class="option-btn" data-index="1">${shuffledOptions[1].text}</button>
            <div id="popupFeedback" class="feedback" style="display: none;"></div>
            <button class="close-btn" id="closePopup" style="display: none;">Continue</button>
        </div>
    `;
    popupContainer.style.display = 'flex';

    const popupDiv = popupContainer.querySelector('.popup');
    const timerDisplay = document.getElementById('popupTimer');
    if (popupDiv) popupDiv.focus();

    const optionButtons = popupContainer.querySelectorAll('.option-btn');
    optionButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            handlePopupResponse(index, false, shuffledOptions);
        });
    });

    // Start the timer
    popupTimer = setInterval(() => {
        popupTimeLeft--;
        if (timerDisplay) {
            timerDisplay.textContent = `${popupTimeLeft}s`;
            const progress = popupTimeLeft / 20;
            timerDisplay.style.background = `rgba(${255 * (1 - progress)}, ${255 * progress}, 0, 0.6)`;
            if (popupTimeLeft <= 10) {
                timerDisplay.classList.add('urgent');
                popupDiv.classList.add('shake');
                startTickSound();
            }
            if (popupTimeLeft <= 5) {
                timerDisplay.classList.add('critical');
            }
        }
        if (popupTimeLeft <= 0) {
            clearInterval(popupTimer);
            stopTickSound();
            handlePopupResponse(-1, true, shuffledOptions);
        }
    }, 1000);
}

// Handle popup response
function handlePopupResponse(optionIndex, isTimeout = false, shuffledOptions) {
    if (!popupContainer) return;
    const popupFeedback = document.getElementById('popupFeedback');
    const closeButton = document.getElementById('closePopup');
    const popupDiv = popupContainer.querySelector('.popup');
    if (!popupFeedback || !closeButton || !popupDiv) return;

    // Clear the timer and sound
    if (popupTimer) {
        clearInterval(popupTimer);
        popupTimer = null;
    }
    stopTickSound();

    let isCorrect = false;
    let selectedText = 'No response (timeout)';
    let scoreChange = -2;

    if (!isTimeout) {
        const selectedOption = shuffledOptions[optionIndex];
        isCorrect = selectedOption.correct;
        selectedText = selectedOption.text;
        scoreChange = isCorrect ? 1 : -2;
    }

    if (isCorrect) {
        score++;
        scoreValue.classList.add('flash-positive');
        setTimeout(() => scoreValue.classList.remove('flash-positive'), 500);
    } else {
        score = Math.max(0, score - 2);
        scoreValue.classList.add('flash-negative');
        setTimeout(() => scoreValue.classList.remove('flash-negative'), 500);
    }
    scoreValue.textContent = score;

    popupFeedback.innerHTML = isTimeout ? 
        `Out of time! Critical alert ignored! -2 points. ${selectedPopup.feedback.incorrect}` : 
        (isCorrect ? `${selectedPopup.feedback.correct} (+1 point)` : 
                    `${selectedPopup.feedback.incorrect} (-2 points)`);
    popupFeedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    popupFeedback.style.display = 'block';
    closeButton.style.display = 'block';
    popupContainer.querySelectorAll('.option-btn').forEach(button => {
        button.disabled = true; // Disable buttons after selection
    });

    // Remove shake animation if got input
    popupDiv.classList.remove('shake');
    currentAttemptHistory.push({
        attempt: attemptNumber,
        question: selectedPopup.question,
        answer: selectedText,
        correct: isCorrect,
        feedback: isTimeout ? `Out of time! Critical alert ignored! -2 points. ${selectedPopup.feedback.incorrect}` : 
            (isCorrect ? `${selectedPopup.feedback.correct} (+1 point)` : 
                        `${selectedPopup.feedback.incorrect} (-2 points)`),
        scoreChange: scoreChange
    });
    closeButton.addEventListener('click', () => {
        popupContainer.style.display = 'none';
        if (currentScenarioIndex < selectedScenarios.length) {
            loadScenario();
        } else {
            completeGame();
        }
    }, { once: true });
}

function renderLearningCurve() {
    const canvas = document.createElement('canvas');
    canvas.id = 'learningCurveGraph';
    const container = document.createElement('div');
    container.id = 'learningCurveContainer';
    container.appendChild(canvas);

    // Graph inline styles here
    container.style.margin = '30px auto';
    container.style.width = '100%';
    container.style.maxWidth = '800px';
    container.style.maxHeight = '400px';
    container.style.height = '350px';
    container.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
    container.style.padding = '20px';
    container.style.borderRadius = '12px';
    container.style.border = '2px solid #0f0';
    container.style.boxShadow = '0 4px 20px rgba(0,255,0,0.2), inset 0 0 10px rgba(0,255,0,0.1)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // Create the graph and attempt with colors
    const baseColors = [
        'rgba(0,255,0,0.2)',
        'rgba(0,255,0,0.3)',
        'rgba(0,255,0,0.4)',
        'rgba(0,255,0,0.5)',
        'rgba(0,255,0,0.6)',
    ];
    const highlightColor = 'rgba(0,255,0,1)';

    const datasets = [];
    for (let i = 1; i <= attemptNumber; i++) {
        const attemptHistory = i === attemptNumber ? currentAttemptHistory : questionHistory.filter(q => q.attempt === i);
        const scores = [];
        let currentScore = 0;
        attemptHistory.forEach((item, index) => {
            if (item.scoreChange !== undefined) {
                currentScore += item.scoreChange; 
            } else {
                currentScore += item.correct ? 1 : 0;
            }
            scores.push(Math.max(0, currentScore));
        });

        datasets.push({
            label: `Attempt ${i}`,
            data: scores,
            borderColor: i === attemptNumber ? highlightColor : baseColors[(i - 1) % baseColors.length],
            backgroundColor: i === attemptNumber ? 'rgba(0,255,0,0.15)' : baseColors[(i - 1) % baseColors.length],
            fill: true,
            tension: 0.4,
            pointBackgroundColor: i === attemptNumber ? highlightColor : baseColors[(i - 1) % baseColors.length],
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: highlightColor,
            pointHoverBorderColor: '#fff'
        });
    }

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: QUESTIONS_PER_GAME + 2 }, (_, i) => `Q${i + 1}`),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: maxScores[selectedDifficulty] || 15,
                    title: { display: true, text: 'Score', color: '#e0e0e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: {
                        color: '#e0e0e0',
                        stepSize: 1,
                        callback: function(value) {
                            if (Number.isInteger(value)) return value;
                        }
                    }
                },
                x: {
                    title: { display: true, text: 'Question/Popup Number', color: '#e0e0e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#e0e0e0' }
                }
            },
            plugins: {
                legend: { labels: { color: '#e0e0e0' } }
            }
        }
    });

    return container;
}

function renderQuestionHistory(questionHistoryContainer) {
    if (!questionHistoryContainer) return;
    questionHistoryContainer.innerHTML = ''; // Clear attempts existing content

    const historyContent = document.createElement('div');
    historyContent.id = 'historyContent';
    questionHistoryContainer.appendChild(historyContent);

    // Navigation buttons
    const navButtons = document.createElement('div');
    navButtons.className = 'nav-buttons';
    
    const backButton = document.createElement('button');
    backButton.className = 'nav-button';
    backButton.textContent = 'Previous Attempt';
    backButton.addEventListener('click', () => changeAttempt(-1));
    
    const forwardButton = document.createElement('button');
    forwardButton.className = 'nav-button';
    forwardButton.textContent = 'Next Attempt';
    forwardButton.addEventListener('click', () => changeAttempt(1));
    
    navButtons.appendChild(backButton);
    navButtons.appendChild(forwardButton);
    questionHistoryContainer.appendChild(navButtons);

    updateHistoryContent();
    updateButtonStates();
}

function updateHistoryContent() {
    const historyContent = document.getElementById('historyContent');
    if (!historyContent) return;

    const attemptHistory = currentAttemptView === attemptNumber ? currentAttemptHistory : questionHistory.filter(q => q.attempt === currentAttemptView);
    
    historyContent.innerHTML = attemptHistory.length ? '' : '<div>No questions answered yet for this attempt.</div>';
    attemptHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-question">Q${index + 1}: ${item.question}</div>
            <div class="history-answer">Your Answer: ${item.answer}</div>
            <div class="history-result ${item.correct ? 'correct' : 'incorrect'}">
                ${item.correct ? 'Correct' : 'Incorrect'}: ${item.feedback}
            </div>
        `;
        historyContent.appendChild(historyItem);
    });
}

function changeAttempt(direction) {
    const maxAttempt = attemptNumber;
    currentAttemptView = Math.max(1, Math.min(currentAttemptView + direction, maxAttempt));
    updateHistoryContent();
    updateButtonStates();

    // Scroll to top of history content
    const historyContainer = document.getElementById('questionHistoryContainer');
    if (historyContainer) {
        historyContainer.scrollTop = 0;
    }
}

function updateButtonStates() {
    const backButton = document.querySelector('.nav-button:nth-child(1)');
    const forwardButton = document.querySelector('.nav-button:nth-child(2)');
    const maxAttempt = attemptNumber;
    if (backButton) backButton.disabled = currentAttemptView <= 1;
    if (forwardButton) forwardButton.disabled = currentAttemptView >= maxAttempt;
}

// Submit a score to the leaderboard
function submitScoreToLeaderboard(name, score, difficulty) {
    db.collection("leaderboard").add({
        name: name,
        score: score,
        difficulty: difficulty,
        timestamp: Date.now()
    })
    .then(() => {
        loadLeaderboard(difficulty);
    })
    .catch((error) => {
        console.error("Error submitting score: ", error);
    });
}

// Load and display the top 10 leaderboard entries for a specific difficulty
function loadLeaderboard(difficulty = "easy") {
    const leaderboardList = document.getElementById("leaderboardList");
    if (!leaderboardList) {
        console.log("leaderboardList element not found");
        return;
    }
    leaderboardList.innerHTML = "<div>Loading...</div>";
    let rank = 1;

    db.collection("leaderboard")
      .where("difficulty", "==", difficulty)
      .orderBy("score", "desc")
      .orderBy("timestamp", "asc")
      .limit(10)
      .get()
      .then((querySnapshot) => {
          leaderboardList.innerHTML = "";
          if (querySnapshot.empty) {
              leaderboardList.innerHTML = "<div>No scores for this difficulty yet.</div>";
              return;
          }
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              const maxScore = maxScores[data.difficulty] || 15;
              const entry = document.createElement("div");
              entry.className = "leaderboard-entry" + (rank <= 3 ? ` top${rank}` : "");
              entry.innerHTML = `
                  <span class="rank">#${rank}</span>
                  <span class="name">${data.name}</span>
                  <span class="score">${data.score}/${maxScore}</span>
              `;
              leaderboardList.appendChild(entry);
              rank++;
          });
      })
      .catch((error) => {
          console.error("Leaderboard query failed:", error.message);
          leaderboardList.innerHTML = "<div>Error loading leaderboard.</div>";
      });
}

// Show/hide leaderboard
function showLeaderboard() {
    const sidebar = document.getElementById('leaderboardSidebar');
    if (sidebar) {
        sidebar.style.display = 'flex';
        loadLeaderboard(selectedDifficulty || 'easy', 'normal', 'hard');
    }
}

function hideLeaderboard() {
    const sidebar = document.getElementById('leaderboardSidebar');
    if (sidebar) sidebar.style.display = 'none';
}

// Add tab event listeners
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const difficulty = this.dataset.difficulty;
            loadLeaderboard(difficulty);
        });
    });
    const hideBtn = document.getElementById('hideLeaderboardBtn');
    if (hideBtn) {
        hideBtn.addEventListener('click', hideLeaderboard);
    }
    // Initialize leaderboard with 'easy' on load
    loadLeaderboard('easy');
});

// Complete the game and show final score, badge, and history
function completeGame() {
    if (!gameSection || !gameCompleted || !finalScore || !badgeContainer) return;
    gameSection.style.display = 'none';
    gameCompleted.style.display = 'block';
    questionHistory = questionHistory.concat(currentAttemptHistory); // Save current attempt
    const percentage = (score / maxScores[selectedDifficulty]) * 100;
    finalScore.innerHTML = `
        <p>Your score: ${score}/${maxScores[selectedDifficulty]} (${percentage.toFixed(0)}%)</p>
        <p>You answered questions on: ${[...new Set(selectedScenarios.map(s => s.category))].map(cat => 
            cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')}</p>
    `;
    let badgeTitle, badgeImage;
    if (percentage >= 90) {
        badgeTitle = "Cybersecurity Expert";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#0f0;margin:0 auto;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,255,0,0.7)"><div style="font-size:40px">🔒</div></div>`;
    } else if (percentage >= 70) {
        badgeTitle = "Security Defender";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#99ff99;margin:0 auto;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(0,255,0,0.5)"><div style="font-size:40px">🛡️</div></div>`;
    } else if (percentage >= 50) {
        badgeTitle = "Security Apprentice";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#ccffcc;margin:0 auto;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(0,255,0,0.3)"><div style="font-size:40px">🔐</div></div>`;
    } else {
        badgeTitle = "Security Novice";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#e0e0e0;margin:0 auto;display:flex;align-items:center;justify-content:center;"><div style="font-size:40px">🔓</div></div>`;
    }
    badgeContainer.innerHTML = `
        ${badgeImage}
        <h4 class="glow-effect">${badgeTitle}</h4>
    `;
    const container = gameCompleted.querySelector('.container');
    if (!container) return;
    const playAgainBtn = container.querySelector('#restartButton');

    // Submit score to leaderboard
    const playerName = playerNameInput.value || "Anonymous";
    submitScoreToLeaderboard(playerName, score, selectedDifficulty);
    showLeaderboard();

    // Remove old graph/history if present
    const oldCurve = container.querySelector('#learningCurveContainer');
    if (oldCurve) oldCurve.remove();
    const oldHistory = container.querySelector('#questionHistoryContainer');
    if (oldHistory) oldHistory.remove();

    // Update current attempt view
    currentAttemptView = attemptNumber;

    // Insert the graph first, then the question history
    if (attemptNumber >= 1) {
        const learningCurveContainer = renderLearningCurve();
        container.insertBefore(learningCurveContainer, playAgainBtn);
    }
    const questionHistoryContainer = document.createElement('div');
    questionHistoryContainer.id = 'questionHistoryContainer';

    // Style the question history container
    questionHistoryContainer.style.marginTop = '60px';
    questionHistoryContainer.style.width = '100%';
    questionHistoryContainer.style.maxWidth = '800px';
    questionHistoryContainer.style.maxHeight = '400px';
    questionHistoryContainer.style.overflowY = 'scroll';
    questionHistoryContainer.style.background = 'linear-gradient(135deg, #18182a 80%, #23234a 100%)';
    questionHistoryContainer.style.padding = '50px 20px 50px 20px';
    questionHistoryContainer.style.borderRadius = '40px';
    questionHistoryContainer.style.border = '2px solid #0f0';
    questionHistoryContainer.style.boxShadow = '0 0 18px 2px #0f08, 0 0 0 2px #0f0 inset';
    questionHistoryContainer.style.color = '#e0e0e0';
    questionHistoryContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    container.insertBefore(questionHistoryContainer, playAgainBtn);
    renderQuestionHistory(questionHistoryContainer);
}

// Scenarios data embedded directly in the script for simplicity
const scenariosDataEmbedded = {
    "scenarios": [
        {
        "id": 1,
        "question": "You receive an email claiming to be from your school, asking you to click a link to verify your account/update your details. The email looks closely similar like this. What should you do?",
        "image": "https://www.imperva.com/learn/wp-content/uploads/sites/13/2019/01/phishing-attack-email-example.png",
        "options": [
            { "text": "Click the link and enter your details", "correct": false },
            { "text": "Ignore the email and contact the school to get more information directly", "correct": true },
            { "text": "Reply to the email for more information", "correct": false },
            { "text": "Forward the email to your friends", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! This is a phishing attempt. Always verify by contacting the organization directly.",
            "incorrect": "That's not safe. This is likely phishing. Ignore the email and contact your school directly."
        },
        "category": "Phishing Awareness",
        "difficulty": "easy"
    },
    {
        "id": 2,
        "question": "You get a text message saying your bank account has been locked and you need to click a link to unlock it. What should you do?",
        "image": "https://www.mailguard.com.au/hs-fs/hubfs/NAB_230221.png?width=953&name=NAB_230221.png",
        "options": [
            { "text": "Click the link and follow the instructions", "correct": false },
            { "text": "Call the bank using the number on your bank card", "correct": true },
            { "text": "Reply to the text to ask for more information", "correct": false },
            { "text": "Ignore the message", "correct": false }
        ],
        "feedback": {
            "correct": "Good choice! Verify through official channels to avoid phishing.",
            "incorrect": "That's unsafe. Texts can be phishing attempts; call your bank to confirm."
        },
        "category": "Phishing Awareness",
        "difficulty": "easy"
    },
    {
        "id": 3,
        "question": "Your friend shares a link on social media to a website offering free gift cards. The website looks legitimate, and your friend has already claimed one. Should you click the link?",
        "image": null,
        "options": [
            { "text": "Yes, since your friend already did it and it's free", "correct": false },
            { "text": "No, because it could be a phishing scam", "correct": true },
            { "text": "Only if the website has a padlock icon in the address bar", "correct": false },
            { "text": "Only if you can verify the website's authenticity first", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Even trusted friends can share scams unknowingly.",
            "incorrect": "Risky move. This could be a phishing scam; avoid clicking unsolicited links."
        },
        "category": "Phishing Awareness",
        "difficulty": "easy"
    },
    {
        "id": 4,
        "question": "Which of the following is NOT a good practice for password security?",
        "image": null,
        "options": [
            { "text": "Using a unique password for each account", "correct": false },
            { "text": "Including a mix of characters in your password", "correct": false },
            { "text": "Sharing your password with a trusted friend for emergencies", "correct": true },
            { "text": "Using a password manager to store your passwords", "correct": false }
        ],
        "feedback": {
            "correct": "Right! Never share passwords, even with trusted friends.",
            "incorrect": "That's a mistake. Sharing passwords is a security risk, even in emergencies."
        },
        "category": "Password Security",
        "difficulty": "easy"
    },
    {
        "id": 5,
        "question": "Which password is the strongest?",
        "image": null,
        "options": [
            { "text": "Password123", "correct": false },
            { "text": "LetMeIn", "correct": false },
            { "text": "CorrectHorseBatteryStaple", "correct": true },
            { "text": "12345678", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Longer passphrases like this are harder to crack.",
            "incorrect": "Not strong enough. Try a longer passphrase for better security."
        },
        "category": "Password Security",
        "difficulty": "easy"
    },
    {
        "id": 6,
        "question": "You are setting up a new account and the website requires a password with at least 8 characters, including numbers and special characters. Which of the following would be a good password?",
        "image": null,
        "options": [
            { "text": "password1", "correct": false },
            { "text": "12345678", "correct": false },
            { "text": "!SecureP@ss", "correct": true },
            { "text": "LetMeIn2023", "correct": false }
        ],
        "feedback": {
            "correct": "Good choice! This meets all the security requirements.",
            "incorrect": "That's weak. Use a mix of characters, numbers, and special symbols."
        },
        "category": "Password Security",
        "difficulty": "easy"
    },
    {
        "id": 7,
        "question": "You are downloading a file from a website, and the browser shows a warning that the site might be unsafe. What should you do?",
        "image": null,
        "options": [
            { "text": "Proceed with the download since you trust the website", "correct": false },
            { "text": "Cancel the download and find another source", "correct": true },
            { "text": "Scan the file with antivirus software after downloading", "correct": false },
            { "text": "Both B and C", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Avoid downloads from warned sites to stay safe.",
            "incorrect": "Risky. Cancel the download and find a trusted source instead."
        },
        "category": "Safe Browsing and Downloading",
        "difficulty": "easy"
    },
    {
        "id": 8,
        "question": "You need to download a popular software. Which source is the safest?",
        "image": null,
        "options": [
            { "text": "The official website of the software developer", "correct": true },
            { "text": "A file-sharing website that offers the software for free", "correct": false },
            { "text": "An email attachment from a friend who uses the software", "correct": false },
            { "text": "A link found on a forum discussing the software", "correct": false }
        ],
        "feedback": {
            "correct": "Right! Official sources are the safest to avoid malware.",
            "incorrect": "Unsafe choice. Stick to the official website for downloads."
        },
        "category": "Safe Browsing and Downloading",
        "difficulty": "easy"
    },
    {
        "id": 9,
        "question": "You receive an email with an attachment from your boss, asking you to open it urgently. You weren’t expecting any attachment. What should you do?",
        "image": null,
        "options": [
            { "text": "Open the attachment immediately since it’s from your boss", "correct": false },
            { "text": "Reply to the email asking for more details", "correct": false },
            { "text": "Call your boss to confirm if they sent the attachment", "correct": true },
            { "text": "Delete the email without opening the attachment", "correct": false }
        ],
        "feedback": {
            "correct": "Good move! Verify unexpected attachments to avoid phishing.",
            "incorrect": "Risky. Always confirm with your boss directly first."
        },
        "category": "Safe Browsing and Downloading",
        "difficulty": "easy"
    },
    {
        "id": 10,
        "question": "What is the primary benefit of using Two-Factor Authentication (2FA)?",
        "image": null,
        "options": [
            { "text": "It makes your password stronger", "correct": false },
            { "text": "It adds an extra layer of security by requiring a second form of verification", "correct": true },
            { "text": "It allows you to log in from multiple devices simultaneously", "correct": false },
            { "text": "It automatically logs you out after a period of inactivity", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! 2FA adds an extra security step.",
            "incorrect": "Not quite. 2FA is about adding a second verification, not strengthening passwords."
        },
        "category": "Multi-Factor Authentication (MFA)",
        "difficulty": "easy"
    },
    {
        "id": 11,
        "question": "Which of the following is an example of two-factor authentication?",
        "image": null,
        "options": [
            { "text": "Using a strong password and changing it regularly", "correct": false },
            { "text": "Using a password and a fingerprint scan", "correct": true },
            { "text": "Using two different passwords for the same account", "correct": false },
            { "text": "Using a password and a security question", "correct": false }
        ],
        "feedback": {
            "correct": "Right! This uses two different factors (something you know and are).",
            "incorrect": "That’s not 2FA. It needs two distinct verification methods."
        },
        "category": "Multi-Factor Authentication (MFA)",
        "difficulty": "easy"
    },
    {
        "id": 12,
        "question": "You have enabled 2FA on your email account using an authenticator app. What happens if you lose your phone?",
        "image": null,
        "options": [
            { "text": "You can still log in with just your password", "correct": false },
            { "text": "You need to contact the email provider to disable 2FA", "correct": false },
            { "text": "You can use a backup code if you have set one up", "correct": true },
            { "text": "Your account will be locked permanently", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Backup codes are a lifesaver if set up.",
            "incorrect": "Not quite. Check if you have backup codes or contact support."
        },
        "category": "Multi-Factor Authentication (MFA)",
        "difficulty": "easy"
    },
    {
        "id": 13,
        "question": "A stranger calls you claiming to be from your bank and asks for your account details to “verify” a transaction. What should you do?",
        "image": null,
        "options": [
            { "text": "Provide the details to help resolve the issue", "correct": false },
            { "text": "Ask the caller for their employee ID and then provide the details", "correct": false },
            { "text": "Hang up and call the bank’s official number to verify the request", "correct": true },
            { "text": "Tell the caller you’ll call them back and then do so", "correct": false }
        ],
        "feedback": {
            "correct": "Good call! Verify through official channels to avoid scams.",
            "incorrect": "Risky. Hang up and contact the bank directly using their official number."
        },
        "category": "Social Engineering",
        "difficulty": "easy"
    },
    {
        "id": 14,
        "question": "A person calls you claiming to be from tech support and says there’s a problem with your computer. They ask you to remote access your computer to fix it. What should you do?",
        "image": null,
        "options": [
            { "text": "Allow them to access your computer to fix the issue", "correct": false },
            { "text": "Ask for their company’s name and call them back", "correct": false },
            { "text": "Politely decline and hang up", "correct": true },
            { "text": "Ask them to send an email with more details", "correct": false }
        ],
        "feedback": {
            "correct": "Right! Unsolicited tech support calls are often scams.",
            "incorrect": "Unsafe. Decline and hang up to protect your system."
        },
        "category": "Social Engineering",
        "difficulty": "easy"
    },
    {
        "id": 15,
        "question": "You receive a message on social media from a friend asking for your help with a financial emergency, with a link to transfer money. What should you do?",
        "image": null,
        "options": [
            { "text": "Click the link and transfer the money immediately", "correct": false },
            { "text": "Ask your friend for more details through the same message", "correct": false },
            { "text": "Call your friend using a known phone number to verify", "correct": true },
            { "text": "Ignore the message", "correct": false }
        ],
        "feedback": {
            "correct": "Good move! Verify directly to avoid a compromised account.",
            "incorrect": "Risky. Call your friend to confirm the request."
        },
        "category": "Social Engineering",
        "difficulty": "easy"
    },
    {
        "id": 16,
        "question": "Which of the following is a good practice for securing your home Wi-Fi network?",
        "image": null,
        "options": [
            { "text": "Using a strong, unique password for your Wi-Fi", "correct": true },
            { "text": "Leaving the default password provided by the router manufacturer", "correct": false },
            { "text": "Sharing your Wi-Fi password with neighbors for convenience", "correct": false },
            { "text": "Not updating your router’s firmware", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! A strong, unique password is essential.",
            "incorrect": "Unsafe. Change the default password to secure your network."
        },
        "category": "Network Security",
        "difficulty": "easy"
    },
    {
        "id": 17,
        "question": "What is the purpose of a firewall in network security?",
        "image": null,
        "options": [
            { "text": "To speed up internet connection", "correct": false },
            { "text": "To monitor and control incoming and outgoing network traffic", "correct": true },
            { "text": "To store passwords securely", "correct": false },
            { "text": "To encrypt data transmissions", "correct": false }
        ],
        "feedback": {
            "correct": "Right! Firewalls protect by controlling traffic.",
            "incorrect": "Not quite. A firewall monitors and blocks unauthorized access."
        },
        "category": "Network Security",
        "difficulty": "easy"
    },
    {
        "id": 18,
        "question": "You are setting up a home network. Which of the following is a good security practice?",
        "image": null,
        "options": [
            { "text": "Using WEP encryption for your Wi-Fi", "correct": false },
            { "text": "Disabling the router’s firewall", "correct": false },
            { "text": "Changing the default admin password of your router", "correct": true },
            { "text": "Broadcasting your Wi-Fi network name widely", "correct": false }
        ],
        "feedback": {
            "correct": "Good choice! Changing the default password secures your router.",
            "incorrect": "Risky. Use WPA encryption and change the default password."
        },
        "category": "Network Security",
        "difficulty": "easy"
    },
    {
        "id": 19,
        "question": "Why is it important to keep your software and operating system up to date?",
        "image": null,
        "options": [
            { "text": "To get new features and improvements", "correct": false },
            { "text": "To fix bugs and improve performance", "correct": false },
            { "text": "To patch security vulnerabilities", "correct": false },
            { "text": "All of the above", "correct": true }
        ],
        "feedback": {
            "correct": "Correct! Updates provide security, fixes, and features.",
            "incorrect": "Not fully right. All options are benefits, including security patches."
        },
        "category": "Software Updates",
        "difficulty": "easy"
    },
    {
        "id": 20,
        "question": "You receive a notification that there is a critical security update for your operating system. What should you do?",
        "image": null,
        "options": [
            { "text": "Ignore it, as updates can cause problems", "correct": false },
            { "text": "Install it immediately", "correct": true },
            { "text": "Wait until you have time to back up your data first", "correct": false },
            { "text": "Check online forums to see if others have issues with the update", "correct": false }
        ],
        "feedback": {
            "correct": "Right! Install critical updates promptly for security.",
            "incorrect": "Risky delay. Install it immediately to protect your system."
        },
        "category": "Software Updates",
        "difficulty": "easy"
    },
    {
        "id": 21,
        "question": "What should you do if a website shows a 'Not Secure' warning?",
        "options": [
            { "text": "Continue and enter your details", "correct": false },
            { "text": "Leave the site immediately", "correct": true },
            { "text": "Refresh the page", "correct": false },
            { "text": "Ask a friend", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! 'Not Secure' means data isn’t protected. Leave the site.",
            "incorrect": "That's risky. Avoid sites with security warnings."
        },
        "category": "Safe Browsing",
        "difficulty": "easy"
    },
    {
        "id": 22,
        "question": "Is it safe to leave your phone unlocked in public?",
        "options": [
            { "text": "Yes, for a short time", "correct": false },
            { "text": "No, always lock it", "correct": true },
            { "text": "Yes, if it’s with you", "correct": false },
            { "text": "No, but turn it off", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Locking your phone prevents unauthorized access.",
            "incorrect": "That's risky. Always lock your phone in public."
        },
        "category": "Physical Security",
        "difficulty": "easy"
    },
    {
        "id": 23,
        "question": "Should you accept a friend request from an unknown person?",
        "options": [
            { "text": "Yes, if they have many friends", "correct": false },
            { "text": "No, verify their identity", "correct": true },
            { "text": "Yes, if they message first", "correct": false },
            { "text": "No, block them", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Unknown requests may be scams. Verify first.",
            "incorrect": "That's risky. Check the person’s identity before accepting."
        },
        "category": "Social Media Safety",
        "difficulty": "easy"
    },
    {
        "id": 24,
        "question": "What should you do if you get a suspicious text about a package delivery?",
        "options": [
            { "text": "Click the tracking link", "correct": false },
            { "text": "Contact the courier directly", "correct": true },
            { "text": "Reply to the text", "correct": false },
            { "text": "Share it with others", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Suspicious texts are often scams. Verify with the courier.",
            "incorrect": "That's risky. Avoid clicking links in suspicious texts."
        },
        "category": "Phishing Awareness",
        "difficulty": "easy"
    },
    {
        "id": 25,
        "question": "Is it safe to download a game from a random website?",
        "options": [
            { "text": "Yes, if it’s free", "correct": false },
            { "text": "No, use official app stores", "correct": true },
            { "text": "Yes, if it has good reviews", "correct": false },
            { "text": "No, but try it anyway", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Random sites may contain malware. Use app stores.",
            "incorrect": "That's risky. Stick to official download sources."
        },
        "category": "Safe Downloading",
        "difficulty": "easy"
    },
    {
        "id": 26,
        "question": "Should you post your vacation plans on social media?",
        "options": [
            { "text": "Yes, to share with friends", "correct": false },
            { "text": "No, wait until you return", "correct": true },
            { "text": "Yes, with privacy settings", "correct": false },
            { "text": "No, but tell family", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Posting plans can attract burglars. Wait until you’re back.",
            "incorrect": "That's risky. Avoid sharing plans while away."
        },
        "category": "Social Media Safety",
        "difficulty": "easy"
    },
    {
        "id": 27,
        "question": "What should you do if an email claims your account will be deleted?",
        "options": [
            { "text": "Click the link to save it", "correct": false },
            { "text": "Log in directly to check", "correct": true },
            { "text": "Reply with your login details", "correct": false },
            { "text": "Ignore it completely", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Verify through the official site, not email links.",
            "incorrect": "That's a scam. Check your account directly."
        },
        "category": "Phishing Awareness",
        "difficulty": "easy"
    },
    {
        "id": 28,
        "question": "Is it safe to charge your phone at a public charging station?",
        "options": [
            { "text": "Yes, it’s convenient", "correct": false },
            { "text": "No, use your own charger", "correct": true },
            { "text": "Yes, if it’s in an airport", "correct": false },
            { "text": "No, but check the cable", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Public stations can steal data. Use your own charger.",
            "incorrect": "That's risky. Avoid public charging stations."
        },
        "category": "Physical Security",
        "difficulty": "easy"
    },
    {
        "id": 29,
        "question": "Should you check the sender’s email address before replying?",
        "options": [
            { "text": "No, if it looks familiar", "correct": false },
            { "text": "Yes, to avoid scams", "correct": true },
            { "text": "No, but call them", "correct": false },
            { "text": "Yes, if it’s urgent", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Fake sender addresses are common in scams.",
            "incorrect": "That's risky. Always check the sender’s address."
        },
        "category": "Phishing Awareness",
        "difficulty": "easy"
    },
    {
        "id": 30,
        "question": "Should you click a link in a social media message from a friend?",
        "options": [
            { "text": "Yes, if it’s from a friend", "correct": false },
            { "text": "No, verify with the friend first", "correct": true },
            { "text": "Yes, if it looks fun", "correct": false },
            { "text": "No, delete it immediately", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Accounts can be hacked. Verify with your friend.",
            "incorrect": "That's risky. Confirm with your friend before clicking."
        },
        "category": "Phishing Awareness",
        "difficulty": "easy"
        },
        {
        "id": 31,
        "question": "What is a common indicator of a phishing email?",
        "options": [
            { "text": "It comes from a known colleague", "correct": false },
            { "text": "It contains urgent language demanding immediate action", "correct": true },
            { "text": "It has no attachments", "correct": false },
            { "text": "It is sent during regular business hours", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Phishing emails often use urgent language to pressure you into acting quickly.",
            "incorrect": "Phishing emails typically create a sense of urgency to trick you into providing sensitive information."
        },
        "category": "Phishing Awareness",
        "difficulty": "normal"
    },
    {
        "id": 32,
        "question": "You receive an email with a link to reset your account, but you didn’t request a reset. What should you do?",
        "options": [
            { "text": "Click the link to check it out", "correct": false },
            { "text": "Contact the service provider using official contact details", "correct": true },
            { "text": "Reply to the email to confirm", "correct": false },
            { "text": "Forward it to your IT team", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Always verify unexpected requests through official channels.",
            "incorrect": "Clicking unverified links can lead to phishing attacks. Use official contact methods to confirm."
        },
        "category": "Phishing Awareness",
        "difficulty": "normal"
    },
    {
        "id": 33,
        "question": "What is a key characteristic of a strong password?",
        "options": [
            { "text": "It includes your birthdate", "correct": false },
            { "text": "It is at least 12 characters with a mix of letters, numbers, and symbols", "correct": true },
            { "text": "It is a single word from the dictionary", "correct": false },
            { "text": "It is the same as your username", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! A strong password is long and complex, making it harder to crack.",
            "incorrect": "Strong passwords should be long, complex, and avoid personal or predictable information."
        },
        "category": "Password Security",
        "difficulty": "normal"
    },
    {
        "id": 34,
        "question": "Why should you avoid reusing passwords across multiple accounts?",
        "options": [
            { "text": "It makes logging in slower", "correct": false },
            { "text": "If one account is compromised, others are at risk", "correct": true },
            { "text": "It confuses password managers", "correct": false },
            { "text": "It’s against company policy only", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Reusing passwords increases the risk of multiple accounts being compromised.",
            "incorrect": "Password reuse can lead to widespread account breaches if one is hacked."
        },
        "category": "Password Security",
        "difficulty": "normal"
    },
    {
        "id": 35,
        "question": "What is the safest way to download software?",
        "options": [
            { "text": "From any website offering free downloads", "correct": false },
            { "text": "From the official website or trusted app store", "correct": true },
            { "text": "From email attachments", "correct": false },
            { "text": "From social media links", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Always download software from official or trusted sources to avoid malware.",
            "incorrect": "Downloading from unverified sources can introduce malware to your device."
        },
        "category": "Safe Browsing and Download",
        "difficulty": "normal"
    },
    {
        "id": 36,
        "question": "What does a website’s 'https' prefix indicate?",
        "options": [
            { "text": "The website is new", "correct": false },
            { "text": "The website uses encryption for secure communication", "correct": true },
            { "text": "The website is free to use", "correct": false },
            { "text": "The website is faster", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! 'https' means the website uses encryption to protect your data.",
            "incorrect": "Without 'https,' data sent to the website may not be secure."
        },
        "category": "Safe Browsing and Download",
        "difficulty": "normal"
    },
    {
        "id": 37,
        "question": "What is the purpose of Multi-Factor Authentication (MFA)?",
        "options": [
            { "text": "To make logging in faster", "correct": false },
            { "text": "To add an extra layer of security beyond a password", "correct": true },
            { "text": "To store your passwords securely", "correct": false },
            { "text": "To encrypt your emails", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! MFA adds security by requiring multiple forms of verification.",
            "incorrect": "MFA enhances security by requiring more than just a password to log in."
        },
        "category": "MFA",
        "difficulty": "normal"
    },
    {
        "id": 38,
        "question": "Which of these is an example of an MFA factor?",
        "options": [
            { "text": "Your favorite color", "correct": false },
            { "text": "A code sent to your phone", "correct": true },
            { "text": "Your username", "correct": false },
            { "text": "Your email address", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! A code sent to your phone is a common second factor in MFA.",
            "incorrect": "MFA factors include something you know, have, or are, like a phone code."
        },
        "category": "MFA",
        "difficulty": "normal"
    },
    {
        "id": 39,
        "question": "What is social engineering in the context of cybersecurity?",
        "options": [
            { "text": "Building secure networks", "correct": false },
            { "text": "Manipulating people to gain confidential information", "correct": true },
            { "text": "Writing secure code", "correct": false },
            { "text": "Installing antivirus software", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Social engineering tricks people into revealing sensitive information.",
            "incorrect": "Social engineering exploits human psychology, not technical systems."
        },
        "category": "Social Engineering",
        "difficulty": "normal"
    },
    {
        "id": 40,
        "question": "A stranger calls claiming to be from your company’s IT department and asks for your login details. What should you do?",
        "options": [
            { "text": "Provide the details to help them", "correct": false },
            { "text": "Verify their identity through official channels", "correct": true },
            { "text": "Hang up and ignore the call", "correct": false },
            { "text": "Give partial information to test them", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Always verify unexpected requests through official channels.",
            "incorrect": "Never share login details without verifying the caller’s identity."
        },
        "category": "Social Engineering",
        "difficulty": "normal"
    },
    {
        "id": 41,
        "question": "What is the primary function of a firewall?",
        "options": [
            { "text": "To scan for viruses", "correct": false },
            { "text": "To monitor and control network traffic", "correct": true },
            { "text": "To encrypt data", "correct": false },
            { "text": "To store passwords", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! A firewall controls network traffic to enhance security.",
            "incorrect": "Firewalls manage network traffic, not virus scanning or encryption."
        },
        "category": "Network Security",
        "difficulty": "normal"
    },
    {
        "id": 42,
        "question": "How can you secure your home Wi-Fi network?",
        "options": [
            { "text": "Use the default router password", "correct": false },
            { "text": "Change the default password and enable WPA3 encryption", "correct": true },
            { "text": "Share the password with neighbors", "correct": false },
            { "text": "Disable encryption for faster speeds", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Changing the default password and using strong encryption secures your Wi-Fi.",
            "incorrect": "Default passwords and weak encryption make your network vulnerable."
        },
        "category": "Network Security",
        "difficulty": "normal"
    },
    {
        "id": 43,
        "question": "Why are software updates important for cybersecurity?",
        "options": [
            { "text": "They only add new features", "correct": false },
            { "text": "They patch security vulnerabilities", "correct": true },
            { "text": "They make software run slower", "correct": false },
            { "text": "They are optional for security", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Updates fix vulnerabilities that hackers could exploit.",
            "incorrect": "Software updates are critical for patching security holes, not just adding features."
        },
        "category": "Software Updates",
        "difficulty": "normal"
    },
    {
        "id": 44,
        "question": "What should you do when you receive a software update notification?",
        "options": [
            { "text": "Ignore it to avoid interruptions", "correct": false },
            { "text": "Install it as soon as possible", "correct": true },
            { "text": "Delete the notification", "correct": false },
            { "text": "Wait for a month before updating", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Prompt updates help protect against known vulnerabilities.",
            "incorrect": "Delaying updates leaves your system vulnerable to attacks."
        },
        "category": "Software Updates",
        "difficulty": "normal"
    },
    {
        "id": 45,
        "question": "What is malware?",
        "options": [
            { "text": "A type of hardware", "correct": false },
            { "text": "Malicious software designed to harm devices or networks", "correct": true },
            { "text": "A network security protocol", "correct": false },
            { "text": "A password management tool", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Malware is harmful software that can damage or steal data.",
            "incorrect": "Malware is malicious software, not hardware or a security tool."
        },
        "category": "Malware Threats",
        "difficulty": "normal"
    },
    {
        "id": 46,
        "question": "How can you protect your device from malware?",
        "options": [
            { "text": "Download files from any source", "correct": false },
            { "text": "Use antivirus software and avoid suspicious links", "correct": true },
            { "text": "Share your device with others", "correct": false },
            { "text": "Disable your firewall", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Antivirus software and cautious browsing help prevent malware infections.",
            "incorrect": "Malware protection requires active security measures like antivirus and safe browsing."
        },
        "category": "Malware Threats",
        "difficulty": "normal"
    },
    {
        "id": 47,
        "question": "What should you do if an email claims you’ve won a prize but asks for personal details?",
        "options": [
            { "text": "Provide the details to claim the prize", "correct": false },
            { "text": "Delete the email without responding", "correct": true },
            { "text": "Reply to ask for more information", "correct": false },
            { "text": "Share the email on social media", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Such emails are often phishing scams; delete them immediately.",
            "incorrect": "Providing personal details to unverified sources can lead to identity theft."
        },
        "category": "Phishing Awareness",
        "difficulty": "normal"
    },
    {
        "id": 48,
        "question": "What is a password manager used for?",
        "options": [
            { "text": "To create weak passwords", "correct": false },
            { "text": "To securely store and generate strong passwords", "correct": true },
            { "text": "To share passwords with others", "correct": false },
            { "text": "To encrypt your emails", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Password managers help you create and store strong, unique passwords.",
            "incorrect": "Password managers are for secure password management, not sharing or encryption."
        },
        "category": "Password Security",
        "difficulty": "normal"
    },
    {
        "id": 49,
        "question": "What should you do if a website prompts you to install a plugin to view content?",
        "options": [
            { "text": "Install it immediately", "correct": false },
            { "text": "Verify the website’s legitimacy first", "correct": true },
            { "text": "Share the link with colleagues", "correct": false },
            { "text": "Ignore the prompt and continue browsing", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Always verify the website before installing anything.",
            "incorrect": "Unverified plugins can contain malware; always check the source."
        },
        "category": "Safe Browsing and Download",
        "difficulty": "normal"
    },
    {
        "id": 50,
        "question": "What is a common social engineering tactic?",
        "options": [
            { "text": "Encrypting data", "correct": false },
            { "text": "Pretending to be a trusted authority to gain access", "correct": true },
            { "text": "Installing software updates", "correct": false },
            { "text": "Using a firewall", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Social engineering often involves impersonation to trick users.",
            "incorrect": "Social engineering manipulates people, not technical systems."
        },
        "category": "Social Engineering",
        "difficulty": "normal"
    },
    {
        "id": 51,
        "question": "You receive an email from your CEO asking for urgent payment of an invoice, but it seems unusual. What should you do?",
        "options": [
            { "text": "Pay the invoice immediately", "correct": false },
            { "text": "Verify the request with the CEO through a known contact method", "correct": true },
            { "text": "Forward the email to accounting", "correct": false },
            { "text": "Reply to the email for clarification", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Always verify unusual requests through trusted channels.",
            "incorrect": "Unverified payment requests could be phishing scams; confirm with the sender directly."
        },
        "category": "Phishing Awareness",
        "difficulty": "normal"
    },
    {
        "id": 52,
        "question": "Your colleague is using the same password for work and personal accounts. What should you advise?",
        "options": [
            { "text": "Continue using the same password if it’s strong", "correct": false },
            { "text": "Use unique passwords for each account", "correct": true },
            { "text": "Share the password with the team", "correct": false },
            { "text": "Write the password down for safekeeping", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Unique passwords reduce the risk of multiple account breaches.",
            "incorrect": "Reusing passwords can compromise multiple accounts if one is hacked."
        },
        "category": "Password Security",
        "difficulty": "normal"
    },
    {
        "id": 53,
        "question": "You click a link and your browser warns that the website is insecure. What should you do?",
        "options": [
            { "text": "Proceed to the website", "correct": false },
            { "text": "Go back to the previous page", "correct": true },
            { "text": "Clear your browser history", "correct": false },
            { "text": "Download content from the site", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Avoid insecure websites to protect your data.",
            "incorrect": "Insecure websites may expose your information to attackers."
        },
        "category": "Safe Browsing and Download",
        "difficulty": "normal"
    },
    {
        "id": 54,
        "question": "You lose your phone, which has your MFA authentication app. What should you do?",
        "options": [
            { "text": "Create a new account", "correct": false },
            { "text": "Use backup codes or contact the service provider", "correct": true },
            { "text": "Wait to recover the phone", "correct": false },
            { "text": "Disable MFA entirely", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Backup codes or provider support can restore access securely.",
            "incorrect": "Disabling MFA or waiting reduces security; use backup methods."
        },
        "category": "MFA",
        "difficulty": "normal"
    },
    {
        "id": 55,
        "question": "A caller claiming to be from the IRS demands immediate payment for taxes. What should you do?",
        "options": [
            { "text": "Pay the amount to avoid trouble", "correct": false },
            { "text": "Verify the claim through the official IRS website", "correct": true },
            { "text": "Provide partial payment details", "correct": false },
            { "text": "Ignore the call completely", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Verify claims through official channels to avoid scams.",
            "incorrect": "Scammers often pose as authorities; always verify through trusted sources."
        },
        "category": "Social Engineering",
        "difficulty": "normal"
    },
    {
        "id": 56,
        "question": "You notice your company’s Wi-Fi is open without a password. What should you do?",
        "options": [
            { "text": "Use it as is for convenience", "correct": false },
            { "text": "Report it to IT for securing", "correct": true },
            { "text": "Set your own password", "correct": false },
            { "text": "Share it with colleagues", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Open Wi-Fi is insecure; report it to IT for proper security measures.",
            "incorrect": "Open networks are vulnerable to attacks; IT should secure it."
        },
        "category": "Network Security",
        "difficulty": "normal"
    },
    {
        "id": 57,
        "question": "Your antivirus software prompts for an update during a busy workday. What should you do?",
        "options": [
            { "text": "Postpone the update indefinitely", "correct": false },
            { "text": "Install the update as soon as feasible", "correct": true },
            { "text": "Turn off the antivirus", "correct": false },
            { "text": "Ignore the prompt", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Updating antivirus software is critical for protection.",
            "incorrect": "Delaying or disabling updates leaves your system vulnerable."
        },
        "category": "Software Updates",
        "difficulty": "normal"
    },
    {
        "id": 58,
        "question": "You receive a pop-up claiming your computer is infected and to click a link to fix it. What should you do?",
        "options": [
            { "text": "Click the link to resolve the issue", "correct": false },
            { "text": "Run a scan with your antivirus software", "correct": true },
            { "text": "Restart your computer", "correct": false },
            { "text": "Share the pop-up with colleagues", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Use trusted antivirus software to check for infections.",
            "incorrect": "Pop-ups claiming infections are often scams; verify with antivirus software."
        },
        "category": "Malware Threats",
        "difficulty": "normal"
    },
    {
        "id": 59,
        "question": "An email from a friend asks for money urgently, but the tone seems off. What should you do?",
        "options": [
            { "text": "Send the money immediately", "correct": false },
            { "text": "Contact your friend through a known channel to verify", "correct": true },
            { "text": "Reply to the email for details", "correct": false },
            { "text": "Ignore the email completely", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Verify unusual requests through trusted communication methods.",
            "incorrect": "The email could be a scam; always confirm with the sender directly."
        },
        "category": "Phishing Awareness",
        "difficulty": "normal"
    },
    {
        "id": 60,
        "question": "You find a sticky note with a password on your desk. What should you do?",
        "options": [
            { "text": "Use it to log into a system", "correct": false },
            { "text": "Report it to your supervisor or IT", "correct": true },
            { "text": "Keep it for future use", "correct": false },
            { "text": "Throw it away", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Report found passwords to prevent unauthorized access.",
            "incorrect": "Using or keeping unknown passwords can compromise security."
        },
        "category": "Password Security",
        "difficulty": "normal"
    },
    {
        "id": 61,
        "question": "What’s a key indicator of a phishing email? The email looks like this.",
        "image": "https://us.norton.com/content/dam/blogs/images/norton/am/phishing-email-examples-02.jpg",
        "options": [
            { "text": "It’s from a known company", "correct": false },
            { "text": "It has spelling or grammar errors", "correct": true },
            { "text": "It uses your name", "correct": false },
            { "text": "It has a professional logo", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Phishing emails often contain spelling or grammar errors.",
            "incorrect": "That's not reliable. Look for spelling or grammar errors as a phishing clue."
        },
        "category": "Phishing Awareness",
        "difficulty": "hard"
    },
    {
        "id": 62,
        "question": "You get a call from 'tech support' claiming your computer has a virus and they need remote access. What do you do?",
        "options": [
            { "text": "Give them remote access to fix it", "correct": false },
            { "text": "Hang up and contact your IT department", "correct": true },
            { "text": "Ask for proof of their identity", "correct": false },
            { "text": "Pay for their service", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! This is likely a scam. Contact IT through official channels.",
            "incorrect": "That's risky. This is likely a scam. Hang up and contact IT directly."
        },
        "category": "Social Engineering",
        "difficulty": "hard"
    },
    {
        "id": 63,
        "question": "What’s the best way to protect sensitive files on your computer?",
        "options": [
            { "text": "Rename files with secret codes", "correct": false },
            { "text": "Use full-disk encryption", "correct": true },
            { "text": "Hide files in obscure folders", "correct": false },
            { "text": "Store them only in the cloud", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Full-disk encryption protects data if your device is lost or stolen.",
            "incorrect": "That's not secure. Use full-disk encryption for the best protection."
        },
        "category": "Data Security",
        "difficulty": "hard"
    },
    {
        "id": 64,
        "question": "A website asks for security questions. What’s the most secure approach?",
        "options": [
            { "text": "Use answers others might know", "correct": false },
            { "text": "Use real, memorable answers", "correct": false },
            { "text": "Use fake answers stored in a password manager", "correct": true },
            { "text": "Use the same answers across sites", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Fake answers stored securely protect against social engineering.",
            "incorrect": "That's not secure. Use fake answers stored in a password manager."
        },
        "category": "Password Security",
        "difficulty": "hard"
    },
    {
        "id": 65,
        "question": "You receive an email with an unexpected attachment from a colleague. What should you do?",
        "options": [
            { "text": "Open it since it’s from a colleague", "correct": false },
            { "text": "Verify with the colleague before opening", "correct": true },
            { "text": "Save it to your computer for later", "correct": false },
            { "text": "Forward it to your team", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Always verify unexpected attachments to avoid malware.",
            "incorrect": "That's risky. Verify with the sender before opening unexpected attachments."
        },
        "category": "Phishing Awareness",
        "difficulty": "hard"
    },
    {
        "id": 66,
        "question": "What’s a risk of using weak encryption for sensitive data?",
        "options": [
            { "text": "It’s slower than strong encryption", "correct": false },
            { "text": "It can be easily cracked by attackers", "correct": true },
            { "text": "It requires more storage space", "correct": false },
            { "text": "It’s not compatible with cloud storage", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Weak encryption can be cracked, exposing sensitive data.",
            "incorrect": "That's not the main risk. Weak encryption is vulnerable to being cracked by attackers."
        },
        "category": "Data Security",
        "difficulty": "hard"
    },
    {
        "id": 67,
        "question": "What’s a sign of a social engineering attack?",
        "options": [
            { "text": "A website with a valid certificate", "correct": false },
            { "text": "An urgent request to share sensitive information", "correct": true },
            { "text": "A software update notification", "correct": false },
            { "text": "A professional email signature", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Urgent requests for sensitive info are a common social engineering tactic.",
            "incorrect": "That's not a reliable sign. Look for urgent requests as a social engineering clue."
        },
        "category": "Social Engineering",
        "difficulty": "hard"
    },
    {
        "id": 68,
        "question": "What’s a benefit of two-factor authentication (2FA)?",
        "options": [
            { "text": "It makes logins faster", "correct": false },
            { "text": "It adds an extra layer of security", "correct": true },
            { "text": "It eliminates the need for passwords", "correct": false },
            { "text": "It simplifies account recovery", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! 2FA adds an extra security layer, making accounts harder to breach.",
            "incorrect": "That's incorrect. 2FA enhances security by requiring a second verification step."
        },
        "category": "Multi-Factor Authentication (MFA)",
        "difficulty": "hard"
    },
    {
        "id": 69,
        "question": "You’re asked to update your password via a link in an email. What should you do?",
        "options": [
            { "text": "Click the link and update your password", "correct": false },
            { "text": "Log in to the official website directly to change your password", "correct": true },
            { "text": "Reply to the email with your current password", "correct": false },
            { "text": "Ignore the email but tell a colleague", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Never use email links for password changes; go directly to the official site.",
            "incorrect": "That's risky. Always go to the official website directly to update your password."
        },
        "category": "Phishing Awareness",
        "difficulty": "hard"
    },
    {
        "id": 70,
        "question": "What’s a risk of using outdated software?",
        "options": [
            { "text": "It may run slower", "correct": false },
            { "text": "It may have unpatched security vulnerabilities", "correct": true },
            { "text": "It’s less user-friendly", "correct": false },
            { "text": "It requires more storage", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Outdated software may have vulnerabilities that attackers can exploit.",
            "incorrect": "That's not the main risk. Outdated software is vulnerable to security exploits."
        },
        "category": "Software Updates",
        "difficulty": "hard"
    },
    {
        "id": 71,
        "question": "What should you do if you suspect your email account is compromised?",
        "options": [
            { "text": "Change your password immediately", "correct": true },
            { "text": "Ignore it if no issues occur", "correct": false },
            { "text": "Share your recovery code with a friend", "correct": false },
            { "text": "Delete all old emails", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Changing your password quickly can secure your account.",
            "incorrect": "That's risky. Act immediately to change your password."
        },
        "category": "Multi-Factor Authentication (MFA)",
        "difficulty": "hard"
    },
    {
        "id": 72,
        "question": "How can you detect a man-in-the-middle attack on public Wi-Fi?",
        "options": [
            { "text": "Check for a strong signal", "correct": false },
            { "text": "Look for unexpected redirects or certificate warnings", "correct": true },
            { "text": "Ensure the Wi-Fi is free", "correct": false },
            { "text": "Ask the café staff", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Redirects or warnings signal a potential attack.",
            "incorrect": "That's not enough. Watch for redirects or certificate issues."
        },
        "category": "Network Security",
        "difficulty": "hard"
    },
    {
        "id": 73,
        "question": "How can you secure your IoT devices at home?",
        "options": [
            { "text": "Leave default settings unchanged", "correct": false },
            { "text": "Change passwords and disable unused features", "correct": true },
            { "text": "Connect all to guest Wi-Fi", "correct": false },
            { "text": "Ignore firmware updates", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Custom passwords and updates secure IoT devices.",
            "incorrect": "That's risky. Secure with strong passwords and updates."
        },
        "category": "Network Security & IoT",
        "difficulty": "hard"
    },
    {
        "id": 74,
        "question": "What’s a sign of a ransomware infection?",
        "options": [
            { "text": "Your computer runs faster", "correct": false },
            { "text": "Files are locked with a ransom note", "correct": true },
            { "text": "A new software update appears", "correct": false },
            { "text": "Your browser crashes", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Locked files with a ransom demand indicate ransomware.",
            "incorrect": "That's not a sign. Look for locked files and ransom notes."
        },
        "category": "Malware Threats",
        "difficulty": "hard"
    },
    {
        "id": 75,
        "question": "What should you do during a data breach at your workplace?",
        "options": [
            { "text": "Continue normal work", "correct": false },
            { "text": "Follow IT’s incident response plan", "correct": true },
            { "text": "Notify customers directly", "correct": false },
            { "text": "Delete affected data", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! IT’s plan ensures a coordinated response.",
            "incorrect": "That's risky. Follow IT’s guidance during a breach."
        },
        "category": "Data Security",
        "difficulty": "hard"
    },
    {
        "id": 76,
        "question": "How can you protect against phishing attacks on your phone?",
        "options": [
            { "text": "Ignore all text messages", "correct": false },
            { "text": "Install anti-phishing apps and verify links", "correct": true },
            { "text": "Click links to test them", "correct": false },
            { "text": "Turn off mobile data", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Anti-phishing tools and caution prevent attacks.",
            "incorrect": "That's risky. Use apps and verify links."
        },
        "category": "Phishing Awareness",
        "difficulty": "hard"
    },
    {
        "id": 77,
        "question": "What’s the best way to handle a suspicious USB found at work?",
        "options": [
            { "text": "Plug it in to check", "correct": false },
            { "text": "Report it to IT for analysis", "correct": true },
            { "text": "Use it on a personal device", "correct": false },
            { "text": "Keep it as a backup", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! IT can safely check for malware.",
            "incorrect": "That's risky. Let IT handle suspicious USBs."
        },
        "category": "Malware Threats & Physical",
        "difficulty": "hard"
    },
    {
        "id": 78,
        "question": "How can you recognize a social engineering attempt via email?",
        "options": [
            { "text": "It offers a free gift", "correct": false },
            { "text": "It creates urgency or fear", "correct": true },
            { "text": "It has a professional logo", "correct": false },
            { "text": "It’s from a friend", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Urgency or fear tactics are common in social engineering.",
            "incorrect": "That's not enough. Look for urgency or fear."
        },
        "category": "Social Engineering",
        "difficulty": "hard"
    },
    {
        "id": 79,
        "question": "What should you do if your credit card is used fraudulently?",
        "options": [
            { "text": "Pay the charges to clear it", "correct": false },
            { "text": "Report it to your bank immediately", "correct": true },
            { "text": "Change your PIN online", "correct": false },
            { "text": "Ignore small amounts", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Quick reporting limits your liability.",
            "incorrect": "That's risky. Report fraud to your bank at once."
        },
        "category": "Phishing Awareness",
        "difficulty": "hard"
    },
    {
        "id": 80,
        "question": "How can you secure data on a cloud storage service?",
        "options": [
            { "text": "Use the default settings", "correct": false },
            { "text": "Enable encryption and two-factor authentication", "correct": true },
            { "text": "Share access with friends", "correct": false },
            { "text": "Store everything publicly", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Encryption and 2FA protect cloud data.",
            "incorrect": "That's risky. Secure with encryption and 2FA."
        },
        "category": "Data Security",
        "difficulty": "hard"
    },
    {
        "id": 81,
        "question": "What’s a risk of connecting to an unsecured Wi-Fi hotspot?",
        "options": [
            { "text": "Slower internet speed", "correct": false },
            { "text": "Data interception by attackers", "correct": true },
            { "text": "Higher data usage", "correct": false },
            { "text": "Device overheating", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Unsecured Wi-Fi allows data theft.",
            "incorrect": "That's not the main risk. Data can be intercepted."
        },
        "category": "Network Security",
        "difficulty": "hard"
    },
    {
        "id": 82,
        "question": "How can you prevent ransomware from spreading on a network?",
        "options": [
            { "text": "Disable antivirus", "correct": false },
            { "text": "Isolate infected devices and update security", "correct": true },
            { "text": "Share files to check them", "correct": false },
            { "text": "Ignore early warnings", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Isolation and updates stop ransomware spread.",
            "incorrect": "That's risky. Isolate and update systems."
        },
        "category": "Malware Threats",
        "difficulty": "hard"
    },
    {
        "id": 83,
        "question": "What should you do if you receive a CEO fraud email?",
        "options": [
            { "text": "Follow the instructions", "correct": false },
            { "text": "Verify with the CEO directly", "correct": true },
            { "text": "Reply to confirm", "correct": false },
            { "text": "Forward it to staff", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! CEO fraud mimics authority. Verify personally.",
            "incorrect": "That's risky. Confirm with the CEO first."
        },
        "category": "Phishing Awareness & Social Engineering",
        "difficulty": "hard"
    },
    {
        "id": 84,
        "question": "How can you secure a video call on an untrusted network?",
        "options": [
            { "text": "Use the default settings", "correct": false },
            { "text": "Enable end-to-end encryption", "correct": true },
            { "text": "Share the link publicly", "correct": false },
            { "text": "Turn off your camera", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! End-to-end encryption protects your call.",
            "incorrect": "That's risky. Use encryption on untrusted networks."
        },
        "category": "Network Security",
        "difficulty": "hard"
    },
    {
        "id": 85,
        "question": "What’s a sign of a data breach notification?",
        "options": [
            { "text": "An email with a free offer", "correct": false },
            { "text": "A formal notice from a trusted company", "correct": true },
            { "text": "A pop-up ad", "correct": false },
            { "text": "A text from an unknown number", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Official notices come from known sources.",
            "incorrect": "That's not a sign. Look for formal company notices."
        },
        "category": "Data Security & Breach Awareness",
        "difficulty": "hard"
    },
    {
        "id": 86,
        "question": "How can you protect against a brute force attack?",
        "options": [
            { "text": "Use a short password", "correct": false },
            { "text": "Enable account lockout after failed attempts", "correct": true },
            { "text": "Share your password with IT", "correct": false },
            { "text": "Disable two-factor authentication", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Lockouts prevent repeated login tries.",
            "incorrect": "That's risky. Use lockout features to block attacks."
        },
        "category": "Password Security & Multi-Factor Authentication",
        "difficulty": "hard"
    },
    {
        "id": 87,
        "question": "What should you do if your smart speaker records private conversations?",
        "options": [
            { "text": "Reset it and review privacy settings", "correct": true },
            { "text": "Ignore it if unintentional", "correct": false },
            { "text": "Share the recordings online", "correct": false },
            { "text": "Unplug it permanently", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Resetting and adjusting settings protects privacy.",
            "incorrect": "That's risky. Reset and secure the device."
        },
        "category": "Privacy & IoT Security",
        "difficulty": "hard"
    },
    {
        "id": 88,
        "question": "How can you verify the authenticity of a software download?",
        "options": [
            { "text": "Check the file size", "correct": false },
            { "text": "Verify the digital signature or hash", "correct": true },
            { "text": "Ask a friend", "correct": false },
            { "text": "Download from any site", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Signatures or hashes confirm software legitimacy.",
            "incorrect": "That's not enough. Verify with digital signatures."
        },
        "category": "Download Safety and Security",
        "difficulty": "hard"
    },
    {
        "id": 89,
        "question": "What’s a risk of using public USB drives for charging?",
        "options": [
            { "text": "Overheating your device", "correct": false },
            { "text": "Data theft via juice jacking", "correct": true },
            { "text": "Slower charging speed", "correct": false },
            { "text": "Battery drain", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Juice jacking can steal data from your device.",
            "incorrect": "That's not the main risk. Avoid public USB charging."
        },
        "category": "Physical Security",
        "difficulty": "hard"
    },
    {
        "id": 90,
        "question": "What’s the best way to recover from a ransomware attack?",
        "options": [
            { "text": "Pay the ransom immediately", "correct": false },
            { "text": "Restore from a recent backup", "correct": true },
            { "text": "Format your device", "correct": false },
            { "text": "Ignore the demand", "correct": false }
        ],
        "feedback": {
            "correct": "Correct! Backups can restore your data without paying.",
            "incorrect": "That's risky. Use a backup to recover instead of paying."
        },
        "category": "Data Security & Malware Threats",
        "difficulty": "hard"
    }
],
    "popups": [
    {
        "id": 1,
        "question": "You've been selected as the winner of our annual sweepstakes! To claim your $5,000 prize, please provide your bank details here.",
        "options": [
            { "text": "Provide bank details", "correct": false },
            { "text": "Contact the company directly", "correct": true }
        ],
        "feedback": {
            "correct": "Smart move! Always verify such claims by contacting the company through official channels.",
            "incorrect": "Danger! Providing bank details can lead to financial loss."
        },
        "category": "phishing"
    },
    {
        "id": 2,
        "question": "Security Alert: Your system is at risk! Multiple threats detected. Click here to update your security software.",
        "options": [
            { "text": "Update security software", "correct": false },
            { "text": "Check with trusted security software", "correct": true }
        ],
        "feedback": {
            "correct": "Good choice! Always verify such alerts with your existing security software.",
            "incorrect": "Be cautious! Clicking can lead to malware installation."
        },
        "category": "malware"
    },
    {
        "id": 3,
        "question": "Urgent: Your account will be suspended due to suspicious activity. Please log in here to verify your identity.",
        "options": [
            { "text": "Log in to verify", "correct": false },
            { "text": "Contact customer support", "correct": true }
        ],
        "feedback": {
            "correct": "Smart move! Always contact customer support directly through official channels.",
            "incorrect": "Danger! Logging in can lead to account compromise."
        },
        "category": "phishing"
    },
    {
        "id": 4,
        "question": "Your subscription is about to expire. Renew now to avoid interruption of service.",
        "options": [
            { "text": "Renew subscription", "correct": false },
            { "text": "Check official website", "correct": true }
        ],
        "feedback": {
            "correct": "Good choice! Always verify subscription status through official channels.",
            "incorrect": "Be cautious! This could be a scam to steal your payment information."
        },
        "category": "phishing"
    },
    {
        "id": 5,
        "question": "You have unread messages from your bank. Click here to view them.",
        "options": [
            { "text": "Click to view messages", "correct": false },
            { "text": "Log in to bank website directly", "correct": true }
        ],
        "feedback": {
            "correct": "Good choice! Always access your bank account through official channels.",
            "incorrect": "Be careful! Clicking links can lead to phishing scams."
        },
        "category": "phishing"
    },
    {
        "id": 6,
        "question": "Your computer is locked due to illegal activity. Pay the fine to unlock it.",
        "options": [
            { "text": "Pay the fine", "correct": false },
            { "text": "Turn off the computer", "correct": true }
        ],
        "feedback": {
            "correct": "Good choice! This is likely ransomware. Turning off the computer can help prevent further damage.",
            "incorrect": "Be careful! Paying the fine will not help and may worsen the situation."
        },
        "category": "ransomware"
    },
    {
        "id": 7,
        "question": "You have won a free vacation! Provide your credit card details to confirm your booking.",
        "options": [
            { "text": "Provide credit card details", "correct": false },
            { "text": "Contact the travel company directly", "correct": true }
        ],
        "feedback": {
            "correct": "Smart move! Always verify such offers through official channels.",
            "incorrect": "Danger! Providing credit card details can lead to financial loss."
        },
        "category": "phishing"
    },
    {
        "id": 8,
        "question": "Your antivirus subscription has expired. Renew now to continue protection.",
        "options": [
            { "text": "Renew subscription", "correct": false },
            { "text": "Check with official antivirus website", "correct": true }
        ],
        "feedback": {
            "correct": "Good choice! Always renew subscriptions through official websites.",
            "incorrect": "Be cautious! This could be a scam to install malware."
        },
        "category": "malware"
    },
    {
        "id": 9,
        "question": "You have been selected for a special offer! Click here to redeem your discount.",
        "options": [
            { "text": "Click to redeem", "correct": false },
            { "text": "Visit the official website", "correct": true }
        ],
        "feedback": {
            "correct": "Wise decision! Always access offers through official channels to avoid scams.",
            "incorrect": "Be careful! Clicking links can lead to phishing sites."
        },
        "category": "phishing"
    },
    {
        "id": 10,
        "question": "Your colleague needs urgent help with a project. They sent you a link to a document that requires your immediate attention.",
        "options": [
            { "text": "Open the link", "correct": false },
            { "text": "Contact your colleague directly", "correct": true }
        ],
        "feedback": {
            "correct": "Excellent! Always verify requests from colleagues by contacting them directly.",
            "incorrect": "Be careful! This could be a phishing attempt or malware distribution."
        },
        "category": "social_engineering"
        }
    ]
};
