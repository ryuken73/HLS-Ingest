// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LiveSelector from '../components/HLSIngester/LiveSelector';
import * as liveSelectorActions from '../modules/liveSelector';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {sources, areas} = state.liveSelector;
  return {
    ...ownProps,
    sources,
    areas
  }
}

function mapDispatchToProps(dispatch) {
  return {LiveSelectorActions: bindActionCreators(liveSelectorActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveSelector);
