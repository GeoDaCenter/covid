// import React, { useState, useContext } from 'react';

// const BackgroundContext = React.createContext();

// export const BackgroundLoadingProvider = ({ backgroundLoading = false, children }) => {
//   const [canLoadInBackground, setCanLoadInBackground] = useState(backgroundLoading);

//   return (
//     <BackgroundContext.Provider value={[canLoadInBackground, setCanLoadInBackground]}>
//         {children}
//     </BackgroundContext.Provider>
//   );
// };

// export const useBackgroundLoadingContext = () => {
//   const ctx = useContext(BackgroundContext);
//   if (!ctx) throw Error('Not wrapped in <BackgroundLoadingContext />.');
//   return ctx;
// };