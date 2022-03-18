import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import colors from '../../config/colors';
import { hamburger, close } from '../../config/svg';

const NavBarOuterContainer = styled.div`
  width: 100%;
  background: ${(props) => (props.light ? colors.skyblue : colors.darkgray)};
  border-bottom: ${(props) => (props.light ? 'none' : '1px solid black')};
  z-index: 1;
  position: relative;
  pointer-events: none;
  @media print {
    display: none;
  }
`;

const NavbarContainer = styled.nav`
  width: 100%;
  max-width: ${(props) => (props.light ? '1140px' : 'initial')};
  display: flex;
  margin: 0 auto;
  color: #0d0d0d;
  z-index: 249;
  pointer-events: none;
  div,
  ul {
    pointer-events: all;
  }
  ul {
    list-style: none;
    margin: 0;
    order: ${(props) => (props.light ? '1' : 'initial')};
    @media (min-width: 1025px) {
      display: flex;
      margin: ${(props) => (props.light ? '0 0 0 auto' : '0px')};
    }
    li {
      @media (min-width: 1024px) {
        height: 50px;
        display: flex;
      }
      align-items: center;
      box-sizing: border-box;
    }
  }
  a,
  button {
    margin: auto;
    height: 100%;
    display: flex;
    align-items: center;
    flex: 1;
    color: ${(props) => (props.light ? colors.darkgray : colors.lightgray)};
    text-align: center;
    padding: 10px;
    text-decoration: none;
    transition: 250ms all;
    background: none;
    border: none;
    font-family: Lato, sans-serif;
    font-size: 0.9rem;
    line-height: 1.5;
    letter-spacing: 1.75px;
    font-weight: 400;
    font-stretch: normal;
    font-opacity: 30%;
    cursor: pointer;
    &:hover {
      background: ${(props) =>
        props.light ? colors.teal : colors.lightgray}55;
      color: ${(props) => (props.light ? colors.teal : colors.yellow)};
    }
    &.active {
      background: ${(props) => (props.light ? colors.teal : colors.darkgray)};
      color: #eee;
    }
  }
  button {
    padding-right: 20px;
  }
  button::after {
    content: '❱';
    transform: rotate(90deg) scaleY(0.75) translateX(2px);
    padding-bottom: 15px;
    color: ${(props) => (props.light ? colors.teal : colors.red)};
  }
  button.active::after {
    color: #eee;
  }
`;

const NavLogo = styled.div`
  color: white;
  display: flex;
  align-items: center;
  padding: 0 0 0 2px;
  font-size: 20px;
  span {
    padding-left: 10px;
  }
`;

const NavItems = styled.div`
  @media (max-width: 1025px) {
    position: absolute;
    top: 50px;
    width: 100%;
    height: calc(100vh - 50px);
    background: ${(props) => (props.light ? colors.teal : colors.black)}ee;
    display: flex;
    align-items: center;
    justify-content: center;
    ul {
      flex-direction: column;
      z-index: 500;
      li {
        display: block;
        a {
          color: white;
          font-weight: bold;
          font-size: 2rem;
          &:hover {
            background: ${(props) =>
              props.light ? colors.lightblue : colors.black}ee;
          }
        }
      }
    }
  }
`;
const fadeIn = keyframes`
  from {
    opacity:0;
  }

  to {
    opacity:1;
  }
`;

const Shade = styled.button`
  background: rgb(0, 0, 0);
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.25) 100%
  );
  width: 100%;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 50px;
  padding: 0;
  margin: 0;
  z-index: 100;
  border: none;
  animation: ${fadeIn} 250ms linear 1;
  cursor: pointer;
`;

const SuperDropdown = styled.div`
  width: 100%;
  max-width: ${(props) => (props.light ? '1140px' : 'none')};
  display: flex;
  margin: 0 auto;
  background: ${(props) => (props.light ? colors.teal : colors.darkgray)};
  position: fixed;
  left: ${(props) => (props.light ? '50%' : '0')};
  top: 50px;
  transform: ${(props) => (props.light ? 'translateX(-50%)' : 'none')};
  z-index: 110;
  border:1px solid black;
  animation: ${fadeIn} 250ms linear 1;
  user-select: none;
  a {
    color: ${colors.white};
  }
`;

const PageSection = styled.span`
  padding: 0.5em 2em;
  a {
    font-size: 1.35rem;
    font-weight: bold;
    text-decoration: none;
    line-height: 2;
    border-bottom: 2px solid rgba(0, 0, 0, 0);
    transition: 250ms all;
    span {
      color: ${colors.red};
      padding-left: 0.25em;
      transition: 250ms all;
    }
    &:hover {
      border-bottom: 2px solid ${colors.yellow};
      span {
        padding-left: 0.5em;
      }
    }
  }
  p {
    max-width: 35ch;
    padding-bottom: 1.5em;
    color: ${colors.white};
  }
`;

const NavHamburger = styled.button`
  margin: 0 0 0 auto !important;
  max-height: 50px;
  max-width: 50px;
  padding: 0.125em !important;
  pointer-events: all;
  overflow: hidden;
  &::after {
    display: none;
  }
  svg g {
    fill: ${(props) => (props.light ? colors.black : colors.white)};
  }
`;

