const EventEmitter = require('events');
const ffmpeg = require('fluent-ffmpeg');
const log = require('electron-log');

const {getDefaultConfig} = require('./getConfig'); 
const config = getDefaultConfig();
const inputOptions = config.FFMPEG_INPUT_OPTIONS;
// const outputOptions = config.FFMPEG_OPTIONS.OUTPUT;

const sameAsBefore = initialValue => {
    let previousValue = initialValue;
    return currentValue => {
        if(previousValue !== currentValue){
            previousValue = currentValue;
            return false;
        }
        return true;
    }
}

const successiveEvent = (checkFunction,logger=console) => {
    let occurred = 0;
    return (value, limit) => {
        if(checkFunction(value)){
            occurred ++;
        } else {
            occurred = 0;
        }
        if(occurred === limit){
            return true;
        }
        logger.debug(`check successiveEvent : ${value} - ${occurred}`);
        return false;   
    }
}

const FFMPEG_QUIT_TIMEOUT = 3000
class RecoderHLS extends EventEmitter {
    constructor(options){
        super();
        const {
            channelNumber=1,
            name='channel1',
            src='', 
            target='target.mp4', 
            targetOptions=[],
            enablePlayback=false, 
            ffmpegBinary='./ffmpeg.exe',
            renameDoneFile=false,
            // activeSource=''
        } = options;
        this._channelNumber = channelNumber;
        this._name = name;
        this._src = src;
        this._target = target;
        this._targetOptions = targetOptions;
        this._createTime = Date.now();
        this._enablePlayback = enablePlayback;
        this._ffmpegBinary = ffmpegBinary;
        this._renameDoneFile = renameDoneFile;
        this._killTimer = null;
        this._exitByTimeout = false;
        this._command = null;

        ffmpeg.setFfmpegPath(this._ffmpegBinary);
        this.log = (() => {
            return {
                debug : msg => log.debug(`[${this._name}][RecordHLS_ffmpeg]${msg}`),
                info  : msg => log.info(`[${this._name}][RecordHLS_ffmpeg]${msg}`),
                warn  : msg => log.warn(`[${this._name}][RecordHLS_ffmpeg]${msg}`),
                error : msg => log.error(`[${this._name}][RecordHLS_ffmpeg]${msg}`)
              }
        })()
        this.INITIAL_TIMEMARKER =  '00:00:00.00';
        const checkFunction = sameAsBefore(this.INITIAL_TIMEMARKER);
        this.checkSuccessiveEvent = successiveEvent(checkFunction, this.log);
        this.initialize();
    }

    initialize = () => {
        this._isPreparing = false;
        this._isRecording = false;
        this._bytesRecorded = 0;
        this._durationRecorded = this.INITIAL_TIMEMARKER;
        this._startTime = null;
        this._rStream = null;
        this._killTimer = null;
        this._exitByTimeout = false;
        // this._command = null;
        this.command && this.command.removeListener('start', this.startHandler)
        this.log.info(`recoder initialized...`)
    }

