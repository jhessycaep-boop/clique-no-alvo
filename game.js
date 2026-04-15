document.addEventListener("DOMContentLoaded", () => {

  const game = document.getElementById("game");
  const startScreen = document.getElementById("startScreen");
  const startBtn = document.getElementById("startBtn");
  const claimBtn = document.getElementById("claimBtn");

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const streakEl = document.getElementById("streak");
  const timerEl = document.getElementById("timer");

  // ===== ÁUDIOS =====
  const soundHit = new Audio("sounds/hit.mp3");
  const soundMiss = new Audio("sounds/miss.mp3");
  const soundPower = new Audio("sounds/powerup.mp3");
  const soundRare = new Audio("sounds/rare.mp3");
  const soundScare = new Audio("sounds/scare.mp3");

  let score = 0;
  let lives = 3;
  let streak = 0;
  let timeLeft = 30;
  let spawnInterval = 900;
  let gameOver = true;
  let timer;

  let cursedUnlocked = localStorage.getItem("cursedUnlocked") === "true";
  let streakRewardReady = false;

  // ===== DESBLOQUEAR ÁUDIO NO PRIMEIRO CLIQUE =====
  startBtn.addEventListener("click", () => {

    [soundHit, soundMiss, soundPower, soundRare, soundScare].forEach(sound => {
      sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
      }).catch(() => {});
    });

    startScreen.style.display = "none";
    game.style.display = "block";

    resetGame();
    spawnTarget();
    startTimer();
  });

  // ===== RESET =====
  function resetGame() {
    score = 0;
    lives = 3;
    streak = 0;
    timeLeft = 30;
    gameOver = false;
    streakRewardReady = false;
    claimBtn.style.display = "none";
    updateHUD();
  }

  // ===== HUD =====
  function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    streakEl.textContent = streak;
    timerEl.textContent = timeLeft;
  }

  // ===== TIMER =====
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      updateHUD();
      if (timeLeft <= 0) endGame("Tempo acabou!");
    }, 1000);
  }

  // ===== GAME OVER =====
  function endGame(msg) {
    gameOver = true;
    clearInterval(timer);
    alert("Game Over! " + msg);
    location.reload();
  }

  // ===== ESCOLHER TIPO DE ALVO =====
  function pickTarget() {

    let chance = Math.random();

    if (chance < 0.1) {
      return { color: "gold", emoji: "🤡", points: 5, rare: true };
    }

    if (chance < 0.2) {
      return { color: "black", emoji: "💣", points: 0 };
    }

    if (cursedUnlocked && chance < 0.3) {
      return { color: "purple", emoji: "😈", points: 0, cursed: true };
    }

    return { color: "yellow", emoji: "🎯", points: 1 };
  }

  // ===== SPAWN =====
  function spawnTarget() {

    if (gameOver) return;

    const type = pickTarget();
    const target = document.createElement("div");
    target.className = "target";
    target.style.background = type.color;
    target.textContent = type.emoji;

    const hudHeight = 90;
    const size = 60;

    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - hudHeight - size;

    target.style.left = Math.random() * maxX + "px";
    target.style.top = hudHeight + Math.random() * maxY + "px";

    game.appendChild(target);

    const timeout = setTimeout(() => {

      if (!game.contains(target)) return;

      game.removeChild(target); // 🔥 REMOVE SEMPRE

      if (type.rare) return endGame("Ignorou o alvo raro 🤡");

      if (type.cursed) {
        soundScare.cloneNode().play();
        showScaryEmoji();
        return;
      }

      if (type.points > 0) {
        lives--;
        streak = 0;
        soundMiss.cloneNode().play();
      }

      if (lives <= 0) endGame("Sem vidas!");

      updateHUD();

    }, 700);

    target.addEventListener("click", () => {

      if (gameOver) return;

      clearTimeout(timeout);

      if (type.cursed) {
        return endGame("Clicou no alvo maldito 😭");
      }

      target.classList.add("hit");

      setTimeout(() => {
        if (game.contains(target)) {
          game.removeChild(target);
        }
      }, 120);

      score += type.points;

      if (type.points > 0) {
        streak++;

        if (streak >= 20 && !cursedUnlocked && !streakRewardReady) {
          streakRewardReady = true;
          claimBtn.style.display = "block";
        }

        if (type.rare) soundRare.cloneNode().play();
        else soundHit.cloneNode().play();

      } else {
        streak = 0;
        soundMiss.cloneNode().play();
      }

      updateHUD();
    });

    setTimeout(spawnTarget, spawnInterval);
  }

  // ===== JUMPSCARE =====
  function showScaryEmoji() {
    const scare = document.createElement("div");
    scare.textContent = "👹";
    scare.style.position = "fixed";
    scare.style.fontSize = "120px";
    scare.style.top = "50%";
    scare.style.left = "50%";
    scare.style.transform = "translate(-50%, -50%)";
    scare.style.zIndex = "999";
    document.body.appendChild(scare);

    setTimeout(() => {
      document.body.removeChild(scare);
    }, 500);
  }

  // ===== RESGATE =====
  claimBtn.addEventListener("click", () => {
    cursedUnlocked = true;
    localStorage.setItem("cursedUnlocked", "true");
    claimBtn.style.display = "none";
    soundPower.cloneNode().play();
    alert("Alvo Maldito desbloqueado 😈");
  });

});