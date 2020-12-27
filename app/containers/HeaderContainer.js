// @flow
import * as React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import * as optionDialogActions from '../modules/options';
import * as hlsPlayersActions from '../modules/hlsPlayers';
import * as hlsRecorderActions from '../modules/hlsRecorders';

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state) 
  const {config, optionsDialogOpen} = state.options;
  const {recorders} = state.hlsRecorders;
  const scheduleStatusAllStop = [...recorders.values()].every(recorder => recorder.scheduleStatus==="stopped");
  const recorderStatusAllStop = [...recorders.values()].every(recorder => recorder.recorderStatus==="stopped");
  const scheduleStatusAllSame = [...recorders.values()].every((recorder,i,values) => recorder.scheduleStatus===values[0].scheduleStatus);
  const recorderStatusAllSame = [...recorders.values()].every((recorder,i,values) => recorder.recorderStatus===values[0].recorderStatus);
  const recorderStatusAnyInTransition = [...recorders.values()].some(recorder => recorder.inTransition===true);
  const {config:configHLSRecorders} = state.hlsRecorders;

  return {
    ...ownProps,
    config,
    dialogOpen:optionsDialogOpen,
    scheduleStatusAllStop,
    recorderStatusAllStop,
    scheduleStatusAllSame,
    recorderStatusAllSame,
    recorderStatusAnyInTransition,
    intervalsForSelection: configHLSRecorders.intervalsForSelection
  }
}

function mapDispatchToProps(dispatch) {
  return {
    OptionDialogActions: bindActionCreators(optionDialogActions, dispatch),
    HLSPlayerActions: bindActionCreators(hlsPlayersActions, dispatch),
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);