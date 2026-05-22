// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('@stremio/stremio-icons/react');
const { Button, Image } = require('wasser/components');
const useProfile = require('wasser/common/useProfile');
const SearchBar = require('./SearchBar');
const NavMenu = require('./NavMenu');
const styles = require('./styles.module.css');

const HorizontalNavBar = React.memo(({ className, route, query, title, backButton, searchBar, navMenu, ...props }) => {
    const profile = useProfile();
    const backButtonOnClick = React.useCallback(() => {
        window.history.back();
    }, []);
    const avatar = React.useMemo(() => (
        profile.auth === null ?
            '/assets/images/anonymous.png'
            :
            profile.auth.user.avatar ?
                profile.auth.user.avatar
                :
                '/assets/images/default_avatar.png'
    ), [profile.auth]);
    const renderNavMenuLabel = React.useCallback(({ ref, className, onClick, children, }) => (
        <Button ref={ref} className={classnames(className, styles['button-container'], styles['menu-button-container'])} tabIndex={-1} onClick={onClick}>
            <Image className={styles['avatar']} src={avatar} alt={' '} />
            {children}
        </Button>
    ), [avatar]);
    return (
        <nav {...props} className={classnames(className, styles['horizontal-nav-bar-container'])}>
            {
                backButton ?
                    <Button className={classnames(styles['button-container'], styles['back-button-container'])} tabIndex={-1} onClick={backButtonOnClick}>
                        <Icon className={styles['icon']} name={'chevron-back'} />
                    </Button>
                    :
                    <div className={styles['logo-container']}>
                        <Image
                            className={styles['logo']}
                            src={'/assets/images/navbar_logo.png'}
                            alt={' '}
                        />
                    </div>
            }
            {
                typeof title === 'string' && title.length > 0 ?
                    <h2 className={styles['title']}>{title}</h2>
                    :
                    null
            }
            {
                searchBar && route !== 'addons' ?
                    <SearchBar className={styles['search-bar']} query={query} active={route === 'search'} />
                    :
                    null
            }
            <div className={styles['buttons-container']}>
                {
                    navMenu ?
                        <NavMenu renderLabel={renderNavMenuLabel} />
                        :
                        null
                }
            </div>
        </nav>
    );
});

HorizontalNavBar.displayName = 'HorizontalNavBar';

HorizontalNavBar.propTypes = {
    className: PropTypes.string,
    route: PropTypes.string,
    query: PropTypes.string,
    title: PropTypes.string,
    backButton: PropTypes.bool,
    searchBar: PropTypes.bool,
    navMenu: PropTypes.bool
};

module.exports = HorizontalNavBar;
