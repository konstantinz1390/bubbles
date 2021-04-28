import { message } from 'antd';
import Cookies from 'js-cookie';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _size from 'lodash/size';
import _some from 'lodash/some';
import _sortBy from 'lodash/sortBy';
import config from '../configApi/config';
import { REDEFINED_TICK_SIZES } from '../constants/constantsWidgets';
import { PLATFORM_FACTOR } from '../constants/platform';
import { getBrokersData } from '../helpers/localStorageHelpers';
import { disconnectBroker, reconnectBroker } from '../redux/actions/brokersActions';
import { getChartDataSuccess } from '../redux/actions/chartsActions';
import {
  changeOpenDealPlatformSuccess,
  closeOpenDealPlatformSuccess,
  getCloseDealsSuccess,
  getOpenDealsSuccess,
  setLimitOrders,
  updateClosedDealsForStatistics,
} from '../redux/actions/dealsActions';
import {
  changeUserAccount,
  connectPlatformError,
  connectPlatformSuccess,
  setUserTradingSettings,
  updateUserAccountCurrency,
  updateUserAccounts,
  updateUserStatistics,
} from '../redux/actions/platformActions';
import { updateQuotes } from '../redux/actions/quotesActions';
import { updateQuotesSettings } from '../redux/actions/quotesSettingsActions';
import { CMD, EVT, HOURS } from './platformData';

