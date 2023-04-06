import { Wallet } from "@ijstech/eth-wallet";

const defaultChainId = 1;

export function isWalletConnected() {
  const wallet = Wallet.getClientInstance();
  return wallet.isConnected;
}

export const getChainId = () => {
  const wallet = Wallet.getInstance();
  return isWalletConnected() ? wallet.chainId : defaultChainId;
}