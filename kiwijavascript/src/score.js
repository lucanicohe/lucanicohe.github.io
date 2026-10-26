import { CONFIG } from './config.js';

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export class ScoreKeeper {
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
