import React, { createContext, useState } from "react";
import Pact from "pact-lang-api";

export const WalletContext = createContext(null);

const savedWallet = localStorage.getItem("wallet");
const savedSigning = localStorage.getItem("signing");
const savedPrivKey = localStorage.getItem("pk");

export const WalletProvider = (props) => {
  const [wallet, setWallet] = useState(
    savedWallet ? JSON.parse(savedWallet) : null
  );
  const [signing, setSigning] = useState(
    savedSigning ? JSON.parse(savedSigning) : { method: "none", key: "" }
  );

  const [privKey, setPrivKey] = useState(savedPrivKey ? savedPrivKey : "");
  const keyPair = privKey
    ? Pact.crypto.restoreKeyPairFromSecretKey(privKey)
    : "";

  const storePrivKey = async (pk) => {
    setSigning({ method: "pk", key: pk });
    await setPrivKey(pk);
    await localStorage.setItem("pk", pk);
  };

  const setSigningMethod = async (meth) => {
    await setSigning({ ...signing, method: meth });
  };

  const signingWallet = () => {
    setSigning({ method: "sign", key: "" });
  };

  const disconnectWallet = () => {
    localStorage.removeItem("wallet", null);
    localStorage.removeItem("signing", null);
    window.location.reload();
  };

  const contextValues = {
    wallet,
    disconnectWallet,
    storePrivKey,
    setSigningMethod,
    signingWallet,
  };
  return (
    <WalletContext.Provider value={contextValues}>
      {props.children}
    </WalletContext.Provider>
  );
};
