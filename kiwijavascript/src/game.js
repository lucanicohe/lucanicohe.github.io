import { CONFIG } from './config.js';
import { updatePlayerAnimation, resetAnimation, setDeadAnimation } from './animation.js';
import { isGrounded, jump, stepPlayerPhysics } from './physics.js';
import { createPlayer } from './player.js';
import { ScoreKeeper } from './score.js';
import { createObstaclePool, resetObstaclePool, spawnDelay, spawnObstacle, stepObstacles } from './obstacles.js';

export function createGroundMarks() {
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

export class Game {
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
