import { describe, expect, it } from 'vitest';

const getPlaybackRequestSignature = require('../src/routes/Player/getPlaybackRequestSignature');

const createPlaybackRequest = (overrides = {}) => ({
    stream: {
        url: 'https://example.com/video.mkv',
    },
    time: 120,
    forceTranscoding: true,
    audioCodecs: ['aac', 'mp3'],
    maxAudioChannels: 2,
    hardwareDecoding: true,
    assSubtitlesStyling: true,
    videoMode: 'default',
    platform: 'MacOS',
    streamingServerURL: 'http://127.0.0.1:11470',
    ...overrides,
});

describe('getPlaybackRequestSignature', () => {
    it('does not reload playback when pausing updates the resume time', () => {
        const beforePause = createPlaybackRequest({ time: 120 });
        const afterPause = createPlaybackRequest({ time: 124 });

        expect(getPlaybackRequestSignature(beforePause, 'episode-1')).toBe(
            getPlaybackRequestSignature(afterPause, 'episode-1')
        );
    });

    it('reloads playback when the selected source changes', () => {
        const firstSource = createPlaybackRequest();
        const secondSource = createPlaybackRequest({
            stream: {
                url: 'https://example.com/another-video.mkv',
            },
        });

        expect(getPlaybackRequestSignature(firstSource, 'episode-1')).not.toBe(
            getPlaybackRequestSignature(secondSource, 'episode-1')
        );
    });

    it('reloads playback when audio compatibility options change', () => {
        const directPlayback = createPlaybackRequest({
            forceTranscoding: false,
            audioCodecs: null,
            maxAudioChannels: 32,
        });
        const compatiblePlayback = createPlaybackRequest();

        expect(getPlaybackRequestSignature(directPlayback, 'episode-1')).not.toBe(
            getPlaybackRequestSignature(compatiblePlayback, 'episode-1')
        );
    });
});
