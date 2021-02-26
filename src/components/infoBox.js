// This component has the wiki/manual/info

// Library import
import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

// MUI import
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

// Config/component import
import { colors } from '../config';
import { pages } from '../wiki';
import { StyledDropDown } from '../styled_components';

//// Component Styling
// Main container for component
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
        width: 25px;
        height: 25px;
        padding: 0;
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
    hr {
        margin: 5px 0;
    }
`

// Left hand side list of available pages
// On mobile, this is replaced by a select drop down
const Drawer = styled.div`
    position:absolute;
    left:10px;
    top:25px;
    max-width:120px;
    @media(max-width:1024px) {
        width:100%;
    }
`

// Buttons on left-hand side drawer
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

// Container for main content 
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
    font-size:115% !important;
    line-height:1.75 !important;
    .social-container {
        a {
            img {
                width: 30px;
                height: 22.5px;
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
        font-size:100% !important;
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
    ul, ul li{
        margin:revert;
        padding:revert;
    }
`

// Yellow highlighted button to show interface element when going through tutorial
const TutorialButton = styled.button`
    background:none;
    outline:none;
    box-sizing:border-box;
    border:1px solid white;
    cursor:pointer;
    text-align:left;
    padding:5px;
    width:calc(50% - 10px);
    margin: 5px;
    display:inline-block;
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

// Mobile only: drop down to select article instead of list of pages
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
// End styles

// Tutorials
const tutorialInfo = [
    {
        "title":"Choropleth Maps",
        "subtitle": "Explore counts and percentages of cases, deaths, hosipital beds, and testing data.",
        "link": "choropleth-tutorial"
    },
    {
        "title":"Hotspots",
        "subtitle": "Find groups of counties and states affected by the virus.",
        "link": "hotspot-tutorial"
    },
    {
        "title":"Emerging Trends",
        "subtitle": "Locate areas that will soon be significantly affected by COVID.",
        "link": "emerging-tutorial"
    },
    {
        "title":"Change Over Time",
        "subtitle": "See the history of the virus by county and state.",
        "link": "change-tutorial"
    },
]

// Infobox component
const InfoBox = () => {

    // Redux -- just panel state open/closed
    const panelOpen = useSelector(state => state.panelState.tutorial)

    // Selected Article (local state)
    const [currArticle, setCurrArticle] = useState("welcome")
    
    // Handle selection based on article name
    const handleSelect = (e) => setCurrArticle(e.target.value)

    return (
        <InfoContainer active={panelOpen}>
            {/* List of available articles :: On click sets article */}
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
                {/* Mobile only - select instead of drawer */}
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
                {(currArticle === "getting-started") && 
                    tutorialInfo.map(tutorial => 
                        <TutorialButton onClick={() => setCurrArticle(tutorial.link)}>
                            <h3>{tutorial.title}</h3>
                            <p>{tutorial.subtitle}</p>
                        </TutorialButton>
                    )
                }
                {currArticle.includes('tutorial') && <TutorialButton onClick={() => setCurrArticle('getting-started')}>Return to Tutorials</TutorialButton>}
            </BodyContainer>
        </InfoContainer>
    )
}

export default InfoBox;