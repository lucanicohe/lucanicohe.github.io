import { CONFIG } from './config.js';
import { isGrounded } from './physics.js';

export function updatePlayerAnimation(player, dt) {
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

export function setDeadAnimation(player) {
  player.sprite = 'kiwi-dead';
}

export function resetAnimation(player) {
  player.runClock = 0;
  player.sprite = 'kiwi-run-1';
  player.width = CONFIG.player.runWidth;
  player.height = CONFIG.player.runHeight;
}
