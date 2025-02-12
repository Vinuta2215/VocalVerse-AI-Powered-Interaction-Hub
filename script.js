
    // DOM Elements
     const elements = {
    // Authentication elements
    signupForm: document.getElementById('signup-form'),
    loginForm: document.getElementById('login-form'),
    logoutBtn: document.getElementById('logout-btn'),
    appNav: document.getElementById('app-nav'),

    // Text to Speech elements
    textInput: document.getElementById('text-input'),
    voiceSelect: document.getElementById('voice-select'),
    pitch: document.getElementById('pitch'),
    pitchValue: document.getElementById('pitch-value'),
    rate: document.getElementById('rate'),
    rateValue: document.getElementById('rate-value'),
    speakBtn: document.getElementById('speak-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    resumeBtn: document.getElementById('resume-btn'),
    stopBtn: document.getElementById('stop-btn'),
    textSummary: document.getElementById('text-summary'),

    // Speech to Text elements
    startRecognitionBtn: document.getElementById('start-recognition-btn'),
    stopRecognitionBtn: document.getElementById('stop-recognition-btn'),
    transcriptBox: document.getElementById('transcript-box'),
    copyTranscriptBtn: document.getElementById('copy-transcript'),
    clearTranscriptBtn: document.getElementById('clear-transcript'),
    saveTranscriptBtn: document.getElementById('save-transcript-btn'),
    summary: document.getElementById('summary'),

    // Translator elements
    translateInput: document.getElementById('translate-input'),
    translateOutput: document.getElementById('translate-output'),
    targetLanguage: document.getElementById('target-language'),
    speakTranslation: document.getElementById('speak-translation'),
    translationRate: document.getElementById('translation-rate'),
    translationRateValue: document.getElementById('translation-rate-value'),
    translationPitch: document.getElementById('translation-pitch'),
    translationPitchValue: document.getElementById('translation-pitch-value'),
    // Text to Speech Recording
    ttsRecordBtn: document.getElementById('tts-record-btn'),
    ttsDownloadBtn: document.getElementById('tts-download-btn'),
    // Translator Recording
    translatorRecordBtn: document.getElementById('translator-record-btn'),
    translatorDownloadBtn: document.getElementById('translator-download-btn'),

    // AI Assistant elements
    aiListenBtn: document.getElementById('ai-listen-btn'),
    aiResponse: document.getElementById('ai-response'),

    // Theme toggle
    themeToggleBtn: document.getElementById('theme-toggle-btn')
};

// Global Variables
let recognition;
const synth = window.speechSynthesis;
let utterance;
let aiListening = false;
let startTime;
let fullTranscript = '';

// Speech Recognition Setup
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        console.log('Voice recognition started');
        if (!aiListening) {
            elements.transcriptBox.placeholder = "Listening...";
            fullTranscript = "";
            startTime = new Date();
        }
    };

    recognition.onend = function() {
        if (aiListening) {
            recognition.start();
        } else {
            console.log('Voice recognition ended');
            elements.transcriptBox.placeholder = "Recognition stopped";
            updateSttSummary();
        }
    };

    recognition.onresult = function(event) {
        if (aiListening) {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const command = result[0].transcript;
                handleCommand(command);
            }
        } else {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    fullTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            elements.transcriptBox.value = fullTranscript + interimTranscript;
            if (event.results[event.results.length - 1].isFinal) {
                updateSttSummary();
            }
        }
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        alert('Error: ' + event.error);
    };
} else {
    alert('Speech recognition is not supported in this browser.');
}

// Authentication Functions
function checkAuthStatus() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        elements.appNav.style.display = 'flex';
        showSection('text-to-speech');
    } else {
        showSection('auth-section');
    }
}

// Text-to-Speech Functions
function populateVoiceList() {
    const voices = synth.getVoices();
    elements.voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        elements.voiceSelect.appendChild(option);
    });
}

