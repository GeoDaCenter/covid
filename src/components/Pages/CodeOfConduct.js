import React, {useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components';
import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const ConductPage = styled.div`
    background:white;
    img#workflow, img.hotspot {
        width:100%;
        max-width:800px;
        margin:20px auto;
        display:block;
    }
    img.jenks {
        display:block;
    }
    img.hotspot {
        margin-bottom:0;
    }

    p.caption {
        text-align:center;
        opacity:0.7;
        margin-top:0;
    }
`

const CodeOfConduct = () => {
    const [codeText, setCodeText] = useState('')

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/code-of-conduct.md`).then(r => r.text()).then(text => {
            setCodeText(text)
        })
    }, [])
    return (
       <ConductPage>
           <StaticNavbar/>
           <ContentContainer>
                <ReactMarkdown>{codeText}</ReactMarkdown>
           </ContentContainer>
           <Footer/>
       </ConductPage>
    );
}
 
export default CodeOfConduct;