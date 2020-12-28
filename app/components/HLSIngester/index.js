import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LiveSelector from './LiveSelector';  
import ClipSelector from './ClipSelector';  
import BorderedBox from '../template/BorderedBox';
import BorderedList from '../template/BorderedList';
import {BasicButton} from '../template/basicComponents';
import {SmallButton} from '../template/smallComponents';
import Duration from './Duration';
import HLSPlayer from './HLSPlayer';

const bgColors = {
    // 'starting': 'maroon',
    'starting': '#540101',
    'started': 'maroon',
    'stopping': '#540101',
    'stopped': 'black'
}

function HLSIngest() {
    return (
        <BorderedBox
            bgcolor="#232738"
            display="flex"
            flexDirection="column"
            flexGrow={0}
            // width={200}
            // bgcolor="#2d2f3b"
        >
            <Duration bgColors={bgColors}></Duration>
            <BorderedBox height="100px" display="flex" alignItems="center" bgcolor="#232738">
                <Box display="flex" flexDirection="column" padding="5px">
                    <Typography variant="body1">Source</Typography>
                    <LiveSelector></LiveSelector>
                    <ClipSelector></ClipSelector>
                </Box>
                <BasicButton 
                    color="secondary" 
                    variant={"contained"} 
                    bgcolor="#191d2e" 
                    height="90%" 
                    width="80%"
                >INGEST</BasicButton>
            </BorderedBox>
            <BorderedBox>
                <HLSPlayer></HLSPlayer>
            </BorderedBox>
        </BorderedBox>
    )
}

export default React.memo(HLSIngest);