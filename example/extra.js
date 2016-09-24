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

const index = 0;

class App extends React.Component {

  constructor(props) {
    super(props);
    const { index } = props;
    this.state = {
      index
    };
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
  }

  render() {
    const { index } = this.state;
    const { data } = this.props;
    return (
      <ViewPager ref="nyan" index={index} data={data} onChange={this.handleChangeIndex}>
        <Page />
      </ViewPager>
    );
  }

  componentDidMount() {
    const { nyan } = this.refs;
    window.addEventListener('keydown', evt => {
      const { keyCode } = evt;
      if (keyCode === 37) {
        nyan.back();
      } else if (keyCode === 39) {
        nyan.forward();
      }
    }, false);
  }

  handleChangeIndex(index) {
    this.setState({
      index
    });
  }
}

render(
  <App index={index} data={data} />,
  document.getElementById('app')
);
