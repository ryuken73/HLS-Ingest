// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import App from '../components/App';
import * as appActions from '../modules/app';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {channels} = state.app;
  return {
    ...ownProps,
    channels
  }
}

function mapDispatchToProps(dispatch) {
  return {AppActions: bindActionCreators(appActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
