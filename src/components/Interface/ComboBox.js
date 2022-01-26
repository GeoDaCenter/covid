import * as React from "react";
import TextField from "@mui/material/TextField";
import { Popper } from "@mui/material";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import styled from "styled-components";
import colors from "../../config/colors";

const StyledAutoComplete = styled(Autocomplete)`
margin-top:1em;
  label.MuiInputLabel-root {
    color: ${colors.white};
  }
  fieldset.MuiOutlinedInput-notchedOutline {
    border-color: ${colors.white};
  }
  div.MuiAutocomplete-endAdornment button svg {
    fill: ${colors.white};
  }
  div.MuiAutocomplete-popper {
    display: none;
  }
`;

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: "border-box",
    background: colors.darkgray,
    height:200,
    overflowY: "scroll",
    "& ul": {
      padding: 0,
      height:200,
      margin: 0,
      background: "none",
      li: {
        background: "none",
        color: "white",
      },
    },
  },
});

export default function ComboBox({
  options = [],
  value = {},
  setValue = () => {},
  id = "combo-box",
  label = "Combo Box",
}) {
  return (
    <StyledAutoComplete
      disablePortal
      id={id}
      options={options}
      value={value?.label}
      onChange={(event, newValue) => setValue(newValue)}
      PopperComponent={StyledPopper}
      // open={true}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          // inputProps={{
          //   // autocomplete: "county-search",
          //   form: {
          //     autocomplete: "off",
          //   },
          // }}
        />
      )}
    />
  );
}
