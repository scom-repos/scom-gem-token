import {
  Module,
  customModule,
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
  VStack
} from '@ijstech/components';
import { BigNumber, Utils, WalletPlugin } from '@ijstech/eth-wallet';
import { IConfig, ITokenObject, PageBlock, DappType } from '@pageblock-gem-token/interface';
import { getERC20ApprovalModelAction, getTokenBalance, IERC20ApprovalAction, parseContractError } from '@pageblock-gem-token/utils';
import { EventId, getTokenList, setDataFromSCConfig } from '@pageblock-gem-token/store';
import { connectWallet, getChainId, hasWallet, isWalletConnected } from '@pageblock-gem-token/wallet';
import Config from '@pageblock-gem-token/config';
import { TokenSelection } from '@pageblock-gem-token/token-selection';
import { imageStyle, inputStyle, markdownStyle, tokenSelectionStyle, centerStyle } from './index.css';
import { Alert } from '@pageblock-gem-token/alert';
import assets from '@pageblock-gem-token/assets';
import { deployContract, buyToken, redeemToken, getGemBalance, transfer } from './API';

const Theme = Styles.Theme.ThemeVars;
const buyTooltip = 'The fee the project owner will receive for token minting';
const redeemTooltip = 'The spread the project owner will receive for redemptions';

@customModule
export default class Main extends Module implements PageBlock {
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
  private lbTotal: Label;
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

  private _type: DappType | undefined;
  private _contract: string | undefined;
  private _oldData: IConfig = {};
  private _data: IConfig = {
    name: '',
    symbol: '',
    cap: '',
    redemptionFee: '',
    price: '',
    mintingFee: ''
  };
  private $eventBus: IEventBus;
  private approvalModelAction: IERC20ApprovalAction;
  private isApproving: boolean = false;

