import React, { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { Input as SUIInput } from 'semantic-ui-react';
import CustomButton from '../../../components/shared/CustomButton';
import Input from '../../../components/shared/Input';
import { AccountContext } from '../../../contexts/AccountContext';
import { WalletContext } from '../../../contexts/WalletContext';
import { GameEditionContext } from '../../../contexts/GameEditionContext';
import { WALLET } from '../../../constants/wallet';
import { LightModeContext } from '../../../contexts/LightModeContext';
import { theme } from '../../../styles/theme';
import Label from '../../shared/Label';
import { GeCancelButtonIcon, GeConfirmButtonIcon } from '../../../assets';
import pixeledYellowBox from '../../../assets/images/game-edition/pixeled-box-yellow.svg';

const ActionContainer = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 0;
`;

const ConnectWalletChainweaverModal = ({ onClose }) => {
  const account = useContext(AccountContext);
  const wallet = useContext(WalletContext);
  const { gameEditionView } = useContext(GameEditionContext);
  const { themeMode } = useContext(LightModeContext);

  const [accountId, setAccountId] = useState('');
  useState(false);

  const is_hexadecimal = (str) => {
    const regexp = /^[0-9a-fA-F]+$/;
    if (regexp.test(str)) return true;
    else return false;
  };

  const checkKey = (key) => {
    try {
      let keyToCheck = key;
      if (key.startsWith('k:')) {
        keyToCheck = key.split(':')[1];
      }

      if (keyToCheck.length !== 64) {
        return false;
      }
      if (!is_hexadecimal(keyToCheck)) {
        return false;
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const resetValues = () => {
    setAccountId('');
  };

  const handleModalClose = () => {
    resetValues();
    onClose();
  };

  const handleConnect = async () => {
    await account.setVerifiedAccount(accountId);
    await wallet.signingWallet();
    await wallet.setSelectedWallet(WALLET.CHAINWEAVER);

    handleModalClose();
  };

  return (
    <>
      <Label fontSize={13} geFontSize={20} geColor="yellow" geLabelStyle={{ textAlign: 'center' }}>
        Please make sure the KDA account provided is controlled by your Chainweaver wallet.
      </Label>

      {!gameEditionView ? (
        <Input
          topLeftLabel={'Account'}
          placeholder="Insert your Account"
          value={accountId}
          error={accountId !== '' ? !checkKey(accountId) : false}
          onChange={(e, { value }) => {
            setAccountId(value);
          }}
        />
      ) : (
        <SUIInput
          className="game-edition-input"
          style={{
            backgroundImage: `url(${pixeledYellowBox})`,
            height: 60,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            fontSize: 34,
          }}
          placeholder="Insert your Account"
          value={accountId}
          error={accountId !== '' ? !checkKey(accountId) : false}
          onChange={(e, { value }) => {
            setAccountId(value);
          }}
        />
      )}
      <Label fontSize={13} geFontSize={16} geColor="blue" geLabelStyle={{ textAlign: 'center' }}>
        When submitting a transaction, Chainweaver will show you a preview within the wallet before signing.
      </Label>

      <ActionContainer gameEditionView={gameEditionView}>
        <CustomButton
          disableGameEditionPadding
          fluid={!gameEditionView}
          border="none"
          color={theme(themeMode).colors.white}
          background="transparent"
          onClick={() => {
            resetValues();
          }}
        >
          {gameEditionView ? <GeCancelButtonIcon /> : 'Cancel'}
        </CustomButton>

        <CustomButton disableGameEditionPadding fluid={!gameEditionView} disabled={!checkKey(accountId)} onClick={() => handleConnect()}>
          {gameEditionView ? <GeConfirmButtonIcon /> : 'Cancel'}
        </CustomButton>
      </ActionContainer>
    </>
  );
};

export default ConnectWalletChainweaverModal;
