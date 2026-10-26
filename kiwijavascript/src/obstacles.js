import { CONFIG, HAZARD_DATA } from './config.js';
import { obstacleHitbox, playerHitbox, playerHitsObstacle } from './collision.js';

export function createObstaclePool(size = CONFIG.pooledHazards) {
  return Array.from({ length: size }, () => ({ active: false, kind: null, sprite: null }));
}

export function chooseHazardKind(random = Math.random) {
  const roll = random();
  if (roll < 0.28) return 'cactus';
  if (roll < 0.55) return 'harakeke';
  if (roll < 0.78) return 'tussock';
  return 'ponga';
}

export function spawnDelay(_viewWidth, speed, random = Math.random) {
  // Preserve a reaction/landing interval as speed rises, like Dino's
  // speed-scaled obstacle spacing.
  return Math.max(8 / speed, CONFIG.minimumObstacleInterval) +
    random() * CONFIG.obstacleIntervalVariation;
}

export function spawnObstacle(obstacle, viewWidth, random = Math.random) {
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

export function resetObstaclePool(pool) {
  for (const obstacle of pool) {
    obstacle.active = false;
    obstacle.kind = null;
    obstacle.sprite = null;
  }
}

export function stepObstacles(pool, dt, speed, leftEdge, player, onCollision) {
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
