document.addEventListener('DOMContentLoaded', () => {
    let originalText = '';
    let currentText = '';
    let intervalId = null;
    let indicesToChange = [];
    let changeCount = 0;
    let startLetters = [];
    let lang = new URLSearchParams(window.location.search).get('lang') || 'en';
    let timerId = null;
    let timeLeft = 30; // Timer set to 30 seconds

    async function loadText() {
        try {
            const xmlFile = lang === 'ar' ? 'texts-ar.xml' : 'texts.xml'; // Use different XML file based on language
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
            displayTextWithSpans(currentText); // Display the text with spans

            // Start changing letters automatically
            startChangingLetters();
            startTimer(); // Start the timer
        } catch (error) {
            console.error('Error loading text:', error);
        }
    }

    function changeLetters() {
        if (indicesToChange.length === 0) return;

        let textArray = currentText.split('');
        indicesToChange.forEach((i, index) => {
            const startChar = startLetters[index];
            const startCode = startChar.charCodeAt(0);
            
            // Handle letter change for Arabic characters
            if (lang === 'ar') {
                // Arabic letters cycling logic
                textArray[i] = getNextArabicChar(startChar, changeCount);
            } else {
                // Latin letters cycling logic
                textArray[i] = String.fromCharCode(((startCode - 65 + changeCount) % 26) + 65); // A-Z cycling
            }
        });

        currentText = textArray.join('');
        displayTextWithSpans(currentText); // Update displayed text with spans
        changeCount++;
    }

    function getNextArabicChar(currentChar, step) {
        const arabicAlphabet = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'; // Simplified Arabic alphabet
        const currentIndex = arabicAlphabet.indexOf(currentChar);
        if (currentIndex === -1) return currentChar; // Return the current character if not in the alphabet

        const nextIndex = (currentIndex + step) % arabicAlphabet.length;
        return arabicAlphabet[nextIndex];
    }

    function startChangingLetters() {
        if (intervalId === null) {
            intervalId = setInterval(changeLetters, 900); // Change letters every 900ms
        }
    }

    function stopChangingLetters() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;

            // After stopping, check the text
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

        // Redirect to home page after showing the message
        setTimeout(() => {
            window.location.href = 'home.html'; // Adjust the URL if necessary
        }, 2000); // Redirect after 2 seconds
    }

    function checkText() {
        const textDisplay = document.getElementById('text-display');
        const spans = textDisplay.querySelectorAll('span');
        const displayText = Array.from(spans).map(span => span.textContent).join(''); // Concatenate span text content

        console.log(`Display Text: ${displayText}`);
        console.log(`Original Text: ${originalText}`);

        // Show success if the display text matches the original text
        if (displayText === originalText) {
            console.log("Texts match, showing success.");
            showOverlay('success');
        } else {
            console.log("Texts do not match, showing error.");
            showOverlay('error');
        }
    }

    function showTimeUpOverlay() {
        const timeUpOverlay = document.getElementById('time-up-overlay');
        timeUpOverlay.style.display = 'block';

        // Redirect to home page after showing the time-up message
        setTimeout(() => {
            window.location.href = 'home.html'; // Adjust the URL if necessary
        }, 2000); // Redirect after 2 seconds
    }

    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('time-display').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                showTimeUpOverlay();
                stopChangingLetters(); // Automatically stop the letter change
            }
        }, 1000); // Update every second
    }

    function displayTextWithSpans(text) {
        const textDisplay = document.getElementById('text-display');
        textDisplay.innerHTML = text.split('').map(letter => `<span>${letter}</span>`).join('');
    }

    // Add touch event listener for stopping the animation
    document.body.addEventListener('touchstart', stopChangingLetters);
    
    // Add mouse click event listener for stopping the animation
    document.body.addEventListener('click', stopChangingLetters);
    
    // Add keyboard event listener for stopping the animation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { // Trigger stop on Enter key press
            stopChangingLetters();
        }
    });

    // Load text when the page is ready
    loadText();
});
