import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import {BasicTextField} from './basicComponents';

export default function Highlights(props) {
  const {
      placeholder="type text",
      width=100,
      options=[],
      fontSize="12px",
      autoComplete=true,
      onChange=(event, newValue) => {
        console.log(newValue)
      },
      onHighlightChange=()=>{},
      color="white"
  } = props;

  return (
    <Autocomplete
      {...props}
      id="highlights-demo"
      size="small"
      style={{ width: width }}
      autoComplete={autoComplete}
      options={options}
      getOptionLabel={(option) => option.title}
      onChange={onChange}
      onHighlightChange={onHighlightChange}
      renderInput={(params) => (
        <BasicTextField 
            {...params} 
            size="small" 
            label={placeholder} 
            variant="outlined" 
            margin="small" 
            fontSize={fontSize}
            color={color}
        />
      )}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.title, inputValue);
        const parts = parse(option.title, matches);

        return (
          <div>
            {parts.map((part, index) => (
              <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                {part.text}
              </span>
            ))}
          </div>
        );
      }}
    />
  );
}