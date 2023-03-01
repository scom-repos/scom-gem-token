var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@pageblock-gem-token/alert", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Alert = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    ;
    let Alert = class Alert extends components_1.Module {
        get message() {
            return this._message;
        }
        set message(value) {
            this._message = value;
            this.mdAlert.onClose = this._message.onClose;
        }
        get iconName() {
            if (this.message.status === 'error')
                return 'times';
            else if (this.message.status === 'warning')
                return 'exclamation';
            else if (this.message.status === 'success')
                return 'check';
            else
                return 'spinner';
        }
        get color() {
            if (this.message.status === 'error')
                return Theme.colors.error.main;
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
        renderUI() {
            this.pnlMain.clearInnerHTML();
            const content = this.renderContent();
            const border = this.message.status === 'loading' ? {} : { border: { width: 2, style: 'solid', color: this.color, radius: '50%' } };
            this.pnlMain.appendChild(this.$render("i-vstack", { horizontalAlignment: "center", gap: "1.75rem" },
                this.$render("i-icon", Object.assign({ width: 55, height: 55, name: this.iconName, fill: this.color, padding: { top: "0.6rem", bottom: "0.6rem", left: "0.6rem", right: "0.6rem" }, spin: this.message.status === 'loading' }, border)),
                content,
                this.$render("i-button", { padding: { top: "0.5rem", bottom: "0.5rem", left: "2rem", right: "2rem" }, caption: "Close", font: { color: Theme.colors.primary.contrastText }, onClick: this.closeModal.bind(this) })));
        }
        renderContent() {
            if (!this.message.title && !this.message.content)
                return [];
            const lblTitle = this.message.title ? this.$render("i-label", { caption: this.message.title, font: { size: '1.25rem', bold: true } }) : [];
            const lblContent = this.message.content ? this.$render("i-label", { caption: this.message.content, overflowWrap: 'anywhere' }) : [];
            return (this.$render("i-vstack", { class: "text-center", horizontalAlignment: "center", gap: "0.75rem", lineHeight: 1.5 },
                lblTitle,
                lblContent));
        }
        render() {
            return (this.$render("i-modal", { id: "mdAlert", maxWidth: "400px", maxHeight: "300px" },
                this.$render("i-panel", { id: "pnlMain", width: "100%", padding: { top: "1rem", bottom: "1.5rem", left: "1rem", right: "1rem" } })));
        }
    };
    Alert = __decorate([
        components_1.customElements('gem-token-alert')
    ], Alert);
    exports.Alert = Alert;
    ;
});
