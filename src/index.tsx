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
  IEventBus,
  application,
  Panel,
  Icon,
  VStack,
  IDataSchema,
  ControlElement
} from '@ijstech/components';
import { BigNumber, INetwork, Utils, Wallet } from '@ijstech/eth-wallet';
import { IEmbedData, ITokenObject, PageBlock, DappType, IGemInfo, IChainSpecificProperties, IWalletPlugin } from './interface';
import { getERC20ApprovalModelAction, getTokenBalance, IERC20ApprovalAction, parseContractError } from './utils/index';
import { EventId, getEmbedderCommissionFee, getContractAddress, setDataFromSCConfig, SupportedNetworks } from './store/index';
import { getChainId, isWalletConnected } from './wallet/index';
import Config from './config/index';
import { assets as tokenAssets } from '@scom/scom-token-list';
import assets from './assets';
import { TokenSelection } from './token-selection/index';
import { imageStyle, inputStyle, markdownStyle, tokenSelectionStyle, centerStyle } from './index.css';
import { Alert } from './alert/index';
import { deployContract, buyToken, redeemToken, getGemBalance, getGemInfo } from './API';
import scconfig from './scconfig.json';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomDappContainer from '@scom/scom-dapp-container';

const Theme = Styles.Theme.ThemeVars;
const buyTooltip = 'The fee the project owner will receive for token minting';
const redeemTooltip = 'The spread the project owner will receive for redemptions';

interface ScomGemTokenElement extends ControlElement {
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
export default class ScomGemToken extends Module implements PageBlock {
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
  private tokenElm: TokenSelection;
  private edtAmount: Input;
  private configDApp: Config;
  private mdAlert: Alert;
  private balanceLayout: GridLayout;
  private backerStack: Panel;
  private backerTokenImg: Image;
  private backerTokenBalanceLb: Label;
  private gridTokenInput: GridLayout;
  private gemLogoStack: Panel;
  private maxStack: Panel;
  private loadingElm: Panel;
  private pnlDescription: VStack;
  private lbOrderTotal: Label;
  // private networkPicker: ScomNetworkPicker;
  private pnlInputFields: VStack;
  private pnlUnsupportedNetwork: VStack;
  private dappContainer: ScomDappContainer;

  private _type: DappType | undefined;
  private _entryContract: string;
  private _oldData: IEmbedData = {
    wallets: [],
    networks: [],
    defaultChainId: 0
  };
  private _data: IEmbedData = {
    wallets: [],
    networks: [],
    defaultChainId: 0
  };
  private $eventBus: IEventBus;
  private approvalModelAction: IERC20ApprovalAction;
  private isApproving: boolean = false;
  private gemInfo: IGemInfo;

  tag: any = {}
  private oldTag: any = {};
  defaultEdit: boolean = true;
  readonly onConfirm: () => Promise<void>;
  readonly onDiscard: () => Promise<void>;
  readonly onEdit: () => Promise<void>;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    if (scconfig) {
      setDataFromSCConfig(scconfig);
    }
    this.$eventBus = application.EventBus;
    this.registerEvent();
  }

  static async create(options?: ScomGemTokenElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  private registerEvent() {
    this.$eventBus.register(this, EventId.IsWalletConnected, () => this.onWalletConnect(true));
    this.$eventBus.register(this, EventId.IsWalletDisconnected, () => this.onWalletConnect(false));
    this.$eventBus.register(this, EventId.chainChanged, this.onChainChanged);
  }

  onWalletConnect = async (connected: boolean) => {
    let chainId = getChainId();
    if (connected && !chainId) {
      this.onSetupPage(true);
    } else {
      this.onSetupPage(connected);
    }
    if (connected) {
      this.updateContractAddress();
      this.refreshDApp();
    }
    else this.lblBalance.caption = '0.00';
  }

  onChainChanged = async () => {
    this.onSetupPage(true);
    this.updateContractAddress();
    this.refreshDApp();
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
      this.lblBalance.caption = token ? `${(await getTokenBalance(token)).toFixed(2)} ${symbol}` : `0 ${symbol}`;
    } catch { }
  }

  private async onSetupPage(isWalletConnected: boolean) {
    // if (isWalletConnected)
    //   this.networkPicker.setNetworkByChainId(getChainId());
    await this.initApprovalAction();
  }

