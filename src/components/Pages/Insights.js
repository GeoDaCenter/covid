import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const InsightsPage = styled.div`
    background:white;
    min-height:100vh;
    footer {
        position:${props => props.fixedFooter ? 'absolute' : 'initial'};
        bottom:0;
    }
`

const ArticleCard = styled(Grid)`
    padding:0;
    margin-bottom:20px;
    transition:250ms all;
    border:1px solid ${colors.lightgray};
    background:white;
    .thumbnailContainer {
        overflow: hidden;
        height: 0;
        padding-top: 56.25%;
    }
    img {
        margin-top:-56.25%;
        width:100%;
        display:block;
    }
    h2.cardTitle {
        letter-spacing:0;
        font-size:1.25rem;
        color:${colors.black};
        transition:250ms all;
        padding:10px 40px 0px 10px;
        margin:0;
    }
    p.date {
        padding:0px 40px 10px 10px;
        font-size:0.75rem;
    }
    p.description {
        text-overflow: ellipsis;
        max-height:2rem;
    }
    &:hover {
        @media (min-width:1024px){
            transform:scale(1.1) translateY(-10%);
            box-shadow:2px 2px 5px rgba(0,0,0,0.1);
        }
        h2.cardTitle {
            color: ${colors.pink};
        }
    }
`

const Insights = () => {

    const [ rssFeed, setRssFeed] = useState({
        feed: {},
        items: []
    })

    const [fixedFooter, setFixedFooter] = useState(false)

    useEffect(() => {
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/covidatlas')
            .then(r => r.json())
            .then(r => {
                setRssFeed(r)
            })
        
        // if (document.getElementsByTagName('footer')[0].getBoundingClientRect().y < window.innerHeight) setFixedFooter(true)
    }, [])

    // useEffect(() => {
    //     if (document.getElementsByTagName('footer')[0].getBoundingClientRect().y < window.innerHeight) setFixedFooter(true)
    // }, [window.innerWidth, window.innerHeight])
    
    return (
       <InsightsPage fixedFooter={fixedFooter}>
           <StaticNavbar/>
           <ContentContainer>
                <h1>Insights Blog</h1>
                <hr/>
                <Gutter h={20}/> 
                    {
                        rssFeed.items.map(article => 
                            <ArticleCard container spacing={0}>
                                <Grid item xs={12} md={4} lg={2}>
                                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                                        <div className="thumbnailContainer">
                                            <img src={article.thumbnail} alt={`Thumbnail for ${article.title}`} />
                                        </div>
                                    </a>
                                </Grid>
                                <Grid item xs={12} md={8} lg={10}>
                                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                                        <h2 className="cardTitle" dangerouslySetInnerHTML={{__html:article.title}}></h2>
                                        <p className="date">{article.pubDate?.split(' ')[0]}</p>
                                        
                                    </a>
                                    
                                </Grid>
                            </ArticleCard>
                        )
                    }  
                <hr/>
                <p>Read more at <a href="https://medium.com/covidatlas" target="_blank" rel="noopener noreferrer">Medium.com/CovidAtlas</a></p>
           </ContentContainer>
           <Footer/>
       </InsightsPage>
    );
}
 
export default Insights;