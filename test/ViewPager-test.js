const assert = require('assert');
import React from 'react';
import { spy } from 'sinon';
import { shallow, mount } from 'enzyme';
import ViewPager, { PagingGesture } from '../src/ViewPager';

function Page(props) {
  const { index, data } = props;
  return (
    <div>
      <div className='page-index'>{index}</div>
      <div className='page-data'>{data}</div>
    </div>
  );
}

describe('ViewPager', () => {

  it('should render viewpager structure elements', () => {
    const wrapper = shallow(<ViewPager />);
    const viewpagerContainer = wrapper.find('.viewpager-container');
    assert(viewpagerContainer.length === 1);

    const viewpagerWrapper =  viewpagerContainer.find('.viewpager-wrapper');
    assert(viewpagerWrapper.length === 1);

    assert(viewpagerWrapper.find('.viewpager-page').length === 3);
  });

  it('should render some page', () => {
    const wrapper = shallow(
      <ViewPager data={['page1', 'page2', 'page3']}>
        <Page />
      </ViewPager>
    );
    const pages = wrapper.find(Page);
    assert(pages.length === 2);

    const page1 = pages.at(0);
    assert(page1.prop('index') === 0);
    assert(page1.prop('data') === 'page1');

    const page2 = pages.at(1);
    assert(page2.prop('index') === 1);
    assert(page2.prop('data') === 'page2');
  });

  it('should call onChange when set next index', () => {
    const changeSpy = spy();
    const wrapper = mount(
      <ViewPager data={['page1', 'page2', 'page3']} onChange={changeSpy}>
        <Page />
      </ViewPager>
    );
    wrapper.instance().setNextIndex(1);
    assert.ok(changeSpy.calledOnce);
    assert.ok(changeSpy.calledWith(1, 0));
  });
});

describe('PagingGesture', () => {

  it('should move back', () => {
    const gesture = new PagingGesture(10, 10, true, true);
    assert(gesture.move(20, 10) === 10);
    assert(gesture.calculateVector(250, 5) === -1);
    assert.ok(gesture.isValid());
  });

  it('should move next', () => {
    const gesture = new PagingGesture(10, 10, true, true);
    assert(gesture.move(0, 10) === -10);
    assert(gesture.calculateVector(250, 5) === 1);
    assert.ok(gesture.isValid());
  });

  it('should not move when there is no next', () => {
    const gesture = new PagingGesture(10, 10, false, true);
    assert(gesture.move(0, 10) === 0);
    assert(gesture.calculateVector(250, 5) === 0);
    assert.ok(gesture.isValid());
  });

  it('should not move when there is no back', () => {
    const gesture = new PagingGesture(10, 10, true, false);
    assert(gesture.move(20, 10) === 0);
    assert(gesture.calculateVector(250, 5) === 0);
    assert.ok(gesture.isValid());
  });

  it('should not move when vertical scrolling', () => {
    const gesture = new PagingGesture(10, 10, true, true);
    assert(gesture.move(20, 50) === 10);
    assert(gesture.calculateVector(250, 5) === 0);
    assert(gesture.isValid() === false);
  });

});
