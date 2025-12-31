/*********************
 * Firebase setup
 *********************/
const firebaseConfig = {
  apiKey: "AIzaSyAn3oKc2zQ0uROHW_fFcQoI2sV1sg9FyFM",
  authDomain: "impostor-game-37a6b.firebaseapp.com",
  databaseURL:
    "https://impostor-game-37a6b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "impostor-game-37a6b",
  storageBucket: "impostor-game-37a6b.firebasestorage.app",
  messagingSenderId: "863918769478",
  appId: "1:863918769478:web:2aaf04956a1a0f8ee95147"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

/*********************
 * Topics
 *********************/
const topics = [
  "🇬🇧 Eye colours 🇮🇹 Colori degli occhi",
  "🇬🇧 Sports equipment 🇮🇹 Attrezzatura sportiva",
  "🇬🇧 Water animals 🇮🇹 Animali acquatici",
  "🇬🇧 Pizza toppings 🇮🇹 Ingredienti da mettere sulla pizza",
  "🇬🇧 Mythological creatures 🇮🇹 Creature mitologiche",
  "🇬🇧 Winter clothing 🇮🇹 Abbigliamento invernale",

  "🇬🇧 Things that can be folded 🇮🇹 Cose che si possono piegare",
  "🇬🇧 Things that make noise 🇮🇹 Cose che fanno rumore",
  "🇬🇧 Things that are transparent 🇮🇹 Cose trasparenti",
  "🇬🇧 Things found in a backpack 🇮🇹 Cose che si trovano in uno zaino",
  "🇬🇧 Things that can break easily 🇮🇹 Cose che si rompono facilmente",
  "🇬🇧 Circular objects 🇮🇹 Oggetti circolari",
  "🇬🇧 Things that smell good 🇮🇹 Cose che profumano",
  "🇬🇧 Things that float 🇮🇹 Cose che galleggiano",
  "🇬🇧 Things associated with fear 🇮🇹 Cose associate alla paura",
  "🇬🇧 Things that are soft 🇮🇹 Cose morbide",
  "🇬🇧 Things used at night 🇮🇹 Cose usate di notte",
  "🇬🇧 Things that are illegal in some countries 🇮🇹 Cose illegali in alcuni paesi",
  "🇬🇧 Things that are sticky 🇮🇹 Cose appiccicose",
  "🇬🇧 Things that require batteries 🇮🇹 Cose che funzionano a batterie",
  "🇬🇧 Things found in a bathroom 🇮🇹 Cose che si trovano in bagno",
  "🇬🇧 Things that melt 🇮🇹 Cose che si sciolgono",
  "🇬🇧 Things associated with luxury 🇮🇹 Cose associate al lusso",
  "🇬🇧 Things that move fast 🇮🇹 Cose che si muovono velocemente",
  "🇬🇧 Things that are cold 🇮🇹 Cose fredde",
  "🇬🇧 Things found at the airport 🇮🇹 Cose che si trovano in aeroporto",
  "🇬🇧 Things that are addictive 🇮🇹 Cose che creano dipendenza",
  "🇬🇧 Things that are red 🇮🇹 Cose rosse",
  "🇬🇧 Things that are sharp 🇮🇹 Cose appuntite",
  "🇬🇧 Things that make you sweat 🇮🇹 Cose che fanno sudare",
  "🇬🇧 Things that are expensive to maintain 🇮🇹 Cose costose da mantenere"
];

/*********************
 * DOM references
 *********************/
const usernameScreen = document.getElementById("username-screen");
const nextScreen = document.getElementById("next-screen");
const usernameInput = document.getElementById("username-input");
const continueBtn = document.getElementById("continue-btn");
const readyBtn = document.getElementById("ready-btn");
const statusLabel = document.getElementById("status-label");
const restartBtn = document.getElementById("restart-btn");

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
const impostorRef = database.ref("impostor");
const topicRef = database.ref("topic");

/*********************
 * Initial flow
 *********************/
if (playerName) {
  showNextScreen();
  setupReadyLogic();
  checkAfterReload();
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
  playersRef.push(name);

  showNextScreen();
  setupReadyLogic();
});

/*********************
 * Ready logic
 *********************/
function setupReadyLogic() {
  readyBtn.classList.remove("hidden");
  readyBtn.disabled = false;
  readyBtn.textContent = "I’m ready to play!";

  readyBtn.onclick = () => {
    readyBtn.disabled = true;
    readyBtn.textContent = "Waiting for opponents…";

    readyCountRef.transaction(current => {
      return (current || 0) + 1;
    });
  };
}

/*********************
 * Global game listener
 *********************/
database.ref().on("value", snapshot => {
  const data = snapshot.val();
  if (!data || !data.playerName) return;

  const players = Object.values(data.playerName);
  const readyPlayers = data.playersReadyToPlay || 0;

  // Everyone ready → assign impostor + topic once
  if (
    readyPlayers === players.length &&
    players.length > 0 &&
    !data.impostor
  ) {
    const impostor =
      players[Math.floor(Math.random() * players.length)];
    const topic =
      topics[Math.floor(Math.random() * topics.length)];

    database.ref().update({
      impostor,
      topic
    });
  }

  // Game decided → ask users to reload
  if (data.impostor && data.topic && readyBtn) {
    readyBtn.classList.add("hidden");
    statusLabel.classList.remove("hidden");
    statusLabel.textContent =
      "Your future has been chosen! Reload the page to discover what the next game has in store for you…";
  }
});

/*********************
 * After reload — reveal role
 *********************/
function checkAfterReload() {
  database.ref().once("value", snapshot => {
    const data = snapshot.val();
    if (!data || !data.impostor || !data.topic) return;

    readyBtn.classList.add("hidden");
    statusLabel.classList.remove("hidden");

    if (playerName === data.impostor) {
      statusLabel.textContent =
        "You are the impostor! Try to blend in with the group and not get caught.";
    } else {
      statusLabel.textContent =
        "You are not the impostor!\nThe topic for today will be:\n\n" +
        data.topic;
    }

    // 👑 Game master button
    if (playerName === "Martina") {
      restartBtn.classList.remove("hidden");
    }
  });
}

/*********************
 * Restart game (Martina only)
 *********************/
restartBtn?.addEventListener("click", () => {
  database.ref().update({
    playersReadyToPlay: null,
    impostor: null,
    topic: null
  }).then(() => {
    alert("Game restarted! Players can refresh to start again.");
    restartBtn.classList.add("hidden");
    statusLabel.textContent =
      "Game reset. Waiting for players to get ready...";
  });
});

/*********************
 * UI helpers
 *********************/
function showNextScreen() {
  usernameScreen.classList.add("hidden");
  nextScreen.classList.remove("hidden");
}