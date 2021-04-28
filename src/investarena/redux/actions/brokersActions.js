import { message } from 'antd';
import api from '../../configApi/apiResources';
import { getFormattedMessage } from '../../helpers/localesHelper';
import { clearBrokersData } from '../../helpers/localStorageHelpers';
import { singleton } from '../../platform/singletonPlatform';
import { deleteCookieClient } from './cookies';
import { toggleModal } from './modalsActions';
import { authorizeToken, connectPlatform } from './platformActions';

export const AUTHORIZE_BROKER_REQUEST = 'AUTHORIZE_BROKER_REQUEST';
export const AUTHORIZE_BROKER_SUCCESS = 'AUTHORIZE_BROKER_SUCCESS';
export const AUTHORIZE_BROKER_ERROR = 'AUTHORIZE_BROKER_ERROR';
export const REGISTER_BROKER_REQUEST = 'REGISTER_BROKER_REQUEST';
export const REGISTER_BROKER_SUCCESS = 'REGISTER_BROKER_SUCCESS';
export const REGISTER_BROKER_ERROR = 'REGISTER_BROKER_ERROR';
export const FORGOT_PASS_BROKER_REQUEST = 'FORGOT_PASS_BROKER_REQUEST';
export const FORGOT_PASS_BROKER_SUCCESS = 'FORGOT_PASS_BROKER_SUCCESS';
export const FORGOT_PASS_BROKER_ERROR = 'FORGOT_PASS_BROKER_ERROR';
export const DISCONNECT_BROKER_SUCCESS = 'DISCONNECT_BROKER_SUCCESS';
export const DISCONNECT_TOKEN_SUCCESS = 'DISCONNECT_BROKER_SUCCESS';

const cookiesData = ['platformName'];

export function authorizeBrokerRequest() {
  return { type: AUTHORIZE_BROKER_REQUEST };
}

export function authorizeBrokerSuccess() {
  return { type: AUTHORIZE_BROKER_SUCCESS };
}

export function authorizeBrokerError() {
  return { type: AUTHORIZE_BROKER_ERROR };
}

export function registerBrokerRequest() {
  return { type: REGISTER_BROKER_REQUEST };
}

export function registerBrokerSuccess() {
  return { type: REGISTER_BROKER_SUCCESS };
}

export function registerBrokerError() {
  return { type: REGISTER_BROKER_ERROR };
}

export function forgotBrokerPassRequest() {
  return { type: FORGOT_PASS_BROKER_REQUEST };
}

export function forgotBrokerPassSuccess() {
  return { type: FORGOT_PASS_BROKER_SUCCESS };
}

export function forgotBrokerPassError() {
  return { type: FORGOT_PASS_BROKER_ERROR };
}

export function disconnectTokenSuccess() {
  return { type: DISCONNECT_TOKEN_SUCCESS };
}

export function authorizeBroker(data) {
  return (dispatch) => {

    dispatch(authorizeBrokerRequest());
    // return api.brokers.authorizeBroker(data, getLanguageState(getState()))
    const language = 'en';
    return api.brokers.authorizeBroker(data, language)
      .then(({ status, message: resMessage, error = '', broker, response = '' }) => {
        if (!error && status && resMessage) {
          if (status === 'success') {
            dispatch(handleAuthBrokerSuccess(data.broker_name, broker.token));
            dispatch(toggleModal('broker'));
          } else if (status === 'error') {
            dispatch(authorizeBrokerError());
          }
          message[status](resMessage);
        } else {
          dispatch(authorizeBrokerError());
          message.error(resMessage);
        }
      });
  };
}
export function registerBroker(registrationData) {
  return dispatch => {
    dispatch(registerBrokerRequest());
    return api.brokers.registerBroker(registrationData, 'en-UK').then(({ status, error }) => {
      if (!error && status) {
        message.success('Registration success');
        if (status === 'success') {
          dispatch(registerBrokerSuccess());
          setTimeout(() => {
            dispatch(authorizeBroker(registrationData));
          }, 2000);
        } else if (status === 'error') {
          dispatch(registerBrokerError());
        }
      } else {
        dispatch(registerBrokerError());
        message.error(error.toString());
      }
    });
  };
}
export function disconnectBroker() {
  return (dispatch) => {
    clearBrokersData();
    deleteCookieClient(...cookiesData);
    dispatch(disconnectTokenSuccess());
    singleton.closeWebSocketConnection();
    singleton.platform = 'widgets';
    singleton.createWebSocketConnection();
    message.success(getFormattedMessage(
      'en',
      'brokerAction.disconnectBrokerSuccess',
      'Broker was successfully disconnected.',
    ));
    return { type: DISCONNECT_BROKER_SUCCESS };
  };
}
export function reconnectBroker(data) {
  // return (dispatch, getState) => {
  //   return api.brokers.reconnectBroker(data, locales[getLanguageState(getState())])
  //     .then(({ status, message, result, error }) => {
  //       if (!error && status && message) {
  //         if (result) {
  //           dispatch(connectPlatform());
  //         } else {
  //           dispatch(showNotification({ status: 'error', message }));
  //           dispatch(disconnectBroker());
  //         }
  //       } else {
  //         dispatch(showNotification({
  //           status: 'error',
  //           message: (error || locales[getLanguageState(getState())].messages['brokerAction.defaultPlatformError']).toString(),
  //         }));
  //       }
  //     });
  // };
  return dispatch =>
    api.brokers.reconnectBroker(data) // TODO: locales!!!
      .then(({ status, resMessage, result, error }) => {
        if (!error && status && resMessage) {
          if (result) {
            dispatch(connectPlatform());
          } else {
            message.error(resMessage);
            dispatch(disconnectBroker(true));
          }
        } else {
          message.error(error.toString());
        }
      });
}
export function forgotPassBroker(data) {
  return dispatch => {
    dispatch(forgotBrokerPassRequest());
    return api.brokers.forgotPassBroker(data, 'en').then(({ status, error }) => {
      // eslint-disable-next-line no-undef
      if (!error && status && messageresp) {
        if (status === 'success') {
          dispatch(forgotBrokerPassSuccess());
          message.success('Password successfully send to your email');
        } else {
          dispatch(forgotBrokerPassError());
          message.error(error.toString());
        }
      } else {
        dispatch(forgotBrokerPassError());
        message.error(error.toString());
      }
    });
  };
}

export function handleAuthBrokerSuccess(brokerName, token = '') {
  return dispatch => {
    dispatch(authorizeBrokerSuccess());
    if (token) dispatch(authorizeToken(token));
    singleton.closeWebSocketConnection();
    singleton.platform = brokerName;
    singleton.createWebSocketConnection();
  };
}
