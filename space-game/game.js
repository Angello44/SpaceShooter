const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ── Canvas (rasio 3:4) ────────────────────────────────────────────────────────
function resize() {
  const maxW = window.innerWidth;
  const maxH = window.innerHeight - 90;
  let w = maxW,
    h = Math.round((w * 4) / 3);
  if (h > maxH) {
    h = maxH;
    w = Math.round((h * 3) / 4);
  }
  canvas.width = w;
  canvas.height = h;
}
resize();
window.addEventListener("resize", resize);
const W = () => canvas.width;
const H = () => canvas.height;

// ── State ─────────────────────────────────────────────────────────────────────
let running = false;
let score = 0,
  level = 1,
  lives = 3;
let highScore = parseInt(localStorage.getItem("spaceHighScore") || "0");
let lastTime = 0,
  spawnTimer = 0;
let overlayState = "start";

// ── Objek ─────────────────────────────────────────────────────────────────────
let player = {},
  stars = [];
let bullets = [],
  aBullets = [],
  aliens = [],
  particles = [];

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener("keydown", (e) => {
  // Mulai / restart game dari keyboard saat di overlay
  if (!running && (e.code === "Space" || e.code === "Enter")) {
    e.preventDefault();
    startGame();
    return;
  }
  keys[e.code] = true;
  if (e.code === "Space") {
    e.preventDefault();
    shoot();
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});
window.addEventListener("blur", () => {
  Object.keys(keys).forEach((k) => (keys[k] = false));
  clearInterval(fireTmr);
});

function holdBtn(id, code) {
  const b = document.getElementById(id);
  const on = () => {
    keys[code] = true;
  };
  const off = () => {
    keys[code] = false;
  };
  b.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      on();
    },
    { passive: false },
  );
  b.addEventListener("touchend", (e) => {
    e.preventDefault();
    off();
  });
  b.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    off();
  });
  b.addEventListener("mousedown", on);
  b.addEventListener("mouseup", off);
  b.addEventListener("mouseleave", off);
}
holdBtn("leftBtn", "ArrowLeft");
holdBtn("rightBtn", "ArrowRight");

let fireTmr = null;
const fb = document.getElementById("fireBtn");
const fireOn = () => {
  shoot();
  clearInterval(fireTmr);
  fireTmr = setInterval(shoot, 200);
};
const fireOff = () => {
  clearInterval(fireTmr);
  fireTmr = null;
};
fb.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    fireOn();
  },
  { passive: false },
);
fb.addEventListener("touchend", (e) => {
  e.preventDefault();
  fireOff();
});
fb.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  fireOff();
});
fb.addEventListener("mousedown", fireOn);
fb.addEventListener("mouseup", fireOff);
fb.addEventListener("mouseleave", fireOff);

// ── Init ──────────────────────────────────────────────────────────────────────
function initStars() {
  stars = Array.from({ length: 60 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.5 + 0.5,
    spd: Math.random() * 0.00025 + 0.00008,
  }));
}
function initPlayer() {
  player = { x: 0.5, y: 0.9, spd: 0.55, inv: 0 };
}

// ── Tembak player ─────────────────────────────────────────────────────────────
let lastShot = 0;
function shoot() {
  if (!running) return;
  const now = Date.now();
  if (now - lastShot < 220) return;
  lastShot = now;
  SFX.shoot();
  bullets.push({ x: player.x, y: player.y - 0.04 });
  if (level >= 3) {
    bullets.push({ x: player.x - 0.03, y: player.y - 0.025 });
    bullets.push({ x: player.x + 0.03, y: player.y - 0.025 });
  }
}