  tag: any = {}
  private oldTag: any = {};
  defaultEdit: boolean = true;
  readonly onConfirm: () => Promise<void>;
  readonly onDiscard: () => Promise<void>;
  readonly onEdit: () => Promise<void>;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    if (options) {
      setDataFromSCConfig(options);
    }
    this.$eventBus = application.EventBus;
    this.registerEvent();
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
    if (connected)
      await this.updateTokenBalance();
  }

  onChainChanged = async () => {
    this.onSetupPage(true);
    await this.updateTokenBalance();
    if (this.tokenElm)
      this.tokenElm.token = undefined;
  }

  private get isBuy() {
    return this._data.dappType === 'buy';
  }

  private get tokenSymbol() {
    return this._data?.token?.symbol || '';
  }
  
  private updateTokenBalance = async () => {
    if (!this._data.token) return;
    let chainId = getChainId();
    const _tokenList = getTokenList(chainId);
    const token = _tokenList.find(t => (t.address && t.address == this._data.token?.address) || (t.symbol == this.tokenSymbol))
    const symbol = token?.symbol || '';
    this.lblBalance.caption = `${(await this.getBalance(token)).toFixed(2)} ${symbol}`;
  }

  private async onSetupPage(isWalletConnected: boolean) {
    if (isWalletConnected)
      await this.initApprovalAction();
  }

  getActions() {
    const userInputDataSchema = {
      type: 'object',
      properties: {         
        "contract": {
          type: 'string'
        }            
      }
    }
    if (!this._data.hideDescription) {
      userInputDataSchema.properties['description'] = {
        type: 'string',
        format: 'multi'
      };     
    }
    const actions = [
      {
        name: 'Settings',
        icon: 'cog',
        command: (builder: any, userInputData: any) => {
          return {
            execute: async () => {
              this._oldData = {...this._data};
              if (userInputData.name != undefined) this._data.name = userInputData.name;
              if (userInputData.symbol != undefined) this._data.symbol = userInputData.symbol;
              if (userInputData.dappType != undefined) this._data.dappType = userInputData.dappType;
              if (userInputData.logo != undefined) this._data.logo = userInputData.logo;
              if (userInputData.description != undefined) this._data.description = userInputData.description;
              if (userInputData.cap != undefined) this._data.cap = userInputData.cap;
              if (userInputData.chainId != undefined) this._data.chainId = userInputData.chainId;
              if (userInputData.price != undefined) this._data.price = userInputData.price;
              if (userInputData.redemptionFee != undefined) this._data.redemptionFee = userInputData.redemptionFee;
              if (userInputData.mintingFee != undefined) this._data.mintingFee = userInputData.mintingFee;
              if (userInputData.token != undefined) this._data.token = userInputData.token;
              if (userInputData.contract != undefined) this._data.contract = userInputData.contract;
              this.configDApp.data = this._data;
              this._contract = this._data.contract;
              await this.initApprovalAction();
              this.refreshDApp();
              if (builder?.setData) builder.setData(this._data);
            },
            undo: async () => {
              this._data = {...this._oldData};
              this.configDApp.data = this._data;
              this._contract = this.configDApp.data.contract;
              await this.initApprovalAction();
              this.refreshDApp();
              if (builder?.setData) builder.setData(this._data);
            },
            redo: () => {}
          }
        },
        userInputDataSchema: userInputDataSchema
      },
      {
        name: 'Theme Settings',
        icon: 'palette',
        command: (builder: any, userInputData: any) => {
          return {
            execute: async () => {
              if (!userInputData) return;
              this.oldTag = {...this.tag};
              if (builder) builder.setTag(userInputData);
              else this.setTag(userInputData);
            },
            undo: () => {
              if (!userInputData) return;
              this.tag = {...this.oldTag};
              if (builder) builder.setTag(this.tag);
              else this.setTag(this.oldTag);
            },
            redo: () => {}
          }
        },
        userInputDataSchema: {
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
        }
      }
    ]
    return actions
  }

  getData() {
    return this._data;
  }

  async setData(data: IConfig) {
    this._data = data;
    this._contract = data.contract;
    this.configDApp.data = data;
    await this.initApprovalAction();
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

  async edit() {
    this.gridDApp.visible = false;
    // TODO: update data later
    this.configDApp.data = this._data;
    this.configDApp.visible = true;
  }

  async preview() {
    this.gridDApp.visible = true;
    this.configDApp.visible = false;
    this._data = this.configDApp.data;
    this._data.contract = this._contract;
    this.refreshDApp();
  }

  async confirm() {
    return new Promise<void>(async (resolve, reject) => {
      await this.preview();
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
          this._contract = receipt.contractAddress;
          this._data.contract = this._contract;
          this.initApprovalAction();
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
      if (!this._contract && !this._data)
        reject(new Error('Data missing'));
      resolve();
      if (this.loadingElm) this.loadingElm.visible = false;
    })
  }
  
  private onDeploy = async (callback?: any, confirmationCallback?: any) => {
    if (this._contract || !this._data.name) return;
    const params = {
      name: this._data.name,
      symbol: this._data.symbol,
      cap: this._data.cap,
      price: this._data.price,
      mintingFee: this._data.mintingFee,
      redemptionFee: this._data.redemptionFee
    }
    const result = await deployContract(
      params,
      this._data.token,
      callback,
      confirmationCallback
    );
    this._contract = result;
    this._data.contract = this._contract;
  }

  async discard() {
    this.gridDApp.visible = true;
    this.configDApp.visible = false;
  }

  async config() { }

  validate() {
    const data = this.configDApp.data;
    if (
      !data || 
      !data.token || 
      !data.name ||
      !data.symbol ||
      data.cap === undefined ||
      data.cap === null ||
      data.mintingFee === undefined ||
      data.mintingFee === null ||
      data.redemptionFee === undefined ||
      data.redemptionFee === null ||
      !data.price
    ) {
      this.mdAlert.message = {
        status: 'error',
        content: 'Required field is missing.'
      };
      this.mdAlert.showModal();
      return false;
    }
    return true;
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
    this.renderTokenInput();
    this.imgLogo.url = this.imgLogo2.url = this._data.logo || assets.fullPath('img/gem-logo.svg');
    const buyDesc = `Use ${this._data.name || ''} for services on Secure Compute, decentralized hosting, audits, sub-domains and more. Full backed, Redeemable and transparent at all times!`;
    const redeemDesc = `Redeem your ${this._data.name || ''} Tokens for the underlying token.`;
    const description = this._data.description || (this.isBuy ? buyDesc : redeemDesc);
    this.markdownViewer.load(description);
    this.fromTokenLb.caption = `1 ${this._data.name || ''}`;
    this.toTokenLb.caption = `1 ${this.tokenSymbol}`;
    this.lblTitle.caption = this.lblTitle2.caption = `${this.isBuy ? 'Buy' : 'Redeem'} ${this._data.name || ''} - GEM Tokens`;
    this.backerStack.visible = !this.isBuy;
    this.balanceLayout.templateAreas = [['qty'],['balance'], ['tokenInput'],['redeem']];
    this.pnlQty.visible = this.isBuy;
    this.edtGemQty.readOnly = !this._contract;
    this.edtGemQty.value = "";
    if (!this.isBuy) {
      this.btnSubmit.enabled = false;
      this.btnApprove.visible = false;
      this.backerTokenImg.url = assets.tokenPath(this._data.token, getChainId());
      this.backerTokenBalanceLb.caption = '0.00';
    }
    const feeValue = this.isBuy ? this._data.mintingFee : this._data.redemptionFee;
    this.feeLb.caption = `${feeValue || ''} ${this.tokenSymbol}`;
    const total = new BigNumber(this.edtAmount.value || 0).plus(feeValue).toFixed();
    this.lbTotal.caption = `${total} ${this.tokenSymbol}`;
    this.feeTooltip.tooltip.content = this.isBuy ? buyTooltip : redeemTooltip;
    this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
  }

  async init() {
    super.init();
    await this.initWalletData();
    await this.onSetupPage(isWalletConnected());

    if (!this.tag || (typeof this.tag === 'object' && !Object.keys(this.tag).length)) {
      this.setTag({
        fontColor: '#000000',
        inputFontColor: '#ffffff',
        inputBackgroundColor: '#333333',
        buttonBackgroundColor: '#FE6502',
        backgroundColor: '#ffffff'
      });
    }
  }

  private async initWalletData() {
    const selectedProvider = localStorage.getItem('walletProvider') as WalletPlugin;
    const isValidProvider = Object.values(WalletPlugin).includes(selectedProvider);
    if (hasWallet() && isValidProvider) {
      await connectWallet(selectedProvider);
    }
  }

  private async initApprovalAction() {
    if (!this.approvalModelAction && isWalletConnected() && this._contract) {
      this.approvalModelAction = getERC20ApprovalModelAction(this._contract, {
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

  private async selectToken(token: ITokenObject) {
    this._data.token = token;
    this.backerTokenImg.url = assets.tokenPath(this._data.token, getChainId());
    this.toTokenLb.caption = `1 ${this.tokenSymbol}`;
    this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
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
    this.approvalModelAction.doApproveAction(this._data.token, this.edtAmount.value);
  }
  
  private async onQtyChanged() {
    const qty = Number(this.edtGemQty.value);
    const backerCoinAmount = this.getBackerCoinAmount(qty);
    this.edtAmount.value = backerCoinAmount;
    const feeValue = this.isBuy ? this._data.mintingFee : this._data.redemptionFee;
    const total = new BigNumber(backerCoinAmount).plus(feeValue).toFixed();
    this.lbTotal.caption = `${total} ${this.tokenSymbol}`;
    this.btnApprove.enabled = new BigNumber(this.edtGemQty.value).gt(0);
    if (this.approvalModelAction)
      this.approvalModelAction.checkAllowance(this._data.token, this.edtAmount.value);
  }

  private async onAmountChanged() {
    const gemAmount = Number(this.edtAmount.value);
    this.backerTokenBalanceLb.caption = this.getBackerCoinAmount(gemAmount).toFixed(2);
    const balance = await this.getBalance();
    this.btnSubmit.enabled = balance.gt(0) && new BigNumber(this.edtAmount.value).gt(0) && new BigNumber(this.edtAmount.value).isLessThanOrEqualTo(balance);
  }

  private getBackerCoinAmount(gemAmount: number) {
    return gemAmount / Number(this._data.price) - (gemAmount / Number(this._data.price) * Number(this._data.redemptionFee));
  }

  private getGemAmount(backerCoinAmount: number) {
    return (backerCoinAmount - (backerCoinAmount * Number(this._data.mintingFee))) * Number(this._data.price);
  }

  private async getBalance(token?: ITokenObject) {
    let balance = new BigNumber(0);
    const tokenData = token || this._data.token;
    if (this.isBuy && tokenData) {
      balance = await getTokenBalance(tokenData);
    } else if (!this.isBuy && this._contract) {
      balance = await getGemBalance(this._contract);
      balance = Utils.fromDecimals(balance);
    }
    return balance;
  }

  private async doSubmitAction() {
    if (!this._data || !this._contract) return;
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
          content: `Insufficient ${this._data.name} Balance`
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
    if (!this._data.name) return;
    const callback = (error: Error, receipt?: string) => {
      if (error) {
        this.mdAlert.message = {
          status: 'error',
          content: parseContractError(error)
        };
        this.mdAlert.showModal();
      }
    };
    await buyToken(this._contract, quantity, callback,
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
    if (!this._data.name) return;
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
    await redeemToken(this._contract, gemAmount, callback,
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

  private renderTokenInput() {
    this.edtAmount.readOnly = this.isBuy || !this._contract;
    this.edtAmount.value = "";
    if (this.isBuy) {
      this.tokenElm.token = this._data.token;
      this.tokenElm.visible = true;
      this.tokenElm.readonly = !!this._contract;
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
          fallbackUrl={assets.fullPath('img/gem-logo.svg')}
        ></i-image>
      )
      this.maxStack.visible = !!this._contract;
      this.gridTokenInput.templateColumns = ['50px', 'auto', '100px'];
    }
  }

  render() {
    return (
      <i-panel background={{color: Theme.background.main}}>
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
            padding={{bottom: '1.563rem'}}
          >
            <i-vstack
              id="pnlDescription"
              padding={{ top: '0.5rem', bottom: '0.5rem', left: '5.25rem', right: '6.313rem' }}
              gap="0.813rem"
            >
              <i-hstack>
                <i-image id='imgLogo' class={imageStyle} height={100}></i-image>
              </i-hstack>
              <i-label id="lblTitle" font={{bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase'}}></i-label>
              <i-markdown
                id='markdownViewer'
                class={markdownStyle}
                width='100%'
                height='100%'
                font={{size: '1rem'}}
              ></i-markdown>
            </i-vstack>
            <i-vstack
              gap="0.5rem"
              padding={{ top: '1rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
              verticalAlignment='space-between'
            >
              <i-vstack horizontalAlignment='center' id="pnlLogoTitle" gap='0.5rem'>
                <i-image id='imgLogo2' class={imageStyle} height={100}></i-image>
                <i-label id="lblTitle2" font={{bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase'}}></i-label>
              </i-vstack>
              <i-label caption="Price" font={{size: '1rem'}} opacity={0.6}></i-label>
              <i-hstack gap="4px" class={centerStyle} margin={{bottom: '1rem'}}>
                <i-label id="fromTokenLb" font={{bold: true, size: '1.5rem'}}></i-label>
                <i-label caption="=" font={{bold: true, size: '1.5rem'}}></i-label>
                <i-label id="toTokenLb" font={{bold: true, size: '1.5rem'}}></i-label>
              </i-hstack>
              <i-vstack gap="0.5rem">
                <i-grid-layout
                  id="balanceLayout"
                  gap={{column: '0.5rem', row: '0.25rem'}}
                >
                  <i-hstack id='pnlQty' visible={false} horizontalAlignment='end' verticalAlignment='center' gap="0.5rem" grid={{area: 'qty'}}>
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
                      border={{ radius: 4 }}
                    ></i-input>
                  </i-hstack>
                  <i-hstack
                    horizontalAlignment="space-between"
                    verticalAlignment='center'
                    gap="0.5rem"
                    grid={{area: 'balance'}}
                  >
                    <i-label caption='Subtotal' font={{size: '1rem'}}></i-label>
                    <i-hstack verticalAlignment='center' gap="0.5rem">
                      <i-label caption='Balance:' font={{size: '1rem'}} opacity={0.6}></i-label>
                      <i-label id='lblBalance' font={{size: '1rem'}} opacity={0.6}></i-label>
                    </i-hstack>
                  </i-hstack>
                  <i-grid-layout
                    id='gridTokenInput'
                    verticalAlignment="center"
                    templateColumns={['60%', 'auto']}
                    border={{ radius: 16 }} overflow="hidden"
                    background={{color: Theme.input.background}}
                    font={{color: Theme.input.fontColor}}
                    height={56} width="100%"
                    grid={{area: 'tokenInput'}}
                  >
                    <i-panel id="gemLogoStack" padding={{left: 10}} visible={false}/>
                    <gem-token-selection
                      id="tokenElm"
                      class={tokenSelectionStyle}
                      width="100%"
                      onSelectToken={this.selectToken.bind(this)}
                    ></gem-token-selection>
                    <i-input
                      id="edtAmount"
                      width='100%'
                      height='100%'
                      minHeight={40}
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
                    grid={{area: 'redeem'}}
                    margin={{top: '1rem', bottom: '1rem'}}
                    maxWidth="50%"
                    visible={false}
                  >
                    <i-label caption='You get:' font={{ size: '1rem' }}></i-label>
                    <i-image id="backerTokenImg" width={20} height={20} fallbackUrl={assets.tokenPath()}></i-image>
                    <i-label id="backerTokenBalanceLb" caption='0.00' font={{ size: '1rem' }}></i-label>
                  </i-hstack>
                </i-grid-layout>
                <i-vstack horizontalAlignment="center" verticalAlignment='center' gap="8px" margin={{bottom: '1.313rem'}}>
                  <i-button
                    id="btnApprove"
                    minWidth='100%'
                    caption="Approve"
                    padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                    font={{ size: '1rem', color: Theme.colors.primary.contrastText, bold: true }}
                    rightIcon={{ visible: false, fill: Theme.colors.primary.contrastText }}
                    border={{radius: 12}}
                    visible={false}
                    onClick={this.onApprove.bind(this)}
                  ></i-button>                
                  <i-button
                    id='btnSubmit'
                    minWidth='100%'
                    caption='Submit'
                    padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                    font={{ size: '1rem', color: Theme.colors.primary.contrastText, bold: true }}
                    background={{color: Theme.colors.primary.main}}
                    rightIcon={{ visible: false, fill: Theme.colors.primary.contrastText }}
                    border={{radius: 12}}
                    onClick={this.onSubmit.bind(this)}
                    enabled={false}
                  ></i-button>
                </i-vstack>
                <i-hstack horizontalAlignment="space-between" verticalAlignment="center" gap="0.5rem">
                  <i-hstack horizontalAlignment="end" verticalAlignment="center" gap={4}>
                    <i-label caption="Transaction Fee" font={{size: '1rem', bold: true}} opacity={0.6}></i-label>
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
                  <i-label caption="Total" font={{size: '1rem', bold: true}} opacity={0.6}></i-label>
                  <i-label id="lbTotal" font={{ size: '1rem', bold: true }} opacity={0.6} caption="0"></i-label>
                </i-hstack>                
                {/* <i-label
                  caption='Terms & Condition'
                  font={{ size: '0.75rem' }}
                  link={{ href: 'https://docs.scom.dev/' }}
                ></i-label> */}
              </i-vstack>
            </i-vstack>
          </i-grid-layout>
        </i-panel>
        <gem-token-config id='configDApp' visible={false}></gem-token-config>
        <gem-token-alert id='mdAlert'></gem-token-alert>
      </i-panel>
    )
  }
}