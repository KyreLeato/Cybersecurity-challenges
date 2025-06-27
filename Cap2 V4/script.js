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
const POPUP_TRIGGER_QUESTION = Math.floor(Math.random() * (7 - 3 + 1)) + 3;

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
    if (!loadingContainer) {
        console.error('Error: loadingContainer is null');
        return;
    }
    loadingContainer.classList.add('fade-out');
    setTimeout(() => {
        loadingContainer.style.display = 'none';
        if (guidebookBtn) guidebookBtn.style.display = 'inline-block';
        if (disclaimerSection) disclaimerSection.style.display = 'block';
        else console.error('Error: disclaimerSection is null');
    }, 500);
}, 3000);

// Checkbox enables start button
agreeCheckbox.addEventListener('change', function() {
    if (!startButton) {
        console.error('Error: startButton is null');
        return;
    }
    startButton.disabled = !this.checked;
    console.log('Checkbox state:', this.checked);
});

// Start button shows difficulty selection
startButton.addEventListener('click', function() {
    if (!disclaimerSection || !difficultySection) {
        console.error('Error: disclaimerSection or difficultySection is null', {
            disclaimerSection: disclaimerSection,
            difficultySection: difficultySection
        });
        return;
    }
    console.log('Start button clicked, transitioning to difficulty section');
    disclaimerSection.style.display = 'none';
    difficultySection.style.display = 'block';
    if (guidebookBtn) guidebookBtn.style.display = 'none';
});

// Difficulty selection
difficultyButtons.forEach(button => {
    button.addEventListener('click', async function() {
        if (!this.dataset.difficulty) {
            console.error('Error: Difficulty button missing data-difficulty attribute');
            return;
        }
        selectedDifficulty = this.dataset.difficulty;
        console.log('Difficulty selected:', selectedDifficulty);
        if (!difficultySection || !gameSection) {
            console.error('Error: difficultySection or gameSection is null', {
                difficultySection: difficultySection,
                gameSection: gameSection
            });
            return;
        }
        difficultySection.style.display = 'none';
        gameSection.style.display = 'block';
        await initGame();
    });
});

// Next button
nextButton.addEventListener('click', function() {
    if (!feedbackContainer || !nextButton) {
        console.error('Error: feedbackContainer or nextButton is null');
        return;
    }
    feedbackContainer.style.display = 'none';
    nextButton.style.display = 'none';
    currentScenarioIndex++;
    console.log('Next button clicked, currentScenarioIndex:', currentScenarioIndex);

    if (!popupTriggered && currentScenarioIndex === POPUP_TRIGGER_QUESTION) {
        showPopup();
    } else if (currentScenarioIndex < selectedScenarios.length) {
        loadScenario();
    } else {
        completeGame();
    }
});

// Restart button
restartButton.addEventListener('click', async function() {
    if (!gameCompleted || !difficultySection) {
        console.error('Error: gameCompleted or difficultySection is null');
        return;
    }
    console.log('Restart button clicked');
    gameCompleted.style.display = 'none';
    difficultySection.style.display = 'block';
    popupTriggered = false;
    selectedDifficulty = null; // Explicitly reset to null to enforce new selection
    selectedScenarios = []; // Clear selected scenarios
    currentScenarioIndex = 0; // Reset index
    score = 0; // Reset score
    scoreValue.textContent = score; // Update UI
    // Do not call initGame here; let difficulty selection trigger it
});

// Quit button
quitButton.addEventListener('click', function() {
    console.log('Quit button clicked');
    const playerName = document.getElementById('playerName') ? document.getElementById('playerName').value : 'Anonymous';
    const playerAge = document.getElementById('playerAge') ? document.getElementById('playerAge').value : '';
    const result = `${score}/${maxScore}`;

    const googleFormURL = `https://docs.google.com/forms/d/e/1FAIpQLSetaJQxQ_21zgpTOI-O1vFn6q2g3U5gQWlsNtDe19ypXz2Z2g/viewform?usp=pp_url`
        + `&entry.753452273=${encodeURIComponent(playerName)}`
        + `&entry.735828413=${encodeURIComponent(playerAge)}`
        + `&entry.1000316234=${encodeURIComponent(result)}`;

    window.open(googleFormURL, '_blank');
    window.location.href = 'index.html';
});

// Game Functions

async function fetchScenarios() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Failed to fetch questions.json');
        }
        scenariosData = await response.json();
    } catch (error) {
        console.error('Error fetching scenarios:', error);
        alert('Failed to load questions. Please try again later.');
    }
}

