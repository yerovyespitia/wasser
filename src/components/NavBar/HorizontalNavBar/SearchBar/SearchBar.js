// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const { useTranslation } = require('react-i18next');
const Icon = require('@stremio/stremio-icons/react');
const { useRouteFocused } = require('wasser-router');
const Button = require('wasser/components/Button').default;
const TextInput = require('wasser/components/TextInput').default;
const usePlayUrl = require('wasser/common/usePlayUrl');
const { withCoreSuspender } = require('wasser/common/CoreSuspender');
const useSearchHistory = require('./useSearchHistory');
const useLocalSearch = require('./useLocalSearch');
const styles = require('./styles.module.css');
const useBinaryState = require('wasser/common/useBinaryState');

const SearchBar = React.memo(({ className, query, active }) => {
    const { t } = useTranslation();
    const routeFocused = useRouteFocused();
    const searchHistory = useSearchHistory();
    const localSearch = useLocalSearch();
    const { handlePlayUrl } = usePlayUrl();

    const [historyOpen, openHistory, closeHistory, ] = useBinaryState(query === null ? true : false);
    const [currentQuery, setCurrentQuery] = React.useState(query || '');
    const [expanded, setExpanded] = React.useState(active);

    const searchInputRef = React.useRef(null);
    const containerRef = React.useRef(null);

    const searchBarOnClick = React.useCallback(() => {
        if (!active) {
            setExpanded(true);
            openHistory();
        }
    }, [active, openHistory]);

    const searchHistoryOnClose = React.useCallback((event) => {
        if (historyOpen && containerRef.current && !containerRef.current.contains(event.target)) {
            closeHistory();
        }
        if (!active && expanded && containerRef.current && !containerRef.current.contains(event.target)) {
            setExpanded(false);
        }
    }, [active, expanded, historyOpen, closeHistory]);

    React.useEffect(() => {
        document.addEventListener('mousedown', searchHistoryOnClose);
        return () => {
            document.removeEventListener('mousedown', searchHistoryOnClose);
        };
    }, [searchHistoryOnClose]);

    const queryInputOnChange = React.useCallback(() => {
        const value = searchInputRef.current.value;
        setCurrentQuery(value);
        openHistory();
    }, [openHistory]);

    const queryInputOnPaste = React.useCallback((event) => {
        const pasted = event.clipboardData.getData('text');
        if (pasted) {
            handlePlayUrl(pasted);
        }
    }, [handlePlayUrl]);

    const queryInputOnSubmit = React.useCallback((event) => {
        event.preventDefault();
        const submittedQuery = event.target.value.trim();

        if (!submittedQuery) {
            return;
        }

        const searchValue = `/search?search=${encodeURIComponent(submittedQuery)}`;
        setCurrentQuery(submittedQuery);
        if (searchInputRef.current) {
            window.location.hash = searchValue;
            closeHistory();
        }
    }, []);

    const queryInputClear = React.useCallback(() => {
        searchInputRef.current.value = '';
        setCurrentQuery('');
        if (active) {
            window.location.hash = '/search';
            return;
        }

        setExpanded(false);
        closeHistory();
    }, [active, closeHistory]);

    const updateLocalSearchDebounced = React.useCallback(debounce((query) => {
        localSearch.search(query);
    }, 250), []);

    React.useEffect(() => {
        updateLocalSearchDebounced(currentQuery);
    }, [currentQuery]);

    React.useEffect(() => {
        if (routeFocused && (active || expanded)) {
            searchInputRef.current.focus();
        }
    }, [routeFocused, active, expanded]);

    React.useEffect(() => {
        setExpanded(active);
    }, [active]);

    React.useEffect(() => {
        setCurrentQuery(query || '');
    }, [query]);

    React.useEffect(() => {
        return () => {
            updateLocalSearchDebounced.cancel();
        };
    }, []);

    return (
        <div className={classnames(className, styles['search-bar-container'], { 'active': active })} onClick={searchBarOnClick} ref={containerRef}>
            {
                active || expanded ?
                    <TextInput
                        key={query}
                        ref={searchInputRef}
                        className={styles['search-input']}
                        type={'text'}
                        placeholder={t('SEARCH_OR_PASTE_LINK')}
                        defaultValue={query}
                        tabIndex={-1}
                        onChange={queryInputOnChange}
                        onPaste={queryInputOnPaste}
                        onSubmit={queryInputOnSubmit}
                        onClick={openHistory}
                    />
                    :
                    <div className={styles['search-input']}>
                        <div className={styles['placeholder-label']}>{ t('SEARCH_OR_PASTE_LINK') }</div>
                    </div>
            }
            {
                currentQuery.length > 0 ?
                    <Button className={styles['submit-button-container']} onClick={queryInputClear}>
                        <Icon className={styles['icon']} name={'close'} />
                    </Button>
                    :
                    <Button className={styles['submit-button-container']}>
                        <Icon className={styles['icon']} name={'search'} />
                    </Button>
            }
            {
                historyOpen && (searchHistory?.items?.length || localSearch?.items?.length) ?
                    <div className={styles['menu-container']}>
                        {
                            searchHistory?.items?.length > 0 ?
                                <div className={styles['items']}>
                                    <div className={styles['title']}>
                                        <div className={styles['label']}>{ t('STREMIO_TV_SEARCH_HISTORY_TITLE') }</div>
                                        <button className={styles['search-history-clear']} onClick={searchHistory.clear}>
                                            { t('CLEAR_HISTORY') }
                                        </button>
                                    </div>
                                    {
                                        searchHistory.items.slice(0, 8).map(({ query, deepLinks }, index) => (
                                            <Button key={index} className={styles['item']} href={deepLinks.search} onClick={closeHistory}>
                                                {query}
                                            </Button>
                                        ))
                                    }
                                </div>
                                :
                                null
                        }
                        {
                            localSearch?.items?.length ?
                                <div className={styles['items']}>
                                    <div className={styles['title']}>
                                        <div className={styles['label']}>{ t('SEARCH_SUGGESTIONS') }</div>
                                    </div>
                                    {
                                        localSearch.items.map(({ query, deepLinks }, index) => (
                                            <Button key={index} className={styles['item']} href={deepLinks.search} onClick={closeHistory}>
                                                {query}
                                            </Button>
                                        ))
                                    }
                                </div>
                                :
                                null
                        }
                    </div>
                    :
                    null
            }
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

SearchBar.propTypes = {
    className: PropTypes.string,
    query: PropTypes.string,
    active: PropTypes.bool
};

const SearchBarFallback = ({ className }) => {
    const { t } = useTranslation();
    return (
        <label className={classnames(className, styles['search-bar-container'])}>
            <div className={styles['search-input']}>
                <div className={styles['placeholder-label']}>{ t('SEARCH_OR_PASTE_LINK') }</div>
            </div>
            <Button className={styles['submit-button-container']} tabIndex={-1}>
                <Icon className={styles['icon']} name={'search'} />
            </Button>
        </label>
    );
};

SearchBarFallback.propTypes = SearchBar.propTypes;

module.exports = withCoreSuspender(SearchBar, SearchBarFallback);
