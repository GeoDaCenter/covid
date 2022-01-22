import { Grid } from "@mui/material";
import styled from "styled-components";
import { Icon } from "../../../components";
import colors from "../../../config/colors";

const TemplateButton = styled.button`
  background: none;
  color: ${colors.white};
  border: 1px solid ${colors.white};
  padding: 0 1em 2em 1em;
  max-width: 150px;
  margin: 1em auto;
  display: block;
  cursor: pointer;
  transition: 250ms all;
  svg {
    transition: 250ms all;
    fill: ${colors.white};
    width: 100%;
    padding: 20%;
    aspect-ratio: 1;
  }
  &:hover,
  &.selected {
    border-color: ${colors.yellow};
    color: ${colors.yellow};
    svg {
      fill: ${colors.yellow};
    }
  }
  @media (max-width: 900px) {
    width: 100%;
    max-width: 100%;
    max-height: 20vh;
    svg {
      /* height:100%; */
      width: initial;
      aspect-ratio: initial;
    }
  }
`;

const CustomizerCointainer = styled.div`
  h2 {
    display:block;
    margin-bottom:1em;
  }
`
const InputContainer = styled.div`
  display:block;
`

function TemplateCustomzier({ template = {} }) {
  if (!template?.customization) return null;
  const {label, input} = template.customization;

  return <CustomizerCointainer>
    <h2>{label}</h2>
    <InputContainer>
      {input}
    </InputContainer>
  </CustomizerCointainer>
}

export default function TemplateSelector({
  selectedTemplate = "",
  setSelectedTemplate = () => {},
  templates = [],
  showTemplateCustomizer = false,
}) {
  const templatesToShow = !showTemplateCustomizer
    ? templates
    : templates.filter((t) => t.label === selectedTemplate);
    
  return (
    <Grid container spacing={2} justify="center" alignContent="center" alignItems={showTemplateCustomizer ? 'flex-start' : "center" }>
      {templatesToShow.map(({ icon, label }, idx) => (
        <Grid item xs={12} md={3} key={"template-button" + idx}>
          <TemplateButton
            onClick={() => setSelectedTemplate(label)}
            className={selectedTemplate === label ? "selected" : ""}
          >
            <Icon symbol={icon} />
            {label}
          </TemplateButton>
        </Grid>
      ))}
      {showTemplateCustomizer && (
        <Grid item xs={12} md={9}>
          <TemplateCustomzier template={templatesToShow[0]} />
        </Grid>
      )}
    </Grid>
  );
}
