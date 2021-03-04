import {createAction, handleActions} from 'redux-actions';
// import {logInfo, logError, logFail} from './messagePanel';
import {setRecorderStartTimeSeconds, setRecorderStopTimeSeconds} from './hlsRecorders';
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
        overlayContent: mkOverlayContent(url),
        seeked: null
    }
    players.set(channelNumber, hlsPlayer);
}


// action types
const SET_PLAYER = 'hlsPlayers/SET_PLAYER';
const SET_PLAYER_SOURCE = 'hlsPlayers/SET_PLAYER_SOURCE';
const SET_PLAYER_SEEKED = 'hlsPlayers/SET_PLAYER_SEEKED';
const REFRESH_PLAYER = 'hlsPlayers/REFRESH_PLAYER';

// action creator
export const setPlayer = createAction(SET_PLAYER);
export const setPlayerSource = createAction(SET_PLAYER_SOURCE);
export const setPlayerSeeked = createAction(SET_PLAYER_SEEKED);
export const refreshPlayer = createAction(REFRESH_PLAYER);

import log from 'electron-log';
const createLogger = channelName => {
    return {
        info: msg => {log.info(`[${channelName}][ChannelControl]${msg}`)},
        error: msg => {log.error(`[${channelName}][ChannelControl]${msg}`)}
    }
}

// redux thunk
const removeAllMarker = player => {
    if(player.markers){
        try{
            player.markers.removeAll();
        } catch (err) {
            console.log('makers not initialized!')
        }
    }
}

export const changePlayerSource = ({channelNumber, source, sourceType}) => (dispatch, getState) => {
    const state = getState();
    const activeSource = state.activeSources.channelActiveSource.get(channelNumber);
    if(activeSource !== sourceType){
        return;
    } 
    const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber); 
    const {player} = hlsPlayer;
    removeAllMarker(player);
    dispatch(setPlayerSource({channelNumber, source}))
}

const getChanneler = (state, channelNumber) => {
    const {recorders} = state.hlsRecorders;
    const hlsRecorder = recorders.get(channelNumber);
    const {players} = state.hlsPlayers;
    const hlsPlayer = players.get(channelNumber);
    console.log('### marker:', players, hlsPlayer)
    const {channelName} = hlsRecorder;
    const channelLog = createLogger(hlsRecorder.channelName)
    return [hlsRecorder, hlsPlayer, channelLog]
}

const addMarkerIn = (player, prevStartTimeSeconds, markers, seeked) => {
    (markers.length === 2) && player.markers.remove([0]);
    (markers.length === 1 && markers[0].time === prevStartTimeSeconds) && player.markers.remove([0]);
    player.markers.add([{time: seeked, text: "In", ovarlayText: "In"}]);
    return;
}

const addMarkerOut = (player, prevStopTimeSeconds, markers, seeked) => {
    (markers.length === 2) && player.markers.remove([1]);
    (markers.length === 1 && markers[0].time === prevStopTimeSeconds) && player.markers.remove([0]);
    player.markers.add([{time: seeked, text: "Out", ovarlayText: "Out"}]);
    return;
}

export const setStartNStopPoint = ({channelNumber, seeked}) => (dispatch, getState)  => {
    const state = getState();
    const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);
    const {startTimeSeconds, stopTimeSeconds} = hlsRecorder;
    const {player} = hlsPlayer;
    const markers = hlsPlayer.player.markers.getMarkers();
    if(hlsRecorder.startTimeFocused && stopTimeSeconds > seeked) {
        addMarkerIn(player, startTimeSeconds, markers, seeked)
        dispatch(setRecorderStartTimeSeconds({channelNumber, startTimeSeconds:seeked}));
    }
    if(hlsRecorder.stopTimeFocused && startTimeSeconds < seeked) {
        addMarkerOut(player, stopTimeSeconds, markers, seeked)
        dispatch(setRecorderStopTimeSeconds({channelNumber, stopTimeSeconds:seeked}));
    }
    dispatch(setPlayerSeeked({channelNumber, seeked}));
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
    [SET_PLAYER_SEEKED]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, seeked} = action.payload;
        const hlsPlayer = {...state.players.get(channelNumber)};
        hlsPlayer.seeked = seeked;
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


