import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField, SmallButton}  from '../template/smallComponents';

function Duration(props) {
    console.log('rerender Duration:', props)
    const {
        channelNumber="1", 
        recorderStatus="stopped", 
        inTransition=false,
        duration="00:00:00.00",
        remains="00:00:00.00",
        bgColors={}
    } = props;
    // const channelName = `Ingest[${channelNumber}]`
    const channelName = `Ingest`
    const bgColor = bgColors[recorderStatus];
    const channel = {
        subject: <Box ml={"3px"}><Typography variant="body1">{channelName}</Typography></Box>,
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
                <Box display="flex" flexDirection="column" ml="10px" mr="2px" alignItems="center">
                    <Typography style={{fontSize:"8px"}}>
                        Remains
                    </Typography>
                    <SmallMarginTextField
                        variant="outlined"
                        margin="dense"
                        bgcolor={bgColor}
                        value={remains}
                        disabled={true}
                        fontSize={"12px"}
                        width="110px"
                        pt="3px"
                        pb="3px"
                        height="auto"
                    >                    
                    </SmallMarginTextField>
                </Box> 

                {/* <SmallButton
                    ml="10px"
                    width="120px"
                    color="secondary" 
                    variant={"contained"} 
                    bgcolor="#191d2e" 
                >
                    playback
                </SmallButton> */}
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