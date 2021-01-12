import React from 'react';
import ReactDOM from 'react-dom';
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

ReactDOM.render(
  <ViewPager index={0} duration={250} minDelta={20} data={data}>
    <Page />
  </ViewPager>,
  document.getElementById('app')
);
