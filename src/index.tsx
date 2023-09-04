import {
  Module,
  customElements,
  GridLayout,
  Markdown,
  Image,
  Label,
  Styles,
  HStack,
  Input,
  Button,
  Container,
  Panel,
  Icon,
  VStack,
  IDataSchema,
  ControlElement,
  IUISchema
} from '@ijstech/components';
import { BigNumber, Constants, IERC20ApprovalAction, IEventBusRegistry, Utils, Wallet } from '@ijstech/eth-wallet';
import { IEmbedData, DappType, IGemInfo, IChainSpecificProperties, IWalletPlugin } from './interface';
import { formatNumber, getTokenBalance } from './utils/index';
import { State, isClientWalletConnected } from './store/index';
import { assets as tokenAssets, ITokenObject, tokenStore } from '@scom/scom-token-list';
import assets from './assets';
import { imageStyle, inputStyle, markdownStyle, tokenSelectionStyle, centerStyle } from './index.css';
import { deployContract, buyToken, redeemToken, getGemBalance, getGemInfo } from './API';
import configData from './data.json';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomDappContainer from '@scom/scom-dapp-container';
import ScomCommissionFeeSetup from '@scom/scom-commission-fee-setup';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import ScomTokenInput from '@scom/scom-token-input';
import { getFormSchema } from './formSchema.json';
import getDexList from '@scom/scom-dex-list';

const Theme = Styles.Theme.ThemeVars;
const buyTooltip = 'The fee the project owner will receive for token minting';
const redeemTooltip = 'The spread the project owner will receive for redemptions';

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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["i-scom-gem-token"]: ScomGemTokenElement;
    }
  }
}

@customElements('i-scom-gem-token')
export default class ScomGemToken extends Module {
  private state: State;
  private gridDApp: GridLayout;
  private imgLogo: Image;
  private imgLogo2: Image;
  private markdownViewer: Markdown;
  private pnlLogoTitle: VStack;
  private lblTitle: Label;
  private lblTitle2: Label;
  private toTokenLb: Label;
  private fromTokenLb: Label;
  private feeLb: Label;
  private lbYouWillGet: Label;
  private feeTooltip: Icon;
  private pnlQty: HStack;
  private edtGemQty: Input;
  private lblBalance: Label;
  private btnSubmit: Button;
  private btnApprove: Button;
  private tokenElm: ScomTokenInput;
  private edtAmount: Input;
  private txStatusModal: ScomTxStatusModal;
  private balanceLayout: GridLayout;
  private backerStack: Panel;
  private backerTokenImg: Image;
  private backerTokenBalanceLb: Label;
  private gridTokenInput: GridLayout;
  private gemLogoStack: Panel;
  private maxStack: Panel;
  private loadingElm: Panel;
  private pnlDescription: VStack;
  private lbOrderTotalTitle: Label;
  private iconOrderTotal: Icon;
  private lbPrice: Label;
  private hStackTokens: HStack;
  private pnlInputFields: VStack;
  private pnlUnsupportedNetwork: VStack;
  private dappContainer: ScomDappContainer;

  private _type: DappType | undefined;
  private _entryContract: string;
  private _data: IEmbedData = {
    wallets: [],
    networks: [],
    defaultChainId: 0
  };
  private approvalModelAction: IERC20ApprovalAction;
  private isApproving: boolean = false;
  private gemInfo: IGemInfo;

  tag: any = {}
  defaultEdit: boolean = true;
  private rpcWalletEvents: IEventBusRegistry[] = [];

  constructor(parent?: Container, options?: ScomGemTokenElement) {
    super(parent, options);
    this.state = new State(configData);
  }

  removeRpcWalletEvents() {
    const rpcWallet = this.rpcWallet;
    for (let event of this.rpcWalletEvents) {
      rpcWallet.unregisterWalletEvent(event);
    }
    this.rpcWalletEvents = [];
  }

  onHide() {
    this.dappContainer.onHide();
    this.removeRpcWalletEvents();
  }

