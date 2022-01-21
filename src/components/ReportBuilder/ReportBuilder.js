import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import colors from "../../config/colors";
import countyList from "../../meta/countyNames";

import StepperComponent from "./Stepper";
import TemplateSelector from "./Templates";
import ComboxBox from "./ComboBox";
import Report from "./Report";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1140,
  maxWidth: "80vw",
  bgcolor: colors.gray,
  border: "1px solid #000",
  fontFamily: "'Lato', sans-serif",
  color: "white",
  boxShadow: 0,
  p: 4,
};

const ModalInner = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding-bottom: 4em;
  max-height: 100vh;
  min-height:40vh;
  overflow:hidden;
  transition:250ms all;
`;
const steps = [
  "Choose a template",
  "Select your community",
  "Customize your report",
  "Save or Print",
];

export default function ReportBuilder() {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.panelState.reportBuilder);
  const handleClose = () =>
    dispatch({ type: "TOGGLE_PANEL", payload: "reportBuilder" });
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCounty, setSelectCounty] = useState(null);

  const canProgress =
    (activeStep === 0 && selectedTemplate !== null) ||
    (activeStep === 1 && selectedCounty !== null) ||
    activeStep === 2 ||
    activeStep === 3;
  const countySelector = (
    <ComboxBox
      setValue={setSelectCounty}
      value={selectedCounty}
      label={"County Name"}
      options={countyList}
      id="county-selector-combo-box"
    />
  );
  const templates = [
    {
      label: "My County's Stats",
      icon: "placeMarker",
      customization: {
        label: selectedCounty
          ? `You selected ${selectedCounty?.label}. Click 'Next' to continue`
          : "What is the name of your county?",
        input: countySelector,
      },
    },
    {
      label: "A National Snapshot",
      icon: "usMap",
      customization: {
        label: "What is the name of your county?",
        input: "",
      },
    },
    {
      label: "My Region's Snapshot",
      icon: "focus",
      customization: {
        label: "What is the name of your county?",
        input: "",
      },
    },
    {
      label: "My neighboring county's stats",
      icon: "neighbors",
      customization: {
        label: "What is the name of your county?",
        input: "",
      },
    },
    {
      label: "Something Else (Blank Report)",
      icon: "",
      customization: {
        label: "What is the name of your county?",
        input: "",
      },
    },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <ModalInner>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Atlas Report Builder
          </Typography>
          <StepperComponent
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            canProgress={canProgress}
          />
          {(activeStep === 0 || activeStep === 1) && (
            <>
              {activeStep === 0 ? (
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Use this tool to build a report to help you and your community
                  understand the context of COVID and determinants of health.
                  <br />
                  <br />
                  To get started, which template best fits your needs?
                </Typography>
              ) : (
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Customize your template:
                </Typography>
              )}
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                templates={templates}
                showTemplateCustomizer={activeStep === 1}
              />
            </>
          )}
          {activeStep === 2 && <Report county={selectedCounty} selectedTemplate={selectedTemplate} />}
        </ModalInner>
      </Box>
    </Modal>
  );
}
