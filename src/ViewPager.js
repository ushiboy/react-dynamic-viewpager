import React, { Children, PropTypes } from 'react';

export default class ViewPager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      index: props.index
    };
    this._start = {};
    this._delta = {};
    this._before = {};
    this._containerWidth = 0;
    this._currentPosition = 0;
    this._isVerticalScrolling = undefined;

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
      <div ref="viewPagerContainer" style={{
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0,
        cursor: 'move'
      }}>
        <div ref="viewPagerWrapper" style={{
          position: 'relative',
          float: 'left',
          margin: 0,
          padding: 0,
          transitionProperty: 'transform'
        }}>
          <div style={childStyle}>{prevPage}</div>
          <div style={childStyle}>{currentPage}</div>
          <div style={childStyle}>{nextPage}</div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { viewPagerContainer } = this.refs;
    if (this._isTouchOk()) {
      viewPagerContainer.addEventListener('touchstart', this._onTouchStart, false);
    } else {
      viewPagerContainer.addEventListener('mousedown', this._onMouseDown, false);
    }
    window.addEventListener('resize', this._onWindowResize, false);
    this._setupContainer();
  }

  componentWillUpdate() {
    this._resetCurrentTranslate();
  }

  componentWillUnmount() {
    const { viewPagerContainer } = this.refs;
    if (this._isTouchOk()) {
      viewPagerContainer.removeEventListener('touchstart', this._onTouchStart, false);
    } else {
      viewPagerContainer.removeEventListener('mousedown', this._onMouseDown, false);
    }
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

  _isTouchOk() {
    return (typeof window.ontouchend !== 'undefined');
  }

  _createPageView(index) {
    const { children, data } = this.props;
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

  _startSlide(x, y) {
    this._start = {
      x,
      y,
      time: Date.now()
    };
    this._delta = {};
    this._before = {
      x,
      y
    };
    this._isVerticalScrolling = undefined;
  }

  _moveSlide(evt, x, y) {
    const { data } = this.props;
    const { index } = this.state;
    const delta = this._delta = {
      x: x - this._start.x,
      y: y - this._start.y
    };
    const isForward = delta.x < 0;
    const nextIndex = isForward ? index + 1 : index - 1;
    const hasNextPage = typeof data[nextIndex] !== 'undefined';

    if (typeof this._isVerticalScrolling === 'undefined') {
      this._isVerticalScrolling = Math.abs(delta.x) < Math.abs(delta.y);
    }

    if (!this._isVerticalScrolling && hasNextPage) {
      evt.preventDefault();
      this._translate((x - this._before.x) + this._currentPosition, 0);
    }
    this._before = { x, y };
  }

  _endSlide() {
    if (this._isVerticalScrolling) return;

    const { data } = this.props;
    const { index } = this.state;
    const deltaX = this._delta.x;
    const absDeltaX = Math.abs(deltaX);
    const duration = Date.now() - this._start.time;
    const isValidSlide = duration < 250 && absDeltaX > 20 || absDeltaX > this._containerWidth / 2;
    const isForward = deltaX < 0;
    const nextIndex = isForward ? index + 1 : index - 1;
    const hasNextPage = typeof data[nextIndex] !== 'undefined';

    if (isValidSlide && hasNextPage) {
      this._listenTransitionEnd(nextIndex);
      if (isForward) {
        this._forwardTranslate();
      } else {
        this._backTranslate();
      }
    } else {
      this._resetCurrentTranslate();
    }
  }

  _onMouseDown(evt) {
    this._startSlide(evt.pageX, evt.pageY);
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
    this._startSlide(touch.pageX, touch.pageY);
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
