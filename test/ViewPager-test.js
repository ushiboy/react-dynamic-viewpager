const assert = require('assert');
import React from 'react';
import { shallow, mount } from 'enzyme';
import ViewPager from '../src/ViewPager';

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

});
