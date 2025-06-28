// Number of questions per game
const QUESTIONS_PER_GAME = 13;

// Variables declaration
let currentScenarioIndex = 0;
let score = 0;
let selectedScenarios = [];
let selectedPopup = null;
let maxScore = QUESTIONS_PER_GAME;
let scenariosData = null;
let popupTriggered = false;
let selectedDifficulty = null;

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

// Popups styles
const style = document.createElement('style');
style.textContent = `
    #popupContainer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(12, 12, 29, 0.93);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .popup {
        background: #18182a;
        padding: 24px 18px;
        border-radius: 12px;
        box-shadow: 0 0 10px 2px #0f0, 0 0 0 1px #0f0 inset;
        max-width: 420px;
        text-align: center;
        border-left: 3px solid #0f0;
        border-right: 3px solid #0f0;
        color: #e0e0e0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        position: relative;
        animation: popup-glow 1.5s infinite alternate;
    }
    @keyframes popup-glow {
        0% { box-shadow: 0 0 10px 2px #0f0, 0 0 0 1px #0f0 inset; }
        100% { box-shadow: 0 0 18px 4px #0f0, 0 0 0 1px #0f0 inset; }
    }
    .popup h3 {
        color: #0f0;
        margin-bottom: 16px;
        font-size: 1.3em;
        text-shadow: 0 0 4px #0f0;
    }
    .popup p {
        margin-bottom: 18px;
        color: #e0e0e0;
        font-size: 1.05em;
        text-shadow: 0 0 2px #0f0;
    }
    .popup .option-btn {
        margin: 8px 6px;
        padding: 8px 18px;
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
    .popup .option-btn:hover:not(:disabled) {
        background: #00cc00;
        color: #fff;
        box-shadow: 0 0 8px #0f0;
    }
    .popup .feedback {
        margin-top: 14px;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
        font-size: 1em;
    }
    .popup .feedback.correct {
        background: rgba(0, 255, 0, 0.10);
        border: 1px solid #0f0;
        color: #0f0;
        text-shadow: 0 0 3px #0f0;
    }
    .popup .feedback.incorrect {
        background: rgba(255, 0, 0, 0.08);
        border: 1px solid #f00;
        color: #f00;
        text-shadow: 0 0 3px #f00;
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
`;
document.head.appendChild(style);

