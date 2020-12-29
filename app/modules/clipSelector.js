import {createAction, handleActions} from 'redux-actions';

// initialize hours from config
const {getDefaultConfig} = require('../lib/getConfig');
const config = getDefaultConfig();

const {
    NUMBER_OF_CHANNELS,
    DISPLAY_HOURS=[1,3,6,10,15,24],
    DEFAULT_HOURS=3,
    // AUTO_UPDATE_CLIP=true
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

const {createClipData} = require('../lib/clipInfo');
const getClipData = (clipStore) => {
    const savedClipsObj = clipStore.store;
    const savedClipsArray = Object.values(savedClipsObj)
    return savedClipsArray.map(clip => createClipData(clip))
}
const makeBaseClips = savedClips => {
    const baseClips = new Map();
    for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
        baseClips.set(channelNumber, savedClips)
    }
    return baseClips;
}
const makeWithinHours = () => {
    const withinHours = new Map();
    for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
        withinHours.set(channelNumber, DEFAULT_HOURS)
    }
    return withinHours;
}

const savedClips = getClipData(clipStore);
const baseClips = makeBaseClips(savedClips);
const withinHours = makeWithinHours();

// initialize channel's saved clip
const currentClip = new Map();

// action types
const SET_WITHIN_HOURS = 'clipSelector/SET_WITHIN_HOURS';
const SET_CURRENT_CLIP = 'clipSelector/SET_CURRENT_CLIP';
const SET_BASE_CLIPS = 'clipSelector/SET_BASE_CLIPS';


// action creator
export const setWithinHours = createAction(SET_WITHIN_HOURS);
export const setCurrentClip = createAction(SET_CURRENT_CLIP);
export const setBaseClips = createAction(SET_BASE_CLIPS);

// thunk

const initialState = {
    hours,
    withinHours,
    baseClips,
    currentClip,
    // currentClips
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
    [SET_WITHIN_HOURS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, hours} = action.payload;
        const {withinHours} = state;
        withinHours.set(channelNumber, hours);
        const newWithinHours = new Map(withinHours);
        
        return {
            ...state,
            withinHours: newWithinHours
        }
    },
    [SET_BASE_CLIPS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {baseClips} = action.payload;      
        return {
            ...state,
            baseClips
        }
    }
}, initialState);