export class Umarkets {
  constructor() {
    this.getClosedDealsForStatistics = false; // TODO: check
    this.accountCurrency = 'USD';
    this.currentAccount = '';
    this.shouldUpdateClosedDealsStatistic = false;
    this.updateClosedDealsStatisticPeriod = null;
    this.lastClosedDealTime = null;
    this.quotes = {};
    this.quotesSettings = {};
    this.openDeals = {};
    this.charts = {};
    this.userStatistics = {};
    this.statesQuotes = {};
    this.userSettings = {};
    this.allFavorites = [];
    this.dataDealToApi = null;
    this.websocket = null;
    this.sid = null;
    this.reconnectionCounter = null;
    this.um_session = null;
    this.stompUser = null;
    this.stompPassword = null;
    this.platformName = null;
    this.hours = HOURS;
    this.activeQuotes = [];
  }
  static parseCloseMarketOrderResult(result) {
    if (result.response === 'NOT_TRADING_TIME') {
      message.error('Not trading time');
    } else if (result.response === 'CLOSE_DEAL_INTERVAL_IS_TOO_SMALL') {
      message.error('Wait 60 seconds after opening deal to close');
    }
  }
  static parseChangeMarketOrderResult(result) {
    if (result.response === 'NOT_TRADING_TIME') {
      message.error('Not trading time');
    } else if (result.response === 'INVALID_ORDER_PRICE') {
      message.error('Invalid order price');
    }
  }
  initialize(store) {
    this.store = store;
    this.dispatch = store.dispatch;
    this.dispatch(setUserTradingSettings({}));
  }
  createWebSocketConnection() {
    const { stompUser, stompPassword, sid, umSession, webSrv } = getBrokersData();
    this.stompUser = stompUser;
    this.stompPassword = stompPassword;
    this.sid = sid;
    this.um_session = umSession;
    this.websrv = webSrv;
    this.platformName = Cookies.get('platformName');

    this.websocket = new WebSocket(config[process.env.NODE_ENV].brokerWSUrl.proxyWsUrl);
    this.websocket.onopen = () => {
      this.websocket.send(JSON.stringify({
        event: EVT.login,
        data: {
          sid: this.sid,
          umid: this.um_session,
          cmd: CMD.login,
          web_srv: this.websrv || '4',
          stomp_user: this.stompUser,
          stomp_password: this.stompPassword,
          domain: config[process.env.NODE_ENV].brokerWSUrl.platformDomain[this.platformName],
        },
      }));
    };
    this.websocket.onerror = (evt) => {
      this.onError(evt);
    };
    this.websocket.onmessage = (evt) => {
      this.onWebSocketMessage(evt.data);
    };
    this.websocket.onclose = () => {
      this.closeWebSocketConnection();
    };
  }
  closeWebSocketConnection() {
    if (this.websocket) {
      this.websocket.close();
    }
  }
  onConnect() {
    // const data = { broker_name: this.platformName };
    // setTimeout(() => this.dispatch(getLastClosedDealForStatistics(data)), 7000);

    this.dispatch(connectPlatformSuccess(this.platformName));
    // this.dispatch(updateUserInfo({ recommended_broker: this.platformName }));

    // if (getQueryParam('auth_token')) browserHistory.push('/');

    if (this.websocket !== null && this.websocket.readyState === 1 && this.sid !== null && this.um_session) {
      this.getStartData();
    }

    setInterval(this.getUserStatistics.bind(this), 30000);
  }
  onError(error) {
    this.dispatch(connectPlatformError(error));
    this.reconnect();
  }
  reconnect() {
    if (this.reconnectionCounter !== 1) {
      this.reconnectionCounter = 1;
      if (this.websocket) {
        this.websocket.close();
      }
      const data = {
        broker_name: this.platformName,
        stomp_user: this.stompUser,
        stomp_password: this.stompPassword,
        um_session: this.um_session,
        web_srv: this.websrv,
      };
      this.dispatch(reconnectBroker(data));
    } else {
      this.dispatch(disconnectBroker());
    }
  }
  getStartData() {
    this.getServerTime();
    this.getUserSettings();
    this.getUserStatistics();
    this.getUserRates();
    this.getOpenDeals();
    this.getClosedDeals();
    // this.getFavorites();
    // this.getLimitStopOrders();
  }
  getServerTime() {
    this.sendRequestToPlatform(CMD.getTime);
  }
  getUserAccount() {
    this.sendRequestToPlatform(CMD.getUserAccount);
  }
  getUserSettings() {
    this.sendRequestToPlatform(CMD.getUserSettings);
  }
  getUserStatistics() {
    this.sendRequestToPlatform(CMD.getUserStatistics);
  }
  getUserRates() {
    this.sendRequestToPlatform(CMD.getUserRates);
  }
  getOpenDeals() {
    this.sendRequestToPlatform(CMD.getOpenDeals);
  }
  getClosedDeals(period = 'LAST_7_DAYS') {
    this.sendRequestToPlatform(CMD.getClosedDeals, [period, null, null]);
  }
  getLimitStopOrders() {
    this.sendRequestToPlatform(CMD.getLimitStopOrders);
  }
  changeAccount(accountName) {
    this.sendRequestToPlatform(CMD.changeAccount, [accountName]);
    this.dispatch(changeUserAccount());
  }
  // getAppIdentity(callerKey) {
  //   return JSON.stringify({
  //     OS: getOS(),
  //     App: config.app,
  //     Version: config.version,
  //     Caller: CALLERS[callerKey],
  //   });
  // }
  // createOpenDeal(deal, dataDealToApi, callerKey) {
  //   this.dataDealToApi = dataDealToApi;
  //   this.sendRequestToPlatform(
  //     CMD.sendOpenMarketOrder,
  //     `["${deal.security}","${deal.side}","${deal.amount}","${config.appVersion}"]`,
  //     this.getAppIdentity(callerKey),
  //   );
  // }
  // closeOpenDeal(dealId, callerKey) {
  //   this.sendRequestToPlatform(
  //     CMD.sendCloseMarketOrder,
  //     `["${dealId}","${config.appVersion}"]`,
  //     this.getAppIdentity(callerKey),
  //   );
  // }
  // changeAccount(accountName) {
  //   this.sendRequestToPlatform(CMD.changeAccount, `[${accountName}]`);
  // }
  // duplicateOpenDeal(dealId, dataDealToApi) {
  //   this.dataDealToApi = dataDealToApi;
  //   this.sendRequestToPlatform(CMD.duplicateOpenDeal, `[${dealId},"${config.appVersion}"]`);
  // }
  // changeOpenDeal(id, slRate = null, slAmount = null, tpRate = null, tpAmount = null) {
  //   this.sendRequestToPlatform(
  //     CMD.changeOpenDeal,
  //     `[${id},${slRate},${slAmount},${tpRate},${tpAmount},"${config.appVersion}"]`,
  //   );
  // }
  // getLimitStopOrders() {
  //   this.sendRequestToPlatform(CMD.getLimitStopOrders, '[]');
  // }
  // getChartData(active, interval) {
  //   if (active && interval) {
  //     if (this.stompClient !== null && this.sid !== null && this.um_session !== null) {
  //       let chartsArr = [[active, interval]];
  //       chartsArr = JSON.stringify(chartsArr);
  //       this.stompClient.send(
  //         '/exchange/CMD/',
  //         {},
  //         `{"sid":"${this.sid}", "umid": "${this.um_session}", "cmd" : "${CMD.getChartData}", "array": ${chartsArr}}`,
  //       );
  //     }
  //   }
  // }
  sendRequestToPlatform(cmd, params) {
    if (
      this.websocket !== null &&
      this.websocket.readyState === 1 &&
      this.sid !== null &&
      this.um_session !== null
    ) {
      try {
        this.websocket.send(JSON.stringify({
          event: EVT.command,
          data: {
            sid: this.sid,
            umid: this.um_session,
            cmd,
            params,
          },
        }));
      } catch (e) {
        this.onError(e);
      }
    }
  }
  onWebSocketMessage(message) {
    const result = JSON.parse(message);
    if (result.event !== 'response') return;
    if (result.data.type === 'response' || result.data.type === 'update') {
      switch (result.data.cmd) {
        case CMD.getLimitStopOrders:
          this.handleOrderLimit(result);
          break;
        case CMD.getUserRates:
          this.parseUserRates(result);
          break;
        case CMD.getUserStatistics:
          this.parseUserStatistics(result);
          break;
        case CMD.getUserSettings:
          this.parseUserSettings(result);
          break;
        case CMD.getUserAccount:
          this.parseUserAccount(result);
          break;
        case CMD.getOpenDeals:
          this.parseOpenDeals(result);
          break;
        case CMD.getClosedDeals:
          this.parseClosedDeals(result);
          break;
        // case CMD.getFavorites:
        //   this.parseFavorites(result);
        //   break;
        case CMD.getChartData:
          this.parseChartData(result);
          break;
        case CMD.sendCloseMarketOrder:
          Umarkets.parseCloseMarketOrderResult(result);
          break;
        case CMD.changeOpenDeal:
          Umarkets.parseChangeMarketOrderResult(result);
          break;
        case CMD.sendOpenMarketOrder:
        case CMD.openMarketOrderRejected:
        case CMD.duplicateOpenDeal:
          this.parseOpenMarketOrderResult(result);
          break;
        // case CMD.changeOrder:
        //   this.changeOrderLimit(result);
        //   break;
        // case CMD.cancelOrder:
        //   this.deleteLimitOrder(result);
        //   break;
        // case CMD.cancelOrderBracket:
        //   this.parseCancelOrderBracket(result);
        //   break;
        // case CMD.sendOrder:
        //   this.sendOrder(result);
        //   break;
        case CMD.login:
          this.onConnect();
          break;
        default:
          break;
      }
    } else if (result.data.type === 'event') {
      switch (result.data.name) {
        case CMD.dealOpenedByMarketOrder:
          this.parseOpenByMarketOrder(result);
          break;
        case CMD.dealClosedByBracketOrder:
        case CMD.dealClosedByMarketOrder:
          this.parseCloseByMarketOrder(result);
          break;
        case CMD.openDealChanged:
          this.parseChangeByMarketOrder(result);
          break;
        // case CMD.favoritesSecurityAdded:
        // case CMD.favoritesSecurityRemoved:
        //   this.parseUpdateFavorites(result);
        //   break;
        // case CMD.limitOrderSubmitted:
        // case CMD.stopOrderSubmitted:
        //   this.createLimitOrder(result);
        //   break;
        // case CMD.stopOrderCanceled:
        //   this.deleteLimitOrder(result);
        //   break;
        // case CMD.limitOrderCanceled:
        //   this.deleteLimitOrder(result);
        //   break;
        // case CMD.stopOrderChanged:
        //   this.changeOrderLimit(result);
        //   break;
        // case CMD.limitOrderChanged:
        //   this.changeOrderLimit(result);
        //   break;
        // case CMD.dealOpenedByLimitOrder:
        //   this.dealOpenByLimitOrder(result);
        //   break;
        // case CMD.dealOpenedByStopOrder:
        //   this.dealOpenByLimitOrder(result);
        //   break;
        default:
          break;
      }
    } else if (result.data.type === 'error') {
      this.onError(result.data);
    }
  }
  parseUserAccount(result) {
    if (result.data.content && result.data.content.currency) {
      this.dispatch(updateUserAccountCurrency(result.data.content.currency));
      this.accountCurrency = result.data.content.currency;
      this.getServerTime();
      this.getUserStatistics();
      this.getOpenDeals();
      this.getClosedDeals();
      this.getLimitStopOrders();
    }
  }
  parseUserRates(result) {
    const content = result.data.content;
    const rates = content.rates;
    const data = {};
    rates.forEach((q) => {
      const security = q.security || q.s;
      const bidPrice = q.bidPrice || q.bp;
      const askPrice = q.askPrice || q.ap;
      const dailyChange = q.dailyChange || q.dc;
      const timestamp = q.timestamp || q.t;
      if (_size(this.quotes) !== 0 && security in this.quotes) {
        this.fixChange(security, q, this.quotes[security]);
      }
      this.quotes[security] = {
        security,
        bidPrice: (bidPrice / PLATFORM_FACTOR).toString(),
        askPrice: (askPrice / PLATFORM_FACTOR).toString(),
        dailyChange,
        timestamp,
        state: this.statesQuotes[security],
      };
      data[security] = {
        security,
        bidPrice: (bidPrice / PLATFORM_FACTOR).toString(),
        askPrice: (askPrice / PLATFORM_FACTOR).toString(),
        dailyChange,
        timestamp,
        state: this.statesQuotes[security],
      };
      if (this.hasOwnProperty('publish')) {
        this.publish(security, this.quotes[security]);
      }
    });
    // const diff = _difference(Object.keys(this.quotes), this.activeQuotes);
    // if (diff.length) {
    //   this.activeQuotes.push(...diff);
    //   this.dispatch(updateActiveQuotes(this.activeQuotes.sort()));
    // }
    this.dispatch(updateQuotes(data));
  }
  fixChange(security, quote, oldQuote) {
    const newPrice = quote.bidPrice || quote.bp;
    const oldPrice = oldQuote.bidPrice * PLATFORM_FACTOR;
    if (newPrice !== oldPrice) {
      this.statesQuotes[security] = newPrice > oldPrice ? 'up' : 'down';
    }
  }
  parseUserSettings(result) {
    const content = result.data.content;
    const quotesSettings = content.securitySettings;
    const tradingSessions = content.tradingSessions;
    const keys = Object.keys(quotesSettings);
    let sortedQuotesSettings = {};
    const currentTime = Date.now();
    keys.sort();
    for (const key of keys) {
      sortedQuotesSettings[key] = quotesSettings[key];
      sortedQuotesSettings[key].isSession = _some(tradingSessions[sortedQuotesSettings[key].calendarCodeId], item =>
        currentTime < item.sessionEnd && currentTime > item.sessionStart,
      );
      if (REDEFINED_TICK_SIZES[key]) {
        sortedQuotesSettings[key].tickSize = REDEFINED_TICK_SIZES[key];
      }
    }
    if (content.accounts && content.currentAccountName) {
      this.dispatch(updateUserAccounts({
        currentAccountName: content.currentAccountName,
        accounts: content.accounts,
      }));
      const currentAccount = _filter(content.accounts, option => option.name === content.currentAccountName);
      if (
        currentAccount[0] &&
        currentAccount[0].id &&
        this.currentAccount !== currentAccount[0].id
      ) {
        this.getUserAccount(currentAccount[0].id);
        this.currentAccount = currentAccount[0].id;
      }
    }
    const userTradingSettings = {
      takeProfitMinPercent: content.takeProfitMinPercent / PLATFORM_FACTOR,
      takeProfitMaxPercent: content.takeProfitMaxPercent / PLATFORM_FACTOR,
      stopPriceMinPercent: content.stopPriceMinPercent / PLATFORM_FACTOR,
      stopPriceMaxPercent: content.stopPriceMaxPercent / PLATFORM_FACTOR,
      stopLossMinPercent: content.stopLossMinPercent / PLATFORM_FACTOR,
      stopLossMaxPercent: content.stopLossMaxPercent / PLATFORM_FACTOR,
      limitPriceMinPercent: content.limitPriceMinPercent / PLATFORM_FACTOR,
      limitPriceMaxPercent: content.limitPriceMaxPercent / PLATFORM_FACTOR,
      closeDealMinInterval: content.closeDealMinInterval / PLATFORM_FACTOR,
    };
    this.quotesSettings = sortedQuotesSettings;
    this.userSettings = { ...content, ...userTradingSettings };
    this.dispatch(updateQuotesSettings(this.quotesSettings));
    this.dispatch(setUserTradingSettings({ userTradingSettings }));
  }
  parseChartData(result) {
    const chart = result.data.content;
    const quoteSecurity = chart.security;
    const timeScale = chart.barType;
    const bars = _map(chart.bars, bar => ({
      closeAsk: bar.closeAsk || bar.ca,
      closeBid: bar.closeBid || bar.cb,
      highAsk: bar.highAsk || bar.ha,
      highBid: bar.highBid || bar.hb,
      lowAsk: bar.lowAsk || bar.la,
      lowBid: bar.lowBid || bar.lb,
      openAsk: bar.openAsk || bar.oa,
      openBid: bar.openBid || bar.ob,
      time: bar.time || bar.t,
    }));
    this.dispatch(getChartDataSuccess({ quoteSecurity, timeScale, bars }));
    if (this.hasOwnProperty('publish')) {
      this.publish(`ChartData${quoteSecurity}`, { quoteSecurity, timeScale, bars });
    }
  }
  parseOpenDeals(result) {
    const openDeals = _sortBy(result.data.content, 'dealSequenceNumber').reverse();
    const openDealsById = {};
    // const dealsMapped = [];
    openDeals.forEach((openDeal) => {
      openDeal.openPrice = openDeal.openPrice / PLATFORM_FACTOR;
      openDeal.amount = openDeal.amount / PLATFORM_FACTOR;
      openDealsById[openDeal.dealId] = openDeal;
      // dealsMapped.push({
      //   amount: openDeal.amount,
      //   deal_id: openDeal.dealId,
      //   deal_sequence_number: openDeal.dealSequenceNumber,
      //   good_till_date: openDeal.goodTillDate,
      //   open_price: openDeal.openPrice,
      //   open_time: openDeal.openTime,
      //   security: openDeal.security,
      //   side: openDeal.side,
      // });
    });
    this.dispatch(getOpenDealsSuccess(openDealsById));
    // this.dispatch(updateOpenDealsForStatistics({ open_deals: dealsMapped }));

    // const state = this.store.getState();
    // const isOpenEditModal = getModalIsOpenState(state, MODAL_TYPES.EDIT_DEALS);
    // const editModalInfo = getModalInfoState(state, MODAL_TYPES.EDIT_DEALS);
    // if (isOpenEditModal && _keys(editModalInfo).length <= 1) {
    //   this.dispatch(setModalInfo(MODAL_TYPES.EDIT_DEALS, openDealsById[_first(_keys(openDealsById))]));
    // }
  }
  parseClosedDeals(result) {
    const content = result.data.content;
    if (this.shouldUpdateClosedDealsStatistic && content.rageType === this.updateClosedDealsStatisticPeriod) {
      this.shouldUpdateClosedDealsStatistic = false;
      this.updateClosedDealsStatisticPeriod = null;
      const unaccountedDeals = content.closedDeals
        .filter((closedDeal) => closedDeal.closeTime > this.lastClosedDealTime);
      if (unaccountedDeals.length > 0) {
        const dealsMapped = content.closedDeals.map((deal) => ({
          deal_id: deal.dealId,
          deal_sequence_number: deal.dealSequenceNumber,
          security: deal.security,
          side: deal.side,
          amount: deal.amount / PLATFORM_FACTOR,
          open_price: deal.openPrice / PLATFORM_FACTOR,
          open_time: deal.openTime,
          close_price: deal.closePrice / PLATFORM_FACTOR,
          close_time: deal.closeTime,
          rollover_commission: deal.rolloverCommission,
          pnl: deal.pnl / PLATFORM_FACTOR,
          broker_name: this.platformName,
        }));
        this.dispatch(updateClosedDealsForStatistics({ closed_deals: dealsMapped }));
      }
    } else {
      const deals = _sortBy(content.closedDeals, 'closeTime').reverse();
      const closedDeals = deals.reduce((acc, deal) => {
        acc[deal.dealId] = {
          ...deal,
          amount: deal.amount / PLATFORM_FACTOR,
          pnl: deal.pnl / PLATFORM_FACTOR,
          openPrice: deal.openPrice / PLATFORM_FACTOR,
          closePrice: deal.closePrice / PLATFORM_FACTOR,
        };
        return acc;
      }, {});
      this.dispatch(getCloseDealsSuccess(closedDeals));
    }
  }
  parseUserStatistics(result) {
    let content = result.data.content;
    this.userStatistics = {
      balance: content.balance || content.b,
      freeBalance: content.freeBalance || content.fb,
      marginUsed: content.marginUsed || content.mu,
      totalEquity: content.totalEquity || content.te,
      unrealizedPnl: content.unrealizedPnl || content.up,
    };
    this.dispatch(updateUserStatistics(this.userStatistics));
  }
  parseOpenMarketOrderResult(result) {
    // const state = this.store.getState();
    // const isOpenEditModal = getModalIsOpenState(state, MODAL_TYPES.EDIT_DEALS);
    // const editModalInfo = getModalInfoState(state, MODAL_TYPES.EDIT_DEALS);
    // const isEmptyModalInfo = _keys(editModalInfo).length <= 1;

    if (result.data.response === 'INSUFFICIENT_BALANCE') {
      this.dataDealToApi = null;
      message.error('Insufficient balance');
      // if (isOpenEditModal && isEmptyModalInfo) {
      //   this.dispatch(toggleModal(MODAL_TYPES.EDIT_DEALS));
      // }
    } else if (result.data.response === 'NOT_TRADING_TIME') {
      this.dataDealToApi = null;
      message.error('Not trading time');
      // if (isOpenEditModal && isEmptyModalInfo) {
      //   this.dispatch(toggleModal(MODAL_TYPES.EDIT_DEALS));
      // }
    }
  }
  parseOpenByMarketOrder(result) {
    this.getOpenDeals();
    message.success('Deal successfully opened');
    if (this.dataDealToApi) {
      this.dataDealToApi.deal_id = result.data.content.dealId;
      // this.dispatch(createOpenDealApi({ ...this.dataDealToApi, source_type: getDealSourceType(this.store.getState()) }));
      this.dataDealToApi = null;
      // this.dispatch(updateSourceType(''));
    }
  }
  parseCloseByMarketOrder(result) {
    message.success('Deal successfully closed');
    this.dispatch(closeOpenDealPlatformSuccess(result.data.content.dealId));
  }
  parseChangeByMarketOrder(result) {
    const content = result.data.content;
    if (content.stopLossAmount) {
      content.stopLossPrice = null;
    } else if (content.stopLossPrice) {
      content.stopLossAmount = null;
    } else {
      content.stopLossPrice = null;
      content.stopLossAmount = null;
    }
    if (content.takeProfitAmount) {
      content.takeProfitPrice = null;
    } else if (content.takeProfitPrice) {
      content.takeProfitAmount = null;
    } else {
      content.takeProfitPrice = null;
      content.takeProfitAmount = null;
    }
    message.success('Deal successfully updated');
    this.dispatch(changeOpenDealPlatformSuccess(content));
  }
  handleOrderLimit = (result) => {
    const limitOrders = result.data.content.map(item => {
      const limitOrder = {
        ...item,
        amount: item.amount / PLATFORM_FACTOR,
      };
      if (item.limitPrice) limitOrder.limitPrice = item.limitPrice / PLATFORM_FACTOR;
      if (item.stopPrice) limitOrder.stopPrice = item.stopPrice / PLATFORM_FACTOR;
      return limitOrder;
    });
    this.dispatch(setLimitOrders(limitOrders));
  };
}
