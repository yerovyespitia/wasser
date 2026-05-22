import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from 'wasser/services';
import { appVersion, commitHash } from 'wasser/common/buildInfo';
import { Option, Section } from '../components';
import styles from './Info.module.css';

type Props = {
    streamingServer: StreamingServer,
};

const Info = ({ streamingServer }: Props) => {
    const { shell } = useServices();
    const { t } = useTranslation();

    const settings = useMemo(() => (
        streamingServer?.settings?.type === 'Ready' ?
            streamingServer.settings.content as StreamingServerSettings : null
    ), [streamingServer?.settings]);

    return (
        <Section className={styles['info']}>
            <Option label={t('SETTINGS_APP_VERSION')}>
                <div className={styles['label']}>
                    {appVersion}
                </div>
            </Option>
            <Option label={t('SETTINGS_BUILD_VERSION')}>
                <div className={styles['label']}>
                    {commitHash}
                </div>
            </Option>
            {
                settings?.serverVersion &&
                    <Option label={t('SETTINGS_SERVER_VERSION')}>
                        <div className={styles['label']}>
                            {settings.serverVersion}
                        </div>
                    </Option>
            }
            {
                typeof shell?.transport?.props?.shellVersion === 'string' &&
                    <Option label={t('SETTINGS_SHELL_VERSION')}>
                        <div className={styles['label']}>
                            {shell.transport.props.shellVersion}
                        </div>
                    </Option>
            }
        </Section>
    );
};

export default Info;
