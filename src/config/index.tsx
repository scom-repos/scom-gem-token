import {
  Module,
  customModule,
  customElements,
  ControlElement,
  Control,
  Styles,
  Input,
  Upload,
  Markdown,
  IComboItem,
  ComboBox
} from '@ijstech/components';
import { DappType, IConfig } from '../interface';
import { textareaStyle } from './index.css';
import { TokenSelection } from '../token-selection/index';

const Theme = Styles.Theme.ThemeVars;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['gem-token-config']: ControlElement;
    }
  }
}

const actionOptions = [
  {
    value: 'buy',
    label: 'Buy'
  }, {
    value: 'redeem',
    label: 'Redeem'
  }
];


@customModule
@customElements("gem-token-config")
export default class Config extends Module {
  private uploadLogo: Upload;
  private edtDescription: Input;
  private markdownViewer: Markdown;
  private edtName: Input;
  private edtSymbol: Input;
  private edtCap: Input;
  private edtMintingFee: Input;
  private edtRedemptionFee: Input;
  private edtPrice: Input;
  private tokenSelection: TokenSelection;
  private comboDappType: ComboBox;
  private _logo: any;
  private _contract: string = '';
  private _isInited: boolean = false;
  
  init() {
    super.init();
    this.onChangedAction();
    this._isInited = true;
  }

  get data(): IConfig {
    const config: IConfig = {
      name: this.edtName.value || "",
      dappType: (this.comboDappType.selectedItem as IComboItem).value as DappType,
      description: this.edtDescription.value || "",
      symbol: this.edtSymbol.value || "",
      cap: this.edtCap.value || "",
      redemptionFee: this.edtRedemptionFee.value || "0",
      price: this.edtPrice.value || "",
      mintingFee: this.edtMintingFee.value || "0"
    };
    if (this._logo)
      config.logo = this._logo;
    if (this.tokenSelection.token)
      config.token = this.tokenSelection.token;
    return config;
  }

  set data(config: IConfig) {
    if (!this._isInited) this.init();
    this.uploadLogo.clear();
    if (config.logo)
      this.uploadLogo.preview(config.logo);
    this._logo = config.logo;
    this.comboDappType.selectedItem = actionOptions.find(v => v.value == config.dappType);
    this.onChangedAction();
    this.edtName.value = config.name || "";
    this.edtPrice.value = config.price || "";
    this.edtSymbol.value = config.symbol || "";
    this.edtCap.value = config.cap || "";
    this.edtRedemptionFee.value = config.redemptionFee || "";
    this.edtMintingFee.value = config.mintingFee || "";
    this.edtDescription.value = config.description || "";
    this.tokenSelection.token = config.token;
    this.onMarkdownChanged();
    this._contract = config.contract || '';
    this.updateInputs();
  }

  private async onChangeFile(source: Control, files: File[]) {
    this._logo = files.length ? await this.uploadLogo.toBase64(files[0]) : undefined;
  }

  private onRemove(source: Control, file: File) {
    this._logo = undefined;
  }

  private onMarkdownChanged() {
    this.markdownViewer.load(this.edtDescription.value || "");
  }
  
  private onChangedAction() {}

  private get isDeployed() {
    return !!this._contract;
  }

  private updateInputs() {
    this.edtName.readOnly = this.isDeployed;
    this.edtSymbol.readOnly = this.isDeployed;
    this.edtCap.readOnly = this.isDeployed;
    this.edtMintingFee.readOnly = this.isDeployed;
    this.edtRedemptionFee.readOnly = this.isDeployed;
    this.edtPrice.readOnly = this.isDeployed;
    this.tokenSelection.readonly = this.isDeployed;
  }

  render() {
    return (
      <i-vstack gap='0.5rem' padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}>
        <i-label caption='Action Type:'></i-label>
        <i-combo-box
          id='comboDappType'
          width='100%'
          icon={{ width: 14, height: 14, name: 'angle-down' }}
          items={actionOptions}
          selectedItem={actionOptions[0]}
          onChanged={this.onChangedAction.bind(this)}
        ></i-combo-box>
        <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='GEM Token Name'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-input id='edtName' width='100%'></i-input>
        <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='GEM Token Symbol'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-input id='edtSymbol' width='100%'></i-input>
        <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='Maximum Mint Cap'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-input id='edtCap' inputType="number" width='100%'></i-input>
        <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='Minting Fee'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-input id='edtMintingFee' value={0} inputType="number" width='100%' min={0} max={1}></i-input>
        <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='Redemption Fee'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-input id='edtRedemptionFee' value={0} inputType="number" width='100%' min={0} max={1}></i-input>
        <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='Price'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-input id='edtPrice' width='100%' inputType='number'></i-input>
        <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='Token'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-panel>
          <gem-token-selection
            id='tokenSelection'
            width='100%'
            background={{ color: Theme.input.background }}
            border={{ width: 1, style: 'solid', color: Theme.divider }}
          ></gem-token-selection>
        </i-panel>
        {/* <i-hstack gap={4} verticalAlignment="center">
          <i-label caption='Qty'></i-label>
          <i-label caption="*" font={{ color: Theme.colors.error.main }} />
        </i-hstack>
        <i-input id='edtQty' width='100%' inputType='number'></i-input> */}
        <i-label caption='Logo:'></i-label>
        <i-upload
          id='uploadLogo'
          margin={{ top: 8, bottom: 0 }}
          accept='image/*'
          draggable
          caption='Drag and drop image here'
          showFileList={false}
          onChanged={this.onChangeFile.bind(this)}
          onRemoved={this.onRemove.bind(this)}
        ></i-upload>
        <i-label caption='Descriptions:'></i-label>
        <i-grid-layout templateColumns={['50%', '50%']}>
          <i-input
            id='edtDescription'
            class={textareaStyle}
            width='100%'
            height='100%'
            display='flex'
            stack={{ grow: '1' }}
            resize="none"
            inputType='textarea'
            font={{ size: Theme.typography.fontSize, name: Theme.typography.fontFamily }}
            onChanged={this.onMarkdownChanged.bind(this)}
          ></i-input>
          <i-markdown
            id='markdownViewer'
            width='100%'
            height='100%'
            padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
          ></i-markdown>
        </i-grid-layout>
      </i-vstack>
    )
  }
}