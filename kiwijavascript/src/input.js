const isJumpKey = (event) => event.key === ' ' || event.code === 'Space';

function canvasIsVisible(canvas) {
  const bounds = canvas.getBoundingClientRect();
  return bounds.width > 0 && bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0;
}

export class GameInput {
  constructor(canvas, pointerTarget = canvas) {
    this.canvas = canvas;
    this.pointerTarget = pointerTarget;
    this.jumpPressed = false;
    this.onKeyDown = (event) => {
      if (this.isResumeLink(event.target)) return;
      if (!canvasIsVisible(this.canvas)) return;
      if (isJumpKey(event)) {
        event.preventDefault();
        if (!event.repeat) this.jumpPressed = true;
      }
    };
    this.onKeyUp = (event) => {
      if (this.isResumeLink(event.target)) return;
      if (canvasIsVisible(this.canvas) && isJumpKey(event)) {
        event.preventDefault();
      }
    };
    this.onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (this.isResumeLink(event.target)) return;
      event.preventDefault();
      this.jumpPressed = true;
      this.canvas.focus({ preventScroll: true });
    };
    this.onBlur = () => this.clear();

    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    window.addEventListener('blur', this.onBlur);
    this.pointerTarget.addEventListener('pointerdown', this.onPointerDown);
  }

  isResumeLink(target) {
    return target instanceof Element && Boolean(target.closest('.kiwi-resume-game__end-card a'));
  }

  consume() {
    const snapshot = { jumpPressed: this.jumpPressed };
    this.jumpPressed = false;
    return snapshot;
  }

  clear() {
    this.jumpPressed = false;
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.pointerTarget.removeEventListener('pointerdown', this.onPointerDown);
  }
}
