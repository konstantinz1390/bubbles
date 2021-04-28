import { Layout } from 'antd';
import 'antd/dist/antd.css';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import './App.scss';
import Header from './investarena/components/Header';
import ModalBroker from './investarena/components/Modals/ModalBroker';
import i18nConfig from './investarena/locales';
import { getLanguageState } from './investarena/redux/selectors/languageSelectors';
import './utils/bootstrap/bootstrap-grid.scss';

function App() {
  const language = useSelector(getLanguageState);
  return (
    <IntlProvider locale={language} defaultLocale="en" messages={i18nConfig.en.messages}>
      <div className="App">
        <Layout>
          <Header/>
        </Layout>
        <ModalBroker/>
      </div>
    </IntlProvider>
  );
}

export default App;
