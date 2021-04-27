import { Button, Layout } from 'antd';
import 'antd/dist/antd.css';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { useDispatch } from 'react-redux';
import './App.css';
import { Counter } from './features/counter/Counter';
import ModalBroker from './investarena/components/Modals/ModalBroker';
import { disconnectBroker } from './investarena/redux/actions/brokersActions';
import { toggleModal } from './investarena/redux/actions/modalsActions';
import i18nConfig from './investarena/locales';

function App() {
  const { Header } = Layout;
  const dispatch = useDispatch();

  const handleClickConnect = () => {
    dispatch(toggleModal('broker'));
  };
  const handleClickDisconnect = () => {
    dispatch(disconnectBroker());
  };

  return (
    <IntlProvider locale="en" messages={i18nConfig.en.messages}>
      <div className="App">
        <Layout>
          <Header>
            <Button type="primary" onClick={handleClickConnect}>Your broker</Button>
            <Button type="primary" danger onClick={handleClickDisconnect}>Disconnect</Button>
          </Header>
        </Layout>
        <ModalBroker/>
      </div>
    </IntlProvider>
  );
}

export default App;
