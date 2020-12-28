import React from 'react';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import { Typography } from '@material-ui/core';
import Autocomplete from '../template/AutoComplete'

function LiveSelector(props) {
    const {
        areas=[],
        sources=[]
    } = props;
    const {
        limitSources
    } = props.LiveSelectorActions
    const handleChange = () => {};
    const handleChangeArea = (event, value) => {
        limitSources(value)
    }
    const setLiveSource = (event, value) => {
        console.log(value)
    }
    return (
        <Box
            display="flex"
            alignItems="center"
        >
            <Box display="flex" alignItems="center" width="80px">
                <Radio
                    checked={true}
                    onChange={handleChange}
                    value="a"
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
                    onChange={setLiveSource}
                    width={300}
                ></Autocomplete>
            </Box>
        </Box>
    )
}

export default React.memo(LiveSelector)
