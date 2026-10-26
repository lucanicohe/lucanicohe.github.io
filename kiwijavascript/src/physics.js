import { CONFIG } from './config.js';

export function isGrounded(player) {
  return player.y <= CONFIG.groundY + 1.101 && Math.abs(player.velocityY) < 0.05;
}

export function stepPlayerPhysics(player, dt) {
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

export function jump(player, speed = CONFIG.initialSpeed) {
  if (!isGrounded(player)) return false;
  // Like Chrome Dino, scale the initial impulse slightly with run speed so
  // jumps keep enough clearance as the game gets faster.
  player.velocityY = CONFIG.jumpVelocity + speed * CONFIG.jumpSpeedFactor;
  return true;
}