  static async create(options?: ScomGemTokenElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  private onWalletConnect = async () => {
    if (isClientWalletConnected) {
      this.updateContractAddress();
    } else {
      this.lblBalance.caption = '0.00';
    }
    this.initializeWidgetConfig()
  }

  private onChainChanged = async () => {
    this.updateContractAddress();
    this.initializeWidgetConfig();
  }

  private get chainId() {
    return this.state.getChainId();
  }

  private get rpcWallet() {
    return this.state.getRpcWallet();
  }

  private get isBuy() {
    return this._data.dappType === 'buy';
  }

  private get tokenSymbol() {
    return this.gemInfo?.baseToken?.symbol || '';
  }

  get wallets() {
    return this._data.wallets ?? [];
  }
  set wallets(value: IWalletPlugin[]) {
    this._data.wallets = value;
  }

  get networks() {
    return this._data.networks ?? [];
  }
  set networks(value: INetworkConfig[]) {
    this._data.networks = value;
  }

  get showHeader() {
    return this._data.showHeader ?? true;
  }
  set showHeader(value: boolean) {
    this._data.showHeader = value;
  }

  get defaultChainId() {
    return this._data.defaultChainId;
  }
  set defaultChainId(value: number) {
    this._data.defaultChainId = value;
  }

  private updateTokenBalance = async () => {
    const token = this.gemInfo?.baseToken;
    if (!token) return;
    try {
      const symbol = token?.symbol || '';
      this.lblBalance.caption = token ? `${formatNumber(await getTokenBalance(this.rpcWallet, token))} ${symbol}` : `0 ${symbol}`;
    } catch { }
  }

  private getBuilderActions(dataSchema: IDataSchema, uiSchema: IUISchema, category?: string) {
    let self = this;
    const actions: any[] = [
      {
        name: 'Commissions',
        icon: 'dollar-sign',
        command: (builder: any, userInputData: any) => {
          let _oldData: IEmbedData = {
            wallets: [],
            networks: [],
            defaultChainId: 0
          };
          return {
            execute: async () => {
              _oldData = { ...this._data };
              let resultingData = {
                ...self._data,
                commissions: userInputData.commissions
              };
              await self.setData(resultingData);
              if (builder?.setData) builder.setData(this._data);
            },
            undo: async () => {
              this._data = { ..._oldData };
              await self.setData(this._data);
              if (builder?.setData) builder.setData(this._data);
            },
            redo: () => { }
          }
        },
        customUI: {
          render: (data?: any, onConfirm?: (result: boolean, data: any) => void) => {
            const vstack = new VStack();
            const config = new ScomCommissionFeeSetup(null, {
              commissions: self._data.commissions || [],
              fee: this.state.embedderCommissionFee,
              networks: self._data.networks
            });
            const hstack = new HStack(null, {
              verticalAlignment: 'center',
            });
            const button = new Button(hstack, {
              caption: 'Confirm',
              width: '100%',
              height: 40,
              font: { color: Theme.colors.primary.contrastText }
            });
            vstack.append(config);
            vstack.append(hstack);
            button.onClick = async () => {
              const commissions = config.commissions;
              if (onConfirm) onConfirm(true, { commissions });
            }
            return vstack;
          }
        }
      }
    ];
    if (category && category !== 'offers') {
      actions.push(
        {
          name: 'Edit',
          icon: 'edit',
          command: (builder: any, userInputData: any) => {
            let oldData: IEmbedData = {
              wallets: [],
              networks: [],
              defaultChainId: 0
            };
            let oldTag = {};
            return {
              execute: async () => {
                oldData = JSON.parse(JSON.stringify(this._data));
                const {
                  dappType,
                  logo,
                  description,
                  ...themeSettings
                } = userInputData;

                const generalSettings = {
                  dappType,
                  logo,
                  description
                };
                if (generalSettings.dappType != undefined) this._data.dappType = generalSettings.dappType;
                if (generalSettings.logo != undefined) this._data.logo = generalSettings.logo;
                if (generalSettings.description != undefined) this._data.description = generalSettings.description;
                await this.resetRpcWallet();
                this.refreshDApp();
                if (builder?.setData) builder.setData(this._data);

                oldTag = JSON.parse(JSON.stringify(this.tag));
                if (builder?.setTag) builder.setTag(themeSettings);
                else this.setTag(themeSettings);
                if (this.dappContainer) this.dappContainer.setTag(themeSettings);
              },
              undo: async () => {
                this._data = JSON.parse(JSON.stringify(oldData));
                this.refreshDApp();
                if (builder?.setData) builder.setData(this._data);

                this.tag = JSON.parse(JSON.stringify(oldTag));
                if (builder?.setTag) builder.setTag(this.tag);
                else this.setTag(this.tag);
                if (this.dappContainer) this.dappContainer.setTag(this.tag);
              },
              redo: () => { }
            }
          },
          userInputDataSchema: dataSchema,
          userInputUISchema: uiSchema
        }
      );
    }
    return actions
  }

  private getProjectOwnerActions() {
    const formSchema: any = getFormSchema();
    const actions: any[] = [
      {
        name: 'Settings',
        userInputDataSchema: formSchema.dataSchema,
        userInputUISchema: formSchema.uiSchema
      }
    ];
    return actions;
  }

  getConfigurators() {
    let self = this;
    return [
      {
        name: 'Project Owner Configurator',
        target: 'Project Owners',
        getProxySelectors: async () => {
          return [];
        },
        getActions: () => {
          return this.getProjectOwnerActions();
        },
        getData: this.getData.bind(this),
        setData: async (data: IEmbedData) => {
          await this.setData(data)
        },
        setTag: this.setTag.bind(this),
        getTag: this.getTag.bind(this)
      },
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: (category?: string) => {
          const formSchema: any = getFormSchema(this._data.hideDescription);
          const dataSchema = { ...formSchema.dataSchema };
          const uiSchema = { ...formSchema.uiSchema };
          return this.getBuilderActions(dataSchema as IDataSchema, uiSchema as IUISchema, category);
        },
        getData: this.getData.bind(this),
        setData: async (data: IEmbedData) => {
          const defaultData = configData.defaultBuilderData as any;
          await this.setData({ ...defaultData, ...data })
        },
        setTag: this.setTag.bind(this),
        getTag: this.getTag.bind(this)
      },
      {
        name: 'Emdedder Configurator',
        target: 'Embedders',
        elementName: 'i-scom-commission-fee-setup',
        getLinkParams: () => {
          const commissions = self._data.commissions || [];
          return {
            data: window.btoa(JSON.stringify(commissions))
          }
        },
        setLinkParams: async (params: any) => {
          if (params.data) {
            const decodedString = window.atob(params.data);
            const commissions = JSON.parse(decodedString);
            let resultingData = {
              ...self._data,
              commissions
            };
            await self.setData(resultingData);
          }
        },
        bindOnChanged: (element: ScomCommissionFeeSetup, callback: (data: any) => Promise<void>) => {
          element.onChanged = async (data: any) => {
            let resultingData = {
              ...self._data,
              ...data
            };
            await self.setData(resultingData);
            await callback(data);
          }
        },
        getData: () => {
          const fee = this.state.embedderCommissionFee;
          return { ...this.getData(), fee }
        },
        setData: this.setData.bind(this),
        setTag: this.setTag.bind(this),
        getTag: this.getTag.bind(this)
      }
    ]
  }

