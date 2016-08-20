const assert = require('assert');
import { spy } from 'sinon';
import React from 'react';
import { shallow, mount } from 'enzyme';
import ViewPager from '../src/ViewPager';

describe('ViewPager', () => {

  it('should render viewpager structure elements', () => {
    const wrapper = shallow(<ViewPager />);
    const viewpagerContainer = wrapper.find('.viewpager-container');
    assert(viewpagerContainer.length === 1);

    const viewpagerWrapper =  viewpagerContainer.find('.viewpager-wrapper');
    assert(viewpagerWrapper.length === 1);

    assert(viewpagerWrapper.find('.viewpager-page').length === 3);
  });

});
