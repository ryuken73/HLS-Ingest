import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Duration from '../components/HLSIngester/Duration';
import * as hlsRecorderActions from '../modules/hlsRecorders';

const timeToSeconds = duration => {
  const [hours, minutes, secondNFrame] = duration.split(':');
  const [seconds, frames] = secondNFrame.split('.');
  const totalSeconds = parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds);
  // console.log('&&&&', hours, minutes, seconds, totalSeconds, frames)
  return [totalSeconds, frames];
}

const secondsToTime = seconds => {
  if(typeof(seconds) !== 'number' || seconds === Infinity){
    // console.error('^^^type of seconds is not number:', seconds, typeof(seconds));
    return '00:00:00'
  }
  // console.log('^^^type of seconds is number..but:', seconds, typeof(seconds));
  return new Date(seconds*1000).toISOString().substr(11,8)
}

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const {startTimeSeconds=0, stopTimeSeconds=0} = hlsRecorder;
  // console.log('&&& startTimeSecond: ', startTimeSeconds)
  const {duration} = hlsRecorder;
  const [totalSeconds, frames] = timeToSeconds(duration);
  const durationPlusStartTime = `${secondsToTime(totalSeconds + parseInt(startTimeSeconds))}.${frames}`
  // console.log('&&&& duration: ', channelNumber, duration, durationPlusStartTime)

  return {
    ...ownProps,
    channelName: hlsRecorder.channelName,
    duration: durationPlusStartTime,
    inTransition: hlsRecorder.inTransition,
    recorderStatus: hlsRecorder.recorderStatus,
  }
}

function mapDispatchToProps(dispatch) {
  return {HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Duration);