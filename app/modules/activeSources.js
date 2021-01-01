import {createAction, handleActions} from 'redux-actions';
 
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

// action types
const SET_CHANNEL_ACTIVE_SOURCE = 'activeSources/SET_CHANNEL_ACTIVE_SOURCE';

// action creator
export const setChannelActiveSource = createAction(SET_CHANNEL_ACTIVE_SOURCE);

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