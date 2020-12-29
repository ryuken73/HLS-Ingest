import React from 'react';
import Box from '@material-ui/core/Box';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import HeaderContainer from '../containers/HeaderContainer';
import HLSIngest from './HLSIngester';
import MessageContainer from './MessagePanel';

const theme = createMuiTheme({
  typography: {
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      fontSize: 12,
      fontWeight: 500, 
    }
  }
});

const {getDefaultConfig} = require('../lib/getConfig');
const config = getDefaultConfig();
const {AUTO_UPDATE_CLIP=true} = config;

function App(props) { 
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('Really Reload?');
  const [dialogText, setDialogText] = React.useState('Reload will stop current recordings and schedules. OK?');
  const {channels=[1,2]} = props;
  const {setBaseClips=()=>{}} = props.ClipSelectorActions;

  const {createClipData} = require('../lib/clipInfo');
  const getClipData = (clipStore) => {
    const savedClipsObj = clipStore.store;
    const savedClipsArray = Object.values(savedClipsObj)
    return savedClipsArray.map(clip => createClipData(clip))
  }
  const makeBaseClips = savedClips => {
      const {NUMBER_OF_CHANNELS} = config;    
      const baseClips = new Map();
      for(let channelNumber=1;channelNumber<=NUMBER_OF_CHANNELS;channelNumber++){
          baseClips.set(channelNumber, savedClips)
      }
      return baseClips;
  }

  React.useEffect(() => {
      // get saved clip list
      const Store = require('electron-store');
      const {remote} = require('electron');
      const clipStore = new Store({
          name:'clipStore',
          cwd:remote.app.getPath('home'),
          watch: AUTO_UPDATE_CLIP
      });

      clipStore.onDidAnyChange((newValue) => {
          const savedClips = getClipData(clipStore);
          const baseClips = makeBaseClips(savedClips);
          setBaseClips({baseClips});
      })
  },[])
  
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" height="1">
        <Box display="flex">
          {channels.map(channelNumber => (<HLSIngest key={channelNumber} channelNumber={channelNumber}></HLSIngest>))}
        </Box>
        <MessageContainer mt="auto"></MessageContainer> 
      </Box>
    </ThemeProvider>
  );
}

export default App;
   