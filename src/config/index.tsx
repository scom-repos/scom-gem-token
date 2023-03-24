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
  ComboBox,
  Table,
  Modal,
  Label,
  Icon,
  Button
} from '@ijstech/components';
import { ICommissionInfo, IEmbedData } from '../interface';
import { BigNumber } from '@ijstech/eth-wallet';
import { formatNumber, isWalletAddress } from '../utils/index';
import ScomNetworkPicker from '../network-picker/index';
import { getEmbedderCommissionFee, getNetworkName, INetwork, SupportedNetworks } from '../store/index';

const Theme = Styles.Theme.ThemeVars;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-gem-token-config']: ControlElement;
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
@customElements("i-scom-gem-token-config")
export default class Config extends Module {
  private tableCommissions: Table;
  private modalAddCommission: Modal;
  private networkPicker: ScomNetworkPicker;
  private inputWalletAddress: Input;
  private lbCommissionShare: Label;
  private commissionInfoList: ICommissionInfo[];
  private commissionsTableColumns = [
    {
      title: 'Network',
      fieldName: 'chainId',
      key: 'chainId',
      onRenderCell: function (source: Control, columnData: number, rowData: any) {
        return getNetworkName(columnData);
      }
    },
    {
      title: 'Wallet Address',
      fieldName: 'walletAddress',
      key: 'walletAddress'
    },
    {
      title: '',
      fieldName: '',
      key: '',
      textAlign: 'center' as any,
      onRenderCell: async (source: Control, data: any, rowData: any) => {
        const icon = new Icon(undefined, {
          name: "edit",
          fill: "#03a9f4",
          height: 18,
          width: 18
        })
        icon.onClick = async (source: Control) => {
          this.networkPicker.setNetworkByChainId(rowData.chainId);
          this.inputWalletAddress.value = rowData.walletAddress;
          this.modalAddCommission.visible = true;
        }
        return icon;
      }
    },
    {
      title: '',
      fieldName: '',
      key: '',
      textAlign: 'center' as any,
      onRenderCell: async (source: Control, data: any, rowData: any) => {
        const icon = new Icon(undefined, {
          name: "times",
          fill: "#ed5748",
          height: 18,
          width: 18
        })
        icon.onClick = async (source: Control) => {
          const index = this.commissionInfoList.findIndex(v => v.walletAddress == rowData.walletAddress && v.chainId == rowData.chainId);
          if (index >= 0) {
            this.commissionInfoList.splice(index, 1);
            this.tableCommissions.data = this.commissionInfoList;
            if (this._onCustomCommissionsChanged) {
              await this._onCustomCommissionsChanged({
                commissions: this.commissionInfoList
              });
            }
          }
        }
        return icon;
      }
    }
  ]
  private btnConfirm: Button;
  private lbErrMsg: Label;
  private _onCustomCommissionsChanged: (data: any) => Promise<void>;

  async init() {
    super.init();
    this.commissionInfoList = [];
    const embedderFee = getEmbedderCommissionFee();
    this.lbCommissionShare.caption = `${formatNumber(new BigNumber(embedderFee).times(100).toFixed(), 4)} %`;
  }

  get data(): IEmbedData {
    const config: IEmbedData = {
    };
    config.commissions = this.tableCommissions.data || [];
    return config;
  }

  set data(config: IEmbedData) {
    this.tableCommissions.data = config.commissions || [];
  }

  get onCustomCommissionsChanged(): (data: any) => Promise<void> {
    return this._onCustomCommissionsChanged;
  }

  set onCustomCommissionsChanged(value: (data: any) => Promise<void>) {
    this._onCustomCommissionsChanged = value;
  }

  onModalAddCommissionClosed() {
    this.networkPicker.clearNetwork();
    this.inputWalletAddress.value = '';
    this.lbErrMsg.caption = '';
  }

  onAddCommissionClicked() {
    this.modalAddCommission.visible = true;
  }

  async onConfirmCommissionClicked() {
    const embedderFee = getEmbedderCommissionFee();
    this.commissionInfoList.push({
      chainId: this.networkPicker.selectedNetwork?.chainId,
      walletAddress: this.inputWalletAddress.value,
      share: embedderFee
    })
    this.tableCommissions.data = this.commissionInfoList;
    this.modalAddCommission.visible = false;

    if (this._onCustomCommissionsChanged) {
      await this._onCustomCommissionsChanged({
        commissions: this.commissionInfoList
      });
    }
  }

