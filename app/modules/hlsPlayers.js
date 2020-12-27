import {createAction, handleActions} from 'redux-actions';
// import {logInfo, logError, logFail} from './messagePanel';
const cctvFromConfig = require('../lib/getCCTVList');
const {getCombinedConfig} = require('../lib/getConfig');
const sources = cctvFromConfig();
const config = getCombinedConfig({storeName:'optionStore', electronPath:'home'});

const {
    NUMBER_OF_CHANNELS,
    CHANNEL_PREFIX,
    DEFAULT_PLAYER_PROPS,
    LONG_BUFFERING_MS_SECONDS=3000
} = config;

const mkOverlayContent = url => {
    const source = sources.find(source => source.url === url)
    if(source !== undefined){
        const {title} = source
        const element = document.createElement('div');
        element.innerHTML = title;
        element.style = "color:black;font-weight:bold";
        return element;
    }
    return false;
}

const players = new Map();
const {remote} = require('electron');
// below is not singleton
// const electronUtil = require('../lib/electronUtil');
// const sourceStore = electronUtil.createElectronStore({
//     name:'sourceStore',
//     cwd:remote.app.getPath('home')
// });
const Store = require('electron-store');
const sourceStore = new Store({
    name:'sourceStore',
    cwd:remote.app.getPath('home')
})

for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
    // const source = sources[channelNumber-1] || {};
    const source = sourceStore.get(channelNumber.toString()) || sources[channelNumber-1]
    const {title="없음", url=""} = source;
    const hlsPlayer = {
        ...DEFAULT_PLAYER_PROPS,
        source,
        channelName: `${CHANNEL_PREFIX}${channelNumber}`,
        overlayContent: mkOverlayContent(url)
    }
    players.set(channelNumber, hlsPlayer);
}


// action types
const SET_PLAYER = 'hlsPlayers/SET_PLAYER';
const SET_PLAYER_SOURCE = 'hlsPlayers/SET_PLAYER_SOURCE';
const REFRESH_PLAYER = 'hlsPlayers/REFRESH_PLAYER';

// action creator
export const setPlayer = createAction(SET_PLAYER);
export const setPlayerSource = createAction(SET_PLAYER_SOURCE);
export const refreshPlayer = createAction(REFRESH_PLAYER);

// redux thunk
export const setSourceNSave = ({channelNumber, url}) => (dispatch, getState) => {
    const state = getState();
    const {sourceStore} = state.app;
    const hlsPlayer = {...state.hlsPlayers.players.get(channelNumber)};

    const sourceNumber = sources.findIndex(source => source.url === url);
    const title = sourceNumber !== -1 ? sources[sourceNumber].title : hlsPlayer.source.title;
    
    sourceStore.set(channelNumber, {
        title, 
        url
    })
    dispatch(setPlayerSource({channelNumber, url}))
}

const initialState = {
    players,
    config:{
        LONG_BUFFERING_MS_SECONDS
    }
}

// reducer
export default handleActions({
    [SET_PLAYER]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, player} = action.payload;
        const hlsPlayer = {...state.players.get(channelNumber)};
        hlsPlayer.player = player;
        const players = new Map(state.players);
        players.set(channelNumber, hlsPlayer);
        return {
            ...state,
            players
        }
    },
    [SET_PLAYER_SOURCE]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, url} = action.payload;
        const overlayContent = mkOverlayContent(url);

        const sourceNumber = sources.findIndex(source => source.url === url);
        const hlsPlayer = {...state.players.get(channelNumber)};
        // to make state change, use spread operator on source;
        const source = {...hlsPlayer.source};
        source.url = url;
        source.title = sourceNumber !== -1 ? sources[sourceNumber].title : hlsPlayer.source.title;
        hlsPlayer.source = source;
        if(overlayContent) hlsPlayer.overlayContent = overlayContent;

        const players = new Map(state.players);

        players.set(channelNumber, hlsPlayer);
        return {
            ...state,
            players
        }
    },
    [REFRESH_PLAYER]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber} = action.payload;
        const hlsPlayer = {...state.players.get(channelNumber)};
        const url = hlsPlayer.source.url;
        const {player} = hlsPlayer;
        if(player === null) {
            console.log('player is null. not refresh!')
            return {state}
        }
        const srcObject = {
            src: url,
            type: hlsPlayer.type,
            handleManifestRedirects: true,
        }
        player.src(srcObject);
        return { ...state }
    },
}, initialState);


