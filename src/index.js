// POMODORO TIMER
var startPause = document.getElementById("start-pause");
var skip = document.getElementById("skip");
var timer = document.getElementById("timer");
var ringtone = new Audio("./files/ringtone.mp3");

startPause.addEventListener("click", startTimer);
skip.addEventListener("click", skipCurrent);
document.querySelectorAll("#modes button").forEach(button => {
    button.addEventListener("click", modeClicked);
});
document.body.addEventListener("keydown", (e) => {
    if(e.code == "Space") startTimer();
    else if(e.code == "ArrowRight") skipCurrent();
})

var interval;
var currentMode = "pomodoro";
const DEFAULTS = {
    pomodoro: 25,
    short: 5,
    long: 15,
    breakInterval: 4
}
var MODES = {
    pomodoro: DEFAULTS["pomodoro"],
    short: DEFAULTS["short"],
    long: DEFAULTS["long"]
}
var breakInterval = DEFAULTS["breakInterval"];
var timeLeft = MODES[currentMode] * 60;
var isRunning = false;
var pomoCount = 1;
var breakCount = 0;

var pomoInput = document.getElementById("pomo-time");
var shortInput = document.getElementById("short-time");
var longInput = document.getElementById("long-time");
var intInput = document.getElementById("long-interval");
var invalidMsg = document.getElementById("invalid-msg");

const validInts = ["2", "3", "4", "5", "6", "7", "8", "9", "10"];
var settings = document.getElementById("settings-btn");
/**
 * Makes settings popup appear and darkens background when settings button is clicked.
 */
settings.addEventListener("click", function() {
    document.getElementById("settings-bg").style.display = "flex";
})
var close = document.getElementById("close-btn");
close.addEventListener("click", closeSettings);
var save = document.getElementById("save-btn");
save.addEventListener("click", saveClicked);
var restore = document.getElementById("default-btn");
restore.addEventListener("click", restoreDefaults);

var isMuted = false;
var muteSwitch = document.getElementById("mute-switch");
/**
 * If "mute sound" is enabled, disables it. Otherwise, enables "mute sound".
 */
muteSwitch.addEventListener("change", function() {
    isMuted = isMuted ? false : true;
})

/**
 * Invoked when save button has been clicked. Updates pomodoro time, short break time, long 
 * break time, and long break interval with user's inputted values if valid, then closes settings popup.
 * If necessary, floating point input values are truncated. If inputted values are invalid, displays error message.
 */
function saveClicked() {
    var pomoVal = pomoInput.value;
    var shortVal = shortInput.value;
    var longVal = longInput.value;
    var intVal = intInput.value;
    
    pomoInput.style.borderColor = isValidInput("pomo", pomoVal) ? "var(--light-gray)" : "var(--error-red)";
    shortInput.style.borderColor = isValidInput("short", shortVal) ? "var(--light-gray)" : "var(--error-red)";
    longInput.style.borderColor = isValidInput("long", longVal) ? "var(--light-gray)" : "var(--error-red)";
    intInput.style.borderColor = isValidInput("interval", intVal) ? "var(--light-gray)" : "var(--error-red)";

    if(isValidInput("pomo", pomoVal) && isValidInput("short", shortVal) && isValidInput("long", longVal) && 
        isValidInput("interval", intVal)) {
            invalidMsg.style.color = "white";
            MODES["pomodoro"] = pomoVal;
            MODES["short"] = shortVal;
            MODES["long"] = longVal;
            breakInterval = intVal;
            resetTimer();
            closeSettings();
    }
    else {
        invalidMsg.style.color = "var(--error-red)";
    }
}

/**
 * Checks if inputted value for pomodoro, short break, long break, or long break interval is valid.
 * Pomodoro, short break, and long break values must be between 0 and 60, exclusive. Long break interval 
 * values must be between 2 to 10, inclusive.
 */
function isValidInput(type, value) {
    if(type == "pomo" || type == "short" || type == "long") {
        return value > 0 && value <= 60;
    }
    else if(type == "interval") {
        return validInts.includes(value);
    }
}

/**
 * Invoked when either close or save button has been clicked. Closes settings popup.
 */
function closeSettings() {
    document.getElementById("settings-bg").style.display = "none";
}

/**
 * Invoked when restore defaults button has been clicked. Updates pomodoro time, short break
 * time, long break time, and long break interval to default values of 25, 5, 15, and 4, respectively.
 * Changes setting to allow sound.
 */
function restoreDefaults() {
    pomoInput.value = DEFAULTS["pomodoro"];
    shortInput.value = DEFAULTS["short"];
    longInput.value = DEFAULTS["long"];
    intInput.value = DEFAULTS["breakInterval"];
    if(isMuted) {
        document.getElementById("mute-switch").click();
    }
    saveClicked();
}

/**
 * Invoked when a mode button has been clicked.
 */
function modeClicked(event) {
    switchMode(event.target.dataset.modeId);
}

/**
 * Switches timer to given mode and resets to that mode's default starting time.
 */
function switchMode(mode) {
    currentMode = mode;
    var color = "var(--" + mode + ")";
    var darkColor = "var(--" + mode + "-dark)";

    document.body.style.backgroundColor = color;
    document.getElementById("settings-btn").style.backgroundColor = darkColor;
    document.getElementById("timer-container").style.borderColor = darkColor;

    document.querySelectorAll("#modes button").forEach(button => {
        button.style.backgroundColor = color;
    });
    document.getElementById(mode).style.backgroundColor = darkColor;
    startPause.style.color = "var(--" + mode + "-dark)";

    resetTimer();
}

/**
 * Switches timer to next mode based on current mode. Each pomodoro work period is followed by a (short or long) break period.
 * Every fourth break should be a long break.
 */
function nextMode() {
    ringtone.pause();
    if(currentMode == "pomodoro") {
        breakCount++;
        if(breakCount % breakInterval == 0) {
            switchMode("long");
        }
        else {
            switchMode("short");
        }
    }
    else {
        switchMode("pomodoro");
        pomoCount++;
        document.getElementById("pomo-count").innerHTML = "- - Pomo #" + pomoCount + " - -";
    }
}

/**
 * Starts timer if not currently running. When time is up, displays alert and automatically switches to next mode.
 * If timer is already running, pauses timer.
 */
function startTimer() {
    if(!isRunning) {
        interval = setInterval(() => {
            timeLeft--;
            updateTimer();
            if(timeLeft < 0) {
                if(!isMuted) {
                    ringtone.play();
                    ringtone.loop = true;
                    console.log("ringtone");
                }
                alert("Time's up!");
                nextMode();
                return;
            }
        }, 1000);
        isRunning = true;
        startPause.innerHTML = "Pause";
    }
    else {
        pauseTimer();
    }
}

/**
 * Pauses timer if currently running.
 */
function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
    startPause.innerHTML = "Start";
}

/**
 * Updates timer display with minutes and seconds remaining.
 */
function updateTimer() {
    var minutes = Math.floor(timeLeft / 60);
    var seconds = Math.floor(timeLeft % 60);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    timer.innerHTML = minutes + ":" + seconds;
}

/**
 * Resets timer to current mode's default starting time.
 */
function resetTimer() {
    pauseTimer();
    timeLeft = MODES[currentMode] * 60;
    updateTimer();
}

/**
 * Skips directly to next mode without waiting for current period to finish.
 */
function skipCurrent() {
    nextMode();
}
