import {
  customElements,
  Module,
  ControlElement,
  Styles,
  Modal,
  Panel,
  IconName
} from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

declare global {
	namespace JSX {
		interface IntrinsicElements {
			['nft-minter-alert']: ControlElement;
		}
	}
};

export interface IAlertMessage {
  status: 'warning' | 'success' | 'error' | 'loading';
  title?: string;
  content?: string;
  onClose?: any;
}

@customElements('nft-minter-alert')
export class Alert extends Module {
  private mdAlert: Modal;
  private pnlMain: Panel;
  private _message: IAlertMessage;

  get message(): IAlertMessage {
    return this._message;
  }

  set message(value: IAlertMessage) {
    this._message = value;
    this.mdAlert.onClose = this._message.onClose;
  }
  
  private get iconName(): IconName {
    if (this.message.status === 'error')
      return 'times'
    else if (this.message.status === 'warning')
      return 'exclamation';
    else if (this.message.status === 'success')
      return 'check';
    else
      return 'spinner'
  }

  private get color(): string {
    if (this.message.status === 'error')
      return Theme.colors.error.main
    else if (this.message.status === 'warning')
      return Theme.colors.warning.main;
    else if (this.message.status === 'success')
      return Theme.colors.success.main;
    else
      return Theme.colors.primary.main;
  }

  closeModal() {
    this.mdAlert.visible = false;
  }

  showModal() {
    this.renderUI();
    this.mdAlert.visible = true;
  }
  
  private renderUI() {
    this.pnlMain.clearInnerHTML();
    const content = this.renderContent();
    const border: any = this.message.status === 'loading' ? {} : { border: { width: 2, style: 'solid', color: this.color, radius: '50%' } }
    this.pnlMain.appendChild(
      <i-vstack horizontalAlignment="center" gap="1.75rem">
        <i-icon
          width={55}
          height={55}
          name={this.iconName}
          fill={this.color}
          padding={{ top: "0.6rem", bottom: "0.6rem", left: "0.6rem", right: "0.6rem" }}
          spin={this.message.status === 'loading'}
          { ...border }
        ></i-icon>
        {content}
        <i-button
          padding={{ top: "0.5rem", bottom: "0.5rem", left: "2rem", right: "2rem" }}
          caption="Close"
          font={{ color: Theme.colors.primary.contrastText }}
          onClick={this.closeModal.bind(this)}
        ></i-button>
      </i-vstack>
    );
  }

  private renderContent() {
    if (!this.message.title && !this.message.content) return [];
    const lblTitle = this.message.title ? <i-label caption={this.message.title} font={{ size: '1.25rem', bold: true }}></i-label> : [];
    const lblContent = this.message.content ? <i-label caption={this.message.content} overflowWrap='anywhere'></i-label> : [];
    return (
      <i-vstack class="text-center" horizontalAlignment="center" gap="0.75rem" lineHeight={1.5}>
        {lblTitle}
        {lblContent}
      </i-vstack>
    )
  }

	render() {
		return (
      <i-modal id="mdAlert" maxWidth="400px" maxHeight="300px">
        <i-panel
          id="pnlMain"
          width="100%"
          padding={{ top: "1rem", bottom: "1.5rem", left: "1rem", right: "1rem" }}
        >
        </i-panel>
      </i-modal>
		)
	}
};