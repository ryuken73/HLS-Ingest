import React from 'react';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import { Typography } from '@material-ui/core';
import Autocomplete from '../template/AutoComplete'

function ClipSelector() {
    const handleChange = () => {};
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
                <Typography variant='body1'>Clip</Typography>
            </Box>
            <Box ml="5px">
                <Autocomplete
                    placeholder="hour"
                ></Autocomplete>
            </Box>
            <Box ml="2px">
                <Autocomplete
                    placeholder="clip"
                    width={300}
                ></Autocomplete>
            </Box>
        </Box>
    )
}

export default React.memo(ClipSelector)
