import React from 'react';
import DraggabeDialog from './template/basicComponents/DraggableDialog';
const {remote} = require('electron');

function ConfirmDialog(props) {
    const {open, setOpen} = props;
    const {dialogTitle = "Really Reload?"} = props
    const {dialogText = "Reload will stop current recordings and schedules. OK?"} = props;
    const reload = React.useCallback(() => {
        remote.getCurrentWebContents().reload();
    },[])
    return (
        <DraggabeDialog
            open={open}
            setOpen={setOpen}
            dialogTitle={dialogTitle}
            dialogText={dialogText}
            replyOK={reload}
        >           
        </DraggabeDialog>
    )
}

export default React.memo(ConfirmDialog);
