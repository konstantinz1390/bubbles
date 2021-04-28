import { Layout } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { getLanguageState } from '../../redux/selectors/languageSelectors';
import { getPlatformNameState } from '../../redux/selectors/platformSelectors';
import ModalDeposit from '../Modals/ModalDeposit';
import Broker from './Broker';
import './Header.scss';

const Header = () => {
  const language = useSelector(getLanguageState);
  const platformName = useSelector(getPlatformNameState);

  const { Header: LayoutHeader } = Layout;

  return (
    <LayoutHeader className="st-header">
      <div className="container">
      <div className="st-header__content">
        {/* TODO: replace <div> with react-router <Link> */}
        <div className="st-header__logo">
          <img src="/static/images/investarena_logo.png" alt="Bubbles logo"/>
        </div>
        <Broker/>
        <ModalDeposit platformName={platformName} language={language}/>
      </div>
      </div>
    </LayoutHeader>
  );
};

export default Header;
