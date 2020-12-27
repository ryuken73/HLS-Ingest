import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Controls from '../components/HLSRecorder/Controls';
import * as hlsPlayersActions from '../modules/hlsPlayers';
import * as hlsRecorderActions from '../modules/hlsRecorders';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state, ownProps) 
  const {channelNumber} = ownProps;
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);

  return {
    ...ownProps,
    source: hlsPlayer.source,
    channelName: hlsRecorder.channelName,
    duration: hlsRecorder.duration,
    channelDirectory: hlsRecorder.channelDirectory,
    url: hlsRecorder.url,
    recorder: hlsRecorder.recorder,
    recorderStatus: hlsRecorder.recorderStatus,
    inTransition: hlsRecorder.inTransition,
    scheduleFunction: hlsRecorder.scheduleFunction,
    scheduleStatus: hlsRecorder.scheduleStatus,
    autoStartSchedule: hlsRecorder.autoStartSchedule,
    localm3u8: hlsRecorder.localm3u8,
    source: hlsPlayer.source
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayerActions: bindActionCreators(hlsPlayersActions, dispatch),
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);