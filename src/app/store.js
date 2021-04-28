import { configureStore } from '@reduxjs/toolkit';
import chartsReducer from '../investarena/redux/reducers/chartsReducer';
import dealsReducer from '../investarena/redux/reducers/dealsReducer';
import localeReducer from '../investarena/redux/reducers/localeReducer';
// import forecastReducer from '../investarena/redux/reducers/forecastReducer';
import modalsReducer from '../investarena/redux/reducers/modalsReducer';
import platformReducer from '../investarena/redux/reducers/platformReducer';
import quotesReducer from '../investarena/redux/reducers/quotesReducer';
import quotesSettingsReducer from '../investarena/redux/reducers/quotesSettingsReducer';
import topPerformersReducer from '../investarena/redux/reducers/topPerformersReducer';

export const store = configureStore({
  reducer: {
    charts: chartsReducer,
    deals: dealsReducer,
    // forecast: forecastReducer,
    modals: modalsReducer,
    platform: platformReducer,
    quotes: quotesReducer,
    quotesSettings: quotesSettingsReducer,
    topPerformers: topPerformersReducer,
    language: localeReducer,
  },
});
