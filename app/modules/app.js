import {createAction, handleActions} from 'redux-actions';

const electronUtil = require('../lib/electronUtil');
electronUtil.initElectronLog({});

const {remote} = require('electron');
const clipStore = electronUtil.createElectronStore({
    name:'clipStore',
    cwd:remote.app.getPath('home')
});
const sourceStore = electronUtil.createElectronStore({
    name:'sourceStore',
    cwd:remote.app.getPath('home')
});
const intervalStore = electronUtil.createElectronStore({
    name:'intervalStore',
    cwd:remote.app.getPath('home')
});

const cctvFromConfig = require('../lib/getCCTVList');
const sources = cctvFromConfig();

// action types
const SET_SOURCES = 'app/SET_SOURCES';

// action creator
export const setSources = createAction(SET_SOURCES);

const initialState = {
    sources,
    clipStore,
    sourceStore,
    intervalStore
}

// reducer
export default handleActions({
    [SET_SOURCES]: (state, action) => {
        const {sources} = action.payload;
        return {
            ...state,
            sources
        }
    },
}, initialState);