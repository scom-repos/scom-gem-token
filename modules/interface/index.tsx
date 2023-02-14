export interface PageBlock {
  // Properties
  getData: () => any;
  setData: (data: any) => Promise<void>;
  getTag: () => any;
  setTag: (tag: any) => Promise<void>
  validate?: () => boolean;
  defaultEdit?: boolean;
  tag?: any;

  // Page Events
  readonly onEdit: () => Promise<void>;
  readonly onConfirm: () => Promise<void>;
  readonly onDiscard: () => Promise<void>;
  // onClear: () => void;

  // Page Block Events
  edit: () => Promise<void>;
  preview: () => Promise<void>;
  confirm: () => Promise<void>;
  discard: () => Promise<void>;
  config: () => Promise<void>;
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
export interface IConfig extends Partial<IDeploy> {
  dappType?: DappType;
  logo?: string;
  description?: string;
  chainId?: number;
  token?: ITokenObject;
  contract?: string;
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