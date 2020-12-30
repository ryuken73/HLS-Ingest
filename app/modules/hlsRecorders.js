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

const {remote} = require('electron');
const Store = require('electron-store');
const intervalStore = new Store({
    name:'intervalStore',
    cwd:remote.app.getPath('home')
})

const sourceStore = new Store({
    name:'sourceStore',
    cwd:remote.app.getPath('home')
})

// initialize recorder
const path = require('path');
for(let channelNumber=1 ; channelNumber<=NUMBER_OF_CHANNELS ; channelNumber++){
    const hlsRecorder = {
        channelNumber,
        channelName: `${CHANNEL_PREFIX}${channelNumber}`,
        duration: INITIAL_DURATION,
        recorder: null,
        inTransition: false,
        recorderStatus: 'stopped'
    }
    recorders.set(channelNumber, hlsRecorder);
}

// action types
const SET_DURATION = 'hlsRecorders/SET_DURATION';
const SET_RECORDER = 'hlsRecorders/SET_RECORDER';
const SET_RECORDER_STATUS = 'hlsRecorders/SET_RECORDER_STATUS';
const SET_RECORDER_INTRANSITION = 'hlsRecorders/SET_RECORDER_INTRANSITION';

// action creator
export const setDuration = createAction(SET_DURATION);
export const setRecorder = createAction(SET_RECORDER);
export const setRecorderStatus = createAction(SET_RECORDER_STATUS);
export const setRecorderInTransition = createAction(SET_RECORDER_INTRANSITION);

import log from 'electron-log';
const createLogger = channelName => {
    return {
        info: msg => {log.info(`[${channelName}][ChannelControl]${msg}`)},
        error: msg => {log.error(`[${channelName}][ChannelControl]${msg}`)}
    }
}

import HLSRecorder from '../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../lib/electronUtil';
import SelectInput from '@material-ui/core/Select/SelectInput';

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
    const {channelName} = hlsRecorder;
    const url = '';

    channelLog.info(`create HLS Recorder`)

    const ffmpegPath = getAbsolutePath('bin/ffmpeg.exe', true);
    const recorderOptions = {
        name: channelName,
        src: url, 
        ffmpegBinary: ffmpegPath,
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
        dispatch(setDuration({channelNumber, duration:progress.duration}));
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
    // createdByError && scheduleStatus === 'started' && dispatch(startRecording(channelNumber));
}


const getOutputName = (hlsRecorder, hlsPlayer) => {
    const {channelName, channelDirectory} = hlsRecorder;
    const {source} = hlsPlayer;
    const now = utils.date.getString(new Date(),{sep:'-'});
    const jobDescString = `${channelName}_${now}_${Date.now()}_${source.title}`;
    const safeForWinFile = utils.file.toSafeFileNameWin(jobDescString);
    const saveDirectory = path.join(channelDirectory, safeForWinFile);
    const subDirectory = safeForWinFile;
    const localm3u8 = path.join(saveDirectory, `${channelName}_stream.m3u8`);
    return [saveDirectory, localm3u8, subDirectory];
}

export const setScheduleIntervalNSave = ({channelNumber, scheduleInterval}) => (dispatch, getState) => {
    const state = getState();
    const {intervalStore} = state.app;
    intervalStore.set(channelNumber, scheduleInterval);
    dispatch(setScheduleInterval({channelNumber, scheduleInterval}))
}

export const refreshRecorder = ({channelNumber}) => (dispatch, getState) => {
    const state = getState();
    const {recorders} = state.hlsRecorders;
    const hlsRecorder = recorders.get(channelNumber);
    dispatch(setRecorderStatus({channelNumber, recorderStatus: 'stopped'}))
    dispatch(setRecorderInTransition({channelNumber, inTransition:false}));
    dispatch(setDuration({channelNumber, duration:INITIAL_DURATION}));
    // dispatch(setPlayerSource({channelNumber, url:hlsRecorder.playerHttpURL}))
}

export const restartRecording = channelNumber => (dispatch, getState) => {
    const state = getState();
    const [hlsRecorder] = getChanneler(state, channelNumber);
    const {scheduleStatus} = hlsRecorder;
    scheduleStatus === 'started' && dispatch(startRecording(channelNumber));
}

