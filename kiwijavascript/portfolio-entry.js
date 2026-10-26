import { Game } from './src/game.js';
import { loadAssets } from './src/assets.js';
import { GameInput } from './src/input.js';
import { Renderer } from './src/renderer.js';

const host = document.getElementById('kiwiResumeGame');
const canvas = document.getElementById('kiwiResumeCanvas');
const stage = document.getElementById('kiwiResumeStage');
const endCard = document.getElementById('kiwiResumeEndCard');
const resume = document.getElementById('resume');
const status = document.getElementById('kiwiResumeStatus');

function loadStyles() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./embed.css', import.meta.url).href;
    link.onload = resolve;
    link.onerror = () => reject(new Error('Could not load the portfolio game styles'));
    document.head.append(link);
  });
}

function nextFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

async function start() {
  if (!host || !canvas || !stage || !endCard || !resume || !status) return;

  try {
    const [assets] = await Promise.all([loadAssets(), loadStyles()]);
    host.hidden = false;
    resume.hidden = true;
    await nextFrame();

    const renderer = new Renderer(canvas, assets);
    const game = new Game(renderer.viewWidth);
    const input = new GameInput(canvas, stage);
    let lastTime = null;
    let showingEndCard = false;

    const resize = () => {
      renderer.resize();
      game.setViewWidth(renderer.viewWidth);
    };
    window.addEventListener('resize', resize, { passive: true });
    let resizeObserver = null;
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }

    function frame(timestamp) {
      const dt = lastTime === null ? 0 : Math.min((timestamp - lastTime) / 1000, 0.25);
      lastTime = timestamp;
      game.setViewWidth(renderer.viewWidth);
      game.update(dt, input.consume());

      if (game.mode === 'gameover' && !showingEndCard) {
        showingEndCard = true;
        stage.classList.add('is-game-over');
        endCard.hidden = false;
        status.textContent = document.documentElement.classList.contains('lang-ja')
          ? 'ゲームオーバー。Spaceキーか履歴書ボタン以外の場所をクリックすると再プレイできます。'
          : 'Game over. Press Space or click anywhere outside the résumé buttons to replay.';
        resize();
      } else if (game.mode !== 'gameover' && showingEndCard) {
        showingEndCard = false;
        stage.classList.remove('is-game-over');
        endCard.hidden = true;
        status.textContent = '';
        resize();
      }

      renderer.render(game);
      window.requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', () => {
      lastTime = null;
      input.clear();
    });
    window.requestAnimationFrame(frame);
  } catch (error) {
    console.error(error);
    host.hidden = true;
    resume.hidden = false;
  }
}

start();
