import { application } from "@ijstech/components";
import { IWallet, Wallet, WalletPlugin } from "@ijstech/eth-wallet";
import { EventId } from "@modules/store";
import { walletList } from "./walletList";

const defaultChainId = 1;

export function isWalletConnected() {
  const wallet = Wallet.getClientInstance();
  return wallet.isConnected;
}

export async function connectWallet(walletPlugin: WalletPlugin, eventHandlers?: { [key: string]: Function }):Promise<IWallet> {
  let wallet = Wallet.getClientInstance();
  const walletOptions = '';
  let providerOptions = walletOptions[walletPlugin];
  if (!wallet.chainId) {
    wallet.chainId = defaultChainId;
  }
  await wallet.connect(walletPlugin, {
    onAccountChanged: (account: string) => {
      if (eventHandlers && eventHandlers.accountsChanged) {
        eventHandlers.accountsChanged(account);
      }
      const connected = !!account;
      if (connected) {
        localStorage.setItem('walletProvider', Wallet.getClientInstance()?.clientSideProvider?.walletPlugin || '');
      }
      application.EventBus.dispatch(EventId.IsWalletConnected, connected);
    },
    onChainChanged: (chainIdHex: string) => {
      const chainId = Number(chainIdHex);

      if (eventHandlers && eventHandlers.chainChanged) {
        eventHandlers.chainChanged(chainId);
      }
      application.EventBus.dispatch(EventId.chainChanged, chainId);
    }
  }, providerOptions)
  return wallet;
}

export const hasWallet = () => {
  let hasWallet = false;
  for (let wallet of walletList) {
    if (Wallet.isInstalled(wallet.name)) {
      hasWallet = true;
      break;
    } 
  }
  return hasWallet;
}

export const getChainId = () => {
  const wallet = Wallet.getInstance();
  return isWalletConnected() ? wallet.chainId : defaultChainId;
}