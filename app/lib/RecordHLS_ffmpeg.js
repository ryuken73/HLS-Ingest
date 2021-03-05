const EventEmitter = require('events');
const ffmpeg = require('fluent-ffmpeg');
const log = require('electron-log');

const {getDefaultConfig} = require('./getConfig'); 
const config = getDefaultConfig();
const inputOptions = config.FFMPEG_OPTIONS.INPUT;
const outputOptions = config.FFMPEG_OPTIONS.OUTPUT;

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

class RecoderHLS extends EventEmitter {
    constructor(options){
        super();
        const {
            name='channel1',
            src='', 
            target='target.mp4', 
            enablePlayback=false, 
            ffmpegBinary='./ffmpeg.exe',
            renameDoneFile=false,
            startTimeSeconds=0,
            stopTimeSeconds=null,
            activeSource=''
        } = options;
        this._name = name;
        this._src = src;
        this._target = target;
        this._createTime = Date.now();
        this._enablePlayback = enablePlayback;
        this._ffmpegBinary = ffmpegBinary;
        this._renameDoneFile = renameDoneFile;
        this._ffmpegOptSS = startTimeSeconds;
        this._ffmpegOptTO = stopTimeSeconds;
        this._activeSource = activeSource;

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
        this.log.info(`recoder initialized...`)
    }

    get name() { return this._name }
    get src() { return this._src }
    get target() { return this._target }
    get enablePlayback() { return this._enablePlayback }
    get renameDoneFile() { return this._renameDoneFile }
    get isRecording() { return this._isRecording }
    get isPreparing() { return this._isPreparing }
    get startTime() { return this._startTime }
    get createTime() { return this._createTime }
    get bytesRecorded() { return this._bytesRecorded }
    get duration() { return this._durationRecorded }
    get ffmpegOptSS() { return this._ffmpegOptSS}
    get ffmpegOptTO() { return this._ffmpegOptTO}
    get activeSource() { return this._activeSource}
    get rStream() { return this._rStream }
    get wStream() { return this._wStream }
    get command() { return this._command }
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
    set command(cmd) { this._command = cmd }
    set isRecording(bool) { this._isRecording = bool }
    set isPreparing(bool) { this._isPreparing = bool }
    set startTime(date) { this._startTime = date }
    set createTime(date) { this._createTime = date }
    set rStream(stream) { this._rStream = stream }
    set wStream(stream) { this._wStream = stream }
    set bytesRecorded(bytes) { this._bytesRecorded = bytes }
    set ffmpegOptSS(startTimme) { this._ffmpegOptSS = startTimme }
    set ffmpegOptTO(stopTime) { this._ffmpegOptTO = stopTime }
    set activeSource(source) { return this._activeSource = source}
    set duration(duration) { 
        this._durationRecorded = duration;
        // this.emit('progress', {
        //     bytes: this.bytesRecorded,
        //     duration: this.duration
        // })
    };

    onFFMPEGEnd = (error) => {
        this.log.info(`ffmpeg ends! : ${this.target}`);
        if(error){
            this.log.error(`ended abnormally: startime =${this.startTime}:duration=${this.duration}`);
            this.initialize();            
            this.emit('error', error);
            this.emit('end', this.target, this.startTime, this.duration, error)
            return
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

    start = () => {
        if(this.isBusy) {
            this.log.warn('already started!. stop first');
            throw new Error('already started!. stop first')
        }
        this.isPreparing = true;
        this.log.info(`start encoding.... ${this.src}, type: ${this.activeSource}`);
        const ssAddedOptions = this.activeSource === 'live' ? [...inputOptions]
                              : [...inputOptions, '-ss', this.ffmpegOptSS];
        const toAddedOptions = this.activeSource === 'live' ? [...ssAddedOptions]
                              :[...ssAddedOptions, '-to', this.ffmpegOptTO];
        try {
            // if file path contains back slash, ffmpeg fails. replace!
            const srcNormalized = this._src.replace(/\\/g, '/');
            this.command = ffmpeg(srcNormalized).inputOptions(toAddedOptions);
            if(typeof(this._target) === 'string'){
                this.command = this.command.output(this._target).outputOptions(outputOptions);
            } else {
                for(let i=0; i < this._target.length ;i++){
                    this.command = this.command.output(this._target[i]).outputOptions(outputOptions);
                }
            }
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
        this.command.ffmpegProc.stdin.write('q');
    }
    destroy = () => {
        this.command && this.command.kill();
    }
}

const createHLSRecoder = options => {
    const {
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












