import styled from 'styled-components';
import colors from '../../config/colors';

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 1140px;
  padding: 20px;
  margin: 0 auto;
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    color: #0d0d0d;
  }
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: 49px;
    font-weight: 300;
    font-style: italic;
  }
  h2 {
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: 1.75px;
    font-weight: 700;
    font-stretch: normal;
    margin: 20px 0;
  }
  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 300;
    font-style: italic;
  }
  p,
  a,
  ul li,
  ol li {
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.63;
    letter-spacing: normal;
  }
  ul,
  ol {
    padding-left: 20px;
  }
  a {
    font-weight: bold;
    text-decoration: none;
    color: ${colors.blue};
  }
  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #c1ebeb;
    margin: 1em 0;
    padding: 0;
  }
`;