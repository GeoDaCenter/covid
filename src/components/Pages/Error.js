import React from 'react';
import styled from 'styled-components';

import { ContentContainer } from '../../styled_components';
import { NavBar, Footer } from '../';

const ErrorPage = styled.div`
    background:white;
    min-height:100vh;
    text-align:center;
    img.errorImg {
        padding:60px;
    }
`

const Error = () => {

    return (
       <ErrorPage >
            <NavBar light/>
            <ContentContainer>
                <h1>Error 404</h1>
                <img className="errorImg" src={`${process.env.PUBLIC_URL}/icons/regional-hot-spots@3x.png`} alt="Error Page Missing"/>
                <h2>We can't get you where you're going.</h2>
                <p>
                    Sorry, we can't find the page you're looking for. It may have moved or recently changed.
                    <br/><br/>
                    Please use the navigation bar or footer to explore the Atlas.
                </p>
            </ContentContainer>
            <Footer/>
       </ErrorPage>
    );
}
 
export default Error;