import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TimePointer from '../components/HLSIngester/TimePointer';
import * as hlsRecorderActions from '../modules/hlsRecorders';

const secondsToTime = seconds => {
  if(seconds === null){
    return '00:00:00'
  }
  return new Date(seconds*1000).toISOString().substr(11,8)
}

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const {startTimeSeconds, stopTimeSeconds, inTransition, recorderStatus} = hlsRecorder;

  const {channelActiveSource} = state.activeSources;
  const activeSource = channelActiveSource.get(channelNumber);

  const timeInputDisabled = inTransition || recorderStatus === 'started' || activeSource === 'live';

  return {
    ...ownProps,
    recorderStatus,
    startTime: secondsToTime(startTimeSeconds),
    stopTime: secondsToTime(stopTimeSeconds),
    timeInputDisabled
  }
}

function mapDispatchToProps(dispatch) {
  return {HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(TimePointer);