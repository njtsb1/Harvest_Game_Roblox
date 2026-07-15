const TRANSLATIONS = {
  "en-US": {
    title: "Harvest Game",
    coins: "Coins",
    instructions: ["Click a ripe tile to harvest.", "Tiles grow over time."],
    credits: "Prototype built with HTML5 Canvas"
  },
  "pt-BR": {
    title: "Jogo da Colheita",
    coins: "Moedas",
    instructions: ["Clique em um tile maduro para colher.", "Os tiles crescem com o tempo."],
    credits: "Protótipo feito com HTML5 Canvas"
  },
  "es-ES": {
    title: "Juego de Cosecha",
    coins: "Monedas",
    instructions: ["Haz clic en una casilla madura para cosechar.", "Las casillas crecen con el tiempo."],
    credits: "Prototipo hecho con HTML5 Canvas"
  }
};

const DEFAULT_LANG = "en-US";
const DEFAULT_THEME = "dark";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d", { alpha: false });

const coinsValueEl = document.getElementById("coins-value");
const coinsLabelEl = document.getElementById("coins-label");
const instructionsEl = document.getElementById("instructions");
const creditsEl = document.getElementById("credits");
const appTitleEl = document.getElementById("app-title");

const langSelect = document.getElementById("lang-select");
const themeToggle = document.getElementById("theme-toggle");
const iconSun = document.getElementById("icon-sun");
const iconMoon = document.getElementById("icon-moon");

const tileButtonsContainer = document.getElementById("tile-buttons");

let state = {
  lang: localStorage.getItem("hg_lang") || DEFAULT_LANG,
  theme: localStorage.getItem("hg_theme") || DEFAULT_THEME,
  coins: Number(localStorage.getItem("hg_coins") || 0),
  grid: { cols: 8, rows: 5, tileSize: 64, padding: 8 },
  tiles: []
};

// Apply initial settings
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  if(theme === "dark"){
    iconSun.style.display = "none";
    iconMoon.style.display = "block";
  } else {
    iconSun.style.display = "block";
    iconMoon.style.display = "none";
  }
  localStorage.setItem("hg_theme", theme);
}
function applyLang(lang){
  const t = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
  appTitleEl.textContent = t.title;
  coinsLabelEl.textContent = t.coins;
  instructionsEl.innerHTML = t.instructions.map(p => `<p>${p}</p>`).join("");
  creditsEl.textContent = t.credits;
  langSelect.value = lang;
  document.documentElement.lang = lang;
  localStorage.setItem("hg_lang", lang);
}

applyTheme(state.theme);
applyLang(state.lang);
coinsValueEl.textContent = state.coins;

// Theme toggle handler
themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme(state.theme);
});

// Language change handler
langSelect.addEventListener("change", (e) => {
  state.lang = e.target.value;
  applyLang(state.lang);
});

// Responsive canvas sizing
function resizeCanvas(){
  const wrap = canvas.parentElement;
  const maxWidth = Math.min(wrap.clientWidth - 24, 900);
  const aspect = 16/9;
  canvas.width = Math.floor(maxWidth);
  canvas.height = Math.floor(maxWidth / aspect);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Tile model
class Tile {
  constructor(col, row, size, padding){
    this.col = col;
    this.row = row;
    this.size = size;
    this.padding = padding;
    this.stage = 0; // 0 empty, 1 growing, 2 ripe
    this.growthProgress = 0;
  }
  get x(){ return this.col * (this.size + this.padding) + this.padding; }
  get y(){ return this.row * (this.size + this.padding) + this.padding; }
  get rect(){ return { x:this.x, y:this.y, w:this.size, h:this.size }; }
  isRipe(){ return this.stage >= 2; }
  grow(delta){
    if(this.isRipe()) return;
    // growth speed: seconds to next stage
    const speed = 6; // seconds per stage
    this.growthProgress += delta;
    if(this.growthProgress >= speed){
      this.growthProgress = 0;
      this.stage = Math.min(2, this.stage + 1);
    }
  }
  harvest(){
    if(this.isRipe()){
      this.stage = 0;
      this.growthProgress = 0;
      return true;
    }
    return false;
  }
}

// Initialize grid
function initGrid(){
  const cols = state.grid.cols;
  const rows = state.grid.rows;
  const tileSize = Math.floor((canvas.width - (state.grid.padding * (cols + 1))) / cols);
  state.grid.tileSize = tileSize;
  state.tiles = [];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      state.tiles.push(new Tile(c, r, tileSize, state.grid.padding));
    }
  }
  renderTileButtons();
}
initGrid();

