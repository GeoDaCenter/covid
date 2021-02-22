import React from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../../styled_components';
import { colors } from '../../config';

const PreloaderPage = styled.div`
    background:${colors.gray};
    min-height:100vh;
    h2 {
        position:fixed;
        left:50%;
        top:60%;
        transform:translateX(-50%);
        color:white;
    }
    img {
        width:100px;
        height:86px;
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%, -50%);
    }
`

const LoadingMessage = () => {

    return (
       <PreloaderPage>
           <ContentContainer className="transferInfo">
                <h2>loading...</h2>
                <img src={`${process.env.PUBLIC_URL}/assets/img/preloader.gif`} alt="Preloader" />
           </ContentContainer>
       </PreloaderPage>
    );
}
 
export default LoadingMessage;