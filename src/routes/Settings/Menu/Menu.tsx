import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useServices } from 'wasser/services';
import { Button } from 'wasser/components';
import { SECTIONS } from '../constants';
import { usePlatform } from 'wasser/common';
import { appVersion, commitHash } from 'wasser/common/buildInfo';
import styles from './Menu.module.css';

type Props = {
    selected: string,
    streamingServer: StreamingServer,
    onSelect: (event: React.MouseEvent<HTMLDivElement>) => void,
};

const Menu = ({ selected, streamingServer, onSelect }: Props) => {
    const { t } = useTranslation();
    const { shell } = useServices();
    const platform = usePlatform();

    const settings = useMemo(() => (
        streamingServer?.settings?.type === 'Ready' ?
            streamingServer.settings.content as StreamingServerSettings : null
    ), [streamingServer?.settings]);

    return (
        <div className={styles['menu']}>
            <Button className={classNames(styles['button'], { [styles['selected']]: selected === SECTIONS.GENERAL })} title={t('SETTINGS_NAV_GENERAL')} data-section={SECTIONS.GENERAL} onClick={onSelect}>
                { t('SETTINGS_NAV_GENERAL') }
            </Button>
            <Button className={classNames(styles['button'], { [styles['selected']]: selected === SECTIONS.INTERFACE })} title={t('INTERFACE')} data-section={SECTIONS.INTERFACE} onClick={onSelect}>
                { t('INTERFACE') }
            </Button>
            <Button className={classNames(styles['button'], { [styles['selected']]: selected === SECTIONS.PLAYER })} title={t('SETTINGS_NAV_PLAYER')} data-section={SECTIONS.PLAYER} onClick={onSelect}>
                { t('SETTINGS_NAV_PLAYER') }
            </Button>
            <Button className={classNames(styles['button'], { [styles['selected']]: selected === SECTIONS.STREAMING })} title={t('SETTINGS_NAV_STREAMING')} data-section={SECTIONS.STREAMING} onClick={onSelect}>
                { t('SETTINGS_NAV_STREAMING') }
            </Button>
            { !platform.isMobile && <Button className={classNames(styles['button'], { [styles['selected']]: selected === SECTIONS.SHORTCUTS })} title={t('SETTINGS_NAV_SHORTCUTS')} data-section={SECTIONS.SHORTCUTS} onClick={onSelect}>
                { t('SETTINGS_NAV_SHORTCUTS') }
            </Button> }

            <div className={styles['spacing']} />
            <div className={styles['version-info-label']} title={appVersion}>
                {t('SETTINGS_APP_VERSION')}: {appVersion}
            </div>
            <div className={styles['version-info-label']} title={commitHash}>
                {t('SETTINGS_BUILD_VERSION')}: {commitHash}
            </div>
            {
                settings?.serverVersion &&
                    <div className={styles['version-info-label']} title={settings.serverVersion}>
                        {t('SETTINGS_SERVER_VERSION')}: {settings.serverVersion}
                    </div>
            }
            {
                typeof shell?.transport?.props?.shellVersion === 'string' &&
                    <div className={styles['version-info-label']} title={shell.transport.props.shellVersion}>
                        {t('SETTINGS_SHELL_VERSION')}: {shell.transport.props.shellVersion}
                    </div>
            }
        </div>
    );
};

export default Menu;
