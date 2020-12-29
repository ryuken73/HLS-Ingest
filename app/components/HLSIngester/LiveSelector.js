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
        active=true
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
                />
                <Typography variant='body1'>Live</Typography>
            </Box>

            <Box ml="5px">
                <Autocomplete
                    placeholder="area"
                    options={areas}
                    onChange={handleChangeArea}
                ></Autocomplete>
            </Box>
            <Box ml="2px">
                <Autocomplete
                    placeholder="cctv"
                    options={sources}
                    // onChange={setLiveSource}
                    onHighlightChange={setLiveSource}
                    width={300}
                ></Autocomplete>
            </Box>
        </Box>
    )
}

export default React.memo(LiveSelector)