  getEmbedderActions() {
    const propertiesSchema: IDataSchema = {
      type: 'object',
      properties: {
      }
    }
    if (!this._data.hideDescription) {
      propertiesSchema.properties['description'] = {
        type: 'string',
        format: 'multi'
      };
    }
    const themeSchema: IDataSchema = {
      type: 'object',
      properties: {
        backgroundColor: {
          type: 'string',
          format: 'color',
          readOnly: true
        },
        fontColor: {
          type: 'string',
          format: 'color',
          readOnly: true
        },
        inputBackgroundColor: {
          type: 'string',
          format: 'color',
          readOnly: true
        },
        inputFontColor: {
          type: 'string',
          format: 'color',
          readOnly: true
        },
        buttonBackgroundColor: {
          type: 'string',
          format: 'color',
          readOnly: true
        }
      }
    };
    return this._getActions(propertiesSchema, themeSchema);
  }

  getActions() {
    const propertiesSchema: IDataSchema = {
      type: 'object',
      properties: {
        "contract": {
          type: 'string'
        }
      }
    }
    if (!this._data.hideDescription) {
      propertiesSchema.properties['description'] = {
        type: 'string',
        format: 'multi'
      };
    }
    const themeSchema: IDataSchema = {
      type: 'object',
      properties: {
        backgroundColor: {
          type: 'string',
          format: 'color'
        },
        fontColor: {
          type: 'string',
          format: 'color'
        },
        inputBackgroundColor: {
          type: 'string',
          format: 'color'
        },
        inputFontColor: {
          type: 'string',
          format: 'color'
        },
        buttonBackgroundColor: {
          type: 'string',
          format: 'color'
        }
      }
    };
    return this._getActions(propertiesSchema, themeSchema);
  }

  _getActions(propertiesSchema: IDataSchema, themeSchema: IDataSchema) {
    const actions = [
      {
        name: 'Settings',
        icon: 'cog',
        command: (builder: any, userInputData: any) => {
          return {
            execute: async () => {
              this._oldData = { ...this._data };
              if (userInputData.dappType != undefined) this._data.dappType = userInputData.dappType;
              if (userInputData.logo != undefined) this._data.logo = userInputData.logo;
              if (userInputData.description != undefined) this._data.description = userInputData.description;
              this.configDApp.data = this._data;
              this.refreshDApp();
              if (builder?.setData) builder.setData(this._data);
            },
            undo: async () => {
              this._data = { ...this._oldData };
              this.configDApp.data = this._data;
              this.refreshDApp();
              if (builder?.setData) builder.setData(this._data);
            },
            redo: () => { }
          }
        },
        userInputDataSchema: propertiesSchema
      },
      {
        name: 'Theme Settings',
        icon: 'palette',
        command: (builder: any, userInputData: any) => {
          return {
            execute: async () => {
              if (!userInputData) return;
              this.oldTag = { ...this.tag };
              if (builder) builder.setTag(userInputData);
              else this.setTag(userInputData);
            },
            undo: () => {
              if (!userInputData) return;
              this.tag = { ...this.oldTag };
              if (builder) builder.setTag(this.tag);
              else this.setTag(this.oldTag);
            },
            redo: () => { }
          }
        },
        userInputDataSchema: themeSchema
      }
    ]
    return actions
  }

  getConfigurators() {
    let self = this;
    return [
      {
        name: 'Commissions',
        target: 'Embedders',
        elementName: 'i-scom-gem-token-config',
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
        bindOnChanged: (element: Config, callback: (data: any) => Promise<void>) => {
          element.onCustomCommissionsChanged = async (data: any) => {
            let resultingData = {
              ...self._data,
              ...data
            };
            await self.setData(resultingData);
            await callback(data);
          }
        }
      }
    ]
  }

  getData() {
    return this._data;
  }

  async setData(data: IEmbedData) {
    this._data = data;
    this.configDApp.data = data;
    const commissionFee = getEmbedderCommissionFee();
    this.lbOrderTotal.caption = `Total (+${new BigNumber(commissionFee).times(100)}% Commission Fee)`;
    this.updateContractAddress();
    this.refreshDApp();
  }

  getTag() {
    return this.tag;
  }

  async setTag(value: any) {
    const newValue = value || {};
    for (let prop in newValue) {
      if (newValue.hasOwnProperty(prop))
        this.tag[prop] = newValue[prop];
    }
    this.updateTheme();
  }

