import { Button } from 'antd';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { disconnectBroker } from '../../../redux/actions/brokersActions';
import { toggleModal } from '../../../redux/actions/modalsActions';
import { getModalIsOpenState } from '../../../redux/selectors/modalsSelectors';
import { getPlatformNameState } from '../../../redux/selectors/platformSelectors';
import ModalBroker from '../../Modals/ModalBroker/ModalBroker';
import AccountSwitcher from '../AccountSwitcher';
import Balance from '../Balance';
import './Broker.scss';

const Broker = () => {
  const isModalOpen = useSelector((state) => getModalIsOpenState(state, 'broker'));
  const platformName = useSelector(getPlatformNameState);
  const dispatch = useDispatch();
  const intl = useIntl();

  const handleClickConnect = () => {
    dispatch(toggleModal('broker'));
  };
  const handleClickDisconnect = () => {
    dispatch(disconnectBroker());
  };

  const isBrokerConnected = useMemo(() => platformName !== 'widgets', [platformName]);
  const brokerBtn = useMemo(() => isBrokerConnected ? (
    <Button type="primary st-broker-button" danger onClick={handleClickDisconnect}>
      {intl.formatMessage({ id: 'modalBroker.disconnect', defaultMessage: 'DISCONNECT' })}
    </Button>
  ) : (
    <Button type="primary st-broker-button" onClick={handleClickConnect}>
      {intl.formatMessage({ id: 'headerAuthorized.buttonConnectBroker', defaultMessage: 'Your broker' })}
    </Button>
  ), [isBrokerConnected]);

  return (
    <div className={classNames(
      'st-header-broker',
      { 'st-header-broker--disconnect': !isBrokerConnected }, // TODO: check needing, merge with "st-header-broker__wrap--width"
    )}
    >
      <div className="st-header-broker__balance-pl-wrap">
        {isBrokerConnected && (
          <React.Fragment>
            <div className="st-balance-wrap">
              <div className="st-balance-text">
                {intl.formatMessage({ id: 'headerAuthorized.freeBalance', defaultMessage: 'Free balance' })}:
              </div>
              <div className="st-balance-amount">
                <Balance balanceType="freeBalance"/>
              </div>
            </div>
            <div className="st-balance-wrap st-balance-wrap--border">
              <div className="st-balance-text">
                {intl.formatMessage({ id: 'headerAuthorized.p&l', defaultMessage: 'P&L deals' })}:
              </div>
              <div className="st-balance-amount">
                <Balance balanceType="unrealizedPnl"/>
              </div>
            </div>
            <div className="st-balance-wrap st-balance-wrap--border">
              <div className="st-balance-text">
                {intl.formatMessage({ id: 'headerAuthorized.balance', defaultMessage: 'Balance' })}:
              </div>
              <div className="st-balance-amount">
                <Balance balanceType="balance"/>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
      <div className={classNames(
        'st-connect-broker-block',
        { 'st-connect-broker-block-margin': !isBrokerConnected })}
      >
        <div className="st-connect-broker-title">
          {intl.formatMessage({ id: 'broker.title', defaultMessage: 'Broker' })}
        </div>
        {!isBrokerConnected
          ? (
            <div className="st-connect-broker-text">
              {intl.formatMessage({ id: 'headerAuthorized.textAttention1', defaultMessage: 'To start trading' })}
              <div>
                {intl.formatMessage({ id: 'headerAuthorized.textAttention2', defaultMessage: 'connect your broker' })}
              </div>
            </div>)
          : (
            <AccountSwitcher/>
          )
        }
        {brokerBtn}
      </div>
      {isModalOpen && <ModalBroker/>}
    </div>
  );
};

export default Broker;
