import React, { useContext } from 'react';
import { Checkbox } from 'semantic-ui-react';
import styled from 'styled-components';
import { GameEditionContext } from '../contexts/GameEditionContext';

const ToggleContainer = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  color: #ffffff;
  justify-content: center;
  flex-direction: row;
  border-radius: 20px;
  font-family: ${({ theme: { fontFamily } }) =>
    `${fontFamily.pressStartRegular}`};

  .ui.checkbox {
    margin-bottom: 4px;
  }

  .ui.toggle.checkbox .box:before,
  .ui.toggle.checkbox label:before,
  .ui.toggle.checkbox input:checked ~ .box:before,
  .ui.toggle.checkbox input:checked ~ label:before {
    background: transparent linear-gradient(112deg, #5c4499 0%, #271259 100%) 0%
      0% no-repeat padding-box;
    width: 4rem;
    height: 1.8em;
  }

  .ui.toggle.checkbox .box:after,
  .ui.toggle.checkbox label:after {
    background: #74c04b 0% 0% no-repeat padding-box !important;
    box-shadow: inset 2px 5px 9px #00f04129 !important;
  }

  .ui.toggle.checkbox input ~ .box:after,
  .ui.toggle.checkbox input ~ label:after {
    top: 2.5px;
    left: 0.2rem;
  }

  .ui.toggle.checkbox input:checked ~ .box:after,
  .ui.toggle.checkbox input:checked ~ label:after {
    left: 2.3rem;
  }

  transform: ${({ animation }) =>
    !animation ? 'translateX(0px)' : 'translateX(-250px)'};
  transition: transform 1s ease-in-out;
`;

const GameLabel = styled.div`
  width: 100%;
  @media (max-width: ${({ theme: { mediaQueries } }) =>
      `${mediaQueries.mobileSmallPixel}px`}) {
    width: min-content;
    font-size: 10px;
  }
  vertical-align: text-bottom !important;
  margin-right: 4px;
`;

const GameEditionToggle = ({ animation }) => {
  const game = useContext(GameEditionContext);
  return (
    <ToggleContainer animation={animation}>
      <GameLabel gameEditionView={game.gameEditionView}>Game Edition</GameLabel>
      <Checkbox
        toggle
        onChange={() => {
          game.setGameEditionView(!game.gameEditionView);
          game.closeModal();
        }}
      />
    </ToggleContainer>
  );
};

export default GameEditionToggle;
