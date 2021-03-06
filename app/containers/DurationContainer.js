import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Duration from '../components/HLSIngester/Duration';
import * as hlsRecorderActions from '../modules/hlsRecorders';

const timeToSeconds = duration => {
  const [hours, minutes, secondNFrame] = duration.split(':');
  const [seconds, frames] = secondNFrame.split('.');
  const durationSeconds = parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds);
  // console.log('&&&&', hours, minutes, seconds, durationSeconds, frames)
  return [durationSeconds, frames];
}

const secondsToTime = seconds => {
  if(typeof(seconds) !== 'number' || seconds === Infinity){
    // console.error('^^^type of seconds is not number:', seconds, typeof(seconds));
    return '00:00:00'
  }
  // console.log('^^^type of seconds is number..but:', seconds, typeof(seconds));
  return new Date(seconds*1000).toISOString().substr(11,8)
}

const padZero = (src, size, padChar='0') => {
  const srcSize = src.toString().length;
  const paddCount = parseInt(size) - srcSize;
  if(paddCount > 0){
    for(let i=paddCount; i>0; i--){
      src = padChar + src.toString();
    }
  }
  return src
}

function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const {startTimeSeconds=0, stopTimeSeconds=0} = hlsRecorder;
  // console.log('&&& startTimeSecond: ', startTimeSeconds)
  const {duration} = hlsRecorder;
  const [durationSeconds, frames] = timeToSeconds(duration);
  const durationPlusStartTime = `${secondsToTime(durationSeconds + parseInt(startTimeSeconds))}.${frames}`;

  // get reamining time
  const remainFrames = frames === '00' ? parseInt(frames) : 100 - parseInt(frames);
  const remainFramesPadded = padZero(remainFrames, 2);
  const selectedSeconds = stopTimeSeconds - startTimeSeconds;
  const reaminSeconds = selectedSeconds - durationSeconds - Math.ceil(remainFrames/100);
  const remainTime = `${secondsToTime(reaminSeconds)}.${remainFramesPadded}`;

  // console.log('&&&& duration: ', channelNumber, duration, durationPlusStartTime)

  return {
    ...ownProps,
    channelName: hlsRecorder.channelName,
    // duration: durationPlusStartTime,
    duration,
    remains: remainTime,
    inTransition: hlsRecorder.inTransition,
    recorderStatus: hlsRecorder.recorderStatus,
  }
}

function mapDispatchToProps(dispatch) {
  return {HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Duration);