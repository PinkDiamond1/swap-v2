import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { throttle, debounce } from 'throttle-debounce';
import { FadeIn } from '../components/shared/animations';
import TokenSelectorModal from '../components/swap/swap-modals/TokenSelectorModal';
import TxView from '../components/swap/swap-modals/TxView';
import WalletRequestView from '../components/swap/swap-modals/WalletRequestView';
import SwapButtonsForm from '../components/swap/SwapButtonsForm';
import SwapForm from '../components/swap/SwapForm';
import SwapResults from '../components/swap/SwapResults';
import tokenData from '../constants/cryptoCurrencies';
import { AccountContext } from '../contexts/AccountContext';
import { GameEditionContext } from '../contexts/GameEditionContext';
import { ModalContext } from '../contexts/ModalContext';
import { PactContext } from '../contexts/PactContext';
import { SwapContext } from '../contexts/SwapContext';
import { WalletContext } from '../contexts/WalletContext';
import theme from '../styles/theme';
import { getCorrectBalance, reduceBalance } from '../utils/reduceBalance';
import TokenSelectorModalContent from '../components/swap/swap-modals/TokenSelectorModalContent';

const Container = styled(FadeIn)`
  width: 100%;
  margin-top: ${({ gameEditionView }) => (gameEditionView ? `0px` : ` 24px`)};
  margin-left: auto;
  margin-right: auto;
`;
const TitleContainer = styled.div`
  display: flex;
  position: ${({ gameEditionView }) => gameEditionView && 'absolute'};
  top: ${({ gameEditionView }) => gameEditionView && '10px'};
  justify-content: ${({ gameEditionView }) =>
    gameEditionView ? `center` : ` space-between`};
  margin-bottom: ${({ gameEditionView }) =>
    gameEditionView ? `0px` : ` 24px`};
  width: 100%;
`;
const Title = styled.span`
  font: ${({ gameEditionView }) =>
    gameEditionView
      ? `normal normal normal 16px/19px  ${theme.fontFamily.pressStartRegular}`
      : ` normal normal bold 32px/57px ${theme.fontFamily.bold}`};
  letter-spacing: 0px;
  color: ${({ theme: { colors }, gameEditionView }) =>
    gameEditionView ? colors.black : '#ffffff'};
  text-transform: ${({ gameEditionView }) =>
    gameEditionView ? `uppercase` : ` capitalize`}; ;
`;

