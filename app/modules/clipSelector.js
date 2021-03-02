import { SelectAll } from '@material-ui/icons';
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

const makeWithinHours = () => {
    const withinHours = new Map();
    for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
        withinHours.set(channelNumber, DEFAULT_HOURS)
    }
    return withinHours;
}

const withinHours = makeWithinHours();

///

// get cctv list
const cctvFromConfig = require('../lib/getCCTVList');
const sourcesFromConfig = cctvFromConfig();
const sources = sourcesFromConfig.map(source => {
    return {
        area: source.title.split(' ')[0],
        ...source
    }
})

// get uniq area from sources
const areasOnly = sources.map(source => {
    return {title: source.area}
})
const uniqAreas = [...new Set(areasOnly.map(area => JSON.stringify(area)))]
                  .map(uniqArea => JSON.parse(uniqArea))

// get saved clip list
const Store = require('electron-store');
const {remote} = require('electron');
const clipStore = new Store({
    name:'clipStore',
    cwd:remote.app.getPath('home')
});

// initialize channel's sources
const {createClipData} = require('../lib/clipInfo');
const getClipData = (clipStore) => {
    const savedClipsObj = clipStore.store;
    const savedClipsArray = Object.values(savedClipsObj)
    return savedClipsArray.map(clip => createClipData(clip))
}

const baseClips = getClipData(clipStore);
const currentClips = new Map();
for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
    currentClips.set(channelNumber, baseClips)
}
const currentClip = new Map();
console.log(baseClips)

// action types
const SET_AREA = 'clipSelector/SET_AREA';
const SET_CURRENT_CLIP = 'clipSelector/SET_CURRENT_CLIP';
const SET_CURRENT_CLIPS = 'clipSelector/SET_CURRENT_CLIPS';
const SET_WITHIN_HOURS = 'clipSelector/SET_WITHIN_HOURS';

// action creator
export const setArea = createAction(SET_AREA);
export const setCurrentClip = createAction(SET_CURRENT_CLIP);
export const setCurrentClips = createAction(SET_CURRENT_CLIPS);
export const setWithinHours = createAction(SET_WITHIN_HOURS);

// thunk
export const limitSources = (channelNumber, selectedArea) => (dispatch, getState) => {
    console.log('###limitSources', channelNumber, selectedArea)
    const state = getState();
    const {baseClips} = state.clipSelector;
    if(selectedArea === null || selectedArea === '전체'){
        dispatch(setCurrentClips({channelNumber, channelClips:[...baseClips]}));
        return
    }
    const limitedSources = baseClips.filter(clip => clip.title.includes(`_${selectedArea.title}`));
    console.log(limitedSources, baseClips[0].title)
    dispatch(setCurrentClips({channelNumber, channelClips: limitedSources}))
}

const initialState = {
    areas: [{title: '전체'}, ...uniqAreas],
    baseClips,
    currentClip,
    currentClips,
    hours,
    withinHours
}

// reducer
export default handleActions({
    [SET_AREA]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {areas} = action.payload;
        return {
            ...state,
            areas
        }
    },
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
        const {channelNumber, channelClips} = action.payload;    
        const {currentClips} = state;
        currentClips.set(channelNumber, channelClips);
        const newCurrentClips = new Map(currentClips)
        return {
            ...state,
            currentClips: newCurrentClips
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
    }
}, initialState);