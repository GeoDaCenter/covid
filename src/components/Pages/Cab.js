import React from 'react';
import styled from 'styled-components';
import { ContentContainer, Gutter } from '../../styled_components';
import { Footer, MemberGrid, NavBar } from '../../components';
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
const cabMembers = [
    {
        "name": "Jim Bloyd", 
        "link": "-", 
        "img": "cab/jbloyd.jpg", 
        "title": "Collaborative for Health Equity Cook County; and Teaching Associate, University of Illinois School of Public Health",
        "bio":'Jim Bloyd, DrPH, MPH was drawn to public health because of its foundation in social justice. He has practiced for 30 years at the local level in three public health departments, in California and Illinois. He spearheaded the “Roots of Health Inequities Dialogues” staff development initiative while at the Cook County Department of Public Health. He is on the Steering Committee of the Collaborative for Health Equity Cook County, which aims to build people power to challenge structural racism and policies of white supremacy. '
    },
    {
        "name": "Simone Brown", 
        "link": "-", 
        "img": "cab/sbrowne.jpg", 
        "title": "Associate Professor of African and African Diaspora Studies, University of Texas at Austin",
        "bio":'Simone Browne PhD  is an Associate Professor in the Department of African and African Diaspora Studies at the University of Texas at Austin. She is also Research Director of Critical Surveillance Inquiry (CSI) with Good Systems, a research collaborative at the University of Texas at Austin. CSI works with scholars, organizations and communities to curate conversations, exhibitions and research that examine the social and ethical implications of surveillance technologies, both AI-enabled and not. With a focus on algorithmic harm and tech equity, we continually question “what’s good?” in order to better understand the development and impact of artificial intelligence.'
    },
    {
        "name": "Germán A. Cadenas", 
        "img": "cab/gcadenas.jpg", 
        "title": "Assistant Professor of Counseling Psychology, Lehigh University",
        "bio":"Germán A. Cadenas PhD is an assistant professor in the Counseling Psychology Program at Lehigh's College of Education. Cadenas focuses his research on the psychology of undocumented immigrants and underrepresented minorities, particularly their critical consciousness development and its links to higher education outcomes, work and career development, and psychological wellbeing.  Professor Cadenas has conducted several research studies related to DACA students and higher education."
    },
    {
        "name": "Chelsea Cross", 
        "img": "cab/ccross.jpg", 
        "title": "Chief of Staff, Data for Black Lives",
        "bio":'Chelsea Cross is the Chief of Staff at Data for Black Lives (D4BL). Ever since she was a child, she knew she wanted to impact the world directly. After studying public health at Brown University, Chelsea went on to serve the indigenous population of Hawai’i as a teacher while earning a master’s degree in education from Johns Hopkins University. Witnessing in her classroom, day after day, the social determinants of health affect her students’ academic performance, Chelsea went back into the medical field and became one of the youngest managers of the largest hospital network in Hawai’i–Kapiolani Medical Center–before moving to Wisconsin frustrated with the policies in both the medical and education sectors. Motivated, Chelsea shifted her focus to politics, where her background would propel and enable her to continue to make a change in this world. As a Black woman and a Jew, she is no stranger to navigating spaces with conflicting identities. Chelsea managed multiple statewide political campaigns before joining D4BL. Her current passion lies in the conundrum that is establishing transparent messaging and providing robust data in America, 2022, that creates a seat at the table for everyone. The fight to ensure everyone’s needs in Maslow’s Hierarchy are met is the type of challenge that Chelsea relishes. She brings passion, a desire to learn, and enthusiasm to this world.'
    },
    {
        "name": 'Laurie Francis',
        "img": "cab/lfrancis.jpg",
        "title": "Chief Executive Officer, Partnership Health Center",
        "bio":"Laurie Francis MPH is Executive Director of Partnership Health Center, a critical provider of a broad array of health care services in Western Montana. Laurie brings over twenty years of experience in hospital leadership and program development. She has been involved, nationally, in efforts to improve healthcare and health outcomes, especially for those individuals and populations poorly served by our current systems."
    },
    {
        "name": "Marjory Givens", 
        "img": "cab/mgivens.jpg", 
        "title": "Associate Director,  University of Wisconsin Population Health Institute; co-Director, County Health Rankings & Roadmaps program ",
        "bio":'Marjory Givens MPH, PhD  is the Associate Director of the University of Wisconsin Population Health Institute (UWPHI) and co-Director of the County Health Rankings & Roadmaps program. Before joining the Institute, Marjory was an officer with the Health Impact Project at The Pew Charitable Trusts. Marjory has worked to make health and equity routine considerations in shaping the places where we live, learn, work, and play. Marjory has conducted public health research in laboratory and community-based settings, ranging from investigations using biomedical models to health impact assessments and evaluation of community interventions. '
    },
    {
        "name": "Michelle Levander", 
        "img": "cab/mlevander.jpeg", 
        "title": "Director, Center for Health Journalism at USC Annenberg School for Communication and Journalism; Editor-in-chief, CenterforHealthJournalism.org",
        "bio":'Michelle Levander is the founding director of the Center for Health Journalism at USC Annenberg and editor-in-chief of CenterforHealthJournalism.org. The Center, which she launched in 2004, partners with journalists and their newsrooms to support ambitious reporting on health policy, health equity and health conditions in underserved communities. She previously worked for more than 15 years as a reporter and editor in New York, California, Mexico and Hong Kong, and has received awards from the Overseas Press Club of America, the InterAmerican Press Association, the Society of Professional Journalists L.A. and a Northern California Emmy (español). Michelle has a bachelor’s degree in history and literature from the University of California, Berkeley and a master’s degree in journalism from Columbia University.'
    },
    {
        "name": "Daryl McGraw", 
        "img": "cab/dmcgraw.jpg", 
        "title": "Senior Manager of Racial Justice & Equity, C4 Innovations CEO, Formerly Inc.",
        "bio":'Daryl M. McGraw is a Senior Manager of Racial Justice & Equity at C4 Innovations and the founder and president of Formerly Inc. His skills include policy development, contract management, and project coordination, and he collaborates with grassroots peer-advocacy agencies and the Connecticut Department of Corrections. Daryl is the former Program Director for the Yale University Department of Psychiatry. In this role, he served as the Director of the Office of Recovery Community Affairs for Connecticut’s Department of Mental Health and Addiction Services. He holds state certifications as an addictions counselor, recovery support specialist, and criminal justice professional. He has a bachelor’s degree in human services and a master’s degree in organizational management and leadership, both from  Springfield College.'
    },
    {
        'name': <>Joseph M. <i>(Sïraata)</i> Yracheta</>,
        'img':'cab/jyracheta.jpg',
        'title':'Executive Director,  Native Biodata Consortium',
        'bio':'Joe Yracheta, MS, is the Executive Director of the Native Biodata Consortium, a nonprofit research institute led by Indigenous scientists and tribal members in the United States that ensures advances in genomics, omics, machine learning and health research benefit all Indigenous people. He is also a DrPH candidate in Environmental Health & Engineering at Johns Hopkins University studying genomics x environment x outcome interactions to illuminate the true causes of health disparity for U.S. under-served populations',
    },
    {
        'name': 'Amy Zhang',
        'img': 'cab/azhang.jpg',
        'title': 'Communications Manager & Quantitative Committee Co-Lead, AAPI COVID-19 Project',
        'bio': 'Amy Zhang, MA, is a PhD student in Sociology at the University of Texas at Austin who serves as the Communications Manager and Quantitative Committee Co-Lead for the AAPI COVID-19 Project (ACP), a mixed-methods research collaborative investigating how the COVID-19 pandemic impacts the lives of Asians, Asian Americans, Native Hawaiians, and Pacific Islanders in the United States. ACP researchers aim to uncover multiple layers of harm — not just the virus itself and its subsequent impacts on economic security, but also the correlated intensification of racism and xenophobia impacting A/AAs and NHPIs. Amy is broadly interested in social relationships and health, particularly at the intersections of gender, race, and immigrant status.'
    }
]

export default function About(){
    return (
       <CabPage>
           <NavBar light/>
           <ContentContainer>
               <h1>The Atlas Community Advisory Board</h1>
               <hr/>
               <h2>
                    The community advisory board (CAB) represents key stakeholders in the implementation and outcome of the US COVID Atlas.
               </h2>
                <p>
                    The CAB draws on our members’ expertise to guide the development of our tools and efforts to ensure that the Atlas meets the needs of communities and organizations and serves as a valuable data tool for furthering health equity. This group will convene quarterly to discuss the Atlas' current work and our major initiatives going forward. Below are the current members:
                </p>
                <Gutter h={32} />
                <MemberGrid members={cabMembers} columns={{xs:12}}/>
           </ContentContainer>
           <Footer/>
       </CabPage>
    );
}