import styled from 'styled-components';
import { colors } from '../config';
import { OutlineButton } from '../styled_components';

const Container = styled.div`
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:row;
    position:absolute;
    bottom:-45px;
    left:50%;
    transform:translateX(-50%);
    background:${colors.darkgray};
`
export default function SliderPlaceholder({setHistoric}){
    return <Container>
            <OutlineButton onClick={setHistoric}>Load Historic Data</OutlineButton>
        </Container>
}