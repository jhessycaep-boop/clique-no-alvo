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
let glitchUnlocked = localStorage.getItem("glitchUnlocked") === "true";
  
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
const soundGlitch = new Audio("glitch.mp3");

 document.addEventListener("click", unlockAudio, { once: true });

function unlockAudio(){
  [
    soundHit, soundMiss, soundRare, soundScare,
    soundIce, soundPortal, soundElectric,
    soundMagnet, soundInvisible, soundBonus, soundTroll
  ].forEach(s => {
    s.muted = true;
    s.play().then(()=>{
      s.pause();
      s.currentTime = 0;
      s.muted = false;
    }).catch(()=>{});
  });
}

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

 function showTargets(){
  let box = document.createElement("div");

  box.innerHTML = `
  <h2>📖 Alvos</h2>

  <p>🎯 Normal - padrão</p>
  <p>🤡 Raro - não pode perder</p>
  <p>💣 Bomba - tira vida</p>
  <p>❄️ Gelo - compra na loja</p>
  <p>⚡ Elétrico - compra na loja</p>

  <p>🌀 Portal - 35 pontos</p>
  <p>😈 Maldito - streak 20</p>
  <p>👻 Invisível - 80 pontos</p>
  <p>🧲 Ímã - clicar em 5 bombas + clicar no maldito com 15 pontos</p>
  <p>💰 Bônus - perder raro com 25 pontos</p>
  <p>🤡 Troll - 5 portais</p>

  if(glitchUnlocked){
  box.innerHTML += `<p style="color:red">
  ⚠️ Alvo Glitch: ERRO_DE_CARREGAMENTO_Tx0pY??==#~
  </p>
  <button onclick="openGlitchCode()">???</button>`;
 }

  <button onclick="this.parentElement.remove()">Fechar</button>
  `;

  Object.assign(box.style,{
    position:"fixed",
    top:0,left:0,
    width:"100%",height:"100%",
    background:"black",
    color:"white",
    zIndex:"9999",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center"
  });

  document.body.appendChild(box);
}

