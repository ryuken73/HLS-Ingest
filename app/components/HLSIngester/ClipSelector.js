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
        savedClips=[],
        active=true,
        disabled=false,
        withinHour=6
    } = props;

    const {
        // updateCurrentClips=()=>{},
        setWithinHours=()=>{},
        setCurrentClip=()=>{}
    } = props.ClipSelectorActions;

    const deboucedSetCurrentClip = debounce(300, setCurrentClip);
    const {changePlayerSource=()=>{}} = props.HLSPlayersActions;
    const debouncedChangePlayerSource = debounce(300, changePlayerSource);
    const {setChannelActiveSource=()=>{}} = props.ActiveSourcesActions;

    const handleChange = (event) => {
        setChannelActiveSource({channelNumber, sourceFrom: event.target.value});
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
                />
                <Typography variant='body1'>Clip</Typography>
            </Box>
            <Box ml="5px">
                <Autocomplete
                    disabled={disabled}
                    placeholder="HOUR"
                    options={hours}
                    fontSize="10px"
                    onChange={handleChangeHour}
                ></Autocomplete>
            </Box>
            <Box ml="2px">
                <Autocomplete
                    disabled={disabled}
                    placeholder="CLIP"
                    options={savedClips}
                    // onChange={setClipSource}
                    onHighlightChange={setClipSource}
                    width={300}
                    fontSize="10px"
                ></Autocomplete>
            </Box>
        </Box>
    )
}

export default React.memo(ClipSelector)
