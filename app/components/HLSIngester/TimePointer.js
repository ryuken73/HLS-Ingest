import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField, SmallButton}  from '../template/smallComponents';

function TimePointer(props) {
    // console.log('rerender Title:', props)
    const {
        channelNumber="1", 
        recorderStatus="stopped", 
        inTransition=false,
        startTime=0,
        stopTime=100,
        bgColors={},
        timeInputDisabled=false
    } = props;
    const pointerName = `In-Out [${channelNumber}]`
    const bgColor = bgColors['stopped'];
    const textColor = timeInputDisabled ? 'darkslategrey' : 'white';
    const channel = {
        subject: <Box ml={"3px"}><Typography variant="body1">{pointerName}</Typography></Box>,
        content: (
            <Box display="flex" width="500px" m="0px"> 
                <Box display="flex" width="100%" m="0px" alignItems="center">
                    <Box width="80px">
                        <Typography>In Time</Typography>
                    </Box>
                    <SmallMarginTextField 
                        width="163px"
                        variant="outlined"
                        margin="dense"
                        bgcolor={bgColor}
                        value={startTime}
                        fontSize={"20px"}
                        disabled={timeInputDisabled}
                        mt={"1px"}
                        mb={"1px"}
                        ml={"10px"}
                        height={"90%"}
                        textColor={textColor}
                    ></SmallMarginTextField> 
                </Box>
                <Box display="flex" width="100%" m="0px" alignItems="center">
                    <Box ml="20px" width="80px">
                        <Typography>Out Time</Typography>
                    </Box>
                    <SmallMarginTextField 
                        width="162px"
                        variant="outlined"
                        margin="dense"
                        bgcolor={bgColor}
                        value={stopTime}
                        fontSize={"20px"}
                        disabled={timeInputDisabled}
                        mt={"1px"}
                        mb={"1px"}
                        ml={"10px"}
                        height={"90%"}
                        textColor={textColor}
                    ></SmallMarginTextField> 
                </Box>
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

export default  React.memo(TimePointer)