import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LiveSelectorContainer from '../../containers/LiveSelectorContainer';  
import ClipSelector from './ClipSelector';  
import BorderedBox from '../template/BorderedBox';
import BorderedList from '../template/BorderedList';
import {BasicButton} from '../template/basicComponents';
import {SmallButton} from '../template/smallComponents';
import Duration from './Duration';
// import HLSPlayerContainer from '../../containers/HLSPlayerContainer';
import HLSPlayer from './HLSPlayer';

const bgColors = {
    // 'starting': 'maroon',
    'starting': '#540101',
    'started': 'maroon',
    'stopping': '#540101',
    'stopped': 'black'
}

function HLSIngest(props) {
    const {channelNumber} = props;
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
            <BorderedBox height="100px" display="flex" alignItems="center" bgcolor="#232738">
                <Box display="flex" flexDirection="column" padding="5px">
                    <Typography variant="body1">Source</Typography>
                    <LiveSelectorContainer channelNumber={channelNumber}></LiveSelectorContainer>
                    <ClipSelector channelNumber={channelNumber}></ClipSelector>
                </Box>
                <BasicButton 
                    channelNumber={channelNumber}
                    color="secondary" 
                    variant={"contained"} 
                    bgcolor="#191d2e" 
                    height="90%" 
                    width="80%"
                >INGEST</BasicButton>
            </BorderedBox>
            <BorderedBox>
                <HLSPlayer channelNumber={channelNumber}></HLSPlayer>
            </BorderedBox>
        </BorderedBox>
    )
}

export default React.memo(HLSIngest);