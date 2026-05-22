// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { useServices } = require('wasser/services');
const LibItem = require('wasser/components/LibItem');

const ContinueWatchingItem = ({ _id, notifications, background, poster, posterShape, ...props }) => {
    const { core } = useServices();

    const onDismissClick = React.useCallback((event) => {
        event.preventDefault();
        if (typeof _id === 'string') {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'RewindLibraryItem',
                    args: _id
                }
            });
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'DismissNotificationItem',
                    args: _id
                }
            });
        }
    }, [_id]);

    return (
        <LibItem
            {...props}
            _id={_id}
            poster={typeof background === 'string' && background.length > 0 ? background : poster}
            posterShape={typeof background === 'string' && background.length > 0 ? 'landscape' : posterShape}
            hideOptions={true}
            posterChangeCursor={true}
            notifications={notifications}
            onDismissClick={onDismissClick}
            titleAction={'details'}
        />
    );
};

ContinueWatchingItem.propTypes = {
    _id: PropTypes.string,
    background: PropTypes.string,
    notifications: PropTypes.object,
    hideOptions: PropTypes.bool,
    poster: PropTypes.string,
    posterShape: PropTypes.oneOf(['poster', 'landscape', 'square']),
    titleAction: PropTypes.oneOf(['details']),
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
};

module.exports = ContinueWatchingItem;
