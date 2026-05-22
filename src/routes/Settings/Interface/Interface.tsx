import React, { forwardRef } from 'react';
import { useServices } from 'wasser/services';
import { MultiselectMenu, Toggle } from 'wasser/components';
import { Section, Option } from '../components';
import useInterfaceOptions from './useInterfaceOptions';

type Props = {
    profile: Profile,
};

const Interface = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { shell } = useServices();

    const {
        interfaceLanguageSelect,
        quitOnCloseToggle,
        escExitFullscreenToggle,
        hideSpoilersToggle,
    } = useInterfaceOptions(profile);

    return (
        <Section ref={ref} label={'INTERFACE'}>
            <Option label={'SETTINGS_UI_LANGUAGE'}>
                <MultiselectMenu
                    className={'multiselect'}
                    {...interfaceLanguageSelect}
                />
            </Option>
            {
                shell.active &&
                    <Option label={'SETTINGS_QUIT_ON_CLOSE'}>
                        <Toggle
                            tabIndex={-1}
                            {...quitOnCloseToggle}
                        />
                    </Option>
            }
            {
                shell.active &&
                    <Option label={'SETTINGS_FULLSCREEN_EXIT'}>
                        <Toggle
                            tabIndex={-1}
                            {...escExitFullscreenToggle}
                        />
                    </Option>
            }
            <Option label={'SETTINGS_BLUR_UNWATCHED_IMAGE'}>
                <Toggle
                    tabIndex={-1}
                    {...hideSpoilersToggle}
                />
            </Option>
        </Section>
    );
});

export default Interface;
