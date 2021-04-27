import { Button, Layout } from 'antd';
import 'antd/dist/antd.css';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { useDispatch } from 'react-redux';
import './App.css';
import { Counter } from './features/counter/Counter';
import ModalBroker from './investarena/components/Modals/ModalBroker';
import { toggleModal } from './investarena/redux/actions/modalsActions';

function App() {
  const { Header } = Layout;
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(toggleModal('broker'));
  };

  return (
    <IntlProvider locale="en" messages={{}}>
      <div className="App">
        <header className="App-header">
          <Counter/>
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux-toolkit.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
            className="App-link"
            href="https://react-redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
        </header>
        <Layout>
          <Header>
            <Button type="primary" onClick={handleClick}>Your broker</Button>
            <Button type="primary" danger>Disconnect</Button>
          </Header>
        </Layout>
        <ModalBroker/>
      </div>
    </IntlProvider>
  );
}

export default App;
