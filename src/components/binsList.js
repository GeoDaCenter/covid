import React from 'react';
import { Tooltip } from '../components';

const BinsList = (props) => {
    let bins = props.data;

    if (bins.slice(-1,)[0] === '>'+bins.slice(-2,-1)[0]) {
        bins.splice(-2,1)
    }
    return (
        (bins.map((bin, index) => 
            <div className="bin label" key={`${bin}_${index}`}>
                {bin.indexOf('tooltip') === -1 && bin}
                {bin.indexOf('tooltip') !== -1 && <span>{bin.split(' tooltip:')[0]}<Tooltip id={bin.split(' tooltip:')[1]} /></span>}
            </div>
            )
        )
    )
}

export default BinsList;