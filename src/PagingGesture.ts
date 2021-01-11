import { isUndefined } from './util';

export class PagingGesture {
  constructor(x: number, y: number, enableNext: boolean, enableBack: boolean) {
    this._start = {
      x,
      y,
      time: Date.now(),
    };
    this._before = {
      x,
      y,
    };
    this._delta = {};
    this._isVerticalScrolling = undefined;
    this._enableNext = enableNext;
    this._enableBack = enableBack;
  }

  move(x: number, y: number): number {
    const delta = (this._delta = {
      x: x - this._start.x,
      y: y - this._start.y,
    });
    const isForward = delta.x < 0;

    if (isUndefined(this._isVerticalScrolling)) {
      this._isVerticalScrolling = Math.abs(delta.x) < Math.abs(delta.y);
    }

    if ((isForward && this._enableNext) || (!isForward && this._enableBack)) {
      const deltaX = x - this._before.x;
      this._before = { x, y };
      return deltaX;
    }

    return 0;
  }

  calculateVector(limitDuration: number, limitDeltaX: number): number {
    if (this._isVerticalScrolling) return 0;

    const deltaX = this._delta.x;
    const absDeltaX = Math.abs(deltaX);
    const duration = Date.now() - this._start.time;
    const isValidSlide = duration < limitDuration && absDeltaX > limitDeltaX;
    const isForward = deltaX < 0;

    if (isValidSlide) {
      if (isForward && this._enableNext) {
        return 1;
      } else if (!isForward && this._enableBack) {
        return -1;
      }
    }
    return 0;
  }

  isValid(): boolean {
    return this._isVerticalScrolling === false;
  }
}
