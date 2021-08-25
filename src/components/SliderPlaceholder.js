import styled from 'styled-components';
import { DateTitle } from './Slider';
import { colors } from '../config';

const Container = styled.div`
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:row;

`

const HistoricDataButton = styled.button`
    border:none;
    padding:0.25em 0.5em;
    border-radius:0.125em;
    margin:0.5em;
    font-weight:bold;
    cursor:pointer;
    transition:250ms all;
    color:white;
    border-width:1px;
    border-style:solid;
    background:none;
    font-family:'Lato', Arial, sans-serif;
    &:hover {
        border-color:${colors.yellow};
        color:${colors.yellow};
    }
`

export default function SliderPlaceholder({setHistoric}){
    return <Container>
            <DateTitle/>
            <HistoricDataButton onClick={setHistoric}>Load Historic Data</HistoricDataButton>
        </Container>
}