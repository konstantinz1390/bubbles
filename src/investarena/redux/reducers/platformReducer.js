import {
  AUTHORIZE_BROKER_ERROR,
  AUTHORIZE_BROKER_REQUEST,
  AUTHORIZE_BROKER_SUCCESS,
  FORGOT_PASS_BROKER_ERROR,
  FORGOT_PASS_BROKER_REQUEST,
  FORGOT_PASS_BROKER_SUCCESS,
  REGISTER_BROKER_ERROR,
  REGISTER_BROKER_REQUEST,
} from '../actions/brokersActions';
import {
  CONNECT_PLATFORM_ERROR,
  CONNECT_PLATFORM_REQUEST,
  CONNECT_PLATFORM_SUCCESS,
  UPDATE_USER_ACCOUNT_CURRENCY,
  UPDATE_USER_ACCOUNTS,
  UPDATE_USER_STATISTICS,
  USER_TRADING_SETTINGS,
} from '../actions/platformActions';
// import { SIGN_OUT_SUCCESS } from '../actions/authenticate/authenticate';

const initialState = {
  initialize: false,
  connect: false,
  platformName: 'widgets',
  userStatistics: {},
  userSettings: {},
  isLoading: false,
  accountCurrency: 'USD',
  currentAccountName: '',
  accounts: [],
};

export default function platformReducer (state = initialState, action) {
  switch (action.type) {
    case CONNECT_PLATFORM_REQUEST:
      return {
        ...state,
        initialize: true,
        connect: false,
        isLoading: true,
        platformName: 'widgets',
      };
    case CONNECT_PLATFORM_SUCCESS:
      return {
        ...state,
        initialize: true,
        connect: true,
        isLoading: false,
        platformName: action.payload,
      };
    case CONNECT_PLATFORM_ERROR:
      return {
        ...state,
        initialize: true,
        connect: false,
        isLoading: false,
        platformName: 'widgets',
      };
    case UPDATE_USER_STATISTICS:
      return { ...state, userStatistics: action.payload };
    case UPDATE_USER_ACCOUNT_CURRENCY:
      return { ...state, accountCurrency: action.payload };
    case UPDATE_USER_ACCOUNTS:
      return {
        ...state,
        currentAccountName: action.payload.currentAccountName,
        accounts: action.payload.accounts,
      };
    case AUTHORIZE_BROKER_REQUEST:
    case FORGOT_PASS_BROKER_REQUEST:
    case REGISTER_BROKER_REQUEST:
      return { ...state, isLoading: true };
    case AUTHORIZE_BROKER_SUCCESS:
    case AUTHORIZE_BROKER_ERROR:
    case REGISTER_BROKER_ERROR:
    case FORGOT_PASS_BROKER_SUCCESS:
    case FORGOT_PASS_BROKER_ERROR:
      return { ...state, isLoading: false };
    case USER_TRADING_SETTINGS:
      return { ...state, userSettings: action.payload };
    // case SIGN_OUT_SUCCESS:
    //     return initialState;
    default:
      return state;
  }
}
