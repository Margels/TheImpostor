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
 * Firebase refs
 *********************/
const playersRef = database.ref("playerName");
const readyCountRef = database.ref("playersReadyToPlay");

/*********************
 * Initial flow
 *********************/
if (playerName) {
  showNextScreen();
  setupReadyLogic();
} else {
  usernameScreen.classList.remove("hidden");
}

/*********************
 * Username input
 *********************/
usernameInput?.addEventListener("input", () => {
  continueBtn.disabled = usernameInput.value.trim().length <= 4;
});

continueBtn?.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name.length <= 4) return;

  localStorage.setItem(LOCAL_STORAGE_KEY, name);

  // Register player
  playersRef.child(name).set(true);

  showNextScreen();
  setupReadyLogic();
});

/*********************
 * Ready logic
 *********************/
function setupReadyLogic() {
  let hasClickedReady = false;

  // Button initial state
  readyBtn.disabled = false;
  readyBtn.textContent = "I’m ready to play!";

  readyBtn.addEventListener("click", () => {
    if (hasClickedReady) return;

    hasClickedReady = true;
    readyBtn.disabled = true;
    readyBtn.textContent = "Waiting for opponents…";

    // Atomically increment counter
    readyCountRef.transaction(current => {
      return (current || 0) + 1;
    });
  });

  // Listen for readiness updates
  database.ref().on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const totalPlayers = data.playerName
      ? Object.keys(data.playerName).length
      : 0;

    const readyPlayers = data.playersReadyToPlay || 0;

    if (totalPlayers > 0 && readyPlayers === totalPlayers) {
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