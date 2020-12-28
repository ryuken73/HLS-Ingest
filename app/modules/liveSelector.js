import {createAction, handleActions} from 'redux-actions';
 
const cctvFromConfig = require('../lib/getCCTVList');
const sources = cctvFromConfig();
const areasOnly = sources.map(source => {
    return {title: source.area}
})
const uniqAreas = [...new Set(areasOnly.map(area => JSON.stringify(area)))]
                  .map(uniqArea => JSON.parse(uniqArea))

// action types
const SET_AREA = 'liveSelector/SET_AREA';
const SET_SOURCE = 'liveSelector/SET_SOURCE';

// action creator
export const setArea = createAction(SET_AREA);
export const setSource = createAction(SET_SOURCE);

// thunk
export const limitSources = selectedArea => (dispatch, getState) => {
    const state = getState();
    const {baseSources} = state.liveSelector;
    if(selectedArea === null){
        dispatch(setSource({sources:[...baseSources]}));
        return
    }
    const limitedSources = baseSources.filter(source => source.area === selectedArea.title);
    dispatch(setSource({sources: limitedSources}))
}

const initialState = {
    areas: uniqAreas,
    baseSources: sources,
    sources
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
    [SET_SOURCE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {sources} = action.payload;
        return {
            ...state,
            sources
        }
    },
}, initialState);