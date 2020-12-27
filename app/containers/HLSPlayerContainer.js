import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import HLSPlayer from '../components/HLSRecorder/HLSPlayer';
import * as hlsPlayersActions from '../modules/hlsPlayers';


function mapStateToProps(state, ownProps) {
  // console.log('mapStateToProps:',state)
  const {channelNumber} = ownProps;
  const {config} = state.hlsPlayers;
  const hlsPlayer = state.hlsPlayers.players.get(channelNumber);
  // console.log('####', hlsPlayer)

  return {
    player: hlsPlayer.player,
    source: hlsPlayer.source,
    type: hlsPlayer.type,
    channelName: hlsPlayer.channelName,
    preservePlaybackRate: hlsPlayer.preservePlaybackRate,
    width: hlsPlayer.width,
    height: hlsPlayer.height,
    controls: hlsPlayer.controls,
    autoplay: hlsPlayer.autoplay,
    bigPlayButton: hlsPlayer.bigPlayButton,
    bigPlayButtonCentered: hlsPlayer.bigPlayButtonCentered,
    enableOverlay: hlsPlayer.enableOverlay,
    overlayContent: hlsPlayer.overlayContent,
    enableAutoRefresh: hlsPlayer.enableAutoRefresh,
    LONG_BUFFERING_MS_SECONDS: config.LONG_BUFFERING_MS_SECONDS
  }
}

function mapDispatchToProps(dispatch) {
  return {
    HLSPlayersActions: bindActionCreators(hlsPlayersActions, dispatch)  
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HLSPlayer);