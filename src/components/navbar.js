import React from 'react';
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
              <img src={`${process.env.PUBLIC_URL}/favicon/android-icon-192x192.png`} style={{height: '30px', paddingRight: '5px'}} alt="US Covid Atlas Logo" /><a href="index.html">US COVID ATLAS </a>
            </div>
          <NavItems> 
            <li><a href="data.html">DATA</a></li>
            <li><a href="api.html">API</a></li>
            <li><a href="methods.html">METHODS</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="about.html">INSIGHTS</a></li>
            <li><a href="about.html">ABOUT</a></li>
            <li><a href="contact.html">CONTACT</a></li>
          </NavItems>
        </div>
    )
}

export default NavBar