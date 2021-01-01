const moment = require('moment');

class Clip {
    constructor(clipInfo){
        this.clipInfo = {...clipInfo};
    }
    get sourceTitle(){return this.clipInfo.title}
    get title(){
        const {title, duration, startTime, endTime} = this.clipInfo;
        const startHHMMSS = moment(startTime.split('-')[1],"hmmss").format("HH:mm:ss");
        const endHHMMSS = moment(endTime.split('-')[1],"hmmss").format("HH:mm:ss");
        const durationNormailzed = duration.replace(/\.\d\d$/, '');
        return `${startHHMMSS}_[${durationNormailzed}]_${title}`;
    }
    get url(){return this.clipInfo.hlsm3u8}
}

const createClipData = clipInfo => {
    return new Clip(clipInfo);
}

module.exports = {
    createClipData
}