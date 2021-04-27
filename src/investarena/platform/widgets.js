import _difference from 'lodash/difference';
import _filter from 'lodash/filter';
import _size from 'lodash/size';
import _sortBy from 'lodash/sortBy';
import config from '../configApi/config';
import { REDEFINED_TICK_SIZES } from '../constants/constantsWidgets';
import { PLATFORM_FACTOR } from '../constants/platform';
import {
  connectPlatformSuccess,
  connectPlatformError,
  updateUserAccountCurrency,
  updateUserStatistics, setUserTradingSettings,
} from '../redux/actions/platformActions';
import { getChartDataSuccess } from '../redux/actions/chartsActions';
import { updateQuotes } from '../redux/actions/quotesActions';
import { updateActiveQuotes, updateQuotesSettings } from '../redux/actions/quotesSettingsActions';

export class Widgets {
  constructor() {
    this.accountCurrency = 'USD';
    this.quotes = {};
    this.websocket = null;
    this.signals = [];
    this.quotesSettings = {};
    this.statesQuotes = {};
    this.userStatistics = { balance: '0', freeBalance: '0', marginUser: '0', totalEquity: '0', unrealizedPnl: '0' };
    this.userSettings = {};
    this.activeQuotes = [];
  }
  initialize({ dispatch }) {
    this.dispatch = dispatch;
    this.dispatch(setUserTradingSettings({}));
  }
  createWebSocketConnection() {
    const dispatchErrTimer = setTimeout(() => this.dispatch(connectPlatformError()), 3000);
    this.websocket = new WebSocket(config[process.env.NODE_ENV].brokerWSUrl.widgets);
    this.websocket.onopen = () => {
      console.log('onopen');
      clearInterval(dispatchErrTimer);
      this.dispatch(connectPlatformSuccess('widgets'));
      this.onConnect();
    };
    this.websocket.onerror = (evt) => {
      console.log('onerror', evt);
      clearInterval(dispatchErrTimer);
      this.dispatch(connectPlatformError());
      this.onError(evt);
    };
    this.websocket.onmessage = (evt) => {
      this.onWebSocketMessage(evt.data);
    };
    console.log(process.env.NODE_ENV);
    console.log(config[process.env.NODE_ENV].brokerWSUrl.widgets);
    console.log('createWebSocketConnection', this.websocket);
  }
  closeWebSocketConnection() {
    if (this.websocket) {
      this.websocket.close();
    }
  }
  onConnect() {
    this.subscribeRates();
    this.subscribeSettings();
    this.dispatch(updateUserStatistics({}));
    this.dispatch(updateUserAccountCurrency('USD'));
  }
  onError(error) {
    console.error(error);
  }
  onWebSocketMessage(data) {
    const msg = JSON.parse(data.trim());
    if (msg.module) {
      switch (msg.module) {
        case 'rates':
          this.parseRates(msg);
          break;
        case 'settings':
          this.parseSettings(msg);
          break;
        case 'history':
          this.parseChartData(msg);
          break;
        case 'error':
        default:
          break;
      }
    }
  }
  subscribeRates() {
    this.websocket.send(
      JSON.stringify({
        module: 'rates',
        cmd: 'subscribe',
      }),
    );
  }
  subscribeSettings() {
    this.websocket.send(
      JSON.stringify({
        module: 'settings',
        cmd: 'trading',
        args: '',
      }),
    );
  }
  getChartData(security, interval) {
    if (security && interval) {
      interval = interval.charAt(0) + interval.slice(1).toLowerCase();
      this.websocket.send(
        JSON.stringify({
          module: 'history',
          cmd: 'bars',
          args: {
            period: interval,
            quote: security,
            count: 250,
            name: 'name',
          },
        }),
      );
    }
  }
  parseRates(msg) {
    let data = {};
    if (msg.args) {
      msg.args.forEach((q) => {
        if (_size(this.quotes) !== 0 && this.quotes[q.Name]) {
          this.fixChange(q.Name, q, this.quotes[q.Name]);
        }
        this.quotes[q.Name] = {
          security: q.Name,
          bidPrice: q.Bid ? q.Bid : q.ESV,
          askPrice: q.Ask ? q.Ask : q.ESV,
          dailyChange: +q.Rate,
          timestamp: q.Timestamp,
          isSession: q.Sess === 'Open',
          state: this.statesQuotes[q.Name],
        };
        data[q.Name] = {
          security: q.Name,
          bidPrice: q.Bid ? q.Bid : q.ESV,
          askPrice: q.Ask ? q.Ask : q.ESV,
          dailyChange: +q.Rate,
          timestamp: q.Timestamp,
          isSession: q.Sess === 'Open',
          state: this.statesQuotes[q.Name],
        };
        if (this.hasOwnProperty('publish')) {
          this.publish(q.Name, this.quotes[q.Name]);
        }
      });
      const diff = _difference(Object.keys(this.quotes), this.activeQuotes);
      if (diff.length) {
        this.activeQuotes.push(...diff);
        this.dispatch(updateActiveQuotes(this.activeQuotes.sort()));
      }
      this.dispatch(updateQuotes(data));
    }
  }
  parseSettings(msg) {
    const quotesSettings = JSON.parse(msg.args);
    const keys = _filter(Object.keys(quotesSettings), key => {
      const quoteSettings = quotesSettings[key];
      return !(
        quoteSettings.minimumQuantity === quoteSettings.defaultQuantity &&
        quoteSettings.maximumQuantity === quoteSettings.defaultQuantity &&
        quoteSettings.quantityIncrement === quoteSettings.defaultQuantity &&
        quoteSettings.defaultQuantity === PLATFORM_FACTOR
      );
    });
    let sortedQuotesSettings = {};
    keys.sort();
    for (let key of keys) {
      sortedQuotesSettings[key] = quotesSettings[key];
      if (REDEFINED_TICK_SIZES[key]) {
        sortedQuotesSettings[key].tickSize = REDEFINED_TICK_SIZES[key];
      }
    }
    this.quotesSettings = sortedQuotesSettings;
    this.dispatch(updateQuotesSettings(this.quotesSettings));
  }
  parseChartData(msg) {
    if (msg.args) {
      const timeScale = msg.args.barType.toUpperCase();
      const quoteSecurity = msg.args.security.replace('/', '');
      let bars = [];
      msg.args.bars.forEach((e) => {
        bars.push({
          closeAsk: e.closeAsk * PLATFORM_FACTOR,
          closeBid: e.closeBid * PLATFORM_FACTOR,
          highAsk: e.highAsk * PLATFORM_FACTOR,
          highBid: e.highBid * PLATFORM_FACTOR,
          lowAsk: e.lowAsk * PLATFORM_FACTOR,
          lowBid: e.lowBid * PLATFORM_FACTOR,
          openAsk: e.openAsk * PLATFORM_FACTOR,
          openBid: e.openBid * PLATFORM_FACTOR,
          time: e.time * 1000,
        });
      });
      bars = _sortBy(bars, 'time');
      this.dispatch(getChartDataSuccess({ quoteSecurity, timeScale, bars }));
      if (this.hasOwnProperty('publish')) {
        this.publish(`ChartData${quoteSecurity}`, { quoteSecurity, timeScale, bars });
      }
    }
  }
  fixChange(security, quote, oldQuote) {
    const newPrice = quote.Bid;
    const oldPrice = oldQuote.bidPrice;
    if (newPrice !== oldPrice) {
      this.statesQuotes[security] = newPrice > oldPrice ? 'up' : 'down';
    }
  }
}