function updateTTSSummary() {
    const text = elements.textInput.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const rate = parseFloat(elements.rate.value);
    const estimatedTime = (wordCount / (150 / rate)).toFixed(2);

    elements.textSummary.innerHTML = `
        <p>Word Count: ${wordCount}</p>
        <p>Estimated Time: ${estimatedTime} seconds</p>
    `;
}

function speakText() {
    const text = elements.textInput.value.trim();
    if (!text) {
        alert('Please enter some text to speak.');
        return;
    }

    if (synth.speaking) {
        synth.cancel();
    }

    utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = synth.getVoices().find(voice => voice.name === elements.voiceSelect.value);
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.pitch = parseFloat(elements.pitch.value);
    utterance.rate = parseFloat(elements.rate.value);
    synth.speak(utterance);
}

// Speech-to-Text Functions
function updateSttSummary() {
    const words = fullTranscript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    let timeTaken = 0;
    if (startTime) {
        timeTaken = Math.round((new Date() - startTime) / 1000);
    }

    elements.summary.innerHTML = `
        <p>Word Count: ${wordCount}</p>
        <p>Time Taken: ${timeTaken} seconds</p>
    `;
}

function saveTranscript() {
    const text = elements.transcriptBox.value.trim();
    if (!text) {
        alert('No transcript to save.');
        return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}



// AI Assistant Functions
function handleCommand(command) {
    command = command.toLowerCase().trim();
    let response = '';
    let url = '';

    switch (true) {
        case command.includes('open youtube'):
            response = 'Opening YouTube...';
            url = 'https://www.youtube.com';
            break;
        case command.includes('open google'):
            response = 'Opening Google...';
            url = 'https://www.google.com';
            break;
        case command.includes('text to speech'):
            response = 'Switching to Text to Speech...';
            showSection('text-to-speech');
            break;
        case command.includes('speech to text'):
            response = 'Switching to Speech to Text...';
            showSection('speech-to-text');
            break;
        case command.includes('translator'):
            response = 'Switching to Translator...';
            showSection('translator');
            break;
        case command.includes('logout'):
            response = 'Logging out...';
            handleLogout();
            break;
        default:
            response = `Searching Google for "${command}"...`;
            url = `https://www.google.com/search?q=${encodeURIComponent(command)}`;
    }

    elements.aiResponse.innerHTML = `
        <p>Command: "${command}"</p>
        <p>Response: ${response}</p>
    `;

    const utterance = new SpeechSynthesisUtterance(response);
    synth.speak(utterance);

    if (url) {
        setTimeout(() => window.open(url, '_blank'), 1000);
    }
}

// Utility Functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function handleLogout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    aiListening = false;
    if (recognition) recognition.stop();
    if (synth.speaking) synth.cancel();
    elements.aiListenBtn.innerHTML = '🎙️ Start Listening';
    elements.aiListenBtn.classList.remove('listening');
    checkAuthStatus();
}

// Event Listeners
// Authentication
elements.signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);
    alert('Sign-up successful! You can now log in.');
    showSection('auth-section');
});

elements.loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const storedEmail = localStorage.getItem('userEmail');
    const storedPassword = localStorage.getItem('userPassword');

    if (email === storedEmail && password === storedPassword) {
        alert('Login successful!');
        elements.appNav.style.display = 'flex';
        showSection('text-to-speech');
    } else {
        alert('Invalid credentials!');
    }
});

elements.logoutBtn.addEventListener('click', handleLogout);

// Text-to-Speech
elements.pitch.addEventListener('input', () => {
    elements.pitchValue.textContent = elements.pitch.value;
});

elements.rate.addEventListener('input', () => {
    elements.rateValue.textContent = elements.rate.value;
});

elements.textInput.addEventListener('input', updateTTSSummary);
elements.speakBtn.addEventListener('click', speakText);
elements.pauseBtn.addEventListener('click', () => synth.pause());
elements.resumeBtn.addEventListener('click', () => synth.resume());
elements.stopBtn.addEventListener('click', () => synth.cancel());