// Render accessible tile buttons
function renderTileButtons(){
  tileButtonsContainer.innerHTML = "";
  state.tiles.forEach((tile, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile-btn";
    btn.setAttribute("role","gridcell");
    btn.setAttribute("aria-label", `Tile ${idx+1} stage ${tile.stage}`);
    btn.addEventListener("click", () => {
      if(tile.harvest()){
        state.coins += 10;
        saveCoins();
        updateCoinsUI();
      }
      updateTileButtons();
    });
    tileButtonsContainer.appendChild(btn);
  });
  updateTileButtons();
}
function updateTileButtons(){
  const buttons = tileButtonsContainer.querySelectorAll("button");
  state.tiles.forEach((tile, idx) => {
    const btn = buttons[idx];
    btn.textContent = tile.isRipe() ? "🌾" : tile.stage === 1 ? "🌱" : "▫";
    btn.setAttribute("aria-label", `Tile ${idx+1} stage ${tile.stage}`);
  });
}

// Save coins persistently
function saveCoins(){
  localStorage.setItem("hg_coins", String(state.coins));
}

// Update coins UI
function updateCoinsUI(){
  coinsValueEl.textContent = state.coins;
}

// Canvas rendering
function draw(){
  // background
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || "#dfffe0";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // compute grid origin to center
  const cols = state.grid.cols;
  const rows = state.grid.rows;
  const totalW = cols * state.grid.tileSize + (cols + 1) * state.grid.padding;
  const totalH = rows * state.grid.tileSize + (rows + 1) * state.grid.padding;
  const offsetX = Math.max(0, (canvas.width - totalW) / 2);
  const offsetY = Math.max(0, (canvas.height - totalH) / 2);

  // draw tiles
  state.tiles.forEach(tile => {
    const x = offsetX + tile.x;
    const y = offsetY + tile.y;
    const s = tile.size;
    // base soil
    ctx.fillStyle = "#8b5a2b";
    roundRect(ctx, x, y, s, s, 8);
    ctx.fill();

    // inner soil
    ctx.fillStyle = "#a66b3a";
    roundRect(ctx, x+6, y+6, s-12, s-12, 6);
    ctx.fill();

    // plant depending on stage
    if(tile.stage === 1){
      // small sprout
      ctx.fillStyle = "#2f9e44";
      ctx.beginPath();
      ctx.ellipse(x + s/2, y + s/2, s*0.12, s*0.22, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = "#14532d";
      ctx.fillRect(x + s/2 - 2, y + s/2, 4, s*0.18);
    } else if(tile.stage >= 2){
      // ripe crop
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.ellipse(x + s/2, y + s/2 - 4, s*0.22, s*0.28, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = "#14532d";
      ctx.fillRect(x + s/2 - 3, y + s/2 + s*0.05, 6, s*0.18);
    }

    // border
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, s, s, 8);
    ctx.stroke();
  });
}

// helper rounded rect
function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Interaction: click canvas to harvest if tile ripe
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const cy = (e.clientY - rect.top) * (canvas.height / rect.height);

  const cols = state.grid.cols;
  const rows = state.grid.rows;
  const totalW = cols * state.grid.tileSize + (cols + 1) * state.grid.padding;
  const totalH = rows * state.grid.tileSize + (rows + 1) * state.grid.padding;
  const offsetX = Math.max(0, (canvas.width - totalW) / 2);
  const offsetY = Math.max(0, (canvas.height - totalH) / 2);

  for(let i=0;i<state.tiles.length;i++){
    const t = state.tiles[i];
    const x = offsetX + t.x;
    const y = offsetY + t.y;
    if(cx >= x && cx <= x + t.size && cy >= y && cy <= y + t.size){
      if(t.harvest()){
        state.coins += 10;
        saveCoins();
        updateCoinsUI();
      }
      updateTileButtons();
      break;
    }
  }
});

// Game loop with delta time
let lastTime = performance.now();
function loop(now){
  const delta = (now - lastTime) / 1000; // seconds
  lastTime = now;

  // grow tiles with a probabilistic element
  state.tiles.forEach(tile => {
    // small random chance to advance faster
    if(Math.random() < 0.02 * delta){
      tile.growthProgress += 1.5; // bonus growth
    }
    tile.grow(delta);
  });

  draw();
  updateTileButtons();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Recompute grid when canvas size changes
new ResizeObserver(() => {
  initGrid();
}).observe(canvas);

// Initialize coins UI
updateCoinsUI();

// Initialize theme and language icons visibility
applyTheme(state.theme);
applyLang(state.lang);
