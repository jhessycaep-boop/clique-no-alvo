document.addEventListener("DOMContentLoaded", () => {

let coins = Number(localStorage.getItem("coins")) || 0;
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

let upgrades = JSON.parse(localStorage.getItem("upgrades")) || {
  life:0, time:0, ice:false, electric:false
};

let cursedUnlocked = localStorage.getItem("cursedUnlocked") === "true";
let portalUnlocked = localStorage.getItem("portalUnlocked") === "true";

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
  el.style.display="block";
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
  </div>`;

  let score=0;
  let lives=5+upgrades.life;
  let time=60+upgrades.time;
  let speed=900;

  const scoreEl=document.getElementById("score");
  const livesEl=document.getElementById("lives");
  const timerEl=document.getElementById("timer");

  function update(){
    scoreEl.textContent=score;
    livesEl.textContent=lives;
    timerEl.textContent=time;
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

    function move(){
      t.style.left=Math.random()*(window.innerWidth-60)+"px";
      t.style.top=80+Math.random()*(window.innerHeight-140)+"px";
    }

    move();
    game.appendChild(t);

    let timeout=setTimeout(()=>{
      if(!game.contains(t)) return;

      t.remove();

      if(type.rare) return end("Perdeu o raro 🤡");

      if(type.normal){
        lives--;
        soundMiss.cloneNode().play();
      }

      update();
    },800);

    t.onclick=()=>{

      clearTimeout(timeout);

      if(type.cursed) return end("Clicou no maldito 😈");

      if(type.portal){
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
        soundMiss.cloneNode().play();
      }
      else if(type.ice){
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
      else{
        score++;
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

      update();
    };

    let finalSpeed = slowActive ? speed + 400 : speed;
    setTimeout(spawn, finalSpeed);
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

  setInterval(()=>{
    if(!frozen){
      time--;
      update();
    }
  },1000);

  spawn();
  update();
}

window.buy = buy;
window.backMenu = backMenu;

  function resetProgress(){
  localStorage.clear();
  alert("Progresso resetado!");
  location.reload();
}

window.resetProgress = resetProgress;
});