function selectRandomScenarios() {
    if (!scenariosData || !scenariosData.scenarios) {
        console.error('Error: scenariosData is null or missing scenarios');
        return [];
    }
    if (!['easy', 'normal', 'hard'].includes(selectedDifficulty)) {
        console.error('Error: Invalid difficulty selected:', selectedDifficulty);
        alert('Invalid difficulty selected. Please choose a difficulty level.');
        return [];
    }
    const filteredScenarios = scenariosData.scenarios.filter(scenario => scenario.difficulty === selectedDifficulty);
    if (filteredScenarios.length < QUESTIONS_PER_GAME) {
        console.error(`Error: Not enough scenarios for difficulty ${selectedDifficulty}. Found ${filteredScenarios.length}, need ${QUESTIONS_PER_GAME}`);
        alert(`Not enough questions available for ${selectedDifficulty} difficulty. Please try another difficulty.`);
        return [];
    }
    const allScenarioIds = [...Array(filteredScenarios.length).keys()];
    for (let i = allScenarioIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allScenarioIds[i], allScenarioIds[j]] = [allScenarioIds[i], allScenarioIds[j]];
    }
    const selectedIds = allScenarioIds.slice(0, QUESTIONS_PER_GAME);
    const selected = selectedIds.map(id => filteredScenarios[id]);
    console.log('Selected scenarios:', selected);
    return selected;
}

function selectRandomPopup() {
    if (!scenariosData || !scenariosData.popups) {
        console.error('Error: scenariosData is null or missing popups');
        return null;
    }
    const popupIds = [...Array(scenariosData.popups.length).keys()];
    const randomIndex = Math.floor(Math.random() * popupIds.length);
    const selected = scenariosData.popups[popupIds[randomIndex]];
    console.log('Selected popup:', selected);
    return selected;
}

async function initGame() {
    if (!scenariosData) {
        await fetchScenarios();
    }
    if (!scenariosData) {
        console.error('Error: Failed to load scenariosData');
        return;
    }
    currentScenarioIndex = 0;
    score = 0;
    scoreValue.textContent = score;
    selectedScenarios = selectRandomScenarios();
    if (selectedScenarios.length === 0) {
        console.error('Error: No scenarios selected, reverting to difficulty section');
        gameSection.style.display = 'none';
        difficultySection.style.display = 'block';
        return;
    }
    console.log('Game initialized, loading first scenario');
    loadScenario();
}

function loadScenario() {
    if (!scenarioContainer || !optionsContainer || !scoreValue || !progressBar) {
        console.error('Error: Essential game elements are null', {
            scenarioContainer: scenarioContainer,
            optionsContainer: optionsContainer,
            scoreValue: scoreValue,
            progressBar: progressBar
        });
        return;
    }
    if (currentScenarioIndex >= selectedScenarios.length) {
        console.error('Error: currentScenarioIndex out of bounds', {
            currentScenarioIndex: currentScenarioIndex,
            selectedScenariosLength: selectedScenarios.length
        });
        completeGame();
        return;
    }
    const scenario = selectedScenarios[currentScenarioIndex];
    if (!scenario) {
        console.error('Error: Invalid scenario at index', currentScenarioIndex);
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
    console.log('Scenario loaded:', scenario);
}

function selectOption(index, isCorrect) {
    if (!optionsContainer || !feedbackContainer || !nextButton || !scoreValue) {
        console.error('Error: Essential game elements are null in selectOption');
        return;
    }
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
    console.log('Option selected, score:', score, 'isCorrect:', isCorrect);
}

function showPopup() {
    popupTriggered = true;
    selectedPopup = selectRandomPopup();
    if (!selectedPopup) {
        console.error('Error: No popup selected, continuing to next scenario');
        if (currentScenarioIndex < selectedScenarios.length) {
            loadScenario();
        } else {
            completeGame();
        }
        return;
    }
    popupContainer.innerHTML = `
        <div class="popup">
            <h3>Urgent Alert!</h3>
            <p>${selectedPopup.question}</p>
            <button class="option-btn" onclick="handlePopupResponse(true)">Yes</button>
            <button class="option-btn" onclick="handlePopupResponse(false)">No</button>
            <div id="popupFeedback" class="feedback" style="display: none;"></div>
            <button class="close-btn" id="closePopup" style="display: none;">Continue</button>
        </div>
    `;
    popupContainer.style.display = 'flex';
    console.log('Popup shown:', selectedPopup);
}

function handlePopupResponse(isYes) {
    if (!popupContainer) {
        console.error('Error: popupContainer is null');
        return;
    }
    const popupFeedback = document.getElementById('popupFeedback');
    const closeButton = document.getElementById('closePopup');
    if (!popupFeedback || !closeButton) {
        console.error('Error: popupFeedback or closeButton is null');
        return;
    }
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
    console.log('Popup response handled, isCorrect:', isCorrect);
}

function completeGame() {
    if (!gameSection || !gameCompleted || !finalScore || !badgeContainer) {
        console.error('Error: Essential completion elements are null');
        return;
    }
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
    console.log('Game completed, score:', score, 'percentage:', percentage);
}