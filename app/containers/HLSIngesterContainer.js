import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import HLSIngester from '../components/HLSIngester';
import * as hlsRecorderActions from '../modules/hlsRecorders';
import * as playbackActions from '../modules/playback';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);
  const sourceFrom = state.activeSources.channelActiveSource.get(channelNumber);
  const liveSource = state.liveSelector.currentSource.get(channelNumber)
  const clipSource = state.clipSelector.currentClip.get(channelNumber)
  const ffplayProcess = state.playback.playbackProcesses.get(channelNumber);
  const isPlaybackAlive = ffplayProcess === null ? false : true;

  return {
    ...ownProps,
    inTransition: hlsRecorder.inTransition,
    recorderStatus: hlsRecorder.recorderStatus,
    sourceFrom,
    liveSource,
    clipSource,
    isPlaybackAlive
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch),
    PlaybackActions: bindActionCreators(playbackActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HLSIngester);