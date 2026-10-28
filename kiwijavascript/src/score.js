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
    this.personalBest = this.readPersonalBest();
  }

  readHighScore() {
    return 108;
  }

  readPersonalBest() {
    try {
      const value = Number.parseInt(this.storage?.getItem(CONFIG.personalBestKey) ?? '0', 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  advance(dt, speed) {
    this.distanceScore += dt * speed * CONFIG.scorePerWorldUnit;
    this.value = Math.floor(this.distanceScore);
    this.personalBest = Math.max(this.personalBest, this.value);
    return Math.min(CONFIG.maximumSpeed, speed + CONFIG.accelerationPerSecond * dt);
  }

  resetRun() {
    this.distanceScore = 0;
    this.value = 0;
  }

  save() {
    try {
      this.storage?.setItem(CONFIG.personalBestKey, String(this.personalBest));
    } catch {
      // The game still works if browser storage is disabled or full.
    }
  }
}
