import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { runMigration } from './utils/migrateSalons';

// Миграция салонов выполнена и больше не нужна
// if (process.env.NODE_ENV === 'development') {
//   (window as any).runSalonMigration = runMigration;
//   console.log('%c🔧 Утилита миграции салонов доступна!', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
//   console.log('%cЧтобы связать существующие салоны с владельцами, выполните:', 'color: #2196F3; font-size: 12px;');
//   console.log('%cwindow.runSalonMigration()', 'background: #f5f5f5; color: #333; padding: 4px 8px; border-radius: 3px; font-family: monospace;');
// }

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
