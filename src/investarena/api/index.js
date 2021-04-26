import Brokers from './Brokers';
import Deals from './Deals';
import Charts from './Charts';
import Signals from './Signals';
import Authentications from './authentications/Authentications';
import Performers from './Performers';
import Forecasts from './Forecasts';
import Statistics from './Statistics';
import ApiClient from './ApiClient';
import QuickForecast from './QuickForecast';

export default function({ apiPrefix } = {}) {
  const api = new ApiClient({ prefix: apiPrefix });
  const apiForecast = new ApiClient({ prefix: '' });

  return {
    authentications: new Authentications({ apiClient: api }),
    brokers: new Brokers({ apiClient: api }),
    deals: new Deals({ apiClient: api }),
    charts: new Charts({ apiClient: api }),
    signals: new Signals({ apiClient: api }),
    performers: new Performers({ apiClient: api }),
    forecasts: new Forecasts({ apiClient: api }),
    quickForecast: new QuickForecast({ apiClient: apiForecast }),
    statistics: new Statistics({ apiClient: api }),
  };
}
