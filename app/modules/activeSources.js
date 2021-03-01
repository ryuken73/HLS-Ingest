import {createAction, handleActions} from 'redux-actions';
import {setRecorderStartTimeSeconds, setRecorderStopTimeSeconds} from './hlsRecorders';
 
const {getDefaultConfig} = require('../lib/getConfig');
const config = getDefaultConfig();

const {
    NUMBER_OF_CHANNELS,
    DEFAULT_SOURCE
} = config;

const channelActiveSource = new Map();
for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
    channelActiveSource.set(channelNumber, DEFAULT_SOURCE);
}

const getChanneler = (state, channelNumber) => {
    const {recorders} = state.hlsRecorders;
    const hlsRecorder = recorders.get(channelNumber);
    const {channelName} = hlsRecorder;
    const channelLog = createLogger(hlsRecorder.channelName)
    return [hlsRecorder, channelLog]
}

// action types
const SET_CHANNEL_ACTIVE_SOURCE = 'activeSources/SET_CHANNEL_ACTIVE_SOURCE';

// action creator
const actionSetChannelActiveSource = createAction(SET_CHANNEL_ACTIVE_SOURCE);
export const setChannelActiveSource = ({channelNumber, sourceFrom}) => (dispatch, getState) => {
    if(sourceFrom === 'live'){
        dispatch(setRecorderStartTimeSeconds({channelNumber, startTimeSeconds:null}))
        dispatch(setRecorderStopTimeSeconds({channelNumber, stopTimeSeconds:null}))
    }
    dispatch(actionSetChannelActiveSource({channelNumber, sourceFrom}))
}

const initialState = {
    channelActiveSource
}

// reducer
export default handleActions({
    [SET_CHANNEL_ACTIVE_SOURCE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, sourceFrom} = action.payload;
        const {channelActiveSource} = state;
        channelActiveSource.set(channelNumber, sourceFrom);
        const newActiveSource = new Map(channelActiveSource);
        return {
            ...state,
            channelActiveSource: newActiveSource
        }
    }
}, initialState);