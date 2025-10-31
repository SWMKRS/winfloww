import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import App from './App';
import './styles/globals.css';

const theme = {
  token: {
    colorPrimary: '#3467ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#3467ff',
    colorTextBase: '#000000',
    colorBgBase: '#ffffff',
    // fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',

    // fontFamily: 'Inter',
    fontFamily: 'BlinkMacSystemFont',
    // fontWeight: 500,

    borderRadius: 8,
  },
};

const Router = typeof window !== 'undefined' && window.electron ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <Router>
        <App />
      </Router>
    </ConfigProvider>
  </React.StrictMode>
);

