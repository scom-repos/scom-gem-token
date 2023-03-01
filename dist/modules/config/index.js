var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@pageblock-gem-token/config/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.textareaStyle = void 0;
    exports.textareaStyle = components_1.Styles.style({
        $nest: {
            'textarea': {
                border: 'none',
                outline: 'none'
            }
        }
    });
});
define("@pageblock-gem-token/config", ["require", "exports", "@ijstech/components", "@pageblock-gem-token/config/index.css.ts"], function (require, exports, components_2, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    const actionOptions = [
        {
            value: 'buy',
            label: 'Buy'
        }, {
            value: 'redeem',
            label: 'Redeem'
        }
    ];
    let Config = class Config extends components_2.Module {
        constructor() {
            super(...arguments);
            this._contract = '';
        }
        init() {
            super.init();
            this.onChangedAction();
        }
        get data() {
            const config = {
                name: this.edtName.value || "",
                dappType: this.comboDappType.selectedItem.value,
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
        set data(config) {
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
        async onChangeFile(source, files) {
            this._logo = files.length ? await this.uploadLogo.toBase64(files[0]) : undefined;
        }
        onRemove(source, file) {
            this._logo = undefined;
        }
        onMarkdownChanged() {
            this.markdownViewer.load(this.edtDescription.value || "");
        }
        onChangedAction() { }
        get isDeployed() {
            return !!this._contract;
        }
        updateInputs() {
            this.edtName.readOnly = this.isDeployed;
            this.edtSymbol.readOnly = this.isDeployed;
            this.edtCap.readOnly = this.isDeployed;
            this.edtMintingFee.readOnly = this.isDeployed;
            this.edtRedemptionFee.readOnly = this.isDeployed;
            this.edtPrice.readOnly = this.isDeployed;
            this.tokenSelection.readonly = this.isDeployed;
        }
        render() {
            return (this.$render("i-vstack", { gap: '0.5rem', padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' } },
                this.$render("i-label", { caption: 'Action Type:' }),
                this.$render("i-combo-box", { id: 'comboDappType', width: '100%', icon: { width: 14, height: 14, name: 'angle-down' }, items: actionOptions, selectedItem: actionOptions[0], onChanged: this.onChangedAction.bind(this) }),
                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: 'GEM Token Name' }),
                    this.$render("i-label", { caption: "*", font: { color: Theme.colors.error.main } })),
                this.$render("i-input", { id: 'edtName', width: '100%' }),
                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: 'GEM Token Symbol' }),
                    this.$render("i-label", { caption: "*", font: { color: Theme.colors.error.main } })),
                this.$render("i-input", { id: 'edtSymbol', width: '100%' }),
                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: 'Maximum Mint Cap' }),
                    this.$render("i-label", { caption: "*", font: { color: Theme.colors.error.main } })),
                this.$render("i-input", { id: 'edtCap', inputType: "number", width: '100%' }),
                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: 'Minting Fee' }),
                    this.$render("i-label", { caption: "*", font: { color: Theme.colors.error.main } })),
                this.$render("i-input", { id: 'edtMintingFee', value: 0, inputType: "number", width: '100%', min: 0, max: 1 }),
                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: 'Redemption Fee' }),
                    this.$render("i-label", { caption: "*", font: { color: Theme.colors.error.main } })),
                this.$render("i-input", { id: 'edtRedemptionFee', value: 0, inputType: "number", width: '100%', min: 0, max: 1 }),
                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: 'Price' }),
                    this.$render("i-label", { caption: "*", font: { color: Theme.colors.error.main } })),
                this.$render("i-input", { id: 'edtPrice', width: '100%', inputType: 'number' }),
                this.$render("i-hstack", { gap: 4, verticalAlignment: "center" },
                    this.$render("i-label", { caption: 'Token' }),
                    this.$render("i-label", { caption: "*", font: { color: Theme.colors.error.main } })),
                this.$render("i-panel", null,
                    this.$render("gem-token-selection", { id: 'tokenSelection', width: '100%', background: { color: Theme.input.background }, border: { width: 1, style: 'solid', color: Theme.divider } })),
                this.$render("i-label", { caption: 'Logo:' }),
                this.$render("i-upload", { id: 'uploadLogo', margin: { top: 8, bottom: 0 }, accept: 'image/*', draggable: true, caption: 'Drag and drop image here', showFileList: false, onChanged: this.onChangeFile.bind(this), onRemoved: this.onRemove.bind(this) }),
                this.$render("i-label", { caption: 'Descriptions:' }),
                this.$render("i-grid-layout", { templateColumns: ['50%', '50%'] },
                    this.$render("i-input", { id: 'edtDescription', class: index_css_1.textareaStyle, width: '100%', height: '100%', display: 'flex', stack: { grow: '1' }, resize: "none", inputType: 'textarea', font: { size: Theme.typography.fontSize, name: Theme.typography.fontFamily }, onChanged: this.onMarkdownChanged.bind(this) }),
                    this.$render("i-markdown", { id: 'markdownViewer', width: '100%', height: '100%', padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }))));
        }
    };
    Config = __decorate([
        components_2.customModule,
        components_2.customElements("gem-token-config")
    ], Config);
    exports.default = Config;
});
