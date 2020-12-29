// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ClipSelector from '../components/HLSIngester/ClipSelector';
import * as clipSelectorActions from '../modules/clipSelector';
import * as activeSourcesActions from '../modules/activeSources';
import * as hlsPlayersActions from '../modules/hlsPlayers';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {channelNumber} = ownProps;
  const {hours, currentClips, selectedHour} = state.clipSelector;
  const {channelActiveSource} = state.activeSources;
  const active = channelActiveSource.get(channelNumber) === 'clip';
  const disabled = !active;

  return {
    ...ownProps,
    hours,
    savedClips: currentClips.get(channelNumber),
    active,
    disabled,
    selectedHour
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ClipSelectorActions: bindActionCreators(clipSelectorActions, dispatch),
    ActiveSourcesActions: bindActionCreators(activeSourcesActions, dispatch),
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClipSelector);
