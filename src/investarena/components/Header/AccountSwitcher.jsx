import { Select } from 'antd';
import _map from 'lodash/map';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { singleton } from '../../platform/singletonPlatform';
import {
  getIsLoadingPlatformState,
  getPlatformCurrentAccountState,
  getPlatformUserAccountsState,
} from '../../redux/selectors/platformSelectors';

const AccountSwitcher = () => {
  const currentAccountName = useSelector(getPlatformCurrentAccountState);
  const accounts = useSelector(getPlatformUserAccountsState);
  const isLoading = useSelector(getIsLoadingPlatformState);
  const intl = useIntl();

  const accountsOptions = useMemo(() => _map(accounts, account => ({
    value: account.id,
    label: account.name,
  })), [accounts]);

  const changeAccount = (value) => {
    singleton.platform.changeAccount(value);
  };

  return (
    <div className="st-account-switcher">
      {accounts && accounts.length && currentAccountName ? (
        <div className="st-account-switcher-select">
          <Select
            loading={isLoading}
            disabled={isLoading}
            dropdownClassName="st-broker-select-platform"
            options={accountsOptions}
            value={currentAccountName}
            onChange={changeAccount}
            // clearable={false}
            // searchable={false}
            // data-empty={intl.formatMessage({ id: 'tooltip.empty', defaultMessage: 'Please fill in this field' })}
          />
        </div>
      ) : (
        <div className="st-connect-broker-text">
          {intl.formatMessage({
            id: 'headerAuthorized.textAttention4',
            defaultMessage: 'You are connected to the broker',
          })}
        </div>
      )
      }
    </div>
  );
};

export default AccountSwitcher;
