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
            indicesToChange = getRandomIndices(3, originalText.length);
            startLetters = indicesToChange.map(i => originalText[i]); // Starting letters from the text
            document.getElementById('text-display').innerText = currentText;
        } catch (error) {
            console.error('Error loading text:', error);
        }
    }

    function getRandomIndices(count, max) {
        const indices = new Set();
        while (indices.size < count) {
            const randomIndex = Math.floor(Math.random() * max);
            if (/[A-Z]/.test(originalText[randomIndex])) { // Ensure only letters are targeted
                indices.add(randomIndex);
            }
        }
        return Array.from(indices);
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

    document.getElementById('start-change').addEventListener('click', startChangingLetters);
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
