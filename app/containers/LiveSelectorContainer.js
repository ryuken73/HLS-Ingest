// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LiveSelector from '../components/HLSIngester/LiveSelector';
import * as liveSelectorActions from '../modules/liveSelector';
import * as activeSourcesActions from '../modules/activeSources';
import * as hlsPlayersActions from '../modules/hlsPlayers';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {channelNumber} = ownProps;
  const {currentSources, areas} = state.liveSelector;
  const {channelActiveSource} = state.activeSources;
  const active = channelActiveSource.get(channelNumber) === 'live';
  const disabled = !active;
  return {
    ...ownProps,
    sources: currentSources.get(channelNumber),
    active,
    disabled, 
    areas
  }
}

function mapDispatchToProps(dispatch) {
  return {
    LiveSelectorActions: bindActionCreators(liveSelectorActions, dispatch),
    ActiveSourcesActions: bindActionCreators(activeSourcesActions, dispatch),
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveSelector);
