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
            <Box ml="10px">
                <Autocomplete
                    placeholder="area"
                ></Autocomplete>
            </Box>
            <Box m="0px">
                <Autocomplete
                    placeholder="cctv"
                    width={300}
                ></Autocomplete>
            </Box>
        </Box>
    )
}

export default React.memo(LiveSelector)
