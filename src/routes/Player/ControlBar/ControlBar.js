// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('@stremio/stremio-icons/react');
const { Button } = require('wasser/components');
const { useServices } = require('wasser/services');
const SeekBar = require('./SeekBar');
const VolumeSlider = require('./VolumeSlider');
const styles = require('./styles.module.css');
const { useBinaryState, usePlatform } = require('wasser/common');
const { t } = require('i18next');

const ControlBar = React.forwardRef(({
    className,
    paused,
    time,
    duration,
    buffered,
    volume,
    muted,
    playbackSpeed,
    subtitlesTracks,
    audioTracks,
    metaItem,
    nextVideo,
    stream,
    statistics,
    onPlayRequested,
    onPauseRequested,
    onNextVideoRequested,
    onMuteRequested,
    onUnmuteRequested,
    onVolumeChangeRequested,
    onSeekRequested,
    onToggleSubtitlesMenu,
    onToggleAudioMenu,
    onToggleSpeedMenu,
    onToggleSideDrawer,
    onToggleOptionsMenu,
    onToggleStatisticsMenu,
    onTouchEnd,
    ...props
}, ref) => {
    const { chromecast } = useServices();
    const platform = usePlatform();
    const [chromecastServiceActive, setChromecastServiceActive] = React.useState(() => chromecast.active);
    const [buttonsMenuOpen, , , toggleButtonsMenu] = useBinaryState(false);
    const onSubtitlesButtonMouseDown = React.useCallback((event) => {
        event.nativeEvent.subtitlesMenuClosePrevented = true;
    }, []);
    const onAudioButtonMouseDown = React.useCallback((event) => {
        event.nativeEvent.audioMenuClosePrevented = true;
    }, []);
    const onSpeedButtonMouseDown = React.useCallback((event) => {
        event.nativeEvent.speedMenuClosePrevented = true;
    }, []);
    const onVideosButtonMouseDown = React.useCallback((event) => {
        event.nativeEvent.videosMenuClosePrevented = true;
    }, []);
    const onOptionsButtonMouseDown = React.useCallback((event) => {
        event.nativeEvent.optionsMenuClosePrevented = true;
    }, []);
    const onStatisticsButtonMouseDown = React.useCallback((event) => {
        event.nativeEvent.statisticsMenuClosePrevented = true;
    }, []);
    const onPlayPauseButtonClick = React.useCallback(() => {
        if (paused) {
            if (typeof onPlayRequested === 'function') {
                onPlayRequested();
            }
        } else {
            if (typeof onPauseRequested === 'function') {
                onPauseRequested();
            }
        }
    }, [paused, onPlayRequested, onPauseRequested]);
    const onNextVideoButtonClick = React.useCallback(() => {
        if (nextVideo !== null && typeof onNextVideoRequested === 'function') {
            onNextVideoRequested();
        }
    }, [nextVideo, onNextVideoRequested]);
    const onMuteButtonClick = React.useCallback(() => {
        if (muted) {
            if (typeof onUnmuteRequested === 'function') {
                onUnmuteRequested();
            }
        } else {
            if (typeof onMuteRequested === 'function') {
                onMuteRequested();
            }
        }
    }, [muted, onMuteRequested, onUnmuteRequested]);
    const onChromecastButtonClick = React.useCallback(() => {
        chromecast.transport.requestSession();
    }, []);
    React.useEffect(() => {
        const onStateChanged = () => {
            setChromecastServiceActive(chromecast.active);
        };
        chromecast.on('stateChanged', onStateChanged);
        return () => {
            chromecast.off('stateChanged', onStateChanged);
        };
    }, []);
    return (
        <div ref={ref} {...props} onTouchStart={props.onMouseOver} onTouchMove={props.onMouseMove} onTouchEnd={onTouchEnd} className={classnames(className, styles['control-bar-container'])}>
            <SeekBar
                className={styles['seek-bar']}
                time={time}
                duration={duration}
                buffered={buffered}
                onSeekRequested={onSeekRequested}
            />
            <div className={styles['control-bar-buttons-container']}>
                <Button className={classnames(styles['control-bar-button'], { 'disabled': typeof paused !== 'boolean' })} title={paused ? t('PLAYER_PLAY') : t('PLAYER_PAUSE')} tabIndex={-1} onClick={onPlayPauseButtonClick}>
                    {
                        typeof paused !== 'boolean' || paused ?
                            <PlayIcon className={styles['icon']} />
                            :
                            <PauseIcon className={styles['icon']} />
                    }
                </Button>
                {
                    nextVideo !== null ?
                        <Button className={classnames(styles['control-bar-button'])} title={t('PLAYER_NEXT_VIDEO')} tabIndex={-1} onClick={onNextVideoButtonClick}>
                            <Icon className={styles['icon']} name={'next'} />
                        </Button>
                        :
                        null
                }
                <Button className={classnames(styles['control-bar-button'], { 'disabled': typeof muted !== 'boolean' })} title={muted ? t('PLAYER_UNMUTE') : t('PLAYER_MUTE')} tabIndex={-1} onClick={onMuteButtonClick}>
                    {
                        (typeof muted === 'boolean' && muted) || volume === 0 ?
                            <VolumeMutedIcon className={styles['icon']} />
                            :
                            (volume === null || isNaN(volume)) ?
                                <Icon className={styles['icon']} name={'volume-off'} />
                                :
                                <VolumeHighIcon className={styles['icon']} />
                    }
                </Button>
                {
                    !platform.isMobile ?
                        <VolumeSlider
                            className={styles['volume-slider']}
                            volume={volume}
                            muted={muted}
                            onVolumeChangeRequested={onVolumeChangeRequested}
                        />
                        : null
                }
                <div className={styles['spacing']} />
                <Button className={styles['control-bar-buttons-menu-button']} title={t('OPTIONS')} onClick={toggleButtonsMenu}>
                    <Icon className={styles['icon']} name={'more-vertical'} />
                </Button>
                <div className={classnames(styles['control-bar-buttons-menu-container'], { 'open': buttonsMenuOpen })}>
                    <Button className={classnames(styles['control-bar-button'], { 'disabled': statistics === null || statistics.type === 'Err' || stream === null || typeof stream.infoHash !== 'string' || typeof stream.fileIdx !== 'number' })} title={t('STREAMING_INFO')} tabIndex={-1} onMouseDown={onStatisticsButtonMouseDown} onClick={onToggleStatisticsMenu}>
                        <Icon className={styles['icon']} name={'network'} />
                    </Button>
                    <Button className={classnames(styles['control-bar-button'], { 'disabled': playbackSpeed === null })} title={t('PLAYBACK_SPEED')} tabIndex={-1} onMouseDown={onSpeedButtonMouseDown} onClick={onToggleSpeedMenu}>
                        <Icon className={styles['icon']} name={'speed'} />
                    </Button>
                    <Button className={classnames(styles['control-bar-button'], { 'disabled': !chromecastServiceActive })} title={t('CHROMECAST')} tabIndex={-1} onClick={onChromecastButtonClick}>
                        <Icon className={styles['icon']} name={'cast'} />
                    </Button>
                    <Button className={classnames(styles['control-bar-button'], { 'disabled': !Array.isArray(subtitlesTracks) || subtitlesTracks.length === 0 })} title={t('PLAYER_SUBTITLES')} tabIndex={-1} onMouseDown={onSubtitlesButtonMouseDown} onClick={onToggleSubtitlesMenu}>
                        <Icon className={styles['icon']} name={'subtitles'} />
                    </Button>
                    <Button className={classnames(styles['control-bar-button'], { 'disabled': !Array.isArray(audioTracks) || audioTracks.length === 0 })} title={t('AUDIO_TRACKS')} tabIndex={-1} onMouseDown={onAudioButtonMouseDown} onClick={onToggleAudioMenu}>
                        <Icon className={styles['icon']} name={'audio-tracks'} />
                    </Button>
                    {
                        metaItem?.content?.videos?.length > 0 ?
                            <Button className={styles['control-bar-button']} title={t('PLAYER_NEXT_VIDEO')} tabIndex={-1} onMouseDown={onVideosButtonMouseDown} onClick={onToggleSideDrawer}>
                                <Icon className={styles['icon']} name={'episodes'} />
                            </Button>
                            :
                            null
                    }
                    <Button className={classnames(styles['control-bar-button'], { 'disabled': !stream })} title={t('OPTIONS')} tabIndex={-1} onMouseDown={onOptionsButtonMouseDown} onClick={onToggleOptionsMenu}>
                        <Icon className={styles['icon']} name={'more-horizontal'} />
                    </Button>
                </div>
            </div>
        </div>
    );
});