const GameEditionTokenSelectorContainer = styled.div`
  position: absolute;
  bottom: 75px;
  display: flex;
  flex-direction: column;
  width: 95%;
  height: 100%;
`;
const SwapContainer = () => {
  const pact = useContext(PactContext);
  const swap = useContext(SwapContext);
  const account = useContext(AccountContext);
  const wallet = useContext(WalletContext);
  const modalContext = useContext(ModalContext);
  const { gameEditionView, openModal, closeModal } =
    useContext(GameEditionContext);
  const [tokenSelectorType, setTokenSelectorType] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [fromValues, setFromValues] = useState({
    amount: '',
    balance: '',
    coin: '',
    address: '',
    precision: 0,
  });
  const [toValues, setToValues] = useState({
    amount: '',
    balance: '',
    coin: '',
    address: '',
    precision: 0,
  });
  const [inputSide, setInputSide] = useState('');
  const [fromNote, setFromNote] = useState('');
  const [toNote, setToNote] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingPair, setFetchingPair] = useState(false);
  const [noLiquidity, setNoLiquidity] = useState(false);
  const [priceImpact, setPriceImpact] = useState('');
  useEffect(() => {
    if (!isNaN(fromValues.amount)) {
      if (inputSide === 'from' && fromValues.amount !== '') {
        setToNote('(estimated)');
        setFromNote('');
        setInputSide(null);
        if (
          fromValues.coin !== '' &&
          toValues.coin !== '' &&
          !isNaN(pact.ratio)
        ) {
          if (fromValues.amount.length < 5) {
            throttle(
              500,
              setToValues({
                ...toValues,
                amount: reduceBalance(
                  // fromValues.amount / pact.ratio,
                  pact.computeOut(fromValues.amount),
                  toValues.precision
                ),
              })
            );
          } else {
            debounce(
              500,
              setToValues({
                ...toValues,
                amount: reduceBalance(
                  // fromValues.amount / pact.ratio,
                  pact.computeOut(fromValues.amount),
                  toValues.precision
                ).toFixed(toValues.precision),
              })
            );
          }
        }
      }
      if (isNaN(pact.ratio) || fromValues.amount === '') {
        setToValues((prev) => ({ ...prev, amount: '' }));
      }
    }
  }, [fromValues.amount]);
  useEffect(() => {
    if (!isNaN(toValues.amount)) {
      if (inputSide === 'to' && toValues.amount !== '') {
        setFromNote('(estimated)');
        setToNote('');
        setInputSide(null);
        if (
          fromValues.coin !== '' &&
          toValues.coin !== '' &&
          !isNaN(pact.ratio)
        ) {
          if (toValues.amount.length < 5) {
            throttle(
              500,
              setFromValues({
                ...fromValues,
                amount: reduceBalance(
                  // toValues.amount * pact.ratio,
                  pact.computeIn(toValues.amount),
                  fromValues.precision
                ),
              })
            );
            throttle(500, safeSetFrom(), fromValues.precision);
          } else {
            debounce(
              500,
              setFromValues({
                ...fromValues,
                amount: reduceBalance(
                  // toValues.amount * pact.ratio,
                  pact.computeIn(toValues.amount),
                  fromValues.precision
                ).toFixed(fromValues.precision),
              })
            );
            debounce(500, safeSetFrom(), fromValues.precision);
          }
        }
      }
      if (isNaN(pact.ratio) || toValues.amount === '') {
        setFromValues((prev) => ({ ...prev, amount: '' }));
      }
    }
  }, [toValues.amount]);
  useEffect(() => {
    if (!isNaN(pact.ratio)) {
      if (fromValues.amount !== '' && toValues.amount === '') {
        setToValues({
          ...toValues,
          amount: reduceBalance(
            pact.computeOut(fromValues.amount),
            toValues.precision
          ),
        });
      }
      if (fromValues.amount === '' && toValues.amount !== '') {
        setFromValues({
          ...fromValues,
          amount: reduceBalance(
            pact.computeIn(toValues.amount),
            fromValues.precision
          ),
        });
      }
      if (fromValues.amount !== '' && toValues.amount !== '') {
        setToValues({
          ...toValues,
          amount: reduceBalance(
            pact.computeOut(fromValues.amount),
            toValues.precision
          ),
        });
      }
    }
  }, [pact.ratio]);
  useEffect(() => {
    if (!isNaN(pact.ratio)) {
      setPriceImpact(
        pact.computePriceImpact(
          Number(fromValues.amount),
          Number(toValues.amount)
        )
      );
    } else {
      setPriceImpact('');
    }
  }, [
    fromValues.coin,
    toValues.coin,
    fromValues.amount,
    toValues.amount,
    pact.ratio,
  ]);
  useEffect(() => {
    const getBalance = async () => {
      if (account.account && toValues.coin !== '' && fromValues.coin !== '') {
        let acctOfFromValues = await account.getTokenAccount(
          tokenData[fromValues.coin]?.code,
          account.account.account,
          tokenSelectorType === 'from'
        );
        let acctOfToValues = await account.getTokenAccount(
          tokenData[toValues.coin]?.code,
          account.account.account,
          tokenSelectorType === 'to'
        );
        if (acctOfFromValues) {
          let balanceFrom = getCorrectBalance(acctOfFromValues.balance);
          setFromValues((prev) => ({
            ...prev,
            balance: balanceFrom,
          }));
        }
        if (acctOfToValues) {
          let balanceTo = getCorrectBalance(acctOfToValues.balance);
          setToValues((prev) => ({
            ...prev,
            balance: balanceTo,
          }));
        }
      }
    };
    getBalance();
  }, [toValues.amount, fromValues.amount]);
  useEffect(() => {
    if (tokenSelectorType === 'from') return setSelectedToken(fromValues.coin);
    if (tokenSelectorType === 'to') return setSelectedToken(toValues.coin);
    return setSelectedToken(null);
  }, [tokenSelectorType]);
  useEffect(() => {
    const getReserves = async () => {
      if (toValues.coin !== '' && fromValues.coin !== '') {
        setFetchingPair(true);
        await pact.getPair(fromValues.address, toValues.address);
        await pact.getReserves(fromValues.address, toValues.address);
        setFetchingPair(false);
      }
    };
    getReserves();
  }, [fromValues.coin, toValues.coin]);
  useEffect(() => {
    if (swap.walletSuccess) {
      setLoading(false);
      setFromValues({ amount: '', balance: '', coin: '', address: '' });
      setToValues({ amount: '', balance: '', coin: '', address: '' });
      pact.setWalletSuccess(false);
    }
  }, [swap.walletSuccess]);
  const swapValues = () => {
    const from = { ...fromValues };
    const to = { ...toValues };
    setFromValues({ ...to });
    setToValues({ ...from });
    if (toNote === '(estimated)') {
      setFromNote('(estimated)');
      setToNote('');
    }
    if (fromNote === '(estimated)') {
      setToNote('(estimated)');
      setFromNote('');
    }
  };
  // Check if their is enough liquidity before setting the from amount
  const safeSetFrom = () => {
    setNoLiquidity(false);
    if (0 >= pact.computeIn(toValues.amount)) {
      setNoLiquidity(true);
      setFromValues({
        ...fromValues,
        amount: 0,
      });
    } else {
      setFromValues({
        ...fromValues,
        amount: reduceBalance(
          pact.computeIn(toValues.amount),
          fromValues.precision
        ),
      });
    }
  };
  const onTokenClick = async ({ crypto }) => {
    let balance;
    if (crypto.code === 'coin') {
      if (account.account) {
        balance = account.account.balance;
      }
    } else {
      let acct = await account.getTokenAccount(
        crypto.code,
        account.account.account,
        tokenSelectorType === 'from'
      );
      if (acct) {
        balance = getCorrectBalance(acct.balance);
      }
    }
    if (tokenSelectorType === 'from')
      setFromValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto.name,
        address: crypto.code,
        precision: crypto.precision,
      }));
    if (tokenSelectorType === 'to')
      setToValues((prev) => ({
        ...prev,
        balance: balance,
        coin: crypto.name,
        address: crypto.code,
        precision: crypto.precision,
      }));
  };
  const onWalletRequestViewModalClose = () => {
    wallet.setIsWaitingForWalletAuth(false);
    wallet.setWalletError(null);
  };

  useEffect(() => {
    if (tokenSelectorType !== null) {
      onClickTokenSelectorType();
    }
  }, [tokenSelectorType]);

  const onClickTokenSelectorType = () => {
    if (gameEditionView) {
      openModal({
        title: 'Select a Token',
        closeModal: () => {
          setTokenSelectorType(null);
          closeModal();
        },
        content: (
          <GameEditionTokenSelectorContainer>
            <TokenSelectorModalContent
              selectedToken={selectedToken}
              onTokenClick={onTokenClick}
              onClose={() => {
                setTokenSelectorType(null);
                closeModal();
              }}
              fromToken={fromValues.coin}
              toToken={toValues.coin}
            />
          </GameEditionTokenSelectorContainer>
        ),
      });
    } else {
      modalContext.openModal({
        title: 'select a token',
        description: '',
        containerStyle: {
          //height: "100%",
          maxHeight: '40vh !important',
          maxWidth: '40vw !important',
          width: '90%',
        },
        onBack: () => {
          modalContext.onBackModal();
          setTokenSelectorType(null);
        },
        onClose: () => {
          setTokenSelectorType(null);
          modalContext.closeModal();
        },
        content: (
          <TokenSelectorModalContent
            selectedToken={selectedToken}
            onTokenClick={onTokenClick}
            onClose={() => {
              setTokenSelectorType(null);
              modalContext.closeModal();
            }}
            fromToken={fromValues.coin}
            toToken={toValues.coin}
          />
        ),
      });
    }
  };
  return (
    <Container gameEditionView={gameEditionView}>
      {/* <TokenSelectorModal
        show={tokenSelectorType !== null}
        selectedToken={selectedToken}
        onTokenClick={onTokenClick}
        fromToken={fromValues.coin}
        toToken={toValues.coin}
        onClose={() => setTokenSelectorType(null)}
      /> */}

      <TxView
        show={showTxModal}
        selectedToken={selectedToken}
        onTokenClick={onTokenClick}
        onClose={() => setShowTxModal(false)}
      />
      <WalletRequestView
        show={wallet.isWaitingForWalletAuth}
        error={wallet.walletError}
        onClose={() => onWalletRequestViewModalClose()}
      />
      <TitleContainer gameEditionView={gameEditionView}>
        <Title gameEditionView={gameEditionView}>Swap</Title>
      </TitleContainer>
      <SwapForm
        fromValues={fromValues}
        setFromValues={setFromValues}
        toValues={toValues}
        setToValues={setToValues}
        fromNote={fromNote}
        toNote={toNote}
        setTokenSelectorType={setTokenSelectorType}
        setInputSide={setInputSide}
        swapValues={swapValues}
        setShowTxModal={setShowTxModal}
        /* onClickTokenSelectorType={onClickTokenSelectorType} */
      />
      {!isNaN(pact.ratio) &&
      fromValues.amount &&
      fromValues.coin &&
      toValues.amount &&
      toValues.coin ? (
        <SwapResults
          priceImpact={priceImpact}
          fromValues={fromValues}
          toValues={toValues}
        />
      ) : (
        <></>
      )}
      <SwapButtonsForm
        setLoading={setLoading}
        fetchingPair={fetchingPair}
        fromValues={fromValues}
        setFromValues={setFromValues}
        toValues={toValues}
        setToValues={setToValues}
        fromNote={fromNote}
        ratio={pact.ratio}
        loading={loading}
        noLiquidity={noLiquidity}
        setShowTxModal={setShowTxModal}
      />
    </Container>
  );
};
export default SwapContainer;
