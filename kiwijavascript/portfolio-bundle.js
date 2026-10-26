/* Generated from the neighboring source modules by tools/build_portfolio_bundle.py. */
(function () {
  const __bundleBase = new URL('./', document.currentScript.src);
  const __modules = {
  'src/config.js': function (module, exports, __require, __moduleUrl) {
const CONFIG = Object.freeze({
  initialSpeed: 7.2,
  maximumSpeed: 14.5,
  accelerationPerSecond: 0.075,
  jumpVelocity: 12.1,
  jumpSpeedFactor: 0.1,
  gravity: 30,
  pooledHazards: 18,
  cameraHeight: 9,
  groundY: -2.55,
  groundSectionWidth: 24,
  groundLineHeight: 0.025,
  initialSpawnDelay: 0.9,
  minimumObstacleInterval: 1.05,
  obstacleIntervalVariation: 0.5,
  scorePerWorldUnit: 1.8,
  highScoreKey: 'KiwiRunnerHighScore',
  dayColor: '#fcfcfc',
  inkColor: '#525252',
  player: Object.freeze({
    runWidth: 48 / 32 * 1.5,
    runHeight: 40 / 32 * 1.8,
    standOffset: 1.1,
  }),
  hud: Object.freeze({ referenceWidth: 1920, referenceHeight: 1080 }),
});

const HAZARD_DATA = Object.freeze({
  cactus: Object.freeze({ width: 1.05, height: 1.72, visibleBounds: Object.freeze({ left: 6 / 32, right: 28 / 32, top: 0, bottom: 1 }), sprite: 'hazard-cactus' }),
  harakeke: Object.freeze({ width: 1.45, height: 1.9, visibleBounds: Object.freeze({ left: 1 / 32, right: 32 / 32, top: 0, bottom: 1 }), collisionBounds: Object.freeze({ left: 0.2, right: 0.8, top: 0.04, bottom: 0.98 }), sprite: 'hazard-harakeke' }),
  tussock: Object.freeze({ width: 1.55, height: 1.12, visibleBounds: Object.freeze({ left: 3 / 40, right: 40 / 40, top: 0, bottom: 1 }), sprite: 'hazard-tussock' }),
  ponga: Object.freeze({ width: 1.45, height: 1.78, visibleBounds: Object.freeze({ left: 4 / 40, right: 39 / 40, top: 0, bottom: 1 }), collisionBounds: Object.freeze({ left: 0.2, right: 0.8, top: 0.05, bottom: 0.98 }), sprite: 'hazard-ponga' }),
});

Object.assign(exports, {CONFIG, HAZARD_DATA});

  },
  'src/pixel-font.js': function (module, exports, __require, __moduleUrl) {
const GLYPHS = Object.freeze({
  H: ['#..#', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  I: ['####', '.##.', '.##.', '.##.', '.##.', '.##.', '####'],
  K: ['#..#', '#.#.', '##..', '#...', '##..', '#.#.', '#..#'],
  L: ['#...', '#...', '#...', '#...', '#...', '#...', '####'],
  A: ['.##.', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  C: ['.##.', '#..#', '#...', '#...', '#...', '#..#', '.##.'],
  E: ['####', '#...', '#...', '###.', '#...', '#...', '####'],
  G: ['.##.', '#..#', '#...', '#.##', '#..#', '#..#', '.###'],
  M: ['#..#', '####', '####', '#..#', '#..#', '#..#', '#..#'],
  O: ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '#..#', '###.', '#...', '#...', '#...'],
  R: ['###.', '#..#', '#..#', '###.', '#.#.', '#..#', '#..#'],
  S: ['.###', '#...', '#...', '.##.', '...#', '...#', '###.'],
  T: ['####', '.##.', '.##.', '.##.', '.##.', '.##.', '.##.'],
  V: ['#..#', '#..#', '#..#', '#..#', '#..#', '.##.', '.##.'],
  '0': ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  '1': ['..#.', '.##.', '..#.', '..#.', '..#.', '..#.', '.###'],
  '2': ['.##.', '#..#', '...#', '..#.', '.#..', '#...', '####'],
  '3': ['###.', '...#', '...#', '.##.', '...#', '...#', '###.'],
  '4': ['#..#', '#..#', '#..#', '####', '...#', '...#', '...#'],
  '5': ['####', '#...', '#...', '###.', '...#', '...#', '###.'],
  '6': ['.##.', '#...', '#...', '###.', '#..#', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..', '.#..', '.#..'],
  '8': ['.##.', '#..#', '#..#', '.##.', '#..#', '#..#', '.##.'],
  '9': ['.##.', '#..#', '#..#', '.###', '...#', '...#', '.##.'],
});

function glyphFor(char) {
  return GLYPHS[char] ?? ['....', '....', '....', '....', '....', '....', '....'];
}

function pixelTextWidth(text) {
  let width = 0;
  for (const char of text) width += char === ' ' ? 3 : 5;
  return width;
}

function drawPixelText(ctx, text, left, top, pixelSize, color) {
  ctx.fillStyle = color;
  let x = 0;
  for (const char of text) {
    if (char === ' ') {
      x += 3;
      continue;
    }
    const glyph = glyphFor(char);
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        if (glyph[row][col] === '#') {
          ctx.fillRect(left + (x + col) * pixelSize, top + row * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    x += 5;
  }
}

Object.assign(exports, {glyphFor, pixelTextWidth, drawPixelText});

  },
  'src/physics.js': function (module, exports, __require, __moduleUrl) {
const { CONFIG } = __require('src/config.js');
function isGrounded(player) {
  return player.y <= CONFIG.groundY + 1.101 && Math.abs(player.velocityY) < 0.05;
}

function stepPlayerPhysics(player, dt) {
  if (dt <= 0) {
    player.x = player.startX;
    return;
  }
  const floor = CONFIG.groundY + CONFIG.player.standOffset;
  player.velocityY -= CONFIG.gravity * dt;
  player.y += player.velocityY * dt;
  if (player.y <= floor) {
    player.y = floor;
    player.velocityY = 0;
  }
  player.x = player.startX;
}

function jump(player, speed = CONFIG.initialSpeed) {
  if (!isGrounded(player)) return false;
  // Like Chrome Dino, scale the initial impulse slightly with run speed so
  // jumps keep enough clearance as the game gets faster.
  player.velocityY = CONFIG.jumpVelocity + speed * CONFIG.jumpSpeedFactor;
  return true;
}

Object.assign(exports, {isGrounded, stepPlayerPhysics, jump});

  },
  'src/player.js': function (module, exports, __require, __moduleUrl) {
const { CONFIG } = __require('src/config.js');
function createPlayer(startX) {
  return {
    x: startX,
    startX,
    y: CONFIG.groundY + CONFIG.player.standOffset,
    velocityY: 0,
    runClock: 0,
    sprite: 'kiwi-run-1',
    width: CONFIG.player.runWidth,
    height: CONFIG.player.runHeight,
  };
}

Object.assign(exports, {createPlayer});

  },
  'src/animation.js': function (module, exports, __require, __moduleUrl) {
const { CONFIG } = __require('src/config.js');
const { isGrounded } = __require('src/physics.js');
function updatePlayerAnimation(player, dt) {
  player.width = CONFIG.player.runWidth;
  player.height = CONFIG.player.runHeight;
  if (!isGrounded(player)) {
    player.sprite = 'kiwi-run-1';
  } else {
    const frame = Math.floor(player.runClock * 16) % 4;
    player.sprite = `kiwi-run-${frame + 1}`;
  }
  player.runClock += dt;
}

function setDeadAnimation(player) {
  player.sprite = 'kiwi-dead';
}

function resetAnimation(player) {
  player.runClock = 0;
  player.sprite = 'kiwi-run-1';
  player.width = CONFIG.player.runWidth;
  player.height = CONFIG.player.runHeight;
}

Object.assign(exports, {updatePlayerAnimation, setDeadAnimation, resetAnimation});

  },
  'src/score.js': function (module, exports, __require, __moduleUrl) {
const { CONFIG } = __require('src/config.js');
function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

class ScoreKeeper {
  constructor(storage = defaultStorage()) {
    this.storage = storage;
    this.distanceScore = 0;
    this.value = 0;
    this.highScore = this.readHighScore();
  }

  readHighScore() {
    try {
      const value = Number.parseInt(this.storage?.getItem(CONFIG.highScoreKey) ?? '0', 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  advance(dt, speed) {
    this.distanceScore += dt * speed * CONFIG.scorePerWorldUnit;
    this.value = Math.floor(this.distanceScore);
    if (this.value > this.highScore) {
      this.highScore = this.value;
      this.save();
    }
    return Math.min(CONFIG.maximumSpeed, speed + CONFIG.accelerationPerSecond * dt);
  }

  resetRun() {
    this.distanceScore = 0;
    this.value = 0;
  }

  save() {
    try {
      this.storage?.setItem(CONFIG.highScoreKey, String(this.highScore));
    } catch {
      // The run still works if browser storage is disabled or full.
    }
  }
}

Object.assign(exports, {ScoreKeeper});

  },
  'src/collision.js': function (module, exports, __require, __moduleUrl) {
const { HAZARD_DATA } = __require('src/config.js');
const PLAYER_VISIBLE_BOUNDS = Object.freeze({
  'kiwi-run-1': Object.freeze({ left: 1 / 48, right: 47 / 48, top: 9 / 40, bottom: 1 }),
  'kiwi-run-2': Object.freeze({ left: 2 / 48, right: 46 / 48, top: 9 / 40, bottom: 1 }),
  'kiwi-run-3': Object.freeze({ left: 2 / 48, right: 46 / 48, top: 9 / 40, bottom: 1 }),
  'kiwi-run-4': Object.freeze({ left: 2 / 48, right: 47 / 48, top: 9 / 40, bottom: 1 }),
  'kiwi-dead': Object.freeze({ left: 2 / 48, right: 48 / 48, top: 9 / 40, bottom: 1 }),
});

function visibleSpriteHitbox(sprite, bounds) {
  const left = sprite.x - sprite.width * 0.5 + sprite.width * bounds.left;
  const right = sprite.x - sprite.width * 0.5 + sprite.width * bounds.right;
  const top = sprite.y + sprite.height * 0.5 - sprite.height * bounds.top;
  const bottom = sprite.y + sprite.height * 0.5 - sprite.height * bounds.bottom;
  return { x: (left + right) * 0.5, y: (top + bottom) * 0.5, width: right - left, height: top - bottom };
}

function insetBounds(bounds, horizontal, vertical) {
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  return {
    left: bounds.left + width * horizontal,
    right: bounds.right - width * horizontal,
    top: bounds.top + height * vertical,
    bottom: bounds.bottom - height * vertical,
  };
}

function playerHitbox(player) {
  const visible = PLAYER_VISIBLE_BOUNDS[player.sprite] ?? PLAYER_VISIBLE_BOUNDS['kiwi-run-1'];
  // Ignore the outer feather tips so side grazes are less punishing.
  return visibleSpriteHitbox(player, insetBounds(visible, 0.12, 0.08));
}

function obstacleHitbox(obstacle) {
  const data = HAZARD_DATA[obstacle.kind];
  if (data?.collisionBounds) return visibleSpriteHitbox(obstacle, data.collisionBounds);

  const visible = data?.visibleBounds ?? { left: 0, right: 1, top: 0, bottom: 1 };
  return visibleSpriteHitbox(obstacle, insetBounds(visible, 0.08, 0.05));
}

function overlapsAabb(a, b) {
  return Math.abs(a.x - b.x) < (a.width + b.width) * 0.5 &&
    Math.abs(a.y - b.y) < (a.height + b.height) * 0.5;
}

function playerHitsObstacle(player, obstacle) {
  return overlapsAabb(playerHitbox(player), obstacleHitbox(obstacle));
}

Object.assign(exports, {playerHitbox, obstacleHitbox, overlapsAabb, playerHitsObstacle});

  },
  'src/obstacles.js': function (module, exports, __require, __moduleUrl) {
const { CONFIG, HAZARD_DATA } = __require('src/config.js');
const { obstacleHitbox, playerHitbox, playerHitsObstacle } = __require('src/collision.js');
function createObstaclePool(size = CONFIG.pooledHazards) {
  return Array.from({ length: size }, () => ({ active: false, kind: null, sprite: null }));
}

function chooseHazardKind(random = Math.random) {
  const roll = random();
  if (roll < 0.28) return 'cactus';
  if (roll < 0.55) return 'harakeke';
  if (roll < 0.78) return 'tussock';
  return 'ponga';
}

function spawnDelay(_viewWidth, speed, random = Math.random) {
  // Preserve a reaction/landing interval as speed rises, like Dino's
  // speed-scaled obstacle spacing.
  return Math.max(8 / speed, CONFIG.minimumObstacleInterval) +
    random() * CONFIG.obstacleIntervalVariation;
}

function spawnObstacle(obstacle, viewWidth, random = Math.random) {
  const kind = chooseHazardKind(random);
  const data = HAZARD_DATA[kind];
  const variant = kind === 'cactus' ? 0.92 + random() * 0.16 : 0.96 + random() * 0.08;
  const width = data.width * variant;
  obstacle.active = true;
  obstacle.kind = kind;
  obstacle.sprite = data.sprite;
  obstacle.width = width;
  obstacle.height = data.height;
  obstacle.x = viewWidth * 0.5 + width;
  obstacle.y = CONFIG.groundY + data.height * 0.5;
  return obstacle;
}

function resetObstaclePool(pool) {
  for (const obstacle of pool) {
    obstacle.active = false;
    obstacle.kind = null;
    obstacle.sprite = null;
  }
}

function stepObstacles(pool, dt, speed, leftEdge, player, onCollision) {
  for (const obstacle of pool) {
    if (!obstacle.active) continue;
    const previousX = obstacle.x;
    const nextX = previousX - speed * dt;
    if (playerHitsObstacle(player, obstacle)) {
      onCollision();
      return;
    }

    const playerBox = playerHitbox(player);
    const obstacleBox = obstacleHitbox(obstacle);
    const verticalOverlap = Math.abs(playerBox.y - obstacleBox.y) < (playerBox.height + obstacleBox.height) * 0.5;
    const obstacleLeftOffset = obstacleBox.x - previousX - obstacleBox.width * 0.5;
    const contactX = playerBox.x + playerBox.width * 0.5 - obstacleLeftOffset;
    if (verticalOverlap && previousX > contactX && nextX <= contactX) {
      // Keep the rendered sprites touching at impact while collision bounds stay inset.
      obstacle.x = contactX - 0.02;
      onCollision();
      return;
    }

    obstacle.x = nextX;
    if (obstacle.x < leftEdge) {
      obstacle.active = false;
      obstacle.kind = null;
      obstacle.sprite = null;
      continue;
    }

    if (playerHitsObstacle(player, obstacle)) {
      onCollision();
      return;
    }
  }
}

Object.assign(exports, {createObstaclePool, chooseHazardKind, spawnDelay, spawnObstacle, resetObstaclePool, stepObstacles});

  },
  'src/game.js': function (module, exports, __require, __moduleUrl) {
const { CONFIG } = __require('src/config.js');
const { updatePlayerAnimation, resetAnimation, setDeadAnimation } = __require('src/animation.js');
const { isGrounded, jump, stepPlayerPhysics } = __require('src/physics.js');
const { createPlayer } = __require('src/player.js');
const { ScoreKeeper } = __require('src/score.js');
const { createObstaclePool, resetObstaclePool, spawnDelay, spawnObstacle, stepObstacles } = __require('src/obstacles.js');
function createGroundMarks() {
  const marks = [[], []];
  for (let i = 0; i < 30; i += 1) {
    const x = 0.34 + i * 0.78 + ((i * 7) % 9) * 0.043;
    const width = 0.02 + ((i * 13) % 5) * 0.012;
    const y = -0.02 - ((i * 11) % 4) * 0.003;
    marks[0].push({ x, y, width, height: 0.04 });

    const secondX = (x + 0.37) % CONFIG.groundSectionWidth;
    const secondY = -0.02 - ((i * 9 + 2) % 4) * 0.003;
    marks[1].push({ x: secondX, y: secondY, width, height: 0.04 });
  }
  return marks;
}

class Game {
  constructor(initialViewWidth, { random = Math.random, storage } = {}) {
    this.random = random;
    this.viewWidth = initialViewWidth;
    const aspect = initialViewWidth / CONFIG.cameraHeight;
    const playerX = -4.5 * aspect * 0.76;
    this.player = createPlayer(playerX);
    this.mode = 'ready';
    this.speed = CONFIG.initialSpeed;
    this.spawnTimer = CONFIG.initialSpawnDelay;
    this.obstacles = createObstaclePool();
    this.groundSegments = [-12, 12];
    this.groundMarks = createGroundMarks();
    this.score = new ScoreKeeper(storage);
  }

  setViewWidth(width) {
    if (!Number.isFinite(width) || width <= 0) return;
    const scale = width / this.viewWidth;
    if (Number.isFinite(scale) && scale > 0 && Math.abs(scale - 1) > 0.001) {
      this.player.x *= scale;
      this.player.startX *= scale;
    }
    this.viewWidth = width;
  }

  startRun() {
    this.mode = 'playing';
    this.spawnTimer = CONFIG.initialSpawnDelay;
    jump(this.player, this.speed);
  }

  resetRun() {
    resetObstaclePool(this.obstacles);
    this.mode = 'ready';
    this.speed = CONFIG.initialSpeed;
    this.spawnTimer = CONFIG.initialSpawnDelay;
    this.score.resetRun();
    this.player.x = this.player.startX;
    this.player.y = CONFIG.groundY + CONFIG.player.standOffset;
    this.player.velocityY = 0;
    resetAnimation(this.player);
    this.groundSegments = [-12, 12];
  }

  endRun() {
    if (this.mode !== 'playing') return;
    this.mode = 'gameover';
    this.player.velocityY = 0;
    setDeadAnimation(this.player);
    this.score.save();
  }

  update(dt, input = { jumpPressed: false }) {
    if (input.jumpPressed) {
      if (this.mode === 'ready') this.startRun();
      else if (this.mode === 'gameover') {
        this.resetRun();
        this.startRun();
      } else if (isGrounded(this.player)) {
        jump(this.player);
      }
    }

    if (this.mode !== 'playing') return;

    // Small simulation slices keep collisions consistent if a browser frame stalls.
    let remaining = dt;
    while (remaining > 0 && this.mode === 'playing') {
      const step = Math.min(remaining, 1 / 120);
      stepPlayerPhysics(this.player, step);
      updatePlayerAnimation(this.player, step);
      this.stepGround(step);
      this.stepSpawning(step);

      const leftEdge = -this.viewWidth * 0.5 - 2;
      stepObstacles(this.obstacles, step, this.speed, leftEdge, this.player, () => this.endRun());
      if (this.mode !== 'playing') break;
      this.speed = this.score.advance(step, this.speed);
      remaining -= step;
    }
  }

  stepGround(dt) {
    const distance = this.speed * dt;
    this.groundSegments[0] -= distance;
    this.groundSegments[1] -= distance;
    const cameraLeft = -this.viewWidth * 0.5;
    const sectionWidth = CONFIG.groundSectionWidth;
    while (this.groundSegments[0] + sectionWidth <= cameraLeft) {
      this.groundSegments[0] = this.groundSegments[1] + sectionWidth;
    }
    while (this.groundSegments[1] + sectionWidth <= cameraLeft) {
      this.groundSegments[1] = this.groundSegments[0] + sectionWidth;
    }
  }

  stepSpawning(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;

    const freeObstacle = this.obstacles.find((obstacle) => !obstacle.active);
    if (freeObstacle) spawnObstacle(freeObstacle, this.viewWidth, this.random);
    this.spawnTimer = spawnDelay(this.viewWidth, this.speed, this.random);
  }
}

Object.assign(exports, {createGroundMarks, Game});

  },
  'src/assets.js': function (module, exports, __require, __moduleUrl) {
const assetUrls = {
  player: {
    run: [
      'kiwi-run-1.png',
      'kiwi-run-2.png',
      'kiwi-run-3.png',
      'kiwi-run-4.png',
    ],
    dead: 'kiwi-dead.png',
  },
  hazards: {
    cactus: 'hazard-cactus.png',
    harakeke: 'hazard-harakeke.png',
    tussock: 'hazard-tussock.png',
    ponga: 'hazard-ponga.png',
  },
};

function loadImage(filename) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${filename}`));
    image.src = new URL(`../assets/sprites/${filename}`, __moduleUrl).href;
  });
}

async function loadAssets() {
  const player = {};
  player.run = await Promise.all(assetUrls.player.run.map(loadImage));
  player.dead = await loadImage(assetUrls.player.dead);

  const hazards = Object.fromEntries(await Promise.all(
    Object.entries(assetUrls.hazards).map(async ([kind, filename]) => [kind, await loadImage(filename)]),
  ));
  return { player, hazards };
}

Object.assign(exports, {loadAssets});

  },
  'src/input.js': function (module, exports, __require, __moduleUrl) {
const isJumpKey = (event) => event.key === ' ' || event.code === 'Space';

function canvasIsVisible(canvas) {
  const bounds = canvas.getBoundingClientRect();
  return bounds.width > 0 && bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0;
}

class GameInput {
  constructor(canvas, pointerTarget = canvas) {
    this.canvas = canvas;
    this.pointerTarget = pointerTarget;
    this.jumpPressed = false;
    this.onKeyDown = (event) => {
      if (this.isResumeLink(event.target)) return;
      if (!canvasIsVisible(this.canvas)) return;
      if (isJumpKey(event)) {
        event.preventDefault();
        if (!event.repeat) this.jumpPressed = true;
      }
    };
    this.onKeyUp = (event) => {
      if (this.isResumeLink(event.target)) return;
      if (canvasIsVisible(this.canvas) && isJumpKey(event)) {
        event.preventDefault();
      }
    };
    this.onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (this.isResumeLink(event.target)) return;
      event.preventDefault();
      this.jumpPressed = true;
      this.canvas.focus({ preventScroll: true });
    };
    this.onBlur = () => this.clear();

    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    window.addEventListener('blur', this.onBlur);
    this.pointerTarget.addEventListener('pointerdown', this.onPointerDown);
  }

  isResumeLink(target) {
    return target instanceof Element && Boolean(target.closest('.kiwi-resume-game__end-card a'));
  }

  consume() {
    const snapshot = { jumpPressed: this.jumpPressed };
    this.jumpPressed = false;
    return snapshot;
  }

  clear() {
    this.jumpPressed = false;
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.pointerTarget.removeEventListener('pointerdown', this.onPointerDown);
  }
}

Object.assign(exports, {GameInput});

  },
  'src/renderer.js': function (module, exports, __require, __moduleUrl) {
const { CONFIG } = __require('src/config.js');
const { pixelTextWidth, drawPixelText } = __require('src/pixel-font.js');
class Renderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.assets = assets;
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.pixelRatio = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);
    this.worldScale = this.height / CONFIG.cameraHeight;
    this.viewWidth = this.width / this.worldScale;
  }

  render(game) {
    const ctx = this.ctx;
    const scale = this.worldScale;
    const centerX = this.width * 0.5;
    const centerY = this.height * 0.5;
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = CONFIG.dayColor;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawGround(game, centerX, centerY, scale);
    this.drawObstacles(game.obstacles, centerX, centerY, scale);
    this.drawPlayer(game.player, centerX, centerY, scale);
    this.drawHud(game);
  }

  drawGround(game, centerX, centerY, scale) {
    const ctx = this.ctx;
    const lineHeight = Math.max(1 / this.pixelRatio, CONFIG.groundLineHeight * scale);
    const lineTop = centerY - (CONFIG.groundY + CONFIG.groundLineHeight * 0.5) * scale;
    const snappedTop = Math.round(lineTop * this.pixelRatio) / this.pixelRatio;
    ctx.fillStyle = CONFIG.inkColor;
    ctx.fillRect(0, snappedTop, this.width, lineHeight);

    for (let segment = 0; segment < 2; segment += 1) {
      const x = game.groundSegments[segment];
      for (const mark of game.groundMarks[segment]) {
        const worldX = x + mark.x;
        if (Math.abs(worldX - game.player.x) <= 1.2) continue;
        const markLeft = centerX + (worldX - mark.width * 0.5) * scale;
        const markTop = centerY - (CONFIG.groundY + mark.y + mark.height * 0.5) * scale;
        ctx.fillRect(markLeft, markTop, mark.width * scale, mark.height * scale);
      }
    }
  }

  drawPlayer(player, centerX, centerY, scale) {
    let image;
    if (player.sprite === 'kiwi-dead') image = this.assets.player.dead;
    else {
      const frame = Number(player.sprite.slice('kiwi-run-'.length)) - 1;
      image = this.assets.player.run[frame] ?? this.assets.player.run[0];
    }
    this.drawWorldSprite(image, player.x, player.y, player.width, player.height, centerX, centerY, scale);
  }

  drawObstacles(obstacles, centerX, centerY, scale) {
    for (const obstacle of obstacles) {
      if (!obstacle.active) continue;
      const image = this.assets.hazards[obstacle.kind];
      this.drawWorldSprite(image, obstacle.x, obstacle.y, obstacle.width, obstacle.height, centerX, centerY, scale);
    }
  }

  drawWorldSprite(image, x, y, width, height, centerX, centerY, scale) {
    const left = centerX + (x - width * 0.5) * scale;
    const top = centerY - (y + height * 0.5) * scale;
    this.ctx.drawImage(image, left, top, width * scale, height * scale);
  }

  drawHud(game) {
    const ctx = this.ctx;
    const scale = Math.sqrt((this.width / CONFIG.hud.referenceWidth) * (this.height / CONFIG.hud.referenceHeight));

    const scoreText = `HI ${String(game.score.highScore).padStart(6, '0')}  ${String(game.score.value).padStart(6, '0')}`;
    const scoreImageWidth = 81 * 7 * scale;
    const scoreImageHeight = 7 * 7 * scale;
    const scoreLeft = this.width * 0.97 - scoreImageWidth;
    const scoreTop = this.height * 0.1 - scoreImageHeight * 0.5;
    drawPixelText(ctx, scoreText, scoreLeft, scoreTop, 7 * scale, CONFIG.inkColor);

    if (game.mode !== 'gameover') return;
    this.drawCenteredPixelText('GAME OVER', this.width * 0.5, this.height * (1 - 0.55), 6 * scale);
    this.drawCenteredPixelText('PRESS SPACE OR CLICK TO RESTART', this.width * 0.5, this.height * (1 - 0.46), 3.8 * scale);
  }

  drawCenteredPixelText(text, centerX, centerY, unit) {
    const textWidth = pixelTextWidth(text) * unit;
    const textHeight = 7 * unit;
    drawPixelText(this.ctx, text, centerX - textWidth * 0.5, centerY - textHeight * 0.5, unit, CONFIG.inkColor);
  }
}

Object.assign(exports, {Renderer});

  },
  'portfolio-entry.js': function (module, exports, __require, __moduleUrl) {
const { Game } = __require('src/game.js');
const { loadAssets } = __require('src/assets.js');
const { GameInput } = __require('src/input.js');
const { Renderer } = __require('src/renderer.js');
const host = document.getElementById('kiwiResumeGame');
const canvas = document.getElementById('kiwiResumeCanvas');
const stage = document.getElementById('kiwiResumeStage');
const endCard = document.getElementById('kiwiResumeEndCard');
const resume = document.getElementById('resume');
const status = document.getElementById('kiwiResumeStatus');

function loadStyles() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./embed.css', __moduleUrl).href;
    link.onload = resolve;
    link.onerror = () => reject(new Error('Could not load the portfolio game styles'));
    document.head.append(link);
  });
}

function nextFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

async function start() {
  if (!host || !canvas || !stage || !endCard || !resume || !status) return;

  try {
    const [assets] = await Promise.all([loadAssets(), loadStyles()]);
    host.hidden = false;
    resume.hidden = true;
    await nextFrame();

    const renderer = new Renderer(canvas, assets);
    const game = new Game(renderer.viewWidth);
    const input = new GameInput(canvas, stage);
    let lastTime = null;
    let showingEndCard = false;

    const resize = () => {
      renderer.resize();
      game.setViewWidth(renderer.viewWidth);
    };
    window.addEventListener('resize', resize, { passive: true });
    let resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }

    function frame(timestamp) {
      const dt = lastTime === null ? 0 : Math.min((timestamp - lastTime) / 1000, 0.25);
      lastTime = timestamp;
      game.setViewWidth(renderer.viewWidth);
      game.update(dt, input.consume());

      if (game.mode === 'gameover' && !showingEndCard) {
        showingEndCard = true;
        stage.classList.add('is-game-over');
        endCard.hidden = false;
        status.textContent = document.documentElement.classList.contains('lang-ja')
          ? 'ゲームオーバー。Spaceキーか履歴書ボタン以外の場所をクリックすると再プレイできます。'
          : 'Game over. Press Space or click anywhere outside the résumé buttons to replay.';
        resize();
      } else if (game.mode !== 'gameover' && showingEndCard) {
        showingEndCard = false;
        stage.classList.remove('is-game-over');
        endCard.hidden = true;
        status.textContent = '';
        resize();
      }

      renderer.render(game);
      window.requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', () => {
      lastTime = null;
      input.clear();
    });
    window.requestAnimationFrame(frame);
  } catch (error) {
    console.error(error);
    host.hidden = true;
    resume.hidden = false;
  }
}

start();

  },
  };
  const __cache = Object.create(null);
  function __require(id) {
    if (__cache[id]) return __cache[id].exports;
    const module = { exports: {} };
    __cache[id] = module;
    const factory = __modules[id];
    if (!factory) throw new Error(`Unknown bundled module: ${id}`);
    factory(module, module.exports, __require, new URL(id, __bundleBase).href);
    return module.exports;
  }
  __require('portfolio-entry.js');
})();
