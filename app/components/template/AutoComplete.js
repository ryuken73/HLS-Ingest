import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import {BasicTextField} from './basicComponents';

export default function Highlights(props) {
  const {
      placeholder="type text",
      width=100
  } = props;
  return (
    <Autocomplete
      id="highlights-demo"
      style={{ width: width }}
      options={cctvs}
      getOptionLabel={(option) => option.title}
      onChange={(event, newValue) => {
        console.log(newValue)
      }}
      renderInput={(params) => (
        <BasicTextField 
            {...params} 
            size="small" 
            label={placeholder} 
            variant="outlined" 
            margin="small" 
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

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const cctvs = [
    {
      "area": "서울",
      "title": "서울 마포구 성산교",
      "url": "https://cctvsec.ktict.co.kr/9965/e9kLhEFmUD4LN5nutFjuZHnD9JrGKrFt75U6ttodXKVg8OTT6ti+Mhl7lQnZZywM2h56Ksu/xP9wUIQeftwdEA=="
    },
    {
      "area": "부산",
      "title": "부산 동래구 세병교:온천천",
      "url": "https://cctvsec.ktict.co.kr/9967/18K2VXgcUTnVklZg6zyPwbLSXYDtSnZMuH5LjkidcAZ+s06yKlFBe0fL8i7ywcEcGcnsCN8bUr6YDpMaTKupqA=="
    },
    {
      "area": "대구",
      "title": "대구 동구 신천",
      "url": "https://cctvsec.ktict.co.kr/9969/yS5hqESl1h3lDyHenHKZwjyV0cTQrKL/W7+XJ7yT++B8tTHu7XgfkT9SdQ+xS69KeLIQEDz2snB3pCArK+aixg=="
    },
    {
      "area": "전북",
      "title": "전북 남원시 뱀사골(지리산)",
      "url": "https://cctvsec.ktict.co.kr/9971/JZPSStTa9uhQihw1KwlqrXkOapWH8QK3jnJ6KjGLzeT9ZB6LOT9s45jHRinV5amDLf4V+V1jWGihdkpIylY1aQ=="
    },
    {
      "area": "서울",
      "title": "서울 서초구 양재천",
      "url": "https://cctvsec.ktict.co.kr/9973/EDmVTZMikEsoL3FE/hlxDzIZgv3bI3U+WTL6VQM/+gjbLS9pGDRiJIqVS3avl+QjG192L0JatI6VnZXBB1aBiw=="
    },
    {
      "area": "충북",
      "title": "충북 단양군 도담삼봉",
      "url": "https://cctvsec.ktict.co.kr/9975/ICjobmx8jz4Hp6H9fOW/eWy50bFrVmKQzVKftYHgEZDxmRcCIc0FVW7iAmjaWRH5k7Mf37+WeODwgfZpn3Q3xg=="
    },
    {
      "area": "전북",
      "title": "전북 군산시 비응항",
      "url": "https://cctvsec.ktict.co.kr/9979/x7hpajQYrsYH+stw265lJI2Opyg1wHSpi26FVUkLVGMdjxqncxtHBkEC60Cpd5sp8Q9/Wz3SaLQayhZTO+/FXg=="
    },
    {
      "area": "인천",
      "title": "인천 중구 연안부두",
      "url": "https://cctvsec.ktict.co.kr/9981/Wl0KImWMN79hDgZSEd+i9eC4O8WMxljGu3UUjcPTf1RD6jLLy3FF0HaCg6Z6tWfESeg+J/VA+jTGp2+0EnG7aA=="
    },
    {
      "area": "전남",
      "title": "전남 신안군 가거도",
      "url": "https://cctvsec.ktict.co.kr/9983/tLH5RkSoA0YZi0Zn9poCaOv86Xjv17tNlzXWX3wjj/Uau17quYq0nbiJLlV/aVK2IAdyyksG10ZwoQaOlFIiBA=="
    },
    {
      "area": "경남",
      "title": "경남 창원시 마산연안여객선터미널",
      "url": "https://cctvsec.ktict.co.kr/9985/X4uibtRAk1KaCH3/gnBJzwhu3YrkOeNccEcb6Vbxh4F/Z71jyFGr42rsk3lvjNvlHXW4NJzN6Xd2Ph2CyIiRSw=="
    }
  ]