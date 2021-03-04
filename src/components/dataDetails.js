import React, { useState, useEffect} from 'react';
import styled from 'styled-components';
import * as gfm from 'remark-gfm';

import ReactMarkdown from 'react-markdown';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';

import { colors } from '../config';

const Container = styled.div`
    h3 {
        margin:20px 0 5px 0;
        font-family: 'Lato', sans-serif;
        font-style:normal;
        font-weight:bold;
        font-size:16px;
    }
    p {
        margin-bottom:5px;
    }
    table {
        width:100%;
        margin: 0 0 20px 0;
        padding:0;
        
        thead tr th:nth-of-type(1),
        tbody tr td:nth-of-type(1),
        thead tr th:nth-of-type(2),
        tbody tr td:nth-of-type(2) {
            width:25%;
        }
        thead tr th:nth-of-type(3),
        tbody tr td:nth-of-type(3) {
            width:50%;
        }
        // th,td {
        //     border:1px solid black;
        // }
        thead tr {
            background: ${colors.lightblue}88;
        }
        tbody tr:nth-of-type(even) {
            background:${colors.lightgray}55;
        }
    }
`

const Accordion = styled(MuiAccordion)`
`

const AccordionSummary = styled(MuiAccordionSummary)`
`

const AccordionDetails = styled(MuiAccordionDetails)`
`

const AccordionHeader = styled(Typography)`
    span.tag {
        padding:4px 8px;
        margin:5px;
        border-radius:12px;
        font-size:65%;
        background:${colors.lightgray};
        text-transform:uppercase;
        font-weight:bold;
    }
`

const dataList = [
    {
        'header': 'USA Facts',
        'tags':['Cases','Deaths','County','State'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/usafacts.md'
    },
    {
        'header': 'New York Times',
        'tags':['Cases','Deaths','County','State'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/new-york-times.md'
    },
    {
        'header': '1 Point 3 Acres',
        'tags':['Cases','Deaths','County','State'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/_1p3a.md'
    },
    {
        'header': 'Center for Disease Control',
        'tags':['Testing','Vaccination','County'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/center-for-disease-control.md'
    },
    {
        'header': 'Health and Human Services',
        'tags':['Testing','State'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/health-and-human-services.md'
    },
    {
        'header': 'County Health Rankings and Roadmaps',
        'tags':['Context'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/county-health-rankings.md'
    },
    {
        'header': 'Yu Group at UC Berkeley',
        'tags':['Forecasting'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/yu-group.md'
    },
    {
        'header': 'Safegraph Social Distancing',
        'tags':['Mobility'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/safegraph_sd.md'
    },
    {
        'header': 'American Community Survey',
        'tags':['Context', 'Essential Workers', 'Population'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/american-community-survey.md'
    },
    {
        'header': 'Hospitals and Clinics',
        'tags':['Context', 'Point Data'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/hospitals-and-clinics.md'
    },
    {
        'header': 'Geographies',
        'tags':['Boundaries', 'Geometry', 'County', 'State'],
        'content': 'https://raw.githubusercontent.com/GeoDaCenter/covid/master/data-docs/geographies.md'
    }

]  

const DataDetails = () => {
    const [expanded, setExpanded] = useState('');
    const [dataDescriptions, setDataDescriptions] = useState([])

    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    async function getMarkdownFiles(dataList){
        const markdownFilePromises = await dataList.map(data => fetch(data.content).then(r=>r.text()))
        Promise.all(markdownFilePromises).then(markdownFiles => {
            setDataDescriptions(markdownFiles)
        })
    }

    useEffect(() => {
        getMarkdownFiles(dataList)
    },[])
    
    return (
        <Container>
            {dataList.map((dataset, index) => 
                    <Accordion square expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
                        <AccordionSummary aria-controls={`panel${index}d-content`} id={`panel${index}d-header`}>
                        <AccordionHeader>
                            {dataset.header}
                            {dataset.tags.map(tag => <span className="tag">{tag}</span>)}
                        </AccordionHeader>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div>
                                <ReactMarkdown plugins={[gfm]}>{dataDescriptions[index]}</ReactMarkdown>
                            </div>
                        </AccordionDetails>
                    </Accordion>
            )}
        </Container>
    )
}

export default DataDetails