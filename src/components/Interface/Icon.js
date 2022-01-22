import React from 'react';
import * as SVG from '../../config/svg.js';

// export const IconButton = ({onClick,children}) => {
//     return <button>

//     </button>
// }

const Icon = ({ symbol, style }) => {
  return <span {...style}>{SVG[symbol]}</span>;
};

export default Icon;
