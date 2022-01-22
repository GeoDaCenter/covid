import styled from "styled-components";
import colors from "../../../../config/colors";

export const MetaButtonsContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
`;
export const MetaButton = styled.button`
  background: none;
  color: ${(props) => (props.reset ? colors.strongOrange : "white")};
  border: 1px solid ${(props) => (props.reset ? colors.strongOrange : "white")};
  padding: 0.25em 0.5em;
  margin-right: ${(props) => (props.reset ? "0" : "1em")};
  cursor: pointer;
`;