const pageDropDowns = {
  INSIGHTS: [
    {
      header: 'Research',
      desc: 'Peer-reviewed academic research related to efforts to better understand COVID-19 and the tools we use.',
      link: '/insights#research',
    },
    {
      header: 'Blog',
      desc: "Snapshots and short-form articles of what we're seeing and how we're working.",
      link: '/insights#blog',
    },
    {
      header: 'Stories',
      desc: 'Data visualizations that highlight the challenges, reality, and complexity of COVID-19.',
      link: '/insights#stories',
    },
  ],
  DATA: [
    {
      header: 'Docs',
      desc: 'Detailed documentation on the data sources used in the Atlas including sources, limitations, and how to access to raw data.',
      link: '/docs',
    },
    {
      header: 'Download',
      desc: 'Interactive data downloader to access cleaned CSV data on the Atlas.',
      link: '/download',
    },
    {
      header: 'API',
      desc: 'Sign up for access to data and spatial statistics via the Atlas API',
      link: '/api',
    },
  ],
  // 'METHODS':[
  //   {
  //     header: 'Mapping',
  //     desc: 'How we use spatial statistics, cartography, and geographic information science to produce the Atlas.',
  //     link: '/methods#mapping'
  //   },
  //   {
  //     header: 'Infrastructure',
  //     desc: 'The data and statistical backbone of the Atlas.',
  //     link: '/methods#infrastructure'
  //   },
  //   {
  //     header: 'Data Collection',
  //     desc: 'Our structure for daily data updates, scraping, collection, and aggregation.',
  //     link: '/methods#data'
  //   },
  // ],
  ABOUT: [
    {
      header: 'Overview',
      desc: 'What the Atlas is and what can it help you learn.',
      link: '/about',
    },
    {
      header: 'Team',
      desc: 'The core team and contributors behind the Atlas project.',
      link: '/about#team',
    },
    {
      header: 'Advisory Board',
      desc: 'The community advisory board driving engagement from 2021 onward.',
      link: '/cab',
    },
    // {
    //   header: 'FAQ',
    //   desc: 'Frequently asked questions on data, maps, and the project.',
    //   link: '/faq'
    // },
  ],
};

export default function NavBar(props) {
  const [currentDropdown, setCurrentDropdown] = useState(false);
  const [dims, setDims] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const [navOpen, setNavOpen] = useState(false);

  const listener = (e) => {
    setCurrentDropdown(false);
    setNavOpen(false);
    document.removeEventListener('scroll', listener);
  };
  const handleOpenDropdown = (page) => {
    setCurrentDropdown(page);
    document.addEventListener('scroll', listener);
  };

  const toggleNavOpen = () => (navOpen ? setNavOpen(false) : setNavOpen(true));
  const handleResize = () => {
    setCurrentDropdown(false);
    setNavOpen(false);
    setDims({
      height: window.innerHeight,
      width: window.innerWidth,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  const NavButton = ({ page = '' }) => (
    <button
      className={currentDropdown === page ? 'active' : ''}
      onClick={() => handleOpenDropdown(page)}
      onMouseOver={() => handleOpenDropdown(page)}
    >
      {page}
    </button>
  );

  return (
    <>
      <NavBarOuterContainer light={props.light}>
        <NavbarContainer light={props.light}>
          <NavLogo>
            <a href="/">
              <img
                src={`${process.env.PUBLIC_URL}/favicon/android-icon-192x192.png`}
                style={{ height: '30px', paddingRight: '5px' }}
                alt="US Covid Atlas Logo"
              />
              <span>US COVID ATLAS</span>
            </a>
          </NavLogo>
          {(navOpen || dims.width > 1024) && (
            <NavItems light={props.light}>
              <ul>
                <li>
                  <a href="/map">MAP</a>
                </li>
                <li>
                  {dims.width > 1024 ? (
                    <NavButton page="INSIGHTS" />
                  ) : (
                    <a href="/insights">INSIGHTS</a>
                  )}
                </li>
                <li>
                  {dims.width > 1024 ? (
                    <NavButton page="DATA" />
                  ) : (
                    <a href="/data">DATA</a>
                  )}
                </li>
                {/* <li>{dims.width > 1024 ? <NavButton page="METHODS" /> : <a href="/methods">METHODS</a>}</li> */}
                <li>
                  {dims.width > 1024 ? (
                    <NavButton page="ABOUT" />
                  ) : (
                    <a href="/about">ABOUT</a>
                  )}
                </li>
                <li>
                  <a href="/methods">METHODS</a>
                </li>
                <li>
                  <a href="/faq">FAQ</a>
                </li>
                <li>
                  <a href="/contact">CONTACT</a>
                </li>
              </ul>
            </NavItems>
          )}
          {dims.width <= 1024 && (
            <NavHamburger onClick={toggleNavOpen} light={props.light}>
              {navOpen ? close : hamburger}
            </NavHamburger>
          )}
        </NavbarContainer>
      </NavBarOuterContainer>
      {currentDropdown && (
        <SuperDropdown light={props.light}>
          {pageDropDowns[currentDropdown].map((entry) => (
            <PageSection key={entry.header}>
              <a href={entry.link}>
                {entry.header}
                <span>❱</span>
              </a>
              <p>{entry.desc}</p>
            </PageSection>
          ))}
        </SuperDropdown>
      )}
      {currentDropdown && (
        <Shade
          onClick={() => setCurrentDropdown(false)}
          onMouseOver={() => setCurrentDropdown(false)}
        />
      )}
    </>
  );
}
