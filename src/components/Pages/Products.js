import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const ProductsPage = styled.div`
    background:white;
    min-height:100vh;
    footer {
        bottom:0;
    }
`

const ProductCard = styled(Grid)`
    padding:0;
    margin-bottom:20px;
    transition:250ms all;
    background:white;
    .thumbnailContainer {
        overflow: hidden;
        height: 0;
        padding-top: 56.25%;
    }
    img {
        width:100%;
    }
    h2 {
        letter-spacing:0;
        font-size:2rem;
        color:${colors.black};
    }
    p.description {
        text-overflow: ellipsis;
        max-height:2rem;
    }
`

const products = [
    {
        'title':'All Our US Covid Deaths',
        'description':<p>
            When COVID-19 related deaths in the US passed 100,000, the loss was described as "incalculable." 
            Recently, the nation surpassed 500,000 deaths, a loss that is no longer just incalculable, but incomprehensible. 
            <br/><br/>
            This visualization attempts to place this loss in space, around parks and cities you might know or remember, from trips, growing up, or daily life. 
            Remembering and facing the price of COVID-19 is not easy, but forgetting it may cost even more.
            <br/><br/>
        </p>,
        'thumbnail':`${process.env.PUBLIC_URL}/products/500000.png`,
        'alt':'A group of figures stands near the St Louis Gateway arch, a massive 630 foot tall monument. Each one represents a life in the us lost to COVID19.',
        'link':`${process.env.PUBLIC_URL}/500000`,
    }
]
export default function Products(){

    return (
       <ProductsPage>
           <StaticNavbar/>
           <ContentContainer>
                <h1>Products</h1>
                <p>
                    Not every COVID-19 story fits neatly in the Atlas, so the products below are research, narrative, and exploratory
                    efforts to better understand the complex relationships between health, places, and people. 
                </p>
                <Gutter h={20}/>  
                <hr/>
                {products.map(entry => 
                    <ProductCard container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <a href={entry.link}>
                                <img src={entry.thumbnail} alt={entry.alt}/>
                            </a>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <a href={entry.link}>
                                <h2>{entry.title}</h2>
                            </a>
                            {entry.description}
                            <a href={entry.link}>See more</a>
                        </Grid>
                    </ProductCard>)}
           </ContentContainer>
           <Footer/>
       </ProductsPage>
    );
}