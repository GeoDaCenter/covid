import { createContext } from 'react';
export const GeoDaContext = createContext({});

// todo swap to the below implementation
// import React from 'react';
// const GeoDaContext = React.createContext({});

// export const GeoDaProvider = ({defaultGeoDa = {}, children}) => {
//   const [geoda] = useState(defaultGeoDa);

//   return (
//     <GeoDaContext.Provider value={geoda}>
//         {children}
//     </GeoDaContext.Provider>
//   )
// }

// export const useGeoDa = () => {
//   const ctx = useContext(GeoDaContext);
//   if (!ctx) throw Error("Not wrapped in <GeoDaProvider />.")
//   return ctx;
// }