ControlBar.propTypes = {
    className: PropTypes.string,
    paused: PropTypes.bool,
    time: PropTypes.number,
    duration: PropTypes.number,
    buffered: PropTypes.number,
    volume: PropTypes.number,
    muted: PropTypes.bool,
    playbackSpeed: PropTypes.number,
    subtitlesTracks: PropTypes.array,
    audioTracks: PropTypes.array,
    metaItem: PropTypes.object,
    nextVideo: PropTypes.object,
    stream: PropTypes.object,
    statistics: PropTypes.object,
    onPlayRequested: PropTypes.func,
    onPauseRequested: PropTypes.func,
    onNextVideoRequested: PropTypes.func,
    onMuteRequested: PropTypes.func,
    onUnmuteRequested: PropTypes.func,
    onVolumeChangeRequested: PropTypes.func,
    onSeekRequested: PropTypes.func,
    onToggleSubtitlesMenu: PropTypes.func,
    onToggleAudioMenu: PropTypes.func,
    onToggleSpeedMenu: PropTypes.func,
    onToggleSideDrawer: PropTypes.func,
    onToggleOptionsMenu: PropTypes.func,
    onToggleStatisticsMenu: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseMove: PropTypes.func,
    onTouchEnd: PropTypes.func,
};

module.exports = ControlBar;

function PlayIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M8 7.2C8 5.3 10 4.6 11.5 5.5L18.5 10C20.5 11.2 20.5 12.8 18.5 14L11.5 18.5C10 19.4 8 18.7 8 16.8Z" />
        </svg>
    );
}

PlayIcon.propTypes = {
    className: PropTypes.string
};

function PauseIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 13 18.5v-13Z" />
        </svg>
    );
}

PauseIcon.propTypes = {
    className: PropTypes.string
};

function VolumeHighIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M4 10.5A1.5 1.5 0 0 1 5.5 9H8l4.47-3.58A1 1 0 0 1 14 6.2v11.6a1 1 0 0 1-1.53.78L8 15H5.5A1.5 1.5 0 0 1 4 13.5v-3Zm13.34-2.74a.75.75 0 0 1 1.06-.05 6 6 0 0 1 0 8.58.75.75 0 1 1-1.1-1.02 4.5 4.5 0 0 0 0-6.54.75.75 0 0 1 .04-1.07Zm-2.42 1.92a.75.75 0 0 1 1.06.06 3 3 0 0 1 0 4.52.75.75 0 1 1-1.12-1 1.5 1.5 0 0 0 0-2.52.75.75 0 0 1 .06-1.06Z"
            />
        </svg>
    );
}

VolumeHighIcon.propTypes = {
    className: PropTypes.string
};

function VolumeMutedIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M4 10.5A1.5 1.5 0 0 1 5.5 9H8l4.47-3.58A1 1 0 0 1 14 6.2v11.6a1 1 0 0 1-1.53.78L8 15H5.5A1.5 1.5 0 0 1 4 13.5v-3Zm11.03-.97a.75.75 0 0 1 1.06 0L18 11.44l1.91-1.9a.75.75 0 1 1 1.06 1.06l-1.9 1.9 1.9 1.91a.75.75 0 1 1-1.06 1.06L18 13.56l-1.9 1.91a.75.75 0 1 1-1.07-1.06l1.91-1.9-1.91-1.91a.75.75 0 0 1 0-1.06Z"
            />
        </svg>
    );
}

VolumeMutedIcon.propTypes = {
    className: PropTypes.string
};
