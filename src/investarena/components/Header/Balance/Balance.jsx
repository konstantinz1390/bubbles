import PropTypes from 'prop-types';
import React from 'react';
import { PLATFORM_FACTOR } from '../../../constants/platform';
import { currencyFormat } from '../../../platform/numberFormat';
import './Balance.scss';

const propTypes = {
  balanceType: PropTypes.string.isRequired,
  accountCurrency: PropTypes.string,
  platformConnect: PropTypes.bool.isRequired,
  userStatistics: PropTypes.number,
};

const defaultProps = {
  accountCurrency: 'USD',
  userStatistics: 0,
};

const Balance = ({ platformConnect, userStatistics, accountCurrency }) =>
  platformConnect ? (
    <div className="st-balance-amount">
      {userStatistics
        ? currencyFormat(userStatistics / PLATFORM_FACTOR, accountCurrency)
        : currencyFormat(0, accountCurrency)}
    </div>
  ) : (
    <div className="st-balance-amount">Loading...</div>
  );

Balance.propTypes = propTypes;
Balance.defaultProps = defaultProps;

export default Balance;
