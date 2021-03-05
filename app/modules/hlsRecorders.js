import {createAction, handleActions} from 'redux-actions';
import {setPlayerSource, refreshPlayer} from './hlsPlayers';
// import {logInfo, logError, logFail} from './messagePanel';
const cctvFromConfig = require('../lib/getCCTVList');
const {getDefaultConfig} = require('../lib/getConfig');
const sources = cctvFromConfig();
const config = getDefaultConfig();


const {
    NUMBER_OF_CHANNELS,
    CHANNEL_PREFIX,
    REMOTE_TARGETS={},
    LOCAL_PLAYBACK_TARGETS={}    
} = config;

const INITIAL_DURATION = '00:00:00.00';

import utils from '../utils';
const recorders = new Map();

// initialize recorder
const path = require('path');
for(let channelNumber=1 ; channelNumber<=NUMBER_OF_CHANNELS ; channelNumber++){
    const hlsRecorder = {
        channelNumber,
        channelName: `${CHANNEL_PREFIX}${channelNumber}`,
        duration: INITIAL_DURATION,
        recorder: null,
        inTransition: false,
        recorderStatus: 'stopped',
        startTimeSeconds: 0,
        stopTimeSeconds: 0,
        startTimeFocused: false,
        stopTimeFocused: false
    }
    recorders.set(channelNumber, hlsRecorder);
}

// action types
const SET_DURATION = 'hlsRecorders/SET_DURATION';
const SET_RECORDER = 'hlsRecorders/SET_RECORDER';
const SET_RECORDER_STATUS = 'hlsRecorders/SET_RECORDER_STATUS';
const SET_RECORDER_INTRANSITION = 'hlsRecorders/SET_RECORDER_INTRANSITION';
const SET_RECORDER_START_TIME_SECONDS = 'hlsRecorders/SET_RECORDER_START_TIME_SECONDS';
const SET_RECORDER_STOP_TIME_SECONDS = 'hlsRecorders/SET_RECORDER_STOP_TIME_SECONDS';
const SET_TIME_INPUT_FOCUSED = 'hlsRecorders/SET_TIME_INPUT_FOCUSED';

// action creator
export const setDuration = createAction(SET_DURATION);
export const setRecorder = createAction(SET_RECORDER);
export const setRecorderStatus = createAction(SET_RECORDER_STATUS);
export const setRecorderInTransition = createAction(SET_RECORDER_INTRANSITION);
export const setRecorderStartTimeSeconds = createAction(SET_RECORDER_START_TIME_SECONDS);
export const setRecorderStopTimeSeconds = createAction(SET_RECORDER_STOP_TIME_SECONDS);
export const setTimeInputFocused = createAction(SET_TIME_INPUT_FOCUSED);


import log from 'electron-log';
const createLogger = channelName => {
    return {
        info: msg => {log.info(`[${channelName}][ChannelControl]${msg}`)},
        error: msg => {log.error(`[${channelName}][ChannelControl]${msg}`)}
    }
}

import HLSRecorder from '../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../lib/electronUtil';
import {destroyPlaybackProcess} from './playback';

const getChanneler = (state, channelNumber) => {
    const {recorders} = state.hlsRecorders;
    const hlsRecorder = recorders.get(channelNumber);
    const {channelName} = hlsRecorder;
    const channelLog = createLogger(hlsRecorder.channelName)
    return [hlsRecorder, channelLog]
}

export const createRecorder = (channelNumber, createdByError=false) => (dispatch, getState) => {
    const state = getState();
    const [hlsRecorder, channelLog] = getChanneler(state, channelNumber);
    const {channelName, startTimeSeconds, stopTimeSeconds} = hlsRecorder;
    const url = '';

    channelLog.info(`create HLS Recorder`)

    const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
    const recorderOptions = {
        name: channelName,
        src: url, 
        ffmpegBinary: ffmpegPath,
        startTimeSeconds,
        stopTimeSeconds
    }
    const recorder = HLSRecorder.createHLSRecoder(recorderOptions);

    const startHandler = cmd => {
        channelLog.info(`recorder emitted start : ${cmd}`)
        setTimeout(() => {
            dispatch(setRecorderStatus({channelNumber, recorderStatus: 'started'}));
            dispatch(setRecorderInTransition({channelNumber, inTransition:false}));
        },1000);
    }
    const progressHandler = progress => {
        console.log(progress)
        dispatch(setDuration({channelNumber, duration:progress.timemark}));
    }
    const errorHandler = error => {
        channelLog.error(`error occurred`);
        channelLog.error(error);
        // after recorder emits error
        // 1. resetPlayer => change mode from playback to source streaming
        // dispatch(refreshPlayer({channelNumber}));
        // 2. resetRecorder => initialize recorder status(duration, status..)
        //    because recorder's error emits end event, resetRecorder is
        //    done in recorder's end handler in RecordHLS_ffmpeg.js.
        // 3. recreateRecorder with createdByError=true
        dispatch(createRecorder(channelNumber, /*createdByError */ true));
    }
    
    recorder.on('start', startHandler)
    recorder.on('progress', progressHandler)
    recorder.on('error', errorHandler)
    dispatch(setRecorder({channelNumber, recorder}))
}

// export const setScheduleIntervalNSave = ({channelNumber, scheduleInterval}) => (dispatch, getState) => {
//     const state = getState();
//     const {intervalStore} = state.app;
//     intervalStore.set(channelNumber, scheduleInterval);
//     dispatch(setScheduleInterval({channelNumber, scheduleInterval}))
// }