  private updateStyle(name: string, value: any) {
    value ?
      this.style.setProperty(name, value) :
      this.style.removeProperty(name);
  }

  private updateTheme() {
    this.updateStyle('--text-primary', this.tag?.fontColor);
    this.updateStyle('--background-main', this.tag?.backgroundColor);
    this.updateStyle('--input-font_color', this.tag?.inputFontColor);
    this.updateStyle('--input-background', this.tag?.inputBackgroundColor);
    this.updateStyle('--colors-primary-main', this.tag?.buttonBackgroundColor);
  }

  async confirm() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (this.loadingElm) this.loadingElm.visible = true;
        await this.onDeploy((error: Error, receipt?: string) => {
          if (error) {
            this.mdAlert.message = {
              status: 'error',
              content: parseContractError(error)
            };
            this.mdAlert.showModal();
            reject(error);
          }
        }, (receipt: any) => {
          this.refreshDApp();
        });
      } catch (error) {
        this.mdAlert.message = {
          status: 'error',
          content: parseContractError(error)
        };
        this.mdAlert.showModal();
        reject(error);
      }
      if (!this.contract && !this._data)
        reject(new Error('Data missing'));
      resolve();
      if (this.loadingElm) this.loadingElm.visible = false;
    })
  }

  private onDeploy = async (callback?: any, confirmationCallback?: any) => {
    if (this.contract || !this.gemInfo.name) return;
    const params = {
      name: this.gemInfo.name,
      symbol: this.gemInfo.symbol,
      cap: this.gemInfo.cap.toFixed(),
      price: this.gemInfo.price.toFixed(),
      mintingFee: this.gemInfo.mintingFee.toFixed(),
      redemptionFee: this.gemInfo.redemptionFee.toFixed()
    }
    const result = await deployContract(
      params,
      this.gemInfo.baseToken,
      callback,
      confirmationCallback
    );
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
    this.imgLogo.url = this.imgLogo2.url = this._data.logo || assets.fullPath('img/gem-logo.png');
    const data: any = {
      wallets: this.wallets,
      networks: this.networks,
      showHeader: this.showHeader,
      defaultChainId: this.defaultChainId
    }
    if (this.dappContainer?.setData) this.dappContainer.setData(data)
    this.gemInfo = this.contract ? await getGemInfo(this.contract) : null;
    console.log('this.gemInfo', this.gemInfo);
    if (this.gemInfo) {
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
      this.lblTitle.caption = this.lblTitle2.caption = `${this.isBuy ? 'Buy' : 'Redeem'} ${this.gemInfo.name || ''} - GEM Tokens`;
      this.backerStack.visible = !this.isBuy;
      this.pnlQty.visible = this.isBuy;
      this.balanceLayout.templateAreas = [['qty'], ['balance'], ['tokenInput'], ['redeem']];
      if (!this.edtGemQty.isConnected) await this.edtGemQty.ready();
      this.edtGemQty.readOnly = !this.contract;
      this.edtGemQty.value = "";
      if (!this.isBuy) {
        this.btnSubmit.enabled = false;
        this.btnApprove.visible = false;
        this.backerTokenImg.url = tokenAssets.tokenPath(this.gemInfo.baseToken, getChainId());
        if (!this.backerTokenBalanceLb.isConnected) await this.backerTokenBalanceLb.ready();
        this.backerTokenBalanceLb.caption = '0.00';
      }
      const feeValue = this.isBuy ? Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
      if (!this.feeLb.isConnected) await this.feeLb.ready();
      this.feeLb.caption = `${feeValue || ''} ${this.gemInfo.name}`;
      const qty = Number(this.edtGemQty.value);
      const totalGemTokens = new BigNumber(qty).minus(new BigNumber(qty).times(feeValue)).toFixed();
      if (!this.lbYouWillGet.isConnected) await this.lbYouWillGet.ready();
      this.lbYouWillGet.caption = `${totalGemTokens} ${this.gemInfo.name}`;
      this.feeTooltip.tooltip.content = this.isBuy ? buyTooltip : redeemTooltip;
      if (!this.lblBalance.isConnected) await this.lblBalance.ready();
      this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
      this.updateTokenBalance();
    }
    else {
      this.pnlInputFields.visible = false;
      this.pnlUnsupportedNetwork.visible = true;
    }
  }

  async init() {
    this.isReadyCallbackQueued = true;
    super.init();
    await this.onSetupPage(isWalletConnected());
    this._data.dappType = this.getAttribute('dappType', true);
    this._data.description = this.getAttribute('description', true);
    this._data.hideDescription = this.getAttribute('hideDescription', true);
    this._data.logo = this.getAttribute('logo', true);
    this._data.chainSpecificProperties = this.getAttribute('chainSpecificProperties', true);
    this._data.networks = this.getAttribute('networks', true);
    this._data.wallets = this.getAttribute('wallets', true);
    this._data.showHeader = this.getAttribute('showHeader', true);
    this._data.defaultChainId = this.getAttribute('defaultChainId', true);

    if (this.configDApp) this.configDApp.data = this._data;
    this.updateContractAddress();
    await this.refreshDApp();
    this.isReadyCallbackQueued = false;
    this.executeReadyCallback();
  }

  get contract() {
    return this._data.chainSpecificProperties?.[getChainId()]?.contract ?? '';
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
      this._entryContract = getContractAddress('Proxy');
      this.approvalModelAction = getERC20ApprovalModelAction(this._entryContract, {
        sender: this,
        payAction: async () => {
          await this.doSubmitAction();
        },
        onToBeApproved: async (token: ITokenObject) => {
          this.btnApprove.visible = true;
          this.btnSubmit.enabled = false;
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
          this.btnSubmit.enabled = new BigNumber(this.edtAmount.value).gt(0);
        },
        onApproving: async (token: ITokenObject, receipt?: string) => {
          this.isApproving = true;
          this.btnApprove.rightIcon.spin = true;
          this.btnApprove.rightIcon.visible = true;
          this.btnApprove.caption = `Approving ${token.symbol}`;
          this.btnSubmit.visible = false;
          if (receipt) {
            this.mdAlert.message = {
              status: 'success',
              content: receipt
            };
            this.mdAlert.showModal();
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
          this.mdAlert.message = {
            status: 'error',
            content: err.message
          };
          this.mdAlert.showModal();
          this.btnApprove.caption = 'Approve';
          this.btnApprove.rightIcon.visible = false;
        },
        onPaying: async (receipt?: string) => {
          if (receipt) {
            this.mdAlert.message = {
              status: 'success',
              content: receipt
            };
            this.mdAlert.showModal();
            this.btnSubmit.enabled = false;
            this.btnSubmit.rightIcon.visible = true;
          }
        },
        onPaid: async (receipt?: any) => {
          this.btnSubmit.rightIcon.visible = false;
        },
        onPayingError: async (err: Error) => {
          this.mdAlert.message = {
            status: 'error',
            content: err.message
          };
          this.mdAlert.showModal();
        }
      });
    }
  }

  updateContractAddress() {
    if (this.approvalModelAction) {
      if (!this._data.commissions || this._data.commissions.length == 0) {
        this._entryContract = this.contract;
      }
      else {
        this._entryContract = getContractAddress('Proxy');
      }
      this.approvalModelAction.setSpenderAddress(this._entryContract);
    }
  }

  private updateSubmitButton(submitting: boolean) {
    this.btnSubmit.rightIcon.spin = submitting;
    this.btnSubmit.rightIcon.visible = submitting;
  }

  private onApprove() {
    this.mdAlert.message = {
      status: 'warning',
      content: 'Approving'
    };
    this.mdAlert.showModal();
    this.approvalModelAction.doApproveAction(this.gemInfo.baseToken, this.edtAmount.value);
  }

  private async onQtyChanged() {
    const qty = Number(this.edtGemQty.value);
    const backerCoinAmount = this.getBackerCoinAmount(qty);
    const commissionFee = getEmbedderCommissionFee();
    this.edtAmount.value = new BigNumber(qty).times(commissionFee).plus(qty).toFixed();
    const feeValue = this.isBuy ? Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
    const totalGemTokens = new BigNumber(qty).minus(new BigNumber(qty).times(feeValue)).toFixed();
    this.lbYouWillGet.caption = `${totalGemTokens} ${this.gemInfo.name}`;
    this.btnApprove.enabled = new BigNumber(this.edtGemQty.value).gt(0);

    if (this.approvalModelAction)
      this.approvalModelAction.checkAllowance(this.gemInfo.baseToken, Utils.toDecimals(backerCoinAmount, this.gemInfo.baseToken.decimals).toFixed());
  }

  private async onAmountChanged() {
    const gemAmount = Number(this.edtAmount.value);
    this.backerTokenBalanceLb.caption = this.getBackerCoinAmount(gemAmount).toFixed(2);
    const balance = await this.getBalance();
    this.btnSubmit.enabled = balance.gt(0) && new BigNumber(this.edtAmount.value).gt(0) && new BigNumber(this.edtAmount.value).isLessThanOrEqualTo(balance);
  }

  private getBackerCoinAmount(gemAmount: number) {
    const redemptionFee = Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
    const price = Utils.fromDecimals(this.gemInfo.price).toFixed();
    return gemAmount / Number(price) - (gemAmount / Number(price) * Number(redemptionFee));
  }

  private getGemAmount(backerCoinAmount: number) {
    const mintingFee = Utils.fromDecimals(this.gemInfo.mintingFee).toFixed();
    const price = Utils.fromDecimals(this.gemInfo.price).toFixed();
    return (backerCoinAmount - (backerCoinAmount * Number(mintingFee))) * Number(price);
  }

  private async getBalance(token?: ITokenObject) {
    let balance = new BigNumber(0);
    const tokenData = token || this.gemInfo.baseToken;
    if (this.isBuy && tokenData) {
      balance = await getTokenBalance(tokenData);
    } else if (!this.isBuy && this.contract) {
      balance = await getGemBalance(this.contract);
      balance = Utils.fromDecimals(balance);
    }
    return balance;
  }

  private async doSubmitAction() {
    if (!this._data || !this.contract) return;
    this.updateSubmitButton(true);
    // if (!this.tokenElm.token) {
    //   this.mdAlert.message = {
    //     status: 'error',
    //     content: 'Token Required'
    //   };
    //   this.mdAlert.showModal();
    //   this.updateSubmitButton(false);
    //   return;
    // }
    const balance = await this.getBalance();
    if (this._type === 'buy') {
      const qty = this.edtGemQty.value ? Number(this.edtGemQty.value) : 1;
      if (balance.lt(this.getBackerCoinAmount(qty))) {
        this.mdAlert.message = {
          status: 'error',
          content: `Insufficient ${this.tokenElm.token.symbol} Balance`
        };
        this.mdAlert.showModal();
        this.updateSubmitButton(false);
        return;
      }
      await this.onBuyToken(qty);
    } else {
      if (!this.edtAmount.value) {
        this.mdAlert.message = {
          status: 'error',
          content: 'Amount Required'
        };
        this.mdAlert.showModal();
        this.updateSubmitButton(false);
        return;
      }
      if (balance.lt(this.edtAmount.value)) {
        this.mdAlert.message = {
          status: 'error',
          content: `Insufficient ${this.gemInfo.name} Balance`
        };
        this.mdAlert.showModal();
        this.updateSubmitButton(false);
        return;
      }
      await this.onRedeemToken();
    }
    this.updateSubmitButton(false);
  }

  private async onSubmit() {
    if (this.isBuy) {
      this.mdAlert.message = {
        status: 'warning',
        content: 'Confirming'
      };
      this.mdAlert.showModal();
      this.approvalModelAction.doPayAction();
    } else {
      this.doSubmitAction();
    }
  }

  onBuyToken = async (quantity: number) => {
    this.mdAlert.closeModal();
    if (!this.gemInfo.name) return;
    const callback = (error: Error, receipt?: string) => {
      if (error) {
        this.mdAlert.message = {
          status: 'error',
          content: parseContractError(error)
        };
        this.mdAlert.showModal();
      }
    };

    await buyToken(this.contract, quantity, this.gemInfo.baseToken, this._data.commissions, callback,
      async (result: any) => {
        console.log('buyToken: ', result);
        this.edtGemQty.value = '';
        this.edtAmount.value = '';
        this.btnSubmit.enabled = false;
        await this.updateTokenBalance();
      }
    );
  }

  onRedeemToken = async () => {
    this.mdAlert.closeModal();
    if (!this.gemInfo.name) return;
    const callback = (error: Error, receipt?: string) => {
      if (error) {
        this.mdAlert.message = {
          status: 'error',
          content: parseContractError(error)
        };
        this.mdAlert.showModal();
      }
    };
    const gemAmount = this.edtAmount.value;
    await redeemToken(this.contract, gemAmount, callback,
      async (result: any) => {
        console.log('redeemToken: ', result);
        this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
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
    this.edtAmount.readOnly = this.isBuy || !this.contract;
    this.edtAmount.value = "";
    if (this.isBuy) {
      this.tokenElm.token = this.gemInfo.baseToken;
      this.tokenElm.visible = true;
      this.tokenElm.readonly = !!this.contract;
      this.gemLogoStack.visible = false;
      this.maxStack.visible = false;
      this.gridTokenInput.templateColumns = ['60%', 'auto'];
    } else {
      this.tokenElm.visible = false;
      this.gemLogoStack.visible = true;
      this.gemLogoStack.clearInnerHTML();
      this.gemLogoStack.append(
        <i-image
          url={this._data.logo}
          class={imageStyle} width={30} height={30}
          fallbackUrl={assets.fullPath('img/gem-logo.png')}
        ></i-image>
      )
      this.maxStack.visible = !!this.contract;
      this.gridTokenInput.templateColumns = ['50px', 'auto', '100px'];
    }
  }

  private onNetworkSelected(network: INetwork) {
    console.log('network selected', network);
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
                padding={{ top: '1rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                verticalAlignment='space-between'
              >
                <i-vstack horizontalAlignment='center' id="pnlLogoTitle" gap='0.5rem'>
                  <i-image id='imgLogo2' class={imageStyle} height={100}></i-image>
                  <i-label id="lblTitle2" font={{ bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' }}></i-label>
                </i-vstack>
                <i-label caption="Price" font={{ size: '1rem' }} opacity={0.6}></i-label>
                <i-hstack gap="4px" class={centerStyle} margin={{ bottom: '1rem' }}>
                  <i-label id="fromTokenLb" font={{ bold: true, size: '1.5rem' }}></i-label>
                  <i-label caption="=" font={{ bold: true, size: '1.5rem' }}></i-label>
                  <i-label id="toTokenLb" font={{ bold: true, size: '1.5rem' }}></i-label>
                </i-hstack>
                {/* <i-grid-layout
                  width='100%'
                  verticalAlignment='center'
                  padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                  templateColumns={['1fr', '2fr']}
                  templateRows={['auto']}
                  templateAreas={
                    [
                      ['lbNetwork', 'network']
                    ]
                  }>
                  <i-label caption="Network" grid={{ area: 'lbNetwork' }} font={{ size: '0.875rem' }} />
                  <i-scom-network-picker
                    id='networkPicker'
                    type="combobox"
                    grid={{ area: 'network' }}
                    networks={SupportedNetworks}
                    switchNetworkOnSelect={true}
                    selectedChainId={getChainId()}
                    onCustomNetworkSelected={this.onNetworkSelected}
                  />
                </i-grid-layout> */}
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
                        onChanged={this.onQtyChanged.bind(this)}
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
                      <i-label id="lbOrderTotal" caption='Total' font={{ size: '1rem' }}></i-label>
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
                      margin={{left: 'auto', right: 'auto', top: '1rem'}}
                      grid={{ area: 'tokenInput' }}
                    >
                      <i-panel id="gemLogoStack" padding={{ left: 10 }} visible={false} />
                      <i-scom-gem-token-selection
                        id="tokenElm"
                        class={tokenSelectionStyle}
                        width="100%"
                      ></i-scom-gem-token-selection>
                      <i-input
                        id="edtAmount"
                        width='100%'
                        height='100%'
                        minHeight={40}
                        border={{style: 'none'}}
                        class={inputStyle}
                        inputType='number'
                        font={{ size: '1.25rem' }}
                        opacity={0.3}
                        onChanged={this.onAmountChanged.bind(this)}
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
                    margin={{left: 'auto', right: 'auto', bottom: '1.313rem'}}
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
                      onClick={this.onApprove.bind(this)}
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
                      onClick={this.onSubmit.bind(this)}
                      enabled={false}
                    ></i-button>
                  </i-vstack>
                  <i-hstack horizontalAlignment="space-between" verticalAlignment="center" gap="0.5rem">
                    <i-hstack horizontalAlignment="end" verticalAlignment="center" gap={4}>
                      <i-label caption="Transaction Fee" font={{ size: '1rem', bold: true }} opacity={0.6}></i-label>
                      <i-icon
                        id="feeTooltip"
                        name="question-circle"
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
          <i-scom-gem-token-config id='configDApp' visible={false}></i-scom-gem-token-config>
          <i-scom-gem-token-alert id='mdAlert'></i-scom-gem-token-alert>
        </i-panel>
      </i-scom-dapp-container>
    )
  }
}