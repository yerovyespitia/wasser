import { describe, expect, it } from 'vitest';

const getPlaybackOptions = require('../src/routes/Player/getPlaybackOptions');

describe('getPlaybackOptions', () => {
    it('forces browser-safe transcoding in Electron when shell transport is unavailable', () => {
        expect(getPlaybackOptions({
            isElectron: true,
            shellActive: false,
            casting: false,
            forceTranscoding: false,
            forceTranscodingFallback: false,
            hasStreamingServer: true,
            surroundSound: true,
        })).toEqual({
            audioCodecs: ['aac', 'mp3'],
            forceTranscoding: true,
            maxAudioChannels: 2,
        });
    });

    it('falls back to direct playback when no streaming server is available', () => {
        expect(getPlaybackOptions({
            isElectron: true,
            shellActive: false,
            casting: false,
            forceTranscoding: false,
            forceTranscodingFallback: false,
            hasStreamingServer: false,
            surroundSound: true,
        })).toEqual({
            audioCodecs: null,
            forceTranscoding: false,
            maxAudioChannels: 32,
        });
    });

    it('requests browser-compatible audio for multichannel MKV sources', () => {
        const options = getPlaybackOptions({
            isElectron: true,
            shellActive: false,
            casting: false,
            forceTranscoding: false,
            forceTranscodingFallback: false,
            hasStreamingServer: true,
            surroundSound: true,
        });

        expect(options.audioCodecs).toEqual(['aac', 'mp3']);
        expect(options.maxAudioChannels).toBe(2);
        expect(options.forceTranscoding).toBe(true);
    });

    it('keeps surround sound when native shell playback is available', () => {
        expect(getPlaybackOptions({
            isElectron: true,
            shellActive: true,
            casting: false,
            forceTranscoding: false,
            forceTranscodingFallback: false,
            hasStreamingServer: true,
            surroundSound: true,
        })).toEqual({
            audioCodecs: null,
            forceTranscoding: false,
            maxAudioChannels: 32,
        });
    });

    it('uses browser-safe audio when fallback transcoding is requested', () => {
        expect(getPlaybackOptions({
            isElectron: false,
            shellActive: false,
            casting: false,
            forceTranscoding: false,
            forceTranscodingFallback: true,
            hasStreamingServer: true,
            surroundSound: false,
        })).toEqual({
            audioCodecs: ['aac', 'mp3'],
            forceTranscoding: true,
            maxAudioChannels: 2,
        });
    });

    it('uses browser-safe audio when explicit transcoding is requested', () => {
        expect(getPlaybackOptions({
            isElectron: false,
            shellActive: false,
            casting: false,
            forceTranscoding: true,
            forceTranscodingFallback: false,
            hasStreamingServer: true,
            surroundSound: true,
        })).toEqual({
            audioCodecs: ['aac', 'mp3'],
            forceTranscoding: true,
            maxAudioChannels: 2,
        });
    });
});
