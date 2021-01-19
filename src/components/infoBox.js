import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { colors } from '../config';
import { pages } from '../wiki';
import { StyledDropDown } from '../styled_components';

const InfoContainer = styled.div`
    background: ${colors.gray};
    color: ${colors.white};
    padding: 0;
    overflow: hidden;
    display: ${props => props.active ? 'initial' : 'none'};
    border-radius: 4px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    svg {
        width: 10px;
        height: 10px;
        padding: 5px;
        fill: ${colors.white};
        display: inline;
        transition: 250ms all;
        cursor: pointer;
    }
    a {
       color: ${colors.yellow}; 
       text-decoration:none;
    }
    @media (max-width:1024px) {
        right:50%;
        bottom:50%;
        transform: translate(50%, 50%);
        overflow:hidden;
    }
`

const Drawer = styled.div`
    position:absolute;
    left:5px;
    top:25px;
    max-width:120px;
    @media(max-width:1024px) {
        width:100%;
    }
`

const DrawerButton = styled.button`
    display:block;
    text-align:left;
    background:none;
    color:${props => props.active ? colors.lightblue : colors.white};
    border:none;
    outline:none;
    line-height:2;
    transition:250ms;
    font-family:'Lato', sans-serif;
    opacity: ${props => props.active ? 1 : 0.6};
    &:hover {
        opacity:1;
    }
    @media(max-width:1024px) {
        display:none;
    }
`

const BodyContainer = styled.div`
    position:absolute;
    left: 120px;
    padding: 0 50px 50px 0;
    box-sizing:border-box;
    top:25px;
    transform:translateX(25px);
    overflow-y:scroll;
    height:calc(100% - 25px);
    width:calc(100% - 105px);
    font-size:125% !important;
    line-height:1.5 !important;
    .social-container {
        a {
            img {
                width: 25px;
                height: 25px;
                padding: 5px 10px 0px 0px;
                transition: all 250ms ease 0s;
                opacity: 0.7;
                &:hover {
                    opacity:1;
                }
            }
        }
    }
    button.hoverButton {
        background:none;
        border:none;
        border-bottom:1px solid ${colors.yellow};
        outline:none;
        color:${colors.yellow};
        padding:0;
        &:after {
            content:' ⚼';
        }
    }
    @media (max-width:1024px) {
        left:0;
        width:calc(100% + 15px);
        height:calc(100% - 75);
        top:75px;
        font-size:100% !important;
    }
`

const TutorialButton = styled.button`
    background:none;
    outline:none;
    border:1px solid white;
    cursor:pointer;
    text-align:left;
    padding:5px;
    max-width:40%;
    display:inline-block;
    float:left;
    color:${colors.white};
    font-family:'Lato', sans-serif;
    padding:10px;
    transition:250ms all;
    &:hover {
        background: ${colors.yellow};
        color: ${colors.gray};
    }
    h3, p {
        padding:0;
        margin:0;
    }
`

const PagesDropDown = styled(StyledDropDown)`
    position:absolute;
    top:0;
    visibility:hidden;
    left:50%;
    transform:translateX(-50%);
    @media (max-width:1024px) {
        visibility:visible;
    }
`

const tutorialInfo = [
    {
        "title":"Choropleth Maps",
        "subtitle": "Explore counts and percentages of cases, deaths, hosipital beds, and testing data.",
        "link": "choropleth-tutorial"
    }
]


const InfoBox = () => {
    const panelOpen = useSelector(state => state.panelState.tutorial)
    const [currArticle, setCurrArticle] = useState("welcome")
    
    const handleSelect = (e) => {
        console.log(e)
        setCurrArticle(e.target.value)
    }

    return (
        <InfoContainer active={panelOpen}>
            <Drawer>
                {Object.keys(pages).map(page => 
                    pages[page]["pageName"] !== null ? 
                    <DrawerButton 
                            onClick={() => setCurrArticle(page)}
                            active={currArticle === page}
                        >
                                {pages[page]["pageName"]}
                    </DrawerButton>
                    : ''
                )}
            </Drawer>
            <PagesDropDown id="selectPage">
                    <Select 
                        value={currArticle} 
                        id="numerator-select"
                        onChange={handleSelect}
                    >
                        
                        {Object.keys(pages).map(page => 
                            pages[page]["pageName"] !== null ? 
                            <MenuItem 
                                value={page} 
                                key={page}
                                >
                                        {pages[page]["pageName"]}
                            </MenuItem>
                            : 
                            <MenuItem 
                                value={page} 
                                key={page}
                                style={{display:'none'}}
                                >
                                        {pages[page]["pageName"]}
                            </MenuItem>
                        )}
                    </Select>
                </PagesDropDown>
            <BodyContainer>
                {pages[currArticle]['content']}
                {(currArticle === "tutorials" || currArticle === "getting-started") && 
                    tutorialInfo.map(tutorial => 
                        <TutorialButton onClick={() => setCurrArticle(tutorial.link)}>
                            <h3>{tutorial.title}</h3>
                            <p>{tutorial.subtitle}</p>
                        </TutorialButton>
                    )
                }
            </BodyContainer>
        </InfoContainer>
    )
}

export default InfoBox;