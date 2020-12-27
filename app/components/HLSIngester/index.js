import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LiveSelector from './LiveSelector';  
import ClipSelector from './ClipSelector';  
import BorderedBox from '../template/BorderedBox';
import BorderedList from '../template/BorderedList';
import {BasicButton} from '../template/basicComponents';
import Duration from './Duration';

function HLSIngest() {
    return (
        <BorderedBox
            bgcolor="#232738"
            width={600}
            // bgcolor="#2d2f3b"
        >
            <Duration></Duration>
            <BorderedBox display="flex" alignItems="center" bgcolor="#232738">
                <Box 
                    display="flex"
                    flexDirection="column"
                    padding="5px"
                >
                    <Typography variant="body1">Source</Typography>
                    <LiveSelector></LiveSelector>
                    <ClipSelector></ClipSelector>
                </Box>
                <Box ml="auto" height={1}>
                    <BasicButton>INGEST</BasicButton>
                </Box>
            </BorderedBox>
            <BorderedBox>
                preview
            </BorderedBox>
        </BorderedBox>
    )
}

export default React.memo(HLSIngest);