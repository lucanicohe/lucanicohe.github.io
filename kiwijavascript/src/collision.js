import { HAZARD_DATA } from './config.js';

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

export function playerHitbox(player) {
  const visible = PLAYER_VISIBLE_BOUNDS[player.sprite] ?? PLAYER_VISIBLE_BOUNDS['kiwi-run-1'];
  // Ignore the outer feather tips so side grazes are less punishing.
  return visibleSpriteHitbox(player, insetBounds(visible, 0.12, 0.08));
}

export function obstacleHitbox(obstacle) {
  const data = HAZARD_DATA[obstacle.kind];
  if (data?.collisionBounds) return visibleSpriteHitbox(obstacle, data.collisionBounds);

  const visible = data?.visibleBounds ?? { left: 0, right: 1, top: 0, bottom: 1 };
  return visibleSpriteHitbox(obstacle, insetBounds(visible, 0.08, 0.05));
}

export function overlapsAabb(a, b) {
  return Math.abs(a.x - b.x) < (a.width + b.width) * 0.5 &&
    Math.abs(a.y - b.y) < (a.height + b.height) * 0.5;
}

export function playerHitsObstacle(player, obstacle) {
  return overlapsAabb(playerHitbox(player), obstacleHitbox(obstacle));
}
