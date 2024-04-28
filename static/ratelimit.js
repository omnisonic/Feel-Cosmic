    // TIMER - RATE LIMITING
    const submitBtn = document.getElementById('submit-btn');
    const timerInfo = document.getElementById('timer-info');
    const messageElement = document.getElementById('message');
    
    let countdownInterval;
    let remainingSeconds;
    let timerCountdown;

    function resetTimer() {
        clearInterval(timerCountdown);
        timerCountdown = null;
        submitBtn.disabled = false;
        timerInfo.hidden = true;
        messageElement.style.display = 'none';
    }


    function startCountdown(seconds) {
        remainingSeconds = seconds;
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function updateCountdown() {
        remainingSeconds--;
        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            resetTimer();
        } else {
            timerInfo.textContent = `Cooldown period: ${remainingSeconds} seconds remaining.`;
        }
    }

    function resetTimer() {
        clearInterval(countdownInterval);
        countdownInterval = null;
        timerInfo.textContent = '';
        timerInfo.hidden = true;
        submitBtn.disabled = false;
        messageElement.style.display = 'none';
    }

    document.body.addEventListener('htmx:responseError', function (event) {
        const xhr = event.detail.xhr;
        const status = xhr.status;
        spinner.classList.add('hidden');  // Hide spinner on error

        if (status === 429) {  // Too Many Requests
            try {
                const response = JSON.parse(xhr.responseText);
                const cooldownSeconds = response.cooldown_seconds;
                messageElement.textContent = `Cooldown period: ${cooldownSeconds.toFixed(6)} seconds remaining.`;
                messageElement.style.display = 'block';
                timerInfo.hidden = false;
                submitBtn.disabled = true;
                startCountdown(cooldownSeconds);
            } catch (error) {
                console.error('Error parsing JSON response', error);
                messageElement.textContent = "Failed to parse server response.";
                messageElement.style.display = 'block';
            }
        } else {
            messageElement.textContent = "429 - Failed to generate the image. Please try again.";
            messageElement.style.display = 'block';
        }
    });

    function startCountdown(seconds) {
        timerInfo.textContent = `Cooldown period: ${seconds} seconds remaining.`;
        let remainingSeconds = seconds;
        const countdownInterval = setInterval(() => {
            remainingSeconds--;
            timerInfo.textContent = `Cooldown period: ${remainingSeconds} seconds remaining.`;

            if (remainingSeconds <= 0) {
                clearInterval(countdownInterval);
                submitBtn.disabled = false;
                timerInfo.hidden = true;
                timerInfo.textContent = '';
                messageElement.style.display = 'none';
            }
        }, 1000);
    }
