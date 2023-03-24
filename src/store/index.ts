import { application } from "@ijstech/components";
import { Wallet, WalletPlugin } from "@ijstech/eth-wallet";
import { isWalletConnected } from "../wallet/index";
import { DefaultTokens } from "./tokens/index";

export const getTokenList = (chainId: number) => {
  const tokenList = [...DefaultTokens[chainId]];
  return tokenList;
}

export const enum EventId {
  ConnectWallet = 'connectWallet',
  IsWalletConnected = 'isWalletConnected',
  IsWalletDisconnected = 'IsWalletDisconnected',
  chainChanged = 'chainChanged'
}

export interface INetwork {
  chainId: number;
  name: string;
  img?: string;
  rpc?: string;
	symbol?: string;
	env?: string;
  explorerName?: string;
  explorerTxUrl?: string;
  explorerAddressUrl?: string;
  isDisabled?: boolean;
};

export const SupportedNetworks: INetwork[] = [
  {
    name: "BSC Testnet",
    chainId: 97,
    img: "bsc"
  },
  {
    name: "Avalanche FUJI C-Chain",
    chainId: 43113,
    img: "avax"
  }
];

export const getNetworkName = (chainId: number) => {
  return SupportedNetworks.find(v => v.chainId === chainId)?.name || ""
}


export interface IContractDetailInfo {
  address: string;
}

export type ContractType = 'Proxy';

export interface IContractInfo {
  Proxy: IContractDetailInfo;
}

export type ContractInfoByChainType = { [key: number]: IContractInfo };

export const state = {
  contractInfoByChain: {} as ContractInfoByChainType,
  embedderCommissionFee: "0"
}

export const setDataFromSCConfig = (options: any) => {
  if (options.contractInfo) {
    setContractInfo(options.contractInfo);
  }
  if (options.embedderCommissionFee) {
    setEmbedderCommissionFee(options.embedderCommissionFee);
  }  
}

const setContractInfo = (data: ContractInfoByChainType) => {
  state.contractInfoByChain = data;
}

const getContractInfo = (chainId: number) => {
  return state.contractInfoByChain[chainId];
}

const setEmbedderCommissionFee = (fee: string) => {
  state.embedderCommissionFee = fee;
}

export const getEmbedderCommissionFee = () => {
  return state.embedderCommissionFee;
}

export const getContractAddress = (type: ContractType) => {
  const chainId = Wallet.getInstance().chainId;
  const contracts = getContractInfo(chainId) || {};
  return contracts[type]?.address;
}

export async function switchNetwork(chainId: number) {
  if (!isWalletConnected()) {
    application.EventBus.dispatch(EventId.chainChanged, chainId);
    return;
  }
  const wallet = Wallet.getClientInstance();
  if (wallet?.clientSideProvider?.walletPlugin === WalletPlugin.MetaMask) {
    await wallet.switchNetwork(chainId);
  }
}

export * from './tokens/index';