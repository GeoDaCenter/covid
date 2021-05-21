import { useSelector } from 'react-redux';
import styled from 'styled-components';

const TickMarks = styled.div`
    width:60.25%;
    margin:-23px 20% 23px 23%;
    height:3px;
    display:flex;
    div {
        width:1px;
        height:3px;
        display:inline-block;
    }
`

export default function Ticks(){
    const currTable = useSelector(state => state.storedData[state.currentTable.numerator]);
    const dateIndices = currTable !== undefined && currTable.dates;
    const length = useSelector(state => state.dates.length);
    

    const items = []

    if (dateIndices) {
        for (let i=0; i<length;i++) {
            items.push(<div key={i} style={{background: dateIndices.includes(i) ? "white" : "black"}}/>)
        }
    }
    
    return dateIndices ? 
        <TickMarks>
            {items}
        </TickMarks>
        :
        <></>
}