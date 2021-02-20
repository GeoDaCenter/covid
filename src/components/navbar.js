import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavItems = styled.ul`
  @media (max-width:1024px){
    display:none !important;
  }
`
const NavBar = () => {
    return (
        <div className="navbar">
            <div className="nav-logo">
              <img src={`${process.env.PUBLIC_URL}/favicon/android-icon-192x192.png`} style={{height: '30px', paddingRight: '5px'}} alt="US Covid Atlas Logo" /><a href="/">US COVID ATLAS </a>
            </div>
          <NavItems> 
            <li><NavLink to="/data">DATA</NavLink></li>
            <li><NavLink to="/api">API</NavLink></li>
            <li><NavLink to="/methods">METHODS</NavLink></li>
            <li><NavLink to="/faq">FAQ</NavLink></li>
            <li><NavLink to="/insights">INSIGHTS</NavLink></li>
            <li><NavLink to="/about">ABOUT</NavLink></li>
            <li><NavLink to="/contact">CONTACT</NavLink></li>
          </NavItems>
        </div>
    )
}

export default NavBar