  validateModalFields() {
    if (!this.networkPicker.selectedNetwork) {
      this.lbErrMsg.caption = 'Please select network';
    }
    else if (this.commissionInfoList.find(v => v.chainId == this.networkPicker.selectedNetwork.chainId)) {
      this.lbErrMsg.caption = 'This network already exists';
    }
    else if (!this.inputWalletAddress.value) {
      this.lbErrMsg.caption = 'Please enter wallet address';
    }
    else if (!isWalletAddress(this.inputWalletAddress.value)) {
      this.lbErrMsg.caption = 'Please enter valid wallet address';
    }
    else {
      this.lbErrMsg.caption = '';
    }

    if (this.lbErrMsg.caption) {
      this.btnConfirm.enabled = false;
      return false;
    }
    else {
      this.btnConfirm.enabled = true;
      return true;
    }
  }

  onNetworkSelected(network: INetwork) {
    this.validateModalFields();
  }

  onInputWalletAddressChanged() {
    this.validateModalFields();
  }

  render() {
    return (
      <i-vstack gap='0.5rem' padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}>
        <i-hstack gap={4} verticalAlignment="center" horizontalAlignment="space-between">
          <i-hstack gap="1rem">
            <i-label caption="Commission Fee:" font={{ bold: true }} />
            <i-label id="lbCommissionShare" font={{ bold: true }} />
          </i-hstack>
          <i-button
            caption="Add"
            background={{ color: '#03a9f4' }}
            font={{ color: '#fff' }}
            padding={{ top: '0.4rem', bottom: '0.4rem', left: '2rem', right: '2rem' }}
            onClick={this.onAddCommissionClicked.bind(this)}>
          </i-button>
        </i-hstack>
        <i-table
          id='tableCommissions'
          data={this.commissionInfoList}
          columns={this.commissionsTableColumns}
        ></i-table>
        <i-modal
          id='modalAddCommission' maxWidth='600px' closeIcon={{ name: 'times-circle' }} onClose={this.onModalAddCommissionClosed}>
          <i-grid-layout
            width='100%'
            verticalAlignment='center' gap={{ row: '1rem' }}
            padding={{ top: '1rem', bottom: '1rem', left: '2rem', right: '2rem' }}
            templateColumns={['1fr', '3fr']}
            templateRows={['auto', 'auto', 'auto', 'auto']}
            templateAreas={
              [
                ['title', 'title'],
                ['lbNetwork', 'network'],
                ["lbWalletAddress", "walletAddress"],
                ["lbErrMsg", "errMsg"],
                ['btnConfirm', 'btnConfirm']
              ]
            }>

            <i-hstack width='100%' horizontalAlignment='center' grid={{ area: 'title' }}>
              <i-label caption="Add Commission"></i-label>
            </i-hstack>

            <i-label caption="Network" grid={{ area: 'lbNetwork' }} />
            <i-scom-nft-minter-network-picker
              id='networkPicker'
              grid={{ area: 'network' }}
              networks={SupportedNetworks}
              onCustomNetworkSelected={this.onNetworkSelected}
            />

            <i-label caption="Wallet Address" grid={{ area: 'lbWalletAddress' }} />
            <i-input id='inputWalletAddress' grid={{ area: 'walletAddress' }} width='100%' onChanged={this.onInputWalletAddressChanged} />

            <i-label id='lbErrMsg' font={{ color: '#ed5748' }} grid={{ area: 'errMsg' }}></i-label>

            <i-hstack width='100%' horizontalAlignment='center' grid={{ area: 'btnConfirm' }}>
              <i-button
                id="btnConfirm"
                enabled={false}
                caption="Confirm"
                background={{ color: '#03a9f4' }}
                font={{ color: '#fff' }}
                padding={{ top: '0.4rem', bottom: '0.4rem', left: '2rem', right: '2rem' }}
                onClick={this.onConfirmCommissionClicked.bind(this)}
              />
            </i-hstack>

          </i-grid-layout>
        </i-modal>
      </i-vstack>
    )
  }
}