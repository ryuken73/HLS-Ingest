import {createAction, handleActions} from 'redux-actions';
// import {logInfo, logError, logFail} from './messagePanel';
const cctvFromConfig = require('../lib/getCCTVList');
const {getDefaultConfig} = require('../lib/getConfig');
const sources = cctvFromConfig();
const config = getDefaultConfig();
const {
    NUMBER_OF_CHANNELS,
    CHANNEL_PREFIX,
    DEFAULT_PLAYER_PROPS,
    LONG_BUFFERING_MS_SECONDS=3000
} = config;

const mkOverlayContent = (url, title) => {
    
    if(title === undefined){
        const source = sources.find(source => source.url === url);
        title = source === undefined ? 'None' : source.title; 
    }
    const element = document.createElement('div');
    element.innerHTML = title;
    element.style = "color:black;font-weight:bold";
    return element;
}

// initialize players
const players = new Map();
for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
    const url = "";
    const hlsPlayer = {
        ...DEFAULT_PLAYER_PROPS,
        // source,
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
export const changePlayerSource = ({channelNumber, source, sourceType}) => (dispatch, getState) => {
    const state = getState();
    const activeSource = state.activeSources.channelActiveSource.get(channelNumber);
    if(activeSource !== sourceType){
        return;
    } 
    dispatch(setPlayerSource({channelNumber, source}))
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
        const {channelNumber, source} = action.payload;
        const {url, title} = source;
        const overlayContent = mkOverlayContent(url, title);

        const hlsPlayer = {...state.players.get(channelNumber)};

        // to make state change, use spread operator on source;
        const newSource = {...hlsPlayer.source};
        newSource.url = url;
        newSource.title = title;
        hlsPlayer.source = newSource;
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