const getIngestSource = (channelActiveSource, liveSource, clipSource) => {
    console.log('$$$', channelActiveSource, liveSource, clipSource);
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
        console.log(`#### in startRecording:`, channelNumber);
        const state = getState();
        const [hlsRecorder, channelLog] = getChanneler(state, channelNumber);
        const {
            channelName,
            recorder,
        } = hlsRecorder;
        const {activeSources, liveSelector, clipSelector} = state;
        const channelActiveSource = activeSources.channelActiveSource.get(channelNumber);
        const liveSource = liveSelector.currentSource.get(channelNumber);
        const clipSource = clipSelector.currentClip.get(channelNumber);
        const source = getIngestSource(channelActiveSource, liveSource, clipSource);   
        console.log('$$$$', source)

        channelLog.info(`start startRecroding() recorder.createTime:${recorder.createTime}`)
    
        recorder.src = source.url;
        const remoteTarget = getIngestTarget(channelNumber);
        const localTarget = getLocalTarget(channelNumber);
        recorder.target = [remoteTarget, localTarget]
        
        dispatch(setRecorderInTransition({channelNumber, inTransition:true}))
        dispatch(setRecorderStatus({channelNumber, recorderStatus: 'starting'}))
    
        // recorder.once('start', (cmd) => {
        //     channelLog.info(`recorder emitted start : ${cmd}`)
        //     setTimeout(() => {
        //         dispatch(setPlayerSource({channelNumber, url:localm3u8}))
        //         resolve(true);
        //     },WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE);
        // })
        recorder.once('end', async (clipName, startTimestamp, duration) => {
            try {
                channelLog.info(`recorder emitted end (listener1): ${clipName}`)
                const endTimestamp = Date.now();
                const startTime = utils.date.getString(new Date(startTimestamp),{sep:'-'})
                const endTime = utils.date.getString(new Date(endTimestamp),{sep:'-'})
                const url = remoteTarget;
                const title = source.title;
                // const hlsDirectory = saveDirectory;
                // const clipId = `${channelName}_${startTime}_${startTimestamp}_${title}`
                // const clipId = subDirectory;
                // const hlsm3u8 = localm3u8;
                const clipData = {
                    // clipId,
                    channelNumber,
                    channelName,
                    startTime,
                    endTime,
                    startTimestamp,
                    endTimestamp,
                    url,
                    title,
                    // hlsDirectory,
                    duration,
                    // hlsm3u8,
                    // saveDirectory,
                    // mp4Converted:false
                }
    
                console.log('#######', clipData)
                //todo : save clipData in electron store
                // clipStore.set(clipId, clipData);
                dispatch(refreshRecorder({channelNumber}));
                //todo : remove old clips based on keey hours configuration parameter
                // rimraf(hlsDirectory, err => {
                //     if(err) {
                //         channelLog.error(err);
                //         channelLog.error(`delete working directory failed: ${hlsDirectory}`);
                //         return
                //     } 
                //     channelLog.info(`delete working directory success: ${hlsDirectory}`);
                // });
            } catch (error) {
                if(error){
                    channelLog.error(error)
                }
            }
        })
    
        recorder.start();
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

// export const startSchedule = channelNumber => async (dispatch, getState) => {
//     dispatch(setScheduleStatus({channelNumber, scheduleStatus:'starting'}));
//     const state = getState();
//     const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);

//     const {recorder, scheduleInterval} = hlsRecorder;
//     channelLog.info(`### start schedule : recorder.createTime=${recorder.createTime}`)

//     dispatch(stopRecording(channelNumber))
//     .then((result) => {
//         dispatch(startRecording(channelNumber))
//     })
//     .then((result) => {
//         dispatch(setScheduleStatus({channelNumber, scheduleStatus:'started'}));
//     })
//     const scheduleFunction = setInterval( async () => {
//         dispatch(stopRecording(channelNumber))
//         .then(result => {
//             return dispatch(startRecording(channelNumber))
//         })
//     }, scheduleInterval);
//     dispatch(setScheduleFunction({channelNumber, scheduleFunction}))
// }

// export const stopSchedule = channelNumber => async (dispatch, getState) => {
//     const state = getState();
//     const [hlsRecorder, hlsPlayer, channelLog] = getChanneler(state, channelNumber);

//     const {recorder, scheduleFunction} = hlsRecorder;
//     channelLog.info(`### stop schedule : recorder.createTime=${recorder.createTime}`)

//     dispatch(setScheduleStatus({channelNumber, scheduleStatus:'stopping'}))
//     clearInterval(scheduleFunction);
//     dispatch(setScheduleFunction({channelNumber, scheduleFunction:null}));
//     if(recorder.isBusy) {
//         dispatch(await stopRecording(channelNumber))
//         .then(result => {
//             dispatch(setScheduleStatus({channelNumber, scheduleStatus:'stopped'}));
//         })
//     } else {
//         dispatch(setScheduleStatus({channelNumber, scheduleStatus:'stopped'}));
//     }
// }

const sleepms = timems => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);   
        }, timems);
    })
}

// export const startScheduleAll = () => async (dispatch, getState) => {
//     const state = getState();
//     const {recorders} = state.hlsRecorders;
//     const channelNumbers = [...recorders.keys()]
//     // channelNumbers.forEach(async channelNumber => { // forEach loop execute concurrently
//     for(let index=0; index < channelNumbers.length; index++){
//         dispatch(startSchedule(channelNumbers[index]))
//         await sleepms(SLEEP_MS_BETWEEN_ALL_START);
//     }
//     // })
// }

// export const stopScheduleAll = () => async (dispatch, getState) => {
//     const state = getState();
//     const {recorders} = state.hlsRecorders;
//     const channelNumbers = [...recorders.keys()].filter(channelNumber => {
//         const recorder = recorders.get(channelNumber);
//         return recorder.scheduleStatus === 'started';
//     })
//     for(let index=0; index < channelNumbers.length; index++){
//         dispatch(stopSchedule(channelNumbers[index]))
//         await sleepms(SLEEP_MS_BETWEEN_ALL_STOP);
//     }
// }

// export const changeAllIntervals = interval =>  (dispatch, getState) => {
//     const state = getState();
//     const {recorders} = state.hlsRecorders;
//     const channelNumbers = [...recorders.keys()];
//     channelNumbers.forEach(channelNumber => {
//         dispatch(setScheduleIntervalNSave({channelNumber, scheduleInterval:interval}))
//     })
// }

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
    }
}, initialState);