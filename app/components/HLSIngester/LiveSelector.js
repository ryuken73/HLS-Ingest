import React from 'react';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import { Typography } from '@material-ui/core';
import Autocomplete from '../template/AutoComplete';
const utils = require('../../utils');
const {debounce} = utils.fp;

function LiveSelector(props) {
    const {
        channelNumber,
        areas=[],
        sources=[],
        active=true,
        disabled=false,
        diableSourceSelector=false
    } = props;
    
    const {
        limitSources=()=>{},
        setCurrentSource=()=>{}
    } = props.LiveSelectorActions;

    const deboucedSetCurrentSource = debounce(300, setCurrentSource);
    const {changePlayerSource=()=>{}} = props.HLSPlayersActions;
    const debouncedChangePlayerSource = debounce(300, changePlayerSource);
    const {setChannelActiveSource=()=>{}} = props.ActiveSourcesActions;

    
    const handleChange = (event) => {
        setChannelActiveSource({channelNumber, sourceFrom: event.target.value});
    };    
    const handleChangeArea = (event, value) => {
        limitSources(channelNumber, value)
    };
    const setLiveSource = (event, value) => {
        // console.log(value)
        deboucedSetCurrentSource({channelNumber, channelSource:value});
        debouncedChangePlayerSource({channelNumber, source:value, sourceType:'live'});
    };

    const AutoCompleteColor = disabled ? "darkslategrey" : "white";

    return (
        <Box
            display="flex"
            alignItems="center"
        >
            <Box display="flex" alignItems="center" width="80px">
                <Radio
                    checked={active}
                    onChange={handleChange}
                    value="live"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': 'A' }}
                    size="small"
                    disabled={diableSourceSelector}
                />
                <Typography variant='body1'>Live</Typography>
            </Box>

            <Box ml="5px">
                <Autocomplete
                    disabled={disabled}
                    placeholder="Area"
                    options={areas}
                    fontSize="10px"
                    onChange={handleChangeArea}
                    color={AutoCompleteColor}
                ></Autocomplete>
            </Box>
            <Box ml="2px">
                <Autocomplete
                    disabled={disabled}
                    placeholder="Live CCTV"
                    options={sources}
                    // onChange={setLiveSource}
                    onHighlightChange={setLiveSource}
                    width={300}
                    fontSize="10px"
                    color={AutoCompleteColor}
                ></Autocomplete>
            </Box>
        </Box>
    )
}

export default React.memo(LiveSelector)
