document.addEventListener("DOMContentLoaded", () => {

  const game = document.getElementById("game");
  const startScreen = document.getElementById("startScreen");
  const startBtn = document.getElementById("startBtn");
  const claimBtn = document.getElementById("claimBtn");

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const streakEl = document.getElementById("streak");
  const timerEl = document.getElementById("timer");

  const soundHit = new Audio("hit.mp3");
  const soundMiss = new Audio("miss.mp3");
  const soundPower = new Audio("powerup.mp3");
  const soundRare = new Audio("rare.mp3");
  const soundScare = new Audio("scare.mp3");

  let score, lives, streak, timeLeft;
  let gameOver, timer;
  let spawnInterval;

  let cursedUnlocked = localStorage.getItem("cursedUnlocked") === "true";
  let streakRewardReady = false;

  startBtn.addEventListener("click", () => {

    // desbloqueia áudio
    [soundHit, soundMiss, soundPower, soundRare, soundScare].forEach(s => {
      s.play().then(() => {
        s.pause();
        s.currentTime = 0;
      }).catch(() => {});
    });

    startScreen.style.display = "none";
    game.style.display = "block";

    resetGame();
    spawnTarget();
    startTimer();
  });

  function resetGame() {
    score = 0;
    lives = 5;
    streak = 0;
    timeLeft = 60;
    spawnInterval = 900;
    gameOver = false;
    streakRewardReady = false;
    claimBtn.style.display = "none";
    updateHUD();
  }

  function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    streakEl.textContent = streak;
    timerEl.textContent = timeLeft;
  }

  function endGame(msg) {
    gameOver = true;
    clearInterval(timer);
    alert("Game Over!\n" + msg + "\nPontuação: " + score);
    location.reload();
  }

  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      updateHUD();
      if (timeLeft <= 0) endGame("Tempo acabou!");
    }, 1000);
  }

  function pickTarget() {
    let r = Math.random();

    if (r < 0.05) return { emoji: "🤡", color: "gold", points: 5, rare: true };
    if (r < 0.12) return { emoji: "💣", color: "black", points: 0 };

    if (cursedUnlocked && r < 0.20)
      return { emoji: "😈", color: "purple", points: 0, cursed: true };

    return { emoji: "🎯", color: "yellow", points: 1 };
  }

  function spawnTarget() {

    if (gameOver) return;

    const type = pickTarget();
    const target = document.createElement("div");
    target.className = "target";
    target.textContent = type.emoji;
    target.style.background = type.color;

    const hud = 90;
    const size = 60;

    target.style.left = Math.random() * (window.innerWidth - size) + "px";
    target.style.top = hud + Math.random() * (window.innerHeight - hud - size) + "px";

    game.appendChild(target);

    const timeout = setTimeout(() => {

      if (!game.contains(target)) return;

      game.removeChild(target);

      if (type.rare) return endGame("Perdeu o raro 🤡");

      if (type.cursed) {
        soundScare.cloneNode().play();
        showScare();
        return;
      }

      if (type.points > 0) {
        lives--;
        streak = 0;
        soundMiss.cloneNode().play();
      }

      if (lives <= 0) endGame("Sem vidas");

      updateHUD();

    }, 700);

    target.addEventListener("click", () => {

      if (gameOver) return;

      clearTimeout(timeout);

      if (type.cursed) return endGame("Clicou no maldito 😈");

      target.classList.add("hit");

      setTimeout(() => {
        if (game.contains(target)) game.removeChild(target);
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

      if (streak === 6) soundPower.cloneNode().play();

      updateHUD();
    });

    setTimeout(spawnTarget, spawnInterval);
  }

  function showScare() {
    const e = document.createElement("div");
    e.textContent = "👹";
    e.style.position = "fixed";
    e.style.fontSize = "120px";
    e.style.top = "50%";
    e.style.left = "50%";
    e.style.transform = "translate(-50%, -50%)";
    e.style.zIndex = "9999";

    document.body.appendChild(e);

    setTimeout(() => e.remove(), 500);
  }

  claimBtn.addEventListener("click", () => {
    cursedUnlocked = true;
    localStorage.setItem("cursedUnlocked", "true");
    claimBtn.style.display = "none";
    soundPower.cloneNode().play();
    alert("Alvo maldito desbloqueado 😈");
  });

});
