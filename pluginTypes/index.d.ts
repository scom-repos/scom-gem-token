/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-token-input/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-token-input/@scom/scom-token-modal/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-contract/index.d.ts" />
/// <amd-module name="@scom/scom-gem-token/interface.tsx" />
declare module "@scom/scom-gem-token/interface.tsx" {
    import { BigNumber, IClientSideProvider } from "@ijstech/eth-wallet";
    import { INetworkConfig } from "@scom/scom-network-picker";
    import { ITokenObject } from '@scom/scom-token-list';
    export type DappType = 'buy' | 'redeem';
    export interface IDeploy {
        name: string;
        symbol: string;
        cap: string;
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
}
/// <amd-module name="@scom/scom-gem-token/utils/token.ts" />
declare module "@scom/scom-gem-token/utils/token.ts" {
    import { BigNumber, IWallet, ISendTxEventsOptions } from "@ijstech/eth-wallet";
    import { ITokenObject } from '@scom/scom-token-list';
    export const getERC20Amount: (wallet: IWallet, tokenAddress: string, decimals: number) => Promise<BigNumber>;
    export const getTokenBalance: (wallet: IWallet, token: ITokenObject) => Promise<BigNumber>;
    export const registerSendTxEvents: (sendTxEventHandlers: ISendTxEventsOptions) => void;
}
/// <amd-module name="@scom/scom-gem-token/utils/index.ts" />
declare module "@scom/scom-gem-token/utils/index.ts" {
    export const formatNumber: (value: any, decimals?: number) => string;
    export const formatNumberWithSeparators: (value: number, precision?: number) => string;
    export { getERC20Amount, getTokenBalance, registerSendTxEvents } from "@scom/scom-gem-token/utils/token.ts";
}
/// <amd-module name="@scom/scom-gem-token/store/index.ts" />
declare module "@scom/scom-gem-token/store/index.ts" {
    import { ERC20ApprovalModel, INetwork, IERC20ApprovalEventOptions } from "@ijstech/eth-wallet";
    export type ProxyAddresses = {
        [key: number]: string;
    };
    export class State {
        networkMap: {
            [key: number]: INetwork;
        };
        proxyAddresses: ProxyAddresses;
        ipfsGatewayUrl: string;
        embedderCommissionFee: string;
        rpcWalletId: string;
        approvalModel: ERC20ApprovalModel;
        constructor(options: any);
        private initData;
        initRpcWallet(defaultChainId: number): string;
        private setNetworkList;
        getProxyAddress(chainId?: number): string;
        getRpcWallet(): import("@ijstech/eth-wallet").IRpcWallet;
        isRpcWalletConnected(): boolean;
        getChainId(): number;
        setApprovalModelAction(options: IERC20ApprovalEventOptions): Promise<import("@ijstech/eth-wallet").IERC20ApprovalAction>;
    }
    export function isClientWalletConnected(): boolean;
}
/// <amd-module name="@scom/scom-gem-token/assets.ts" />
declare module "@scom/scom-gem-token/assets.ts" {
    function fullPath(path: string): string;
    const _default: {
        fullPath: typeof fullPath;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-gem-token/index.css.ts" />
declare module "@scom/scom-gem-token/index.css.ts" {
    export const imageStyle: string;
    export const markdownStyle: string;
    export const inputStyle: string;
    export const tokenSelectionStyle: string;
    export const centerStyle: string;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts" />
declare module "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts" {
    const _default_1: {
        abi: ({
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            name?: undefined;
            outputs?: undefined;
        } | {
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            stateMutability?: undefined;
            outputs?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        })[];
        bytecode: string;
    };
    export default _default_1;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts" />
declare module "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts" {
    import { IWallet, Contract as _Contract, TransactionReceipt, BigNumber, Event, TransactionOptions } from "@ijstech/eth-contract";
    export interface IDeployParams {
        name: string;
        symbol: string;
    }
    export interface IAllowanceParams {
        owner: string;
        spender: string;
    }
    export interface IApproveParams {
        spender: string;
        amount: number | BigNumber;
    }
    export interface IDecreaseAllowanceParams {
        spender: string;
        subtractedValue: number | BigNumber;
    }
    export interface IIncreaseAllowanceParams {
        spender: string;
        addedValue: number | BigNumber;
    }
    export interface ITransferParams {
        to: string;
        amount: number | BigNumber;
    }
    export interface ITransferFromParams {
        from: string;
        to: string;
        amount: number | BigNumber;
    }
    export class ERC20 extends _Contract {
        static _abi: any;
        constructor(wallet: IWallet, address?: string);
        deploy(params: IDeployParams, options?: TransactionOptions): Promise<string>;
        parseApprovalEvent(receipt: TransactionReceipt): ERC20.ApprovalEvent[];
        decodeApprovalEvent(event: Event): ERC20.ApprovalEvent;
        parseTransferEvent(receipt: TransactionReceipt): ERC20.TransferEvent[];
        decodeTransferEvent(event: Event): ERC20.TransferEvent;
        allowance: {
            (params: IAllowanceParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        approve: {
            (params: IApproveParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IApproveParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: IApproveParams, options?: TransactionOptions) => Promise<string>;
        };
        balanceOf: {
            (account: string, options?: TransactionOptions): Promise<BigNumber>;
        };
        decimals: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        decreaseAllowance: {
            (params: IDecreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IDecreaseAllowanceParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: IDecreaseAllowanceParams, options?: TransactionOptions) => Promise<string>;
        };
        increaseAllowance: {
            (params: IIncreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IIncreaseAllowanceParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: IIncreaseAllowanceParams, options?: TransactionOptions) => Promise<string>;
        };
        name: {
            (options?: TransactionOptions): Promise<string>;
        };
        symbol: {
            (options?: TransactionOptions): Promise<string>;
        };
        totalSupply: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        transfer: {
            (params: ITransferParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: ITransferParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: ITransferParams, options?: TransactionOptions) => Promise<string>;
        };
        transferFrom: {
            (params: ITransferFromParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: ITransferFromParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: ITransferFromParams, options?: TransactionOptions) => Promise<string>;
        };
        private assign;
    }
    export module ERC20 {
        interface ApprovalEvent {
            owner: string;
            spender: string;
            value: BigNumber;
            _event: Event;
        }
        interface TransferEvent {
            from: string;
            to: string;
            value: BigNumber;
            _event: Event;
        }
    }
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.json.ts" />
declare module "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.json.ts" {
    const _default_2: {
        abi: ({
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            name?: undefined;
            outputs?: undefined;
        } | {
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            stateMutability?: undefined;
            outputs?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        })[];
        bytecode: string;
    };
    export default _default_2;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.ts" />
declare module "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.ts" {
    import { IWallet, Contract as _Contract, TransactionReceipt, BigNumber, Event, TransactionOptions } from "@ijstech/eth-contract";
    export interface IDeployParams {
        name: string;
        symbol: string;
        cap: number | BigNumber;
        baseToken: string;
        price: number | BigNumber;
        mintingFee: number | BigNumber;
        redemptionFee: number | BigNumber;
    }
    export interface IAllowanceParams {
        owner: string;
        spender: string;
    }
    export interface IApproveParams {
        spender: string;
        amount: number | BigNumber;
    }
    export interface IDecreaseAllowanceParams {
        spender: string;
        subtractedValue: number | BigNumber;
    }
    export interface IIncreaseAllowanceParams {
        spender: string;
        addedValue: number | BigNumber;
    }
    export interface ITransferParams {
        to: string;
        amount: number | BigNumber;
    }
    export interface ITransferFromParams {
        from: string;
        to: string;
        amount: number | BigNumber;
    }
    export class GEM extends _Contract {
        static _abi: any;
        constructor(wallet: IWallet, address?: string);
        deploy(params: IDeployParams, options?: TransactionOptions): Promise<string>;
        parseApprovalEvent(receipt: TransactionReceipt): GEM.ApprovalEvent[];
        decodeApprovalEvent(event: Event): GEM.ApprovalEvent;
        parseAuthorizeEvent(receipt: TransactionReceipt): GEM.AuthorizeEvent[];
        decodeAuthorizeEvent(event: Event): GEM.AuthorizeEvent;
        parseBuyEvent(receipt: TransactionReceipt): GEM.BuyEvent[];
        decodeBuyEvent(event: Event): GEM.BuyEvent;
        parseDeauthorizeEvent(receipt: TransactionReceipt): GEM.DeauthorizeEvent[];
        decodeDeauthorizeEvent(event: Event): GEM.DeauthorizeEvent;
        parsePausedEvent(receipt: TransactionReceipt): GEM.PausedEvent[];
        decodePausedEvent(event: Event): GEM.PausedEvent;
        parseRedeemEvent(receipt: TransactionReceipt): GEM.RedeemEvent[];
        decodeRedeemEvent(event: Event): GEM.RedeemEvent;
        parseStartOwnershipTransferEvent(receipt: TransactionReceipt): GEM.StartOwnershipTransferEvent[];
        decodeStartOwnershipTransferEvent(event: Event): GEM.StartOwnershipTransferEvent;
        parseTransferEvent(receipt: TransactionReceipt): GEM.TransferEvent[];
        decodeTransferEvent(event: Event): GEM.TransferEvent;
        parseTransferOwnershipEvent(receipt: TransactionReceipt): GEM.TransferOwnershipEvent[];
        decodeTransferOwnershipEvent(event: Event): GEM.TransferOwnershipEvent;
        parseTreasuryRedeemEvent(receipt: TransactionReceipt): GEM.TreasuryRedeemEvent[];
        decodeTreasuryRedeemEvent(event: Event): GEM.TreasuryRedeemEvent;
        parseUnpausedEvent(receipt: TransactionReceipt): GEM.UnpausedEvent[];
        decodeUnpausedEvent(event: Event): GEM.UnpausedEvent;
        parseUpdateCapEvent(receipt: TransactionReceipt): GEM.UpdateCapEvent[];
        decodeUpdateCapEvent(event: Event): GEM.UpdateCapEvent;
        parseUpdateMintingFeeEvent(receipt: TransactionReceipt): GEM.UpdateMintingFeeEvent[];
        decodeUpdateMintingFeeEvent(event: Event): GEM.UpdateMintingFeeEvent;
        parseUpdateRedemptionFeeEvent(receipt: TransactionReceipt): GEM.UpdateRedemptionFeeEvent[];
        decodeUpdateRedemptionFeeEvent(event: Event): GEM.UpdateRedemptionFeeEvent;
        parseUpdateTreasuryEvent(receipt: TransactionReceipt): GEM.UpdateTreasuryEvent[];
        decodeUpdateTreasuryEvent(event: Event): GEM.UpdateTreasuryEvent;
        allowance: {
            (params: IAllowanceParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        approve: {
            (params: IApproveParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IApproveParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: IApproveParams, options?: TransactionOptions) => Promise<string>;
        };
        balanceOf: {
            (account: string, options?: TransactionOptions): Promise<BigNumber>;
        };
        baseToken: {
            (options?: TransactionOptions): Promise<string>;
        };
        buy: {
            (amount: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (amount: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (amount: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        cap: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        decimals: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        decimalsDelta: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        decreaseAllowance: {
            (params: IDecreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IDecreaseAllowanceParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: IDecreaseAllowanceParams, options?: TransactionOptions) => Promise<string>;
        };
        deny: {
            (user: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (user: string, options?: TransactionOptions) => Promise<void>;
            txData: (user: string, options?: TransactionOptions) => Promise<string>;
        };
        depositBalance: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        feeBalance: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        increaseAllowance: {
            (params: IIncreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IIncreaseAllowanceParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: IIncreaseAllowanceParams, options?: TransactionOptions) => Promise<string>;
        };
        isPermitted: {
            (param1: string, options?: TransactionOptions): Promise<boolean>;
        };
        mintingFee: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        name: {
            (options?: TransactionOptions): Promise<string>;
        };
        newCap: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        newCapEffectiveTime: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        newMintingFee: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        newMintingFeeEffectiveTime: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        newOwner: {
            (options?: TransactionOptions): Promise<string>;
        };
        newRedemptionFee: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        newRedemptionFeeEffectiveTime: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        newTreasury: {
            (options?: TransactionOptions): Promise<string>;
        };
        newTreasuryEffectiveTime: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        owner: {
            (options?: TransactionOptions): Promise<string>;
        };
        pause: {
            (options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (options?: TransactionOptions) => Promise<void>;
            txData: (options?: TransactionOptions) => Promise<string>;
        };
        paused: {
            (options?: TransactionOptions): Promise<boolean>;
        };
        permit: {
            (user: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (user: string, options?: TransactionOptions) => Promise<void>;
            txData: (user: string, options?: TransactionOptions) => Promise<string>;
        };
        price: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        redeem: {
            (amount: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (amount: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (amount: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        redeemFee: {
            (amount: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (amount: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (amount: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        redemptionFee: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        symbol: {
            (options?: TransactionOptions): Promise<string>;
        };
        sync: {
            (options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (options?: TransactionOptions) => Promise<void>;
            txData: (options?: TransactionOptions) => Promise<string>;
        };
        takeOwnership: {
            (options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (options?: TransactionOptions) => Promise<void>;
            txData: (options?: TransactionOptions) => Promise<string>;
        };
        totalSupply: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        transfer: {
            (params: ITransferParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: ITransferParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: ITransferParams, options?: TransactionOptions) => Promise<string>;
        };
        transferFrom: {
            (params: ITransferFromParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: ITransferFromParams, options?: TransactionOptions) => Promise<boolean>;
            txData: (params: ITransferFromParams, options?: TransactionOptions) => Promise<string>;
        };
        transferOwnership: {
            (newOwner: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (newOwner: string, options?: TransactionOptions) => Promise<void>;
            txData: (newOwner: string, options?: TransactionOptions) => Promise<string>;
        };
        treasury: {
            (options?: TransactionOptions): Promise<string>;
        };
        unpause: {
            (options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (options?: TransactionOptions) => Promise<void>;
            txData: (options?: TransactionOptions) => Promise<string>;
        };
        updateCap: {
            (cap: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (cap: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (cap: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        updateMintingFee: {
            (mintingFee: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (mintingFee: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (mintingFee: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        updateRedemptionFee: {
            (redemptionFee: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (redemptionFee: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (redemptionFee: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        updateTreasury: {
            (treasury: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (treasury: string, options?: TransactionOptions) => Promise<void>;
            txData: (treasury: string, options?: TransactionOptions) => Promise<string>;
        };
        private assign;
    }
    export module GEM {
        interface ApprovalEvent {
            owner: string;
            spender: string;
            value: BigNumber;
            _event: Event;
        }
        interface AuthorizeEvent {
            user: string;
            _event: Event;
        }
        interface BuyEvent {
            buyer: string;
            baseTokenAmount: BigNumber;
            gemAmount: BigNumber;
            fee: BigNumber;
            _event: Event;
        }
        interface DeauthorizeEvent {
            user: string;
            _event: Event;
        }
        interface PausedEvent {
            account: string;
            _event: Event;
        }
        interface RedeemEvent {
            redeemer: string;
            gemAmount: BigNumber;
            baseTokenAmount: BigNumber;
            fee: BigNumber;
            _event: Event;
        }
        interface StartOwnershipTransferEvent {
            user: string;
            _event: Event;
        }
        interface TransferEvent {
            from: string;
            to: string;
            value: BigNumber;
            _event: Event;
        }
        interface TransferOwnershipEvent {
            user: string;
            _event: Event;
        }
        interface TreasuryRedeemEvent {
            baseTokenAmount: BigNumber;
            newFeeBalance: BigNumber;
            _event: Event;
        }
        interface UnpausedEvent {
            account: string;
            _event: Event;
        }
        interface UpdateCapEvent {
            cap: BigNumber;
            _event: Event;
        }
        interface UpdateMintingFeeEvent {
            mintingFee: BigNumber;
            _event: Event;
        }
        interface UpdateRedemptionFeeEvent {
            redemptionFee: BigNumber;
            _event: Event;
        }
        interface UpdateTreasuryEvent {
            treasury: string;
            _event: Event;
        }
    }
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/index.ts" />
declare module "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/index.ts" {
    export { ERC20 } from "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts";
    export { GEM } from "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.ts";
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-gem-token-contract/index.ts" />
declare module "@scom/scom-gem-token/contracts/scom-gem-token-contract/index.ts" {
    import * as Contracts from "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/index.ts";
    export { Contracts };
    import { IWallet, BigNumber } from '@ijstech/eth-wallet';
    export interface IDeployOptions {
        name: string;
        symbol: string;
        cap: number | BigNumber;
        baseToken: string;
        price: number | BigNumber;
        mintingFee: number | BigNumber;
        redemptionFee: number | BigNumber;
    }
    export interface IDeployResult {
        gem: string;
    }
    export var DefaultDeployOptions: IDeployOptions;
    export function deploy(wallet: IWallet, options: IDeployOptions, onProgress?: (msg: string) => void): Promise<IDeployResult>;
    const _default_3: {
        Contracts: typeof Contracts;
        deploy: typeof deploy;
        DefaultDeployOptions: IDeployOptions;
    };
    export default _default_3;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Authorization.json.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Authorization.json.ts" {
    const _default_4: {
        abi: ({
            inputs: any[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            name?: undefined;
            outputs?: undefined;
        } | {
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            stateMutability?: undefined;
            outputs?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        })[];
        bytecode: string;
    };
    export default _default_4;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Authorization.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Authorization.ts" {
    import { IWallet, Contract as _Contract, TransactionReceipt, Event, TransactionOptions } from "@ijstech/eth-contract";
    export class Authorization extends _Contract {
        static _abi: any;
        constructor(wallet: IWallet, address?: string);
        deploy(options?: TransactionOptions): Promise<string>;
        parseAuthorizeEvent(receipt: TransactionReceipt): Authorization.AuthorizeEvent[];
        decodeAuthorizeEvent(event: Event): Authorization.AuthorizeEvent;
        parseDeauthorizeEvent(receipt: TransactionReceipt): Authorization.DeauthorizeEvent[];
        decodeDeauthorizeEvent(event: Event): Authorization.DeauthorizeEvent;
        parseStartOwnershipTransferEvent(receipt: TransactionReceipt): Authorization.StartOwnershipTransferEvent[];
        decodeStartOwnershipTransferEvent(event: Event): Authorization.StartOwnershipTransferEvent;
        parseTransferOwnershipEvent(receipt: TransactionReceipt): Authorization.TransferOwnershipEvent[];
        decodeTransferOwnershipEvent(event: Event): Authorization.TransferOwnershipEvent;
        deny: {
            (user: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (user: string, options?: TransactionOptions) => Promise<void>;
            txData: (user: string, options?: TransactionOptions) => Promise<string>;
        };
        isPermitted: {
            (param1: string, options?: TransactionOptions): Promise<boolean>;
        };
        newOwner: {
            (options?: TransactionOptions): Promise<string>;
        };
        owner: {
            (options?: TransactionOptions): Promise<string>;
        };
        permit: {
            (user: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (user: string, options?: TransactionOptions) => Promise<void>;
            txData: (user: string, options?: TransactionOptions) => Promise<string>;
        };
        takeOwnership: {
            (options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (options?: TransactionOptions) => Promise<void>;
            txData: (options?: TransactionOptions) => Promise<string>;
        };
        transferOwnership: {
            (newOwner: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (newOwner: string, options?: TransactionOptions) => Promise<void>;
            txData: (newOwner: string, options?: TransactionOptions) => Promise<string>;
        };
        private assign;
    }
    export module Authorization {
        interface AuthorizeEvent {
            user: string;
            _event: Event;
        }
        interface DeauthorizeEvent {
            user: string;
            _event: Event;
        }
        interface StartOwnershipTransferEvent {
            user: string;
            _event: Event;
        }
        interface TransferOwnershipEvent {
            user: string;
            _event: Event;
        }
    }
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.json.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.json.ts" {
    const _default_5: {
        abi: ({
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            outputs?: undefined;
            stateMutability?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                components: {
                    internalType: string;
                    name: string;
                    type: string;
                }[];
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            inputs: ({
                internalType: string;
                name: string;
                type: string;
                components?: undefined;
            } | {
                components: ({
                    internalType: string;
                    name: string;
                    type: string;
                    components?: undefined;
                } | {
                    components: {
                        internalType: string;
                        name: string;
                        type: string;
                    }[];
                    internalType: string;
                    name: string;
                    type: string;
                })[];
                internalType: string;
                name: string;
                type: string;
            })[];
            name: string;
            outputs: any[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            inputs?: undefined;
            name?: undefined;
            outputs?: undefined;
        })[];
        bytecode: string;
    };
    export default _default_5;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.ts" {
    import { IWallet, Contract as _Contract, TransactionReceipt, BigNumber, Event, TransactionOptions } from "@ijstech/eth-contract";
    export interface IClaimantIdsParams {
        param1: string;
        param2: string;
    }
    export interface IEthInParams {
        target: string;
        commissions: {
            to: string;
            amount: number | BigNumber;
        }[];
        data: string;
    }
    export interface IGetClaimantBalanceParams {
        claimant: string;
        token: string;
    }
    export interface IGetClaimantsInfoParams {
        fromId: number | BigNumber;
        count: number | BigNumber;
    }
    export interface IProxyCallParams {
        target: string;
        tokensIn: {
            token: string;
            amount: number | BigNumber;
            directTransfer: boolean;
            commissions: {
                to: string;
                amount: number | BigNumber;
            }[];
        }[];
        to: string;
        tokensOut: string[];
        data: string;
    }
    export interface ITokenInParams {
        target: string;
        tokensIn: {
            token: string;
            amount: number | BigNumber;
            directTransfer: boolean;
            commissions: {
                to: string;
                amount: number | BigNumber;
            }[];
        };
        data: string;
    }
    export class Proxy extends _Contract {
        static _abi: any;
        constructor(wallet: IWallet, address?: string);
        deploy(options?: TransactionOptions): Promise<string>;
        parseAddCommissionEvent(receipt: TransactionReceipt): Proxy.AddCommissionEvent[];
        decodeAddCommissionEvent(event: Event): Proxy.AddCommissionEvent;
        parseClaimEvent(receipt: TransactionReceipt): Proxy.ClaimEvent[];
        decodeClaimEvent(event: Event): Proxy.ClaimEvent;
        parseSkimEvent(receipt: TransactionReceipt): Proxy.SkimEvent[];
        decodeSkimEvent(event: Event): Proxy.SkimEvent;
        parseTransferBackEvent(receipt: TransactionReceipt): Proxy.TransferBackEvent[];
        decodeTransferBackEvent(event: Event): Proxy.TransferBackEvent;
        parseTransferForwardEvent(receipt: TransactionReceipt): Proxy.TransferForwardEvent[];
        decodeTransferForwardEvent(event: Event): Proxy.TransferForwardEvent;
        claim: {
            (token: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (token: string, options?: TransactionOptions) => Promise<void>;
            txData: (token: string, options?: TransactionOptions) => Promise<string>;
        };
        claimMultiple: {
            (tokens: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (tokens: string[], options?: TransactionOptions) => Promise<void>;
            txData: (tokens: string[], options?: TransactionOptions) => Promise<string>;
        };
        claimantIdCount: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        claimantIds: {
            (params: IClaimantIdsParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        claimantsInfo: {
            (param1: number | BigNumber, options?: TransactionOptions): Promise<{
                claimant: string;
                token: string;
                balance: BigNumber;
            }>;
        };
        ethIn: {
            (params: IEthInParams, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IEthInParams, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (params: IEthInParams, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        getClaimantBalance: {
            (params: IGetClaimantBalanceParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        getClaimantsInfo: {
            (params: IGetClaimantsInfoParams, options?: TransactionOptions): Promise<{
                claimant: string;
                token: string;
                balance: BigNumber;
            }[]>;
        };
        lastBalance: {
            (param1: string, options?: TransactionOptions): Promise<BigNumber>;
        };
        proxyCall: {
            (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        skim: {
            (tokens: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (tokens: string[], options?: TransactionOptions) => Promise<void>;
            txData: (tokens: string[], options?: TransactionOptions) => Promise<string>;
        };
        tokenIn: {
            (params: ITokenInParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: ITokenInParams, options?: TransactionOptions) => Promise<void>;
            txData: (params: ITokenInParams, options?: TransactionOptions) => Promise<string>;
        };
        private assign;
    }
    export module Proxy {
        interface AddCommissionEvent {
            to: string;
            token: string;
            amount: BigNumber;
            _event: Event;
        }
        interface ClaimEvent {
            from: string;
            token: string;
            amount: BigNumber;
            _event: Event;
        }
        interface SkimEvent {
            token: string;
            to: string;
            amount: BigNumber;
            _event: Event;
        }
        interface TransferBackEvent {
            target: string;
            token: string;
            sender: string;
            amount: BigNumber;
            _event: Event;
        }
        interface TransferForwardEvent {
            target: string;
            token: string;
            sender: string;
            amount: BigNumber;
            commissions: BigNumber;
            _event: Event;
        }
    }
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.json.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.json.ts" {
    const _default_6: {
        abi: ({
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            outputs?: undefined;
            stateMutability?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                components: {
                    internalType: string;
                    name: string;
                    type: string;
                }[];
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            inputs: ({
                internalType: string;
                name: string;
                type: string;
                components?: undefined;
            } | {
                components: ({
                    internalType: string;
                    name: string;
                    type: string;
                    components?: undefined;
                } | {
                    components: {
                        internalType: string;
                        name: string;
                        type: string;
                    }[];
                    internalType: string;
                    name: string;
                    type: string;
                })[];
                internalType: string;
                name: string;
                type: string;
            })[];
            name: string;
            outputs: any[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            inputs?: undefined;
            name?: undefined;
            outputs?: undefined;
        })[];
        bytecode: string;
    };
    export default _default_6;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.ts" {
    import { IWallet, Contract as _Contract, TransactionReceipt, BigNumber, Event, TransactionOptions } from "@ijstech/eth-contract";
    export interface IClaimantIdsParams {
        param1: string;
        param2: string;
    }
    export interface IEthInParams {
        target: string;
        commissions: {
            to: string;
            amount: number | BigNumber;
        }[];
        data: string;
    }
    export interface IGetClaimantBalanceParams {
        claimant: string;
        token: string;
    }
    export interface IGetClaimantsInfoParams {
        fromId: number | BigNumber;
        count: number | BigNumber;
    }
    export interface IProxyCallParams {
        target: string;
        tokensIn: {
            token: string;
            amount: number | BigNumber;
            directTransfer: boolean;
            commissions: {
                to: string;
                amount: number | BigNumber;
            }[];
            totalCommissions: number | BigNumber;
        }[];
        to: string;
        tokensOut: string[];
        data: string;
    }
    export interface ITokenInParams {
        target: string;
        tokensIn: {
            token: string;
            amount: number | BigNumber;
            directTransfer: boolean;
            commissions: {
                to: string;
                amount: number | BigNumber;
            }[];
            totalCommissions: number | BigNumber;
        };
        data: string;
    }
    export class ProxyV2 extends _Contract {
        static _abi: any;
        constructor(wallet: IWallet, address?: string);
        deploy(options?: TransactionOptions): Promise<string>;
        parseAddCommissionEvent(receipt: TransactionReceipt): ProxyV2.AddCommissionEvent[];
        decodeAddCommissionEvent(event: Event): ProxyV2.AddCommissionEvent;
        parseClaimEvent(receipt: TransactionReceipt): ProxyV2.ClaimEvent[];
        decodeClaimEvent(event: Event): ProxyV2.ClaimEvent;
        parseSkimEvent(receipt: TransactionReceipt): ProxyV2.SkimEvent[];
        decodeSkimEvent(event: Event): ProxyV2.SkimEvent;
        parseTransferBackEvent(receipt: TransactionReceipt): ProxyV2.TransferBackEvent[];
        decodeTransferBackEvent(event: Event): ProxyV2.TransferBackEvent;
        parseTransferForwardEvent(receipt: TransactionReceipt): ProxyV2.TransferForwardEvent[];
        decodeTransferForwardEvent(event: Event): ProxyV2.TransferForwardEvent;
        claim: {
            (token: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (token: string, options?: TransactionOptions) => Promise<void>;
            txData: (token: string, options?: TransactionOptions) => Promise<string>;
        };
        claimMultiple: {
            (tokens: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (tokens: string[], options?: TransactionOptions) => Promise<void>;
            txData: (tokens: string[], options?: TransactionOptions) => Promise<string>;
        };
        claimantIdCount: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        claimantIds: {
            (params: IClaimantIdsParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        claimantsInfo: {
            (param1: number | BigNumber, options?: TransactionOptions): Promise<{
                claimant: string;
                token: string;
                balance: BigNumber;
            }>;
        };
        ethIn: {
            (params: IEthInParams, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IEthInParams, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (params: IEthInParams, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        getClaimantBalance: {
            (params: IGetClaimantBalanceParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        getClaimantsInfo: {
            (params: IGetClaimantsInfoParams, options?: TransactionOptions): Promise<{
                claimant: string;
                token: string;
                balance: BigNumber;
            }[]>;
        };
        lastBalance: {
            (param1: string, options?: TransactionOptions): Promise<BigNumber>;
        };
        proxyCall: {
            (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        skim: {
            (tokens: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (tokens: string[], options?: TransactionOptions) => Promise<void>;
            txData: (tokens: string[], options?: TransactionOptions) => Promise<string>;
        };
        tokenIn: {
            (params: ITokenInParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: ITokenInParams, options?: TransactionOptions) => Promise<void>;
            txData: (params: ITokenInParams, options?: TransactionOptions) => Promise<string>;
        };
        private assign;
    }
    export module ProxyV2 {
        interface AddCommissionEvent {
            to: string;
            token: string;
            amount: BigNumber;
            _event: Event;
        }
        interface ClaimEvent {
            from: string;
            token: string;
            amount: BigNumber;
            _event: Event;
        }
        interface SkimEvent {
            token: string;
            to: string;
            amount: BigNumber;
            _event: Event;
        }
        interface TransferBackEvent {
            target: string;
            token: string;
            sender: string;
            amount: BigNumber;
            _event: Event;
        }
        interface TransferForwardEvent {
            target: string;
            token: string;
            sender: string;
            amount: BigNumber;
            commissions: BigNumber;
            _event: Event;
        }
    }
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV3.json.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV3.json.ts" {
    const _default_7: {
        abi: ({
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
            name?: undefined;
            outputs?: undefined;
        } | {
            anonymous: boolean;
            inputs: {
                indexed: boolean;
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            type: string;
            stateMutability?: undefined;
            outputs?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                components: ({
                    internalType: string;
                    name: string;
                    type: string;
                    components?: undefined;
                } | {
                    components: {
                        internalType: string;
                        name: string;
                        type: string;
                    }[];
                    internalType: string;
                    name: string;
                    type: string;
                })[];
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            inputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: ({
                internalType: string;
                name: string;
                type: string;
                components?: undefined;
            } | {
                components: {
                    internalType: string;
                    name: string;
                    type: string;
                }[];
                internalType: string;
                name: string;
                type: string;
            })[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            inputs: {
                components: ({
                    internalType: string;
                    name: string;
                    type: string;
                    components?: undefined;
                } | {
                    components: {
                        internalType: string;
                        name: string;
                        type: string;
                    }[];
                    internalType: string;
                    name: string;
                    type: string;
                })[];
                internalType: string;
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                internalType: string;
                name: string;
                type: string;
            }[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            inputs: ({
                internalType: string;
                name: string;
                type: string;
                components?: undefined;
            } | {
                components: {
                    internalType: string;
                    name: string;
                    type: string;
                }[];
                internalType: string;
                name: string;
                type: string;
            })[];
            name: string;
            outputs: any[];
            stateMutability: string;
            type: string;
            anonymous?: undefined;
        } | {
            stateMutability: string;
            type: string;
            inputs?: undefined;
            anonymous?: undefined;
            name?: undefined;
            outputs?: undefined;
        })[];
        bytecode: string;
    };
    export default _default_7;
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV3.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV3.ts" {
    import { IWallet, Contract as _Contract, TransactionReceipt, BigNumber, Event, TransactionOptions } from "@ijstech/eth-contract";
    export interface IAddProjectAdminParams {
        projectId: number | BigNumber;
        admin: string;
    }
    export interface ICampaignAccumulatedCommissionParams {
        param1: number | BigNumber;
        param2: string;
    }
    export interface IClaimantIdsParams {
        param1: string;
        param2: string;
    }
    export interface IGetCampaignParams {
        campaignId: number | BigNumber;
        returnArrays: boolean;
    }
    export interface IGetCampaignArrayData1Params {
        campaignId: number | BigNumber;
        targetAndSelectorsStart: number | BigNumber;
        targetAndSelectorsLength: number | BigNumber;
        referrersStart: number | BigNumber;
        referrersLength: number | BigNumber;
    }
    export interface IGetCampaignArrayData2Params {
        campaignId: number | BigNumber;
        inTokensStart: number | BigNumber;
        inTokensLength: number | BigNumber;
        outTokensStart: number | BigNumber;
        outTokensLength: number | BigNumber;
    }
    export interface IGetClaimantBalanceParams {
        claimant: string;
        token: string;
    }
    export interface IGetClaimantsInfoParams {
        fromId: number | BigNumber;
        count: number | BigNumber;
    }
    export interface IProxyCallParams {
        campaignId: number | BigNumber;
        target: string;
        data: string;
        referrer: string;
        to: string;
        tokensIn: {
            token: string;
            amount: number | BigNumber;
        }[];
        tokensOut: string[];
    }
    export interface IRemoveProjectAdminParams {
        projectId: number | BigNumber;
        admin: string;
    }
    export interface IStakeParams {
        projectId: number | BigNumber;
        token: string;
        amount: number | BigNumber;
    }
    export interface IStakeMultipleParams {
        projectId: number | BigNumber;
        token: string[];
        amount: (number | BigNumber)[];
    }
    export interface IStakesBalanceParams {
        param1: number | BigNumber;
        param2: string;
    }
    export interface ITransferProjectOwnershipParams {
        projectId: number | BigNumber;
        newOwner: string;
    }
    export interface IUnstakeParams {
        projectId: number | BigNumber;
        token: string;
        amount: number | BigNumber;
    }
    export interface IUnstakeMultipleParams {
        projectId: number | BigNumber;
        token: string[];
        amount: (number | BigNumber)[];
    }
    export class ProxyV3 extends _Contract {
        static _abi: any;
        constructor(wallet: IWallet, address?: string);
        deploy(protocolRate: number | BigNumber, options?: TransactionOptions): Promise<string>;
        parseAddCommissionEvent(receipt: TransactionReceipt): ProxyV3.AddCommissionEvent[];
        decodeAddCommissionEvent(event: Event): ProxyV3.AddCommissionEvent;
        parseAddProjectAdminEvent(receipt: TransactionReceipt): ProxyV3.AddProjectAdminEvent[];
        decodeAddProjectAdminEvent(event: Event): ProxyV3.AddProjectAdminEvent;
        parseAuthorizeEvent(receipt: TransactionReceipt): ProxyV3.AuthorizeEvent[];
        decodeAuthorizeEvent(event: Event): ProxyV3.AuthorizeEvent;
        parseClaimEvent(receipt: TransactionReceipt): ProxyV3.ClaimEvent[];
        decodeClaimEvent(event: Event): ProxyV3.ClaimEvent;
        parseClaimProtocolFeeEvent(receipt: TransactionReceipt): ProxyV3.ClaimProtocolFeeEvent[];
        decodeClaimProtocolFeeEvent(event: Event): ProxyV3.ClaimProtocolFeeEvent;
        parseDeauthorizeEvent(receipt: TransactionReceipt): ProxyV3.DeauthorizeEvent[];
        decodeDeauthorizeEvent(event: Event): ProxyV3.DeauthorizeEvent;
        parseNewCampaignEvent(receipt: TransactionReceipt): ProxyV3.NewCampaignEvent[];
        decodeNewCampaignEvent(event: Event): ProxyV3.NewCampaignEvent;
        parseNewProjectEvent(receipt: TransactionReceipt): ProxyV3.NewProjectEvent[];
        decodeNewProjectEvent(event: Event): ProxyV3.NewProjectEvent;
        parseRemoveProjectAdminEvent(receipt: TransactionReceipt): ProxyV3.RemoveProjectAdminEvent[];
        decodeRemoveProjectAdminEvent(event: Event): ProxyV3.RemoveProjectAdminEvent;
        parseSetProtocolRateEvent(receipt: TransactionReceipt): ProxyV3.SetProtocolRateEvent[];
        decodeSetProtocolRateEvent(event: Event): ProxyV3.SetProtocolRateEvent;
        parseSkimEvent(receipt: TransactionReceipt): ProxyV3.SkimEvent[];
        decodeSkimEvent(event: Event): ProxyV3.SkimEvent;
        parseStakeEvent(receipt: TransactionReceipt): ProxyV3.StakeEvent[];
        decodeStakeEvent(event: Event): ProxyV3.StakeEvent;
        parseStartOwnershipTransferEvent(receipt: TransactionReceipt): ProxyV3.StartOwnershipTransferEvent[];
        decodeStartOwnershipTransferEvent(event: Event): ProxyV3.StartOwnershipTransferEvent;
        parseTakeoverProjectOwnershipEvent(receipt: TransactionReceipt): ProxyV3.TakeoverProjectOwnershipEvent[];
        decodeTakeoverProjectOwnershipEvent(event: Event): ProxyV3.TakeoverProjectOwnershipEvent;
        parseTransferBackEvent(receipt: TransactionReceipt): ProxyV3.TransferBackEvent[];
        decodeTransferBackEvent(event: Event): ProxyV3.TransferBackEvent;
        parseTransferForwardEvent(receipt: TransactionReceipt): ProxyV3.TransferForwardEvent[];
        decodeTransferForwardEvent(event: Event): ProxyV3.TransferForwardEvent;
        parseTransferOwnershipEvent(receipt: TransactionReceipt): ProxyV3.TransferOwnershipEvent[];
        decodeTransferOwnershipEvent(event: Event): ProxyV3.TransferOwnershipEvent;
        parseTransferProjectOwnershipEvent(receipt: TransactionReceipt): ProxyV3.TransferProjectOwnershipEvent[];
        decodeTransferProjectOwnershipEvent(event: Event): ProxyV3.TransferProjectOwnershipEvent;
        parseUnstakeEvent(receipt: TransactionReceipt): ProxyV3.UnstakeEvent[];
        decodeUnstakeEvent(event: Event): ProxyV3.UnstakeEvent;
        addProjectAdmin: {
            (params: IAddProjectAdminParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IAddProjectAdminParams, options?: TransactionOptions) => Promise<void>;
            txData: (params: IAddProjectAdminParams, options?: TransactionOptions) => Promise<string>;
        };
        campaignAccumulatedCommission: {
            (params: ICampaignAccumulatedCommissionParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        claim: {
            (token: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (token: string, options?: TransactionOptions) => Promise<void>;
            txData: (token: string, options?: TransactionOptions) => Promise<string>;
        };
        claimMultiple: {
            (tokens: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (tokens: string[], options?: TransactionOptions) => Promise<void>;
            txData: (tokens: string[], options?: TransactionOptions) => Promise<string>;
        };
        claimMultipleProtocolFee: {
            (tokens: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (tokens: string[], options?: TransactionOptions) => Promise<void>;
            txData: (tokens: string[], options?: TransactionOptions) => Promise<string>;
        };
        claimProtocolFee: {
            (token: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (token: string, options?: TransactionOptions) => Promise<void>;
            txData: (token: string, options?: TransactionOptions) => Promise<string>;
        };
        claimantIdCount: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        claimantIds: {
            (params: IClaimantIdsParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        claimantsInfo: {
            (param1: number | BigNumber, options?: TransactionOptions): Promise<{
                claimant: string;
                token: string;
                balance: BigNumber;
            }>;
        };
        deny: {
            (user: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (user: string, options?: TransactionOptions) => Promise<void>;
            txData: (user: string, options?: TransactionOptions) => Promise<string>;
        };
        getCampaign: {
            (params: IGetCampaignParams, options?: TransactionOptions): Promise<{
                projectId: BigNumber;
                maxInputTokensInEachCall: BigNumber;
                maxOutputTokensInEachCall: BigNumber;
                referrersRequireApproval: boolean;
                startDate: BigNumber;
                endDate: BigNumber;
                targetAndSelectors: string[];
                acceptAnyInToken: boolean;
                acceptAnyOutToken: boolean;
                inTokens: string[];
                directTransferInToken: boolean[];
                commissionInTokenConfig: {
                    rate: BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: BigNumber;
                    capPerCampaign: BigNumber;
                }[];
                outTokens: string[];
                commissionOutTokenConfig: {
                    rate: BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: BigNumber;
                    capPerCampaign: BigNumber;
                }[];
                referrers: string[];
            }>;
        };
        getCampaignArrayData1: {
            (params: IGetCampaignArrayData1Params, options?: TransactionOptions): Promise<{
                targetAndSelectors: string[];
                referrers: string[];
            }>;
        };
        getCampaignArrayData2: {
            (params: IGetCampaignArrayData2Params, options?: TransactionOptions): Promise<{
                inTokens: string[];
                directTransferInToken: boolean[];
                commissionInTokenConfig: {
                    rate: BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: BigNumber;
                    capPerCampaign: BigNumber;
                }[];
                outTokens: string[];
                commissionOutTokenConfig: {
                    rate: BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: BigNumber;
                    capPerCampaign: BigNumber;
                }[];
            }>;
        };
        getCampaignArrayLength: {
            (campaignId: number | BigNumber, options?: TransactionOptions): Promise<{
                targetAndSelectorsLength: BigNumber;
                inTokensLength: BigNumber;
                outTokensLength: BigNumber;
                referrersLength: BigNumber;
            }>;
        };
        getCampaignsLength: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        getClaimantBalance: {
            (params: IGetClaimantBalanceParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        getClaimantsInfo: {
            (params: IGetClaimantsInfoParams, options?: TransactionOptions): Promise<{
                claimant: string;
                token: string;
                balance: BigNumber;
            }[]>;
        };
        getProject: {
            (projectId: number | BigNumber, options?: TransactionOptions): Promise<{
                owner: string;
                newOwner: string;
                projectAdmins: string[];
            }>;
        };
        getProjectAdminsLength: {
            (projectId: number | BigNumber, options?: TransactionOptions): Promise<BigNumber>;
        };
        getProjectsLength: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        isPermitted: {
            (param1: string, options?: TransactionOptions): Promise<boolean>;
        };
        lastBalance: {
            (param1: string, options?: TransactionOptions): Promise<BigNumber>;
        };
        newCampaign: {
            (params: {
                projectId: number | BigNumber;
                maxInputTokensInEachCall: number | BigNumber;
                maxOutputTokensInEachCall: number | BigNumber;
                referrersRequireApproval: boolean;
                startDate: number | BigNumber;
                endDate: number | BigNumber;
                targetAndSelectors: string[];
                acceptAnyInToken: boolean;
                acceptAnyOutToken: boolean;
                inTokens: string[];
                directTransferInToken: boolean[];
                commissionInTokenConfig: {
                    rate: number | BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: number | BigNumber;
                    capPerCampaign: number | BigNumber;
                }[];
                outTokens: string[];
                commissionOutTokenConfig: {
                    rate: number | BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: number | BigNumber;
                    capPerCampaign: number | BigNumber;
                }[];
                referrers: string[];
            }, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: {
                projectId: number | BigNumber;
                maxInputTokensInEachCall: number | BigNumber;
                maxOutputTokensInEachCall: number | BigNumber;
                referrersRequireApproval: boolean;
                startDate: number | BigNumber;
                endDate: number | BigNumber;
                targetAndSelectors: string[];
                acceptAnyInToken: boolean;
                acceptAnyOutToken: boolean;
                inTokens: string[];
                directTransferInToken: boolean[];
                commissionInTokenConfig: {
                    rate: number | BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: number | BigNumber;
                    capPerCampaign: number | BigNumber;
                }[];
                outTokens: string[];
                commissionOutTokenConfig: {
                    rate: number | BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: number | BigNumber;
                    capPerCampaign: number | BigNumber;
                }[];
                referrers: string[];
            }, options?: TransactionOptions) => Promise<BigNumber>;
            txData: (params: {
                projectId: number | BigNumber;
                maxInputTokensInEachCall: number | BigNumber;
                maxOutputTokensInEachCall: number | BigNumber;
                referrersRequireApproval: boolean;
                startDate: number | BigNumber;
                endDate: number | BigNumber;
                targetAndSelectors: string[];
                acceptAnyInToken: boolean;
                acceptAnyOutToken: boolean;
                inTokens: string[];
                directTransferInToken: boolean[];
                commissionInTokenConfig: {
                    rate: number | BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: number | BigNumber;
                    capPerCampaign: number | BigNumber;
                }[];
                outTokens: string[];
                commissionOutTokenConfig: {
                    rate: number | BigNumber;
                    feeOnProjectOwner: boolean;
                    capPerTransaction: number | BigNumber;
                    capPerCampaign: number | BigNumber;
                }[];
                referrers: string[];
            }, options?: TransactionOptions) => Promise<string>;
        };
        newOwner: {
            (options?: TransactionOptions): Promise<string>;
        };
        newProject: {
            (admins: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (admins: string[], options?: TransactionOptions) => Promise<BigNumber>;
            txData: (admins: string[], options?: TransactionOptions) => Promise<string>;
        };
        owner: {
            (options?: TransactionOptions): Promise<string>;
        };
        permit: {
            (user: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (user: string, options?: TransactionOptions) => Promise<void>;
            txData: (user: string, options?: TransactionOptions) => Promise<string>;
        };
        protocolFeeBalance: {
            (param1: string, options?: TransactionOptions): Promise<BigNumber>;
        };
        protocolRate: {
            (options?: TransactionOptions): Promise<BigNumber>;
        };
        proxyCall: {
            (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (params: IProxyCallParams, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        removeProjectAdmin: {
            (params: IRemoveProjectAdminParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IRemoveProjectAdminParams, options?: TransactionOptions) => Promise<void>;
            txData: (params: IRemoveProjectAdminParams, options?: TransactionOptions) => Promise<string>;
        };
        setProtocolRate: {
            (newRate: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (newRate: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (newRate: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        skim: {
            (tokens: string[], options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (tokens: string[], options?: TransactionOptions) => Promise<void>;
            txData: (tokens: string[], options?: TransactionOptions) => Promise<string>;
        };
        stake: {
            (params: IStakeParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IStakeParams, options?: TransactionOptions) => Promise<void>;
            txData: (params: IStakeParams, options?: TransactionOptions) => Promise<string>;
        };
        stakeETH: {
            (projectId: number | BigNumber, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (projectId: number | BigNumber, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (projectId: number | BigNumber, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        stakeMultiple: {
            (params: IStakeMultipleParams, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IStakeMultipleParams, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (params: IStakeMultipleParams, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        stakesBalance: {
            (params: IStakesBalanceParams, options?: TransactionOptions): Promise<BigNumber>;
        };
        takeOwnership: {
            (options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (options?: TransactionOptions) => Promise<void>;
            txData: (options?: TransactionOptions) => Promise<string>;
        };
        takeoverProjectOwnership: {
            (projectId: number | BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (projectId: number | BigNumber, options?: TransactionOptions) => Promise<void>;
            txData: (projectId: number | BigNumber, options?: TransactionOptions) => Promise<string>;
        };
        transferOwnership: {
            (newOwner: string, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (newOwner: string, options?: TransactionOptions) => Promise<void>;
            txData: (newOwner: string, options?: TransactionOptions) => Promise<string>;
        };
        transferProjectOwnership: {
            (params: ITransferProjectOwnershipParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: ITransferProjectOwnershipParams, options?: TransactionOptions) => Promise<void>;
            txData: (params: ITransferProjectOwnershipParams, options?: TransactionOptions) => Promise<string>;
        };
        unstake: {
            (params: IUnstakeParams, options?: TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IUnstakeParams, options?: TransactionOptions) => Promise<void>;
            txData: (params: IUnstakeParams, options?: TransactionOptions) => Promise<string>;
        };
        unstakeETH: {
            (projectId: number | BigNumber, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (projectId: number | BigNumber, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (projectId: number | BigNumber, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        unstakeMultiple: {
            (params: IUnstakeMultipleParams, options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
            call: (params: IUnstakeMultipleParams, options?: number | BigNumber | TransactionOptions) => Promise<void>;
            txData: (params: IUnstakeMultipleParams, options?: number | BigNumber | TransactionOptions) => Promise<string>;
        };
        private assign;
    }
    export module ProxyV3 {
        interface AddCommissionEvent {
            to: string;
            token: string;
            commission: BigNumber;
            commissionBalance: BigNumber;
            protocolFee: BigNumber;
            protocolFeeBalance: BigNumber;
            _event: Event;
        }
        interface AddProjectAdminEvent {
            projectId: BigNumber;
            admin: string;
            _event: Event;
        }
        interface AuthorizeEvent {
            user: string;
            _event: Event;
        }
        interface ClaimEvent {
            from: string;
            token: string;
            amount: BigNumber;
            _event: Event;
        }
        interface ClaimProtocolFeeEvent {
            token: string;
            amount: BigNumber;
            _event: Event;
        }
        interface DeauthorizeEvent {
            user: string;
            _event: Event;
        }
        interface NewCampaignEvent {
            campaignId: BigNumber;
            _event: Event;
        }
        interface NewProjectEvent {
            projectId: BigNumber;
            _event: Event;
        }
        interface RemoveProjectAdminEvent {
            projectId: BigNumber;
            admin: string;
            _event: Event;
        }
        interface SetProtocolRateEvent {
            protocolRate: BigNumber;
            _event: Event;
        }
        interface SkimEvent {
            token: string;
            to: string;
            amount: BigNumber;
            _event: Event;
        }
        interface StakeEvent {
            projectId: BigNumber;
            token: string;
            amount: BigNumber;
            balance: BigNumber;
            _event: Event;
        }
        interface StartOwnershipTransferEvent {
            user: string;
            _event: Event;
        }
        interface TakeoverProjectOwnershipEvent {
            projectId: BigNumber;
            newOwner: string;
            _event: Event;
        }
        interface TransferBackEvent {
            target: string;
            token: string;
            sender: string;
            amount: BigNumber;
            _event: Event;
        }
        interface TransferForwardEvent {
            target: string;
            token: string;
            sender: string;
            amount: BigNumber;
            _event: Event;
        }
        interface TransferOwnershipEvent {
            user: string;
            _event: Event;
        }
        interface TransferProjectOwnershipEvent {
            projectId: BigNumber;
            newOwner: string;
            _event: Event;
        }
        interface UnstakeEvent {
            projectId: BigNumber;
            token: string;
            amount: BigNumber;
            balance: BigNumber;
            _event: Event;
        }
    }
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/index.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/index.ts" {
    export { Authorization } from "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Authorization.ts";
    export { Proxy } from "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.ts";
    export { ProxyV2 } from "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.ts";
    export { ProxyV3 } from "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV3.ts";
}
/// <amd-module name="@scom/scom-gem-token/contracts/scom-commission-proxy-contract/index.ts" />
declare module "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/index.ts" {
    import * as Contracts from "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/index.ts";
    export { Contracts };
    import { IWallet } from '@ijstech/eth-wallet';
    export interface IDeployOptions {
        version?: string;
        protocolRate?: string;
    }
    export interface IDeployResult {
        proxy: string;
    }
    export var DefaultDeployOptions: IDeployOptions;
    export function deploy(wallet: IWallet, options?: IDeployOptions): Promise<IDeployResult>;
    export function onProgress(handler: any): void;
    const _default_8: {
        Contracts: typeof Contracts;
        deploy: typeof deploy;
        DefaultDeployOptions: IDeployOptions;
        onProgress: typeof onProgress;
    };
    export default _default_8;
}
/// <amd-module name="@scom/scom-gem-token/API.ts" />
declare module "@scom/scom-gem-token/API.ts" {
    import { BigNumber } from '@ijstech/eth-wallet';
    import { DappType, ICommissionInfo, IDeploy, IGemInfo } from "@scom/scom-gem-token/interface.tsx";
    import { Contracts } from "@scom/scom-gem-token/contracts/scom-gem-token-contract/index.ts";
    import { State } from "@scom/scom-gem-token/store/index.ts";
    import { ITokenObject } from '@scom/scom-token-list';
    function getFee(state: State, contractAddress: string, type: DappType): Promise<BigNumber>;
    function getGemBalance(state: State, contractAddress: string): Promise<BigNumber>;
    function deployContract(options: IDeploy, token: ITokenObject, callback?: any, confirmationCallback?: any): Promise<string>;
    function transfer(contractAddress: string, to: string, amount: string): Promise<{
        receipt: import("@ijstech/eth-contract").TransactionReceipt;
        value: any;
    }>;
    function getGemInfo(state: State, contractAddress: string): Promise<IGemInfo>;
    function buyToken(state: State, contractAddress: string, backerCoinAmount: number, token: ITokenObject, commissions: ICommissionInfo[], callback?: any, confirmationCallback?: any): Promise<any>;
    function redeemToken(address: string, gemAmount: string, callback?: any, confirmationCallback?: any): Promise<import("@ijstech/eth-contract").TransactionReceipt | {
        receipt: import("@ijstech/eth-contract").TransactionReceipt;
        data: Contracts.GEM.RedeemEvent;
    }>;
    export { deployContract, getFee, transfer, buyToken, redeemToken, getGemBalance, getGemInfo };
}
/// <amd-module name="@scom/scom-gem-token/data.json.ts" />
declare module "@scom/scom-gem-token/data.json.ts" {
    const _default_9: {
        ipfsGatewayUrl: string;
        infuraId: string;
        networks: {
            chainId: number;
            explorerName: string;
            explorerTxUrl: string;
            explorerAddressUrl: string;
        }[];
        proxyAddresses: {
            "97": string;
            "43113": string;
        };
        embedderCommissionFee: string;
        defaultBuilderData: {
            dappType: string;
            hideDescription: boolean;
            description: string;
            chainSpecificProperties: {
                "43113": {
                    contract: string;
                };
            };
            defaultChainId: number;
            networks: {
                chainId: number;
            }[];
            wallets: {
                name: string;
            }[];
        };
    };
    export default _default_9;
}
/// <amd-module name="@scom/scom-gem-token/formSchema.json.ts" />
declare module "@scom/scom-gem-token/formSchema.json.ts" {
    const _default_10: {
        general: {
            dataSchema: {
                type: string;
                properties: {};
            };
        };
        theme: {
            dataSchema: {
                type: string;
                properties: {
                    dark: {
                        type: string;
                        properties: {
                            backgroundColor: {
                                type: string;
                                format: string;
                            };
                            fontColor: {
                                type: string;
                                format: string;
                            };
                            inputBackgroundColor: {
                                type: string;
                                format: string;
                            };
                            inputFontColor: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    light: {
                        type: string;
                        properties: {
                            backgroundColor: {
                                type: string;
                                format: string;
                            };
                            fontColor: {
                                type: string;
                                format: string;
                            };
                            inputBackgroundColor: {
                                type: string;
                                format: string;
                            };
                            inputFontColor: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                };
            };
        };
    };
    export default _default_10;
}
/// <amd-module name="@scom/scom-gem-token" />
declare module "@scom/scom-gem-token" {
    import { Module, Container, ControlElement } from '@ijstech/components';
    import { IEmbedData, DappType, IChainSpecificProperties, IWalletPlugin } from "@scom/scom-gem-token/interface.tsx";
    import { INetworkConfig } from '@scom/scom-network-picker';
    import ScomCommissionFeeSetup from '@scom/scom-commission-fee-setup';
    interface ScomGemTokenElement extends ControlElement {
        lazyLoad?: boolean;
        dappType?: DappType;
        logo?: string;
        description?: string;
        hideDescription?: boolean;
        chainSpecificProperties?: Record<number, IChainSpecificProperties>;
        defaultChainId: number;
        wallets: IWalletPlugin[];
        networks: INetworkConfig[];
        showHeader?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ["i-scom-gem-token"]: ScomGemTokenElement;
            }
        }
    }
    export default class ScomGemToken extends Module {
        private state;
        private gridDApp;
        private imgLogo;
        private imgLogo2;
        private markdownViewer;
        private pnlLogoTitle;
        private lblTitle;
        private lblTitle2;
        private toTokenLb;
        private fromTokenLb;
        private feeLb;
        private lbYouWillGet;
        private feeTooltip;
        private pnlQty;
        private edtGemQty;
        private lblBalance;
        private btnSubmit;
        private btnApprove;
        private tokenElm;
        private edtAmount;
        private txStatusModal;
        private balanceLayout;
        private backerStack;
        private backerTokenImg;
        private backerTokenBalanceLb;
        private gridTokenInput;
        private gemLogoStack;
        private maxStack;
        private loadingElm;
        private pnlDescription;
        private lbOrderTotalTitle;
        private iconOrderTotal;
        private lbPrice;
        private hStackTokens;
        private pnlInputFields;
        private pnlUnsupportedNetwork;
        private dappContainer;
        private _type;
        private _entryContract;
        private _data;
        private approvalModelAction;
        private isApproving;
        private gemInfo;
        tag: any;
        defaultEdit: boolean;
        private rpcWalletEvents;
        constructor(parent?: Container, options?: ScomGemTokenElement);
        removeRpcWalletEvents(): void;
        onHide(): void;
        static create(options?: ScomGemTokenElement, parent?: Container): Promise<ScomGemToken>;
        private onWalletConnect;
        private onChainChanged;
        private get chainId();
        private get rpcWallet();
        private get isBuy();
        private get tokenSymbol();
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        get defaultChainId(): number;
        set defaultChainId(value: number);
        private updateTokenBalance;
        private _getActions;
        getConfigurators(): ({
            name: string;
            target: string;
            getActions: (category?: string) => any[];
            getData: any;
            setData: (data: IEmbedData) => Promise<void>;
            setTag: any;
            getTag: any;
            elementName?: undefined;
            getLinkParams?: undefined;
            setLinkParams?: undefined;
            bindOnChanged?: undefined;
        } | {
            name: string;
            target: string;
            elementName: string;
            getLinkParams: () => {
                data: string;
            };
            setLinkParams: (params: any) => Promise<void>;
            bindOnChanged: (element: ScomCommissionFeeSetup, callback: (data: any) => Promise<void>) => void;
            getData: () => {
                fee: string;
                dappType?: DappType;
                logo?: string;
                description?: string;
                hideDescription?: boolean;
                commissions?: import("@scom/scom-gem-token/interface.tsx").ICommissionInfo[];
                chainSpecificProperties?: Record<number, IChainSpecificProperties>;
                defaultChainId: number;
                wallets: IWalletPlugin[];
                networks: INetworkConfig[];
                showHeader?: boolean;
                name?: string;
                symbol?: string;
                cap?: string;
                price?: string;
                mintingFee?: string;
                redemptionFee?: string;
            };
            setData: any;
            setTag: any;
            getTag: any;
            getActions?: undefined;
        })[];
        private getData;
        private resetRpcWallet;
        private setData;
        private getTag;
        private updateTag;
        setTag(value: any): Promise<void>;
        private updateStyle;
        private updateTheme;
        private initializeWidgetConfig;
        private initWallet;
        private renderEmpty;
        private refreshDApp;
        get contract(): string;
        get dappType(): DappType;
        set dappType(value: DappType);
        get description(): string;
        set description(value: string);
        get hideDescription(): boolean;
        set hideDescription(value: boolean);
        get logo(): string;
        set logo(value: string);
        get chainSpecificProperties(): any;
        set chainSpecificProperties(value: any);
        private initApprovalAction;
        private updateContractAddress;
        private showTxStatusModal;
        private updateSubmitButton;
        private get submitButtonCaption();
        private onApprove;
        private onQtyChanged;
        private onAmountChanged;
        private getBackerCoinAmount;
        private getBalance;
        private doSubmitAction;
        private onSubmit;
        private onBuyToken;
        private onRedeemToken;
        private onSetMaxBalance;
        private renderTokenInput;
        init(): Promise<void>;
        render(): any;
    }
}
