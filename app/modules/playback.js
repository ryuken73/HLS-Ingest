import {createAction, handleActions} from 'redux-actions';
 
const {getDefaultConfig} = require('../lib/getConfig');
const config = getDefaultConfig();

const {
    NUMBER_OF_CHANNELS,
    FFMPEG_OUTPUTS
} = config;

// action types
const SET_CHANNEL_PLAYBACK_PROCESS = 'playback/SET_CHANNEL_PLAYBACK_PROCESS';

// action creator
export const setChannelPlaybackProcess = createAction(SET_CHANNEL_PLAYBACK_PROCESS);

// redux thunk
const {newChild} = require('../lib/cpManager');
import {getAbsolutePath} from '../lib/electronUtil';
const ffplayBinary = getAbsolutePath('bin/ffplay.exe', true);

export const forkPlaybackProcess = props => (dispatch, getState) => {
    const {
        channelNumber, 
        binary = ffplayBinary,
        forkArgs = ['-left', 10, '-top', 10, '-alwaysontop', '-sn']
    } = props;
    // const channelTarget = LOCAL_PLAYBACK_TARGETS[channelNumber.toString()];    
    const ffmpegOutputs = FFMPEG_OUTPUTS.find(output => {
        return parseInt(output.channelNumber) === channelNumber;
    })
    const targetForPlayback = ffmpegOutputs.outputs.find(target => target.playback === true);
    const playbackAddress = targetForPlayback.target; 
    const args = [...forkArgs, '-i', playbackAddress];
    console.log('$$$$ forkplayback process', args)
    const ffplay = newChild({
        binary,
        args,
        options: {}
    }) 
    // spawn event only works from node v15.1.0
    dispatch(setChannelPlaybackProcess({channelNumber, process:ffplay}));
    ffplay.exitHandler = code => {
        console.log(`$$$$ channel${channelNumber} playback process exit!`);
        dispatch(setChannelPlaybackProcess({channelNumber, process:null}));
    }
    ffplay.stdoutHandler = data => {};
    ffplay.stderrHandler = data => {};
    ffplay.start();
}

export const destroyPlaybackProcess = props => (disptach, getState) => {
    const {channelNumber} = props;
    const state = getState();
    const ffplay = state.playback.playbackProcesses.get(channelNumber);
    console.log('$$$ destroy ffplay:', ffplay)
    if(ffplay){
        ffplay.stop();
    }
}

// initial state
const playbackProcesses = new Map();
const initialState = {
    playbackProcesses
}

// reducer
export default handleActions({
    [SET_CHANNEL_PLAYBACK_PROCESS]: (state, action) => {
        console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, process} = action.payload;
        const playbackProcesses = new Map(state.playbackProcesses);
        playbackProcesses.set(channelNumber, process);
        return {
            playbackProcesses
        }
    },
}, initialState);