import React from 'react';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import { Typography } from '@material-ui/core';
import Autocomplete from '../template/AutoComplete'

function LiveSelector() {
    const handleChange = () => {};
    return (
        <Box
            display="flex"
            alignItems="center"
        >
            <Radio
                checked={true}
                onChange={handleChange}
                value="a"
                name="radio-button-demo"
                inputProps={{ 'aria-label': 'A' }}
                size="small"
            />
            <Typography variant='body1'>Live</Typography>
            <Autocomplete
                placeholder="area"
            ></Autocomplete>
            <Autocomplete
                placeholder="cctv"
                width={300}
            ></Autocomplete>
        </Box>
    )
}

export default React.memo(LiveSelector)
