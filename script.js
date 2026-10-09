const startButton = document.querySelector("#start-button");
const choiceModal = document.querySelector("#choice-modal");
const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
const result = document.querySelector("#result");
const audioStatus = document.querySelector("#audio-status");

const choiceButtons = [yesButton, noButton];

let audioContext;
let phase = "start";
let modalTimer;
let resetTimer;

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playPik() {
  const context = getAudioContext();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(1040, now);
  oscillator.frequency.exponentialRampToValueAtTime(820, now + 0.16);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.21);

  audioStatus.textContent = "Пик!";
  window.setTimeout(() => {
    audioStatus.textContent = "";
  }, 250);
}

function showChoice() {
  if (phase !== "opening") return;

  phase = "choice";
  startButton.classList.remove("is-pressed");
  choiceModal.hidden = false;
  yesButton.focus();
}

function startGame() {
  if (phase !== "start") return;

  phase = "opening";
  startButton.disabled = true;
  startButton.classList.add("is-pressed");
  playPik();

  modalTimer = window.setTimeout(showChoice, 260);
}

function resetGame() {
  phase = "start";
  result.hidden = true;
  startButton.disabled = false;
  startButton.classList.remove("is-pressed");
  startButton.focus();
}

function finishChoice() {
  if (phase !== "choice") return;

  phase = "result";
  choiceModal.hidden = true;
  result.hidden = false;
  playPik();

  resetTimer = window.setTimeout(resetGame, 900);
}

function keepFocusInsideModal(event) {
  if (phase !== "choice" || event.key !== "Tab") return;

  const firstButton = choiceButtons[0];
  const lastButton = choiceButtons[choiceButtons.length - 1];

  if (event.shiftKey && document.activeElement === firstButton) {
    event.preventDefault();
    lastButton.focus();
  } else if (!event.shiftKey && document.activeElement === lastButton) {
    event.preventDefault();
    firstButton.focus();
  }
}

startButton.addEventListener("click", startGame);
yesButton.addEventListener("click", finishChoice);
noButton.addEventListener("click", finishChoice);
document.addEventListener("keydown", keepFocusInsideModal);

window.addEventListener("pagehide", () => {
  window.clearTimeout(modalTimer);
  window.clearTimeout(resetTimer);

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }
});

