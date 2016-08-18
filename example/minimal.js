import React from 'react';
import { render } from 'react-dom';
import ViewPager from '../src/ViewPager';

function Page(props) {
  const { index, data } = props;
  return (
    <div>
      <p>Page {index+1}</p>
      <p>{data}</p>
    </div>
  );
}

const data = [
  'test 1',
  'test 2',
  'test 3',
  'test 4',
  'test 5'
];

render(
  <ViewPager data={data}>
    <Page />
  </ViewPager>,
  document.getElementById('app')
);
