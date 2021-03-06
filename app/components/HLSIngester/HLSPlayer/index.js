import React, { Component } from 'react';
import Box from '@material-ui/core/Box';
import VideoPlayer from './VideoPlayer';
import log from 'electron-log';

const Store = require('electron-store');
const store = new Store({watch: true});

const HLSPlayer = (props) => {
    console.log('rerender hlsplayer', props.player)
    const {
        player=null, 
        enableAutoRefresh=null, 
        enableOverlay=true,
        overlayContent='Default Overlay Content'
    } = props;
    const {
        channelNumber=1,
        channelName='preview',
        controls=false, 
        autoplay=true, 
        bigPlayButton=false, 
        bigPlayButtonCentered=false, 
        source={},
        type='application/x-mpegURL',
        reMountPlayer=false,
        restorePlaybackRate=true,
        LONG_BUFFERING_MS_SECONDS=3000
    } = props;
    
    const {
        setPlayer,
        refreshPlayer,
        setPlayerSeeked,
        setStartNStopPoint
    } = props.HLSPlayersActions;

    const {
        setRecorderStartTimeSeconds,
        setRecorderStopTimeSeconds,
        setClipLengthSeconds
    } = props.HLSRecordersActions;

    // todo: move below in config file
    const width=600;
    const height=340; 

    // const {
    //     setPlayer=()=>{},
    //     refreshPlayer=()=>{}
    // } = props;

    const srcObject = {
        src: source.url,
        type,
        handleManifestRedirects: true,
    }

    // make util...
    const createLogger = channelName => {
        return {
            debug: (msg) => {log.debug(`[${channelName}][player]${msg}`)},
            info: (msg) => {log.info(`[${channelName}][player]${msg}`)},
            error: (msg) => {log.error(`[${channelName}][player]${msg}`)},
        }
    }
    const channelLog = createLogger(channelName);

    channelLog.info(`[${channelName}] rerender HLSPlayer:${channelName}, restorePlaybackRate=${restorePlaybackRate}`);


    const setPlaybackRateStore = (playbackRate) => {
        store.set('playbackRate', playbackRate);
    };

    const getPlaybackRateStore = () => {
        const playbackRate = store.get('playbackRate', 1);
        return playbackRate
    };

    const onPlayerReady = player => {
        channelLog.info("Player is ready");
        console.log(player)
        setPlayer({channelNumber, player});
        if(restorePlaybackRate && player){
            const playbackRate = getPlaybackRateStore();
            console.log(`playerbackRate: ${playbackRate}`)
            player.playbackRate(playbackRate);
        }
        player.muted(true);
    }

    const onVideoPlay = React.useCallback(duration => {
        // channelLog.info("Video played at: ", duration);
    },[]);

    const onVideoPause = React.useCallback(duration =>{
        // channelLog.info("Video paused at: ", duration);
    },[]);

    const onVideoTimeUpdate =  React.useCallback(duration => {
        // channelLog.info("Time updated: ", duration);
    },[]);

    const onVideoSeeking =  React.useCallback(duration => {
        // channelLog.info("Video seeking: ", duration);
    },[]);

    const onVideoSeeked =  React.useCallback((from, to) => {
        channelLog.info(`Video seeked from ${from} to ${to}`);
        // setPlayerSeeked({channelNumber, seeked:to})
        setStartNStopPoint({channelNumber, seeked:to})
    },[])

    const onVideoError = React.useCallback((error) => {

        channelLog.error(`error occurred: ${error && error.message}`);
        if(source.url === '') return;
        // enableAutoRefresh()
    },[])

    const onVideoEnd = React.useCallback(() => {
        // channelLog.info("Video ended");
    },[])
    const onVideoCanPlay = player => {
        channelLog.info('can play');
        // setRecorderStartTimeSeconds({channelNumber, startTimeSeconds:0});
        // setRecorderStopTimeSeconds({channelNumber, stopTimeSeconds:player.duration()});
        if(restorePlaybackRate && player){
            const playbackRate = getPlaybackRateStore();
            player.playbackRate(playbackRate);
        }
    }

    let refreshTimer = null;

    const isValidStopDuration = duration => {
        return typeof(duration) === 'number' && duration !== 0 && duration !== Infinity;
    }

    const onVideoOtherEvent = (eventName, player) => {
        // channelLog.debug(`event occurred: ${eventName}`)
        if(eventName === 'durationchange'){
            setRecorderStartTimeSeconds({channelNumber, startTimeSeconds:0});
            const duration = player.duration();
            let realDuration;
            if(isValidStopDuration(duration)){
                realDuration = duration;
            } else {
                realDuration = 0;
            }
            setClipLengthSeconds({channelNumber, clipLengthSeconds: realDuration})
            setRecorderStopTimeSeconds({channelNumber, stopTimeSeconds:realDuration}) 
        }
        if(eventName === 'abort' && enableAutoRefresh !== null){
            refreshTimer = setInterval(() => {
                channelLog.info('refresh player because of long buffering')
                refreshPlayer({channelNumber});
            },LONG_BUFFERING_MS_SECONDS)
            return
        } else if(eventName === 'abort' && enableAutoRefresh === null) {
            // channelLog.debug('abort but not start refresh timer because enableAutoRefresh parameter is null');
            return
        }
        if(eventName === 'playing' || eventName === 'loadstart' || eventName === 'waiting'){
            if(refreshTimer === null) {
                // channelLog.debug('playing, loadstart or waiting event emitted. but do not clearTimeout(refreshTimer) because refreshTimer is null. exit')
                return;
            }
            // channelLog.debug('clear refresh timer.')
            clearTimeout(refreshTimer);
            refreshTimer = null;
            return
        }
        if(eventName === 'ratechange'){
            // if ratechange occurred not manually but by changing media, just return
            if(player.readyState() === 0) return;
            const currentPlaybackRate = player.playbackRate();
            setPlaybackRateStore(currentPlaybackRate);
        }
    }

    return (
        <Box>
            <VideoPlayer
                controls={controls}
                src={srcObject}
                // poster={this.state.video.poster}
                autoplay={autoplay}
                bigPlayButton={bigPlayButton}
                bigPlayButtonCentered={bigPlayButtonCentered}
                width={width}
                height={height}
                onCanPlay={onVideoCanPlay}
                onReady={onPlayerReady}
                onPlay={onVideoPlay}
                onPause={onVideoPause}
                onTimeUpdate={onVideoTimeUpdate}
                onSeeking={onVideoSeeking}
                onSeeked={onVideoSeeked}
                onError={onVideoError}
                onEnd={onVideoEnd}
                onOtherEvent={onVideoOtherEvent}
                handleManifestRedirects={true}
                liveui={true}
                enableOverlay={enableOverlay}
                overlayContent={overlayContent}
                inactivityTimeout={0}
            />
        </Box>
    );
};

export default React.memo(HLSPlayer);
// export default HLSPlayer