document.addEventListener('DOMContentLoaded', () => {
    let originalText = '';
    let currentText = '';
    let intervalId = null;
    let indicesToChange = [];
    let changeCount = 0;
    let startLetters = [];
    let lang = new URLSearchParams(window.location.search).get('lang') || 'en';
    let timerId = null;
    let timeLeft = 60; // Timer set to 60 seconds

    async function loadText() {
        try {
            const xmlFile = lang === 'ar' ? 'texts-ar.xml' : 'texts.xml';
            const response = await fetch(xmlFile);
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            const texts = xmlDoc.getElementsByTagName('text');
            if (texts.length === 0) throw new Error('No texts found in XML.');
            const randomIndex = Math.floor(Math.random() * texts.length);
            originalText = texts[randomIndex].textContent.trim();
            currentText = originalText;

            if (lang === 'ar') {
                document.body.style.direction = "rtl"; // Right to left for Arabic
            }

            const middleIndex = Math.floor(originalText.length / 2);
            indicesToChange = [middleIndex - 2, middleIndex]; // Middle two letters

            startLetters = indicesToChange.map(i => originalText[i]);
            displayTextWithSpans(currentText);

            startChangingLetters();
            startTimer();
        } catch (error) {
            console.error('Error loading text:', error);
        }
    }

    function changeLetters() {
        if (indicesToChange.length === 0) return;

        let textArray = currentText.split('');
        indicesToChange.forEach((i, index) => {
            const startChar = startLetters[index];

            if (lang === 'ar') {
                textArray[i] = getNextArabicChar(startChar, changeCount);
            } else {
                const startCode = startChar.charCodeAt(0);
                textArray[i] = String.fromCharCode(((startCode - 65 + changeCount) % 26) + 65);
            }

            const span = document.querySelector(`#text-display span:nth-child(${i + 1})`);
            if (span) {
                span.classList.add('jackpot-letter');
                setTimeout(() => {
                    span.classList.remove('jackpot-letter');
                }, 1000);
            }
        });

        currentText = textArray.join('');
        displayTextWithSpans(currentText);
        changeCount++;
    }

    function getNextArabicChar(currentChar, step) {
        const arabicAlphabet = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';
        const currentIndex = arabicAlphabet.indexOf(currentChar);
        if (currentIndex === -1) return currentChar;

        const nextIndex = (currentIndex + step) % arabicAlphabet.length;
        return arabicAlphabet[nextIndex];
    }

    function startChangingLetters() {
        if (intervalId === null) {
            intervalId = setInterval(changeLetters, 200);
        }
    }

    function stopChangingLetters() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;

            checkText();
        }
    }

    function showOverlay(type) {
        const messageOverlay = document.getElementById('message-overlay');
        if (type === 'success') {
            messageOverlay.className = 'overlay success';
        } else if (type === 'error') {
            messageOverlay.className = 'overlay error';
        }
        messageOverlay.style.display = 'block';

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 5000);
    }

    function checkText() {
        const textDisplay = document.getElementById('text-display');
        const spans = textDisplay.querySelectorAll('span');
        const displayText = Array.from(spans).map(span => span.textContent).join('');

        if (displayText === originalText) {
            showOverlay('success');
        } else {
            showOverlay('error');
        }
    }

    function showTimeUpOverlay() {
        const timeUpOverlay = document.getElementById('time-up-overlay');
        timeUpOverlay.style.display = 'block';

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 5000);
    }

    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            updateClockDisplay(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerId);
                showTimeUpOverlay();
                stopChangingLetters();
            }
        }, 1000);
    }

    function updateClockDisplay(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        // document.getElementById('clock-time').innerText = `00:${minutes}:${secs}`;
        document.getElementById('clock-time').innerText = `${secs}`;
    }

    function displayTextWithSpans(text) {
        const textDisplay = document.getElementById('text-display');
        textDisplay.innerHTML = text.split('').map(letter => `<span>${letter}</span>`).join('');
    }

    document.body.addEventListener('touchstart', stopChangingLetters);
    document.body.addEventListener('click', stopChangingLetters);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            stopChangingLetters();
        }
    });

    loadText();
});
