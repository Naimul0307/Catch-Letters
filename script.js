document.addEventListener('DOMContentLoaded', () => {
    let originalText = '';
    let currentText = '';
    let intervalId = null;
    let indicesToChange = [];
    let changeCount = 0;
    let startLetters = [];

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
            currentText = originalText;

            const middleIndex = Math.floor(originalText.length / 2);
            indicesToChange = [middleIndex - 2, middleIndex]; // Middle two letters

            startLetters = indicesToChange.map(i => originalText[i]); // Starting letters from the text
            document.getElementById('text-display').innerText = currentText;

            // Start changing letters automatically
            startChangingLetters();
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
            textArray[i] = String.fromCharCode(((startCode - 65 + changeCount) % 26) + 65); // A-Z cycling
        });

        currentText = textArray.join('');
        document.getElementById('text-display').innerText = currentText;
        changeCount++;
    }

    function startChangingLetters() {
        if (intervalId === null) {
            intervalId = setInterval(changeLetters, 300); // Change letters every 500ms
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
