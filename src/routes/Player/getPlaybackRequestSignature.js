// Copyright (C) 2017-2026 Smart code 203358507

const getPlaybackRequestSignature = (playbackRequest, pathId, subtitlesTracks = []) => {
    if (playbackRequest === null) {
        return null;
    }

    return JSON.stringify({
        pathId: pathId ?? null,
        streamUrl: playbackRequest.stream.url ?? null,
        infoHash: playbackRequest.stream.infoHash ?? null,
        fileIdx: playbackRequest.stream.fileIdx ?? null,
        ytId: playbackRequest.stream.ytId ?? null,
        externalUrl: playbackRequest.stream.externalUrl ?? null,
        subtitles: subtitlesTracks.map((track) => ({
            id: track.id ?? null,
            url: track.url ?? null,
            lang: track.lang ?? null,
            label: track.label ?? null,
        })),
        forceTranscoding: playbackRequest.forceTranscoding,
        audioCodecs: playbackRequest.audioCodecs,
        maxAudioChannels: playbackRequest.maxAudioChannels,
        hardwareDecoding: playbackRequest.hardwareDecoding,
        assSubtitlesStyling: playbackRequest.assSubtitlesStyling,
        videoMode: playbackRequest.videoMode,
        platform: playbackRequest.platform,
        streamingServerURL: playbackRequest.streamingServerURL,
    });
};

module.exports = getPlaybackRequestSignature;
