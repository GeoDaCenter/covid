import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { createStore } from "redux";
import rootReducer from "./reducers/rootReducer";
import { GeodaProvider } from "./contexts/Geoda";

import App from "./App";
import "./index.css";

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { PersistGate } from 'redux-persist/integration/react';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2 ,
  whitelist: [] // 'report', 'params', 'ui' // only navigation will be persisted 'dataParams', 'mapParams', 'currentData'
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = createStore(
  persistedReducer,
  // typeof window === "object" &&
  //   window.__REDUX_DEVTOOLS_EXTENSION__ &&
  //   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
  //   window.__REDUX_DEVTOOLS_EXTENSION__({
  //     stateSanitizer: (state) => ({
  //       ...state,
  //       data: '<<<EXCLUDED>>>',
  //     })
  //   })
);
const persistor = persistStore(store)

ReactDOM.render(
  <React.StrictMode>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
        <GeodaProvider>
            <App />
        </GeodaProvider>
        </PersistGate>
      </Provider>
  </React.StrictMode>,
  document.getElementById("root")
  // serviceWorkerRegistration.register();
);
