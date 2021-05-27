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
    @media (max-width:600px){
        margin-top:-30px;
        transform:scaleX(.984) translateX(1px);
    }
`

export default function Ticks(){
    const storedTable = useSelector(state => state.storedData);
    const numeratorTable = useSelector(state => state.currentTable.numerator);
    const currTable = storedTable[numeratorTable];
    const length = useSelector(state => state.dates.length);
    const dateIndices = currTable?.dates;

    if (!dateIndices) return null

    const items = []

    for (let i=0; i<length;i++) {
        items.push(<div key={i} style={{background: dateIndices.includes(i) ? "white" : "black"}}/>)
    }
    
    return  <TickMarks> {items} </TickMarks>
}