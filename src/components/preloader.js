import React, {useState} from 'react';
import styled from 'styled-components';
import { colors } from '../config';

const PreloaderContainer = styled.div`
    position:fixed;
    width:100%;
    height:100%;
    z-index:500;
    top:0;
    left:0;
    background:${colors.gray};
    transition: 500ms opacity;
    img {
        width:100px;
        height:86px;
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%, -50%);
    }
    @keyframes fade {
        0% {fill-opacity:1};
        50% {fill-opacity:0.25};
        100% {fill-opacity:1};
    }
    &.fadeOut {
        opacity:0;
        pointer-events:none;
    }
`;

const Preloader = ( props ) => {
    const [isHidden, setIsHidden] = useState(false);

    if (props.loaded) {
        setTimeout(() => {
            setIsHidden(true)
        }, 500)
    }

    return (
        <PreloaderContainer className={props.loaded ? 'fadeOut' : ''} style={{display: (isHidden ? 'none' : 'initial')}} id="preloaderContainer">
            <img src={`${process.env.PUBLIC_URL}/assets/img/preloader.gif`} alt="Preloader" />
        </PreloaderContainer>
    );
};

export default Preloader;