// Speech-to-Text
elements.startRecognitionBtn.addEventListener('click', () => {
    if (recognition) recognition.start();
});

elements.stopRecognitionBtn.addEventListener('click', () => {
    if (recognition) recognition.stop();
});

elements.copyTranscriptBtn.addEventListener('click', () => {
    const text = elements.transcriptBox.value.trim();
    if (!text) {
        alert('No text to copy.');
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => alert('Text copied to clipboard!'))
        .catch(err => alert('Failed to copy text: ' + err));
});

elements.clearTranscriptBtn.addEventListener('click', () => {
    elements.transcriptBox.value = '';
    fullTranscript = '';
    updateSttSummary();
});

elements.saveTranscriptBtn.addEventListener('click', saveTranscript);

// AI Assistant
elements.aiListenBtn.addEventListener('click', function() {
    if (!aiListening) {
        aiListening = true;
        this.innerHTML = 'Listening...👂';
        this.classList.add('listening');
        elements.aiResponse.innerHTML = '<p>AI Assistant is listening...</p>';
        
        const utterance = new SpeechSynthesisUtterance('Hello, how can I help you?');
        synth.speak(utterance);

        setTimeout(() => {
            if (recognition) recognition.start();
        }, 1500);
    } else {
        aiListening = false;
        this.innerHTML = '🎙️ Start Listening';
        this.classList.remove('listening');
        if (recognition) recognition.stop();
    }
});

// Theme Toggle
elements.themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    this.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// Initialize
synth.onvoiceschanged = populateVoiceList;
checkAuthStatus();
populateVoiceList();
updateTTSSummary();

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    elements.themeToggleBtn.textContent = '☀️ Light Mode';
}

// Utility Functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Enhanced Signup Form Validation
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset all error messages
    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    
    // Get form values
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    let isValid = true;

    // Validate username
    if (username.length < 3) {
        document.getElementById('username-error').textContent = 'Username must be at least 3 characters long';
        isValid = false;
    }

    // Validate email
    if (!validateEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address';
        isValid = false;
    }

    // Validate phone
    if (!/^[0-9]{10}$/.test(phone)) {
        document.getElementById('phone-error').textContent = 'Phone number must be exactly 10 digits';
        isValid = false;
    }

    // Validate password
    if (password.length < 8) {
        document.getElementById('password-error').textContent = 'Password must be at least 8 characters long';
        isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        isValid = false;
    }

    if (isValid) {
        // Store user data
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('userName', username);
        localStorage.setItem('userPhone', phone);

        alert('Sign up successful! Please log in.');
        this.reset();
    }
});

// Login Form Validation
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    const storedEmail = localStorage.getItem('userEmail');
    const storedPassword = localStorage.getItem('userPassword');

    if (email === storedEmail && password === storedPassword) {
        document.getElementById('app-nav').style.display = 'flex';
        showSection('text-to-speech');
    } else {
        document.getElementById('login-password-error').textContent = 'Invalid email or password';
    }
});

// Logout Functionality
document.getElementById('logout-btn').addEventListener('click', function() {
    document.getElementById('app-nav').style.display = 'none';
    showSection('auth-section');
    document.getElementById('login-form').reset();
});

// Phone Number Input Validation
document.getElementById('signup-phone').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
    }
});

// Elements for font size control
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeValue = document.getElementById('font-size-value');
const textInput = document.getElementById('text-input');

// Update font size when slider changes
fontSizeSlider.addEventListener('input', function () {
    const fontSize = fontSizeSlider.value;
    fontSizeValue.textContent = fontSize;
    textInput.style.fontSize = `${fontSize}px`;
});

