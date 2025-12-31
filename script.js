/*********************
 * Firebase setup
 *********************/
const firebaseConfig = {
  apiKey: "AIzaSyAn3oKc2zQ0uROHW_fFcQoI2sV1sg9FyFM",
  authDomain: "impostor-game-37a6b.firebaseapp.com",
  databaseURL: "https://impostor-game-37a6b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "impostor-game-37a6b",
  storageBucket: "impostor-game-37a6b.firebasestorage.app",
  messagingSenderId: "863918769478",
  appId: "1:863918769478:web:2aaf04956a1a0f8ee95147"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

/*********************
 * DOM references
 *********************/
const usernameScreen = document.getElementById("username-screen");
const nextScreen = document.getElementById("next-screen");
const usernameInput = document.getElementById("username-input");
const continueBtn = document.getElementById("continue-btn");

const readyBtn = document.getElementById("ready-btn");
const statusLabel = document.getElementById("status-label");

/*********************
 * Local storage
 *********************/
const LOCAL_STORAGE_KEY = "playerName";
const playerName = localStorage.getItem(LOCAL_STORAGE_KEY);

/*********************
 * Initial flow
 *********************/
if (playerName) {
  showNextScreen();
  setupReadyState();
} else {
  usernameScreen.classList.remove("hidden");
}

/*********************
 * Username input
 *********************/
usernameInput?.addEventListener("input", () => {
  const value = usernameInput.value.trim();
  continueBtn.disabled = value.length <= 4;
});

continueBtn?.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name.length <= 4) return;

  localStorage.setItem(LOCAL_STORAGE_KEY, name);

  const playerRef = database.ref(`playerName/${name}`);
  playerRef.set({
    readyToPlay: false
  });

  showNextScreen();
  setupReadyState();
});

/*********************
 * Ready logic
 *********************/
function setupReadyState() {
  const playerRef = database.ref(`playerName/${playerName}`);
  const allPlayersRef = database.ref("playerName");

  // Check if already ready
  playerRef.once("value", snapshot => {
    const data = snapshot.val();

    if (data?.readyToPlay === true) {
      handleWaitingState();
    } else {
      readyBtn.disabled = false;
      readyBtn.textContent = "I’m ready to play!";
    }
  });

  // Click handler
  readyBtn.addEventListener("click", () => {
    readyBtn.disabled = true;
    readyBtn.textContent = "Waiting for opponents…";

    playerRef.update({
      readyToPlay: true
    });
  });

  // Listen for all players readiness
  allPlayersRef.on("value", snapshot => {
    const players = snapshot.val();
    if (!players) return;

    const allReady = Object.values(players).every(
      player => player.readyToPlay === true
    );

    if (allReady) {
      readyBtn.classList.add("hidden");
      statusLabel.classList.remove("hidden");
      statusLabel.textContent = "All users are ready to play";
    }
  });
}

/*********************
 * UI helpers
 *********************/
function showNextScreen() {
  usernameScreen.classList.add("hidden");
  nextScreen.classList.remove("hidden");
}

function handleWaitingState() {
  readyBtn.disabled = true;
  readyBtn.textContent = "Waiting for opponents…";
}