import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const ApiPage = styled.div`
    background:white;
`

const CodeBold = styled.code`
    font-weight:bold;
`

const CodeRed = styled.span`
    color:${colors.pink};
`

const CodeBlock = styled.div`
    font-size:1rem;
    margin:20px 0;
    padding:20px;
    background:${colors.lightgray}55;
`

const Insights = () => {

    return (
       <ApiPage>
           <StaticNavbar/>
           <ContentContainer>
                <h1>API</h1>
                <hr/>
                <p>
                    The Covid Atlas’ public data API provides access to state-level and county-level USAFacts confirmed and death count data, 
                    and local indicator of spatial association results (LISA statistics). 
                </p>
                <br/>
                <ul>
                    <li>All dates and times are in US central time (CDT). Data are updated on a daily basis every afternoon.</li>
                    <li>
                        Users should first register for <a href="https://docs.google.com/forms/d/e/1FAIpQLSc4OBaQjEiwFGXxZfQJ3vaanCO5qWzQ2XQ8fxIdhl4l3xY-9w/viewform" target="_blank" rel="noopener noreferrer">API access</a>. 
                        A confirmed email will be sent once we verified your information.
                    </li>
                    <li>All data are returned in json format.</li>
                </ul>
                <br/>
                <h3>API Domain</h3>
                <br/>
                <p>All API requests should be made to: <CodeBold>https://api.theuscovidatlas.org</CodeBold></p>
                <Gutter h={40}/>
                <h3>Confirmed COVID Cases, Death</h3>
                <br/>
                <h2>DATA SOURCES</h2>
                <p>
                    <b>Confirmed and Death Count:</b> USAFacts
                    <br/><br/>
                    USAFacts provides county-level death and confirmed data on a daily basis with updates every afternoon.
                </p>

                <Gutter h={40}/>
                <h2>API PARAMETERS</h2>
                <ul>
                    <li><b>state</b> (required): <CodeRed>str</CodeRed> case insensitive state abbreviation</li>
                    <li><b>category</b> (required): <CodeRed>str</CodeRed> "data"</li>
                    <li><b>type</b> (optional): <CodeRed>str</CodeRed> “confirmed”, “death”, default as “death”</li>
                    <li><b>source</b> (optional): <CodeRed>str</CodeRed> “usafacts” or “1p3a” case insensitive, default as “usafacts”</li>
                    <li><b>level</b> (optional): <CodeRed>str</CodeRed> “state” or “county”, default as “county”</li>
                    <li><b>start</b> (optional): <CodeRed>8-digit</CodeRed> integer start date in format as “20201005”, default as 7 days prior to today. Range from 20200122 to today</li>
                    <li><b>end</b>(optional): <CodeRed>8-digit</CodeRed> integer end date in format as “20201005”, default as today. Range from 20200122 to today</li>
                </ul>
                
                <Gutter h={40}/>
                <h2>API QUERY EXAMPLE</h2>
                <p>
                    To get county-level death data of Illinois from September 1st, 2020 to October 1st, 2020, the query should be set as:
                    <br/>
                    <CodeRed>domain/v1/lisa/?state=il&amp;category=data&amp;start=20200901&amp;end=20201001&amp;type=death</CodeRed>
                </p>
                <Gutter h={40}/>

                <h2>POSSIBLE ERROR MESSAGES</h2>
                <ul>
                    <li>Invalid State Input: if the field is missing or have typos</li>
                    <li>Invalid Date: if start date is before 20200122 or end date after today, or end date before start date</li>
                    <li>Invalid Type: if type input is other than “death” or “confirmed”</li>
                    <li>Invalid Level Type: if level input is other than “state” or “county”</li>
                </ul>
                <Gutter h={40}/>
                <h3>LISA "HotSpot" Statistics</h3>
                <Gutter h={40}/>
                <h2>DATA SOURCES</h2>
                <p>The Covid Atlas team calculated LISA statistics using the library pygeoda. Data used in calculation were confirmed and death data provided by USAFacts and 1 Point 3 Acres. The LISA for each observation gives an indication of the extent of significant spatial clustering of similar values around that observation.In our case, county are divided into five categories:</p>
                <br/>
                <ol>
                    <li>High-high: area with high values and neighborhood by area with high values;</li>
                    <li>Low-low: area with low values and neighborhood by area with low values;</li>
                    <li>High-low: area with high values and neighborhood by area with low values;</li>
                    <li>Low-high: area with low values and neighborhood by area with high values;</li>
                    <li>Not significant</li>
                </ol>
                <Gutter h={40}/>
                <h2>API PARAMETERS</h2>
                <ul>
                    <li><b>state</b> (required): <CodeRed>str</CodeRed> case insensitive state abbreviation</li>
                    <li><b>category</b> (required): <CodeRed>str</CodeRed> "lisa"</li>
                    <li><b>type</b> (optional): <CodeRed>str</CodeRed> “confirmed”, “death”, default as “death”</li>
                    <li><b>source</b> (optional): <CodeRed>str</CodeRed> “usafacts” or “1p3a” case insensitive, default as “usafacts”</li>
                    <li><b>level</b> (optional): <CodeRed>str</CodeRed> “state” or “county”, default as “county”</li>
                    <li><b>start</b> (optional): <CodeRed>8-digit</CodeRed> integer start date in format as “20201005”, default as 7 days prior to today. Range from 20200122 to today</li>
                    <li><b>end</b> (optional): <CodeRed>8-digit</CodeRed> integer end date in format as “20201005”, default as today. Range from 20200122 to today</li>
                </ul>
                <Gutter h={40}/>
                <h2>API QUERY EXAMPLE</h2>
                <p>
                    To get county-level death lisa of Illinois using 1P3A data from September 1st, 2020 to October 1st, 2020, the query should be set as:
                    <br/>
                    <CodeRed>domain/v1/lisa/?state=IL&amp;category=lisa&amp;start=20200901&amp;end=20201001&amp;source=1p3a&amp;type=death&amp;level=county</CodeRed>
                </p>
                <Gutter h={40}/>
                <h2>POSSIBLE ERROR MESSAGES</h2>
                <ul>
                    <li>Invalid State Input: if the field is missing or have typos</li>
                    <li>Invalid Date: if start date is before 20200122 or end date after today, or end date before start date</li>
                    <li>Invalid Type: if type input is other than “death” or “confirmed”</li>
                    <li>Invalid Level Type: if level input is other than “state” or “county”</li>
                </ul>
                <Gutter h={40}/>
                <h3>Python Example</h3>
                <CodeBlock>
                    <code>
                        import requests
                        <br/><br/>
                        url = 'https://api.theuscovidatlas.org/v1/lisa/?state=AZ&category=lisa'
                        <br/><br/>
                        {`header = {'your-api-key': 'your-api-secret-key'}`}
                        <br/><br/>
                        req = requests.get(url, headers=header
                        <br/><br/>
                        req.text
                    </code>
                </CodeBlock>
            </ContentContainer>
            <Footer/>
       </ApiPage>
    );
}
 
export default Insights;