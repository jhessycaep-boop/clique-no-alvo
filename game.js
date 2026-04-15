document.addEventListener("DOMContentLoaded", () => {

let coins = Number(localStorage.getItem("coins")) || 0;
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
let upgrades = JSON.parse(localStorage.getItem("upgrades")) || { life:0, time:0, slow:0 };

let cursedUnlocked = localStorage.getItem("cursedUnlocked") === "true";

const menu = document.getElementById("menu");
const shop = document.getElementById("shop");
const rankingDiv = document.getElementById("ranking");
const game = document.getElementById("game");

const coinsEl = document.getElementById("coins");

// 🔊 ÁUDIOS
const soundHit = new Audio("hit.mp3");
const soundMiss = new Audio("miss.mp3");
const soundPower = new Audio("powerup.mp3");
const soundRare = new Audio("rare.mp3");
const soundScare = new Audio("scare.mp3");

coinsEl.textContent = coins;

// ===== MENU =====
document.getElementById("playBtn").onclick = startGame;
document.getElementById("shopBtn").onclick = () => show(shop);
document.getElementById("rankBtn").onclick = showRanking;

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

  // desbloquear áudio
  [soundHit, soundMiss, soundPower, soundRare, soundScare].forEach(s=>{
    s.play().then(()=>{s.pause();s.currentTime=0;}).catch(()=>{});
  });

  show(game);

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

  function pickTarget(){
    let r = Math.random();

    if(r < 0.05) return {emoji:"🤡", color:"gold", rare:true};
    if(r < 0.12) return {emoji:"💣", color:"black", bomb:true};

    if(cursedUnlocked && r < 0.20)
      return {emoji:"😈", color:"purple", cursed:true};

    return {emoji:"🎯", color:"yellow", normal:true};
  }

  function spawn(){

    if(time<=0||lives<=0) return end();

    const type = pickTarget();

    const t=document.createElement("div");
    t.className="target";
    t.textContent=type.emoji;
    t.style.background=type.color;

    t.style.left=Math.random()*(window.innerWidth-60)+"px";
    t.style.top=80+Math.random()*(window.innerHeight-140)+"px";

    game.appendChild(t);

    let timeout=setTimeout(()=>{

      if(!game.contains(t)) return;

      t.remove();

      if(type.rare) return end("Perdeu o raro 🤡");

      if(type.cursed){
        soundScare.cloneNode().play();
        showScare();
        return;
      }

      if(type.normal){
        lives--;
        streak=0;
        soundMiss.cloneNode().play();
      }

      update();

    },800);

    t.onclick=()=>{

      clearTimeout(timeout);

      if(type.cursed) return end("Clicou no maldito 😈");

      t.classList.add("hit");
      setTimeout(()=>t.remove(),100);

      if(type.rare){
        score+=5;
        soundRare.cloneNode().play();
      }
      else if(type.bomb){
        lives--;
        streak=0;
        soundMiss.cloneNode().play();
      }
      else{
        score++;
        streak++;
        soundHit.cloneNode().play();
      }

      // desbloqueio
      if(streak >= 20 && !cursedUnlocked){
        cursedUnlocked = true;
        localStorage.setItem("cursedUnlocked","true");
        alert("😈 Alvo maldito desbloqueado!");
      }

      update();
    };

    setTimeout(spawn,900);
  }

  function showScare(){
    const e=document.createElement("div");
    e.textContent="👹";
    e.style.position="fixed";
    e.style.fontSize="120px";
    e.style.top="50%";
    e.style.left="50%";
    e.style.transform="translate(-50%,-50%)";
    e.style.zIndex="9999";
    document.body.appendChild(e);

    setTimeout(()=>e.remove(),500);
  }

  function end(msg="Fim!"){

    coins+=Math.floor(score/2);

    ranking.push(score);
    ranking.sort((a,b)=>b-a);
    ranking=ranking.slice(0,5);

    save();
    localStorage.setItem("ranking",JSON.stringify(ranking));

    alert(msg+"\nPontuação: "+score);
    location.reload();
  }

  setInterval(()=>{time--;update();},1000);

  spawn();
  update();
}

// global
window.buy = buy;
window.backMenu = backMenu;

});
