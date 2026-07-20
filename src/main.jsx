import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force Indian Standard Time (IST) globally for all Date displays
const originalToLocaleString = Date.prototype.toLocaleString;
Date.prototype.toLocaleString = function (locales, options) {
  return originalToLocaleString.call(this, locales || 'en-IN', { timeZone: 'Asia/Kolkata', ...options });
};

const originalToLocaleDateString = Date.prototype.toLocaleDateString;
Date.prototype.toLocaleDateString = function (locales, options) {
  return originalToLocaleDateString.call(this, locales || 'en-IN', { timeZone: 'Asia/Kolkata', ...options });
};

const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
Date.prototype.toLocaleTimeString = function (locales, options) {
  return originalToLocaleTimeString.call(this, locales || 'en-IN', { timeZone: 'Asia/Kolkata', ...options });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