// ── Spawn alien ───────────────────────────────────────────────────────────────
function spawnAlien() {
  const r = Math.random();
  const type =
    level < 2
      ? "drone"
      : level < 4
        ? r < 0.65
          ? "drone"
          : "hunter"
        : r < 0.5
          ? "drone"
          : r < 0.8
            ? "hunter"
            : "boss";
  const cfg = {
    drone: { sz: 0.07, spd: 0.22, hp: 1, track: 0.1 },
    hunter: { sz: 0.09, spd: 0.15, hp: 3, track: 0.06 },
    boss: { sz: 0.13, spd: 0.08, hp: 7, track: 0.03 },
  }[type];
  aliens.push({
    x: 0.1 + Math.random() * 0.8,
    y: -cfg.sz,
    sz: cfg.sz,
    type,
    spd: cfg.spd + level * 0.018,
    hp: cfg.hp,
    maxHp: cfg.hp,
    track: cfg.track,
    vx: 0,
    vy: cfg.spd * 0.4,
    angle: 0,
    shotCd: type === "hunter" ? Math.max(0.9, 2.5 - level * 0.1) : 999,
    shotT: Math.random() * 2,
  });
}

// ── Ledakan ───────────────────────────────────────────────────────────────────
function explode(px, py, color, n) {
  for (let i = 0; i < n; i++) {
    const a = ((Math.PI * 2) / n) * i + Math.random() * 0.5;
    const s = 40 + Math.random() * 80;
    particles.push({
      x: px,
      y: py,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.7 + Math.random() * 0.4,
      r: 2 + Math.random() * 3,
      color,
    });
  }
}

// ── Tabrakan lingkaran ────────────────────────────────────────────────────────
function hit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx,
    dy = ay - by;
  return dx * dx + dy * dy < (ar + br) * (ar + br);
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  // Player
  if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= player.spd * dt;
  if (keys["ArrowRight"] || keys["KeyD"]) player.x += player.spd * dt;
  player.x = Math.max(0.05, Math.min(0.95, player.x));
  if (player.inv > 0) player.inv -= dt;
  if (keys["Space"]) shoot();

  // Bintang
  stars.forEach((s) => {
    s.y += s.spd * H() * dt;
    if (s.y > 1) s.y = 0;
  });

  // Peluru player
  bullets.forEach((b) => (b.y -= 1.2 * dt));
  bullets = bullets.filter((b) => b.y > -0.02);

  // Peluru alien
  aBullets.forEach((b) => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  });
  aBullets = aBullets.filter(
    (b) => b.x > -0.1 && b.x < 1.1 && b.y > -0.1 && b.y < 1.1,
  );

  // Spawn
  spawnTimer += dt;
  const interval = Math.max(0.5, 1.8 - level * 0.1);
  if (spawnTimer >= interval) {
    spawnTimer = 0;
    spawnAlien();
  }

  // Gerak alien + tembak balik
  aliens.forEach((e) => {
    const dx = player.x - e.x,
      dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    e.vx += (dx / dist) * e.spd * e.track * 60 * dt;
    e.vy += (dy / dist) * e.spd * e.track * 60 * dt;
    const cur = Math.sqrt(e.vx * e.vx + e.vy * e.vy) || 1;
    if (cur > e.spd) {
      e.vx = (e.vx / cur) * e.spd;
      e.vy = (e.vy / cur) * e.spd;
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.angle = Math.atan2(dy * H(), dx * W()) + Math.PI / 2;

    if (e.type === "hunter") {
      e.shotT += dt;
      if (e.shotT >= e.shotCd) {
        e.shotT = 0;
        const spd = 0.35 + level * 0.03;
        aBullets.push({
          x: e.x,
          y: e.y,
          vx: (dx / dist) * spd,
          vy: (dy / dist) * spd,
          r: 0.018,
        });
      }
    }
  });

  // Peluru player vs alien
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];
    for (let ei = aliens.length - 1; ei >= 0; ei--) {
      const e = aliens[ei];
      if (hit(b.x, b.y, 0.012, e.x, e.y, e.sz * 0.5)) {
        bullets.splice(bi, 1);
        e.hp--;
        if (e.hp <= 0) {
          const col =
            e.type === "boss"
              ? "#ff3333"
              : e.type === "hunter"
                ? "#cc44ff"
                : "#00ff88";
          explode(e.x * W(), e.y * H(), col, e.type === "boss" ? 18 : 10);
          aliens.splice(ei, 1);
          SFX.explode();
          // Tambah score + cek bonus nyawa tiap 1100
          const milestone = Math.floor(score / 1100);
          score += e.type === "boss" ? 50 : e.type === "hunter" ? 20 : 10;
          const newLevel = 1 + Math.floor(score / 150);
          if (newLevel > level) SFX.levelUp();
          level = newLevel;
          if (Math.floor(score / 1100) > milestone) {
            lives++;
            SFX.extraLife();
          }
        } else {
          explode(e.x * W(), e.y * H(), "#ffaa44", 4);
          SFX.hitEnemy();
        }
        break;
      }
    }
  }

  // Alien & peluru alien vs player
  if (player.inv <= 0) {
    for (let ei = aliens.length - 1; ei >= 0; ei--) {
      const e = aliens[ei];
      if (hit(e.x, e.y, e.sz * 0.5, player.x, player.y, 0.045)) {
        explode(e.x * W(), e.y * H(), "#ff4444", 12);
        aliens.splice(ei, 1);
        loseLife();
      }
    }
    for (let bi = aBullets.length - 1; bi >= 0; bi--) {
      const b = aBullets[bi];
      if (hit(b.x, b.y, b.r, player.x, player.y, 0.045)) {
        explode(b.x * W(), b.y * H(), "#ff88cc", 8);
        aBullets.splice(bi, 1);
        loseLife();
      }
    }
  }

  aliens = aliens.filter(
    (e) => e.y < 1.1 && e.y > -0.2 && e.x > -0.15 && e.x < 1.15,
  );

  particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  });
  particles = particles.filter((p) => p.life > 0);
}

