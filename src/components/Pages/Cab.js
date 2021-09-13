import React from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../../styled_components';
import { MemberGrid, NavBar, Footer } from '../../components';
import { colors } from '../../config';

const CabPage = styled.div`
    background:white;
    h2 {
        font-weight:normal;
        letter-spacing:initial;
        border-bottom:1px solid ${colors.darkgray};
        display:table;
        margin-bottom:1em;
        padding-bottom:1em;
        font-size:1.5rem;
    }
    p {
        max-width:75ch;
        margin-bottom:2em;
    }
`
const cabMembers = [{
        "name": "Daryl McGraw", 
        "link": "-", 
        "img": "photo.jpg", 
        "affiliation": "Affiliation", 
        "title": "Title"
    },
    {
        "name": "Jamelle Watson", 
        "link": "-", 
        "img": "photo.jpg", 
        "affiliation": "Affiliation", 
        "title": "Title"
    },
    {
        "name": "Simone Brown", 
        "link": "-", 
        "img": "photo.jpg", 
        "affiliation": "Affiliation", 
        "title": "Title"
    },
    {
        "name": "Germán A. Cadenas", 
        "link": "-", 
        "img": "photo.jpg", 
        "affiliation": "Affiliation", 
        "title": "Title"
    },
    {
        "name": "Jay Bhatt", 
        "link": "-", 
        "img": "photo.jpg", 
        "affiliation": "Affiliation", 
        "title": "Title"
    },
    {
        "name": "Marjory Givens", 
        "link": "-", 
        "img": "photo.jpg", 
        "affiliation": "Affiliation", 
        "title": "Title"
    },
    {
        "name": "Jim Bloyd", 
        "link": "-", 
        "img": "photo.jpg", 
        "affiliation": "Affiliation", 
        "title": "Title"
    },
        
]

export default function About(){
    return (
       <CabPage>
           <NavBar light/>
           <ContentContainer>
               <h1>The Atlas Community Advisory Board</h1>
               <hr/>
               <h2>
                    An overview of the CAB.
               </h2>
                <p>
                    A longer description of the CAB.
                </p>
                <MemberGrid members={cabMembers} columns={{md:6}}/>
           </ContentContainer>
           <Footer/>
       </CabPage>
    );
}