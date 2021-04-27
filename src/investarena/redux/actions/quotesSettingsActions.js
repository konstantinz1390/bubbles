export const UPDATE_QUOTES_SETTINGS = 'UPDATE_QUOTES_SETTINGS';
export const UPDATE_ACTIVE_QUOTES = 'UPDATE_ACTIVE_QUOTES';

export function updateQuotesSettings(quotesSettings) {
  return { type: UPDATE_QUOTES_SETTINGS, payload: quotesSettings };
}
export const updateActiveQuotes = (keys) => ({ type: UPDATE_ACTIVE_QUOTES, payload: keys });
