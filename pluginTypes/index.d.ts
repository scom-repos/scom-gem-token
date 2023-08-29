/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-commission-proxy-contract/@ijstech/eth-wallet/index.d.ts" />
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
/// <amd-module name="@scom/scom-gem-token/API.ts" />
declare module "@scom/scom-gem-token/API.ts" {
    import { BigNumber } from '@ijstech/eth-wallet';
    import { DappType, ICommissionInfo, IDeploy, IGemInfo } from "@scom/scom-gem-token/interface.tsx";
    import { Contracts } from '@scom/scom-gem-token-contract';
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
    const _default_1: {
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
    export default _default_1;
}
/// <amd-module name="@scom/scom-gem-token/formSchema.json.ts" />
declare module "@scom/scom-gem-token/formSchema.json.ts" {
    const _default_2: {
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
        uiSchema: {
            type: string;
            elements: {
                type: string;
                label: string;
                elements: {
                    type: string;
                    elements: {
                        type: string;
                        label: string;
                        scope: string;
                    }[];
                }[];
            }[];
        };
    };
    export default _default_2;
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
