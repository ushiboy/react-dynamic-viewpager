import React, { Children } from 'react';
import { Transform } from './Transform';
import { PagingGesture } from './PagingGesture';
import { isUndefined } from './util';

//ViewPager.propTypes = {
//  index: PropTypes.number,
//  duration: PropTypes.number,
//  minDelta: PropTypes.number,
//  onChange: PropTypes.func,
//  data: PropTypes.array.isRequired,
//  children: PropTypes.element.isRequired,
//};
//ViewPager.defaultProps = {
//  index: 0,
//  duration: 250,
//  minDelta: 20,
//};
export default class ViewPager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: props.index,
    };
    this._containerWidth = 0;
    this._currentPosition = 0;
    this._gesture = null;
    this._transformer = null;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
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
      transitionProperty: 'transform',
    };
    const prevPage = this._createPageView(index - 1);
    const currentPage = this._createPageView(index);
    const nextPage = this._createPageView(index + 1);

    return (
      <div
        className="viewpager-container"
        ref="viewPagerContainer"
        style={{
          overflow: 'hidden',
          position: 'relative',
          margin: 0,
          padding: 0,
          cursor: 'move',
        }}
        onTouchStart={this.handleTouchStart}
        onMouseDown={this.handleMouseDown}
      >
        <div
          className="viewpager-wrapper"
          ref="viewPagerWrapper"
          style={{
            position: 'relative',
            float: 'left',
            margin: 0,
            padding: 0,
            transitionProperty: 'transform',
          }}
        >
          <div className="viewpager-page" style={childStyle}>
            {prevPage}
          </div>
          <div className="viewpager-page" style={childStyle}>
            {currentPage}
          </div>
          <div className="viewpager-page" style={childStyle}>
            {nextPage}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize, false);
    this._initContainer();
  }

  componentDidUpdate(prevProps) {
    const { index } = this.props;
    if (prevProps.index !== index && !isUndefined(index)) {
      this.setState({
        index,
      });
    }
  }

  UNSAFE_componentWillUpdate() {
    this._currentPosition = this._transformer.reset();
  }

  componentWillUnmount() {
    this._transformer.destroy();
    window.removeEventListener('resize', this.handleWindowResize, false);
  }

  back() {
    const { index } = this.state;
    const { data } = this.props;
    const nextIndex = index - 1;
    const hasNextPage = !isUndefined(data[nextIndex]);

    if (hasNextPage) {
      this._transformer.transformedCallback = () => {
        this.setNextIndex(nextIndex);
      };
      this._currentPosition = this._transformer.back();
    }
  }

  forward() {
    const { index } = this.state;
    const { data } = this.props;
    const nextIndex = index + 1;
    const hasNextPage = !isUndefined(data[nextIndex]);

    if (hasNextPage) {
      this._transformer.transformedCallback = () => {
        this.setNextIndex(nextIndex);
      };
      this._currentPosition = this._transformer.forward();
    }
  }

  setNextIndex(nextIndex) {
    const oldIndex = this.state.index;
    this.setState({
      index: nextIndex,
    });
    if (this.props.onChange) {
      this.props.onChange(nextIndex, oldIndex);
    }
  }

  handleMouseDown(evt) {
    this._startGesture(evt.pageX, evt.pageY);
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.addEventListener(
      'mousemove',
      this.handleMouseMove,
      false
    );
    viewPagerContainer.addEventListener('mouseup', this.handleMouseUp, false);
    viewPagerContainer.addEventListener('mouseout', this.handleMouseUp, false);
  }

  handleMouseMove(evt) {
    this._moveGesture(evt, evt.pageX, evt.pageY);
  }

  handleMouseUp(evt) {
    this._endGesture();
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.removeEventListener(
      'mousemove',
      this.handleMouseMove,
      false
    );
    viewPagerContainer.removeEventListener(
      'mouseup',
      this.handleMouseUp,
      false
    );
    viewPagerContainer.removeEventListener(
      'mouseout',
      this.handleMouseUp,
      false
    );
  }

  handleTouchStart(evt) {
    const [touch] = evt.touches;
    this._startGesture(touch.pageX, touch.pageY);
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.addEventListener(
      'touchmove',
      this.handleTouchMove,
      false
    );
    viewPagerContainer.addEventListener('touchend', this.handleTouchEnd, false);
  }

  handleTouchMove(evt) {
    const [touch] = evt.touches;
    this._moveGesture(evt, touch.pageX, touch.pageY);
  }

  handleTouchEnd(evt) {
    this._endGesture();
    const { viewPagerContainer } = this.refs;
    viewPagerContainer.removeEventListener(
      'touchmove',
      this.handleTouchMove,
      false
    );
    viewPagerContainer.removeEventListener(
      'touchend',
      this.handleTouchEnd,
      false
    );
  }

  handleWindowResize(evt) {
    this._initContainer();
  }

  _initContainer() {
    const { viewPagerContainer, viewPagerWrapper } = this.refs;
    const containerWidth = (this._containerWidth =
      viewPagerContainer.getBoundingClientRect().width ||
      viewPagerContainer.offsetWidth);
    viewPagerWrapper.style.width = `${containerWidth * 3}px`;
    Array.from(viewPagerWrapper.children).forEach((pageView) => {
      pageView.style.width = `${containerWidth}px`;
    });

    if (this._transformer) {
      this._transformer.destroy();
    }
    this._transformer = new Transform(
      viewPagerWrapper,
      -containerWidth,
      0,
      -2 * containerWidth
    );
    this._currentPosition = this._transformer.reset();
  }

  _createPageView(index) {
    const { children, data } = this.props;
    if (isUndefined(data)) {
      return null;
    }
    const pageData = data[index];
    if (!isUndefined(pageData)) {
      const child = Children.only(children);
      return React.cloneElement(child, {
        index,
        data: pageData,
      });
    }
    return null;
  }

  _startGesture(x, y) {
    const { data } = this.props;
    const { index } = this.state;
    const enableBack = index - 1 >= 0;
    const enableNext = !isUndefined(data[index + 1]);
    this._gesture = new PagingGesture(x, y, enableNext, enableBack);
  }

  _moveGesture(evt, x, y) {
    const deltaX = this._gesture.move(x, y);
    if (this._gesture.isValid()) {
      evt.preventDefault();
      this._currentPosition = this._transformer.translate(
        deltaX + this._currentPosition,
        0
      );
    }
  }

  _endGesture() {
    if (!this._gesture.isValid()) return;
    const { duration, minDelta } = this.props;
    const vector = this._gesture.calculateVector(duration, minDelta);
    if (vector === 0) {
      this._transformer.transformedCallback = null;
      this._currentPosition = this._transformer.reset();
      return;
    }

    const { index } = this.state;
    const nextIndex = index + vector;
    this._transformer.transformedCallback = () => {
      this.setNextIndex(nextIndex);
    };
    if (vector > 0) {
      this._currentPosition = this._transformer.forward();
    } else {
      this._currentPosition = this._transformer.back();
    }
  }
}
