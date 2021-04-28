import { Button, Modal } from 'antd';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import config from '../../../configApi/config';
import './ModalDeposit.scss';

const propTypes = {
  platformName: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
};

const ModalDeposit = ({ platformName, language }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="st-header-deposit">
      <Button
        type="primary"
        onClick={toggle}
        id="button-deposit"
        className={classNames('btn btn-primary btn-add-broker', { disconnected: platformName === 'widgets' })}
      >
        <FormattedMessage id="headerAuthorized.deposit" defaultMessage="Deposit"/>
      </Button>
      {isOpen && (
        <Modal
          visible={isOpen}
          onCancel={toggle}
          className="modal-deposit"
          title={<FormattedMessage id="headerAuthorized.deposit" defaultMessage="Deposit"/>}
          footer={null}
        >
          <iframe
            title="Deposit"
            src={`${config[process.env.NODE_ENV].platformDepositUrl[platformName]}?&mode=popup&lang=${language === 'ru' ? 'ru' : 'en'}#deposit`}
            width="1200px" height="696px"/>
        </Modal>
      )}
    </div>
  );
};

ModalDeposit.propTypes = propTypes;

export default ModalDeposit;
