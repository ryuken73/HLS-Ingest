import React from 'react';
import Box from '@material-ui/core/Box';
import SectionWithFullHeight from '../template/SectionWithFullHeight';
// import Duration from './Duration';
import DurationContainer from '../../containers/DurationContainer';
import SourceSelectorContainer from '../../containers/SourceSelectorContainer';
import HLSPlayerContainer from '../../containers/HLSPlayerContainer';
import ControlsContainer from '../../containers/ControlsContainer';
import SchedulerContainer from '../../containers/SchedulerContainer';
import SourceRecordingContainer from '../../containers/SourceRecordingContainer';
// import Controls from './Controls';
// import Scheduler from './Scheduler';

const HLSRecorder = (props) => {
    const {
        channelNumber=1, 
        recorderStatus="stopped",
        store
    } = props;

    const bgColors = {
        // 'starting': 'maroon',
        'starting': '#540101',
        'started': 'maroon',
        'stopping': '#540101',
        'stopped': 'black'
    }

    const bgColor = bgColors[recorderStatus];
    const hideSourceSelect = recorderStatus === "stopped" ? false : true;

    return (
        <SectionWithFullHeight m={"5px"} flexGrow={0} width="320px" bgcolor={"#2d2f3b"} border={1} borderColor={"black"} p="1px">
            <DurationContainer 
                channelNumber={channelNumber}
                bgColors={bgColors}
            ></DurationContainer>
            <SourceRecordingContainer
                channelNumber={channelNumber}
                hidden={!hideSourceSelect}
            ></SourceRecordingContainer>
            <SourceSelectorContainer 
                hidden={hideSourceSelect}
                channelNumber={channelNumber}
            ></SourceSelectorContainer>
            <Box display="flex" alignItems="flex-start">
                <ControlsContainer
                    channelNumber={channelNumber}
                    bgColors={bgColors}
                ></ControlsContainer>
                <Box border={2} borderColor={bgColor}>
                    <HLSPlayerContainer 
                        channelNumber={channelNumber}
                    ></HLSPlayerContainer>
                </Box>
            </Box>
            <SchedulerContainer
                channelNumber={channelNumber}
            ></SchedulerContainer>
        </SectionWithFullHeight>
    );
};

export default React.memo(HLSRecorder);