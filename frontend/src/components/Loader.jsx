import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <span>Loading...</span>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px; /* Matches loader size */
  
  .loader {
    width: 100px;
    height: 100px;
    position: relative;
    border-radius: 50%;
    border-top: 5px solid #e74c3c;
    animation: spin 1.5s linear infinite;
  }

  .loader::before,
  .loader::after {
    content: '';
    width: 100px;
    height: 100px;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    box-sizing: border-box;
    border-top: 5px solid transparent;
  }

  .loader::before {
    border-top-color: #e67e22;
    transform: rotate(120deg);
  }

  .loader::after {
    border-top-color: #3498db;
    transform: rotate(240deg);
  }

  .loader span {
    position: absolute;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    color: #394078ff;
    top: 0;
    left: 0;
    transform-origin: center;
    animation: counterSpin 1.5s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes counterSpin {
    to { transform: rotate(-360deg); }
  }
`;

export default Loader;
