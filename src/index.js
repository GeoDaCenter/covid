// Main libraries
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore} from 'redux';
import { Provider } from 'react-redux';

// Major Components / reducer
import App from './App';
import reducer from './reducers';

// CSS
import './index.css';
import './mapbox.css';
import WebFont from 'webfontloader';
import registerServiceWorker from "./registerServiceWorker";

// This creates the map-wide store, mainly keeping data, parameters,
// and interaction settings.
// To enter a debug mode with redux, uncommment the second line and install
// redux dev tools on your browser.
const store = createStore(
  reducer
  // , window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

// Load in fonts: playfair display and Lato
WebFont.load({
  google: {
    families: ['Lato:300,400,700,900', 'Playfair Display:ital', 'sans-serif']
  }
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>,
  </React.StrictMode>,
  document.getElementById('root')
);

// Service worker for offline caching
registerServiceWorker();