function speakTranslatedText() {
    const translatedText = elements.translateOutput.value.trim();
    if (!translatedText) {
        alert('Please translate some text first.');
        return;
    }

    // Cancel any ongoing speech
    if (synth.speaking) {
        synth.cancel();
    }

    // Create new utterance with the translated text
    const utterance = new SpeechSynthesisUtterance(translatedText);
    
    // Set the language based on the selected target language
    const targetLang = elements.targetLanguage.value;
    utterance.lang = targetLang;

    // Set speech parameters
    utterance.rate = parseFloat(elements.translationRate.value);
    utterance.pitch = parseFloat(elements.translationPitch.value);

    // Find a voice that matches the target language
    const voices = synth.getVoices();
    const targetVoice = voices.find(voice => voice.lang.startsWith(targetLang));
    if (targetVoice) {
        utterance.voice = targetVoice;
    }

    // Speak the translation
    synth.speak(utterance);
}

// Add event listeners for translation speech controls
elements.translationRate.addEventListener('input', function() {
    elements.translationRateValue.textContent = this.value;
});

elements.translationPitch.addEventListener('input', function() {
    elements.translationPitchValue.textContent = this.value;
});

// Add event listener for speak translation button
elements.speakTranslation.addEventListener('click', speakTranslatedText);

// Modify the existing translateText function to include voice selection
async function translateText() {
    const text = elements.translateInput.value.trim();
    const targetLang = elements.targetLanguage.value;

    if (!text) {
        alert('Please enter text to translate.');
        return;
    }

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        elements.translateOutput.value = data.responseData.translatedText;
        
        // Update available voices for the new language
        const voices = synth.getVoices();
        const targetVoice = voices.find(voice => voice.lang.startsWith(targetLang));
        if (!targetVoice) {
            console.log(`No voice found for language: ${targetLang}`);
        }
    } catch (error) {
        alert('Translation error: ' + error.message);
    }
}

// Audio Recording Class
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
    }

    async startRecording() {
        try {
            this.audioChunks = [];
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            this.isRecording = true;
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.isRecording = false;
                this.stream.getTracks().forEach(track => track.stop());
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
        });
    }
}

// Add these elements to the existing elements object
Object.assign(elements, {
    ttsRecordBtn: document.createElement('button'),
    ttsDownloadBtn: document.createElement('button'),
    translatorRecordBtn: document.createElement('button'),
    translatorDownloadBtn: document.createElement('button')
});

// Initialize recorders
const ttsRecorder = new AudioRecorder();
const translatorRecorder = new AudioRecorder();

// Setup recording buttons
function setupRecordingButtons() {
    // Text to Speech recording buttons
    elements.ttsRecordBtn.innerHTML = '🔴 Record';
    elements.ttsRecordBtn.className = 'record-btn';
    elements.ttsDownloadBtn.innerHTML = '⬇️ Download Recording';
    elements.ttsDownloadBtn.className = 'download-btn';
    elements.ttsDownloadBtn.style.display = 'none';

    // Translator recording buttons
    elements.translatorRecordBtn.innerHTML = '🔴 Record';
    elements.translatorRecordBtn.className = 'record-btn';
    elements.translatorDownloadBtn.innerHTML = '⬇️ Download Recording';
    elements.translatorDownloadBtn.className = 'download-btn';
    elements.translatorDownloadBtn.style.display = 'none';

    // Add buttons to DOM
    const ttsButtonGroup = document.querySelector('#text-to-speech .button-group');
    ttsButtonGroup.appendChild(elements.ttsRecordBtn);
    ttsButtonGroup.appendChild(elements.ttsDownloadBtn);

    const translatorButtonGroup = document.querySelector('#translator .translator-button-group');
    translatorButtonGroup.appendChild(elements.translatorRecordBtn);
    translatorButtonGroup.appendChild(elements.translatorDownloadBtn);
}