export const refreshRecorder = ({channelNumber}) => (dispatch, getState) => {
    console.log('&&&&& refreshRecorder:', channelNumber)
    const state = getState();
    const {recorders} = state.hlsRecorders;
    dispatch(setRecorderStatus({channelNumber, recorderStatus: 'stopped'}))
    dispatch(setRecorderInTransition({channelNumber, inTransition:false}));
    dispatch(setDuration({channelNumber, duration:INITIAL_DURATION}));
}

export const restartRecording = channelNumber => (dispatch, getState) => {
    const state = getState();
    const [hlsRecorder] = getChanneler(state, channelNumber);
    const {scheduleStatus} = hlsRecorder;
    scheduleStatus === 'started' && dispatch(startRecording(channelNumber));
}

const getIngestSource = (channelActiveSource, liveSource, clipSource) => {
    if(channelActiveSource === 'live'){
        return liveSource;
    }
    return clipSource;
}

const getIngestTarget = channelNumber => {
    return REMOTE_TARGETS[channelNumber.toString()] || null;
}

const getLocalTarget = channelNumber => {
    return LOCAL_PLAYBACK_TARGETS[channelNumber.toString()] || null;
}

export const startRecording = (channelNumber) => (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        try {
            console.log(`#### in startRecording:`, channelNumber);
            const state = getState();
            const [hlsRecorder, channelLog] = getChanneler(state, channelNumber);
            const {
                channelName,
                recorder,
                startTimeSeconds,
                stopTimeSeconds
            } = hlsRecorder;
    
            const {activeSources, liveSelector, clipSelector} = state;
            const channelActiveSource = activeSources.channelActiveSource.get(channelNumber);
            const liveSource = liveSelector.currentSource.get(channelNumber);
            const clipSource = clipSelector.currentClip.get(channelNumber);
            const source = getIngestSource(channelActiveSource, liveSource, clipSource);   
    
            channelLog.info(`start startRecroding() recorder.createTime:${recorder.createTime}`)
        
            recorder.src = source.url;
            recorder.ffmpegOptSS = startTimeSeconds;
            recorder.ffmpegOptTO = stopTimeSeconds;
            recorder.activeSource = channelActiveSource;
            const remoteTarget = getIngestTarget(channelNumber);
            const localTarget = getLocalTarget(channelNumber);
            recorder.target = [remoteTarget, localTarget]
            
            dispatch(setRecorderInTransition({channelNumber, inTransition:true}))
            dispatch(setRecorderStatus({channelNumber, recorderStatus: 'starting'}))
            recorder.once('start', () => {
                console.log('$$$ recorder started!')
                resolve();
            })
            recorder.once('end', async (clipName, startTimestamp, duration, error) => {
                try {
                    channelLog.info(`recorder emitted end (listener1): ${clipName}`)
                    const endTimestamp = Date.now();
                    const startTime = utils.date.getString(new Date(startTimestamp),{sep:'-'})
                    const endTime = utils.date.getString(new Date(endTimestamp),{sep:'-'})
                    const url = remoteTarget;
                    const title = source.title;
    
                    const clipData = {
                        channelNumber,
                        channelName,
                        startTime,
                        endTime,
                        startTimestamp,
                        endTimestamp,
                        url,
                        title,
                        duration,
                    }
                    console.log('#######', clipData)
                    dispatch(refreshRecorder({channelNumber}));
                    dispatch(destroyPlaybackProcess({channelNumber}));
    
                } catch (error) {
                    if(error){
                        channelLog.error(error)
                    }
                }
            })
        
            recorder.start();
        } catch (error) {
            console.log('eeee: error when startRecording')
            dispatch(refreshRecorder({channelNumber}));
            reject(error);
        }
    

    })
}

export const stopRecording = (channelNumber) => (dispatch, getState) => {    
    return new Promise((resolve, reject) => {
        try {
            const state = getState();
            const [hlsRecorder, channelLog] = getChanneler(state, channelNumber);

            const {
                recorder,
                inTransition,
                recorderStatus
            } = hlsRecorder;

            channelLog.info(`start stopRecording(): recorderStatus: ${recorderStatus}, recorder.createTime:${recorder.createTime}`)
            if(recorderStatus !== 'started'){
                resolve(true);
                return;
            }
            dispatch(setRecorderStatus({channelNumber, recorderStatus: 'stopping'}))
            dispatch(setRecorderInTransition({channelNumber, inTransition:true}));
            recorder.once('end', async clipName => {
                channelLog.info(`recorder normal stopRecording. emitted end (listener2)`)
                resolve(true);
            })
            recorder.stop();
        } catch (err) {
            channelLog.error(`error in stopRecording`);
            log.error(err);
            dispatch(refreshRecorder({channelNumber}));
            resolve(true)
        }
    })
}

const initialState = {
    recorders
}

// reducer
export default handleActions({
    [SET_DURATION]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, duration} = action.payload;
        const recorder = {...state.recorders.get(channelNumber)};
        recorder.duration = duration;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, recorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, recorder} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.recorder = recorder;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_STATUS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, recorderStatus} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.recorderStatus = recorderStatus;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_INTRANSITION]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, inTransition} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.inTransition = inTransition;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_START_TIME_SECONDS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, startTimeSeconds} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.startTimeSeconds = startTimeSeconds;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_RECORDER_STOP_TIME_SECONDS]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, stopTimeSeconds} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder.stopTimeSeconds = stopTimeSeconds;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    },
    [SET_TIME_INPUT_FOCUSED]: (state, action) => {
        // console.log('%%%%%%%%%%%%%%%%', action.payload);
        const {channelNumber, type, focused} = action.payload;
        const channelRecorder = {...state.recorders.get(channelNumber)};
        channelRecorder[type] = focused;
        const recorders = new Map(state.recorders);
        recorders.set(channelNumber, channelRecorder);
        return {
            ...state,
            recorders
        }
    }
}, initialState);