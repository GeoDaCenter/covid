import styled from 'styled-components';
import colors from '../../config/colors';

export const HoverDiv = styled.div`
  background: ${colors.gray};
  border:1px solid ${colors.darkgray};
  padding: .5em;
  color: white;
  z-index:500000;
  /* box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.7); */
  /* border-radius: 0.5vh 0.5vh 0 0; */
  h3 {
    margin: 5px 0;
  }
  hr {
    margin: 5px 0;
  }
  max-width: 300px;
  line-height: 1.25;
`;
