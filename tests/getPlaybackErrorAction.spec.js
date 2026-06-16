import { describe, expect, it } from 'vitest';

const getPlaybackErrorAction = require('../src/routes/Player/getPlaybackErrorAction');

const defaults = {
    forceTranscoding: false,
    forceTranscodingFallback: false,
    casting: false,
    hasStreamingServer: true,
};

describe('getPlaybackErrorAction', () => {
    it.each([
        [82, 'Video cannot be decoded'],
        [83, 'Video is not supported'],
    ])('attributes media error %i to the source and retries with transcoding', (code, message) => {
        expect(getPlaybackErrorAction({
            ...defaults,
            error: { code, message, critical: true },
        })).toEqual({
            type: 'retry-with-transcoding',
            origin: 'source',
        });
    });

    it('does not enter a reload loop when transcoding already failed', () => {
        expect(getPlaybackErrorAction({
            ...defaults,
            forceTranscodingFallback: true,
            error: { code: 83, message: 'Video is not supported', critical: true },
        })).toEqual({
            type: 'show-critical-error',
            origin: 'source',
        });
    });

    it('attributes network failures to the source without treating them as an app crash', () => {
        expect(getPlaybackErrorAction({
            ...defaults,
            error: { code: 81, message: 'Network error', critical: true },
        })).toEqual({
            type: 'show-critical-error',
            origin: 'source',
        });
    });

    it('keeps unknown internal failures classified as player errors', () => {
        expect(getPlaybackErrorAction({
            ...defaults,
            error: { code: 500, message: 'Unexpected player failure', critical: true },
        })).toEqual({
            type: 'show-critical-error',
            origin: 'player',
        });
    });
});
