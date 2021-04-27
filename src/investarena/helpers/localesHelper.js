import _get from 'lodash/get';
import locales from '../locales';

export const getFormattedMessage = (locale, messageId, defaultMessage) =>
    _get(
        locales,
        [locale, 'messages', messageId],
        defaultMessage || messageId,
    );
