import {
  Module,
  customElements,
  Styles,
  Button,
  GridLayout,
  ControlElement,
  Container,
  application,
  IEventBus,
  Modal,
  Icon
} from '@ijstech/components';
import { EventId, getChainId } from '../store/index';
import { ChainNativeTokenByChainId, tokenStore, assets, ITokenObject, isWalletConnected } from '@scom/scom-token-list';
import { buttonStyle, modalStyle, scrollbarStyle, tokenStyle } from './index.css';

const Theme = Styles.Theme.ThemeVars;

type selectTokenCallback = (token: ITokenObject) => void;
interface TokenSelectionElement extends ControlElement {
  readonly?: boolean;
  onSelectToken?: selectTokenCallback;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-gem-token-selection']: TokenSelectionElement;
    }
  }
};

@customElements('i-scom-gem-token-selection')
export class TokenSelection extends Module {
  private btnTokens: Button;
  private mdTokenSelection: Modal;
  private gridTokenList: GridLayout;
  private $eventBus: IEventBus;
  private _token: ITokenObject | undefined;
  private _readonly: boolean = false;
  public onSelectToken: selectTokenCallback;
  private _chainId: number;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.$eventBus = application.EventBus;
    this.registerEvent();
  };

  get token() {
    return this._token;
  }

  set token(value: ITokenObject | undefined) {
    this._token = value;
    this.updateTokenButton();
  }

  get chainId() {
    return this._chainId;
  }

  set chainId(value: number) {
    this._chainId = value;
  }

  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(value: boolean) {
    if (this._readonly != value) {
      this._readonly = value;
      this.updateStatusButton();
    }
  }

  private onSetup(init?: boolean) {
    this.renderTokenItems();
    if (init && this.token && !this.readonly) {
      const chainId = getChainId();
      const _tokenList = tokenStore.getTokenList(chainId);
      const token = _tokenList.find(t => (t.address && t.address == this.token?.address) || (t.symbol == this.token?.symbol))
      if (!token) this.token = undefined;
    }
    this.updateTokenButton();
  }

  private registerEvent() {
    this.$eventBus.register(this, EventId.IsWalletConnected, () => this.onSetup());
    this.$eventBus.register(this, EventId.IsWalletDisconnected, () => this.onSetup());
    this.$eventBus.register(this, EventId.chainChanged, () => this.onSetup(true));
  }

  private get tokenList(): ITokenObject[] {
    const chainId = getChainId();
    const _tokenList = tokenStore.getTokenList(chainId);

    return _tokenList.map((token: ITokenObject) => {
      const tokenObject = { ...token };
      const nativeToken = ChainNativeTokenByChainId[chainId];
      if (token.symbol === nativeToken.symbol) {
        Object.assign(tokenObject, { isNative: true })
      }
      if (!isWalletConnected()) {
        Object.assign(tokenObject, {
          balance: 0,
        })
      }
      return tokenObject;
    }).sort(this.sortToken);
  }

  private sortToken = (a: ITokenObject, b: ITokenObject, asc?: boolean) => {
    const _symbol1 = a.symbol.toLowerCase();
    const _symbol2 = b.symbol.toLowerCase();
    if (_symbol1 < _symbol2) {
      return -1;
    }
    if (_symbol1 > _symbol2) {
      return 1;
    }
    return 0;
  }

  private renderTokenItems() {
    if (!this.gridTokenList) return
    this.gridTokenList.clearInnerHTML();
    const _tokenList = this.tokenList;
    if (_tokenList.length) {
      const tokenItems = _tokenList.map((token: ITokenObject) => this.renderToken(token));
      this.gridTokenList.append(...tokenItems);
    } else {
      this.gridTokenList.append(
        <i-label margin={{ top: '1rem', bottom: '1rem' }} caption='No tokens found'></i-label>
      )
    }
  }

  private renderToken(token: ITokenObject) {
    const chainId = getChainId();
    const tokenIconPath = assets.tokenPath(token, chainId);
    return (
      <i-hstack
        width='100%'
        class={`pointer ${tokenStyle}`}
        verticalAlignment='center'
        padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
        border={{ radius: 5 }}
        gap='0.5rem'
        onClick={() => this.selectToken(token)}
      >
        <i-image width={36} height={36} url={tokenIconPath} fallbackUrl={assets.fallbackUrl}></i-image>
        <i-vstack gap='0.25rem'>
          <i-label font={{ size: '0.875rem', bold: true }} caption={token.symbol}></i-label>
          <i-label font={{ size: '0.75rem' }} caption={token.name}></i-label>
        </i-vstack>
      </i-hstack>
    )
  }

  private async updateStatusButton() {
    if (!this.btnTokens) return;
    this.btnTokens.style.cursor = this._readonly ? 'default' : '';
    this.btnTokens.rightIcon.visible = !this._readonly;
  }

  private updateTokenButton() {
    if (!this.btnTokens) return;
    const token = this.token;
    const chainId = this.chainId || getChainId();
    if (token /*&& isWalletConnected()*/) {
      const tokenIconPath = assets.tokenPath(token, chainId);
      const icon = new Icon(this.btnTokens, {
        width: 28,
        height: 28,
        image: {
          url: tokenIconPath,
          fallBackUrl: assets.fallbackUrl
        }
      })
      this.btnTokens.icon = icon;
      this.btnTokens.caption = token.symbol;
      this.btnTokens.font = { bold: true, color: Theme.input.fontColor };
    } else {
      this.btnTokens.icon = undefined;
      this.btnTokens.caption = 'Select a token';
      this.btnTokens.font = { bold: false, color: Theme.input.fontColor };
    }
  }

  private selectToken = (token: ITokenObject) => {
    if (!this.enabled || this._readonly) return;
    this.token = token;
    this.updateTokenButton();
    this.mdTokenSelection.visible = false;
    if (this.onSelectToken) this.onSelectToken(token);
  }

  private showTokenModal() {
    if (!this.enabled || this._readonly) return;
    this.mdTokenSelection.visible = true;
    this.gridTokenList.scrollTop = 0;
  }

  private closeTokenModal() {
    this.mdTokenSelection.visible = false;
  }
  
  init() {
    super.init();
    const readonly = this.getAttribute('readonly', true);
    if (readonly !== undefined) {
      this.readonly = readonly;
    } else {
      this.updateStatusButton();
    }
    this.onSetup();
  }

  render() {
    return (
      <i-panel>
        <i-button
          id='btnTokens'
          class={`${buttonStyle} token-button`}
          width='100%'
          height={40}
          caption='Select a token'
          rightIcon={{ width: 14, height: 14, name: 'angle-down' }}
          border={{ radius: 0 }}
          background={{ color: 'transparent' }}
          font={{color: Theme.input.fontColor}}
          padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }}
          onClick={this.showTokenModal.bind(this)}
        ></i-button>
        <i-modal id='mdTokenSelection' class={modalStyle} width={400}>
          <i-hstack
            horizontalAlignment='space-between'
            verticalAlignment='center'
            padding={{ top: '1rem', bottom: '1rem' }}
            border={{ bottom: { width: 1, style: 'solid', color: '#f1f1f1' } }}
            margin={{ bottom: '1rem', left: '1rem', right: '1rem' }}
            gap={4}
          >
            <i-label caption='Select a token' font={{ size: '1.125rem', bold: true }}></i-label>
            <i-icon
              width={24}
              height={24}
              class='pointer'
              name='times'
              fill={Theme.colors.primary.main}
              padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.25rem', right: '0.25rem' }}
              onClick={this.closeTokenModal.bind(this)}
            ></i-icon>
          </i-hstack>
          <i-grid-layout
            id='gridTokenList'
            class={scrollbarStyle}
            maxHeight='45vh'
            columnsPerRow={1}
            overflow={{ y: 'auto' }}
            padding={{ bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
          ></i-grid-layout>
        </i-modal>
      </i-panel>
    )
  }
}
