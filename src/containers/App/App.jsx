import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Header } from '../../components';
import {
  launchDevTools,
} from '../../actions/setting';
import './App.scss';
// import { autobind } from 'core-decorators';

@connect(
  state => ({
    list: state.repository.homeRepository,
    searchValue: state.search.value,
  }),
  {
    launchDevTools,
  }
)
class App extends Component {
  componentDidMount() {
    if (__DEVTOOLS__ && !window.devToolsExtension) {
      this.props.launchDevTools();
    }
  }

  render() {
    const { list, searchValue } = this.props;
    return (
      <div className="app-container">
        <Header
          list={list}
          extraClass="main"
          login
          name={"李欣悦"}
          searchValue={searchValue}
        />
        <section>
          {this.props.children}
        </section>
      </div>
    );
  }
}

App.propTypes = {
  list: PropTypes.array,
  children: PropTypes.element,
  dispatch: PropTypes.func,
  searchValue: PropTypes.string,
  launchDevTools: PropTypes.func,
};

export default App;
