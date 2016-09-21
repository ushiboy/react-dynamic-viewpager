import React, { Children, PropTypes } from 'react';

export default class ViewPager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      index: props.index
    };
    this._containerWidth = 0;
    this._currentPosition = 0;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
  }

  render() {
    const { index } = this.state;
    const childStyle = {
      minHeight: 1,
      float: 'left',
      margin: 0,
      padding: 0,
      top: 0,
      position: 'relative',
      transitionProperty: 'transform'
    };
    const prevPage = this._createPageView(index - 1);
    const currentPage = this._createPageView(index);
    const nextPage = this._createPageView(index + 1);

    return (
      <div className='viewpager-container' ref='viewPagerContainer' style={{
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0,
        cursor: 'move'
      }} onTouchStart={this._onTouchStart} onMouseDown={this._onMouseDown}>
        <div className='viewpager-wrapper' ref='viewPagerWrapper' style={{
          position: 'relative',
          float: 'left',
          margin: 0,
          padding: 0,
          transitionProperty: 'transform'
        }}>
          <div className='viewpager-page' style={childStyle}>{prevPage}</div>
          <div className='viewpager-page' style={childStyle}>{currentPage}</div>
          <div className='viewpager-page' style={childStyle}>{nextPage}</div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this._onWindowResize, false);
    this._setupContainer();
  }

  componentWillUpdate() {
    this._resetCurrentTranslate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onWindowResize, false);
  }

  back() {
    const { index } = this.state;
    const { data } = this.props;
    const nextIndex = index - 1;
    const hasNextPage = typeof data[nextIndex] !== 'undefined';

    if (hasNextPage) {
      this._listenTransitionEnd(nextIndex);
      this._backTranslate();
    }
  }

  forward() {
    const { index } = this.state;
    const { data } = this.props;
    const nextIndex = index + 1;
    const hasNextPage = typeof data[nextIndex] !== 'undefined';

    if (hasNextPage) {
      this._listenTransitionEnd(nextIndex);
      this._forwardTranslate();
    }
  }

  _createPageView(index) {
    const { children, data } = this.props;
    if (typeof data === 'undefined') {
      return null;
    }
    const pageData = data[index];
    if (typeof pageData !== 'undefined') {
      const child = Children.only(children);
      return React.cloneElement(child, {
        index,
        data: pageData
      });
    }
    return null;
  }

  _setupContainer() {
    const { viewPagerContainer, viewPagerWrapper } = this.refs;
    const containerWidth = this._containerWidth
      = viewPagerContainer.getBoundingClientRect().width || viewPagerContainer.offsetWidth;
    viewPagerWrapper.style.width = `${(containerWidth * 3)}px`;
    Array.from(viewPagerWrapper.children).forEach(pageView => {
      pageView.style.width = `${containerWidth}px`;
    });
    this._resetCurrentTranslate();
  }

  _translate(dist, speed) {
    const { style } = this.refs.viewPagerWrapper;

    style.webkitTransitionDuration = style.MozTransitionDuration
      = style.msTransitionDuration = style.OTransitionDuration
      = style.transitionDuration = `${speed}ms`;

    style.webkitTransform = `translate(${dist}px,0)translateZ(0)`;
    style.msTransform = style.MozTransform = style.OTransform = `translateX(${dist}px)`;

    this._currentPosition = dist;
  }

  _resetCurrentTranslate(duration = 0) {
    this._translate(-this._containerWidth, duration);
  }

  _backTranslate(duration = 150) {
    this._translate(0, duration);
  }

  _forwardTranslate(duration = 150) {
    this._translate(-2 * this._containerWidth, duration);
  }

  _moveSlide(evt, x, y) {
    const { data } = this.props;
    const { index } = this.state;
    const deltaX = this._gesture.move(x, y);

    if (this._gesture.isValid()) {
      evt.preventDefault();
      this._translate(deltaX + this._currentPosition, 0);
    }
  }

  _endSlide() {
    const vector = this._gesture.end(20, this._containerWidth / 2);
    if (!this._gesture.isValid()) return;

    const { data } = this.props;
    const { index } = this.state;

    if (vector !== 0) {
      this._listenTransitionEnd(index + vector);
      if (vector > 0) {
        this._forwardTranslate();
      } else {
        this._backTranslate();
      }
    } else {
      this._resetCurrentTranslate();
    }
  }

  _onMouseDown(evt) {
    const { data } = this.props;
    const { index } = this.state;
    const enableBack = index - 1 >= 0;
    const enableNext = typeof data[index + 1] !== 'undefined';
    this._gesture = new PagingGesture(enableNext, enableBack);
    this._gesture.start(evt.pageX, evt.pageY);
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.addEventListener('mousemove', this._onMouseMove, false);
    viewPagerContainer.addEventListener('mouseup', this._onMouseUp, false);
  }

  _onMouseMove(evt) {
    this._moveSlide(evt, evt.pageX, evt.pageY);
  }

  _onMouseUp(evt) {
    this._endSlide();
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.removeEventListener('mousemove', this._onMouseMove, false);
    viewPagerContainer.removeEventListener('mouseup', this._onMouseUp, false);
  }

  _onTouchStart(evt) {
    const [ touch ] = evt.touches;
    const { data } = this.props;
    const { index } = this.state;
    const enableBack = index - 1 >= 0;
    const enableNext = typeof data[index + 1] !== 'undefined';
    this._gesture = new PagingGesture(enableNext, enableBack);
    this._gesture.start(touch.pageX, touch.pageY);
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.addEventListener('touchmove', this._onTouchMove, false);
    viewPagerContainer.addEventListener('touchend', this._onTouchEnd, false);
  }

  _onTouchMove(evt) {
    const [touch] = evt.touches;
    this._moveSlide(evt, touch.pageX, touch.pageY);
  }

  _onTouchEnd(evt) {
    this._endSlide();
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.removeEventListener('touchmove', this._onTouchMove, false);
    viewPagerContainer.removeEventListener('touchend', this._onTouchEnd, false);
  }

  _onTransitionEnd(nextIndex, evt) {
    this._unListenTransitionEnd();
    const oldIndex = this.state.index;
    this.setState({
      index: nextIndex
    });
    if (this.props.onChange) {
      this.props.onChange(nextIndex, oldIndex);
    }
  }

  _listenTransitionEnd(nextIndex) {
    if (this._bindedOnTransitionEnd) {
      this._unListenTransitionEnd();
    }
    this._bindedOnTransitionEnd = this._onTransitionEnd.bind(this, nextIndex);
    const { viewPagerWrapper } = this.refs;
    viewPagerWrapper.addEventListener('webkitTransitionEnd', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.addEventListener('msTransitionEnd', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.addEventListener('oTransitionEnd', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.addEventListener('otransitionend', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.addEventListener('transitionend', this._bindedOnTransitionEnd, false);
  }

  _unListenTransitionEnd() {
    const { viewPagerWrapper } = this.refs;
    viewPagerWrapper.removeEventListener('webkitTransitionEnd', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.removeEventListener('msTransitionEnd', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.removeEventListener('oTransitionEnd', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.removeEventListener('otransitionend', this._bindedOnTransitionEnd, false);
    viewPagerWrapper.removeEventListener('transitionend', this._bindedOnTransitionEnd, false);
  }

  _onWindowResize(evt) {
    this._setupContainer();
  }

}
ViewPager.propTypes = {
  index: PropTypes.number,
  onChange: PropTypes.func,
  data: PropTypes.array.isRequired,
  children: PropTypes.element.isRequired
};
ViewPager.defaultProps = {
  index: 0
};

export class PagingGesture {

  constructor(enableNext, enableBack) {
    this._start = {};
    this._before = {};
    this._delta = {};
    this._isVerticalScrolling = undefined;
    this._enableNext = enableNext;
    this._enableBack = enableBack;
  }

  start(x, y) {
    this._start = {
      x,
      y,
      time: Date.now()
    };
    this._before = {
      x,
      y
    };
  }


  move(x, y) {
    const delta = this._delta = {
      x: x - this._start.x,
      y: y - this._start.y
    };
    const isForward = delta.x < 0;

    if (typeof this._isVerticalScrolling === 'undefined') {
      this._isVerticalScrolling = Math.abs(delta.x) < Math.abs(delta.y);
    }

    if ((isForward && this._enableNext) || (!isForward && this._enableBack)) {
      const deltaX = x - this._before.x;
      this._before = { x, y };
      return deltaX;
    }

    return 0;
  }

  end(min, max) {
    if (this._isVerticalScrolling) return;

    const deltaX = this._delta.x;
    const absDeltaX = Math.abs(deltaX);
    const duration = Date.now() - this._start.time;
    const isValidSlide = duration < 250 && absDeltaX > min || absDeltaX > max;
    const isForward = deltaX < 0;

    if (isValidSlide) {
      if (isForward && this._enableNext) {
        return 1;
      } else if(!isForward && this._enableBack) {
        return -1;
      }
    }
    return 0;
  }

  isValid() {
    return this._isVerticalScrolling === false;
  }

}

