document.addEventListener("DOMContentLoaded", () => {

let coins = Number(localStorage.getItem("coins")) || 0;
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
let upgrades = JSON.parse(localStorage.getItem("upgrades")) || { life:0, time:0, slow:0 };

const menu = document.getElementById("menu");
const shop = document.getElementById("shop");
const rankingDiv = document.getElementById("ranking");
const game = document.getElementById("game");

const coinsEl = document.getElementById("coins");

// 🔊 ÁUDIOS
const soundHit = new Audio("hit.mp3");
const soundMiss = new Audio("miss.mp3");
const soundPower = new Audio("powerup.mp3");

coinsEl.textContent = coins;

document.getElementById("playBtn").onclick = startGame;
document.getElementById("shopBtn").onclick = () => show(shop);
document.getElementById("rankBtn").onclick = showRanking;

// ===== TELAS =====
function show(el){
  menu.style.display = "none";
  shop.style.display = "none";
  rankingDiv.style.display = "none";
  game.style.display = "none";

  el.style.display = "block";
}

function backMenu(){
  show(menu);
}

// ===== RANKING =====
function showRanking(){
  show(rankingDiv);

  const list = document.getElementById("rankList");
  list.innerHTML = "";

  ranking.forEach((s,i)=>{
    list.innerHTML += `<li>${i+1}º - ${s}</li>`;
  });
}

// ===== LOJA =====
function buy(type){
  const price = {life:50,time:50,slow:80};

  if(coins>=price[type]){
    coins-=price[type];
    upgrades[type]++;
    save();
    coinsEl.textContent = coins;
    alert("Comprado!");
  } else {
    alert("Sem moedas!");
  }
}

function save(){
  localStorage.setItem("coins",coins);
  localStorage.setItem("upgrades",JSON.stringify(upgrades));
}

// ===== JOGO =====
function startGame(){

  // 🔊 desbloqueia áudio (ESSENCIAL)
  [soundHit, soundMiss, soundPower].forEach(s=>{
    s.play().then(()=>{
      s.pause();
      s.currentTime=0;
    }).catch(()=>{});
  });

  show(game);

  // 🔥 LIMPA QUALQUER ALVO ANTIGO
  game.innerHTML = `
    <div id="hud">
      <span>Pontos: <span id="score">0</span></span>
      <span>Vidas: <span id="lives">5</span></span>
      <span>Tempo: <span id="timer">60</span></span>
      <span>Streak: <span id="streak">0</span></span>
    </div>
  `;

  let score=0;
  let lives=5+upgrades.life;
  let time=60+upgrades.time;
  let streak=0;

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const timerEl = document.getElementById("timer");
  const streakEl = document.getElementById("streak");

  function update(){
    scoreEl.textContent=score;
    livesEl.textContent=lives;
    timerEl.textContent=time;
    streakEl.textContent=streak;
  }

  function spawn(){

    if(time<=0||lives<=0) return end();

    const t=document.createElement("div");
    t.className="target";
    t.textContent="🎯";
    t.style.background="yellow";

    t.style.left=Math.random()*(window.innerWidth-60)+"px";
    t.style.top=80+Math.random()*(window.innerHeight-140)+"px";

    game.appendChild(t);

    let timeout=setTimeout(()=>{
      if(game.contains(t)){
        game.removeChild(t);
        lives--;
        streak=0;
        soundMiss.cloneNode().play();
        update();
      }
    },800);

    t.onclick=()=>{
      clearTimeout(timeout);

      t.classList.add("hit");

      setTimeout(()=>t.remove(),100);

      score++;
      streak++;

      // 🔊 som de acerto
      soundHit.cloneNode().play();

      // 🔥 powerup simples
      if(streak===5){
        soundPower.cloneNode().play();
      }

      update();
    };

    setTimeout(spawn,900);
  }

  function end(){

    coins+=Math.floor(score/2);

    ranking.push(score);
    ranking.sort((a,b)=>b-a);
    ranking=ranking.slice(0,5);

    save();
    localStorage.setItem("ranking",JSON.stringify(ranking));

    alert("Fim! Pontos: "+score);
    location.reload();
  }

  setInterval(()=>{
    time--;
    update();
  },1000);

  spawn();
  update();
}

// 🔥 GLOBAL
window.buy = buy;
window.backMenu = backMenu;

});
