import {
    Module,
    customElements,
    Modal,
    Label,
    ControlElement
} from '@ijstech/components';
import './loadingDialog.css';

export interface LoadingDialogElement extends ControlElement {}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-gem-token-loading']: LoadingDialogElement;
        }
    }
}

@customElements('i-scom-gem-token-loading')
export class LoadingDialog extends Module {

    private lbMessage: Label;
    private mdLoading: Modal;

    constructor(parent?: any, options?: any) {
        super(parent, options);
        const attrs = this.attrs;
        for (let attr in attrs) {
            if (attr === 'id' || typeof attrs[attr] === 'function') continue;
            this[attr] = this.getAttribute(attr, true);
        }
    }

    async init() {
        super.init();
    }

    show() {
        this.mdLoading.visible = true;
    }

    hide() {
        this.mdLoading.visible = false;
    }

    updateMessage(message: string) {
        this.lbMessage.caption = message;
    }

    render() {
        return (
            <i-modal id={'mdLoading'} showBackdrop={true} closeOnBackdropClick={false} maxWidth={350} height={300}>
                <i-panel class={'message-box'}>
                    <i-hstack justifyContent={'center'} alignItems={'center'}>
                        <i-panel class={'spinner'}></i-panel>
                    </i-hstack>
                    <i-label id={'lbMessage'} caption={'Loading...'} margin={{top: 5}}></i-label>
                </i-panel>
            </i-modal>
        );
    }
}
