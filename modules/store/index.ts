import { Wallet } from "@ijstech/eth-wallet";
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

const Networks: { [chainId: number]: string } = {
  1: 'Ethereuem',
  25: 'Cronos Mainnet',
  42: 'Kovan Test Network',
  56: 'Binance Smart Chain',
  97: 'BSC Testnet',
  137: 'Polygon',
  338: 'Cronos Testnet',
  31337: 'Amino Testnet',
  80001: 'Mumbai',
  43113: 'Avalanche FUJI C-Chain',
  43114: 'Avalanche Mainnet C-Chain',
  250: 'Fantom Opera',
  4002: 'Fantom Testnet',
  13370: 'AminoX Testnet'
}

export const getNetworkName = (chainId: number) => {
  return Networks[chainId] || ""
}

export interface IContractDetailInfo {
  address: string;
}

export type ContractType = 'ProductInfo' | 'Proxy';

export interface IContractInfo {
  TriplayERC20Vault: IContractDetailInfo;
  TriplayERC721Vault: IContractDetailInfo;
  TriplayERC1155Vault: IContractDetailInfo;
  TriplayPolicy: IContractDetailInfo;
}

export type ContractInfoByChainType = { [key: number]: IContractInfo };

export const state = {
  contractInfoByChain: {} as ContractInfoByChainType
}

export const setDataFromSCConfig = (options: any) => {
  if (options.contractInfo) {
    setContractInfo(options.contractInfo);
  }
}

const setContractInfo = (data: ContractInfoByChainType) => {
  state.contractInfoByChain = data;
}

const getContractInfo = (chainId: number) => {
  return state.contractInfoByChain[chainId];
}

export * from './tokens/index';