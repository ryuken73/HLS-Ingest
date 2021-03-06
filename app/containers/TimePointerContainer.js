import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TimePointer from '../components/HLSIngester/TimePointer';
import * as hlsRecorderActions from '../modules/hlsRecorders';

const secondsToTime = seconds => {
  if(typeof(seconds) !== 'number' || seconds === Infinity){
    // console.error('^^^type of seconds is not number:', seconds, typeof(seconds));
    return '00:00:00.00'
  }
  // console.log('^^^type of seconds is number..but:', seconds, typeof(seconds));
  return `${new Date(seconds*1000).toISOString().substr(11,8)}.00`
}

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  const {startTimeSeconds, stopTimeSeconds, inTransition, recorderStatus} = hlsRecorder;
  const durationTimeSeconds = stopTimeSeconds - startTimeSeconds;
  const {seeked} = hlsPlayer;

  const {channelActiveSource} = state.activeSources; 
  const activeSource = channelActiveSource.get(channelNumber);
  const timeInputDisabled = inTransition || recorderStatus === 'started' || activeSource === 'live';

  return {
    ...ownProps,
    recorderStatus,
    startTime: secondsToTime(startTimeSeconds),
    stopTime: secondsToTime(stopTimeSeconds),
    durationTime: secondsToTime(durationTimeSeconds),
    timeInputDisabled
  }
}

function mapDispatchToProps(dispatch) {
  return {HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(TimePointer);