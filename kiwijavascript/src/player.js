import { CONFIG } from './config.js';

export function createPlayer(startX) {
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
