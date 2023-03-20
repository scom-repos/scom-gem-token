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

export type ContractType = 'Proxy';

export interface IContractInfo {
  Proxy: IContractDetailInfo;
}

export type ContractInfoByChainType = { [key: number]: IContractInfo };

export const state = {
  contractInfoByChain: {} as ContractInfoByChainType,
  commissionFee: "0"
}

export const setDataFromSCConfig = (options: any) => {
  if (options.contractInfo) {
    setContractInfo(options.contractInfo);
  }
  if (options.commissionFee) {
    setCommissionFee(options.commissionFee);
  }  
}

const setContractInfo = (data: ContractInfoByChainType) => {
  state.contractInfoByChain = data;
}

const getContractInfo = (chainId: number) => {
  return state.contractInfoByChain[chainId];
}

const setCommissionFee = (fee: string) => {
  state.commissionFee = fee;
}

export const getCommissionFee = () => {
  return state.commissionFee;
}

export const getContractAddress = (type: ContractType) => {
  const chainId = Wallet.getInstance().chainId;
  const contracts = getContractInfo(chainId) || {};
  return contracts[type]?.address;
}

export * from './tokens/index';