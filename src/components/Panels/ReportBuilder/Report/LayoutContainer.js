import styled from "styled-components";
import colors from "../../../../config/colors";

export const LayoutContainer = styled.div`
  overflow-y: scroll;
  max-height: 80vh;
  margin-top: 1em;
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #2b2b2b;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: url("${process.env.PUBLIC_URL}/icons/grip.png"), #999;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%;
    transition: 125ms all;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: url("${process.env.PUBLIC_URL}/icons/grip.png"), #f9f9f9;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%;
  }
  @media print {
    overflow-y: visible;
    width:100%;
  }
`;


export const PrintContainer = styled.div`
  border: 1px solid ${colors.yellow};
  position:fixed;
  top:50%;
  left:50%;
  background:${colors.darkgray};
  z-index:5000;
  width: 80%;
  margin: 2em auto;
  padding: 2em;
  transform:translate(-50%,-50%);
  h2,
  h4,
  p {
    margin-bottom: 1em;
  }
  @media (max-width:1440px){
    width:100%;
  }
`;
export const PrintButton = styled.button`
  background: ${colors.yellow};
  border: none;
  padding: 0.5em 1em;
  margin: 1em 1em 0 0;
  font-size: 1rem;
  cursor: pointer;
  transition:250ms all;
  &:hover {
    background: ${colors.orange};
  }
`;