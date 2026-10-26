export const CONFIG = Object.freeze({
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

export const HAZARD_DATA = Object.freeze({
  cactus: Object.freeze({ width: 1.05, height: 1.72, visibleBounds: Object.freeze({ left: 6 / 32, right: 28 / 32, top: 0, bottom: 1 }), sprite: 'hazard-cactus' }),
  harakeke: Object.freeze({ width: 1.45, height: 1.9, visibleBounds: Object.freeze({ left: 1 / 32, right: 32 / 32, top: 0, bottom: 1 }), collisionBounds: Object.freeze({ left: 0.2, right: 0.8, top: 0.04, bottom: 0.98 }), sprite: 'hazard-harakeke' }),
  tussock: Object.freeze({ width: 1.55, height: 1.12, visibleBounds: Object.freeze({ left: 3 / 40, right: 40 / 40, top: 0, bottom: 1 }), sprite: 'hazard-tussock' }),
  ponga: Object.freeze({ width: 1.45, height: 1.78, visibleBounds: Object.freeze({ left: 4 / 40, right: 39 / 40, top: 0, bottom: 1 }), collisionBounds: Object.freeze({ left: 0.2, right: 0.8, top: 0.05, bottom: 0.98 }), sprite: 'hazard-ponga' }),
});
