import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import HLSIngester from '../components/HLSIngester';
import * as hlsRecorderActions from '../modules/hlsRecorders';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const hlsRecorder = state.hlsRecorders.recorders.get(channelNumber);

  return {
    ...ownProps,
    inTransition: hlsRecorder.inTransition,
    recorderStatus: hlsRecorder.recorderStatus
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSRecorderActions: bindActionCreators(hlsRecorderActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HLSIngester);