import React from 'react';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import { Typography } from '@material-ui/core';
import Autocomplete from '../template/AutoComplete';
const utils = require('../../utils');
const {debounce} = utils.fp;

function ClipSelector(props) {
    const {
        channelNumber='x',
        hours=[],
        areas=[],
        clips=[],
        currentClip={},
        active=true,
        disabled=false,
        diableSourceSelector=false,
        withinHour=6
    } = props;

    const {
        // updateCurrentClips=()=>{},
        limitSources=()=>{},
        setWithinHours=()=>{},
        setCurrentClip=()=>{}
    } = props.ClipSelectorActions;

    const deboucedSetCurrentClip = debounce(300, setCurrentClip);
    const {changePlayerSource=()=>{}} = props.HLSPlayersActions;
    const debouncedChangePlayerSource = debounce(300, changePlayerSource);
    const {setChannelActiveSource=()=>{}} = props.ActiveSourcesActions;

    const handleChange = (event) => {
        setChannelActiveSource({channelNumber, sourceFrom: 'clip'});
        changePlayerSource({channelNumber, source:currentClip, sourceType:'clip'})
    };
    const handleChangeArea = (event, value) => {
        limitSources(channelNumber, value)
    };
    const handleChangeHour = (event, value) => {
        // updateCurrentClips(channelNumber, value)
        setWithinHours({channelNumber, hours: value})
    }
    const setClipSource = (event, value) => {
        // setCurrentClip({channelNumber, clipInfo: value});
        deboucedSetCurrentClip({channelNumber, clipInfo: value});
        debouncedChangePlayerSource({channelNumber, source:value, sourceType:'clip'});
    }

    const AutoCompleteColor = active ? "white" : "darkslategrey";

    return (
        <Box
            display="flex"
            alignItems="center"
        >
            <Box display="flex" alignItems="center" width="80px">
                <Radio
                    checked={active}
                    onChange={handleChange}
                    value="clip"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': 'A' }}
                    size="small"
                    disabled={diableSourceSelector}
                />
                <Typography variant='body1'>Clip</Typography>
            </Box>
            {/* <Box ml="5px">
                <Autocomplete
                    disabled={disabled}
                    placeholder="Hour"
                    options={hours}
                    fontSize="10px"
                    onChange={handleChangeHour}
                    color={AutoCompleteColor}
                ></Autocomplete>
            </Box> */}
            <Box ml="5px">
                <Autocomplete
                    disabled={disabled}
                    onFocus={handleChange}
                    placeholder="Area"
                    options={areas}
                    fontSize="10px"
                    onChange={handleChangeArea}
                    color={AutoCompleteColor}
                    autoSelect
                ></Autocomplete>
            </Box>
            <Box ml="2px">
                <Autocomplete
                    disabled={disabled}
                    onFocus={handleChange}
                    placeholder={`Saved Clip(${clips.length})`}
                    options={clips}
                    // onChange={setClipSource}
                    onHighlightChange={setClipSource}
                    width={"300px"}
                    fontSize="10px"
                    color={AutoCompleteColor}
                    autoSelect
                ></Autocomplete>
            </Box>
        </Box>
    )
}

export default React.memo(ClipSelector)
