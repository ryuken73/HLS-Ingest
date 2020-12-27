import {createAction, handleActions} from 'redux-actions';
const Store = require('electron-store');

const {remote} = require('electron');
const optionStore = new Store({
    name:'optionStore',
    cwd:remote.app.getPath('home')
})

// action types
const SET_CONFIG = 'options/SET_CONFIG';
const SET_BASE_DIRECTORY = 'options/SET_BASE_DIRECTORY';
const SET_CHANNEL_PREFIX = 'options/SET_CHANNEL_PREFIX';
const LONG_BUFFERING_MS_SECONDS = 'options/LONG_BUFFERING_MS_SECONDS';
const SLEEP_MS_BETWEEN_ALL_START = 'options/SLEEP_MS_BETWEEN_ALL_START';
const SLEEP_MS_BETWEEN_ALL_STOP = 'options/SLEEP_MS_BETWEEN_ALL_STOP';
const NUMBER_OF_CHANNELS = 'options/NUMBER_OF_CHANNELS';
const KEEP_SAVED_CLIP_AFTER_HOURS = 'options/KEEP_SAVED_CLIP_AFTER_HOURS';
const WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE = 'options/WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE';
const SET_OPTIONS_DIALOG_OPEN = 'options/SET_OPTIONS_DIALOG_OPEN';
const SET_DELETE_SCHEDULE_CRON = 'options/SET_DELETE_SCHEDULE_CRON';

// action creator
export const setConfig = createAction(SET_CONFIG);
export const setBaseDirectory = createAction(SET_BASE_DIRECTORY);
export const setChannelPrefix = createAction(SET_CHANNEL_PREFIX);
export const setLongBufferSceonds = createAction(LONG_BUFFERING_MS_SECONDS);
export const setSleepBetweenStart = createAction(SLEEP_MS_BETWEEN_ALL_START);
export const setSleepBetweenStop = createAction(SLEEP_MS_BETWEEN_ALL_STOP);
export const setNumberOfChannels = createAction(NUMBER_OF_CHANNELS);
export const setKeepClipsAfterHours = createAction(KEEP_SAVED_CLIP_AFTER_HOURS);
export const setWaitSecondsBeforePlayback = createAction(WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE);
export const setDeleteScheduleCron = createAction(SET_DELETE_SCHEDULE_CRON);

export const setOptionsDialogOpen = createAction(SET_OPTIONS_DIALOG_OPEN);

// redux thunk
const {getCombinedConfig,getDefaultConfig} = require('../lib/getConfig');
export const openOptionsDialog = () => (dispatch, getState) => {
    const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});
    dispatch(setConfig({config}));
    dispatch(setOptionsDialogOpen({dialogOpen:true}))
}

export const setDefaultConfig = () => (dispatch, getState) => {
    const defaultConfig = getDefaultConfig();
    dispatch(setConfig({config:defaultConfig}));
}

export const saveConfig = ({config}) => (dispatch, getState) => {
    optionStore.store = config;
    // const mainWindow = remote.getCurrentWindow();
    // mainWindow.reload();
}

// const defaultConfig = require('../config/default/config.json');
const initialConfig = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const initialState = {
    config: initialConfig,
    optionsDialogOpen:false
}

// reducer
export default handleActions({
    [SET_CONFIG]: (state, action) => {
        const {config} = action.payload;
        return {
            ...state,
            config,
        }
    },
    [SET_BASE_DIRECTORY]: (state, action) => {
        const baseDirectory = action.payload;
        const config = {...state.config};
        config.BASE_DIRECTORY = baseDirectory;
        return {
            ...state,
            config,
        }
    },
    [SET_CHANNEL_PREFIX]: (state, action) => {
        const chennelPrefix = action.payload;
        const config = {...state.config};
        config.CHANNEL_PREFIX = chennelPrefix;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [LONG_BUFFERING_MS_SECONDS]: (state, action) => {
        const seconds = action.payload;
        const config = {...state.config};
        config.LONG_BUFFERING_MS_SECONDS = seconds;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [SLEEP_MS_BETWEEN_ALL_START]: (state, action) => {
        const seconds = action.payload;
        const config = {...state.config};
        config.SLEEP_MS_BETWEEN_ALL_START = seconds;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [SLEEP_MS_BETWEEN_ALL_STOP]: (state, action) => {
        const seconds = action.payload;
        const config = {...state.config};
        config.SLEEP_MS_BETWEEN_ALL_STOP = seconds;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [NUMBER_OF_CHANNELS]: (state, action) => {
        const numberOfChannels = action.payload;
        const config = {...state.config};
        config.NUMBER_OF_CHANNELS = numberOfChannels;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [KEEP_SAVED_CLIP_AFTER_HOURS]: (state, action) => {
        const hours = action.payload;
        const config = {...state.config};
        config.KEEP_SAVED_CLIP_AFTER_HOURS = hours;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE]: (state, action) => {
        const seconds = action.payload;
        const config = {...state.config};
        config.WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE = seconds;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [SET_DELETE_SCHEDULE_CRON]: (state, action) => {
        const schedule = action.payload;
        const config = {...state.config};
        config.DELETE_SCHEDULE_CRON = schedule;
        console.log('#######', config)
        return {
            ...state,
            config,
        }
    },
    [SET_OPTIONS_DIALOG_OPEN]: (state, action) => {
        const {dialogOpen} = action.payload;
        return {
            ...state,
            optionsDialogOpen:dialogOpen
        }
    },
}, initialState);