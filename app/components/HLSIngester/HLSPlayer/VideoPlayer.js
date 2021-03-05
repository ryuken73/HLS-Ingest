import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Controls from './Controls.json';
// import videojs from 'video.js';
import overlay from 'videojs-overlay';
import marker from 'videojs-markers-plugin'

class VideoPlayer extends Component {
    playerId = `video-player-${Date.now() + (Math.random()*10000).toFixed(0)}`
    player = {};
    componentDidMount() {
        this.init_player(this.props);
        this.init_player_events(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.set_controls_visibility(this.player, nextProps.hideControls);
        if(this.props.src !== nextProps.src){
            // if (this.player) this.player.dispose();
            this.init_player(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.player) this.player.dispose();
    }

    init_player(props) {
        try {
            const playerOptions = this.generate_player_options(props);
            const {enableOverlay=false, overlayContent="This is HLS Player!"} = props;
            this.player = videojs(document.querySelector(`#${this.playerId}`), playerOptions);
            if(enableOverlay){
                this.player.overlay(
                    {
                        overlays:[{
                            content: overlayContent,
                            start:'playing',
                            end:'dispose'
                        }]
                    }
                )
            }
            // setInterval(() => {
            //     this.player.markers({
            //         markers: [
            //            {time: 9.5, text: "this"},
            //            {time: 16,  text: "is"},
            //            {time: 23.6,text: "so"},
            //            {time: 28,  text: "cool"}
            //         ]
            //       });
            // },5000)

            this.player.src(props.src)
            this.player.poster(props.poster)
            this.set_controls_visibility(this.player, props.hideControls);

        } catch(error) {
            console.error(error)
        }
  
    }

    generate_player_options(props){
        const playerOptions = {};
        playerOptions.inactivityTimeout = props.inactivityTimeout;
        playerOptions.controls = props.controls;
        playerOptions.autoplay = props.autoplay;
        playerOptions.preload = props.preload;
        playerOptions.width = props.width;
        playerOptions.height = props.height;
        playerOptions.bigPlayButton = props.bigPlayButton;
        playerOptions.liveui = props.liveui;
        const hidePlaybackRates = props.hidePlaybackRates || props.hideControls.includes('playbackrates');
        if (!hidePlaybackRates) playerOptions.playbackRates = props.playbackRates;
        return playerOptions;
    }

    set_controls_visibility(player, hidden_controls){
        Object.keys(Controls).map(x => { player.controlBar[Controls[x]].show() })
        hidden_controls.map(x => { player.controlBar[Controls[x]].hide() });
    }

    init_player_events(props) {
        let position = 0;

        this.player.ready(() => {
            props.onReady(this.player);
            window.player = this.player;
        });
        this.player.on('play', () => {
            props.onPlay(this.player.currentTime());
        });
        this.player.on('pause', () => {
            props.onPause(this.player.currentTime());
        });
        this.player.on('timeupdate', (e) => {
            props.onTimeUpdate(this.player.currentTime());
        });
        this.player.on('canplay', () => {
            props.onCanPlay(this.player)
        })
        this.player.on('seeking', () => {
            props.onSeeking(this.player.currentTime());
        });   
        this.player.on('seeked', () => {
            let completeTime = Math.floor(this.player.currentTime());
            props.onSeeked(position, completeTime);
        });
        this.player.on('ended', () => {
            props.onEnd();
        });
        this.player.on('error', () => {
            console.log(this.player.error());
            props.onError(this.player.error());
        });
        this.player.on('stalled', () => {
            props.onOtherEvent('stalled')
        })
        this.player.on('suspend', () => {
            props.onOtherEvent('suspend')
        })
        this.player.on('waiting', () => {
            props.onOtherEvent('waiting')
        })
        this.player.on('waiting', () => {
            props.onOtherEvent('abort')
        })
        this.player.on('loadstart', () => {
            console.log('loadstart');
            props.onOtherEvent('loadstart', this.player)
        })
        this.player.on('playing', () => {
            props.onOtherEvent('playing')
        })
        this.player.on('emptied', () => {
            props.onOtherEvent('emptied')
        })
        this.player.on('ratechange', () => {
            props.onOtherEvent('ratechange', this.player);
        })
        this.player.on('loadedmetadata', () => {
            console.log('%%% loadedmetadata', this.player.markers)
            // console.log('%%% loadedmetadata', this.player.overlay)
            // this.player.markers.add([{ time: 40, text: "I'm added"}]);
            props.onOtherEvent('loadedmetadata', this.player);
            try {
                this.player.markers({
                    // markerStyle: {
                    //     'width':'7px',
                    //     'border-radius': '30%',
                    //     'background-color': 'red'
                    // },
                    // markerTip:{
                    //     display: true,
                    //     text: function(marker) {
                    //     return "Break: "+ marker.text;
                    //     },
                    //     time: function(marker) {
                    //     return marker.time;
                    //     }
                    // },
                    // breakOverlay:{
                    //     display: true,
                    //     displayTime: 3,
                    //     style:{
                    //     'width':'100%',
                    //     'height': '20%',
                    //     'background-color': 'rgba(0,0,0,0.7)',
                    //     'color': 'white',
                    //     'font-size': '17px'
                    //     },
                    //     text: function(marker) {
                    //     return "Break overlay: " + marker.overlayText;
                    //     }
                    // },
                    // onMarkerClick: function(marker) {},
                    // onMarkerReached: function(marker) {},
                });
            } catch (err) {
                console.log('error initialize markers')
            }

            // this.player.markers.add([{ time: 500, text: "I'm added"}])
            
        })
        this.player.on('durationchange', () => {
            console.log('#####', this.player.duration())
            props.onOtherEvent('durationchange', this.player)
        })

    }

    render() {
        return (
            <video id={this.playerId} className={`video-js vjs-liveui ${this.props.bigPlayButtonCentered? 'vjs-big-play-centered' : ''} ${this.props.className}`}></video>
        )
    }
}

VideoPlayer.propTypes = {
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    poster: PropTypes.string,
    controls: PropTypes.bool,
    autoplay: PropTypes.bool,
    preload: PropTypes.oneOf(['auto', 'none', 'metadata']),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hideControls: PropTypes.arrayOf(PropTypes.string),
    bigPlayButton: PropTypes.bool,
    bigPlayButtonCentered: PropTypes.bool,
    onReady: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onTimeUpdate: PropTypes.func,
    onSeeking: PropTypes.func,
    onSeeked: PropTypes.func,
    onEnd: PropTypes.func,
    onError: PropTypes.func,
    onOtherEvent: PropTypes.func,
    playbackRates: PropTypes.arrayOf(PropTypes.number),
    hidePlaybackRates: PropTypes.bool,
    className: PropTypes.string
}

VideoPlayer.defaultProps = {
    src: "",
    poster: "",
    controls: true,
    autoplay: false,
    preload: 'auto',
    playbackRates: [1, 1.5, 2, 4, 8],
    hidePlaybackRates: false,
    className: "",
    hideControls: [],
    bigPlayButton: true,
    bigPlayButtonCentered: true,
    onReady: () => { },
    onPlay: () => { },
    onPause: () => { },
    onTimeUpdate: () => { },
    onSeeking: () => { },
    onSeeked: () => { },
    onEnd: () => { }
}


export default React.memo(VideoPlayer);