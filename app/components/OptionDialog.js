import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import OptionTextInput from './template/OptionTextInput';
import OptionRadioButton from './template/OptionRadioButton';
import FolderIcon  from '@material-ui/icons/Folder';
import {SmallPaddingIconButton} from './template/smallComponents';
import utils from '../utils';

const { dialog } = require('electron').remote;

const INPUT_WIDTH='400px'
const SUBTITLE_WIDTH='25%';

const OptionTextInputWithDefault = props => {
  const {children} = props;
  return <OptionTextInput 
            subTitleWidth={SUBTITLE_WIDTH} 
            inputWidth={INPUT_WIDTH} 
            border="0" 
            color="black" 
            bgcolor="white" 
            textColor="black" 
            textalign="left"
            {...props}
          >
            {children}
          </OptionTextInput>
}

const boolLabels = [
  {value: 'YES', label: 'YES'},
  {value: 'NO', label: 'NO'}
]

const OptionRadioButtonWithDefault = props => {
  const {children} = props;
  return <OptionRadioButton 
          titlewidth={SUBTITLE_WIDTH} 
          formlabels={boolLabels} 
          border="0" 
          color="black" 
          bgcolor='white' 
          {...props}
        >
          {children}
        </OptionRadioButton>
}

export default function OptionDialog(props) {
  console.log('######################## re-render OptionDialog', props);
  const [valueChanged, setValueChanged] = React.useState(false);
  const {setConfirmOpen, setDialogTitle, setDialogText} = props;
  const {title="Dialog Box"} = props;
  const {dialogOpen=true, config} = props;
  const {
    BASE_DIRECTORY="c:/temp",
    CHANNEL_PREFIX="channel",
    WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE,
    LONG_BUFFERING_MS_SECONDS,
    SLEEP_MS_BETWEEN_ALL_START,
    SLEEP_MS_BETWEEN_ALL_STOP,
    NUMBER_OF_CHANNELS,
    DEFAULT_PLAYER_PROPS,
    KEEP_SAVED_CLIP_AFTER_HOURS,
    DELETE_SCHEDULE_CRON
  } = config;
  const {deleteOnClose=()=>{}} = props;
  const {setOptionsDialogOpen=()=>{}, saveConfig=()=>{}} = props.OptionDialogActions;
  const {setDefaultConfig=()=>{}} = props.OptionDialogActions;
  const {setAllOptions=()=>{}} = props;
  const {
    setBaseDirectory=()=>{},
    setChannelPrefix=()=>{},
    setLongBufferSceonds=()=>{},
    setSleepBetweenStart=()=>{},
    setSleepBetweenStop=()=>{},
    setNumberOfChannels=()=>{},
    setKeepClipsAfterHours=()=>{},
    setWaitSecondsBeforePlayback=()=>{},
    setDeleteScheduleCron=()=>{}
  } = props.OptionDialogActions;

  const [scroll, setScroll] = React.useState('paper');

  const actionFunctions = {
    'saveDir': setBaseDirectory,
    'channelPrefix': setChannelPrefix,
    'longBufferSeconds': setLongBufferSceonds,
    'sleepBetweenStart': setSleepBetweenStart,
    'sleepBetweenStop': setSleepBetweenStop,
    'numberOfChannels': setNumberOfChannels,
    'saveClipAfterHours': setKeepClipsAfterHours,
    'waitSecondsForPlayback': setWaitSecondsBeforePlayback,
    'deleteScheduleCron': setDeleteScheduleCron
  }

  const onChange = type => {
    return event => {
      setValueChanged(true);
      console.log(type, event.target.value);
      actionFunctions[type](event.target.value);
    }
  }   

  const handleClose = () => {
    setOptionsDialogOpen({dialogOpen:false});
  };

  const onClickSelectSaveDirectory = () => {
    dialog.showOpenDialog(({properties:['openDirectory']}), filePaths=> {
      if(filePaths === undefined) return;
      setBaseDirectory(filePaths[0]);      
    })
  };
 
  const onClickSaveBtn = () => {
    saveConfig({config});
    handleClose();
    if(valueChanged){
      setConfirmOpen(true);
      setDialogTitle('Reload Required!')
      setDialogText(`
        Reload is required for changes to take effect.
        scheduled recording will be stopped!
      `)
    }
  }

  const SaveDirectoryButton = (
    <SmallPaddingIconButton 
        onClick={onClickSelectSaveDirectory} 
        aria-label="select save directory button"
        iconcolor="black"
      >
        <FolderIcon fontSize="small" />
    </SmallPaddingIconButton>)


  return (
    
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      scroll={scroll}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      fullWidth
    >
    <DialogTitle id="scroll-dialog-title">
      {title}
    </DialogTitle>
    <DialogContent dividers={scroll === 'paper'}>
      <DialogContentText
        id="scroll-dialog-description"
        tabIndex={-1}
      >
        <OptionTextInputWithDefault subtitle='Number of Recorders' value={NUMBER_OF_CHANNELS} onChange={onChange('numberOfChannels')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Channel Prefix' value={CHANNEL_PREFIX} onChange={onChange('channelPrefix')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Clip Keeping Hours(hh)' value={KEEP_SAVED_CLIP_AFTER_HOURS} onChange={onChange('saveClipAfterHours')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Long Buffering(ms)' value={LONG_BUFFERING_MS_SECONDS} onChange={onChange('longBufferSeconds')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Wait for Playback(ms)' value={WAIT_SECONDS_MS_FOR_PLAYBACK_CHANGE} onChange={onChange('waitSecondsForPlayback')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Delay All Starting(ms)' value={SLEEP_MS_BETWEEN_ALL_START} onChange={onChange('sleepBetweenStart')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Delay All Stopping(ms)' value={SLEEP_MS_BETWEEN_ALL_STOP} onChange={onChange('sleepBetweenStop')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Delete Schedule Cron' value={DELETE_SCHEDULE_CRON} onChange={onChange('deleteScheduleCron')}></OptionTextInputWithDefault>
        <OptionTextInputWithDefault subtitle='Save Directory' value={BASE_DIRECTORY} onChange={onChange('saveDir')} iconButton={SaveDirectoryButton}></OptionTextInputWithDefault>
        <OptionRadioButtonWithDefault subtitle="Delete on tab close" currentvalue={deleteOnClose} onChange={onChange('deleteOnClose')}></OptionRadioButtonWithDefault>
        
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button style={{marginRight:'auto'}} onClick={setDefaultConfig} color="primary">
        Default
      </Button>
      <Button onClick={handleClose} color="primary">
        Cancel
      </Button>
      <Button onClick={onClickSaveBtn} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
  )
}
