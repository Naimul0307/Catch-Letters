document.addEventListener('DOMContentLoaded', () => {
    let originalText = '';
    let currentText = '';
    let intervalId = null;
    let changeCount = 0;
    let startLetters = [];
    let indicesToChange = [];
    let lang = new URLSearchParams(window.location.search).get('lang') || 'en';
    let timerId = null;
    let timeLeft = 60; // Timer set to 10 seconds

    async function loadText() {
        try {
            const response = await fetch('texts.xml');
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            const texts = xmlDoc.getElementsByTagName('text');
            if (texts.length === 0) throw new Error('No texts found in XML.');
            const randomIndex = Math.floor(Math.random() * texts.length);
            originalText = texts[randomIndex].textContent.trim();

            if (lang === 'ar') {
                originalText = translateToArabic(originalText);
                document.body.style.direction = "rtl"; // Right to left for Arabic
            }

            currentText = originalText;

            const middleIndex = Math.floor(originalText.length / 2);
            indicesToChange = [middleIndex - 2, middleIndex]; // Middle two letters

            startLetters = indicesToChange.map(i => originalText[i]);
            document.getElementById('text-display').innerText = currentText;

            // Start changing letters automatically
            startChangingLetters();

            // Start the timer
            startTimer();
        } catch (error) {
            console.error('Error loading text:', error);
        }
    }

    function translateToArabic(text) {
        const translations = {
            // Your translation logic here
        };
        return text.split('').map(letter => translations[letter] || letter).join('');
    }

    function changeLetters() {
        if (indicesToChange.length === 0) return;

        let textArray = currentText.split('');
        indicesToChange.forEach((i, index) => {
            const startChar = startLetters[index];
            const startCode = startChar.charCodeAt(0);
            textArray[i] = String.fromCharCode(((startCode - 65 + changeCount) % 26) + 65); // A-Z cycling

            if (lang === 'ar') {
                textArray[i] = translateToArabic(textArray[i]); // Convert to Arabic if needed
            }
        });

        currentText = textArray.join('');
        document.getElementById('text-display').innerText = currentText;
        changeCount++;
    }

    function startChangingLetters() {
        if (intervalId === null) {
            intervalId = setInterval(changeLetters, 900); // Change letters every 500ms
        }
    }

    function stopChangingLetters() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;

            // Check if the timer has run out
            if (timeLeft > 0) {
                // Only check text if the time hasn't run out
                checkText();
            }

            // Stop the timer
            clearInterval(timerId);
            timerId = null; // Ensure the timer doesn't restart
        }
    }

    function checkText() {
        const displayText = document.getElementById('text-display').innerText.trim();
        const message = document.getElementById('message');

        if (displayText === originalText) {
            message.innerText = 'Congratulations! Text is correct.';
            message.style.color = 'green';
        } else {
            message.innerText = 'Error! Text is incorrect.';
            message.style.color = 'red';
        }
    }

    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('time').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                document.getElementById('time-up-message').innerText = "Time's up!";
                document.getElementById('time-up-message').style.color = 'red';
                stopChangingLetters(); // Automatically stop the letter change
            }
        }, 1000); // Update every second
    }

    document.getElementById('stop-change').addEventListener('click', stopChangingLetters);
    document.getElementById('check-text').addEventListener('click', () => {
        if (intervalId === null) { // Ensure checking only when animation is stopped
            checkText();
        } else {
            alert('Please stop the letter change animation first.');
        }
    });

    // Load text when the page is ready
    loadText();
});
