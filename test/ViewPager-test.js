const assert = require('assert');
import { spy } from 'sinon';
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
    assert(wrapper.find(Page).length === 2);
  });
});
