import React, { useState, useContext } from 'react';
import throttle from 'lodash.throttle';

const ViewportContext = React.createContext();
const SetViewportContext = React.createContext();

const updateSharedView = throttle((viewport) => {
  window.localStorage.setItem('SHARED_VIEW', JSON.stringify(viewport));
}, 25);

/* Wrap your app in this bad boy */
export const ViewportProvider = ({ defaultViewport = {}, children }) => {
  const [viewport, setViewport] = useState(defaultViewport);
  document.hasFocus() && updateSharedView(viewport);

  return (
    <ViewportContext.Provider value={viewport}>
      <SetViewportContext.Provider value={setViewport}>
        {children}
      </SetViewportContext.Provider>
    </ViewportContext.Provider>
  );
};

/** Read the viewport from anywhere */
export const useViewport = () => {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw Error('Not wrapped in <ViewportProvider />.');
  return ctx;
};

/** Update the viewport from anywhere */
export const useSetViewport = () => {
  const ctx = useContext(SetViewportContext);
  if (!ctx) throw Error('Not wrapped in <ViewportProvider />.');
  return ctx;
};