// Fade out loading, show disclaimer
setTimeout(() => {
    if (!loadingContainer) return;
    loadingContainer.classList.add('fade-out');
    setTimeout(() => {
        loadingContainer.style.display = 'none';
        if (guidebookBtn) guidebookBtn.style.display = 'inline-block';
        if (disclaimerSection) disclaimerSection.style.display = 'block';
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

// Generate two random popup triggers
function getTwoPopupTriggers(totalQuestions) {
    // First popup between 3 and 7
    const first = Math.floor(Math.random() * (7 - 3 + 1)) + 3;
    // Second popup between 8 and 12, and not the same as first
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

// When checkbox is checked, enable start button
agreeCheckbox.addEventListener('change', function() {
    startButton.disabled = !this.checked;
});

// Disable start button for checking inputs
agreeCheckbox.disabled = true;
agreeCheckbox.parentElement.style.opacity = 0.6;
startButton.disabled = true;

// Start button shows difficulty selection
startButton.addEventListener('click', function() {
    if (!disclaimerSection || !difficultySection) return;
    disclaimerSection.style.display = 'none';
    difficultySection.style.display = 'block';
    if (guidebookBtn) guidebookBtn.style.display = 'none';
});

// Difficulty selection
difficultyButtons.forEach(button => {
    button.addEventListener('click', async function() {
        if (!this.dataset.difficulty) return;
        selectedDifficulty = this.dataset.difficulty;
        if (!difficultySection || !gameSection) return;
        difficultySection.style.display = 'none';
        gameSection.style.display = 'block';
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
});

// Quit button
quitButton.addEventListener('click', function() {
    const playerName = document.getElementById('playerName') ? document.getElementById('playerName').value : 'Anonymous';
    const playerAge = document.getElementById('playerAge') ? document.getElementById('playerAge').value : '';
    const result = `${score}/${maxScore}`;
    const googleFormURL = `https://docs.google.com/forms/d/e/1FAIpQLSetaJQxQ_21zgpTOI-O1vFn6q2g3U5gQWlsNtDe19ypXz2Z2g/viewform?usp=pp_url`
        + `&entry.753452273=${encodeURIComponent(playerName)}`
        + `&entry.735828413=${encodeURIComponent(playerAge)}`
        + `&entry.1000316234=${encodeURIComponent(result)}`;
    window.open(googleFormURL, '_blank');
    window.location.href = 'startgame.html';
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

function selectRandomScenarios() {
    if (!scenariosData || !scenariosData.scenarios) return [];
    if (!['easy', 'normal', 'hard'].includes(selectedDifficulty)) {
        alert('Invalid difficulty selected. Please choose a difficulty level.');
        return [];
    }
    const filteredScenarios = scenariosData.scenarios.filter(scenario => scenario.difficulty === selectedDifficulty);
    if (filteredScenarios.length < QUESTIONS_PER_GAME) {
        alert(`Not enough questions available for ${selectedDifficulty} difficulty. Please try another difficulty.`);
        return [];
    }
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
    if (!scenariosData) {
        await fetchScenarios();
    }
    if (!scenariosData) return;
    currentScenarioIndex = 0;
    score = 0;
    scoreValue.textContent = score;
    selectedScenarios = selectRandomScenarios();
    if (selectedScenarios.length === 0) {
        gameSection.style.display = 'none';
        difficultySection.style.display = 'block';
        return;
    }
    POPUP_TRIGGER_QUESTIONS = getTwoPopupTriggers(QUESTIONS_PER_GAME);
    popupsShown = 0;
    loadScenario();
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
    scenario.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        button.addEventListener('click', function () {
            selectOption(index, option.correct);
        });
        optionsContainer.appendChild(button);
    });
}

function selectOption(index, isCorrect) {
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
    if (isCorrect) {
        score++;
        scoreValue.textContent = score;
    }
    nextButton.style.display = 'block';
}

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
    popupContainer.innerHTML = `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popupTitle" aria-describedby="popupDesc" tabindex="-1">
            <h3 id="popupTitle">Urgent Alert!</h3>
            <p id="popupDesc">${selectedPopup.question}</p>
            <button class="option-btn" onclick="handlePopupResponse(true)">Yes</button>
            <button class="option-btn" onclick="handlePopupResponse(false)">No</button>
            <div id="popupFeedback" class="feedback" style="display: none;"></div>
            <button class="close-btn" id="closePopup" style="display: none;">Continue</button>
        </div>
    `;
    popupContainer.style.display = 'flex';

    const popupDiv = popupContainer.querySelector('.popup');
    if (popupDiv) popupDiv.focus();

}

function handlePopupResponse(isYes) {
    if (!popupContainer) return;
    const popupFeedback = document.getElementById('popupFeedback');
    const closeButton = document.getElementById('closePopup');
    if (!popupFeedback || !closeButton) return;
    const isCorrect = (isYes && selectedPopup.options[0].correct) || (!isYes && selectedPopup.options[1].correct);
    popupFeedback.innerHTML = isCorrect ? selectedPopup.feedback.correct : selectedPopup.feedback.incorrect;
    popupFeedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    popupFeedback.style.display = 'block';
    closeButton.style.display = 'block';
    popupContainer.querySelectorAll('.option-btn').forEach(button => {
        button.disabled = true;
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

function completeGame() {
    if (!gameSection || !gameCompleted || !finalScore || !badgeContainer) return;
    gameSection.style.display = 'none';
    gameCompleted.style.display = 'block';
    const percentage = (score / maxScore) * 100;
    finalScore.innerHTML = `
        <p>Your score: ${score}/${maxScore} (${percentage.toFixed(0)}%)</p>
        <p>You answered questions on: ${[...new Set(selectedScenarios.map(s => s.category))].map(cat => 
            cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')}</p>
    `;
    let badgeTitle, badgeImage;
    if (percentage >= 90) {
        badgeTitle = "Cybersecurity Expert";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#0f0;margin:0 auto;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(0,255,0,0.7)"><div style="font-size:40px">🛡️</div></div>`;
    } else if (percentage >= 70) {
        badgeTitle = "Security Defender";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#99ff99;margin:0 auto;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(0,255,0,0.5)"><div style="font-size:40px">🔒</div></div>`;
    } else if (percentage >= 50) {
        badgeTitle = "Security Apprentice";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#ccffcc;margin:0 auto;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(0,255,0,0.3)"><div style="font-size:40px">🔐</div></div>`;
    } else {
        badgeTitle = "Security Novice";
        badgeImage = `<div style="width:120px;height:120px;border-radius:50%;background-color:#e0e0e0;margin:0 auto;display:flex;align-items:center;justify-content:center;"><div style="font-size:40px">📚</div></div>`;
    }
    badgeContainer.innerHTML = `
        ${badgeImage}
        <h4 class="glow-effect">${badgeTitle}</h4>
    `;
}

// Scenarios data embedded directly in the script as separate object will violate the CORS policy.
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
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 2,
            "question": "What's a secure password for your email account?",
            "options": [
                { "text": "password123", "correct": false },
                { "text": "Your pet's name", "correct": false },
                { "text": "A long passphrase like 'blue-sky-rainbow-2023'", "correct": true },
                { "text": "Your birthday", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Long passphrases are secure and easier to remember.",
                "incorrect": "That's not secure. Use a long passphrase for better security."
            },
            "category": "password",
            "difficulty": "easy"
        },
        {
            "id": 3,
            "question": "You get a text message offering free gift cards if you click a link. The message appears as shown. What should you do?",
            "image": "https://www.pcrisk.com/images/stories/screenshots202206/win-a-new-iphone-13-scam-main.jpg",
            "options": [
                { "text": "Fill all the details to get the Iphone!!", "correct": false },
                { "text": "Delete the message and don’t click the link", "correct": true },
                { "text": "I am rich, so I don't needed it", "correct": false },
                { "text": "Share the link with friends", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Unsolicited messages with links are often scams. Delete them.",
                "incorrect": "That's risky. Such messages are likely scams. Delete them without clicking."
            },
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 4,
            "question": "Should you reuse the same password across multiple websites?",
            "options": [
                { "text": "Yes, it’s easier to remember", "correct": false },
                { "text": "No, use unique passwords for each site", "correct": true },
                { "text": "Only for unimportant sites", "correct": false },
                { "text": "Only if the sites are secure", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Unique passwords prevent a single breach from affecting multiple accounts.",
                "incorrect": "That's not secure. Always use unique passwords for each website."
            },
            "category": "password",
            "difficulty": "easy"
        },
        {
            "id": 5,
            "question": "What’s a safe way to check if a website is secure before entering personal information? The picture shows as below:",
            "image": "https://www.searchenginejournal.com/wp-content/uploads/2020/01/connection-not-private-chrome-5e31a1e41b5b2.png",
            "options": [
                { "text": "Check if the URL starts with 'https://'", "correct": true },
                { "text": "Make sure the website looks professional", "correct": false },
                { "text": "Enter your details to test it", "correct": false },
                { "text": "Ask a friend if they’ve used it", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! 'https://' indicates a secure connection with encryption.",
                "incorrect": "That's not reliable. Check for 'https://' to ensure the site is secure."
            },
            "category": "website",
            "difficulty": "easy"
        },
        {
            "id": 6,
            "question": "You see a pop-up on a website saying your computer is infected. What should you do?",
            "options": [
                { "text": "Click the pop-up to scan your computer", "correct": false },
                { "text": "Close the pop-up and run a trusted antivirus", "correct": true },
                { "text": "Enter your email to get more info", "correct": false },
                { "text": "Restart your computer immediately", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Pop-up infection warnings are often scams. Use trusted antivirus software.",
                "incorrect": "That's risky. Avoid interacting with such pop-ups and use trusted antivirus software."
            },
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 7,
            "question": "Is it safe to share your password with a friend?",
            "options": [
                { "text": "Yes, if you trust them", "correct": false },
                { "text": "No, never share your password", "correct": true },
                { "text": "Only if it’s a simple password", "correct": false },
                { "text": "Only for one-time use", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Never share your password, even with trusted individuals.",
                "incorrect": "That's not safe. Passwords should never be shared with anyone."
            },
            "category": "password",
            "difficulty": "easy"
        },
        {
            "id": 8,
            "question": "What should you do if you get an email asking for your credit card details?",
            "options": [
                { "text": "Provide the details if the email looks official", "correct": false },
                { "text": "Delete the email and report it as spam", "correct": true },
                { "text": "Reply to verify the sender", "correct": false },
                { "text": "Call the sender’s number from the email", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Never share credit card details via email. Delete and report such emails.",
                "incorrect": "That's risky. Delete and report emails asking for sensitive information."
            },
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 9,
            "question": "What does a padlock icon in the browser address bar mean?",
            "options": [
                { "text": "The website is completely safe", "correct": false },
                { "text": "The browser connection is encrypted, resulting in a secure connection", "correct": true },
                { "text": "The website is free to use", "correct": false },
                { "text": "The website is ad-free", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! A padlock indicates an encrypted connection, but verify the site’s legitimacy.",
                "incorrect": "That's incorrect. A padlock means the connection is encrypted, not that the site is safe."
            },
            "category": "website",
            "difficulty": "easy"
        },
        {
            "id": 10,
            "question": "Should you download apps from unknown websites?",
            "options": [
                { "text": "Yes, if they look useful", "correct": false },
                { "text": "No, only download from trusted app stores", "correct": true },
                { "text": "Only if they’re free", "correct": false },
                { "text": "Only after checking reviews", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Always download apps from trusted sources like official app stores.",
                "incorrect": "That's risky. Only download apps from trusted app stores to avoid malware."
            },
            "category": "downloads",
            "difficulty": "easy"
        },
        {
            "id": 11,
            "question": "Should you share any OTP-related information with an online stranger who asks for it?",
            "options": [
                { "text": "Yes, if they need my help", "correct": false },
                { "text": "No, the OTP is only keep for me for my own and personal use", "correct": true },
                { "text": "Yes, because they are my online friends", "correct": false },
                { "text": "Yes, Because he is being nice to me, and that's the reason I will give him the OTP", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Always check the OTP information and take immediate actions as someone is trying to gain unauthorized access.",
                "incorrect": "That's risky. Never share OTPs with strangers, not even your online friends or family as they may be impersonators."
            },
            "category": "privacy",
            "difficulty": "easy"
        },
        {
            "id": 12,
            "question": "Should you share your bank account number with someone claiming to be a customer service agent over the phone?",
            "options": [
                { "text": "Yes, if they sound professional", "correct": false },
                { "text": "No, verify their identity first", "correct": true },
                { "text": "Yes, if they call from a known number", "correct": false },
                { "text": "Yes, if they promise a reward", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Never share sensitive info over the phone without verification.",
                "incorrect": "That's risky. Verify the caller’s identity before sharing any details."
            },
            "category": "privacy",
            "difficulty": "easy"
        },
        {
            "id": 13,
            "question": "Is it safe to give your address to a website offering a free sample?",
            "options": [
                { "text": "Yes, if it’s a well-known brand", "correct": false },
                { "text": "No, check the site’s legitimacy first", "correct": true },
                { "text": "Yes, if it’s free", "correct": false },
                { "text": "No, but if friends recommended it, then yes", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Unsolicited free offers may be scams. It is adviced to verify the legitimacy of the site.",
                "incorrect": "That's risky. Always verify before sharing personal info."
            },
            "category": "privacy",
            "difficulty": "easy"
        },
        {
            "id": 14,
            "question": "You receive a call saying you won a prize but need to pay a fee. What should you do?",
            "options": [
                { "text": "Pay the fee to claim it", "correct": false },
                { "text": "Hang up and report it", "correct": true },
                { "text": "Ask for more details", "correct": false },
                { "text": "Share it with family", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Prize scams often require payment. Hang up and report.",
                "incorrect": "That's a scam. Avoid paying fees for prizes."
            },
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 15,
            "question": "Is it safe to use public Wi-Fi for online banking?",
            "options": [
                { "text": "Yes, it’s convenient", "correct": false },
                { "text": "No, use a secure connection", "correct": true },
                { "text": "Yes, if it’s a café", "correct": false },
                { "text": "No, but check your balance", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Public Wi-Fi is risky. Use a secure connection.",
                "incorrect": "That's unsafe. Avoid public Wi-Fi for banking."
            },
            "category": "network",
            "difficulty": "easy"
        },
        {
            "id": 16,
            "question": "You find a USB drive on the street. What should you do?",
            "options": [
                { "text": "Plug it into your computer", "correct": false },
                { "text": "Throw it away or give it to authorities", "correct": true },
                { "text": "Use it to store files", "correct": false },
                { "text": "Share it with friends", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Unknown USBs may contain malware. Dispose of it safely.",
                "incorrect": "That's risky. Avoid using unknown USBs."
            },
            "category": "physical",
            "difficulty": "easy"
        },
        {
            "id": 17,
            "question": "Should you click a link in a Facebook message from a friend?",
            "options": [
                { "text": "Yes, if it’s from a friend", "correct": false },
                { "text": "No, verify with the friend first", "correct": true },
                { "text": "Yes, if it looks interesting", "correct": false },
                { "text": "No, delete it right away", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Friends’ accounts can be hacked. Verify first.",
                "incorrect": "That's risky. Confirm with your friend before clicking."
            },
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 18,
            "question": "What should you do if an email asks for your password?",
            "options": [
                { "text": "Send it if the email looks official", "correct": false },
                { "text": "Delete it and report it", "correct": true },
                { "text": "Reply to ask why", "correct": false },
                { "text": "Call the sender", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Legitimate services never ask for passwords via email.",
                "incorrect": "That's unsafe. Delete and report such emails."
            },
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 19,
            "question": "Is it safe to enter your personal details on a pop-up form?",
            "options": [
                { "text": "Yes, if it’s from a known site", "correct": false },
                { "text": "No, close it and check the site", "correct": true },
                { "text": "Yes, if it offers a prize", "correct": false },
                { "text": "No, but save the form", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Pop-up forms are often scams. Verify the site.",
                "incorrect": "That's risky. Avoid entering details in pop-ups."
            },
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 20,
            "question": "Should you use your birthday as a password?",
            "options": [
                { "text": "Yes, it’s easy to remember", "correct": false },
                { "text": "No, use a random passphrase", "correct": true },
                { "text": "Yes, if it’s with numbers", "correct": false },
                { "text": "No, but add a name", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Birthdays are easy to guess. Use a random passphrase.",
                "incorrect": "That's weak. Avoid using personal info like birthdays."
            },
            "category": "password",
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
            "category": "website",
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
            "category": "physical",
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
            "category": "social",
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
            "category": "phishing",
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
            "category": "downloads",
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
            "category": "privacy",
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
            "category": "phishing",
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
            "category": "physical",
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
            "category": "phishing",
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
            "category": "phishing",
            "difficulty": "easy"
        },
        {
            "id": 31,
            "question": "You receive a suspicious email with an attachment. What should you do?",
            "options": [
                { "text": "Open the attachment to see what it is", "correct": false },
                { "text": "Delete the email without opening it", "correct": true },
                { "text": "Reply to the sender asking for more information", "correct": false },
                { "text": "Forward the email to your friends", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Never open attachments from unknown sources.",
                "incorrect": "That's risky. Always delete suspicious emails without opening attachments."
            },
            "category": "phishing",
            "difficulty": "normal"
        },
        {
            "id": 32,
            "question": "You're working in a coffee shop using public Wi-Fi. How should you protect your data?",
            "options": [
                { "text": "Access any website as coffee shops are safe", "correct": false },
                { "text": "Use a VPN to encrypt your connection", "correct": true },
                { "text": "Turn off Wi-Fi when entering passwords", "correct": false },
                { "text": "Only use websites with 'coffee' in the URL", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! A VPN encrypts your traffic, protecting data on public Wi-Fi.",
                "incorrect": "That's not safe. Use a VPN to secure your data on public networks."
            },
            "category": "network",
            "difficulty": "normal"
        },
        {
            "id": 33,
            "question": "Your colleague forgot their password and asks to use your credentials. What do you do?",
            "options": [
                { "text": "Share your password with them", "correct": false },
                { "text": "Log them in but watch them", "correct": false },
                { "text": "Direct them to IT support to reset their password", "correct": true },
                { "text": "Email them the file they need", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Never share credentials. Direct them to IT for a password reset.",
                "incorrect": "That's not secure. Never share credentials; direct them to IT support."
            },
            "category": "access",
            "difficulty": "normal"
        },
        {
            "id": 34,
            "question": "What’s the safest way to handle software updates?",
            "options": [
                { "text": "Wait a few months for stability", "correct": false },
                { "text": "Only update when prompted repeatedly", "correct": false },
                { "text": "Enable automatic updates", "correct": true },
                { "text": "Only update entertainment apps", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Automatic updates apply security patches promptly.",
                "incorrect": "That's not safe. Enable automatic updates for timely security patches."
            },
            "category": "updates",
            "difficulty": "normal"
        },
        {
            "id": 35,
            "question": "You find a USB drive in your workplace parking lot. What should you do?",
            "options": [
                { "text": "Plug it in to check its contents", "correct": false },
                { "text": "Hand it to IT security without plugging it in", "correct": true },
                { "text": "Use it on a public computer", "correct": false },
                { "text": "Keep it as a free USB drive", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Unknown USBs may contain malware. Give it to IT security.",
                "incorrect": "That's risky. Unknown USBs can carry malware. Hand it to IT security."
            },
            "category": "physical",
            "difficulty": "normal"
        },
        {
            "id": 36,
            "question": "How should you secure your home Wi-Fi network?",
            "options": [
                { "text": "Hide your network name (SSID)", "correct": false },
                { "text": "Use WPA3 encryption and a strong password", "correct": true },
                { "text": "Use an intimidating network name", "correct": false },
                { "text": "Use your address as the password", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! WPA3 with a strong password offers the best Wi-Fi security.",
                "incorrect": "That's not secure. Use WPA3 encryption with a strong, unique password."
            },
            "category": "network",
            "difficulty": "normal"
        },
        {
            "id": 37,
            "question": "What should you do before downloading a file from an email?",
            "options": [
                { "text": "Download it if the email is from a known contact", "correct": false },
                { "text": "Verify the sender and scan the file for malware", "correct": true },
                { "text": "Open it immediately to check its contents", "correct": false },
                { "text": "Save it to a USB drive first", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Always verify the sender and scan files to avoid malware.",
                "incorrect": "That's risky. Verify the sender and scan files before downloading."
            },
            "category": "downloads",
            "difficulty": "normal"
        },
        {
            "id": 38,
            "question": "What’s a good practice for backing up important files?",
            "options": [
                { "text": "Store them on your desktop", "correct": false },
                { "text": "Use an external drive or secure cloud service", "correct": true },
                { "text": "Email them to yourself", "correct": false },
                { "text": "Keep them on a single USB drive", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Use external drives or secure cloud services for reliable backups.",
                "incorrect": "That's not secure. Use external drives or secure cloud services for backups."
            },
            "category": "data",
            "difficulty": "normal"
        },
        {
            "id": 39,
            "question": "You’re asked to install software from an unknown source. What’s the best action?",
            "options": [
                { "text": "Install it if it looks legitimate", "correct": false },
                { "text": "Only install from trusted sources", "correct": true },
                { "text": "Install it but scan it first", "correct": false },
                { "text": "Ask a colleague for advice", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Only install software from trusted sources to avoid malware.",
                "incorrect": "That's risky. Always install software from trusted sources."
            },
            "category": "downloads",
            "difficulty": "normal"
        },
        {
            "id": 40,
            "question": "What’s a risk of using public USB charging stations?",
            "options": [
                { "text": "They’re always safe", "correct": false },
                { "text": "They may transfer malware or steal data", "correct": true },
                { "text": "They charge too slowly", "correct": false },
                { "text": "They require a password", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Public USB stations can transfer malware or steal data.",
                "incorrect": "That's incorrect. Public USB stations can be risky due to malware or data theft."
            },
            "category": "physical",
            "difficulty": "normal"
        },
        {
            "id": 41,
            "question": "What should you do if a website asks for unnecessary permissions?",
            "options": [
                { "text": "Grant all permissions to proceed", "correct": false },
                { "text": "Deny unnecessary permissions and assess the site’s legitimacy", "correct": true },
                { "text": "Grant permissions but monitor your account", "correct": false },
                { "text": "Contact the website’s support", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Deny unnecessary permissions and verify the site’s trustworthiness.",
                "incorrect": "That's risky. Deny unnecessary permissions and check the site’s legitimacy."
            },
            "category": "website",
            "difficulty": "normal"
        },
        {
            "id": 42,
            "question": "You receive an unexpected email attachment from your boss. What should you do?",
            "options": [
                { "text": "Open it immediately", "correct": false },
                { "text": "Verify with your boss before opening", "correct": true },
                { "text": "Forward it to IT", "correct": false },
                { "text": "Save it for later", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Verify unexpected attachments to avoid malware.",
                "incorrect": "That's risky. Confirm with your boss first."
            },
            "category": "phishing",
            "difficulty": "normal"
        },
        {
            "id": 43,
            "question": "How can you protect your laptop in a public place?",
            "options": [
                { "text": "Leave it unattended briefly", "correct": false },
                { "text": "Use a cable lock and stay vigilant", "correct": true },
                { "text": "Hide it under papers", "correct": false },
                { "text": "Turn off the screen", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! A cable lock and awareness prevent theft.",
                "incorrect": "That's not enough. Use a cable lock and stay alert."
            },
            "category": "physical",
            "difficulty": "normal"
        },
        {
            "id": 44,
            "question": "What should you do if your phone is lost?",
            "options": [
                { "text": "Wait for it to be returned", "correct": false },
                { "text": "Remote lock or wipe it using a security app", "correct": true },
                { "text": "Call your carrier", "correct": false },
                { "text": "Post about it online", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Remote locking or wiping protects your data.",
                "incorrect": "That's risky. Use a security app to lock or wipe it."
            },
            "category": "physical",
            "difficulty": "normal"
        },
        {
            "id": 45,
            "question": "Is it safe to save passwords in your browser?",
            "options": [
                { "text": "Yes, it’s convenient", "correct": false },
                { "text": "No, use a password manager instead", "correct": true },
                { "text": "Yes, if it’s a trusted browser", "correct": false },
                { "text": "No, but write them down", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Password managers are more secure than browser storage.",
                "incorrect": "That's risky. Use a dedicated password manager."
            },
            "category": "password",
            "difficulty": "normal"
        },
        {
            "id": 46,
            "question": "What should you do if you suspect a phishing call?",
            "options": [
                { "text": "Provide information to verify", "correct": false },
                { "text": "Hang up and contact the company directly", "correct": true },
                { "text": "Ask for a callback number", "correct": false },
                { "text": "Stay on to argue", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Verify through official channels to avoid scams.",
                "incorrect": "That's risky. Hang up and contact the company yourself."
            },
            "category": "phishing",
            "difficulty": "normal"
        },
        {
            "id": 47,
            "question": "How can you secure your mobile device?",
            "options": [
                { "text": "Leave it unlocked for quick access", "correct": false },
                { "text": "Enable a PIN, fingerprint, or face lock", "correct": true },
                { "text": "Turn off security updates", "correct": false },
                { "text": "Use public Wi-Fi without a VPN", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Locks and updates protect your device.",
                "incorrect": "That's unsafe. Use a lock and keep updates on."
            },
            "category": "physical",
            "difficulty": "normal"
        },
        {
            "id": 48,
            "question": "Should you click a link in an email from an unknown sender?",
            "options": [
                { "text": "Yes, if it looks safe", "correct": false },
                { "text": "No, delete or report it", "correct": true },
                { "text": "Yes, if it’s a video", "correct": false },
                { "text": "No, but save it", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Unknown links can lead to malware. Delete them.",
                "incorrect": "That's risky. Avoid clicking unknown links."
            },
            "category": "phishing",
            "difficulty": "normal"
        },
        {
            "id": 49,
            "question": "What’s the best way to handle a lost USB drive with sensitive data?",
            "options": [
                { "text": "Ignore it if it’s old data", "correct": false },
                { "text": "Report it to IT and monitor for breaches", "correct": true },
                { "text": "Reformat it if found", "correct": false },
                { "text": "Share the loss online", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Reporting helps mitigate potential data breaches.",
                "incorrect": "That's risky. Report the loss to IT immediately."
            },
            "category": "data",
            "difficulty": "normal"
        },
        {
            "id": 50,
            "question": "Is it safe to use a public computer for online shopping?",
            "options": [
                { "text": "Yes, if you log out", "correct": false },
                { "text": "No, avoid sensitive tasks", "correct": true },
                { "text": "Yes, if it’s in a library", "correct": false },
                { "text": "No, but use incognito mode", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Public computers can retain your data. Avoid shopping.",
                "incorrect": "That's risky. Don’t use public computers for shopping."
            },
            "category": "network",
            "difficulty": "normal"
        },
        {
            "id": 51,
            "question": "What should you do if your email account sends spam to contacts?",
            "options": [
                { "text": "Ignore it if no harm is done", "correct": false },
                { "text": "Change your password and scan for malware", "correct": true },
                { "text": "Delete the sent emails", "correct": false },
                { "text": "Notify your contacts", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! This may indicate a hack. Secure your account.",
                "incorrect": "That's risky. Act quickly to change your password."
            },
            "category": "phishing",
            "difficulty": "normal"
        },
        {
            "id": 52,
            "question": "How can you protect your data when traveling?",
            "options": [
                { "text": "Use hotel Wi-Fi without protection", "correct": false },
                { "text": "Encrypt files and use a VPN", "correct": true },
                { "text": "Share your itinerary online", "correct": false },
                { "text": "Leave devices unlocked", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Encryption and a VPN secure your data on the go.",
                "incorrect": "That's unsafe. Use encryption and a VPN."
            },
            "category": "network",
            "difficulty": "normal"
        },
        {
            "id": 53,
            "question": "Should you install software updates on your phone?",
            "options": [
                { "text": "No, to avoid changes", "correct": false },
                { "text": "Yes, for security fixes", "correct": true },
                { "text": "No, if it works fine", "correct": false },
                { "text": "Yes, but only for apps", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Updates patch security vulnerabilities.",
                "incorrect": "That's risky. Install updates for safety."
            },
            "category": "updates",
            "difficulty": "normal"
        },
        {
            "id": 54,
            "question": "What should you do if you see a suspicious login attempt on your account?",
            "options": [
                { "text": "Ignore it if it’s old", "correct": false },
                { "text": "Change your password and enable 2FA", "correct": true },
                { "text": "Log out and log back in", "correct": false },
                { "text": "Contact the site later", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Secure your account with a new password and 2FA.",
                "incorrect": "That's risky. Act immediately to secure your account."
            },
            "category": "authentication",
            "difficulty": "normal"
        },
        {
            "id": 55,
            "question": "Is it safe to share your location on social media live?",
            "options": [
                { "text": "Yes, if it’s with friends", "correct": false },
                { "text": "No, disable location sharing", "correct": true },
                { "text": "Yes, if it’s a public event", "correct": false },
                { "text": "No, but post later", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Live location can attract unwanted attention.",
                "incorrect": "That's risky. Turn off location sharing."
            },
            "category": "privacy",
            "difficulty": "normal"
        },
        {
            "id": 56,
            "question": "What should you do if a website asks for your camera access?",
            "options": [
                { "text": "Allow it to proceed", "correct": false },
                { "text": "Deny it unless necessary", "correct": true },
                { "text": "Allow it but cover the camera", "correct": false },
                { "text": "Deny it and leave the site", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Only allow camera access when required.",
                "incorrect": "That's risky. Deny unless it’s essential."
            },
            "category": "website",
            "difficulty": "normal"
        },
        {
            "id": 57,
            "question": "How can you secure your smart home devices?",
            "options": [
                { "text": "Use default passwords", "correct": false },
                { "text": "Change passwords and update firmware", "correct": true },
                { "text": "Leave them on guest Wi-Fi", "correct": false },
                { "text": "Disable updates", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Strong passwords and updates secure smart devices.",
                "incorrect": "That's unsafe. Update and change passwords."
            },
            "category": "network",
            "difficulty": "normal"
        },
        {
            "id": 58,
            "question": "What should you do if you receive a fake invoice email?",
            "options": [
                { "text": "Pay it if it looks real", "correct": false },
                { "text": "Report it and verify with the sender", "correct": true },
                { "text": "Reply to ask for details", "correct": false },
                { "text": "Forward it to colleagues", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Fake invoices are common scams. Verify directly.",
                "incorrect": "That's risky. Report and confirm with the sender."
            },
            "category": "phishing",
            "difficulty": "normal"
        },
        {
            "id": 59,
            "question": "Is it safe to use a shared work computer for personal tasks?",
            "options": [
                { "text": "Yes, if you log out", "correct": false },
                { "text": "No, avoid sensitive activities", "correct": true },
                { "text": "Yes, if it’s after hours", "correct": false },
                { "text": "No, but use incognito", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Shared computers can retain your data. Avoid personal use.",
                "incorrect": "That's risky. Don’t use shared computers for personal tasks."
            },
            "category": "access",
            "difficulty": "normal"
        },
        {
            "id": 60,
            "question": "Should you disable your firewall for a game to work?",
            "options": [
                { "text": "Yes, if the game requires it", "correct": false },
                { "text": "No, find a safer solution", "correct": true },
                { "text": "Yes, but only temporarily", "correct": false },
                { "text": "No, but ask a friend", "correct": false }
            ],
            "feedback": {
                "correct": "Correct! Keep your firewall on for security.",
                "incorrect": "That's risky. Avoid disabling your firewall."
            },
            "category": "network",
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
            "category": "phishing",
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
            "category": "social",
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
            "category": "data",
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
            "category": "authentication",
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
            "category": "phishing",
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
            "category": "data",
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
            "category": "social",
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
            "category": "authentication",
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
            "category": "phishing",
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
            "category": "updates",
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
            "category": "authentication",
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
            "category": "network",
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
            "category": "network",
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
            "category": "data",
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
            "category": "data",
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
            "category": "phishing",
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
            "category": "physical",
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
            "category": "social",
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
            "category": "financial",
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
            "category": "data",
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
            "category": "network",
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
            "category": "data",
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
            "category": "phishing",
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
            "category": "network",
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
            "category": "data",
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
            "category": "authentication",
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
            "category": "privacy",
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
            "category": "downloads",
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
            "category": "physical",
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
            "category": "data",
            "difficulty": "hard"
        }
    ],
    "popups": [
        {
            "id": 1,
            "question": "Click this email to claim more Shopee vouchers!!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Good choice! Clicking on unsolicited email links can lead to phishing scams. Always verify offers through official channels.",
                "incorrect": "Be cautious! This is likely a phishing attempt. Never click links in unsolicited emails promising rewards."
            },
            "category": "phishing"
        },
        {
            "id": 2,
            "question": "You've won a free iPhone! Click here to provide your address and claim it now!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Well done! Unsolicited offers of free products are often scams. Avoid clicking such links.",
                "incorrect": "Careful! Offers of free items are common phishing tactics. Always verify through trusted sources."
            },
            "category": "phishing"
        },
        {
            "id": 3,
            "question": "Your account is locked! Click here to verify your identity and regain access!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Correct! Unexpected account lock messages are often scams. Contact the service directly to verify.",
                "incorrect": "That's risky! Such messages are often phishing attempts. Verify account issues through official channels."
            },
            "category": "phishing"
        },
        {
            "id": 4,
            "question": "I should not fill out all my private details to get the freebies. Is this a good practices?",
            "options": [
                { "text": "Yes", "correct": true },
                { "text": "No", "correct": false }
            ],
            "feedback": {
                "correct": "Well done! Do not share any personal information to avoid getting scammed.",
                "incorrect": "Careful! Sharing personal information is a common phishing tactic. Always verify through trusted sources."
            },
            "category": "phishing"
        },
        {
            "id": 5,
            "question": "I should share all my password and credentials to my friends. Is this a good practices?",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Well done! Do not share any personal information to anyone, even your closest friends or family.",
                "incorrect": "Careful! Sharing your personal information is not a good practice as it can be used by impersonators or fraudsters."
            },
            "category": "privacy"
        },
        {
            "id": 6,
            "question": "Click to win a free Amazon gift card!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Good choice! Free gift card offers are often scams.",
                "incorrect": "Be cautious! This is likely a phishing attempt."
            },
            "category": "phishing"
        },
        {
            "id": 7,
            "question": "Update your browser now to avoid security risks!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Correct! Unsolicited update pop-ups are often fake.",
                "incorrect": "That's risky! Verify updates through official sources."
            },
            "category": "phishing"
        },
        {
            "id": 7,
            "question": "Join our public Wi-Fi for faster internet!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Correct! Public Wi-Fi can expose your data to attackers.",
                "incorrect": "That's risky! Avoid unverified Wi-Fi networks."
            },
            "category": "network"
        },
        {
            "id": 8,
            "question": "Share your location for a free reward!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Well done! Sharing location can compromise your privacy.",
                "incorrect": "Careful! Avoid sharing location for rewards."
            },
            "category": "privacy"
        },
        {
            "id": 9,
            "question": "Urgent: Your boss needs you to send payroll data now!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Good choice! Urgent demands may be social engineering. Verify first.",
                "incorrect": "That's risky! Confirm with your boss directly."
            },
            "category": "social"
        },
        {
            "id": 10,
            "question": "Plug in this USB to claim a prize!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Correct! Unknown USBs can contain malware.",
                "incorrect": "Be cautious! Avoid using unsolicited USBs."
            },
            "category": "physical"
        },
        {
            "id": 11,
            "question": "Your account is locked! Verify with this link!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Well done! Account lock pop-ups are often phishing scams.",
                "incorrect": "That's risky! Verify through the official site."
            },
            "category": "phishing"
        },
        {
            "id": 12,
            "question": "Download this update to fix your system!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Good choice! Fake updates can install malware.",
                "incorrect": "Be cautious! Check updates via official sources."
            },
            "category": "malware"
        },
        {
            "id": 13,
            "question": "Connect to this free hotspot for better speed!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Correct! Free hotspots can intercept your data.",
                "incorrect": "That's risky! Use a secure network instead."
            },
            "category": "network"
        },
        {
            "id": 14,
            "question": "Allow camera access for a fun filter!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Well done! Unnecessary camera access can compromise privacy.",
                "incorrect": "Careful! Deny unless it’s essential."
            },
            "category": "privacy"
        },
        {
            "id": 15,
            "question": "Your friend needs help! Send money via this link!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Good choice! This could be a social engineering scam. Verify with your friend.",
                "incorrect": "That's risky! Confirm with your friend first."
            },
            "category": "social"
        },
        {
            "id": 16,
            "question": "Use this public charging station for free!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Correct! Public chargers can steal data via juice jacking.",
                "incorrect": "Be cautious! Use your own charger instead."
            },
            "category": "physical"
        },
        {
            "id": 17,
            "question": "Get a free app to boost your phone’s performance!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Well done! Free performance apps can be malware.",
                "incorrect": "Careful! Download only from trusted stores."
            },
            "category": "malware"
        },
        {
            "id": 18,
            "question": "Join this network to access exclusive content!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Good choice! Unverified networks can compromise security.",
                "incorrect": "That's risky! Stick to known networks."
            },
            "category": "network"
        },
        {
            "id": 19,
            "question": "Share your birthdate for a discount!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Correct! Sharing personal data can lead to identity theft.",
                "incorrect": "Be cautious! Avoid sharing personal info."
            },
            "category": "privacy"
        },
        {
            "id": 20,
            "question": "Enter your details to claim a free vacation!",
            "options": [
                { "text": "Yes", "correct": false },
                { "text": "No", "correct": true }
            ],
            "feedback": {
                "correct": "Well done! Free vacation offers are usually scams.",
                "incorrect": "Careful! Avoid sharing details for unsolicited offers."
            },
            "category": "phishing"
        }
    ]
}
