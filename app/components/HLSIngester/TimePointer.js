import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BorderedList from '../template/BorderedList';
import {SmallMarginTextField, SmallButton}  from '../template/smallComponents';

const VerticalCell = (props) => {
    const {
        tTitle="title",
        tProps={}, 
        iWidth="163px",
        iBgColorIn="white", 
        iValue="input value", 
        iFontSize="15px",
        iTextColor="black", 
        iOnFocus=()=>{}, 
        iOnBlur=()=>{}, 
        iProps={},
        iDisabled=false
    } = props

    return (
        <Box display="flex" flexDirection="column" width="100%" m="3px" alignItems="center">
            <Box border>
                <Typography style={{fontSize:"10px"}} {...tProps}>{tTitle}</Typography>
            </Box>
            <SmallMarginTextField 
                width={iWidth}
                variant="outlined"
                margin="dense"
                bgcolor={iBgColorIn}
                value={iValue}
                fontSize={iFontSize}
                disabled={iDisabled}
                mt={"1px"}
                mb={"1px"}
                ml={"10px"}
                height={"90%"}
                textColor={iTextColor}
                onFocus={iOnFocus}
                onBlur={iOnBlur}
                {...iProps}
            ></SmallMarginTextField> 
        </Box>
    )
}

function TimePointer(props) {
    // console.log('rerender Title:', props)
    const {
        channelNumber="1", 
        recorderStatus="stopped", 
        inTransition=false,
        startTime="00:00:00.00",
        stopTime="00:00:00.00",
        durationTime="00:00:00.00",
        bgColors={},
        timeInputDisabled=false
    } = props;
    const {
        setTimeInputFocused
    } = props.HLSRecorderActions;
    const [bgColorIn, setBgColorIn] = React.useState(bgColors['stopped']);
    const [bgColorOut, setBgColorOut] = React.useState(bgColors['stopped']);
    const setBgColorMap = {
        'startTimeFocused': setBgColorIn,
        'stopTimeFocused': setBgColorOut
    }

    const setFocused = React.useCallback( (type, focused) => {
        return event => {
            if(focused === true) setBgColorMap[type]('darkslategrey');
            if(focused === false) setBgColorMap[type](bgColors['stopped']);
            setTimeInputFocused({
                channelNumber,
                type,
                focused
            })
        }
    })
    // const pointerName = `Set Time [${channelNumber}]`
    const pointerName = `Set Time`
    // const bgColor = bgColors['stopped'];
    const textColor = timeInputDisabled ? 'darkslategrey' : 'white';
    const durationTextColor = timeInputDisabled ? 'darkslategrey' : 'yellow';
    const channel = {
        subject: <Box ml={"3px"}><Typography variant="body1">{pointerName}</Typography></Box>,
        content: (
            <Box display="flex" width="500px" m="0px"> 
                <VerticalCell
                    tTitle="IN"
                    iBgColorIn={bgColorIn}
                    iValue={startTime}
                    iTextColor={textColor}
                    iOnFocus={setFocused('startTimeFocused', true)}
                    iOnBlur={setFocused('startTimeFocused', false)}
                    iDisabled={timeInputDisabled}
                >
                </VerticalCell>
                <VerticalCell
                    tTitle="OUT"
                    iBgColorIn={bgColorOut}
                    iValue={stopTime}
                    iTextColor={textColor}
                    iOnFocus={setFocused('stopTimeFocused', true)}
                    iOnBlur={setFocused('stopTimeFocused', false)}
                    iDisabled={timeInputDisabled}
                >
                </VerticalCell>
                <VerticalCell
                    tTitle="DURATION"
                    iWidth="150px"
                    iBgColorIn={bgColors['stopped']}
                    iValue={durationTime}
                    iTextColor={durationTextColor}
                    iDisabled={true}
                >
                </VerticalCell>
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