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

/*********************
 * Local storage key
 *********************/
const LOCAL_STORAGE_KEY = "impostor_username";

/*********************
 * Initial check
 *********************/
const savedUsername = localStorage.getItem(LOCAL_STORAGE_KEY);

if (savedUsername) {
  // User already registered
  showNextScreen();
} else {
  // Ask for username
  usernameScreen.classList.remove("hidden");
}

/*********************
 * Input validation
 *********************/
usernameInput.addEventListener("input", () => {
  const value = usernameInput.value.trim();
  continueBtn.disabled = value.length <= 4;
});

/*********************
 * Continue button
 *********************/
continueBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();

  if (username.length <= 4) return;

  // Save locally
  localStorage.setItem(LOCAL_STORAGE_KEY, username);

  // Save to Firebase
  const playersRef = database.ref("playerNames");
  playersRef.push(username);

  showNextScreen();
});

/*********************
 * UI helpers
 *********************/
function showNextScreen() {
  usernameScreen.classList.add("hidden");
  nextScreen.classList.remove("hidden");
}