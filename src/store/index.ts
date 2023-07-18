import { application } from "@ijstech/components";
import { INetwork, Wallet } from "@ijstech/eth-wallet";
import getNetworkList from "@scom/scom-network-list";
import { IExtendedNetwork } from "../interface";

export const enum EventId {
  ConnectWallet = 'connectWallet',
  IsWalletConnected = 'isWalletConnected',
  IsWalletDisconnected = 'IsWalletDisconnected',
  chainChanged = 'chainChanged'
}

export enum WalletPlugin {
  MetaMask = 'metamask',
  WalletConnect = 'walletconnect',
}

const setNetworkList = (networkList: IExtendedNetwork[], infuraId?: string) => {
  const wallet = Wallet.getClientInstance();
  state.networkMap = {};
  const defaultNetworkList = getNetworkList();
  const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
    acc[cur.chainId] = cur;
    return acc;
  }, {});
  for (let network of networkList) {
    const networkInfo = defaultNetworkMap[network.chainId];
    if (!networkInfo) continue;
    if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
      for (let i = 0; i < network.rpcUrls.length; i++) {
        network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
      }
    }
    state.networkMap[network.chainId] = {
      ...networkInfo,
      ...network
    };
    wallet.setNetworkInfo(state.networkMap[network.chainId]);
  }
}

export const getNetworkInfo = (chainId: number) => {
  return state.networkMap[chainId];
}

export const getSupportedNetworks = () => {
  return Object.values(state.networkMap);
}

export type ProxyAddresses = { [key: number]: string };

export const state = {
  defaultChainId: 1,
  networkMap: {} as { [key: number]: IExtendedNetwork },
  proxyAddresses: {} as ProxyAddresses,
  embedderCommissionFee: '0',
  ipfsGatewayUrl: '',
  rpcWalletId: ''
}

export const setDataFromSCConfig = (options: any) => {
  if (options.networks) {
    setNetworkList(options.networks, options.infuraId)
  }
  if (options.proxyAddresses) {
    setProxyAddresses(options.proxyAddresses)
  }
  if (options.embedderCommissionFee) {
    setEmbedderCommissionFee(options.embedderCommissionFee);
  }
}

export const setIPFSGatewayUrl = (url: string) => {
  state.ipfsGatewayUrl = url;
}

export const getIPFSGatewayUrl = () => {
  return state.ipfsGatewayUrl;
}

export const setProxyAddresses = (data: ProxyAddresses) => {
  state.proxyAddresses = data;
}

export const getProxyAddress = (chainId?: number) => {
  const _chainId = chainId || Wallet.getInstance().chainId;
  const proxyAddresses = state.proxyAddresses;
  if (proxyAddresses) {
    return proxyAddresses[_chainId];
  }
  return null;
}

const setEmbedderCommissionFee = (fee: string) => {
  state.embedderCommissionFee = fee;
}

export const getEmbedderCommissionFee = () => {
  return state.embedderCommissionFee;
}

export const setDefaultChainId = (chainId: number) => {
  state.defaultChainId = chainId;
}

export const getDefaultChainId = () => {
  return state.defaultChainId;
}

export function isClientWalletConnected() {
  const wallet = Wallet.getClientInstance();
  return wallet.isConnected;
}

export function isRpcWalletConnected() {
  const wallet = getRpcWallet();
  return wallet?.isConnected;
}

export function getChainId() {
  const rpcWallet = getRpcWallet();
  return rpcWallet?.chainId;
}

export function initRpcWallet(defaultChainId: number) {
  if (state.rpcWalletId) {
    return state.rpcWalletId;
  }
  const clientWallet = Wallet.getClientInstance();
  const networkList: INetwork[] = Object.values(application.store.networkMap);
  const instanceId = clientWallet.initRpcWallet({
    networks: networkList,
    defaultChainId,
    infuraId: application.store.infuraId,
    multicalls: application.store.multicalls
  });
  state.rpcWalletId = instanceId;
  if (clientWallet.address) {
    const rpcWallet = Wallet.getRpcWalletInstance(instanceId);
    rpcWallet.address = clientWallet.address;
  }
  return instanceId;
}

export function getRpcWallet() {
  return Wallet.getRpcWalletInstance(state.rpcWalletId);
}

export function getClientWallet() {
  return Wallet.getClientInstance();
}