// Handle recording for Text to Speech
async function handleTTSRecording() {
    if (!ttsRecorder.isRecording) {
        try {
            await ttsRecorder.startRecording();
            elements.ttsRecordBtn.innerHTML = '⏹️ Stop Recording';
            elements.ttsDownloadBtn.style.display = 'none';
            speakText(); // Start speaking the text
        } catch (error) {
            alert('Could not start recording: ' + error.message);
        }
    } else {
        const audioBlob = await ttsRecorder.stopRecording();
        elements.ttsRecordBtn.innerHTML = '🔴 Record';
        elements.ttsDownloadBtn.style.display = 'inline-block';
        
        // Set up download functionality
        elements.ttsDownloadBtn.onclick = () => {
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tts-recording.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }
}

// Handle recording for Translator
async function handleTranslatorRecording() {
    if (!translatorRecorder.isRecording) {
        try {
            await translatorRecorder.startRecording();
            elements.translatorRecordBtn.innerHTML = '⏹️ Stop Recording';
            elements.translatorDownloadBtn.style.display = 'none';
            speakTranslatedText(); // Start speaking the translated text
        } catch (error) {
            alert('Could not start recording: ' + error.message);
        }
    } else {
        const audioBlob = await translatorRecorder.stopRecording();
        elements.translatorRecordBtn.innerHTML = '🔴 Record';
        elements.translatorDownloadBtn.style.display = 'inline-block';
        
        // Set up download functionality
        elements.translatorDownloadBtn.onclick = () => {
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'translation-recording.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }
}

// Add event listeners
function setupRecordingEventListeners() {
    elements.ttsRecordBtn.addEventListener('click', handleTTSRecording);
    elements.translatorRecordBtn.addEventListener('click', handleTranslatorRecording);
}

// Initialize recording functionality
function initializeRecording() {
    setupRecordingButtons();
    setupRecordingEventListeners();
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', initializeRecording);

// Save data (text, translation, etc.) to local storage
function saveToHistory(type, data) {
    if (!data.trim()) return; // Skip empty entries
    const historyKey = `${type}-history`;
    const currentHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    
    // Limit history entries to the last 10
    currentHistory.push({ data, timestamp: new Date().toLocaleString() });
    if (currentHistory.length > 10) currentHistory.shift();
    
    localStorage.setItem(historyKey, JSON.stringify(currentHistory));
}

// Display history on the UI
function displayHistory(type, elementId) {
    const historyKey = `${type}-history`;
    const container = document.getElementById(elementId);
    const historyData = JSON.parse(localStorage.getItem(historyKey)) || [];
    
    container.innerHTML = historyData.length ? 
        historyData.map(entry => 
            `<div class="history-item">
                <p>${entry.data}</p>
                <small>${entry.timestamp}</small>
            </div>`
        ).join('') : '<p>No history available.</p>';
}

// Save and display for Text-to-Speech
elements.speakBtn.addEventListener('click', function () {
    const text = elements.textInput.value.trim();
    if (text) {
        saveToHistory('textToSpeech', text);
        alert('Text saved to history!');
    }
});

// Save and display for Translations
elements.speakTranslation.addEventListener('click', function () {
    const translatedText = elements.translateOutput.value.trim();
    if (translatedText) {
        saveToHistory('translation', translatedText);
        alert('Translation saved to history!');
    }
});

// Save personalized voice settings
function saveVoiceSettings() {
    const settings = {
        voice: elements.voiceSelect.value,
        pitch: elements.pitch.value,
        rate: elements.rate.value
    };
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
    alert('Voice settings saved!');
}

// Load voice settings
function loadVoiceSettings() {
    const settings = JSON.parse(localStorage.getItem('voiceSettings'));
    if (settings) {
        elements.voiceSelect.value = settings.voice;
        elements.pitch.value = settings.pitch;
        elements.rate.value = settings.rate;
        elements.pitchValue.textContent = settings.pitch;
        elements.rateValue.textContent = settings.rate;
    }
}

// Event listeners for voice setting changes
elements.pitch.addEventListener('input', saveVoiceSettings);
elements.rate.addEventListener('input', saveVoiceSettings);
elements.voiceSelect.addEventListener('change', saveVoiceSettings);

// Load saved voice settings and history on startup
document.addEventListener('DOMContentLoaded', function () {
    loadVoiceSettings();
    displayHistory('textToSpeech', 'textToSpeech-history');
    displayHistory('translation', 'translation-history');
});

// Update displayHistory to include a delete button for each history item
function displayHistory(type, elementId) {
    const historyKey = `${type}-history`;
    const container = document.getElementById(elementId);
    const historyData = JSON.parse(localStorage.getItem(historyKey)) || [];
  
    if (historyData.length === 0) {
      container.innerHTML = '<p>No history available.</p>';
      return;
    }
  
    container.innerHTML = historyData.map((entry, index) => `
      <div class="history-item">
        <p>${entry.data}</p>
        <small>${entry.timestamp}</small>
        <button onclick="deleteHistoryEntry('${type}', ${index})" class="delete-btn">Delete</button>
      </div>
    `).join('');
  }
  
  // Function to delete a specific history entry
  function deleteHistoryEntry(type, index) {
    const historyKey = `${type}-history`;
    let historyData = JSON.parse(localStorage.getItem(historyKey)) || [];
    historyData.splice(index, 1);
    localStorage.setItem(historyKey, JSON.stringify(historyData));
    displayHistory(type, `${type}-history`);
  }

// Function to update counts for spoken texts and translations
function trackUsage(type, data) {
    if (!data.trim()) return;
    const storageKey = `${type}-usage`;
    const currentData = JSON.parse(localStorage.getItem(storageKey)) || [];

    // Track occurrences of phrases
    const entryIndex = currentData.findIndex(entry => entry.text === data);
    if (entryIndex > -1) {
        currentData[entryIndex].count++;
    } else {
        currentData.push({ text: data, count: 1 });
    }

    localStorage.setItem(storageKey, JSON.stringify(currentData));
}

// Attach usage tracking events
elements.speakBtn.addEventListener('click', function () {
    const text = elements.textInput.value.trim();
    trackUsage('textToSpeech', text);
});

elements.speakTranslation.addEventListener('click', function () {
    const translation = elements.translateOutput.value.trim();
    trackUsage('translation', translation);
});

// Function to generate charts using Chart.js
function generateCharts() {
    const textUsage = JSON.parse(localStorage.getItem('textToSpeech-usage')) || [];
    const translationUsage = JSON.parse(localStorage.getItem('translation-usage')) || [];

    // Prepare data for total text entries chart
    const textCounts = textUsage.map(entry => entry.count);
    const textLabels = textUsage.map(entry => entry.text);

    // Total Text Entries Chart
    new Chart(document.getElementById('textEntriesChart'), {
        type: 'bar',
        data: {
            labels: textLabels,
            datasets: [{
                label: 'Text Entry Count',
                data: textCounts,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Translation Usage Chart
    const translationCounts = translationUsage.map(entry => entry.count);
    const translationLabels = translationUsage.map(entry => entry.text);

    new Chart(document.getElementById('translationTrendsChart'), {
        type: 'line',
        data: {
            labels: translationLabels,
            datasets: [{
                label: 'Translation Count',
                data: translationCounts,
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Most Frequent Phrases Chart
    const frequentPhrases = [...textUsage, ...translationUsage]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    const phraseLabels = frequentPhrases.map(entry => entry.text);
    const phraseCounts = frequentPhrases.map(entry => entry.count);

    new Chart(document.getElementById('frequentPhrasesChart'), {
        type: 'pie',
        data: {
            labels: phraseLabels,
            datasets: [{
                data: phraseCounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Load charts on page load
document.addEventListener('DOMContentLoaded', function () {
    generateCharts();
});


