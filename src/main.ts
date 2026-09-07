import './styles.css';
import { createApp } from './view/app.js';

const app = createApp();

if (import.meta.env.DEV) {
  Object.assign(window, { __srp: app });
}
