import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const app = document.createElement('div');
app.id = 'defog-extension';
document.body.appendChild(app);


const root = ReactDOM.createRoot(app);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);