export class Transform {
  constructor(
    el: HTMLElement,
    resetPosition: number,
    backPosition: number,
    forwardPosition: number
  ) {
    this._el = el;
    this.resetPosition = resetPosition;
    this.backPosition = backPosition;
    this.forwardPoisition = forwardPosition;
    this.transformedCallback = null;
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);

    el.addEventListener('webkitTransitionEnd', this.handleTransitionEnd, false);
    el.addEventListener('msTransitionEnd', this.handleTransitionEnd, false);
    el.addEventListener('oTransitionEnd', this.handleTransitionEnd, false);
    el.addEventListener('otransitionend', this.handleTransitionEnd, false);
    el.addEventListener('transitionend', this.handleTransitionEnd, false);
  }

  destroy(): void {
    this._el.removeEventListener(
      'webkitTransitionEnd',
      this.handleTransitionEnd,
      false
    );
    this._el.removeEventListener(
      'msTransitionEnd',
      this.handleTransitionEnd,
      false
    );
    this._el.removeEventListener(
      'oTransitionEnd',
      this.handleTransitionEnd,
      false
    );
    this._el.removeEventListener(
      'otransitionend',
      this.handleTransitionEnd,
      false
    );
    this._el.removeEventListener(
      'transitionend',
      this.handleTransitionEnd,
      false
    );
  }

  handleTransitionEnd(): void {
    if (this.transformedCallback) {
      this.transformedCallback();
    }
  }

  translate(dist: number, speed: number): number {
    const { style } = this._el;
    style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = `${speed}ms`;

    style.webkitTransform = `translate(${dist}px,0)translateZ(0)`;
    style.msTransform = style.MozTransform = style.OTransform = `translateX(${dist}px)`;
    return dist;
  }

  reset(speed = 0): number {
    return this.translate(this.resetPosition, speed);
  }

  back(speed = 150): number {
    return this.translate(this.backPosition, speed);
  }

  forward(speed = 150): number {
    return this.translate(this.forwardPoisition, speed);
  }
}
