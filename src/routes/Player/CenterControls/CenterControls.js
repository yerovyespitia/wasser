// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { Button } = require('wasser/components');
const styles = require('./CenterControls.module.css');

function Replay10Icon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 3v5h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <text x="12" y="15.5" textAnchor="middle" style={{ fontSize: '8px', fontWeight: 700 }} fill="currentColor">10</text>
        </svg>
    );
}

Replay10Icon.propTypes = { className: PropTypes.string };

function Forward10Icon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <g transform="scale(-1,1) translate(-24,0)">
                <path
                    d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M3 3v5h5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <text x="12" y="15.5" textAnchor="middle" style={{ fontSize: '8px', fontWeight: 700 }} fill="currentColor">10</text>
        </svg>
    );
}

Forward10Icon.propTypes = { className: PropTypes.string };

function PlayIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 7.2C8 5.3 10 4.6 11.5 5.5L18.5 10C20.5 11.2 20.5 12.8 18.5 14L11.5 18.5C10 19.4 8 18.7 8 16.8Z" />
        </svg>
    );
}

PlayIcon.propTypes = { className: PropTypes.string };

function PauseIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 13 18.5v-13Z" />
        </svg>
    );
}

PauseIcon.propTypes = { className: PropTypes.string };

const CenterControls = ({ className, paused, time, onPlayRequested, onPauseRequested, onSeekRequested }) => {
    const onPlayPauseClick = React.useCallback((event) => {
        event.stopPropagation();
        if (paused) {
            typeof onPlayRequested === 'function' && onPlayRequested();
        } else {
            typeof onPauseRequested === 'function' && onPauseRequested();
        }
    }, [paused, onPlayRequested, onPauseRequested]);

    const onRewindClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof time === 'number' && typeof onSeekRequested === 'function') {
            onSeekRequested(Math.max(0, time - 10000));
        }
    }, [time, onSeekRequested]);

    const onForwardClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof time === 'number' && typeof onSeekRequested === 'function') {
            onSeekRequested(time + 10000);
        }
    }, [time, onSeekRequested]);

    if (paused === null) return null;

    return (
        <div className={classnames(className, styles['center-controls'])}>
            <Button className={styles['side-btn']} tabIndex={-1} onClick={onRewindClick}>
                <Replay10Icon className={styles['side-icon']} />
            </Button>
            <Button className={styles['play-btn']} tabIndex={-1} onClick={onPlayPauseClick}>
                {paused
                    ? <PlayIcon className={styles['play-icon']} />
                    : <PauseIcon className={styles['play-icon']} />
                }
            </Button>
            <Button className={styles['side-btn']} tabIndex={-1} onClick={onForwardClick}>
                <Forward10Icon className={styles['side-icon']} />
            </Button>
        </div>
    );
};

CenterControls.propTypes = {
    className: PropTypes.string,
    paused: PropTypes.bool,
    time: PropTypes.number,
    onPlayRequested: PropTypes.func,
    onPauseRequested: PropTypes.func,
    onSeekRequested: PropTypes.func,
};

module.exports = CenterControls;
