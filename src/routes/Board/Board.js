// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const { useRouteFocused } = require('wasser-router');
const useTranslate = require('wasser/common/useTranslate');
const { useStreamingServer, useNotifications, withCoreSuspender, getVisibleChildrenRange, useProfile } = require('wasser/common');
const { ContinueWatchingItem, EventModal, MainNavBars, MetaItem, MetaRow } = require('wasser/components');
const useBoard = require('./useBoard');
const useContinueWatchingPreview = require('./useContinueWatchingPreview');
const styles = require('./styles.module.css');
const StreamingServerWarning = require('./StreamingServerWarning');

const THRESHOLD = 5;

const Board = () => {
    const t = useTranslate();
    const streamingServer = useStreamingServer();
    const continueWatchingPreview = useContinueWatchingPreview();
    const [board, loadBoardRows] = useBoard();
    const notifications = useNotifications();
    const profile = useProfile();
    const routeFocused = useRouteFocused();
    const boardCatalogsOffset = continueWatchingPreview.items.length > 0 ? 1 : 0;
    const scrollContainerRef = React.useRef();
    const showStreamingServerWarning = React.useMemo(() => {
        return streamingServer.settings !== null && streamingServer.settings.type === 'Err' && (
            isNaN(profile.settings.streamingServerWarningDismissed.getTime()) ||
            profile.settings.streamingServerWarningDismissed.getTime() < Date.now());
    }, [profile.settings, streamingServer.settings]);
    const onVisibleRangeChange = React.useCallback(() => {
        const range = getVisibleChildrenRange(scrollContainerRef.current);
        if (range === null) {
            return;
        }

        const start = Math.max(0, range.start - boardCatalogsOffset - THRESHOLD);
        const end = range.end - boardCatalogsOffset + THRESHOLD;
        if (end < start) {
            return;
        }

        loadBoardRows({ start, end });
    }, [boardCatalogsOffset]);
    const onScroll = React.useCallback(debounce(onVisibleRangeChange, 250), [onVisibleRangeChange]);
    React.useLayoutEffect(() => {
        onVisibleRangeChange();
    }, [board.catalogs, onVisibleRangeChange]);
    React.useLayoutEffect(() => {
        if (routeFocused && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
            onVisibleRangeChange();
        }
    }, [routeFocused, onVisibleRangeChange]);
    return (
        <div className={styles['board-container']}>
            <EventModal />
            <MainNavBars className={styles['board-content-container']} route={'board'}>
                <div ref={scrollContainerRef} className={styles['board-content']} onScroll={onScroll}>
                    {
                        continueWatchingPreview.items.length > 0 ?
                            <MetaRow
                                className={classnames(styles['board-row'], styles['continue-watching-row'], 'animation-fade-in')}
                                title={t.string('BOARD_CONTINUE_WATCHING')}
                                catalog={continueWatchingPreview}
                                itemComponent={ContinueWatchingItem}
                                notifications={notifications}
                            />
                            :
                            null
                    }
                    {board.catalogs.map((catalog, index) => {
                        switch (catalog.content?.type) {
                            case 'Ready': {
                                return (
                                    <MetaRow
                                        key={index}
                                        className={classnames(styles['board-row'], styles[`board-row-${catalog.content.content[0].posterShape}`], 'animation-fade-in')}
                                        catalog={catalog}
                                        itemComponent={MetaItem}
                                    />
                                );
                            }
                            case 'Err': {
                                return null;
                            }
                            default: {
                                return (
                                    <MetaRow.Placeholder
                                        key={index}
                                        className={classnames(styles['board-row'], styles['board-row-poster'], 'animation-fade-in')}
                                        catalog={catalog}
                                        title={t.catalogTitle(catalog)}
                                    />
                                );
                            }
                        }
                    })}
                </div>
            </MainNavBars>
            {
                showStreamingServerWarning ?
                    <StreamingServerWarning className={styles['board-warning-container']} />
                    :
                    null
            }
        </div>
    );
};

const BoardFallback = () => (
    <div className={styles['board-container']}>
        <MainNavBars className={styles['board-content-container']} route={'board'} />
    </div>
);

module.exports = withCoreSuspender(Board, BoardFallback);
