import React from 'react';
import Box from '@material-ui/core/Box'
import BorderedBox from './template/BorderedBox';
// import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import SettingsIcon from '@material-ui/icons/Settings';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import OptionSelect from './template/OptionSelect';
import {BasicIconButton} from './template/basicComponents';

const {remote} = require('electron');

const Header = (props) => {
    console.log('$$$$', props)
    const {setConfirmOpen} = props;
    const {BASE_DIRECTORY="c:/temp"} =  props.config;

    const {openOptionsDialog} = props.OptionDialogActions;

    const {
        scheduleStatusAllStop:scheduleStatusAllStopped,
        recorderStatusAllStop:recorderStatusAllStopped,
        scheduleStatusAllSame,
        recorderStatusAllSame,
        recorderStatusAnyInTransition,
        intervalsForSelection,
    } = props;

    const {
        startScheduleAll=()=>{},
        stopScheduleAll=()=>{},
        startRecordAll=()=>{},
        stopRecordAll=()=>{},
        changeAllIntervals=()=>{}
    } = props.HLSRecorderActions;
    console.log('$$$$$$$$', changeAllIntervals)

    const scheduleButtonColor =  scheduleStatusAllStopped ? 'grey' : 'maroon';
    const recordButtonColor =  recorderStatusAllStopped ? 'grey' : 'maroon';


    const openDialog = React.useCallback(() => {
        openOptionsDialog();
        // setOptionsDialogOpen({dialogOpen:true})
    },[])
    const reload = React.useCallback(() => {
        setConfirmOpen(true);
        // remote.getCurrentWebContents().reload();
    },[])
    const openDirectory = React.useCallback(() => {
        // remote.shell.showItemInFolder(BASE_DIRECTORY)
        remote.shell.openItem(BASE_DIRECTORY)
    },[BASE_DIRECTORY])
    return (      
        <Box 
            display="flex" 
            alignItems="center"
            bgcolor="#2d2f3b"
            mx="5px"
            mt="15px"
            alignContent="center"
            justifyContent="space-between"
        >
            <Box display="flex" alignItems="center" width="300px">
            </Box>
            <Box 
                fontFamily="Roboto, Helvetica, Arial, sans-serif" 
                textAlign="center" 
                fontSize="35px"
                // mx="5px"
                // mt="15px"
                // py="10px"
                // width="95%"
            >CCTV Ingest
            </Box>
            <Box display="flex" width="300px">
                <Box ml="auto">
                    <BasicIconButton aria-label="reload" onClick={reload}>
                        <RefreshIcon 
                            fontSize="large"
                            style={{color:"grey"}}
                        ></RefreshIcon>
                    </BasicIconButton>
                </Box>
                <Box>
                    <BasicIconButton aria-label="open directory" onClick={openDirectory}>
                        <FolderOpenIcon 
                            fontSize="large"
                            style={{color:"grey"}}
                        ></FolderOpenIcon>
                    </BasicIconButton>
                </Box>
                <Box>
                    <BasicIconButton aria-label="configuration" onClick={openDialog}>
                        <SettingsIcon 
                            fontSize="large"
                            style={{color:"grey"}}
                        ></SettingsIcon>
                    </BasicIconButton>
                </Box>
            </Box>
        </Box>  

    );
};

export default React.memo(Header);