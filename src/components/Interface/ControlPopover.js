import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import styled from "styled-components";
import { Icon } from "../../components";
import colors from "../../config/colors";
import { StyledDropDown } from "../../components";

const PopoverContainer = styled.div`
  position: absolute;
  left: ${(props) => props.left !== undefined ? typeof props.left === 'string' ? props.left : 0 : 'initial'};
  bottom: ${(props) => props.bottom !== undefined ? typeof props.bottom === 'string' ? props.bottom : 0 : 'initial'};
  right: ${(props) => props.right !== undefined ? typeof props.right === 'string' ? props.right : 0 : 'initial'};
  top: ${(props) => props.top !== undefined ? typeof props.top === 'string' ? props.top : 0 : 'initial'};
  width: 2rem;
  height: 2rem;
  z-index:500;
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
      stroke: ${props => props.color};
      fill: none;
      path {
        fill: ${props => props.color};
      }
    }
    &:hover {
      opacity: 1;
    }
  }
`;

const PopoverContent = styled.div`
  background: ${colors.gray};
  border:1px solid ${colors.yellow};
  color: ${colors.white};
  padding: 1em;
  overflow: hidden;
`;
//   {
//   type: header | helperText | label | select | switch | geocoder | size
//   content: text | list
//   value: text | state
//   action: setState | null
//   additionalProps: {...}
//   }

const H3 = ({ content }) => <h3>{content}</h3>;
const P = ({ content }) => <p>{content}</p>;
const Label = ({ content }) => <label>{content}</label>;
const SelectControl = ({ content, value, action }, rest) => (
  <StyledDropDown style={{marginTop: '1.5em', width: '100%'}}>
    <InputLabel htmlFor="variableSelect">{content.label}</InputLabel>
    <Select
      MenuProps={{ id: "variableMenu" }}
      value={value}
      onChange={action}
      {...rest}
    >
      {content.items.map((item, index) => (
        <MenuItem key={index} value={item.value}>
          {item.text||item.label}
        </MenuItem>
      ))}
    </Select>
  </StyledDropDown>
);

const StyledSwitch = styled.div`
  margin: 0 5px;
  @media (max-width: 960px) {
    margin: 0;
  }
  p {
    color: white;
    display: inline;
    text-align: center;
  }
  span.MuiSwitch-track {
    background-color: ${colors.lightgray};
  }
  .MuiSwitch-colorSecondary.Mui-checked {
    color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track {
    background-color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary:hover {
    background-color: ${colors.lightblue}55;
  }
`;

const SwitchControl = ({ content, value, action }, rest) => <StyledSwitch>
  <Switch
    checked={value}
    onChange={action}
    name="log chart switch"
    inputProps={{ "aria-label": "secondary checkbox" }}
  />
  <p>{content}</p>
</StyledSwitch>

const ControlElementMapping = {
  header: H3,
  helperText: P,
  label: Label,
  select: SelectControl,
  switch: SwitchControl,
  // geocoder: Geocoder,
  // size: Size,
};

export default function ControlsPopover({ controlElements = [], top, bottom, left, right, iconColor, className }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const id = !!anchorEl ? "simple-popover" : undefined;

  return (
    <PopoverContainer className={className} top={top} bottom={bottom} left={left} right={right} color={iconColor||colors.yellow}>
      <button aria-describedby={id} variant="contained" onClick={handleClick} title="Open Settings">
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
          {controlElements.map((elementProps, idx) => {
            if (ControlElementMapping[elementProps.type]) {
              const El = ControlElementMapping[elementProps.type];
              return <El key={idx} {...elementProps} />;
            } else {
              return null;
            }
          })}
        </PopoverContent>
      </Popover>
    </PopoverContainer>
  );
}
