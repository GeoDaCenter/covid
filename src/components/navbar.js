import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavbarContainer  = styled.nav`
  display: flex;
  width: 100%; 
  height: 50px;     
  color: #0d0d0d; 
  position: absolute; 
  top: 0px; 
  left: 0px;
  z-index:999;
  font-family: Lato, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 1.75px;
  font-weight: 400;
  font-stretch: normal;
  font-opacity: 30%;
  ul {
    list-style: none;
    display: flex;
    height: 100%;
    margin: 0px;
    @media (max-width:600px){
      display:none
    }
    li {
      display: flex;
      align-items: center;
      margin:0;
      padding:0;
    }
  }
  a {
    margin: auto;
    height:100%;
    color: #ddd;
    text-align: center;
    padding:10px 15px;
    text-decoration:none;
    transition:250ms all;
    &:hover {
      background: #444;
      color: #eee;
    }
  }
`

const NavLogo = styled.div`
  color: white;
  display: flex;
  align-items: center;
  padding:0 20px;
  font-size: 20px;
`

const NavItems = styled.ul`
  @media (max-width:1024px){
    display:none !important;
  }
`

const NavBar = () => {
    return (
        <NavbarContainer>
            <NavLogo>
              <img src={`${process.env.PUBLIC_URL}/favicon/android-icon-192x192.png`} style={{height: '30px', paddingRight: '5px'}} alt="US Covid Atlas Logo" /><a href="/">US COVID ATLAS </a>
            </NavLogo>
          <NavItems> 
            <li><NavLink to="/data">DATA</NavLink></li>
            <li><NavLink to="/api">API</NavLink></li>
            <li><NavLink to="/methods">METHODS</NavLink></li>
            <li><NavLink to="/faq">FAQ</NavLink></li>
            <li><NavLink to="/insights">INSIGHTS</NavLink></li>
            <li><NavLink to="/about">ABOUT</NavLink></li>
            <li><NavLink to="/contact">CONTACT</NavLink></li>
          </NavItems>
        </NavbarContainer>
    )
}

export default NavBar