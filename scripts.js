document.addEventListener('DOMContentLoaded', function () {
    const textBoxInput = document.getElementById('TextBoxInput');
    const repeatCountInput = document.getElementById('RepeatCountInput');
    const countdownMinutesInput = document.getElementById('CountdownMinutesInput');
    const countdownSecondsInput = document.getElementById('CountdownSecondsInput');
    const voiceComboBox = document.getElementById('VoiceComboBox');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const speakButton = document.getElementById('SpeakButton');
    const stopButton = document.getElementById('StopButton');

    let repeatCount;
    let currentRepeat;
    let sentencesToSpeak;
    let currentSentenceIndex;
    let countdownTimer;
    let countdownTime;
    let isRepeating;
    let selectedVoice;
    

    const synth = window.speechSynthesis;

    function populateVoiceList() {
        const voices = synth.getVoices();
        voiceComboBox.innerHTML = voices.map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`).join('');
        voiceComboBox.value = voices.find(voice => voice.lang === 'en-US')?.name || '';
        
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    speakButton.addEventListener('click', function () {
        const text = textBoxInput.value;
        if (text && Number(repeatCountInput.value) > 0 &&
            Number(countdownMinutesInput.value) >= 0 &&
            Number(countdownSecondsInput.value) >= 0) {
            repeatCount = Number(repeatCountInput.value);
            currentRepeat = 0;
            sentencesToSpeak = text.split(/(?<=[.!?])\s+/);
            currentSentenceIndex = 0;
            isRepeating = true;
            countdownTime = (Number(countdownMinutesInput.value) * 60) + Number(countdownSecondsInput.value);
            speakButton.disabled = true;

            const voices = synth.getVoices();
            selectedVoice = voices.find(voice => voice.name === voiceComboBox.value);

            startCountdown();
        } else {
            alert('Please enter valid text, repeat count, and countdown time.');
        }
    });

    function startCountdown() {
        countdownDisplay.textContent = formatTime(countdownTime);
        countdownTimer = setInterval(() => {
            if (countdownTime > 0) {
                countdownTime--;
                countdownDisplay.textContent = formatTime(countdownTime);
            } else {
                clearInterval(countdownTimer);
                playNextSentence();
            }
        }, 1000);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function playNextSentence() {
        if (isRepeating) {
            if (currentRepeat < repeatCount) {
                const sentence = sentencesToSpeak[currentSentenceIndex];
                speakSentence(sentence);
                currentSentenceIndex = (currentSentenceIndex + 1) % sentencesToSpeak.length;
                if (currentSentenceIndex === 0) {
                    currentRepeat++;
                }
            } else {
                currentRepeat = 0;
                currentSentenceIndex = 0;
                countdownTime = (Number(countdownMinutesInput.value) * 60) + Number(countdownSecondsInput.value);
                startCountdown();
            }
        }
    }

    function speakSentence(text) {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = selectedVoice;
        utterThis.onend = function () {
            playNextSentence();
        };
        synth.speak(utterThis);
    }

    stopButton.addEventListener('click', function () {
        isRepeating = false;
        clearInterval(countdownTimer);
        synth.cancel();
        countdownTime = (Number(countdownMinutesInput.value) * 60) + Number(countdownSecondsInput.value);
        countdownDisplay.textContent = formatTime(countdownTime);
        speakButton.disabled = false;
    });
});
