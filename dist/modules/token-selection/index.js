var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@pageblock-gem-token/token-selection/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.modalStyle = exports.tokenStyle = exports.buttonStyle = exports.scrollbarStyle = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    exports.scrollbarStyle = components_1.Styles.style({
        $nest: {
            '&::-webkit-scrollbar-track': {
                borderRadius: '12px',
                border: '1px solid transparent',
                backgroundColor: 'unset'
            },
            '&::-webkit-scrollbar': {
                width: '8px',
                backgroundColor: 'unset'
            },
            '&::-webkit-scrollbar-thumb': {
                borderRadius: '12px',
                background: '#d3d3d3 0% 0% no-repeat padding-box'
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: '#bababa 0% 0% no-repeat padding-box'
            }
        }
    });
    exports.buttonStyle = components_1.Styles.style({
        boxShadow: 'none'
    });
    exports.tokenStyle = components_1.Styles.style({
        $nest: {
            '&:hover': {
                background: Theme.action.hover
            }
        }
    });
    exports.modalStyle = components_1.Styles.style({
        $nest: {
            '.modal': {
                padding: 0,
                paddingBottom: '1rem',
                borderRadius: 8
            }
        }
    });
});
define("@pageblock-gem-token/token-selection", ["require", "exports", "@ijstech/components", "@pageblock-gem-token/store", "@pageblock-gem-token/assets", "@pageblock-gem-token/wallet", "@pageblock-gem-token/token-selection/index.css.ts"], function (require, exports, components_2, store_1, assets_1, wallet_1, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenSelection = void 0;
    const Theme = components_2.Styles.Theme.ThemeVars;
    const fallBackUrl = assets_1.default.tokenPath();
    ;
    let TokenSelection = class TokenSelection extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this._readonly = false;
            this.isInited = false;
            this.sortToken = (a, b, asc) => {
                const _symbol1 = a.symbol.toLowerCase();
                const _symbol2 = b.symbol.toLowerCase();
                if (_symbol1 < _symbol2) {
                    return -1;
                }
                if (_symbol1 > _symbol2) {
                    return 1;
                }
                return 0;
            };
            this.selectToken = (token) => {
                if (!this.enabled || this._readonly)
                    return;
                this.token = token;
                this.updateTokenButton(token);
                this.mdTokenSelection.visible = false;
                if (this.onSelectToken)
                    this.onSelectToken(token);
            };
            this.$eventBus = components_2.application.EventBus;
            this.registerEvent();
        }
        ;
        get token() {
            return this._token;
        }
        set token(value) {
            this._token = value;
            this.updateTokenButton(value);
        }
        get chainId() {
            return this._chainId;
        }
        set chainId(value) {
            this._chainId = value;
        }
        get readonly() {
            return this._readonly;
        }
        set readonly(value) {
            if (this._readonly != value) {
                this._readonly = value;
                this.btnTokens.style.cursor = this._readonly ? 'unset' : '';
                this.btnTokens.rightIcon.visible = !this._readonly;
            }
        }
        onSetup(init) {
            if (!this.isInited)
                this.init();
            this.renderTokenItems();
            if (init && this.token && !this.readonly) {
                const chainId = wallet_1.getChainId();
                const _tokenList = store_1.getTokenList(chainId);
                const token = _tokenList.find(t => { var _a, _b; return (t.address && t.address == ((_a = this.token) === null || _a === void 0 ? void 0 : _a.address)) || (t.symbol == ((_b = this.token) === null || _b === void 0 ? void 0 : _b.symbol)); });
                if (!token) {
                    this.token = undefined;
                }
            }
            if (this.token) {
                this.updateTokenButton(this.token);
            }
        }
        registerEvent() {
            this.$eventBus.register(this, "isWalletConnected" /* IsWalletConnected */, () => this.onSetup());
            this.$eventBus.register(this, "IsWalletDisconnected" /* IsWalletDisconnected */, () => this.onSetup());
            this.$eventBus.register(this, "chainChanged" /* chainChanged */, () => this.onSetup(true));
        }
        get tokenList() {
            const chainId = wallet_1.getChainId();
            const _tokenList = store_1.getTokenList(chainId);
            return _tokenList.map((token) => {
                const tokenObject = Object.assign({}, token);
                const nativeToken = store_1.ChainNativeTokenByChainId[chainId];
                if (token.symbol === nativeToken.symbol) {
                    Object.assign(tokenObject, { isNative: true });
                }
                if (!wallet_1.isWalletConnected()) {
                    Object.assign(tokenObject, {
                        balance: 0,
                    });
                }
                return tokenObject;
            }).sort(this.sortToken);
        }
        renderTokenItems() {
            this.gridTokenList.clearInnerHTML();
            const _tokenList = this.tokenList;
            if (_tokenList.length) {
                const tokenItems = _tokenList.map((token) => this.renderToken(token));
                this.gridTokenList.append(...tokenItems);
            }
            else {
                this.gridTokenList.append(this.$render("i-label", { margin: { top: '1rem', bottom: '1rem' }, caption: 'No tokens found' }));
            }
        }
        renderToken(token) {
            const chainId = wallet_1.getChainId();
            const tokenIconPath = assets_1.default.tokenPath(token, chainId);
            return (this.$render("i-hstack", { width: '100%', class: `pointer ${index_css_1.tokenStyle}`, verticalAlignment: 'center', padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, border: { radius: 5 }, gap: '0.5rem', onClick: () => this.selectToken(token) },
                this.$render("i-image", { width: 36, height: 36, url: tokenIconPath, fallbackUrl: fallBackUrl }),
                this.$render("i-vstack", { gap: '0.25rem' },
                    this.$render("i-label", { font: { size: '0.875rem', bold: true }, caption: token.symbol }),
                    this.$render("i-label", { font: { size: '0.75rem' }, caption: token.name }))));
        }
        updateTokenButton(token) {
            const chainId = this.chainId || wallet_1.getChainId();
            if (token) {
                const tokenIconPath = assets_1.default.tokenPath(token, chainId);
                const icon = new components_2.Icon(this.btnTokens, {
                    width: 28,
                    height: 28,
                    image: {
                        url: tokenIconPath,
                        fallBackUrl: fallBackUrl
                    }
                });
                this.btnTokens.icon = icon;
                this.btnTokens.caption = token.symbol;
                this.btnTokens.font = { bold: true, color: Theme.input.fontColor };
            }
            else {
                this.btnTokens.icon = undefined;
                this.btnTokens.caption = 'Select a token';
                this.btnTokens.font = { bold: false, color: Theme.input.fontColor };
            }
        }
        showTokenModal() {
            if (!this.enabled || this._readonly)
                return;
            this.mdTokenSelection.visible = true;
            this.gridTokenList.scrollTop = 0;
        }
        closeTokenModal() {
            this.mdTokenSelection.visible = false;
        }
        init() {
            super.init();
            this.readonly = this.getAttribute('readonly', true, false);
            this.isInited = true;
        }
        render() {
            return (this.$render("i-panel", null,
                this.$render("i-button", { id: 'btnTokens', class: `${index_css_1.buttonStyle} token-button`, width: '100%', height: 40, caption: 'Select a token', rightIcon: { width: 14, height: 14, name: 'angle-down' }, border: { radius: 0 }, background: { color: 'transparent' }, font: { color: Theme.input.fontColor }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, onClick: this.showTokenModal.bind(this) }),
                this.$render("i-modal", { id: 'mdTokenSelection', class: index_css_1.modalStyle, width: 400 },
                    this.$render("i-hstack", { horizontalAlignment: 'space-between', verticalAlignment: 'center', padding: { top: '1rem', bottom: '1rem' }, border: { bottom: { width: 1, style: 'solid', color: '#f1f1f1' } }, margin: { bottom: '1rem', left: '1rem', right: '1rem' }, gap: 4 },
                        this.$render("i-label", { caption: 'Select a token', font: { size: '1.125rem', bold: true } }),
                        this.$render("i-icon", { width: 24, height: 24, class: 'pointer', name: 'times', fill: Theme.colors.primary.main, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.25rem', right: '0.25rem' }, onClick: this.closeTokenModal.bind(this) })),
                    this.$render("i-grid-layout", { id: 'gridTokenList', class: index_css_1.scrollbarStyle, maxHeight: '45vh', columnsPerRow: 1, overflow: { y: 'auto' }, padding: { bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }))));
        }
    };
    TokenSelection = __decorate([
        components_2.customElements('gem-token-selection')
    ], TokenSelection);
    exports.TokenSelection = TokenSelection;
});
