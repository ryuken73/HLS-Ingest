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

function App(props) { 
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('Really Reload?');
  const [dialogText, setDialogText] = React.useState('Reload will stop current recordings and schedules. OK?');
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" height="1">
        <HeaderContainer 
          setConfirmOpen={setConfirmOpen}
        ></HeaderContainer>
        <HLSIngest></HLSIngest>
        <MessageContainer mt="auto"></MessageContainer> 
      </Box>
    </ThemeProvider>
  );
}

export default App;
   