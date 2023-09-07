import { BigNumber, IClientSideProvider } from "@ijstech/eth-wallet";
import { INetworkConfig } from "@scom/scom-network-picker";
import { ITokenObject } from '@scom/scom-token-list';

export type DappType = 'buy' | 'redeem';
export interface IDeploy {
  name: string;
  symbol: string;
  cap: string;
  // backerCoin: string;
  price: string;
  mintingFee: string;
  redemptionFee: string;
}

export interface IChainSpecificProperties {
  contract: string;
}

export interface IEmbedData extends Partial<IDeploy> {
  dappType?: DappType;
  logo?: string;
  description?: string;
  hideDescription?: boolean;
  commissions?: ICommissionInfo[];
  contractAddress?: string;
  chainSpecificProperties?: Record<number, IChainSpecificProperties>;
  defaultChainId: number;
  wallets: IWalletPlugin[];
  networks: INetworkConfig[];
  showHeader?: boolean;
}

export interface ICommissionInfo {
  chainId: number;
  walletAddress: string;
  share: string;
}

export interface IGemInfo {
  price: BigNumber;
  mintingFee: BigNumber;
  redemptionFee: BigNumber;
  decimals: BigNumber;
  cap: BigNumber;
  baseToken: ITokenObject;
  name: string;
  symbol: string;
}

export interface IWalletPlugin {
  name: string;
  packageName?: string;
  provider?: IClientSideProvider;
}
