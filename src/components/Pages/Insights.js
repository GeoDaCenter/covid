import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

import { ContentContainer, Gutter } from '../../styled_components';
import { NavBar, Footer } from '../';
import { colors } from '../../config';

const InsightsPage = styled.div`
    background:white;
    min-height:100vh;
    footer {
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

const TabBar = styled.div`
`

const Tab = styled.button`
    background:${props => props.active ? colors.yellow : colors.white};
    font-size:2rem;
    font-family:'Playfair Display', serif;
    outline:none;
    border:none;
    border-bottom:1px solid ${colors.gray};
    padding:5px 10px;
    margin:0 10px;
    cursor:pointer;
    transition:250ms all;

`

const TabPanel = styled.div`
    display:${props => props.display ? 'initial' : 'none'};
`

const products = [
    {
        'title': 'All Our US Covid Deaths',
        'description': <p>
            When COVID-19 related deaths in the US passed 100,000, the loss was described as "incalculable."
            Recently, the nation surpassed 500,000 deaths, a loss that is no longer just incalculable, but incomprehensible.
            <br /><br />
            This visualization attempts to place this loss in space, around parks and cities you might know or remember, from trips, growing up, or daily life.
            Remembering and facing the price of COVID-19 is not easy, but forgetting it may cost even more.
            <br /><br />
        </p>,
        'thumbnail': `${process.env.PUBLIC_URL}/products/500000.png`,
        'alt': 'A group of figures stands near the St Louis Gateway arch, a massive 630 foot tall monument. Each one represents a life in the us lost to COVID19.',
        'link': `${process.env.PUBLIC_URL}/500000/`,
    }
]

const research = [
    {
        'title': 'Assessing Structural Barriers & Racial Disparities of COVID-19 Mortality With Spatial Analysis',
        'description': <p>
            <i>Qinyun Lin, Susan Paykin, Dylan Halpern, Aresha Martinez-Cardoso, and Marynia Kolak</i>
            <br /><br />
            <b>Question</b>  How do the associations between structural factors and COVID-19 mortality help explain the disproportionate outcomes experienced by different racial and ethnic groups?
            <br/>
            <b>Findings</b>  In this cross-sectional study of 3142 counties in 50 US states and the District of Columbia, the associations between different measures of social determinants of health and COVID-19 mortality varied across racial and ethnic groups (Black or African American, Hispanic or Latinx, and non-Hispanic White populations) and different community types (rural, suburban, and urban areas).
            <br/>
            <b>Meaning</b>  Findings from this study suggest the need for future research that addresses health inequity and guides policies and programs by further exploring the different dimensions and regional patterns of social determinants of health.
            <br /><br/>
            <a href="https://uscovidatlas.org/research-briefs/structural-barriers-covid.pdf">Read the Research Brief</a>
        </p>,
        'thumbnail': `${process.env.PUBLIC_URL}/research/structuralBarriers.jpg`,
        'alt': 'Four maps highlighting the number of days each county spent in the most severe 20% of COVID-19 mortality.',
        'link': 'http://jamanetwork.com/journals/jamanetworkopen/fullarticle/10.1001/jamanetworkopen.2022.0984',
        'researchBrief': 'https://uscovidatlas.org/research-briefs/structural-barriers-covid.pdf'
    },
    {
        'title': 'Dimensions of uncertainty: a spatiotemporal review of five COVID-19 datasets',
        'description': <p>
            <i>Dylan Halpern, Qinyun Lin, Ryan Wang, Stephanie Yang, Steve Goldstein, and Marynia Kolak</i>
            <br /><br />
            COVID-19 surveillance across the United States is essential to tracking and mitigating the pandemic,
            but data representing cases and deaths may be impacted by attribute, spatial, and temporal uncertainties.
            COVID-19 case and death data are essential to understanding the pandemic and serve as key inputs for prediction
            models that inform policy-decisions; consistent information across datasets is critical to ensuring coherent
            findings. We implement an exploratory data analytic approach to characterize, synthesize, and visualize
            spatial-temporal dimensions of uncertainty across commonly used datasets for case and death metrics
            (Johns Hopkins University, the New York Times, USAFacts, and 1Point3Acres). We scrutinize data consistency
            to assess where and when disagreements occur, potentially indicating underlying uncertainty. We observe
            differences in cumulative case and death rates to highlight discrepancies and identify spatial patterns.
            Data are assessed using pairwise agreement (Cohen’s kappa) and agreement across all datasets (Fleiss’ kappa)
            to summarize changes over time. Findings suggest highest agreements between CDC, JHU, and NYT datasets.
            We find nine discrete type-components of information uncertainty for COVID-19 datasets reflecting various
            complex processes. Understanding processes and indicators of uncertainty in COVID-19 data reporting is
            especially relevant to public health professionals and policymakers to accurately understand and communicate
            information about the pandemic.
            <br /><br />
        </p>,
        'thumbnail': `${process.env.PUBLIC_URL}/research/dimensionsOfUncertainty.png`,
        'alt': 'A matrix of cumulative case differences, calculated as the sum of daily 7-day rolling averages of new cases from 3/15/2020 to 4/15/2021. The color bins for these maps are fixed across the maps and approximate quintile breaks in either diverging direction.',
        'link': 'https://www.tandfonline.com/doi/full/10.1080/15230406.2021.1975311',
    },
    {
        'title': 'The US COVID Atlas: A dynamic cyberinfrastructure surveillance system for interactive exploration of the pandemic',
        'description': <p>
            <i>Marynia Kolak, Xun Li, Qinyun Lin, Ryan Wang, Moksha Menghaney, Stephanie Yang, Vidal Anguiano Jr</i>
            <br /><br />
            Distributed spatial infrastructures leveraging cloud computing technologies can tackle issues of disparate data sources
            and address the need for data-driven knowledge discovery and more sophisticated spatial analysis central to the
            COVID-19 pandemic. We implement a new, open source
            spatial middleware component (libgeoda) and system design
            to scale development quickly to effectively meet the need
            for surveilling county-level metrics in a rapidly changing
            pandemic landscape. We incorporate, wrangle, and analyze
            multiple data streams from volunteered and crowdsourced
            environments to leverage multiple data perspectives. We
            integrate explorative spatial data analysis (ESDA) and statistical hotspot standards to detect infectious disease clusters
            in real time, building on decades of research in GIScience
            and spatial statistics. We scale the computational infrastructure to provide equitable access to data and insights
            across the entire USA, demanding a basic but high-quality
            standard of ESDA techniques. Finally, we engage a research
            coalition and incorporate principles of user-centered design to ground the direction and design of Atlas application
            development.
            <br /><br />
        </p>,
        'thumbnail': `${process.env.PUBLIC_URL}/research/transaction_gis.jpg`,
        'alt': 'A diagram of the US Covid Atlas web systems, which uses the C++ library "libgeoda" in WebAssembly (WASM) to integrate spatial statistics, weights, clustering, and regression into the javascript "jsgeoda" package.',
        'link': 'https://onlinelibrary.wiley.com/doi/10.1111/tgis.12786',
    }
]

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function Insights({
    defaultTab = 0
}) {
    const [rssFeed, setRssFeed] = useState({
        feed: {},
        items: []
    })

    const [tabValue, setTabValue] = useState(
        window.location.hash.length
            ? ['#blog', '#research', '#stories'].indexOf(window.location.hash)
            : defaultTab
    );

    const handleHashChange = () => {
        setTabValue(['#blog', '#research', '#stories'].indexOf(window.location.hash))
    }

    useEffect(() => {
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/covidatlas')
            .then(r => r.json())
            .then(r => {
                setRssFeed(r)
            })
        window.addEventListener("hashchange", handleHashChange, false);
    }, [])



    return (
        <InsightsPage>

            <NavBar light />
            <ContentContainer>
                <TabBar position="static">
                    <Tab {...a11yProps(0)} active={tabValue === 0} onClick={() => setTabValue(0)}>Blog</Tab>
                    <Tab {...a11yProps(1)} active={tabValue === 1} onClick={() => setTabValue(1)}>Research</Tab>
                    <Tab {...a11yProps(2)} active={tabValue === 2} onClick={() => setTabValue(2)}>Stories</Tab>
                </TabBar>
                <TabPanel display={tabValue === 0}>
                    <Gutter h={20} />
                    {rssFeed.items.map(article =>
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
                                    <h2 className="cardTitle" dangerouslySetInnerHTML={{ __html: article.title }}></h2>
                                    <p className="date">{article.pubDate?.split(' ')[0]}</p>

                                </a>
                            </Grid>
                        </ArticleCard>
                    )}
                    <hr />
                    <p>Read more at <a href="https://medium.com/covidatlas" target="_blank" rel="noopener noreferrer">Medium.com/CovidAtlas</a></p>
                </TabPanel>

                <TabPanel display={tabValue === 1}>
                    <Gutter h={20} />
                    <hr />
                    <Gutter h={20} />
                    {research.map(entry =>
                        <>
                            <ProductCard container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <a href={entry.link}>
                                        <img src={entry.thumbnail} alt={entry.alt} />
                                    </a>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <a href={entry.link}>
                                        <h2>{entry.title}</h2>
                                    </a>
                                    {entry.description}
                                    <a href={entry.link} target="_blank" rel="noopeener noreferrer">Read the full article</a>
                                    
                                    {!!entry.researchBrief && <>
                                    <Gutter h={10} />
                                    <a href={entry.researchBrief} target="_blank" rel="noopener noreferrer">
                                        Research the research brief
                                    </a></>}
                                </Grid>
                            </ProductCard>
                            <hr />
                            <Gutter h={20} />
                        </>)}

                </TabPanel>
                <TabPanel display={tabValue === 2}>
                    <Gutter h={20} />
                    <p>
                        Not every COVID-19 story fits neatly in the Atlas, so the projects below are narrative, research, and exploratory
                        efforts to better understand the complex relationships between health, places, and people.
                    </p>
                    <hr />
                    <Gutter h={20} />
                    {products.map(entry =>
                        <ProductCard container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <a href={entry.link}>
                                    <img src={entry.thumbnail} alt={entry.alt} />
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
                </TabPanel>
            </ContentContainer>
            <Footer />
        </InsightsPage>
    );
}