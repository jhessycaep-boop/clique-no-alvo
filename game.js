document.addEventListener("DOMContentLoaded", () => {

let coins = Number(localStorage.getItem("coins")) || 0;
let lostCoins = Number(localStorage.getItem("lostCoins")) || 0;
let canRecover = localStorage.getItem("canRecover") === "true";
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

let upgrades = JSON.parse(localStorage.getItem("upgrades")) || {
  life:0, time:0, ice:false, electric:false
};

let cursedUnlocked = localStorage.getItem("cursedUnlocked") === "true";
let portalUnlocked = localStorage.getItem("portalUnlocked") === "true";
let invisibleUnlocked = localStorage.getItem("invisibleUnlocked") === "true";
let bonusUnlocked = localStorage.getItem("bonusUnlocked") === "true";
let trollUnlocked = localStorage.getItem("trollUnlocked") === "true";
let magnetUnlocked = localStorage.getItem("magnetUnlocked") === "true";
  
let frozen = false;

let slowActive = false;

const menu = document.getElementById("menu");
const shop = document.getElementById("shop");
const rankingDiv = document.getElementById("ranking");
const game = document.getElementById("game");

const coinsEl = document.getElementById("coins");

// sons
const soundHit = new Audio("hit.mp3");
const soundMiss = new Audio("miss.mp3");
const soundRare = new Audio("rare.mp3");
const soundScare = new Audio("scare.mp3");
const soundIce = new Audio("ice.mp3");
const soundPortal = new Audio("portal.mp3");
const soundElectric = new Audio("electric.mp3");
const soundMagnet = new Audio("magnet.mp3");
const soundInvisible = new Audio("invisible.mp3");
const soundBonus = new Audio("bonus.mp3");
const soundTroll = new Audio("troll.mp3");

coinsEl.textContent = coins;

// MENU
document.getElementById("playBtn").onclick = startGame;
document.getElementById("shopBtn").onclick = () => show(shop);
document.getElementById("rankBtn").onclick = showRanking;

function show(el){
  menu.style.display="none";
  shop.style.display="none";
  rankingDiv.style.display="none";
  game.style.display="none";

  el.style.display="flex";

 if(el === shop){
  const recoverArea = document.getElementById("recoverArea");

  if(recoverArea){
    if(canRecover){
      recoverArea.innerHTML = `<button onclick="buy('recover')">💥 Crashador (-10)</button>`;
    } else {
      recoverArea.innerHTML = "";
    }
  }
 }
}

function backMenu(){ show(menu); }

// RANKING
function showRanking(){
  show(rankingDiv);
  const list = document.getElementById("rankList");
  list.innerHTML="";
  ranking.forEach((s,i)=>{
    list.innerHTML+=`<li>${i+1}º - ${s}</li>`;
  });
}

// LOJA
function buy(type){
  const prices = {life:50,time:50,ice:30,electric:40};

  if(coins >= prices[type]){
    coins -= prices[type];

    if(type==="ice") upgrades.ice=true;
    else if(type==="electric") upgrades.electric=true;
    else upgrades[type]++;

    save();
    coinsEl.textContent=coins;
    alert("Comprado!");
  }
  if(type === "recover"){
  coins += lostCoins + 10;

  localStorage.setItem("coins", coins);

  localStorage.setItem("lostCoins", 0);
  localStorage.setItem("canRecover", "false");

  alert("TROLLEI! Moedas devolvidas 😈");

  canRecover = false;

  location.reload();
  }
}

function save(){
  localStorage.setItem("coins",coins);
  localStorage.setItem("upgrades",JSON.stringify(upgrades));
}

// JOGO
function startGame(){
  document.body.onclick = () => {
  soundHit.play().then(()=>soundHit.pause()).catch(()=>{});
};

  show(game);

  game.innerHTML = `
  <div id="hud">
    <span>Pontos: <span id="score">0</span></span>
    <span>Vidas: <span id="lives">5</span></span>
    <span>Tempo: <span id="timer">60</span></span>
    <span>Streak: <span id="streak">0</span></span>
  </div>`;

  let score=0;
  let lives=5+upgrades.life;
  let time=60+upgrades.time;
  let streak = 0;
  let speed=900;
  let bombClicks = 0;
  let magnetActive = false;
  let invisibleActive = false;
  let trollActive = false;
  let portalCount = 0;

  const scoreEl=document.getElementById("score");
  const livesEl=document.getElementById("lives");
  const timerEl=document.getElementById("timer");
  const streakEl = document.getElementById("streak");

  function update(){
    scoreEl.textContent=score;
    livesEl.textContent=lives;
    timerEl.textContent=time;
    streakEl.textContent = streak;
  }

  function freezeGame(){
    frozen = true;
    soundIce.cloneNode().play();

    setTimeout(()=>{
      frozen = false;
    },2000);
  }

  function pick(){
    let r=Math.random();

    if(r<0.05) return {emoji:"🤡",color:"gold",rare:true};
    if(r<0.12) return {emoji:"💣",color:"black",bomb:true};
    if(upgrades.ice && r<0.18) return {emoji:"❄️",color:"cyan",ice:true};
    if(upgrades.electric && r<0.24) return {emoji:"⚡",color:"yellow",electric:true};
    if(portalUnlocked && r<0.30) return {emoji:"🌀",color:"magenta",portal:true};
    if(cursedUnlocked && r<0.35) return {emoji:"😈",color:"purple",cursed:true};
    if(magnetUnlocked && r < 0.38)
      return {emoji:"🧲",color:"red",magnet:true};
    if(invisibleUnlocked && r < 0.42)
      return {emoji:"👻",invisible:true};
    if(bonusUnlocked && r < 0.45)
      return {emoji:"💰",color:"lime",bonus:true};
    if(trollUnlocked && r < 0.5)
      return {emoji:"🤡",color:"orange",troll:true};

    return {emoji:"🎯",color:"yellow",normal:true};
  }

  function spawn(){

    if(time<=0||lives<=0) return end();
    if(frozen) return setTimeout(spawn,200);

    const type=pick();

    const t=document.createElement("div");
    t.className="target";
    t.textContent=type.emoji;
    t.style.background = type.color || "yellow";

    let blink;

    let trollMove;

    function move(){
      t.style.left=Math.random()*(window.innerWidth-60)+"px";
      t.style.top=80+Math.random()*(window.innerHeight-140)+"px";
    }

    move();
    
    if(magnetActive){
      t.style.transition = "0.3s";
      t.style.left = "50%";
      t.style.top = "50%";
    }

    
    game.appendChild(t);

    let timeout=setTimeout(()=>{
      if(!game.contains(t)) return;

      t.remove();

      if(type.rare){
        if(score >= 25){
          bonusUnlocked = true;
          localStorage.setItem("bonusUnlocked","true");
          alert("💰 Alvo bônus desbloqueado!");
        }

        streak = 0;
        return end("Perdeu o raro 🤡");
      }

      if(type.cursed){
        soundScare.cloneNode().play();
        showScare();
        return;
      }
      
      if(type.normal){
        lives--;
        streak = 0;
        soundMiss.cloneNode().play();
      }

      if(type.invisible){
        t.style.opacity = "0";
        invisibleActive = true;

       blink = setInterval(()=>{
          t.style.opacity = "1";
          setTimeout(()=> t.style.opacity="0",200);
        },20000);
      }

      if(type.bonus){
        showBonusScreen();
        return;
      }

      update();
    },800);

    t.onclick=()=>{

      clearTimeout(timeout);

      if(type.cursed){
        if(bombClicks >= 5 && score >= 15){
          magnetUnlocked = true;
          localStorage.setItem("magnetUnlocked","true");
          alert("🧲 Alvo ímã desbloqueado!");
        }

        streak = 0;
        return end("Clicou no maldito 😈");
      }

      if(type.portal){
        portalCount++;

        if(portalCount >= 5){
          trollUnlocked = true;
          localStorage.setItem("trollUnlocked","true");
          alert("🤡 Alvo troll desbloqueado!");
        }
        
        soundPortal.cloneNode().play();
        move();
        return;
      }

      t.classList.add("hit");
      setTimeout(()=>t.remove(),100);

      if(type.rare){
        score+=5;
        soundRare.cloneNode().play();
      }
      else if(type.bomb){
        lives--;
        streak = 0;
        bombClicks++;
        soundMiss.cloneNode().play();
      }
      else if(type.ice){
        magnetActive = false;
        freezeGame();
      }
      else if(type.electric){
        speed=Math.max(400,speed-100);
        soundElectric.cloneNode().play();
      }
      else if(type.slow){
        slowActive = true;
        setTimeout(()=> slowActive=false, 3000);
      }
      else if(type.magnet){
        magnetActive = true;
        soundMagnet.cloneNode().play();
      }
      else if(type.invisible){
        invisibleActive = false;
        if(blink) clearInterval(blink);
        soundInvisible.cloneNode().play();
      }
      else if(type.bonus){
        coins += 50;
        soundBonus.cloneNode().play();
      }
      else if(type.troll){

  if(!trollActive){
    trollActive = true;

    trollMove = setInterval(()=>{
      move();
    }, 100);

  } else {
    lostCoins = coins;
    localStorage.setItem("lostCoins",lostCoins);
    
    coins = 0;
    localStorage.setItem("coins",coins);

    localStorage.setItem("canRecover", "true");
    
    soundTroll.cloneNode().play();
    end("TROLLEI 🤡",true);
  }

      }
      else{
        score++;
        streak++;
        soundHit.cloneNode().play();
      }

      if(score>=35 && !portalUnlocked){
        portalUnlocked=true;
        localStorage.setItem("portalUnlocked","true");
        alert("🌀 Portal desbloqueado!");
      }

      if(score>=20 && !cursedUnlocked){
        cursedUnlocked=true;
        localStorage.setItem("cursedUnlocked","true");
        alert("😈 Maldito desbloqueado!");
      }

      if(score >= 100 && !invisibleUnlocked){
        invisibleUnlocked = true;
        localStorage.setItem("invisibleUnlocked","true");
        alert("👻 Invisível desbloqueado!");
      }

      update();
    };

    let finalSpeed = speed;

if(invisibleActive){
  finalSpeed = Math.max(200, speed - 200);
}

setTimeout(spawn, finalSpeed);
  }

  function showScare(){
  const e = document.createElement("div");

  e.textContent = "👹";
  e.style.position = "fixed";
  e.style.top = "50%";
  e.style.left = "50%";
  e.style.transform = "translate(-50%, -50%)";
  e.style.fontSize = "120px";
  e.style.zIndex = "9999";

  document.body.appendChild(e);

  setTimeout(() => {
    e.remove();
  }, 500);
  }

  function end(msg="Fim!", noReward=false){

  if(!noReward){
    coins += Math.floor(score/2);
  }

  ranking.push(score);
  ranking.sort((a,b)=>b-a);
  ranking = ranking.slice(0,5);

  save();
  localStorage.setItem("ranking",JSON.stringify(ranking));

  alert(msg+"\nPontuação: "+score);
  location.reload();
  }

  setInterval(()=>{
    if(!frozen){
      time--;
      update();
    }
  },1000);

  spawn();
  update();
}

  function showBonusScreen(){
    let box = document.createElement("div");

    box.innerHTML = `
    <h2>Você perdeu 50 moedas</h2>
    <button onclick="continueGame()">Pagar 100</button>
    <button onclick="crashGame()">Não tenho moedas</button>
    `;

    box.onclick = e => e.stopPropagation();

    box.style.position = "fixed";
box.style.top = "0";
box.style.left = "0";
box.style.width = "100%";
box.style.height = "100%";
box.style.background = "black";
box.style.zIndex = "9999";
box.style.display = "flex";
box.style.flexDirection = "column";
box.style.justifyContent = "center";
box.style.alignItems = "center";

    document.body.appendChild(box);
  }

  function continueGame(){
    coins -= 100;
    location.reload();
  }

  function crashGame(){
    throw new Error("Jogo crashou 😈");
  }

window.buy = buy;
window.backMenu = backMenu;
window.continueGame = continueGame;
window.crashGame = crashGame;
  

  function resetProgress(){
  localStorage.clear();
  alert("Progresso resetado!");
  location.reload();
}

window.resetProgress = resetProgress;
});

console.log("JS carregou até o final.");
