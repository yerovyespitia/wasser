// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslate } = require('wasser/common');

const ALLOWED_TYPES = new Set([null, 'movie', 'series']);

const mapSelectableInputs = (library, t) => {
    const availableTypes = library.selectable.types.filter(({ type }) => ALLOWED_TYPES.has(type));
    const selectedType = availableTypes.find(({ selected }) => selected) || availableTypes.find(({ type }) => type === null);
    const typeSelect = {
        options: availableTypes
            .map(({ type, deepLinks }) => ({
                value: deepLinks.library,
                label: type === null ? t.string('TYPE_ALL') : t.stringWithPrefix(type, 'TYPE_')
            })),
        value: selectedType?.deepLinks.library,
        onSelect: (value) => {
            window.location = value;
        }
    };
    return [typeSelect, library.selectable.nextPage];
};

const useSelectableInputs = (library) => {
    const t = useTranslate();
    const selectableInputs = React.useMemo(() => {
        return mapSelectableInputs(library, t);
    }, [library]);
    return selectableInputs;
};

module.exports = useSelectableInputs;
