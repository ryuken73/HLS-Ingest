import {createAction, handleActions} from 'redux-actions';
 

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

// initialize channel's sources
const {getDefaultConfig} = require('../lib/getConfig');
const config = getDefaultConfig();

const {
    NUMBER_OF_CHANNELS
} = config;

const baseSources = sources;
const currentSources = new Map();
for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
    currentSources.set(channelNumber, sources)
}
const currentSource = new Map();

// action types
const SET_AREA = 'liveSelector/SET_AREA';
const SET_CURRENT_SOURCE = 'liveSelector/SET_CURRENT_SOURCE';
const SET_CURRENT_SOURCES = 'liveSelector/SET_CURRENT_SOURCES';

// action creator
export const setArea = createAction(SET_AREA);
export const setCurrentSource = createAction(SET_CURRENT_SOURCE);
export const setCurrentSources = createAction(SET_CURRENT_SOURCES);

// thunk
export const limitSources = (channelNumber, selectedArea) => (dispatch, getState) => {
    const state = getState();
    const {baseSources} = state.liveSelector;
    if(selectedArea === null){
        dispatch(setCurrentSources({channelNumber, channelSources:[...baseSources]}));
        return
    }
    const limitedSources = baseSources.filter(source => source.area === selectedArea.title);
    dispatch(setCurrentSources({channelNumber, channelSources: limitedSources}))
}

const initialState = {
    areas: uniqAreas,
    baseSources,
    currentSource,
    currentSources
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
    [SET_CURRENT_SOURCE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, channelSource} = action.payload;
        const {currentSource} = state;
        currentSource.set(channelNumber, channelSource);
        const newCurrentSource = new Map(currentSource);
        
        return {
            ...state,
            currentSource: newCurrentSource
        }
    },
    [SET_CURRENT_SOURCES]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, channelSources} = action.payload;
        const {currentSources} = state;
        currentSources.set(channelNumber, channelSources);
        const newCurrentSources = new Map(currentSources);
        
        return {
            ...state,
            currentSources: newCurrentSources
        }
    },
}, initialState);