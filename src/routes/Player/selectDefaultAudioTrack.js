// Copyright (C) 2017-2026 Smart code 203358507

const langs = require('langs');

const findTrackByLang = (tracks, lang) => tracks.find((track) => track.lang === lang || langs.where('1', track.lang)?.[2] === lang);
const findTrackById = (tracks, id) => tracks.find((track) => track.id === id);

const selectDefaultAudioTrack = (tracks, savedTrackId, preferredLanguage) => {
    if (!Array.isArray(tracks) || tracks.length === 0) {
        return null;
    }

    return (
        savedTrackId ? findTrackById(tracks, savedTrackId) : null
    ) || findTrackByLang(tracks, preferredLanguage) || null;
};

module.exports = selectDefaultAudioTrack;
