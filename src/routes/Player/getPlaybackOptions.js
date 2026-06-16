// Copyright (C) 2017-2026 Smart code 203358507

const getPlaybackOptions = ({
    isElectron,
    shellActive,
    casting,
    forceTranscoding,
    forceTranscodingFallback,
    hasStreamingServer,
    surroundSound,
}) => {
    const preferBrowserSafeTranscoding = hasStreamingServer && !casting && (
        forceTranscoding ||
        forceTranscodingFallback ||
        (isElectron && !shellActive)
    );
    const audioCodecs = preferBrowserSafeTranscoding ? ['aac', 'mp3'] : null;
    const maxAudioChannels = audioCodecs !== null ? 2 : surroundSound ? 32 : 2;
    const canForceTranscoding = hasStreamingServer && (
        forceTranscoding || forceTranscodingFallback || preferBrowserSafeTranscoding || casting
    );

    return {
        audioCodecs,
        forceTranscoding: canForceTranscoding,
        maxAudioChannels,
    };
};

module.exports = getPlaybackOptions;
