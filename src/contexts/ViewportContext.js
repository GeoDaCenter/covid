// ViewportContext.js
import React, { useState, useContext, useEffect} from 'react';
import throttle from 'lodash/throttle';
import { useDispatch, useSelector } from 'react-redux';

const ViewportContext = React.createContext();
const SetViewportContext = React.createContext();

const updateSharedView = throttle((viewport) => {
  window.localStorage.setItem('SHARED_VIEW', JSON.stringify(viewport));
}, 25)

/* Wrap your app in this bad boy */
export const ViewportProvider = ({defaultViewport = {}, children}) => {
  const savedLocation = useSelector((state) => state.savedLocation);
  const shouldSaveLocation = useSelector((state) => state.shouldSaveLocation);
  const dispatch = useDispatch();

  const [viewport, setViewport] = useState(shouldSaveLocation && savedLocation.length ? JSON.parse(savedLocation) : defaultViewport);
  
  document.hasFocus() && updateSharedView(viewport)
 
  useEffect(() => {
    if (shouldSaveLocation && document.hasFocus()){
      dispatch({
        type: 'SET_PREFERENCE',
        payload: {
          pref: 'savedLocation',
          value: JSON.stringify(viewport)
        }
      })
    }
  },[viewport])

  return (
    <ViewportContext.Provider value={viewport}>
      <SetViewportContext.Provider value={setViewport}>
        {children}
      </SetViewportContext.Provider>
    </ViewportContext.Provider>
  )
}

/** Read the viewport from anywhere */
export const useViewport = () => {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw Error("Not wrapped in <ViewportProvider />.")
  return ctx;
}

/** Update the viewport from anywhere */
export const useSetViewport = () => {
  const ctx = useContext(SetViewportContext);
  if (!ctx) throw Error("Not wrapped in <ViewportProvider />.")
  return ctx;
}