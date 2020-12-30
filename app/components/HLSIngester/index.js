import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LiveSelectorContainer from '../../containers/LiveSelectorContainer';  
import ClipSelectorContainer from '../../containers/ClipSelectorContainer';  
// import ClipSelector from './ClipSelector';  
import BorderedBox from '../template/BorderedBox';
import BorderedList from '../template/BorderedList';
import {BasicButton} from '../template/basicComponents';
import {SmallButton} from '../template/smallComponents';
import Duration from './Duration';
import HLSPlayerContainer from '../../containers/HLSPlayerContainer';
// import HLSPlayer from './HLSPlayer';

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
    } = props;

    const {
        startRecording=()=>{},
        stopRecording=()=>{},
        createRecorder=()=>{}
    } = props.HLSRecorderActions;

    React.useEffect(() => {
        createRecorder(channelNumber);
    },[])

    const startRecordChannel = event => {
        startRecording(channelNumber);
    }

    const stopRecordChannel = event => {
        stopRecording(channelNumber);
    }

    const ButtonText = {
        "starting": "Starting..",
        "started": "Stop",
        "stopping": "Stopping..",
        "stopped": "Ingest"
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
            <Duration channelNumber={channelNumber} bgColors={bgColors}></Duration>
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
                    width="80%"
                    disabled={inTransition}
                    onClick={recorderStatus==="started" ? stopRecordChannel : startRecordChannel}
                >{ButtonText[recorderStatus]}</BasicButton>
            </BorderedBox>
            <BorderedBox>
                <HLSPlayerContainer channelNumber={channelNumber}></HLSPlayerContainer>
            </BorderedBox>
        </BorderedBox>
    )
}

export default React.memo(HLSIngest);