window.showTargets = showTargets;

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
  let bonusCrashCount = Number(localStorage.getItem("bonusCrashCount")) || 0;
  
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
    soundIce.currentTime = 0;
    soundIce.play();

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
    if(glitchUnlocked && r < 0.01){
  return {emoji:"🟣", glitch:true};
    }

    return {emoji:"🎯",color:"yellow",normal:true};
  }

  function spawn(){

    if(time<=0||lives<=0) return end();
    if(frozen) return setTimeout(spawn,200);
    
    if(paused){
  setTimeout(spawn, 200);
  return;
    }

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
        soundScare.currentTime = 0;
        soundScare.play();
        showScare();
        return;
      }
      
      if(type.normal){
        lives--;
        streak = 0;
        soundMiss.currentTime = 0;
        soundMiss.play();
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
        
        soundPortal.currentTime = 0;
        soundPortal.play();
        move();
        return;
      }

      t.classList.add("hit");
      setTimeout(()=>t.remove(),100);

      if(type.rare){
        score+=5;
        soundRare.currentTime = 0;
        soundRare.play();
      }
      else if(type.bomb){
        lives--;
        streak = 0;
        bombClicks++;
        soundMiss.currentTime = 0;
        soundMiss.play();
      }
      else if(type.ice){
        magnetActive = false;
        freezeGame();
      }
      else if(type.electric){
        speed=Math.max(400,speed-100);
        soundElectric.currentTime = 0;
        soundElectric.play();
      }
      else if(type.slow){
        slowActive = true;
        setTimeout(()=> slowActive=false, 3000);
      }
      else if(type.magnet){
        magnetActive = true;
        soundMagnet.currentTime = 0;
        soundMagnet.play();
      }
      else if(type.invisible){
        invisibleActive = false;
        if(blink) clearInterval(blink);
        soundInvisible.currentTime = 0;
        soundInvisible.play();
      }
      else if(type.bonus){
        coins += 50;
        soundBonus.currentTime = 0;
        soundBonus.play();
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
    
    soundTroll.currentTime = 0;
    soundTroll.play();
    end("TROLLEI 🤡 Moedas resetadas.",true);
  }

      }

        else if(type.glitch){
  if(Math.random() < 0.5){
    alert("REALIDADE CORROMPIDA");
    end("Você venceu?", true);
    soundGlitch.currentTime = 0;
    soundGlitch.play();
  } else {
    playGlitchEffect();
    showGlitchScare();
    return end("Erro fatal.");
    soundGlitch.currentTime = 0;
    soundGlitch.play();
  }
        }
      else{
        score++;
        streak++;
        soundHit.currentTime = 0;
        soundHit.play();
      }

      if(score>=35 && !portalUnlocked){
        portalUnlocked=true;
        localStorage.setItem("portalUnlocked","true");
        alert("🌀 Portal desbloqueado!");
      }

      if(streak>=20 && !cursedUnlocked){
        cursedUnlocked=true;
        localStorage.setItem("cursedUnlocked","true");
        alert("😈 Maldito desbloqueado!");
      }

      if(score >= 80 && !invisibleUnlocked){
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

  function playGlitchEffect(){
  document.body.style.animation = "glitch 0.1s infinite";

  document.body.style.filter = "invert(1) contrast(2)";

  setTimeout(()=>{
    document.body.style.animation = "";
    document.body.style.filter = "";
  }, 2000);
  }

  function showGlitchScare(){
  const e = document.createElement("div");

  e.innerHTML = "⚠️";
  e.style.position = "fixed";
  e.style.top = 0;
  e.style.left = 0;
  e.style.width = "100%";
  e.style.height = "100%";
  e.style.background = "red";
  e.style.color = "black";
  e.style.fontSize = "150px";
  e.style.display = "flex";
  e.style.alignItems = "center";
  e.style.justifyContent = "center";
  e.style.zIndex = 9999;

  document.body.appendChild(e);

  setTimeout(()=> e.remove(), 500);
  }

  function openGlitchCode(){

  const code = `1010101110010100100100111001001110100110101010111011000110110010101011011001001110110001101111011001110110010101101111011011110110011100101110101010101011001101101100001011100010001111101100101010101011001111110001101011110110101001100101001100011010010010101100101010011110110101100011111010100010100111100101111011010110101010100001011001101110111001100111001100110010101101101010111001111010111001110001101011101010100110110011111001101110001011100110101010101010010111100100101010100110111011101011101100101010011110101110111010010111001101101100001010100110111101101111001010101111001100100100111010101110011011100100111011101011001100100110111010011110111001101100101010100010010010100110111000011110011010101010101010110111001101100111101001000110010111101110101010011010010011101111011000111010101010101110101000111110111101100110101011100110101101101011101010110110101001110001101010011110101100101001111001110011000010`;

  const screen = document.createElement("div");

  screen.innerHTML = `
    <h2 style="color:red">Alvo glitch: ERRO_DE_CARREGAMENTO_Tx0pY??==#~</h2>
    <div id="glitchBinary">${code}</div>
    <button onclick="this.parentElement.remove()">Fechar</button>
  `;

  Object.assign(screen.style,{
    position:"fixed",
    top:0,
    left:0,
    width:"100%",
    height:"100%",
    background:"black",
    color:"lime",
    zIndex:"99999",
    padding:"20px",
    overflow:"auto",
    fontFamily:"monospace"
  });

  document.body.appendChild(screen);

  const glitchInterval = setInterval(()=>{
    const el = document.getElementById("glitchBinary");
    if(!el){
      clearInterval(glitchInterval);
      return;
    }

    let text = el.textContent.split('');

    for(let i=0;i<5;i++){
      let idx = Math.floor(Math.random()*text.length);
      text[idx] = Math.random() > 0.5 ? '1':'0';
    }

    el.textContent = text.join('');
  },100);
}

window.openGlitchCode = openGlitchCode;

  function end(msg="Fim!", noReward=false){

  // recompensa normal
  if(!noReward){
    coins += Math.floor(score/2);
  }

  // ⭐ VERIFICA DESBLOQUEIO DO GLITCH
  if(bonusCrashCount >= 20 && score >= 200 && !glitchUnlocked){
    glitchUnlocked = true;
    localStorage.setItem("glitchUnlocked", "true");

    // mensagem secreta antes do fim
    alert("⚠️ Algo estranho foi desbloqueado...");
  }

  // ranking
  ranking.push(score);
  ranking.sort((a,b)=>b-a);
  ranking = ranking.slice(0,5);

  // salvar tudo
  save();
  localStorage.setItem("ranking",JSON.stringify(ranking));

  // fim do jogo
  alert(msg+"\nPontuação: "+score);
  location.reload();
  }

  setInterval(()=>{
    if(!frozen && !paused){
      time--;
      update();
    }
  },1000);

  spawn();
  update();
}

  let bonusBox;
  let paused = false;

  function showBonusScreen(){
    paused = true;

    let box = document.createElement("div");
    bonusBox = box;
    
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
  if(coins >= 100){
    coins -= 100;
    localStorage.setItem("coins",coins);
    paused = false;
    bonusBox.remove();
  } else {
    alert("Sem moedas!");
  }
  }

  function crashGame(){
    bonusCrashCount++;
    localStorage.setItem("bonusCrashCount", bonusCrashCount);
    
    alert("Jogo crashou 😈");
    location.reload();
  }

function openGlitchLink(){
  const base64 = "SlNTLTI5OC1PV0o=";

  const url = atob(base64);

  alert("...");
  window.open(url, "_blank");
}

window.openGlitchLink = openGlitchLink;
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


