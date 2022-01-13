import { useState } from "react";
import Popover from "@mui/material/Popover";
import Select from '@mui/material/Select';
import MenuItem from "@mui/material/MenuItem";
import Switch from '@mui/material/Switch';
import { Icon } from "../components";
import styled from "styled-components";
import colors from "../config/colors";


const PopoverContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  button {
    width: 100%;
    height: 100%;
    border: none;
    background: none;
    cursor: pointer;
    opacity: 0.6;
    transition: 250ms all;
    svg {
      width: 60%;
      height: 60%;
      stroke: ${colors.yellow};
      fill: none;
      path {
        fill: ${colors.yellow};
      }
    }
    &:hover {
      opacity: 1;
    }
  }
`;

const PopoverContent = styled.div`
  background: ${colors.black};
  color: ${colors.white};
  padding:.5em;
  overflow:hidden;
`;
//   {
//   type: header | helperText | label | select | switch | geocoder | size
//   content: text | list 
//   value: text | state 
//   action: setState | null
//   additionalProps: {...}
//   }

const H3 = ({ content }) => <h3>{content}</h3>
const P = ({ content }) => <p>{content}</p>
const Label = ({ content }) => <label>{content}</label>
const SelectControl = ({ content, value, action }, rest) => <Select value={value} onChange={action} {...rest}>
  {content.map((item, index) => <MenuItem key={index} value={item}>{item}</MenuItem>)}
</Select>
const ControlElementMapping = {
  header: H3,
  helperText: P,
  label: Label,
  select: SelectControl,
  switch: Switch,
  // geocoder: Geocoder,
  // size: Size,
}

export default function ControlsPopover({
  controlElements=[]
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const id = !!anchorEl ? "simple-popover" : undefined;

  return (
    <PopoverContainer>
      <button aria-describedby={id} variant="contained" onClick={handleClick}>
        <Icon symbol="settings" />
      </button>
      <Popover
        id={id}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{
          padding: "1em",
          overflow: "hidden",
        }}
      >
        <PopoverContent>
          {controlElements.map(elementProps => {
            if (ControlElementMapping[elementProps.type]) {
              const El = ControlElementMapping[elementProps.type];
              return <El {...elementProps}/>
            } else {
              return null
            }
          })}
        </PopoverContent>
      </Popover>
    </PopoverContainer>
  );
}
