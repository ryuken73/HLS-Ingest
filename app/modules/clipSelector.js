import {createAction, handleActions} from 'redux-actions';

// initialize hours from config
const {getDefaultConfig} = require('../lib/getConfig');
const config = getDefaultConfig();

const {
    DISPLAY_HOURS=[1,3,6,10,15,24]
} = config;

const hours = DISPLAY_HOURS.map(hour => {
    return {title:hour.toString(), value:hour}
});

// get saved clip list
const Store = require('electron-store');
const {remote} = require('electron');
const clipStore = new Store({
    name:'clipStore',
    cwd:remote.app.getPath('home')
});

const savedClipsObj = clipStore.store;
const savedClipsArray = Object.values(savedClipsObj)
const {createClipData} = require('../lib/clipInfo');
const savedClips = savedClipsArray.map(clip => createClipData(clip))

// initialize channel's saved clip
const {
    NUMBER_OF_CHANNELS
} = config;

const baseClips = new Map();
for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
    baseClips.set(channelNumber, savedClips)
}
const currentClips = baseClips;
const currentClip = new Map();

// action types
const SET_WITHIN_HOURS = 'clipSelector/SET_WITHIN_HOURS';
const SET_CURRENT_CLIP = 'clipSelector/SET_CURRENT_CLIP';
const SET_CURRENT_CLIPS = 'clipSelector/SET_CURRENT_CLIPS';

// action creator
export const setWithinHours = createAction(SET_WITHIN_HOURS);
export const setCurrentClip = createAction(SET_CURRENT_CLIP);
export const setCurrentClips = createAction(SET_CURRENT_CLIPS);

// thunk
export const limitClips = (channelNumber, withinHours) => (dispatch, getState) => {
    const state = getState();
    const {baseClips} = state.clipSelector;
    console.log('$$$', channelNumber, withinHours, baseClips);
    // if(selectedArea === null){
    //     dispatch(setCurrentSources({channelNumber, channelSources:[...baseSources]}));
    //     return
    // }
    // const limitedSources = baseSources.filter(source => source.area === selectedArea.title);
    // dispatch(setCurrentSources({channelNumber, channelSources: limitedSources}))
}

const initialState = {
    hours,
    withinHours:3,
    baseClips,
    currentClip,
    currentClips
}

// reducer
export default handleActions({
    [SET_CURRENT_CLIP]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, clipInfo} = action.payload;
        const {currentClip} = state;
        currentClip.set(channelNumber, clipInfo);
        const newCurrentClip = new Map(currentClip);
        
        return {
            ...state,
            currentClip: newCurrentClip
        }
    },
    [SET_CURRENT_CLIPS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, limitedClips} = action.payload;
        const {currentClips} = state;
        currentClips.set(channelNumber, limitedClips);
        const newCurrentClips = new Map(currentClips);
        
        return {
            ...state,
            currentClips: newCurrentClips
        }
    }
}, initialState);