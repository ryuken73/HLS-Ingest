import React from 'react';
import Box from '@material-ui/core/Box';
import RefreshIcon from '@material-ui/icons/Refresh';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {SmallPaddingIconButton}  from '../../template/smallComponents';
import log from 'electron-log';

import HLSRecorder from '../../../lib/RecordHLS_ffmpeg';
import {getAbsolutePath} from '../../../lib/electronUtil';

const rimraf = require('rimraf');
const path = require('path');
import utils from '../../../utils';

async function mkdir(directory){
    try {
        await utils.file.makeDirectory(directory);
    } catch (err) {
        console.error(err);
    }
}

const Controls = props => {
    const {channelNumber, source, bgColors} = props;
    const {
        channelName="channelX",
        duration="00:00:00.00",
        channelDirectory="c:/cctv/channelX",
        url="",
        recorder=null,
        inTransition=false,
        scheduleFunction=null,
        autoStartSchedule=true,
        localm3u8=null,
        recorderStatus='stopped',
        scheduleStatus='stopped'
    } = props

    const recorderIconColor = bgColors[recorderStatus];
    const scheduleIconColor = bgColors[scheduleStatus];
    
    const {
        refreshPlayer=()=>{},
    } = props.HLSPlayerActions;

    const {
        setDuration=()=>{},
        setRecorder=()=>{},
        setRecorderStatus=()=>{},
        setRecorderInTransition=()=>{},
        setScheduleFunction=()=>{},
        setScheduleStatus=()=>{},
        setAutoStartSchedule=()=>{},
        startRecording=()=>{},
        stopRecording=()=>{},
        refreshRecorder=()=>{},
        startSchedule=()=>{},
        stopSchedule=()=>{},
        restartRecording=()=>{},
        createRecorder=()=>{}
    } = props.HLSRecorderActions;

    const createLogger = channelName => {
        return {
            info: msg => {log.info(`[${channelName}][ChannelControl]${msg}`)},
            error: msg => {log.error(`[${channelName}][ChannelControl]${msg}`)}
        }
    }
    const channelLog = createLogger(channelName);
    React.useEffect(() => {
        try {
            mkdir(channelDirectory);
        } catch (err) {
            return
        }
    },[])

    React.useEffect(() => {
        createRecorder(channelNumber);
    },[])

    const refreshChannelPlayer = (event) => {
        // todo: url can be file url when recording
        // refreshPlayer({channelNumber, url:source.url});
        refreshPlayer({channelNumber});
    }

    const startRecordChannel = event => {
        startRecording(channelNumber);
    }

    const stopRecordChannel = event => {
        stopRecording(channelNumber);
    }

    const startScheduleChannel = event => {
        startSchedule(channelNumber);
    }

    const stopScheduleChannel = event => {
        stopSchedule(channelNumber);
    }
    
    return (
        <Box display="flex" flexDirection="column" mr="3px">
            <SmallPaddingIconButton padding="1px" size="small" iconcolor="black">
                <RefreshIcon color="primary" fontSize={"small"} onClick={refreshChannelPlayer}></RefreshIcon>
            </SmallPaddingIconButton>
            <SmallPaddingIconButton disabled={inTransition} padding="1px" size="small" iconcolor={recorderIconColor}>
                <FiberManualRecordIcon 
                    // color={recorderStatus==="started" ? "secondary" : "primary"}
                    fontSize={"small"} 
                    onClick={recorderStatus==="started" ? stopRecordChannel : startRecordChannel}
                ></FiberManualRecordIcon>
            </SmallPaddingIconButton>
            <SmallPaddingIconButton disabled={inTransition} padding="1px" size="small" iconcolor={scheduleIconColor}>
                <AccessAlarmIcon 
                    // color="primary" 
                    fontSize={"small"} 
                    onClick={scheduleStatus==="started" ? stopScheduleChannel : startScheduleChannel}
                ></AccessAlarmIcon>
            </SmallPaddingIconButton>
        </Box>
    );
};

export default React.memo(Controls);