const textDisplay = document.getElementById("text-display");
const textInput = document.getElementById("text-input");
const wpmDisplay = document.getElementById("wpm");
const finalWpmDisplay = document.getElementById("final-wpm");
const accuracyDisplay = document.getElementById("accuracy");
const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");
const resultsSection = document.querySelector(".results");
const racecar = document.getElementById("racecar");

let startTime, currentText = "", typedText = "", interval;

// Function to fetch random words starting with a specific letter
async function fetchRandomWords(letter) {
    const apiUrl = `https://random-word-api.herokuapp.com/word?number=20&sw=${letter}`;
    
    try {
        const response = await fetch(apiUrl);
        let words = await response.json();

        // Ensure words are unique and start with the correct letter
        words = words
            .filter(word => word.toLowerCase().startsWith(letter))
            .slice(0, 10); // Select first 10 unique words

        return words.length > 0 ? words : [];
    } catch (error) {
        console.error("Error fetching words:", error);
        return [];
    }
}

// Function to generate a natural sentence
function constructSentence(words, letter) {
    if (words.length < 5) return "Not enough words found for a sentence.";

    const sentenceTemplates = [
        `The ${words[0]} ${words[1]} ${words[2]} before the ${words[3]} ${words[4]}.`,
        `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} ${words[1]} a ${words[2]} ${words[3]} near the ${words[4]}.`,
        `A ${words[0]} ${words[1]} with a ${words[2]} ${words[3]} beside the ${words[4]}.`,
        `Suddenly, the ${words[0]} ${words[1]} and the ${words[2]} ${words[3]} ${words[4]}.`
    ];

    return sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
}

// Function to get a random text based on difficulty
async function generateText() {
    const difficulty = difficultySelect.value;
    textDisplay.innerHTML = ""; // Clear previous text
    textInput.value = "";
    textInput.disabled = true;

    if (difficulty === "medium") {
        // Prompt user to enter a letter
        const userLetter = prompt("Enter a letter (A-Z):");
        if (userLetter && /^[a-zA-Z]$/.test(userLetter)) {
            const words = await fetchRandomWords(userLetter.toLowerCase());
            currentText = constructSentence(words, userLetter.toLowerCase());
        } else {
            alert("Invalid input. Please enter a single letter.");
            return;
        }
    } else {
        // Default easy/hard sentence selection
        const texts = textSamples[difficulty];
        currentText = texts[Math.floor(Math.random() * texts.length)];
    }

    // Display the generated text
    textDisplay.innerHTML = currentText.split("").map(letter => `<span>${letter}</span>`).join("");

    textInput.disabled = false;
    textInput.focus();
    moveRacecar(0);
    startTime = null;
}

// Function to update WPM dynamically
function updateStats() {
    if (!startTime) return;

    const elapsedTime = (Date.now() - startTime) / 60000; // Convert ms to minutes
    const wordCount = currentText.split(" ").length;
    const wpm = Math.round(wordCount / elapsedTime);

    wpmDisplay.textContent = isFinite(wpm) ? wpm : 0;
}

// Function to highlight correct and incorrect characters and move the racecar
function highlightErrors() {
    const characters = textDisplay.querySelectorAll("span");
    typedText = textInput.value;

    let correctCount = 0;

    characters.forEach((char, index) => {
        if (typedText[index] === undefined) {
            char.classList.remove("error", "correct");
        } else if (typedText[index] !== char.textContent) {
            char.classList.add("error");
            char.classList.remove("correct");
        } else {
            char.classList.add("correct");
            char.classList.remove("error");
            correctCount++;
        }
    });

    // Move the racecar based on correct characters
    moveRacecar((correctCount / currentText.length) * 100);
}

// Function to move the racecar along the track
function moveRacecar(progress) {
    racecar.style.left = `${progress}%`;
}

// Event listener for typing
textInput.addEventListener("input", () => {
    if (!startTime) {
        startTime = Date.now();
        interval = setInterval(updateStats, 500); // Update WPM every 500ms
    }

    highlightErrors();
    updateStats();

    if (typedText.length === currentText.length) {
        clearInterval(interval);
        textInput.disabled = true;
        finalWpmDisplay.textContent = wpmDisplay.textContent;
        resultsSection.style.display = "block";
    }
});

// Start button event listener
startButton.addEventListener("click", () => {
    resultsSection.style.display = "none";
    generateText();
});

// Restart button event listener
restartButton.addEventListener("click", () => {
    resultsSection.style.display = "none";
    textDisplay.innerHTML = "";
    textInput.value = "";
    textInput.disabled = true;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100";
    moveRacecar(0);
});
