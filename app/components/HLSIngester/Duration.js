import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField, SmallButton}  from '../template/smallComponents';

function Duration(props) {
    // console.log('rerender Title:', props)
    const {
        channelNumber="1", 
        recorderStatus="stopped", 
        inTransition=false,
        duration="00:00:00.00",
        bgColors={}
    } = props;
    const channelName = `Ingest${channelNumber}`
    const bgColor = bgColors[recorderStatus];
    const channel = {
        subject: <Typography variant="body1">{channelName}</Typography>,
        content: (
            <Box display="flex" width="100%" m="0px"> 
                <SmallMarginTextField 
                    // width="100%"
                    variant="outlined"
                    margin="dense"
                    bgcolor={bgColor}
                    value={duration}
                    fontSize={"20px"}
                    disabled={true}
                    mt={"1px"}
                    mb={"1px"}
                ></SmallMarginTextField> 
                <SmallButton
                    ml="10px"
                    width="120px"
                    color="secondary" 
                    variant={"contained"} 
                    bgcolor="#191d2e" 
                >
                    playback
                </SmallButton>
            </Box>
        ) 
    }
    return (
        <BorderedList 
            subject={channel.subject} 
            titlewidth={"80px"}
            content={channel.content} 
            color={"white"}
            border={1}
            ml={"3px"}
            my={"2px"}
            bgcolor={"#232738"}
        ></BorderedList>
    )
}

export default  React.memo(Duration)