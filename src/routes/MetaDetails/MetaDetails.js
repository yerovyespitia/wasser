// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const UrlUtils = require('url');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('@stremio/stremio-icons/react');
const { useServices } = require('wasser/services');
const { withCoreSuspender } = require('wasser/common');
const { VerticalNavBar, HorizontalNavBar, DelayedRenderer, Image, MetaPreview, ModalDialog, Button, ActionsGroup } = require('wasser/components');
const { Ratings } = require('../../components/MetaPreview/Ratings');
const StreamsList = require('./StreamsList');
const VideosList = require('./VideosList');
const useMetaDetails = require('./useMetaDetails');
const useSeason = require('./useSeason');
const useMetaExtensionTabs = require('./useMetaExtensionTabs');
const styles = require('./styles.module.css');

const IMDB_LINK_CATEGORY = 'imdb';
const GENRES_LINK_CATEGORY = 'Genres';

const MetaDetails = ({ urlParams, queryParams }) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const metaDetails = useMetaDetails(urlParams);
    const [season, setSeason] = useSeason(urlParams, queryParams);
    const [tabs, metaExtension, clearMetaExtension] = useMetaExtensionTabs(metaDetails.metaExtensions);
    const [metaPath, streamPath] = React.useMemo(() => {
        return metaDetails.selected !== null ?
            [metaDetails.selected.metaPath, metaDetails.selected.streamPath]
            :
            [null, null];
    }, [metaDetails.selected]);
    const video = React.useMemo(() => {
        return streamPath !== null && metaDetails.metaItem !== null && metaDetails.metaItem.content.type === 'Ready' ?
            metaDetails.metaItem.content.content.videos.reduce((result, video) => {
                if (video.id === streamPath.id) {
                    return video;
                }

                return result;
            }, null)
            :
            null;
    }, [metaDetails.metaItem, streamPath]);
    const addToLibrary = React.useCallback(() => {
        if (metaDetails.metaItem === null || metaDetails.metaItem.content.type !== 'Ready') {
            return;
        }

        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'AddToLibrary',
                args: metaDetails.metaItem.content.content
            }
        });
    }, [metaDetails]);
    const removeFromLibrary = React.useCallback(() => {
        if (metaDetails.metaItem === null || metaDetails.metaItem.content.type !== 'Ready') {
            return;
        }

        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'RemoveFromLibrary',
                args: metaDetails.metaItem.content.content.id
            }
        });
    }, [metaDetails]);
    const toggleWatched = React.useCallback(() => {
        if (metaDetails.metaItem === null || metaDetails.metaItem.content.type !== 'Ready') {
            return;
        }

        core.transport.dispatch({
            action: 'MetaDetails',
            args: {
                action: 'MarkAsWatched',
                args: !metaDetails.metaItem.content.content.watched
            }
        });
    }, [metaDetails]);
    const toggleNotifications = React.useCallback(() => {
        if (metaDetails.libraryItem) {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'ToggleLibraryItemNotifications',
                    args: [metaDetails.libraryItem._id, !metaDetails.libraryItem.state.noNotif],
                }
            });
        }
    }, [metaDetails.libraryItem]);
    const seasonOnSelect = React.useCallback((event) => {
        setSeason(event.value);
    }, [setSeason]);
    const handleEpisodeSearch = React.useCallback((season, episode) => {
        const searchVideoHash = encodeURIComponent(`${urlParams.id}:${season}:${episode}`);
        const url = window.location.hash;

        const searchVideoPath = (urlParams.videoId === undefined || urlParams.videoId === null || urlParams.videoId === '') ?
            url + (!url.endsWith('/') ? '/' : '') + searchVideoHash
            : url.replace(encodeURIComponent(urlParams.videoId), searchVideoHash);

        window.location = searchVideoPath;
    }, [urlParams, window.location]);

    const renderBackgroundImageFallback = React.useCallback(() => null, []);
    const renderPosterImageFallback = React.useCallback(() => (
        <div className={styles['poster-fallback']}>
            <Icon className={styles['poster-fallback-icon']} name={'symbol'} />
        </div>
    ), []);
    const renderLogoFallback = React.useCallback(() => (
        <div className={styles['hero-title']}>
            {metaDetails?.metaItem?.content?.type === 'Ready' ? metaDetails.metaItem.content.content.name : ''}
        </div>
    ), [metaDetails]);
    const renderBackground = React.useMemo(() => !!(
        metaPath &&
        metaDetails?.metaItem &&
        metaDetails.metaItem.content.type !== 'Loading' &&
        typeof metaDetails.metaItem.content.content?.background === 'string' &&
        metaDetails.metaItem.content.content.background.length > 0
    ), [metaPath, metaDetails]);
    const metaContent = React.useMemo(() => {
        return metaDetails?.metaItem?.content?.type === 'Ready' ?
            metaDetails.metaItem.content.content
            :
            null;
    }, [metaDetails]);
    const heroDescription = React.useMemo(() => {
        if (video !== null && typeof video.overview === 'string' && video.overview.length > 0) {
            return video.overview;
        }

        return typeof metaContent?.description === 'string' ? metaContent.description : '';
    }, [metaContent, video]);
    const releaseLabel = React.useMemo(() => {
        if (typeof metaContent?.releaseInfo === 'string' && metaContent.releaseInfo.length > 0) {
            return metaContent.releaseInfo;
        }

        if (metaContent?.released instanceof Date && !isNaN(metaContent.released.getTime())) {
            return String(metaContent.released.getFullYear());
        }

        return null;
    }, [metaContent]);
    const linksGroups = React.useMemo(() => {
        if (!Array.isArray(metaContent?.links)) {
            return new Map();
        }

        return metaContent.links.reduce((result, { category, name, url }) => {
            if (typeof category !== 'string' || typeof url !== 'string') {
                return result;
            }

            if (category === IMDB_LINK_CATEGORY) {
                const { hostname } = UrlUtils.parse(url);
                if (hostname === 'imdb.com' || hostname === 'www.imdb.com') {
                    result.set(category, {
                        label: name,
                        href: `https://www.stremio.com/warning#${encodeURIComponent(url)}`
                    });
                }
                return result;
            }

            if (!result.has(category)) {
                result.set(category, []);
            }

            result.get(category).push({
                label: name,
                href: url
            });

            return result;
        }, new Map());
    }, [metaContent]);
    const genres = React.useMemo(() => {
        return (linksGroups.get(GENRES_LINK_CATEGORY) || [])
            .map((genre) => genre.label)
            .filter((genre) => typeof genre === 'string' && genre.length > 0);
    }, [linksGroups]);
    const metaItemActions = React.useMemo(() => {
        if (metaContent === null) {
            return [];
        }

        return [
            {
                icon: metaContent.inLibrary ? 'remove-from-library' : 'add-to-library',
                label: metaContent.inLibrary ? t('REMOVE_FROM_LIB') : t('ADD_TO_LIB'),
                onClick: metaContent.inLibrary ? removeFromLibrary : addToLibrary,
            },
            {
                icon: metaContent.watched ? 'eye-off' : 'eye',
                label: metaContent.watched ? t('CTX_MARK_UNWATCHED') : t('CTX_MARK_WATCHED'),
                onClick: toggleWatched,
            },
        ];
    }, [metaContent, t, addToLibrary, removeFromLibrary, toggleWatched]);
    const showListAlongside = metaContent?.type === 'series';

    return (
        <div className={styles['metadetails-container']}>
            {
                renderBackground ?
                    <div className={styles['background-image-layer']}>
                        <Image
                            className={styles['background-image']}
                            src={metaDetails.metaItem.content.content.background}
                            renderFallback={renderBackgroundImageFallback}
                            alt={' '}
                        />
                    </div>
                    :
                    null
            }
            <HorizontalNavBar
                className={styles['nav-bar']}
                backButton={true}
                navMenu={true}
            />
            <div className={styles['metadetails-content']}>
                {
                    tabs.length > 0 ?
                        <VerticalNavBar
                            className={styles['vertical-nav-bar']}
                            tabs={tabs}
                            selected={metaExtension !== null ? metaExtension.url : null}
                        />
                        :
                        null
                }
                {
                    metaPath === null ?
                        <DelayedRenderer delay={500}>
                            <div className={styles['meta-message-container']}>
                                <Image className={styles['image']} src={'/assets/images/empty.png'} alt={' '} />
                                <div className={styles['message-label']}>{t('ERR_NO_META_SELECTED')}</div>
                            </div>
                        </DelayedRenderer>
                        :
                        metaDetails.metaItem === null ?
                            <div className={styles['meta-message-container']}>
                                <Image className={styles['image']} src={'/assets/images/empty.png'} alt={' '} />
                                <div className={styles['message-label']}>{t('ERR_NO_ADDONS_FOR_META')}</div>
                            </div>
                            :
                            metaDetails.metaItem.content.type === 'Err' ?
                                <div className={styles['meta-message-container']}>
                                    <Image className={styles['image']} src={'/assets/images/empty.png'} alt={' '} />
                                    <div className={styles['message-label']}>{t('ERR_NO_META_FOUND')}</div>
                                </div>
                                :
                                metaDetails.metaItem.content.type === 'Loading' ?
                                    <MetaPreview.Placeholder className={styles['meta-preview']} />
                                    :
                                    <div className={classnames(styles['details-layout'], { [styles['episodes-alongside']]: showListAlongside })}>
                                        <section className={classnames(styles['meta-preview'], styles['hero-section'], 'animation-fade-in')}>
                                            <div className={styles['hero-poster-column']}>
                                                {
                                                    typeof metaContent.poster === 'string' && metaContent.poster.length > 0 ?
                                                        <Image
                                                            className={styles['hero-poster']}
                                                            src={metaContent.poster}
                                                            alt={' '}
                                                            renderFallback={renderPosterImageFallback}
                                                        />
                                                        :
                                                        renderPosterImageFallback()
                                                }
                                            </div>
                                            <div className={styles['hero-content-column']}>
                                                {
                                                    typeof metaContent.logo === 'string' && metaContent.logo.length > 0 ?
                                                        <Image
                                                            className={styles['hero-logo']}
                                                            src={metaContent.logo}
                                                            alt={' '}
                                                            title={metaContent.name}
                                                            renderFallback={renderLogoFallback}
                                                        />
                                                        :
                                                        renderLogoFallback()
                                                }
                                                <div className={styles['hero-meta-row']}>
                                                    {
                                                        typeof metaContent.runtime === 'string' && metaContent.runtime.length > 0 ?
                                                            <div className={styles['hero-meta-pill']}>{metaContent.runtime}</div>
                                                            :
                                                            null
                                                    }
                                                    {
                                                        releaseLabel !== null ?
                                                            <div className={styles['hero-meta-pill']}>{releaseLabel}</div>
                                                            :
                                                            null
                                                    }
                                                    {
                                                        linksGroups.has(IMDB_LINK_CATEGORY) ?
                                                            <Button
                                                                className={styles['imdb-button']}
                                                                title={linksGroups.get(IMDB_LINK_CATEGORY).label}
                                                                href={linksGroups.get(IMDB_LINK_CATEGORY).href}
                                                                target={'_blank'}
                                                            >
                                                                <Icon className={styles['imdb-icon']} name={'imdb'} />
                                                                <span className={styles['imdb-label']}>{linksGroups.get(IMDB_LINK_CATEGORY).label}</span>
                                                            </Button>
                                                            :
                                                            null
                                                    }
                                                </div>
                                                {
                                                    genres.length > 0 ?
                                                        <div className={styles['genres-row']}>
                                                            {genres.map((genre) => (
                                                                <div key={genre} className={styles['genre-tag']}>{genre}</div>
                                                            ))}
                                                        </div>
                                                        :
                                                        null
                                                }
                                                {
                                                    typeof heroDescription === 'string' && heroDescription.length > 0 ?
                                                        <div className={styles['hero-summary']}>{heroDescription}</div>
                                                        :
                                                        null
                                                }
                                                <div className={styles['hero-actions-row']}>
                                                    {
                                                        metaItemActions.length > 0 ?
                                                            <ActionsGroup items={metaItemActions} className={styles['actions-group']} />
                                                            :
                                                            null
                                                    }
                                                    {
                                                        metaDetails.ratingInfo !== null ?
                                                            <Ratings
                                                                ratingInfo={metaDetails.ratingInfo}
                                                                className={styles['ratings-group']}
                                                            />
                                                            :
                                                            null
                                                    }
                                                </div>
                                            </div>
                                        </section>
                                        {
                                            showListAlongside ?
                                                streamPath !== null ?
                                                    <StreamsList
                                                        className={styles['streams-list']}
                                                        streams={metaDetails.streams}
                                                        video={video}
                                                        type={streamPath.type}
                                                        onEpisodeSearch={handleEpisodeSearch}
                                                    />
                                                    :
                                                    <VideosList
                                                        className={styles['videos-list']}
                                                        metaItem={metaDetails.metaItem}
                                                        libraryItem={metaDetails.libraryItem}
                                                        season={season}
                                                        selectedVideoId={metaDetails.libraryItem?.state?.video_id}
                                                        seasonOnSelect={seasonOnSelect}
                                                        toggleNotifications={toggleNotifications}
                                                    />
                                                :
                                                null
                                        }
                                    </div>
                }
                <div className={styles['spacing']} />
                {
                    streamPath !== null && !showListAlongside ?
                        <StreamsList
                            className={styles['streams-list']}
                            streams={metaDetails.streams}
                            video={video}
                            type={streamPath.type}
                            onEpisodeSearch={handleEpisodeSearch}
                        />
                        :
                        metaPath !== null && !showListAlongside ?
                            <VideosList
                                className={styles['videos-list']}
                                metaItem={metaDetails.metaItem}
                                libraryItem={metaDetails.libraryItem}
                                season={season}
                                selectedVideoId={metaDetails.libraryItem?.state?.video_id}
                                seasonOnSelect={seasonOnSelect}
                                toggleNotifications={toggleNotifications}
                            />
                            :
                            null
                }
            </div>
            {
                metaExtension !== null ?
                    <ModalDialog
                        className={styles['meta-extension-modal-container']}
                        title={metaExtension.name}
                        onCloseRequest={clearMetaExtension}>
                        <iframe
                            className={styles['meta-extension-modal-iframe']}
                            sandbox={'allow-forms allow-scripts allow-same-origin'}
                            src={metaExtension.url}
                        />
                    </ModalDialog>
                    :
                    null
            }
        </div>
    );
};

MetaDetails.propTypes = {
    urlParams: PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        videoId: PropTypes.string
    }),
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

const MetaDetailsFallback = () => (
    <div className={styles['metadetails-container']}>
        <HorizontalNavBar
            className={styles['nav-bar']}
            backButton={true}
            navMenu={true}
        />
    </div>
);

module.exports = withCoreSuspender(MetaDetails, MetaDetailsFallback);
