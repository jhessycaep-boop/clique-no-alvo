let coins = Number(localStorage.getItem("coins")) || 0;
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

let upgrades = JSON.parse(localStorage.getItem("upgrades")) || {
  life: 0,
  time: 0,
  slow: 0
};

const menu = document.getElementById("menu");
const shop = document.getElementById("shop");
const rankingDiv = document.getElementById("ranking");
const game = document.getElementById("game");

const coinsEl = document.getElementById("coins");
coinsEl.textContent = coins;

document.getElementById("playBtn").onclick = startGame;
document.getElementById("shopBtn").onclick = () => show(shop);
document.getElementById("rankBtn").onclick = showRanking;

function show(el) {
  menu.classList.add("hidden");
  shop.classList.add("hidden");
  rankingDiv.classList.add("hidden");
  game.classList.add("hidden");

  el.classList.remove("hidden");
}

function backMenu() {
  show(menu);
}

function showRanking() {
  show(rankingDiv);

  const list = document.getElementById("rankList");
  list.innerHTML = "";

  ranking.forEach((s, i) => {
    list.innerHTML += `<li>${i+1}º - ${s}</li>`;
  });
}

function buy(type) {
  const prices = { life: 50, time: 50, slow: 80 };

  if (coins >= prices[type]) {
    coins -= prices[type];
    upgrades[type]++;
    save();
    alert("Comprado!");
  } else {
    alert("Sem moedas!");
  }
}

function save() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

function startGame() {
  show(game);

  let score = 0;
  let lives = 5 + upgrades.life;
  let time = 60 + upgrades.time;
  let streak = 0;

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const timerEl = document.getElementById("timer");
  const streakEl = document.getElementById("streak");

  function update() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    timerEl.textContent = time;
    streakEl.textContent = streak;
  }

  function spawn() {
    if (time <= 0 || lives <= 0) return end();

    const t = document.createElement("div");
    t.className = "target";
    t.textContent = "🎯";
    t.style.background = "yellow";

    t.style.left = Math.random() * (window.innerWidth - 60) + "px";
    t.style.top = 80 + Math.random() * (window.innerHeight - 140) + "px";

    game.appendChild(t);

    let timeout = setTimeout(() => {
      if (game.contains(t)) {
        game.removeChild(t);
        lives--;
        streak = 0;
        update();
      }
    }, 800);

    t.onclick = () => {
      clearTimeout(timeout);
      t.classList.add("hit");

      setTimeout(() => t.remove(), 100);

      score++;
      streak++;
      update();
    };

    setTimeout(spawn, 900);
  }

  function end() {
    coins += Math.floor(score / 2);

    ranking.push(score);
    ranking.sort((a,b)=>b-a);
    ranking = ranking.slice(0,5);

    save();
    localStorage.setItem("ranking", JSON.stringify(ranking));

    alert("Fim! Pontos: " + score);

    location.reload();
  }

  setInterval(() => {
    time--;
    update();
  }, 1000);

  spawn();
  update();
      }
