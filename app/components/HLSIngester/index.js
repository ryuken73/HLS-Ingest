import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LiveSelectorContainer from '../../containers/LiveSelectorContainer';  
import ClipSelectorContainer from '../../containers/ClipSelectorContainer';  
import BorderedBox from '../template/BorderedBox';
import BorderedList from '../template/BorderedList';
import {BasicButton} from '../template/basicComponents';
import {SmallButton} from '../template/smallComponents';
import DurationContainer from '../../containers/DurationContainer';
import HLSPlayerContainer from '../../containers/HLSPlayerContainer';

const {getDefaultConfig} = require('../../lib/getConfig');
const config = getDefaultConfig();

const {remote} = require('electron');

const bgColors = {
    // 'starting': 'maroon',
    'starting': '#540101',
    'started': 'maroon',
    'stopping': '#540101',
    'stopped': '#191d2e'
}

function HLSIngest(props) {
    console.log('$$$',props)
    const {channelNumber} = props;
    const {
        inTransition=false,
        recorderStatus="stopped",     
        sourceFrom   
    } = props;

    const {
        startRecording=()=>{},
        stopRecording=()=>{},
        createRecorder=()=>{}
    } = props.HLSRecorderActions;

    const {
        forkPlaybackProcess=()=>{},
        destroyPlaybackProcess=()=>{}
    } = props.PlaybackActions;

    React.useEffect(() => {
        createRecorder(channelNumber);
    },[])

    const {OFFSET_TOP, OFFSET_LEFT} = config.FFPLAY_OFFSET[channelNumber.toString()];
    const {WIDTH, HEIGHT} = config.FFPLAY_SIZE;

    const startRecordChannel = async event => {
        try {
            const mainWindow = remote.getCurrentWindow();
            mainWindow.setMovable(false);
            const [left, top] = mainWindow.getPosition();            
            await startRecording(channelNumber);
            // const forkArgs = ['-left', left, '-top', top+OFFSET_TOP, '-alwaysontop', '-noborder', '-i', 'udp://127.0.0.1:8881'];
            const fastFFPlayOptions = ['-vf', 'setpts=PTS/15,fps=30'];
            const normalFFPLayOptions = ['-x', WIDTH, '-y', HEIGHT, '-left', left+OFFSET_LEFT, '-top', top+OFFSET_TOP, '-alwaysontop'];
            const forkArgs = sourceFrom === 'live' ? normalFFPLayOptions : [...normalFFPLayOptions, ...fastFFPlayOptions];
            forkPlaybackProcess({channelNumber, forkArgs});
        } catch (error) {
            console.error(error);
            const mainWindow = remote.getCurrentWindow();
            mainWindow.setMovable(true);
        }

    }

    const stopRecordChannel = event => {
        const mainWindow = remote.getCurrentWindow();
        mainWindow.setMovable(true)
        stopRecording(channelNumber);
        destroyPlaybackProcess({channelNumber});
    }

    const ButtonText = {
        "starting": "Starting..",
        "started": "Stop",
        "stopping": "Stopping..",
        "stopped": "Ingest"
    }

    const blankMessage = {
        "starting":"starting ingest...",
        "started":"playback..",
        "stopping":"stopping ingest...",
        "stopped":"",
    }


    return (
        <BorderedBox
            bgcolor="#232738"
            display="flex"
            flexDirection="column"
            flexGrow={0}
            width={610}
            // bgcolor="#2d2f3b"
        >
            <DurationContainer channelNumber={channelNumber} bgColors={bgColors}></DurationContainer>
            <BorderedBox height="110px" display="flex" alignItems="center" bgcolor="#232738">
                <Box display="flex" flexDirection="column" padding="5px">
                    <Typography variant="body1">Source</Typography>
                    <Box mt="2px">
                        <LiveSelectorContainer channelNumber={channelNumber}></LiveSelectorContainer>
                    </Box>
                    <Box mt="5px" mb="2px">
                        <ClipSelectorContainer channelNumber={channelNumber}></ClipSelectorContainer>
                    </Box>
                </Box>
                <BasicButton 
                    channelNumber={channelNumber}
                    color="secondary" 
                    bgcolor={bgColors[recorderStatus]}
                    variant={"contained"} 
                    // bgcolor="#191d2e" 
                    height="90%" 
                    width="110px"
                    disabled={inTransition}
                    onClick={recorderStatus==="started" ? stopRecordChannel : startRecordChannel}
                >{ButtonText[recorderStatus]}</BasicButton>
            </BorderedBox>
            <BorderedBox 
                display={recorderStatus === 'stopped' ? "flex" : "none"}
                bgcolor="black"
                alignItems="center"
                justifyContent="center"
            >
                <HLSPlayerContainer channelNumber={channelNumber}></HLSPlayerContainer>
            </BorderedBox>
            <BorderedBox 
                display={recorderStatus === 'stopped' ? "none" : "flex"}
                bgcolor="black"
                alignItems="center"
                justifyContent="center"
                width="618px" height="340px"
            >
                <Box>{blankMessage[recorderStatus]}</Box>
            </BorderedBox>
        </BorderedBox>
    )
}

export default React.memo(HLSIngest);