import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore} from 'redux';
import reducer from './reducers';
import { Provider } from 'react-redux';
import './index.css';
import './mapbox.css';
import WebFont from 'webfontloader';
import registerServiceWorker from "./registerServiceWorker";

const store = createStore(
  reducer
  ,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);


WebFont.load({
  google: {
    families: ['Lato:300,400,700,900', 'Playfair Display:ital', 'sans-serif']
  }
});

ReactDOM.render(
  // <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>,
  // </React.StrictMode>,
  document.getElementById('root')
);


registerServiceWorker();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals