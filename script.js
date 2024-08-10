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
                startTimer(); // Start the timer
            } catch (error) {
                console.error('Error loading text:', error);
            }
        }
    
        function translateToArabic(text) {
            // Example translation function, you should replace with actual logic
            const translations = {
                'A': 'أ',  // Alif with Hamza
                'B': 'ب',  // Ba
                'C': 'ت',  // Ta
                'D': 'د',  // Dal
                'E': 'ي',  // Ya
                'F': 'ف',  // Fa
                'G': 'ج',  // Jeem
                'H': 'ه',  // Ha
                'I': 'ي',  // Ya (often used for vowels)
                'J': 'ج',  // Jeem
                'K': 'ك',  // Kaf
                'L': 'ل',  // Lam
                'M': 'م',  // Meem
                'N': 'ن',  // Noon
                'O': 'و',  // Waw
                'P': 'ب',  // Ba (Arabic doesn't have a direct equivalent for "P", Ba is often used)
                'Q': 'ق',  // Qaf
                'R': 'ر',  // Ra
                'S': 'س',  // Seen
                'T': 'ت',  // Ta
                'U': 'و',  // Waw (often used for vowels)
                'V': 'ف',  // Fa (Arabic doesn't have a direct equivalent for "V", Fa is often used)
                'W': 'و',  // Waw
                'X': 'كس', // Kaf + Seen (There isn't a direct equivalent for "X", but it's often written as "Kaf + Seen")
                'Y': 'ي',  // Ya
                'Z': 'ز'   // Zay
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
                intervalId = setInterval(changeLetters, 500); // Change letters every 500ms
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
            const displayText = document.getElementById('text-display').innerText.trim();
    
            if (displayText === originalText) {
                showOverlay('success');
            } else {
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
                document.getElementById('time').innerText = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    showTimeUpOverlay();
                    stopChangingLetters(); // Automatically stop the letter change
                }
            }, 1000); // Update every second
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