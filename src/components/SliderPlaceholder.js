import styled from 'styled-components';
import { DateTitle } from './Slider';
import { colors } from '../config';
import { OutlineButton } from '../styled_components';

const Container = styled.div`
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:row;
`
export default function SliderPlaceholder({setHistoric}){
    return <Container>
            <DateTitle/>
            <OutlineButton onClick={setHistoric}>Load Historic Data</OutlineButton>
        </Container>
}