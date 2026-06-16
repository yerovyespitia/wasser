import { describe, expect, it } from 'vitest';

const selectDefaultAudioTrack = require('../src/routes/Player/selectDefaultAudioTrack');

describe('selectDefaultAudioTrack', () => {
    const tracks = [
        { id: 'EMBEDDED_0', lang: 'und', label: 'Track 0' },
        { id: 'EMBEDDED_1', lang: 'spa', label: 'Track 1' },
    ];

    it('returns the saved track when available', () => {
        expect(selectDefaultAudioTrack(tracks, 'EMBEDDED_1', 'eng')).toEqual(tracks[1]);
    });

    it('falls back to preferred language when the saved track is unavailable', () => {
        expect(selectDefaultAudioTrack(tracks, 'EMBEDDED_9', 'spa')).toEqual(tracks[1]);
    });

    it('falls back to preferred language when no saved track exists', () => {
        expect(selectDefaultAudioTrack(tracks, null, 'spa')).toEqual(tracks[1]);
    });

    it('does not override the active HLS track when no preference matches', () => {
        expect(selectDefaultAudioTrack(tracks, null, 'eng')).toBeNull();
    });
});
