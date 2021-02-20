import styled from 'styled-components';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import { colors } from '../config';

export const StyledDropDown = styled(FormControl)`
  margin:0 10px ${props => props.component === 'radios' ? '20' : '40'}px 0!important;
  color:white;
  padding:0;
  .MuiInputBase-root {
    font-family: 'Lato', sans-serif;
  }
  .MuiFormLabel-root {
    color: white;
    font-family: 'Lato', sans-serif;
  }
  .Mui-focused {
    color: white !important;
  }
  .MuiInput-underline:before {
    border-bottom:1px solid rgba(255,255, 255, 0.42);
  }
  .MuiInput-underline:after {
    border-bottom: 2px solid white
  }
  .MuiInputBase-root {
    color: white;
    .MuiSvgIcon-root {
      color: rgba(255,255,255,0.54);
    },
    .MuiPopover-paper {
      color:white;
    }
  }
  .MuiFormGroup-root {
    .MuiFormControlLabel-root{
      color:white;
      span {
        font-family: 'Lato', sans-serif;
      }
      .MuiRadio-root {
        color: rgba(255,255,255,0.54);
      }
    }
  }
  .MuiRadio-root {
    color:white;
  }
  .MuiRadio-colorSecondary.Mui-checked {
    color:white;
  }
  div.radioContainer {
    display:block;
      .MuiFormControlLabel-root {
        margin-right:0;
      }
      button {
        transform:translateY(4px);
      }
    }
  }
`

export const StyledDropDownNoLabel = styled(StyledDropDown)`
  .MuiFormLabel-root {
    display:none;
  }
  padding:10px 0 5px 20px !important;
  label + .MuiInput-formControl {
    margin-top:0;
  }
`

export const SwitchContainer = styled(Grid)`
  padding-top:4px !important;
  p { 
    display: inline;
    color:white;
    transform:translateY(5px);
  }
  span.MuiSwitch-track {
      background-color:${colors.buttongray};
  }
  .MuiSwitch-colorSecondary.Mui-checked {
      color:${colors.lightblue};
  }
  .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track {
      background-color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary:hover {
      background-color:${colors.lightblue}55;
  }
`

export const BinsContainer = styled.div`
  display:inline-block;
  transform:translateY(10px);
  opacity: ${props => props.disabled ? 0.25 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'initial'};
  p { 
    display: inline;
    color:white;
    transform:translateY(5px);
  }
  span.MuiSwitch-track {
      background-color:${colors.buttongray};
  }
  .MuiSwitch-colorSecondary.Mui-checked {
      color:${colors.lightblue};
  }
  .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track {
      background-color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary:hover {
      background-color:${colors.lightblue}55;
  }
`

export const ContentContainer = styled.div`
  width:100%;
  max-width:1140px;
  padding:20px;
  margin:0 auto;
  h1, h2, h3, h4, h5, h6, p {
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
    margin-bottom:20px;
  }
  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 300;
    font-style: italic;
  }
  p, a, ul li, ol li {
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.63;
    letter-spacing: normal;
  }
  ul, ol {
    padding-left:20px;
  }
  a {
    font-weight:bold;
    text-decoration:none;
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
`

export const Gutter = styled.div`
    width:100%;
    height: ${props => props.h}px;
`