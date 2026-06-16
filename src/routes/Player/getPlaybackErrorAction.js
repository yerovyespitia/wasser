// Copyright (C) 2017-2026 Smart code 203358507

const SOURCE_ERROR_CODES = new Set([81, 82, 83]);
const TRANSCODING_FALLBACK_ERROR_CODES = new Set([82, 83]);

const getPlaybackErrorAction = ({
    error,
    forceTranscoding,
    forceTranscodingFallback,
    casting,
    hasStreamingServer,
}) => {
    const origin = SOURCE_ERROR_CODES.has(error?.code) ? 'source' : 'player';

    if (!error?.critical) {
        return {
            type: 'show-toast',
            origin,
        };
    }

    if (
        !forceTranscoding &&
        !forceTranscodingFallback &&
        !casting &&
        hasStreamingServer &&
        TRANSCODING_FALLBACK_ERROR_CODES.has(error.code)
    ) {
        return {
            type: 'retry-with-transcoding',
            origin,
        };
    }

    return {
        type: 'show-critical-error',
        origin,
    };
};

module.exports = getPlaybackErrorAction;
