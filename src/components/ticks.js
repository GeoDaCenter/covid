import { useSelector } from 'react-redux';
import styled from 'styled-components';

const TickMarks = styled.div`
    width:55.25%;
    margin:-12px 22.5% 23px 25.5%;
    transform:scaleX(.984) translateX(1px);
    height:3px;
    display:flex;
    span {
        width:1px;
        height:3px;
        display:inline-block;
    }
    @media (min-width:600px){
        width:60.25%;
        margin:-13px 20% 23px 23%;
        transform:none;
    }
    @media (hover:none){
        margin-top:-20px;
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
        items.push(<span key={i} style={{background: dateIndices.includes(i) ? "white" : "black"}}/>)
    }
    
    return  <TickMarks> {items} </TickMarks>
}