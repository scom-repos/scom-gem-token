import { BigNumber, IClientSideProvider, INetwork } from "@ijstech/eth-wallet";
import { INetworkConfig } from "@scom/scom-network-picker";

export interface PageBlock {
  // Properties
  getData: () => any;
  setData: (data: any) => Promise<void>;
  getTag: () => any;
  setTag: (tag: any) => Promise<void>
  defaultEdit?: boolean;
  tag?: any;

  // Page Events
  readonly onEdit: () => Promise<void>;
  readonly onConfirm: () => Promise<void>;
  readonly onDiscard: () => Promise<void>;
  // onClear: () => void;

  // Page Block Events
  confirm: () => Promise<void>;
}

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
  chainSpecificProperties?: Record<number, IChainSpecificProperties>;
  defaultChainId: number;
  wallets: IWalletPlugin[];
  networks: INetworkConfig[];
  showHeader?: boolean;
}

export interface ITokenObject {
  address?: string;
  name: string;
  decimals: number;
  symbol: string;
  status?: boolean | null;
  logoURI?: string;
  isCommon?: boolean | null;
  balance?: string | number;
  isNative?: boolean | null;
  isWETH?: boolean | null;
  isNew?: boolean | null;
};

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

export interface IExtendedNetwork extends INetwork {
  shortName?: string;
  isDisabled?: boolean;
  isMainChain?: boolean;
  isCrossChainSupported?: boolean;
  explorerName?: string;
  explorerTxUrl?: string;
  explorerAddressUrl?: string;
  isTestnet?: boolean;
};
