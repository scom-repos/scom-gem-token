import { ITokenObject } from "@modules/interface";
import { Tokens_Avalanche, Tokens_BSC, Tokens_Cronos, Tokens_Ethereuem, Tokens_Fantom, Tokens_Polygon } from "./mainnet/index";
import { Tokens_Amino, Tokens_AminoXTestnet, Tokens_BSC_Testnet, Tokens_Cronos_Testnet, Tokens_Fantom_Testnet, Tokens_Fuji, Tokens_Kovan, Tokens_Mumbai } from "./testnet/index";

const DefaultERC20Tokens: { [chainId: number]: ITokenObject[] } = {
  1: Tokens_Ethereuem,
  25: Tokens_Cronos,
  42: Tokens_Kovan,
  56: Tokens_BSC,
  97: Tokens_BSC_Testnet,
  137: Tokens_Polygon,
  338: Tokens_Cronos_Testnet,
  31337: Tokens_Amino,
  80001: Tokens_Mumbai,
  43113: Tokens_Fuji,
  43114: Tokens_Avalanche,
  250: Tokens_Fantom,
  4002: Tokens_Fantom_Testnet,
  13370: Tokens_AminoXTestnet
}

const ChainNativeTokenByChainId: { [chainId: number]: ITokenObject } = {
  1: { address: undefined, decimals: 18, symbol: "ETH", name: 'ETH', isNative: true },
  25: { address: undefined, decimals: 18, symbol: "CRO", name: 'CRO', isNative: true }, //cronos
  42: { address: undefined, decimals: 18, symbol: "ETH", name: 'ETH', isNative: true }, // Kovan,
  56: { address: undefined, decimals: 18, symbol: "BNB", name: 'BNB', isNative: true }, // Binance Mainnet
  97: { address: undefined, decimals: 18, symbol: "BNB", name: 'BNB', isNative: true }, // Binance Test Chain
  137: { address: undefined, decimals: 18, symbol: "MATIC", name: 'MATIC', isNative: true }, //Polygon
  338: { address: undefined, decimals: 18, symbol: "TCRO", name: 'TCRO', isNative: true }, //cronos
  31337: { address: undefined, decimals: 18, symbol: "ACT", name: 'ACT', isNative: true }, //Amino Testnet
  80001: { address: undefined, decimals: 18, symbol: "MATIC", name: 'MATIC', isNative: true }, //Mumbai, Polygon testnet
  43114: { address: undefined, decimals: 18, symbol: "AVAX", name: 'AVAX', isNative: true }, //Avalanche Mainnet C-Chain
  43113: { address: undefined, decimals: 18, symbol: "AVAX", name: 'AVAX', isNative: true },  //Avalanche FUJI C-Chain
  250: { address: undefined, decimals: 18, symbol: "FTM", name: 'FTM', isNative: true }, // Fantom Opera
  4002: { address: undefined, decimals: 18, symbol: "FTM", name: 'FTM', isNative: true }, // Fantom Testnet
  13370: { address: undefined, decimals: 18, symbol: "ACT", name: 'ACT', isNative: true }, //Amino X Testnet
}

const DefaultTokens = Object.keys(ChainNativeTokenByChainId).reduce((result: {[chainId: number]: ITokenObject[]}, key: string) => {
  result[Number(key)] = [...DefaultERC20Tokens[Number(key)], ChainNativeTokenByChainId[Number(key)]]
  return result
}, {});

export {
  DefaultERC20Tokens,
  ChainNativeTokenByChainId,
  DefaultTokens
}