  private getData() {
    return this._data;
  }

  private async resetRpcWallet() {
    this.removeRpcWalletEvents();
    const rpcWalletId = await this.state.initRpcWallet(this.defaultChainId);
    const rpcWallet = this.rpcWallet;
    const chainChangedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
      this.onChainChanged();
    });
    const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
      this.onWalletConnect();
    });
    this.rpcWalletEvents.push(chainChangedEvent, connectedEvent);

    const data = {
      defaultChainId: this.defaultChainId,
      wallets: this.wallets,
      networks: this.networks,
      showHeader: this.showHeader,
      rpcWalletId: rpcWallet.instanceId || ''
    }
    if (this.dappContainer?.setData) this.dappContainer.setData(data);
  }

  private async setData(value: IEmbedData) {
    this._data = value;
    await this.resetRpcWallet();
    if (!this.tokenElm.isConnected) await this.tokenElm.ready();
    if (this.tokenElm.rpcWalletId !== this.rpcWallet.instanceId) {
      this.tokenElm.rpcWalletId = this.rpcWallet.instanceId;
    }
    await this.initializeWidgetConfig();
    const commissionFee = this.state.embedderCommissionFee;
    this.iconOrderTotal.tooltip.content = `A commission fee of ${new BigNumber(commissionFee).times(100)}% will be applied to the amount you input.`;
    this.updateContractAddress();
  }

  private getTag() {
    return this.tag;
  }

  private updateTag(type: 'light' | 'dark', value: any) {
    this.tag[type] = this.tag[type] ?? {};
    for (let prop in value) {
      if (value.hasOwnProperty(prop))
        this.tag[type][prop] = value[prop];
    }
  }

  async setTag(value: any) {
    const newValue = value || {};
    for (let prop in newValue) {
      if (newValue.hasOwnProperty(prop)) {
        if (prop === 'light' || prop === 'dark')
          this.updateTag(prop, newValue[prop]);
        else
          this.tag[prop] = newValue[prop];
      }
    }
    if (this.dappContainer)
      this.dappContainer.setTag(this.tag);
    this.updateTheme();
  }

  private updateStyle(name: string, value: any) {
    value ?
      this.style.setProperty(name, value) :
      this.style.removeProperty(name);
  }

  private updateTheme() {
    const themeVar = this.dappContainer?.theme || 'light';
    const { fontColor, backgroundColor, inputFontColor, inputBackgroundColor, buttonBackgroundColor } = this.tag[themeVar] || {};
    this.updateStyle('--text-primary', fontColor);
    this.updateStyle('--background-main', backgroundColor);
    this.updateStyle('--input-font_color', inputFontColor);
    this.updateStyle('--input-background', inputBackgroundColor);
    this.updateStyle('--colors-primary-main', buttonBackgroundColor);
  }

  // async confirm() {
  //   return new Promise<void>(async (resolve, reject) => {
  //     try {
  //       if (this.loadingElm) this.loadingElm.visible = true;
  //       await this.onDeploy((error: Error, receipt?: string) => {
  //         if (error) {
  //           this.showTxStatusModal('error', error);
  //           reject(error);
  //         }
  //       }, (receipt: any) => {
  //         this.refreshDApp();
  //       });
  //     } catch (error) {
  //       this.showTxStatusModal('error', error);
  //       reject(error);
  //     }
  //     if (!this.contract && !this._data)
  //       reject(new Error('Data missing'));
  //     resolve();
  //     if (this.loadingElm) this.loadingElm.visible = false;
  //   })
  // }

  // private onDeploy = async (callback?: any, confirmationCallback?: any) => {
  //   if (this.contract || !this.gemInfo.name) return;
  //   const params = {
  //     name: this.gemInfo.name,
  //     symbol: this.gemInfo.symbol,
  //     cap: this.gemInfo.cap.toFixed(),
  //     price: this.gemInfo.price.toFixed(),
  //     mintingFee: this.gemInfo.mintingFee.toFixed(),
  //     redemptionFee: this.gemInfo.redemptionFee.toFixed()
  //   }
  //   const result = await deployContract(
  //     params,
  //     this.gemInfo.baseToken,
  //     callback,
  //     confirmationCallback
  //   );
  // }

  private async initializeWidgetConfig() {
    tokenStore.updateTokenMapData(this.chainId);
    const rpcWallet = this.rpcWallet;
    if (rpcWallet.address) {
      tokenStore.updateAllTokenBalances(rpcWallet);
    }
    await this.initWallet();
    if (isClientWalletConnected()) {
      this.refreshDApp();
      await this.initApprovalAction();
    } else {
      this.renderEmpty();
    }
  }

  private initWallet = async () => {
    try {
      await Wallet.getClientInstance().init();
      await this.rpcWallet.init();
    } catch (err) {
      console.log(err);
    }
  }

  private async renderEmpty() {
    if (!this.btnSubmit.isConnected) await this.btnSubmit.ready();
    if (!this.lbPrice.isConnected) await this.lbPrice.ready();
    if (!this.hStackTokens.isConnected) await this.hStackTokens.ready();
    if (!this.pnlInputFields.isConnected) await this.pnlInputFields.ready();
    if (!this.lblTitle.isConnected) await this.lblTitle.ready();
    if (!this.lblTitle2.isConnected) await this.lblTitle2.ready();
    if (!this.markdownViewer.isConnected) await this.markdownViewer.ready();
    if (!this.pnlUnsupportedNetwork.isConnected) await this.pnlUnsupportedNetwork.ready();
    this.btnSubmit.caption = this.submitButtonCaption;
    this.lbPrice.visible = false;
    this.hStackTokens.visible = false;
    this.pnlInputFields.visible = false;
    this.lblTitle.visible = false;
    this.lblTitle2.visible = false;
    this.markdownViewer.visible = false;
    this.pnlUnsupportedNetwork.visible = true;
  }

  private async refreshDApp() {
    this._type = this._data.dappType;
    if (this._data.hideDescription) {
      this.pnlDescription.visible = false;
      this.gridDApp.templateColumns = ['1fr'];
      this.pnlLogoTitle.visible = true;
    }
    else {
      this.pnlDescription.visible = true;
      this.gridDApp.templateColumns = ['repeat(2, 1fr)'];
      this.pnlLogoTitle.visible = false;
    }
    if (!this.btnSubmit.isConnected) await this.btnSubmit.ready();
    this.btnSubmit.caption = this.submitButtonCaption;
    this.imgLogo.url = this.imgLogo2.url = this.logo || assets.fullPath('img/gem-logo.png');
    this.gemInfo = this.contract ? await getGemInfo(this.state, this.contract) : null;
    if (this.gemInfo?.baseToken) {
      this.lbPrice.visible = true;
      this.hStackTokens.visible = true;
      this.pnlInputFields.visible = true;
      this.pnlUnsupportedNetwork.visible = false;

      this.renderTokenInput();
      const buyDesc = `Use ${this.gemInfo.name || ''} for services on Secure Compute, decentralized hosting, audits, sub-domains and more. Full backed, Redeemable and transparent at all times!`;
      const redeemDesc = `Redeem your ${this.gemInfo.name || ''} Tokens for the underlying token.`;
      const description = this._data.description || (this.isBuy ? buyDesc : redeemDesc);
      this.markdownViewer.load(description);
      if (!this.fromTokenLb.isConnected) await this.fromTokenLb.ready();
      this.fromTokenLb.caption = `1 ${this.gemInfo.name || ''}`;
      if (!this.toTokenLb.isConnected) await this.toTokenLb.ready();
      this.toTokenLb.caption = `1 ${this.tokenSymbol}`;
      if (!this.lblTitle.isConnected) await this.lblTitle.ready();
      if (!this.lblTitle2.isConnected) await this.lblTitle2.ready();
      this.lblTitle.visible = true;
      this.lblTitle2.visible = true;
      this.markdownViewer.visible = true;
      this.lblTitle.caption = this.lblTitle2.caption = `${this.isBuy ? 'Buy' : 'Redeem'} ${this.gemInfo.name || ''} - GEM Tokens`;
      if (!this.backerStack.isConnected) await this.backerStack.ready();
      this.backerStack.visible = !this.isBuy;
      if (!this.pnlQty.isConnected) await this.pnlQty.ready();
      this.pnlQty.visible = this.isBuy;
      this.balanceLayout.templateAreas = [['qty'], ['balance'], ['tokenInput'], ['redeem']];
      if (!this.edtGemQty.isConnected) await this.edtGemQty.ready();
      this.edtGemQty.readOnly = !this.contract;
      this.edtGemQty.value = "";
      if (!this.isBuy) {
        this.btnSubmit.enabled = false;
        this.btnApprove.visible = false;
        this.backerTokenImg.url = tokenAssets.tokenPath(this.gemInfo.baseToken, this.chainId);
        if (!this.backerTokenBalanceLb.isConnected) await this.backerTokenBalanceLb.ready();
        this.backerTokenBalanceLb.caption = '0.00';
      } else {
        this.btnSubmit.enabled = new BigNumber(this.edtAmount.value).gt(0);
      }
      const feeValue = this.isBuy ? Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
      if (!this.feeLb.isConnected) await this.feeLb.ready();
      this.feeLb.caption = `${feeValue || ''} ${this.gemInfo.name}`;
      const qty = Number(this.edtGemQty.value);
      const totalGemTokens = new BigNumber(qty).minus(new BigNumber(qty).times(feeValue));
      if (!this.lbYouWillGet.isConnected) await this.lbYouWillGet.ready();
      this.lbYouWillGet.caption = `${formatNumber(totalGemTokens)} ${this.gemInfo.name}`;
      this.feeTooltip.tooltip.content = this.isBuy ? buyTooltip : redeemTooltip;
      if (!this.lblBalance.isConnected) await this.lblBalance.ready();
      this.lblBalance.caption = `${formatNumber(await this.getBalance())} ${this.tokenSymbol}`;
      this.updateTokenBalance();
    } else {
      this.renderEmpty();
    }
    if (!this.state.isRpcWalletConnected()) {
      this.btnSubmit.enabled = true;
    }
  }

  get contract() {
    return this._data.chainSpecificProperties?.[this.chainId]?.contract ?? '';
  }

  get dappType(): DappType {
    return this._data.dappType ?? "buy";
  }
  set dappType(value: DappType) {
    this._data.dappType = value;
  }

  get description() {
    return this._data.description ?? '';
  }
  set description(value: string) {
    this._data.description = value;
  }

  get hideDescription() {
    return this._data.hideDescription ?? false;
  }
  set hideDescription(value: boolean) {
    this._data.hideDescription = value;
  }

  get logo() {
    if (this._data.logo?.startsWith('ipfs://')) {
      return this._data.logo.replace('ipfs://', '/ipfs/');
    }
    return this._data.logo ?? '';
  }
  set logo(value: string) {
    this._data.logo = value;
  }

  get chainSpecificProperties() {
    return this._data.chainSpecificProperties ?? {};
  }

  set chainSpecificProperties(value: any) {
    this._data.chainSpecificProperties = value;
  }

  private async initApprovalAction() {
    if (!this.approvalModelAction) {
      this._entryContract = this.state.getProxyAddress();
      this.approvalModelAction = await this.state.setApprovalModelAction({
        sender: this,
        payAction: async () => {
          await this.doSubmitAction();
        },
        onToBeApproved: async (token: ITokenObject) => {
          this.btnApprove.visible = true;
          this.btnSubmit.enabled = !this.state.isRpcWalletConnected();
          if (!this.isApproving) {
            this.btnApprove.rightIcon.visible = false;
            this.btnApprove.caption = 'Approve';
          }
          this.btnApprove.enabled = new BigNumber(this.edtGemQty.value).gt(0);
          this.isApproving = false;
        },
        onToBePaid: async (token: ITokenObject) => {
          this.btnApprove.visible = false;
          this.isApproving = false;
          this.btnSubmit.enabled = !this.state.isRpcWalletConnected() || new BigNumber(this.edtAmount.value).gt(0);
        },
        onApproving: async (token: ITokenObject, receipt?: string) => {
          this.isApproving = true;
          this.btnApprove.rightIcon.spin = true;
          this.btnApprove.rightIcon.visible = true;
          this.btnApprove.caption = `Approving ${token.symbol}`;
          this.btnSubmit.visible = false;
          if (receipt) {
            this.showTxStatusModal('success', receipt);
          }
        },
        onApproved: async (token: ITokenObject) => {
          this.btnApprove.rightIcon.visible = false;
          this.btnApprove.caption = 'Approve';
          this.isApproving = false;
          this.btnSubmit.visible = true;
          this.btnSubmit.enabled = true;
        },
        onApprovingError: async (token: ITokenObject, err: Error) => {
          this.showTxStatusModal('error', err);
          this.btnApprove.caption = 'Approve';
          this.btnApprove.rightIcon.visible = false;
        },
        onPaying: async (receipt?: string) => {
          if (receipt) {
            this.showTxStatusModal('success', receipt);
            this.btnSubmit.enabled = false;
            this.btnSubmit.rightIcon.visible = true;
          }
        },
        onPaid: async (receipt?: any) => {
          this.btnSubmit.caption = this.submitButtonCaption;
          this.btnSubmit.rightIcon.visible = false;
        },
        onPayingError: async (err: Error) => {
          this.showTxStatusModal('error', err);
        }
      });
      this.state.approvalModel.spenderAddress = this._entryContract;
    }
  }

  private updateContractAddress() {
    if (this.approvalModelAction) {
      if (!this._data.commissions || this._data.commissions.length == 0) {
        this._entryContract = this.contract;
      }
      else {
        this._entryContract = this.state.getProxyAddress();
      }
      this.state.approvalModel.spenderAddress = this._entryContract;
    }
  }

  private showTxStatusModal = (status: 'warning' | 'success' | 'error', content?: string | Error) => {
    if (!this.txStatusModal) return;
    let params: any = { status };
    if (status === 'success') {
      params.txtHash = content;
    } else {
      params.content = content;
    }
    this.txStatusModal.message = { ...params };
    this.txStatusModal.showModal();
  }

  private updateSubmitButton(submitting: boolean) {
    this.btnSubmit.rightIcon.spin = submitting;
    this.btnSubmit.rightIcon.visible = submitting;
  }

  private get submitButtonCaption() {
    return !this.state.isRpcWalletConnected() ? 'Switch Network' : 'Submit';
  }

  private onApprove() {
    this.showTxStatusModal('warning', 'Approving');
    this.approvalModelAction.doApproveAction(this.gemInfo.baseToken, Utils.toDecimals(this.edtAmount.value, this.gemInfo.baseToken.decimals).toFixed());
  }

  private async onQtyChanged() {
    const qty = Number(this.edtGemQty.value);
    const backerCoinAmount = this.getBackerCoinAmount(qty);
    const commissionFee = this.state.embedderCommissionFee;
    this.edtAmount.value = new BigNumber(qty).times(commissionFee).plus(qty).toFixed();
    const feeValue = this.isBuy ? Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
    const totalGemTokens = new BigNumber(qty).minus(new BigNumber(qty).times(feeValue));
    this.lbYouWillGet.caption = `${formatNumber(totalGemTokens)} ${this.gemInfo.name}`;
    this.btnApprove.enabled = new BigNumber(this.edtGemQty.value).gt(0);

    if (this.approvalModelAction && this.state.isRpcWalletConnected())
      this.approvalModelAction.checkAllowance(this.gemInfo.baseToken, backerCoinAmount.toString());
  }

  private async onAmountChanged() {
    const gemAmount = Number(this.edtAmount.value);
    this.backerTokenBalanceLb.caption = formatNumber(this.getBackerCoinAmount(gemAmount));
    const balance = await this.getBalance();
    this.btnSubmit.enabled = !this.state.isRpcWalletConnected() || balance.gt(0) && new BigNumber(this.edtAmount.value).gt(0) && new BigNumber(this.edtAmount.value).isLessThanOrEqualTo(balance);
  }

  private getBackerCoinAmount(gemAmount: number) {
    const redemptionFee = Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
    const price = Utils.fromDecimals(this.gemInfo.price).toFixed();
    const amount = new BigNumber(gemAmount);
    return amount.dividedBy(price).minus(amount.dividedBy(price).multipliedBy(redemptionFee));
  }

  // private getGemAmount(backerCoinAmount: number) {
  //   const mintingFee = Utils.fromDecimals(this.gemInfo.mintingFee).toFixed();
  //   const price = Utils.fromDecimals(this.gemInfo.price).toFixed();
  //   return (backerCoinAmount - (backerCoinAmount * Number(mintingFee))) * Number(price);
  // }

  private async getBalance(token?: ITokenObject) {
    let balance = new BigNumber(0);
    const tokenData = token || this.gemInfo.baseToken;
    if (this.isBuy && tokenData) {
      balance = await getTokenBalance(this.rpcWallet, tokenData);
    } else if (!this.isBuy && this.contract) {
      balance = await getGemBalance(this.state, this.contract);
      balance = Utils.fromDecimals(balance);
    }
    return balance;
  }

  private async doSubmitAction() {
    if (!this._data || !this.contract) return;
    this.updateSubmitButton(true);
    // if (!this.tokenElm.token) {
    //   this.showTxStatusModal('error', 'Token Required');
    //   this.updateSubmitButton(false);
    //   return;
    // }
    const balance = await this.getBalance();
    if (this._type === 'buy') {
      const qty = this.edtGemQty.value ? Number(this.edtGemQty.value) : 1;
      if (balance.lt(this.getBackerCoinAmount(qty))) {
        this.showTxStatusModal('error', `Insufficient ${this.tokenElm.token?.symbol || ''} Balance`);
        this.updateSubmitButton(false);
        return;
      }
      await this.onBuyToken(qty);
    } else {
      if (!this.edtAmount.value) {
        this.showTxStatusModal('error', 'Amount Required');
        this.updateSubmitButton(false);
        return;
      }
      if (balance.lt(this.edtAmount.value)) {
        this.showTxStatusModal('error', `Insufficient ${this.gemInfo.name} Balance`);
        this.updateSubmitButton(false);
        return;
      }
      await this.onRedeemToken();
    }
    this.updateSubmitButton(false);
  }

  private async onSubmit() {
    if (!this.state.isRpcWalletConnected()) {
      const chainId = this.chainId;
      const clientWallet = Wallet.getClientInstance();
      await clientWallet.switchNetwork(chainId);
      return;
    }
    if (this.isBuy) {
      this.showTxStatusModal('warning', 'Comfirming');
      this.approvalModelAction.doPayAction();
    } else {
      this.doSubmitAction();
    }
  }

  private onBuyToken = async (quantity: number) => {
    if (!this.gemInfo.name) return;
    const callback = (error: Error, receipt?: string) => {
      if (error) {
        this.showTxStatusModal('error', error);
      } else if (receipt) {
        this.showTxStatusModal('success', receipt);
      }
    };

    await buyToken(this.state, this.contract, quantity, this.gemInfo.baseToken, this._data.commissions, callback,
      async (result: any) => {
        this.edtGemQty.value = '';
        this.edtAmount.value = '';
        this.btnSubmit.enabled = false;
        await this.updateTokenBalance();
      }
    );
  }

  private onRedeemToken = async () => {
    if (!this.gemInfo.name) return;
    const callback = (error: Error, receipt?: string) => {
      if (error) {
        this.showTxStatusModal('error', error);
      } else if (receipt) {
        this.showTxStatusModal('success', receipt);
      }
    };
    const gemAmount = this.edtAmount.value;
    await redeemToken(this.contract, gemAmount, callback,
      async (result: any) => {
        this.lblBalance.caption = `${formatNumber(await this.getBalance())} ${this.tokenSymbol}`;
        this.edtAmount.value = '';
        this.backerTokenBalanceLb.caption = '0.00';
      }
    );
  }

  private async onSetMaxBalance() {
    this.edtAmount.value = (await this.getBalance()).toFixed(2);
    await this.onAmountChanged();
  }

  private async renderTokenInput() {
    if (!this.edtAmount.isConnected) await this.edtAmount.ready();
    if (!this.tokenElm.isConnected) await this.tokenElm.ready();
    this.edtAmount.readOnly = this.isBuy || !this.contract;
    this.edtAmount.value = "";
    if (this.isBuy) {
      if (this.tokenElm.rpcWalletId !== this.rpcWallet.instanceId) {
        this.tokenElm.rpcWalletId = this.rpcWallet.instanceId;
      }
      this.tokenElm.token = this.gemInfo.baseToken;
      this.tokenElm.visible = true;
      this.tokenElm.tokenReadOnly = !!this.contract;
      this.gemLogoStack.visible = false;
      this.maxStack.visible = false;
      this.gridTokenInput.templateColumns = ['60%', 'auto'];
    } else {
      this.tokenElm.visible = false;
      if (!this.gemLogoStack.isConnected) await this.gemLogoStack.ready();
      this.gemLogoStack.visible = true;
      this.gemLogoStack.clearInnerHTML();
      this.gemLogoStack.append(
        <i-image
          url={this.logo}
          class={imageStyle} width={30} height={30}
          fallbackUrl={assets.fullPath('img/gem-logo.png')}
        ></i-image>
      )
      if (!this.maxStack.isConnected) await this.maxStack.ready();
      this.maxStack.visible = !!this.contract;
      if (!this.gridTokenInput.isConnected) await this.gridTokenInput.ready();
      this.gridTokenInput.templateColumns = ['50px', 'auto', '100px'];
    }
  }

  async init() {
    this.isReadyCallbackQueued = true;
    super.init();
    const lazyLoad = this.getAttribute('lazyLoad', true, false);
    if (!lazyLoad) {
      const dappType = this.getAttribute('dappType', true);
      const description = this.getAttribute('description', true);
      const hideDescription = this.getAttribute('hideDescription', true);
      const logo = this.getAttribute('logo', true);
      const chainSpecificProperties = this.getAttribute('chainSpecificProperties', true);
      const networks = this.getAttribute('networks', true, []);
      const wallets = this.getAttribute('wallets', true, []);
      const showHeader = this.getAttribute('showHeader', true);
      const defaultChainId = this.getAttribute('defaultChainId', true, 1);
      await this.setData({
        dappType,
        description,
        hideDescription,
        logo,
        chainSpecificProperties,
        networks,
        wallets,
        showHeader,
        defaultChainId
      });
    }
    this.isReadyCallbackQueued = false;
    this.executeReadyCallback();
  }

  render() {
    return (
      <i-scom-dapp-container id="dappContainer">
        <i-panel background={{ color: Theme.background.main }}>
          <i-panel>
            <i-vstack id="loadingElm" class="i-loading-overlay" visible={false}>
              <i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
                <i-icon
                  class="i-loading-spinner_icon"
                  width={24} height={24}
                  name="spinner"
                  fill="#FD4A4C"
                ></i-icon>
                <i-label
                  caption="Deploying..." font={{ color: '#FD4A4C', size: '1.2em' }}
                  class="i-loading-spinner_text"
                ></i-label>
              </i-vstack>
            </i-vstack>
            <i-grid-layout
              id='gridDApp'
              width='100%'
              height='100%'
              templateColumns={['repeat(2, 1fr)']}
              padding={{ bottom: '1.563rem' }}
            >
              <i-vstack
                id="pnlDescription"
                padding={{ top: '0.5rem', bottom: '0.5rem', left: '5.25rem', right: '6.313rem' }}
                gap="0.813rem"
              >
                <i-hstack>
                  <i-image id='imgLogo' class={imageStyle} height={100}></i-image>
                </i-hstack>
                <i-label id="lblTitle" font={{ bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' }}></i-label>
                <i-markdown
                  id='markdownViewer'
                  class={markdownStyle}
                  width='100%'
                  height='100%'
                  font={{ size: '1rem' }}
                ></i-markdown>
              </i-vstack>
              <i-vstack
                gap="0.5rem"
                padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                verticalAlignment='space-between'
              >
                <i-vstack horizontalAlignment='center' id="pnlLogoTitle" gap='0.5rem'>
                  <i-image id='imgLogo2' class={imageStyle} height={100}></i-image>
                  <i-label id="lblTitle2" font={{ bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' }}></i-label>
                </i-vstack>
                <i-label id="lbPrice" caption="Price" font={{ size: '1rem' }} opacity={0.6}></i-label>
                <i-hstack id="hStackTokens" gap="4px" class={centerStyle} margin={{ bottom: '1rem' }}>
                  <i-label id="fromTokenLb" font={{ bold: true, size: '1.5rem' }}></i-label>
                  <i-label caption="=" font={{ bold: true, size: '1.5rem' }}></i-label>
                  <i-label id="toTokenLb" font={{ bold: true, size: '1.5rem' }}></i-label>
                </i-hstack>
                <i-vstack gap="0.5rem" id='pnlInputFields'>
                  <i-grid-layout
                    id="balanceLayout"
                    gap={{ column: '0.5rem', row: '0.25rem' }}
                  >
                    <i-hstack id='pnlQty' horizontalAlignment='end' verticalAlignment='center' gap="0.5rem" grid={{ area: 'qty' }}>
                      <i-label
                        caption='Qty'
                        font={{ size: '1rem', bold: true }}
                        opacity={0.6}
                      ></i-label>
                      <i-input
                        id='edtGemQty'
                        value={1}
                        onChanged={this.onQtyChanged}
                        class={inputStyle}
                        inputType='number'
                        font={{ size: '1rem', bold: true }}
                        border={{ radius: 4, style: 'solid', width: '1px', color: Theme.divider }}
                      ></i-input>
                    </i-hstack>
                    <i-hstack
                      horizontalAlignment="space-between"
                      verticalAlignment='center'
                      gap="0.5rem"
                      grid={{ area: 'balance' }}
                    >
                      <i-hstack verticalAlignment='center' gap="0.5rem">
                        <i-label id="lbOrderTotalTitle" caption='Total' font={{ size: '1rem' }}></i-label>
                        <i-icon id="iconOrderTotal" name="question-circle" fill={Theme.text.primary} width={20} height={20} opacity={0.6}></i-icon>
                      </i-hstack>
                      <i-hstack verticalAlignment='center' gap="0.5rem">
                        <i-label caption='Balance:' font={{ size: '1rem' }} opacity={0.6}></i-label>
                        <i-label id='lblBalance' font={{ size: '1rem' }} opacity={0.6}></i-label>
                      </i-hstack>
                    </i-hstack>
                    <i-grid-layout
                      id='gridTokenInput'
                      verticalAlignment="center"
                      templateColumns={['60%', 'auto']}
                      border={{ radius: 16 }} overflow="hidden"
                      background={{ color: Theme.input.background }}
                      font={{ color: Theme.input.fontColor }}
                      height={56} width="50%"
                      margin={{ left: 'auto', right: 'auto', top: '1rem' }}
                      grid={{ area: 'tokenInput' }}
                    >
                      <i-panel id="gemLogoStack" padding={{ left: 10 }} visible={false} />
                      <i-scom-token-input
                        id="tokenElm"
                        isBalanceShown={false}
                        isBtnMaxShown={false}
                        isCommonShown={false}
                        isInputShown={false}
                        isSortBalanceShown={false}
                        class={tokenSelectionStyle}
                        width="100%"
                      />
                      <i-input
                        id="edtAmount"
                        width='100%'
                        height='100%'
                        minHeight={40}
                        border={{ style: 'none' }}
                        class={inputStyle}
                        inputType='number'
                        font={{ size: '1.25rem' }}
                        opacity={0.3}
                        onChanged={this.onAmountChanged}
                      ></i-input>
                      <i-hstack id="maxStack" horizontalAlignment="end" visible={false}>
                        <i-button
                          caption="Max"
                          padding={{ top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }}
                          margin={{ right: 10 }}
                          font={{ size: '0.875rem', color: Theme.colors.primary.contrastText }}
                          onClick={() => this.onSetMaxBalance()}
                        />
                      </i-hstack>
                    </i-grid-layout>
                    <i-hstack
                      id="backerStack"
                      horizontalAlignment="space-between"
                      verticalAlignment="center"
                      grid={{ area: 'redeem' }}
                      margin={{ top: '1rem', bottom: '1rem' }}
                      maxWidth="50%"
                      visible={false}
                    >
                      <i-label caption='You get:' font={{ size: '1rem' }}></i-label>
                      <i-image id="backerTokenImg" width={20} height={20} fallbackUrl={tokenAssets.tokenPath()}></i-image>
                      <i-label id="backerTokenBalanceLb" caption='0.00' font={{ size: '1rem' }}></i-label>
                    </i-hstack>
                  </i-grid-layout>
                  <i-vstack
                    horizontalAlignment="center" verticalAlignment='center'
                    gap="8px"
                    width="50%"
                    margin={{ left: 'auto', right: 'auto', bottom: '1.313rem' }}
                  >
                    <i-button
                      id="btnApprove"
                      minWidth='100%'
                      caption="Approve"
                      padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                      font={{ size: '1rem', color: Theme.colors.primary.contrastText, bold: true }}
                      rightIcon={{ visible: false, fill: Theme.colors.primary.contrastText }}
                      border={{ radius: 12 }}
                      visible={false}
                      onClick={this.onApprove}
                    ></i-button>
                    <i-button
                      id='btnSubmit'
                      width='100%'
                      caption='Submit'
                      padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                      font={{ size: '1rem', color: Theme.colors.primary.contrastText, bold: true }}
                      background={{ color: Theme.colors.primary.main }}
                      rightIcon={{ visible: false, fill: Theme.colors.primary.contrastText }}
                      border={{ radius: 12 }}
                      onClick={this.onSubmit}
                      enabled={false}
                    ></i-button>
                  </i-vstack>
                  <i-hstack horizontalAlignment="space-between" verticalAlignment="center" gap="0.5rem">
                    <i-hstack horizontalAlignment="end" verticalAlignment="center" gap={4}>
                      <i-label caption="Transaction Fee" font={{ size: '1rem', bold: true }} opacity={0.6}></i-label>
                      <i-icon
                        id="feeTooltip"
                        name="question-circle"
                        opacity={0.6}
                        fill={Theme.text.primary}
                        width={14} height={14}
                      ></i-icon>
                    </i-hstack>
                    <i-label id="feeLb" font={{ size: '1rem', bold: true }} opacity={0.6} caption="0"></i-label>
                  </i-hstack>
                  <i-hstack horizontalAlignment="space-between" verticalAlignment="center" gap="0.5rem">
                    <i-label caption="You will get" font={{ size: '1rem', bold: true }} opacity={0.6}></i-label>
                    <i-label id="lbYouWillGet" font={{ size: '1rem', bold: true }} opacity={0.6} caption="0"></i-label>
                  </i-hstack>
                  {/* <i-label
                    caption='Terms & Condition'
                    font={{ size: '0.75rem' }}
                    link={{ href: 'https://docs.scom.dev/' }}
                  ></i-label> */}
                </i-vstack>
                <i-vstack id='pnlUnsupportedNetwork' visible={false} horizontalAlignment='center'>
                  <i-label caption='This network is not supported.' font={{ size: '1.5rem' }}></i-label>
                </i-vstack>
              </i-vstack>
            </i-grid-layout>
          </i-panel>
          <i-scom-tx-status-modal id="txStatusModal" />
        </i-panel>
      </i-scom-dapp-container>
    )
  }
}