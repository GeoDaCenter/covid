import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { createStore } from 'redux';
import rootReducer from './reducers';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
// import { PersistGate } from 'redux-persist/integration/react';
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'

// const persistConfig = {
//   key: 'root',
//   storage,
//   stateReconciler: autoMergeLevel2 ,
//   whitelist: [] // only navigation will be persisted 'dataParams', 'mapParams', 'currentData'
// }

// const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = createStore(
  rootReducer,
  // (
  //   typeof window === 'object' 
  //   && window.__REDUX_DEVTOOLS_EXTENSION__ 
  //   && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  // ) && window.__REDUX_DEVTOOLS_EXTENSION__({
  //   stateSanitizer: (state) => state.storedGeojson ? { ...state, storedData: '<<EXCLUDED>>', storedGeojson: '<<EXCLUDED>>' } : state
  // })
);
// const persistor = persistStore(store)


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
        <App />
      {/* </PersistGate> */}
    </Provider>

    <button id="new-content-button" className="hidden" onClick={() => window.location.reload(true)}>
      <span>New data or features are available</span>
      Click here to reload
    </button>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.register();