    get channelNumber() { return this._channelNumber }
    get name() { return this._name }
    get src() { return this._src }
    get target() { return this._target }
    get targetOptions() { return this._targetOptions }
    get enablePlayback() { return this._enablePlayback }
    get renameDoneFile() { return this._renameDoneFile }
    get isRecording() { return this._isRecording }
    get isPreparing() { return this._isPreparing }
    get startTime() { return this._startTime }
    get createTime() { return this._createTime }
    get bytesRecorded() { return this._bytesRecorded }
    get duration() { return this._durationRecorded }
    get rStream() { return this._rStream }
    get wStream() { return this._wStream }
    get command() { return this._command }
    get killTimer() { return this._killTimer }
    get exitByTimeout() { return this._exitByTimeout}
    get elapsed() { 
        const elapsedMS = Date.now() - this.startTime;
        return elapsedMS > 0 ? elapsedMS : 0;
    }
    get isBusy() { 
        return this.isRecording || this.isPreparing 
    }  
    set src(url) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._src = url;
    }
    set target(target) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._target = target;
    }   
    set targetOptions(options) { 
        if(this.isBusy) throw new Error("because recorder is busy, can't change");
        this._targetOptions = options;
    }   
    set command(cmd) { this._command = cmd }
    set isRecording(bool) { this._isRecording = bool }
    set isPreparing(bool) { this._isPreparing = bool }
    set startTime(date) { this._startTime = date }
    set createTime(date) { this._createTime = date }
    set rStream(stream) { this._rStream = stream }
    set wStream(stream) { this._wStream = stream }
    set bytesRecorded(bytes) { this._bytesRecorded = bytes }
    set duration(duration) { 
        this._durationRecorded = duration;
        // this.emit('progress', {
        //     bytes: this.bytesRecorded,
        //     duration: this.duration
        // })
    };
    set killTimer(timer) { this._killTimer = timer}
    set exitByTimeout(bool) { this._exitByTimeout = bool}

    onFFMPEGEnd = (error) => {
        this.log.info(`ffmpeg ends! : ${this.target}`);
        clearTimeout(this.killTimer);
        if(error && !this.exitByTimeout){
            this.log.error(`ended abnormally: startime =${this.startTime}:duration=${this.duration}`);
            this.initialize();            
            this.emit('error', error);
            this.emit('end', this.target, this.startTime, this.duration, error)
            return
        }
        if(this.exitByTimeout){
            this.log.error(`ended by timeout!`)
        }
        this.log.info(`ended ${this.startTime}:${this.duration}`)
        this.emit('end', this.target, this.startTime, this.duration)
        this.initialize();
    }
    onReadStreamClosed = () => {
        this.log.info(`read stream closed : ${this.src}`);
    }
    startHandler = cmd => {
        this.log.info(`started: ${cmd}`);
        this.isPreparing = false;
        this.isRecording = true;
        this.startTime = Date.now();
        this.emit('start', cmd);
    }
    progressHandler = event => {
        this.duration = event.timemark;
        this.emit('progress', event);
        this.log.debug(`duration: ${this.duration}`);
        // const CRITICAL_SUCCESSIVE_OCCUR_COUNT = 5;
        // const durationNotChanged = this.checkSuccessiveEvent(this.duration, CRITICAL_SUCCESSIVE_OCCUR_COUNT);
        // this.log.debug(`value of durationNotChanged: ${durationNotChanged}, duration=${this.duration}`);
        // if(durationNotChanged){
        //     this.log.error(`duration not changed last ${CRITICAL_SUCCESSIVE_OCCUR_COUNT} times`)
        //     this.log.error(`kill ffmpeg`)
        //     this.command.kill();
        // }
    }

    start = (props) => {
        const {
            inputOpts=[],
            outputOpts=[]
        } = props
        const inputOptsMerged = [...inputOptions, ...inputOpts];
        let outputOptsMerged; 
        if(this.isBusy) {
            this.log.warn('already started!. stop first');
            throw new Error('already started!. stop first')
        }
        this.isPreparing = true;
        this.log.info(`start encoding.... ${this.src}, type: ${this.activeSource}`);

        try {
            // if file path contains back slash, ffmpeg fails. replace!
            const srcNormalized = this._src.replace(/\\/g, '/');
            // set input and input options
            this.command = ffmpeg(srcNormalized).inputOptions(inputOptsMerged); 
            // set output and output options (output can be multiple)
            const {outputs} = this.target;
            console.log('#### outputs:', outputs);
            for(let i=0; i < outputs.length; i++){
                outputOptsMerged = [...outputs[i].option, ...outputOpts];
                this.command = this.command.output(outputs[i].target).outputOptions(outputOptsMerged);  
            }
            // if(typeof(this._target) === 'string'){
            //     outputOptsMerged = [...outputOptions, ...outputOpts];
            //     this.command = this.command.output(this._target).outputOptions(outputOptsMerged);
            // } else {
            //     for(let i=0; i < this._target.length ;i++){
            //         const outputNumber = i + 1;
            //         outputOptsMerged = [...outputOptions[outputNumber.toString()], ...outputOpts];
            //         this.command = this.command.output(this._target[i]).outputOptions(outputOptsMerged);
            //     }
            // }
        } catch (error) {
            this.log.error(error.message)
        }
        this.command
        .on('start', this.startHandler)
        .on('progress', this.progressHandler)
        .on('stderr', stderrLine => {
            this.log.debug(`${stderrLine}`);
        })
        .on('error', error => {
            this.log.error(`ffmpeg error: ${error.message}`) ;
            this.onFFMPEGEnd(error);
        })
        .on('end', (stdout, stderr) => {
            // this.log.info(`[ffmpeg stdout][${this.name}]`,stdout)
            this.onFFMPEGEnd()
        })
        .run();
    }
    stop = () => {
        if(!this.isRecording){
            this.log.warn(`start recording first!. there may be premature ending of ffmpeg.`)
            this.emit('end', this.target, this.startTime, this.duration)
            this.initialize();
            return;
        }
        this.log.info(`stopping ffmpeg...`);
        // this.command.ffmpegProc.stdin.write('q');
        this.command.ffmpegProc.stdin.write('q', () =>{
            this.log.info(`write quit to ffmpeg's stdin done!`);
            this.killTimer = setTimeout(() => {
               this.log.info(`stopping ffmpeg takes too long. force stop!`);
               this.exitByTimeout = true;
               this.command.kill();
            }, FFMPEG_QUIT_TIMEOUT)
        })
    }
    destroy = () => {
        this.command && this.command.kill();
    }
}

const createHLSRecoder = options => {
    const {
        channelNumber=1,
        name= 'channel1',
        src= url,
        target='d:/temp/cctv_kbs_ffmpeg.mp4', 
        enablePlayack= true, 
        ffmpegBinary= 'd:/temp/cctv/ffmpeg.exe',
        renameDoneFile= false
    } = options;
    log.info(`create HLS Recorder!`);
    return new RecoderHLS(options);
}

const convertMP4 = (inFile, outFile, ffmpegPath) => {
    ffmpeg.setFfmpegPath(ffmpegPath);
    return new Promise((resolve, reject) => {
        const command = 
            ffmpeg(inFile)
            .outputOptions(['-c','copy']) 
            .output(outFile)
            .on('progress', progress => console.log(progress))
            .on('start', cmd => console.log('started: ',cmd))
            .on('error', error => {
                console.log(error);
                reject(error)
            })
            .on('end', (stdout, stderr) => {
                const regExp = new RegExp(/Duration: (\d\d:\d\d:\d\d.\d\d), start:/)
                const duration = regExp.exec(stderr)[1];
                resolve(duration)
            })
        command.run();
    })
}

module.exports = {
    createHLSRecoder,
    convertMP4
};












