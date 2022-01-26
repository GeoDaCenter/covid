import styled from 'styled-components';
import FormControl from '@mui/material/FormControl';
import colors from '../../config/colors';

export const StyledDropDown = styled(FormControl)`
  margin:0 10px 0 0;
  color:${props => props.active ? colors.yellow : colors.white};
  padding:0;
  .MuiInputBase-root {
    font-family: 'Lato', sans-serif;
    border-radius:0;
  }
  .MuiFormLabel-root {
  color:${props => props.active ? colors.yellow : colors.white};
    font-family: 'Lato', sans-serif;
  }
  .MuiSelect-select {
    padding: .5em 1em;
  }
  .Mui-focused {
  color:${props => props.active ? colors.yellow : colors.white} !important;
  }
  .MuiInput-underline:before {
    border-bottom:1px solid ${props => props.active ? colors.yellow : colors.white};
  }
  .MuiInput-underline:after {
    border-bottom: 2px solid ${props => props.active ? colors.yellow : colors.white};
  }  
  .MuiOutlinedInput-root {
    border: 1px solid ${props => props.active ? colors.yellow : colors.lightgray};
  }
  .MuiInputLabel-root {
    background: ${colors.gray};
    padding:0 0.25em;
    top: -8px;
  }
  .MuiInputLabel-shrink {
    top: 0;
  }
  .MuiInputBase-root {
  color:${props => props.active ? colors.yellow : colors.white};
    .MuiSvgIcon-root {
      color: rgba(255,255,255,0.54);
    },
    .MuiPopover-paper {
      color:white;
    }
  }
  .MuiFormGroup-root {
    .MuiFormControlLabel-root{
      color:${props => props.active ? colors.yellow : colors.white};
      span {
        font-family: 'Lato', sans-serif;
      }
      .MuiRadio-root {
        color: rgba(255,255,255,0.54);
      }
    }
  }
  .MuiRadio-root {
    color:${props => props.active ? colors.yellow : colors.white};
  }
  .MuiRadio-colorSecondary.Mui-checked {
    color:${props => props.active ? colors.yellow : colors.white};
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
`;

export const StyledDropDownNoLabel = styled(StyledDropDown)`
  .MuiFormLabel-root {
    display: none;
  }
  padding: 10px 0 5px 20px !important;
  label + .MuiInput-formControl {
    margin-top: 0;
  }
`;
