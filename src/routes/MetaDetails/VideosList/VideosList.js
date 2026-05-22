// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { t } = require('i18next');
const { useServices } = require('wasser/services');
const { getNewEpisodeVideoId, useProfile } = require('wasser/common');
const { Image, SearchBar, Toggle, Video } = require('wasser/components');
const SeasonsBar = require('./SeasonsBar');
const EpisodePicker = require('../EpisodePicker');
const styles = require('./styles.module.css');

const VideosList = ({ className, metaItem, libraryItem, season, seasonOnSelect, selectedVideoId, toggleNotifications }) => {
    const { core } = useServices();
    const profile = useProfile();

    const showNotificationsToggle = React.useMemo(() => {
        return metaItem?.content?.content?.inLibrary && metaItem?.content?.content?.videos?.length;
    }, [metaItem]);
    const videos = React.useMemo(() => {
        return metaItem && metaItem.content.type === 'Ready' ?
            metaItem.content.content.videos
            :
            [];
    }, [metaItem]);
    const seasons = React.useMemo(() => {
        return videos
            .map(({ season }) => season)
            .filter((season, index, seasons) => {
                return season !== null &&
                    !isNaN(season) &&
                    typeof season === 'number' &&
                    seasons.indexOf(season) === index;
            })
            .sort((a, b) => (a || Number.MAX_SAFE_INTEGER) - (b || Number.MAX_SAFE_INTEGER));
    }, [videos]);
    const defaultSeasonFromWatched = React.useMemo(() => {
        if (seasons.length === 0) {
            return null;
        }

        const sortedVideos = [...videos]
            .filter((video) => typeof video.season === 'number' && !isNaN(video.season))
            .sort((a, b) => {
                if (a.season !== b.season) {
                    return a.season - b.season;
                }

                const aEpisode = typeof a.episode === 'number' && !isNaN(a.episode) ? a.episode : Number.MAX_SAFE_INTEGER;
                const bEpisode = typeof b.episode === 'number' && !isNaN(b.episode) ? b.episode : Number.MAX_SAFE_INTEGER;
                return aEpisode - bEpisode;
            });

        const lastWatchedVideo = [...sortedVideos].reverse().find((video) => video.watched);
        if (!lastWatchedVideo || !seasons.includes(lastWatchedVideo.season)) {
            return null;
        }

        const watchedSeasonVideos = sortedVideos.filter((video) => video.season === lastWatchedVideo.season);
        const seasonFullyWatched = watchedSeasonVideos.length > 0 && watchedSeasonVideos.every((video) => video.watched);
        if (!seasonFullyWatched) {
            return lastWatchedVideo.season;
        }

        const nextSeason = seasons.find((season) => season > lastWatchedVideo.season);
        return nextSeason ?? lastWatchedVideo.season;
    }, [videos, seasons]);
    const selectedSeason = React.useMemo(() => {
        if (seasons.includes(season)) {
            return season;
        }

        if (defaultSeasonFromWatched !== null) {
            return defaultSeasonFromWatched;
        }

        const video = videos?.find((video) => video.id === libraryItem?.state.video_id);

        if (video && video.season && seasons.includes(video.season)) {
            return video.season;
        }

        const nonSpecialSeasons = seasons.filter((season) => season !== 0);
        if (nonSpecialSeasons.length > 0) {
            return nonSpecialSeasons[0];
        }

        if (seasons.length > 0) {
            return seasons[0];
        }

        return null;
    }, [seasons, season, defaultSeasonFromWatched, videos, libraryItem]);
    const videosForSeason = React.useMemo(() => {
        return videos
            .filter((video) => {
                return selectedSeason === null || video.season === selectedSeason;
            })
            .sort((a, b) => {
                return a.episode - b.episode;
            });
    }, [videos, selectedSeason]);
    const newEpisodeVideoId = React.useMemo(() => {
        return getNewEpisodeVideoId(videosForSeason);
    }, [videosForSeason]);

    const seasonWatched = React.useMemo(() => {
        return videosForSeason.every((video) => video.watched);
    }, [videosForSeason]);

    const [search, setSearch] = React.useState('');
    const searchInputOnChange = React.useCallback((event) => {
        setSearch(event.currentTarget.value);
    }, []);

    const onMarkVideoAsWatched = (video, watched) => {
        core.transport.dispatch({
            action: 'MetaDetails',
            args: {
                action: 'MarkVideoAsWatched',
                args: [video, !watched]
            }
        });
    };

    const onMarkSeasonAsWatched = (season, watched) => {
        core.transport.dispatch({
            action: 'MetaDetails',
            args: {
                action: 'MarkSeasonAsWatched',
                args: [season, !watched]
            }
        });
    };

    const onSeasonSearch = (value) => {
        if (value) {
            seasonOnSelect({
                type: 'select',
                value,
            });
        }
    };

    return (
        <div className={classnames(className, styles['videos-list-container'])}>
            {
                !metaItem || metaItem.content.type === 'Loading' ?
                    <React.Fragment>
                        <SeasonsBar.Placeholder className={styles['seasons-bar']} />
                        <SearchBar.Placeholder className={styles['search-bar']} title={t('SEARCH_VIDEOS')} />
                        <div className={styles['videos-scroll-container']}>
                            <Video.Placeholder />
                            <Video.Placeholder />
                            <Video.Placeholder />
                            <Video.Placeholder />
                            <Video.Placeholder />
                        </div>
                    </React.Fragment>
                    :
                    metaItem.content.type === 'Err' || videosForSeason.length === 0 ?
                        <div className={styles['message-container']}>
                            <EpisodePicker className={styles['episode-picker']} onSubmit={onSeasonSearch} />
                            <Image className={styles['image']} src={'/assets/images/empty.png'} alt={' '} />
                            <div className={styles['label']}>{t('ERR_NO_VIDEOS_FOR_META')}</div>
                        </div>
                        :
                        <React.Fragment>
                            <div className={styles['header-row']}>
                                <div className={styles['section-heading']}>{t('EPISODES').toLowerCase()}</div>
                                {
                                    showNotificationsToggle && libraryItem ?
                                        <Toggle className={styles['notifications-toggle']} checked={!libraryItem.state.noNotif} onClick={toggleNotifications}>
                                            {t('DETAIL_RECEIVE_NOTIF_SERIES')}
                                        </Toggle>
                                        :
                                        null
                                }
                            </div>
                            {
                                seasons.length > 0 ?
                                    <SeasonsBar
                                        className={styles['seasons-bar']}
                                        season={selectedSeason}
                                        seasons={seasons}
                                        onSelect={seasonOnSelect}
                                    />
                                    :
                                    null
                            }
                            <SearchBar
                                className={styles['search-bar']}
                                title={t('SEARCH_VIDEOS')}
                                value={search}
                                onChange={searchInputOnChange}
                            />
                            <div className={styles['videos-container']}>
                                {
                                    videosForSeason
                                        .filter((video) => {
                                            return search.length === 0 ||
                                                (
                                                    (typeof video.title === 'string' && video.title.toLowerCase().includes(search.toLowerCase())) ||
                                                    (!isNaN(video.released.getTime()) && video.released.toLocaleString(profile.settings.interfaceLanguage, { year: '2-digit', month: 'short', day: 'numeric' }).toLowerCase().includes(search.toLowerCase()))
                                                );
                                        })
                                        .map((video, index) => (
                                            <Video
                                                key={index}
                                                id={video.id}
                                                title={video.title}
                                                thumbnail={video.thumbnail}
                                                season={video.season}
                                                episode={video.episode}
                                                released={video.released}
                                                upcoming={video.upcoming}
                                                watched={video.watched}
                                                isNew={video.id === newEpisodeVideoId}
                                                progress={video.progress}
                                                deepLinks={video.deepLinks}
                                                scheduled={video.scheduled}
                                                seasonWatched={seasonWatched}
                                                selected={video.id === selectedVideoId}
                                                variant={'details'}
                                                onMarkVideoAsWatched={onMarkVideoAsWatched}
                                                onMarkSeasonAsWatched={onMarkSeasonAsWatched}
                                            />
                                        ))
                                }
                            </div>
                        </React.Fragment>
            }
        </div>
    );
};

VideosList.propTypes = {
    className: PropTypes.string,
    metaItem: PropTypes.object,
    libraryItem: PropTypes.object,
    season: PropTypes.number,
    selectedVideoId: PropTypes.string,
    seasonOnSelect: PropTypes.func,
    toggleNotifications: PropTypes.func,
};

module.exports = VideosList;
