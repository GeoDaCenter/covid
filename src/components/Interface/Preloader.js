import React from 'react';
import styled from 'styled-components';
import colors from '../../config/colors';

const PreloaderContainer = styled.div`
  position: fixed;
  top:${({quiet}) => quiet ? '92%' : '50%'};
  left:50%;
  transform:translate(-50%,-50%);
  min-width:100px;
  min-height:50px;
  background:${({quiet}) => quiet ? 'none' : colors.darkgray};
  z-index:500;
  color:white;
  padding:1em;
  font-size:${({quiet}) => quiet ? '.75rem' : '1rem'};
  text-align:center;
  pointer-events:none;
  font-family:'Lato', sans-serif;
`;

const Preloader = ({
  loading=false,
  position="centered",
  message="Loading",
  quiet=false,
}) => {
  return (
    <PreloaderContainer
      style={{ display: !loading ? 'none' : 'initial' }}
      id="preloaderContainer"
      position={position}
      quiet={quiet}
    >
      <img
        src={`${process.env.PUBLIC_URL}/icons/loading.svg`}
        alt="Preloader"
      />
      <p>{message}</p>
    </PreloaderContainer>
  );
};

export default Preloader;
