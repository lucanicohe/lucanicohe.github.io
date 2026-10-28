import { CONFIG } from './config.js';
import { pixelTextWidth, drawPixelText } from './pixel-font.js';

export class Renderer {
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

    const stats = [
      `MY HI ${game.score.highScore}`,
      `YOUR HI ${game.score.personalBest}`,
      `SCORE ${game.score.value}`,
    ];
    const scoreUnit = 5 * scale;
    const scoreRight = this.width * 0.97;
    const scoreTop = this.height * 0.07;
    stats.forEach((text, index) => {
      const scoreLeft = scoreRight - pixelTextWidth(text) * scoreUnit;
      drawPixelText(ctx, text, scoreLeft, scoreTop + index * 8 * scoreUnit, scoreUnit, CONFIG.inkColor);
    });

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