function loseLife() {
  lives--;
  player.inv = 2.5;
  SFX.playerHit();
  if (lives <= 0) endGame();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = "#05051a";
  ctx.fillRect(0, 0, W(), H());

  // Bintang
  stars.forEach((s) => {
    ctx.globalAlpha = 0.4 + Math.random() * 0.4;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.x * W(), s.y * H(), s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Alien
  aliens.forEach(drawAlien);

  // Peluru player
  ctx.shadowBlur = 6;
  ctx.shadowColor = "#ffff00";
  ctx.fillStyle = "#ffff44";
  bullets.forEach((b) => ctx.fillRect(b.x * W() - 3, b.y * H() - 10, 6, 14));
  ctx.shadowBlur = 0;

  // Peluru alien
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#ff00cc";
  ctx.fillStyle = "#ff44cc";
  aBullets.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x * W(), b.y * H(), b.r * W(), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // Player
  drawPlayer();

  // Partikel
  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // HUD
  const fs = Math.max(12, W() * 0.04);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, W(), fs + 14);
  ctx.fillStyle = "#00ff88";
  ctx.font = `bold ${fs}px Courier New`;
  ctx.textAlign = "left";
  ctx.fillText(`SCORE: ${score}`, 10, fs + 4);
  ctx.textAlign = "center";
  ctx.fillText(`LEVEL: ${level}`, W() / 2, fs + 4);
  ctx.textAlign = "right";
  ctx.fillText(`❤ ${lives}`, W() - 10, fs + 4);
  // Best score kecil di bawah HUD bar
  ctx.fillStyle = "#ffcc00";
  ctx.font = `${Math.max(10, W() * 0.03)}px Courier New`;
  ctx.fillText(`BEST: ${highScore}`, W() - 10, fs + 22);
  ctx.textAlign = "left";

  if (!running) drawOverlay();
}

// ── Player ────────────────────────────────────────────────────────────────────
function drawPlayer() {
  if (player.inv > 0 && Math.floor(player.inv * 10) % 2 === 0) return;
  const px = player.x * W(),
    py = player.y * H();
  const w = W() * 0.09,
    h = W() * 0.09;
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#00aaff";
  ctx.fillStyle = "#00ccff";
  ctx.beginPath();
  ctx.moveTo(px, py - h / 2);
  ctx.lineTo(px - w / 2, py + h / 2);
  ctx.lineTo(px - w / 4, py + h / 3);
  ctx.lineTo(px, py + h / 2 - 3);
  ctx.lineTo(px + w / 4, py + h / 3);
  ctx.lineTo(px + w / 2, py + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#aaeeff";
  ctx.beginPath();
  ctx.ellipse(px, py - 3, w * 0.17, h * 0.27, 0, 0, Math.PI * 2);
  ctx.fill();
  const fl = 0.7 + Math.random() * 0.3;
  ctx.fillStyle = `rgba(255,${(100 + Math.random() * 100) | 0},0,${fl})`;
  ctx.beginPath();
  ctx.moveTo(px - w * 0.17, py + h / 2 - 2);
  ctx.lineTo(px, py + h / 2 + h * 0.3 * fl);
  ctx.lineTo(px + w * 0.17, py + h / 2 - 2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ── Alien ─────────────────────────────────────────────────────────────────────
function drawAlien(e) {
  const cx = e.x * W(),
    cy = e.y * H(),
    r = (e.sz * W()) / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(e.angle);

  if (e.type === "drone") {
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ff44";
    ctx.fillStyle = "#00cc33";
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.85, r * 0.8);
    ctx.lineTo(0, r * 0.3);
    ctx.lineTo(r * 0.85, r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff2222";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (e.type === "hunter") {
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#9900ff";
    ctx.fillStyle = "#551188";
    [-1, 1].forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.35, 0);
      ctx.lineTo(s * r * 1.1, r * 0.55);
      ctx.lineTo(s * r * 0.9, -r * 0.3);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = "#9922dd";
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.55, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffbbff";
    ctx.shadowColor = "#ff88ff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.22, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffee00";
    [-r * 0.18, r * 0.18].forEach((ox) => {
      ctx.beginPath();
      ctx.arc(ox, r * 0.22, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // boss
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff0000";
    ctx.fillStyle = "#880000";
    [-1, 1].forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.5, -r * 0.2);
      ctx.lineTo(s * r * 1.2, -r * 0.8);
      ctx.lineTo(s * r * 0.95, r * 0.1);
      ctx.lineTo(s * r * 0.5, r * 0.1);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = "#cc1111";
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.88, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ee3333";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.58, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8800";
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 8;
    [-r * 0.28, 0, r * 0.28].forEach((ox) => {
      ctx.beginPath();
      ctx.arc(ox, -r * 0.15, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#111";
    ctx.shadowBlur = 0;
    [-r * 0.28, 0, r * 0.28].forEach((ox) => {
      ctx.beginPath();
      ctx.arc(ox, -r * 0.15, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // HP bar
  if (e.maxHp > 1) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#222";
    ctx.fillRect(-r, r + 3, r * 2, 4);
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = pct > 0.5 ? "#00ff44" : pct > 0.25 ? "#ffaa00" : "#ff2222";
    ctx.fillRect(-r, r + 3, r * 2 * pct, 4);
  }
  ctx.restore();
  ctx.shadowBlur = 0;
}

// ── Overlay ───────────────────────────────────────────────────────────────────
function drawOverlay() {
  const cw = W(),
    ch = H();
  ctx.fillStyle = "rgba(5,5,26,0.85)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.textAlign = "center";

  if (overlayState === "start") {
    ctx.fillStyle = "#00ff88";
    ctx.font = `bold ${cw * 0.072}px Courier New`;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#00ff88";
    ctx.fillText("SPACE SHOOTER", cw / 2, ch * 0.28);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#aaffcc";
    ctx.font = `${cw * 0.042}px Courier New`;
    ctx.fillText("Alien menyerang!", cw / 2, ch * 0.38);
    ctx.fillStyle = "#66cc99";
    ctx.font = `${cw * 0.034}px Courier New`;
    ctx.fillText("← → gerak  |  SPACE tembak", cw / 2, ch * 0.46);
    ctx.fillText("ENTER/SPACE mulai  |  tombol di bawah", cw / 2, ch * 0.51);
    if (highScore > 0) {
      ctx.fillStyle = "#ffcc00";
      ctx.font = `${cw * 0.036}px Courier New`;
      ctx.fillText(`BEST: ${highScore}`, cw / 2, ch * 0.58);
    }
  } else {
    ctx.fillStyle = "#ff4444";
    ctx.font = `bold ${cw * 0.075}px Courier New`;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#ff0000";
    ctx.fillText("GAME OVER", cw / 2, ch * 0.28);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffcc00";
    ctx.font = `bold ${cw * 0.055}px Courier New`;
    ctx.fillText(`SCORE: ${score}`, cw / 2, ch * 0.4);
    ctx.fillStyle = "#aaffcc";
    ctx.font = `${cw * 0.038}px Courier New`;
    ctx.fillText(`Level: ${level}`, cw / 2, ch * 0.49);
    ctx.fillStyle = "#ffcc00";
    ctx.font = `${cw * 0.036}px Courier New`;
    ctx.fillText(`BEST: ${highScore}`, cw / 2, ch * 0.57);
  }

  // Tombol
  const bw = cw * 0.5,
    bh = cw * 0.1,
    bx = cw / 2 - bw / 2,
    by = ch * 0.65;
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = "rgba(0,255,136,0.08)";
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = "#00ff88";
  ctx.font = `bold ${cw * 0.042}px Courier New`;
  ctx.fillText(
    overlayState === "start" ? "▶  MULAI" : "▶  MAIN LAGI",
    cw / 2,
    by + bh * 0.65,
  );
  ctx.textAlign = "left";
}

canvas.addEventListener("pointerup", (e) => {
  if (running) return;
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (W() / rect.width);
  const cy = (e.clientY - rect.top) * (H() / rect.height);
  const cw = W(),
    ch = H();
  const bw = cw * 0.5,
    bh = cw * 0.1,
    bx = cw / 2 - bw / 2,
    by = ch * 0.65;
  if (cx > bx && cx < bx + bw && cy > by && cy < by + bh) startGame();
});

// ── Loop ──────────────────────────────────────────────────────────────────────
function loop(ts) {
  if (!running) return;
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// ── Start / End ───────────────────────────────────────────────────────────────
function startGame() {
  initAudio(); // aktifkan audio context (butuh interaksi user)
  score = 0;
  level = 1;
  lives = 3;
  bullets = [];
  aBullets = [];
  aliens = [];
  particles = [];
  spawnTimer = 0;
  initStars();
  initPlayer();
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("spaceHighScore", highScore);
  }
  overlayState = "over";
  SFX.gameOver();
  draw();
}

// ── Audio Engine (Web Audio API) ─────────────────────────────────────────────
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

// frequency: Hz, type: 'sine'|'square'|'sawtooth'|'triangle', duration: detik, volume: 0-1
function playSound(frequency, type, duration, volume = 0.3) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

// Suara-suara game
const SFX = {
  shoot: () => playSound(880, "square", 0.08, 0.18),
  hitEnemy: () => playSound(220, "sawtooth", 0.1, 0.2),
  explode: () => playSound(80, "sawtooth", 0.3, 0.35),
  playerHit: () => playSound(150, "square", 0.4, 0.4),
  levelUp: () => playSound(660, "sine", 0.2, 0.25),
  extraLife: () => {
    playSound(523, "sine", 0.12, 0.3);
    setTimeout(() => playSound(659, "sine", 0.12, 0.3), 130);
    setTimeout(() => playSound(784, "sine", 0.2, 0.3), 260);
  },
  gameOver: () => playSound(60, "square", 0.8, 0.4),
};

// ── Boot ──────────────────────────────────────────────────────────────────────
overlayState = "start";
initStars();
initPlayer();
draw();
