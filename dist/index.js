var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-gem-token/interface.tsx", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
});
define("@scom/scom-gem-token/utils/token.ts", ["require", "exports", "@ijstech/eth-wallet"], function (require, exports, eth_wallet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerSendTxEvents = exports.getTokenBalance = exports.getERC20Amount = void 0;
    const getERC20Amount = async (wallet, tokenAddress, decimals) => {
        let erc20 = new eth_wallet_1.Erc20(wallet, tokenAddress, decimals);
        return await erc20.balance;
    };
    exports.getERC20Amount = getERC20Amount;
    const getTokenBalance = async (token) => {
        const wallet = eth_wallet_1.Wallet.getInstance();
        let balance = new eth_wallet_1.BigNumber(0);
        if (!token)
            return balance;
        if (token.address) {
            balance = await (0, exports.getERC20Amount)(wallet, token.address, token.decimals);
        }
        else {
            balance = await wallet.balance;
        }
        return balance;
    };
    exports.getTokenBalance = getTokenBalance;
    const registerSendTxEvents = (sendTxEventHandlers) => {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        wallet.registerSendTxEvents({
            transactionHash: (error, receipt) => {
                if (sendTxEventHandlers.transactionHash) {
                    sendTxEventHandlers.transactionHash(error, receipt);
                }
            },
            confirmation: (receipt) => {
                if (sendTxEventHandlers.confirmation) {
                    sendTxEventHandlers.confirmation(receipt);
                }
            },
        });
    };
    exports.registerSendTxEvents = registerSendTxEvents;
});
define("@scom/scom-gem-token/utils/approvalModel.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-gem-token/utils/token.ts"], function (require, exports, eth_wallet_2, token_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getERC20ApprovalModelAction = exports.getERC20Allowance = exports.ApprovalStatus = void 0;
    class ERC20ApprovalModel {
        constructor(options) {
            this.options = {
                sender: null,
                spenderAddress: '',
                payAction: async () => { },
                onToBeApproved: async (token) => { },
                onToBePaid: async (token) => { },
                onApproving: async (token, receipt, data) => { },
                onApproved: async (token, data) => { },
                onPaying: async (receipt, data) => { },
                onPaid: async (data) => { },
                onApprovingError: async (token, err) => { },
                onPayingError: async (err) => { }
            };
            this.setSpenderAddress = (value) => {
                this.options.spenderAddress = value;
            };
            this.checkAllowance = async (token, inputAmount) => {
                let allowance = await (0, exports.getERC20Allowance)(token, this.options.spenderAddress);
                if (!allowance) {
                    await this.options.onToBePaid.bind(this.options.sender)(token);
                }
                else if (new eth_wallet_2.BigNumber(inputAmount).gt(allowance)) {
                    await this.options.onToBeApproved.bind(this.options.sender)(token);
                }
                else {
                    await this.options.onToBePaid.bind(this.options.sender)(token);
                }
            };
            this.doApproveAction = async (token, inputAmount, data) => {
                const txHashCallback = async (err, receipt) => {
                    if (err) {
                        await this.options.onApprovingError.bind(this.options.sender)(token, err);
                    }
                    else {
                        await this.options.onApproving.bind(this.options.sender)(token, receipt, data);
                    }
                };
                const confirmationCallback = async (receipt) => {
                    await this.options.onApproved.bind(this.options.sender)(token, data);
                    await this.checkAllowance(token, inputAmount);
                };
                approveERC20Max(token, this.options.spenderAddress, txHashCallback, confirmationCallback);
            };
            this.doPayAction = async (data) => {
                const txHashCallback = async (err, receipt) => {
                    if (err) {
                        await this.options.onPayingError.bind(this.options.sender)(err);
                    }
                    else {
                        await this.options.onPaying.bind(this.options.sender)(receipt, data);
                    }
                };
                const confirmationCallback = async (receipt) => {
                    await this.options.onPaid.bind(this.options.sender)(data);
                };
                (0, token_1.registerSendTxEvents)({
                    transactionHash: txHashCallback,
                    confirmation: confirmationCallback
                });
                await this.options.payAction.bind(this.options.sender)();
            };
            this.getAction = () => {
                return {
                    setSpenderAddress: this.setSpenderAddress,
                    doApproveAction: this.doApproveAction,
                    doPayAction: this.doPayAction,
                    checkAllowance: this.checkAllowance
                };
            };
            this.options = options;
        }
    }
    var ApprovalStatus;
    (function (ApprovalStatus) {
        ApprovalStatus[ApprovalStatus["TO_BE_APPROVED"] = 0] = "TO_BE_APPROVED";
        ApprovalStatus[ApprovalStatus["APPROVING"] = 1] = "APPROVING";
        ApprovalStatus[ApprovalStatus["NONE"] = 2] = "NONE";
    })(ApprovalStatus = exports.ApprovalStatus || (exports.ApprovalStatus = {}));
    const approveERC20Max = async (token, spenderAddress, callback, confirmationCallback) => {
        let wallet = eth_wallet_2.Wallet.getInstance();
        let amount = new eth_wallet_2.BigNumber(2).pow(256).minus(1);
        let erc20 = new eth_wallet_2.Contracts.ERC20(wallet, token.address);
        (0, token_1.registerSendTxEvents)({
            transactionHash: callback,
            confirmation: confirmationCallback
        });
        let receipt = await erc20.approve({
            spender: spenderAddress,
            amount
        });
        return receipt;
    };
    const getERC20Allowance = async (token, spenderAddress) => {
        if (!token.address)
            return null;
        let wallet = eth_wallet_2.Wallet.getInstance();
        let erc20 = new eth_wallet_2.Contracts.ERC20(wallet, token.address);
        let allowance = await erc20.allowance({
            owner: wallet.address,
            spender: spenderAddress
        });
        return allowance;
    };
    exports.getERC20Allowance = getERC20Allowance;
    const getERC20ApprovalModelAction = (spenderAddress, options) => {
        const approvalOptions = Object.assign(Object.assign({}, options), { spenderAddress });
        const approvalModel = new ERC20ApprovalModel(approvalOptions);
        const approvalModelAction = approvalModel.getAction();
        return approvalModelAction;
    };
    exports.getERC20ApprovalModelAction = getERC20ApprovalModelAction;
});
define("@scom/scom-gem-token/utils/index.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-gem-token/utils/token.ts", "@scom/scom-gem-token/utils/approvalModel.ts"], function (require, exports, eth_wallet_3, token_2, approvalModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getERC20ApprovalModelAction = exports.getERC20Allowance = exports.ApprovalStatus = exports.registerSendTxEvents = exports.getTokenBalance = exports.getERC20Amount = exports.isWalletAddress = exports.parseContractError = exports.formatNumberWithSeparators = exports.formatNumber = void 0;
    const formatNumber = (value, decimals) => {
        let val = value;
        const minValue = '0.0000001';
        if (typeof value === 'string') {
            val = new eth_wallet_3.BigNumber(value).toNumber();
        }
        else if (typeof value === 'object') {
            val = value.toNumber();
        }
        if (val != 0 && new eth_wallet_3.BigNumber(val).lt(minValue)) {
            return `<${minValue}`;
        }
        return (0, exports.formatNumberWithSeparators)(val, decimals || 4);
    };
    exports.formatNumber = formatNumber;
    const formatNumberWithSeparators = (value, precision) => {
        if (!value)
            value = 0;
        if (precision) {
            let outputStr = '';
            if (value >= 1) {
                outputStr = value.toLocaleString('en-US', { maximumFractionDigits: precision });
            }
            else {
                outputStr = value.toLocaleString('en-US', { maximumSignificantDigits: precision });
            }
            if (outputStr.length > 18) {
                outputStr = outputStr.substr(0, 18) + '...';
            }
            return outputStr;
        }
        else {
            return value.toLocaleString('en-US');
        }
    };
    exports.formatNumberWithSeparators = formatNumberWithSeparators;
    function parseContractError(oMessage) {
        var _a;
        if (typeof oMessage === 'string')
            return oMessage;
        let message = '';
        if (oMessage.message && oMessage.message.includes('Internal JSON-RPC error.'))
            message = JSON.parse(oMessage.message.replace('Internal JSON-RPC error.\n', '')).message;
        else if (oMessage.message)
            message = oMessage.message;
        const staticMessageMap = {
            'execution reverted: OAXDEX: INVALID_SIGNATURE': 'Invalid signature',
            'execution reverted: OAXDEX: EXPIRED': 'Expired',
            'execution reverted: OAXDEX: OVERFLOW': 'Overflow',
            'MetaMask Tx Signature: User denied transaction signature.': 'User denied transaction signature',
            'execution reverted: backerCoin can\'t be a null address': 'BackerCoin can\'t be a null address',
            'execution reverted: price can\'t be zero': 'Price can\'t be zero',
            'execution reverted: mintingFee can\'t exceed 1': 'MintingFee can\'t exceed 1',
            'execution reverted: redemptionFee can\'t exceed 1': 'RedemptionFee can\'t exceed 1'
        };
        return (_a = staticMessageMap[message]) !== null && _a !== void 0 ? _a : `Unknown Error: ${message}`;
    }
    exports.parseContractError = parseContractError;
    function isWalletAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    exports.isWalletAddress = isWalletAddress;
    Object.defineProperty(exports, "getERC20Amount", { enumerable: true, get: function () { return token_2.getERC20Amount; } });
    Object.defineProperty(exports, "getTokenBalance", { enumerable: true, get: function () { return token_2.getTokenBalance; } });
    Object.defineProperty(exports, "registerSendTxEvents", { enumerable: true, get: function () { return token_2.registerSendTxEvents; } });
    Object.defineProperty(exports, "ApprovalStatus", { enumerable: true, get: function () { return approvalModel_1.ApprovalStatus; } });
    Object.defineProperty(exports, "getERC20Allowance", { enumerable: true, get: function () { return approvalModel_1.getERC20Allowance; } });
    Object.defineProperty(exports, "getERC20ApprovalModelAction", { enumerable: true, get: function () { return approvalModel_1.getERC20ApprovalModelAction; } });
});
define("@scom/scom-gem-token/store/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list"], function (require, exports, components_1, eth_wallet_4, scom_network_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getChainId = exports.isWalletConnected = exports.switchNetwork = exports.getDefaultChainId = exports.setDefaultChainId = exports.getEmbedderCommissionFee = exports.getProxyAddress = exports.setProxyAddresses = exports.setDataFromSCConfig = exports.state = exports.getSupportedNetworks = exports.getNetworkInfo = exports.WalletPlugin = void 0;
    var WalletPlugin;
    (function (WalletPlugin) {
        WalletPlugin["MetaMask"] = "metamask";
        WalletPlugin["WalletConnect"] = "walletconnect";
    })(WalletPlugin = exports.WalletPlugin || (exports.WalletPlugin = {}));
    const setNetworkList = (networkList, infuraId) => {
        const wallet = eth_wallet_4.Wallet.getClientInstance();
        exports.state.networkMap = {};
        const defaultNetworkList = (0, scom_network_list_1.default)();
        const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
            acc[cur.chainId] = cur;
            return acc;
        }, {});
        for (let network of networkList) {
            const networkInfo = defaultNetworkMap[network.chainId];
            if (!networkInfo)
                continue;
            if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
                for (let i = 0; i < network.rpcUrls.length; i++) {
                    network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                }
            }
            exports.state.networkMap[network.chainId] = Object.assign(Object.assign({}, networkInfo), network);
            wallet.setNetworkInfo(exports.state.networkMap[network.chainId]);
        }
    };
    const getNetworkInfo = (chainId) => {
        return exports.state.networkMap[chainId];
    };
    exports.getNetworkInfo = getNetworkInfo;
    const getSupportedNetworks = () => {
        return Object.values(exports.state.networkMap);
    };
    exports.getSupportedNetworks = getSupportedNetworks;
    exports.state = {
        defaultChainId: 1,
        networkMap: {},
        proxyAddresses: {},
        embedderCommissionFee: '0'
    };
    const setDataFromSCConfig = (options) => {
        if (options.networks) {
            setNetworkList(options.networks, options.infuraId);
        }
        if (options.proxyAddresses) {
            (0, exports.setProxyAddresses)(options.proxyAddresses);
        }
        if (options.embedderCommissionFee) {
            setEmbedderCommissionFee(options.embedderCommissionFee);
        }
    };
    exports.setDataFromSCConfig = setDataFromSCConfig;
    const setProxyAddresses = (data) => {
        exports.state.proxyAddresses = data;
    };
    exports.setProxyAddresses = setProxyAddresses;
    const getProxyAddress = (chainId) => {
        const _chainId = chainId || eth_wallet_4.Wallet.getInstance().chainId;
        const proxyAddresses = exports.state.proxyAddresses;
        if (proxyAddresses) {
            return proxyAddresses[_chainId];
        }
        return null;
    };
    exports.getProxyAddress = getProxyAddress;
    const setEmbedderCommissionFee = (fee) => {
        exports.state.embedderCommissionFee = fee;
    };
    const getEmbedderCommissionFee = () => {
        return exports.state.embedderCommissionFee;
    };
    exports.getEmbedderCommissionFee = getEmbedderCommissionFee;
    const setDefaultChainId = (chainId) => {
        exports.state.defaultChainId = chainId;
    };
    exports.setDefaultChainId = setDefaultChainId;
    const getDefaultChainId = () => {
        return exports.state.defaultChainId;
    };
    exports.getDefaultChainId = getDefaultChainId;
    async function switchNetwork(chainId) {
        var _a;
        if (!isWalletConnected()) {
            components_1.application.EventBus.dispatch("chainChanged" /* EventId.chainChanged */, chainId);
            return;
        }
        const wallet = eth_wallet_4.Wallet.getClientInstance();
        if (((_a = wallet === null || wallet === void 0 ? void 0 : wallet.clientSideProvider) === null || _a === void 0 ? void 0 : _a.name) === WalletPlugin.MetaMask) {
            await wallet.switchNetwork(chainId);
        }
    }
    exports.switchNetwork = switchNetwork;
    function isWalletConnected() {
        const wallet = eth_wallet_4.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isWalletConnected = isWalletConnected;
    const getChainId = () => {
        const wallet = eth_wallet_4.Wallet.getInstance();
        return isWalletConnected() ? wallet.chainId : (0, exports.getDefaultChainId)();
    };
    exports.getChainId = getChainId;
});
define("@scom/scom-gem-token/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDir = components_2.application.currentModuleDir;
    function fullPath(path) {
        return `${moduleDir}/${path}`;
    }
    ;
    exports.default = {
        logo: fullPath('img/logo.svg'),
        fullPath
    };
});
define("@scom/scom-gem-token/token-selection/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.modalStyle = exports.tokenStyle = exports.buttonStyle = exports.scrollbarStyle = void 0;
    const Theme = components_3.Styles.Theme.ThemeVars;
    exports.scrollbarStyle = components_3.Styles.style({
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
    exports.buttonStyle = components_3.Styles.style({
        boxShadow: 'none'
    });
    exports.tokenStyle = components_3.Styles.style({
        $nest: {
            '&:hover': {
                background: Theme.action.hover
            }
        }
    });
    exports.modalStyle = components_3.Styles.style({
        $nest: {
            '.modal': {
                padding: 0,
                paddingBottom: '1rem',
                borderRadius: 8
            }
        }
    });
});
define("@scom/scom-gem-token/token-selection/index.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-gem-token/store/index.ts", "@scom/scom-token-list", "@scom/scom-gem-token/token-selection/index.css.ts"], function (require, exports, components_4, index_1, scom_token_list_1, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenSelection = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    ;
    let TokenSelection = class TokenSelection extends components_4.Module {
        constructor(parent, options) {
            super(parent, options);
            this._readonly = false;
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
                this.updateTokenButton();
                this.mdTokenSelection.visible = false;
                if (this.onSelectToken)
                    this.onSelectToken(token);
            };
            this.$eventBus = components_4.application.EventBus;
            this.registerEvent();
        }
        ;
        get token() {
            return this._token;
        }
        set token(value) {
            this._token = value;
            this.updateTokenButton();
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
                this.updateStatusButton();
            }
        }
        onSetup(init) {
            this.renderTokenItems();
            if (init && this.token && !this.readonly) {
                const chainId = (0, index_1.getChainId)();
                const _tokenList = scom_token_list_1.tokenStore.getTokenList(chainId);
                const token = _tokenList.find(t => { var _a, _b; return (t.address && t.address == ((_a = this.token) === null || _a === void 0 ? void 0 : _a.address)) || (t.symbol == ((_b = this.token) === null || _b === void 0 ? void 0 : _b.symbol)); });
                if (!token)
                    this.token = undefined;
            }
            this.updateTokenButton();
        }
        registerEvent() {
            this.$eventBus.register(this, "isWalletConnected" /* EventId.IsWalletConnected */, () => this.onSetup());
            this.$eventBus.register(this, "IsWalletDisconnected" /* EventId.IsWalletDisconnected */, () => this.onSetup());
            this.$eventBus.register(this, "chainChanged" /* EventId.chainChanged */, () => this.onSetup(true));
        }
        get tokenList() {
            const chainId = (0, index_1.getChainId)();
            const _tokenList = scom_token_list_1.tokenStore.getTokenList(chainId);
            return _tokenList.map((token) => {
                const tokenObject = Object.assign({}, token);
                const nativeToken = scom_token_list_1.ChainNativeTokenByChainId[chainId];
                if (token.symbol === nativeToken.symbol) {
                    Object.assign(tokenObject, { isNative: true });
                }
                if (!(0, index_1.isWalletConnected)()) {
                    Object.assign(tokenObject, {
                        balance: 0,
                    });
                }
                return tokenObject;
            }).sort(this.sortToken);
        }
        renderTokenItems() {
            if (!this.gridTokenList)
                return;
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
            const chainId = (0, index_1.getChainId)();
            const tokenIconPath = scom_token_list_1.assets.tokenPath(token, chainId);
            return (this.$render("i-hstack", { width: '100%', class: `pointer ${index_css_1.tokenStyle}`, verticalAlignment: 'center', padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, border: { radius: 5 }, gap: '0.5rem', onClick: () => this.selectToken(token) },
                this.$render("i-image", { width: 36, height: 36, url: tokenIconPath, fallbackUrl: scom_token_list_1.assets.fallbackUrl }),
                this.$render("i-vstack", { gap: '0.25rem' },
                    this.$render("i-label", { font: { size: '0.875rem', bold: true }, caption: token.symbol }),
                    this.$render("i-label", { font: { size: '0.75rem' }, caption: token.name }))));
        }
        async updateStatusButton() {
            if (!this.btnTokens)
                return;
            this.btnTokens.style.cursor = this._readonly ? 'default' : '';
            this.btnTokens.rightIcon.visible = !this._readonly;
        }
        updateTokenButton() {
            if (!this.btnTokens)
                return;
            const token = this.token;
            const chainId = this.chainId || (0, index_1.getChainId)();
            if (token /*&& isWalletConnected()*/) {
                const tokenIconPath = scom_token_list_1.assets.tokenPath(token, chainId);
                const icon = new components_4.Icon(this.btnTokens, {
                    width: 28,
                    height: 28,
                    image: {
                        url: tokenIconPath,
                        fallBackUrl: scom_token_list_1.assets.fallbackUrl
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
            const readonly = this.getAttribute('readonly', true);
            if (readonly !== undefined) {
                this.readonly = readonly;
            }
            else {
                this.updateStatusButton();
            }
            this.onSetup();
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
        (0, components_4.customElements)('i-scom-gem-token-selection')
    ], TokenSelection);
    exports.TokenSelection = TokenSelection;
});
define("@scom/scom-gem-token/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.centerStyle = exports.tokenSelectionStyle = exports.inputStyle = exports.markdownStyle = exports.imageStyle = void 0;
    const Theme = components_5.Styles.Theme.ThemeVars;
    exports.imageStyle = components_5.Styles.style({
        $nest: {
            '&>img': {
                maxWidth: 'unset',
                maxHeight: 'unset',
                borderRadius: 4
            }
        }
    });
    exports.markdownStyle = components_5.Styles.style({
        overflowWrap: 'break-word'
    });
    exports.inputStyle = components_5.Styles.style({
        $nest: {
            '> input': {
                background: Theme.input.background,
                color: Theme.input.fontColor,
                padding: '0.25rem 0.5rem',
                textAlign: 'right'
            },
            'input[readonly]': {
                cursor: 'default'
            }
        }
    });
    exports.tokenSelectionStyle = components_5.Styles.style({
        $nest: {
            'i-button.token-button': {
                justifyContent: 'start'
            }
        }
    });
    exports.centerStyle = components_5.Styles.style({
        textAlign: 'center'
    });
});
define("@scom/scom-gem-token/alert/index.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Alert = void 0;
    const Theme = components_6.Styles.Theme.ThemeVars;
    ;
    let Alert = class Alert extends components_6.Module {
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
        (0, components_6.customElements)('i-scom-gem-token-alert')
    ], Alert);
    exports.Alert = Alert;
    ;
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts'/> 
    exports.default = {
        "abi": [
            { "inputs": [{ "internalType": "string", "name": "name_", "type": "string" }, { "internalType": "string", "name": "symbol_", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
            { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
        ],
        "bytecode": "60806040523480156200001157600080fd5b5060405162000e0f38038062000e0f83398101604081905262000034916200011f565b600362000042838262000218565b50600462000051828262000218565b505050620002e4565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200008257600080fd5b81516001600160401b03808211156200009f576200009f6200005a565b604051601f8301601f19908116603f01168101908282118183101715620000ca57620000ca6200005a565b81604052838152602092508683858801011115620000e757600080fd5b600091505b838210156200010b5785820183015181830184015290820190620000ec565b600093810190920192909252949350505050565b600080604083850312156200013357600080fd5b82516001600160401b03808211156200014b57600080fd5b620001598683870162000070565b935060208501519150808211156200017057600080fd5b506200017f8582860162000070565b9150509250929050565b600181811c908216806200019e57607f821691505b602082108103620001bf57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200021357600081815260208120601f850160051c81016020861015620001ee5750805b601f850160051c820191505b818110156200020f57828155600101620001fa565b5050505b505050565b81516001600160401b038111156200023457620002346200005a565b6200024c8162000245845462000189565b84620001c5565b602080601f8311600181146200028457600084156200026b5750858301515b600019600386901b1c1916600185901b1785556200020f565b600085815260208120601f198616915b82811015620002b55788860151825594840194600190910190840162000294565b5085821015620002d45787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b610b1b80620002f46000396000f3fe608060405234801561001057600080fd5b50600436106100c95760003560e01c80633950935111610081578063a457c2d71161005b578063a457c2d714610194578063a9059cbb146101a7578063dd62ed3e146101ba57600080fd5b8063395093511461014357806370a082311461015657806395d89b411461018c57600080fd5b806318160ddd116100b257806318160ddd1461010f57806323b872dd14610121578063313ce5671461013457600080fd5b806306fdde03146100ce578063095ea7b3146100ec575b600080fd5b6100d6610200565b6040516100e39190610908565b60405180910390f35b6100ff6100fa36600461099d565b610292565b60405190151581526020016100e3565b6002545b6040519081526020016100e3565b6100ff61012f3660046109c7565b6102ac565b604051601281526020016100e3565b6100ff61015136600461099d565b6102d0565b610113610164366004610a03565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6100d661031c565b6100ff6101a236600461099d565b61032b565b6100ff6101b536600461099d565b610401565b6101136101c8366004610a25565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b60606003805461020f90610a58565b80601f016020809104026020016040519081016040528092919081815260200182805461023b90610a58565b80156102885780601f1061025d57610100808354040283529160200191610288565b820191906000526020600020905b81548152906001019060200180831161026b57829003601f168201915b5050505050905090565b6000336102a081858561040f565b60019150505b92915050565b6000336102ba8582856105c2565b6102c5858585610699565b506001949350505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff871684529091528120549091906102a09082908690610317908790610aab565b61040f565b60606004805461020f90610a58565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909190838110156103f4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6102c5828686840361040f565b6000336102a0818585610699565b73ffffffffffffffffffffffffffffffffffffffff83166104b1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff8216610554576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f737300000000000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600160209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146106935781811015610686576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016103eb565b610693848484840361040f565b50505050565b73ffffffffffffffffffffffffffffffffffffffff831661073c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f647265737300000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff82166107df576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f657373000000000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610895576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e6365000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3610693565b600060208083528351808285015260005b8181101561093557858101830151858201604001528201610919565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8301168501019250505092915050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461099857600080fd5b919050565b600080604083850312156109b057600080fd5b6109b983610974565b946020939093013593505050565b6000806000606084860312156109dc57600080fd5b6109e584610974565b92506109f360208501610974565b9150604084013590509250925092565b600060208284031215610a1557600080fd5b610a1e82610974565b9392505050565b60008060408385031215610a3857600080fd5b610a4183610974565b9150610a4f60208401610974565b90509250929050565b600181811c90821680610a6c57607f821691505b602082108103610aa5577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b808201808211156102a6577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fdfea26469706673582212200b1c8209991f9f505c1b93652182a21c393f29b72d5b8e98cb86249fd9872e6664736f6c63430008110033"
    };
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts", ["require", "exports", "@ijstech/eth-contract", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts"], function (require, exports, eth_contract_1, ERC20_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERC20 = void 0;
    class ERC20 extends eth_contract_1.Contract {
        constructor(wallet, address) {
            super(wallet, address, ERC20_json_1.default.abi, ERC20_json_1.default.bytecode);
            this.assign();
        }
        deploy(params, options) {
            return this.__deploy([params.name, params.symbol], options);
        }
        parseApprovalEvent(receipt) {
            return this.parseEvents(receipt, "Approval").map(e => this.decodeApprovalEvent(e));
        }
        decodeApprovalEvent(event) {
            let result = event.data;
            return {
                owner: result.owner,
                spender: result.spender,
                value: new eth_contract_1.BigNumber(result.value),
                _event: event
            };
        }
        parseTransferEvent(receipt) {
            return this.parseEvents(receipt, "Transfer").map(e => this.decodeTransferEvent(e));
        }
        decodeTransferEvent(event) {
            let result = event.data;
            return {
                from: result.from,
                to: result.to,
                value: new eth_contract_1.BigNumber(result.value),
                _event: event
            };
        }
        assign() {
            let allowanceParams = (params) => [params.owner, params.spender];
            let allowance_call = async (params, options) => {
                let result = await this.call('allowance', allowanceParams(params), options);
                return new eth_contract_1.BigNumber(result);
            };
            this.allowance = allowance_call;
            let balanceOf_call = async (account, options) => {
                let result = await this.call('balanceOf', [account], options);
                return new eth_contract_1.BigNumber(result);
            };
            this.balanceOf = balanceOf_call;
            let decimals_call = async (options) => {
                let result = await this.call('decimals', [], options);
                return new eth_contract_1.BigNumber(result);
            };
            this.decimals = decimals_call;
            let name_call = async (options) => {
                let result = await this.call('name', [], options);
                return result;
            };
            this.name = name_call;
            let symbol_call = async (options) => {
                let result = await this.call('symbol', [], options);
                return result;
            };
            this.symbol = symbol_call;
            let totalSupply_call = async (options) => {
                let result = await this.call('totalSupply', [], options);
                return new eth_contract_1.BigNumber(result);
            };
            this.totalSupply = totalSupply_call;
            let approveParams = (params) => [params.spender, this.wallet.utils.toString(params.amount)];
            let approve_send = async (params, options) => {
                let result = await this.send('approve', approveParams(params), options);
                return result;
            };
            let approve_call = async (params, options) => {
                let result = await this.call('approve', approveParams(params), options);
                return result;
            };
            let approve_txData = async (params, options) => {
                let result = await this.txData('approve', approveParams(params), options);
                return result;
            };
            this.approve = Object.assign(approve_send, {
                call: approve_call,
                txData: approve_txData
            });
            let decreaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.subtractedValue)];
            let decreaseAllowance_send = async (params, options) => {
                let result = await this.send('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            let decreaseAllowance_call = async (params, options) => {
                let result = await this.call('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            let decreaseAllowance_txData = async (params, options) => {
                let result = await this.txData('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            this.decreaseAllowance = Object.assign(decreaseAllowance_send, {
                call: decreaseAllowance_call,
                txData: decreaseAllowance_txData
            });
            let increaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.addedValue)];
            let increaseAllowance_send = async (params, options) => {
                let result = await this.send('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            let increaseAllowance_call = async (params, options) => {
                let result = await this.call('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            let increaseAllowance_txData = async (params, options) => {
                let result = await this.txData('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            this.increaseAllowance = Object.assign(increaseAllowance_send, {
                call: increaseAllowance_call,
                txData: increaseAllowance_txData
            });
            let transferParams = (params) => [params.to, this.wallet.utils.toString(params.amount)];
            let transfer_send = async (params, options) => {
                let result = await this.send('transfer', transferParams(params), options);
                return result;
            };
            let transfer_call = async (params, options) => {
                let result = await this.call('transfer', transferParams(params), options);
                return result;
            };
            let transfer_txData = async (params, options) => {
                let result = await this.txData('transfer', transferParams(params), options);
                return result;
            };
            this.transfer = Object.assign(transfer_send, {
                call: transfer_call,
                txData: transfer_txData
            });
            let transferFromParams = (params) => [params.from, params.to, this.wallet.utils.toString(params.amount)];
            let transferFrom_send = async (params, options) => {
                let result = await this.send('transferFrom', transferFromParams(params), options);
                return result;
            };
            let transferFrom_call = async (params, options) => {
                let result = await this.call('transferFrom', transferFromParams(params), options);
                return result;
            };
            let transferFrom_txData = async (params, options) => {
                let result = await this.txData('transferFrom', transferFromParams(params), options);
                return result;
            };
            this.transferFrom = Object.assign(transferFrom_send, {
                call: transferFrom_call,
                txData: transferFrom_txData
            });
        }
    }
    ERC20._abi = ERC20_json_1.default.abi;
    exports.ERC20 = ERC20;
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.json.ts'/> 
    exports.default = {
        "abi": [
            { "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "_cap", "type": "uint256" }, { "internalType": "contract IERC20Metadata", "name": "_baseToken", "type": "address" }, { "internalType": "uint256", "name": "_price", "type": "uint256" }, { "internalType": "uint256", "name": "_mintingFee", "type": "uint256" }, { "internalType": "uint256", "name": "_redemptionFee", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "Authorize", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "baseTokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "gemAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "Buy", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "Deauthorize", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "redeemer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "gemAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "baseTokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "Redeem", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "StartOwnershipTransfer", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "TransferOwnership", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "baseTokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newFeeBalance", "type": "uint256" }], "name": "TreasuryRedeem", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "cap", "type": "uint256" }], "name": "UpdateCap", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "mintingFee", "type": "uint256" }], "name": "UpdateMintingFee", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "redemptionFee", "type": "uint256" }], "name": "UpdateRedemptionFee", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "treasury", "type": "address" }], "name": "UpdateTreasury", "type": "event" },
            { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "baseToken", "outputs": [{ "internalType": "contract IERC20Metadata", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "buy", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "cap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "decimalsDelta", "outputs": [{ "internalType": "int8", "name": "", "type": "int8" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "deny", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "depositBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "feeBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isPermitted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "mintingFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newCap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newCapEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newMintingFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newMintingFeeEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newRedemptionFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newRedemptionFeeEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newTreasury", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newTreasuryEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "price", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "redeemFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "redemptionFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "sync", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "takeOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "newOwner_", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "treasury", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "_cap", "type": "uint256" }], "name": "updateCap", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "_mintingFee", "type": "uint256" }], "name": "updateMintingFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "_redemptionFee", "type": "uint256" }], "name": "updateRedemptionFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "_treasury", "type": "address" }], "name": "updateTreasury", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
        ],
        "bytecode": "60c06040523480156200001157600080fd5b50604051620034e2380380620034e28339810160408190526200003491620002a5565b600080546001600160a01b0319163317905586866006620000568382620003e8565b506007620000658282620003e8565b50506008805460ff191690555060016009556001600160a01b038416620000dd5760405162461bcd60e51b815260206004820152602160248201527f62617365546f6b656e2063616e27742062652061206e756c6c206164647265736044820152607360f81b60648201526084015b60405180910390fd5b826000036200012f5760405162461bcd60e51b815260206004820152601360248201527f70726963652063616e2774206265207a65726f000000000000000000000000006044820152606401620000d4565b6012846001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000170573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620001969190620004b4565b620001a29190620004e0565b60000b60a052600a949094556001600160a01b03909216608052600b55600c80546001600160a01b03191633179055600d55600e5550620005169050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200020857600080fd5b81516001600160401b0380821115620002255762000225620001e0565b604051601f8301601f19908116603f01168101908282118183101715620002505762000250620001e0565b816040528381526020925086838588010111156200026d57600080fd5b600091505b8382101562000291578582018301518183018401529082019062000272565b600093810190920192909252949350505050565b600080600080600080600060e0888a031215620002c157600080fd5b87516001600160401b0380821115620002d957600080fd5b620002e78b838c01620001f6565b985060208a0151915080821115620002fe57600080fd5b506200030d8a828b01620001f6565b60408a015160608b0151919850965090506001600160a01b03811681146200033457600080fd5b809450506080880151925060a0880151915060c0880151905092959891949750929550565b600181811c908216806200036e57607f821691505b6020821081036200038f57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620003e357600081815260208120601f850160051c81016020861015620003be5750805b601f850160051c820191505b81811015620003df57828155600101620003ca565b5050505b505050565b81516001600160401b03811115620004045762000404620001e0565b6200041c8162000415845462000359565b8462000395565b602080601f8311600181146200045457600084156200043b5750858301515b600019600386901b1c1916600185901b178555620003df565b600085815260208120601f198616915b82811015620004855788860151825594840194600190910190840162000464565b5085821015620004a45787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b600060208284031215620004c757600080fd5b815160ff81168114620004d957600080fd5b9392505050565b600082810b9082900b03607f198112607f821317156200051057634e487b7160e01b600052601160045260246000fd5b92915050565b60805160a051612f446200059e60003960008181610654015281816112240152818161124f0152818161127c015281816112b801528181611405015281816114300152818161145d015261149901526000818161058f01528181611551015281816118b201528181611a680152818161225b015281816122f7015261234f0152612f446000f3fe608060405234801561001057600080fd5b506004361061030a5760003560e01c80638456cb591161019c578063c55dae63116100ee578063dd62ed3e11610097578063f87fcd0f11610071578063f87fcd0f1461069c578063f913036d146106af578063fff6cae9146106c257600080fd5b8063dd62ed3e14610609578063f0484a771461064f578063f2fde38b1461068957600080fd5b8063d96a094a116100c8578063d96a094a146105da578063d9a3ce36146105ed578063db006a75146105f657600080fd5b8063c55dae631461058a578063d4ee1d90146105b1578063d8b954ed146105d157600080fd5b8063a035b1fe11610150578063a7d688961161012a578063a7d6889614610551578063a9059cbb14610564578063c0275a251461057757600080fd5b8063a035b1fe14610522578063a2f55ae51461052b578063a457c2d71461053e57600080fd5b806394bf74921161018157806394bf7492146104fe57806395d89b41146105075780639c52a7f11461050f57600080fd5b80638456cb59146104d65780638da5cb5b146104de57600080fd5b8063458f58151161026057806361d027b31161020957806375808390116101e357806375808390146104b1578063798bd59f146104ba5780637f51bb1f146104c357600080fd5b806361d027b31461045257806370a08231146104725780637572a2bc146104a857600080fd5b8063605361721161023a578063605361721461043857806360b71d4e1461044057806361bc1a491461044957600080fd5b8063458f58151461041b5780635a64ad95146104245780635c975abb1461042d57600080fd5b8063313ce567116102c25780633f4ba83a1161029c5780633f4ba83a146103a95780633fd8cc4e146103b35780634579b8b4146103d657600080fd5b8063313ce5671461037e578063355274ea1461038d578063395093511461039657600080fd5b806318160ddd116102f357806318160ddd14610350578063208c6eee1461036257806323b872dd1461036b57600080fd5b806306fdde031461030f578063095ea7b31461032d575b600080fd5b6103176106ca565b6040516103249190612b09565b60405180910390f35b61034061033b366004612b83565b61075c565b6040519015158152602001610324565b6005545b604051908152602001610324565b61035460135481565b610340610379366004612bad565b610776565b60405160128152602001610324565b610354600a5481565b6103406103a4366004612b83565b61079a565b6103b16107e6565b005b6103406103c1366004612be9565b60026020526000908152604090205460ff1681565b6011546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610324565b610354600e5481565b610354600d5481565b60085460ff16610340565b6103b16108be565b61035460185481565b61035460175481565b600c546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b610354610480366004612be9565b73ffffffffffffffffffffffffffffffffffffffff1660009081526003602052604090205490565b61035460165481565b61035460105481565b61035460155481565b6103b16104d1366004612be9565b6109e9565b6103b1610b31565b6000546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b61035460125481565b610317610c02565b6103b161051d366004612be9565b610c11565b610354600b5481565b6103b1610539366004612be9565b610d34565b61034061054c366004612b83565b610e5a565b6103b161055f366004612c04565b610f2b565b610340610572366004612b83565b611050565b6103b1610585366004612c04565b61105e565b6103f67f000000000000000000000000000000000000000000000000000000000000000081565b6001546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b610354600f5481565b6103b16105e8366004612c04565b611180565b61035460145481565b6103b1610604366004612c04565b6113cd565b610354610617366004612c1d565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260046020908152604080832093909416825291909152205490565b6106767f000000000000000000000000000000000000000000000000000000000000000081565b60405160009190910b8152602001610324565b6103b1610697366004612be9565b6115b8565b6103b16106aa366004612c04565b6116d2565b6103b16106bd366004612c04565b611915565b6103b1611a37565b6060600680546106d990612c50565b80601f016020809104026020016040519081016040528092919081815260200182805461070590612c50565b80156107525780601f1061072757610100808354040283529160200191610752565b820191906000526020600020905b81548152906001019060200180831161073557829003601f168201915b5050505050905090565b60003361076a818585611b0a565b60019150505b92915050565b600033610784858285611cbe565b61078f858585611d95565b506001949350505050565b33600081815260046020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490919061076a90829086906107e1908790612cd2565b611b0a565b60005473ffffffffffffffffffffffffffffffffffffffff1633148061081b57503360009081526002602052604090205460ff165b6108ac576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6108b461200b565b6108bc612077565b565b60015473ffffffffffffffffffffffffffffffffffffffff163314610965576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084016108a3565b600180546000805473ffffffffffffffffffffffffffffffffffffffff83167fffffffffffffffffffffffff000000000000000000000000000000000000000091821681179092559091169091556040519081527fcfaaa26691e16e66e73290fc725eee1a6b4e0e693a1640484937aac25ffb55a4906020015b60405180910390a1565b60005473ffffffffffffffffffffffffffffffffffffffff163314610a90576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b601180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8316179055610add6202a30042612cd2565b60125560115460405173ffffffffffffffffffffffffffffffffffffffff90911681527f1f54d231bb9d500b1923e4a1cb25e600f366a8368873d9af7c1c623814df19fc906020015b60405180910390a150565b60005473ffffffffffffffffffffffffffffffffffffffff16331480610b6657503360009081526002602052604090205460ff165b610bf2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084016108a3565b610bfa6120ef565b6108bc61215c565b6060600780546106d990612c50565b60005473ffffffffffffffffffffffffffffffffffffffff163314610cb8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff811660008181526002602090815260409182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016905590519182527f79ede3839cd7a7d8bd77e97e5c890565fe4f76cdbbeaa364646e28a8695a78849101610b26565b60005473ffffffffffffffffffffffffffffffffffffffff163314610ddb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff811660008181526002602090815260409182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600117905590519182527f6d81a01b39982517ba331aeb4f387b0f9cc32334b65bb9a343a077973cf7adf59101610b26565b33600081815260046020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490919083811015610f1e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084016108a3565b61078f8286868403611b0a565b60005473ffffffffffffffffffffffffffffffffffffffff163314610fd2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b60105415801590610fe45750600f5481145b8015610ff257506010544210155b15611005576000601055600f54600a5550565b600f8190556110176202a30042612cd2565b601055600f546040519081527f3b499d333a6661bd0059d289a2b6f94c0031fa04fa48949544552fcc2021c0bc90602001610b26565b50565b60003361076a818585611d95565b60005473ffffffffffffffffffffffffffffffffffffffff163314611105576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b60145415801590611117575060135481145b801561112557506014544210155b15611138576000601455601354600d5550565b601381905561114a6202a30042612cd2565b6014556013546040519081527f1c9debc18a776994f1856d0eedf7d2861a46d412d421c170674d9329b5c53b2390602001610b26565b6111886121b7565b6111906120ef565b61119a338261222a565b905080601760008282546111ae9190612cd2565b9091555050600d54600090670de0b6b3a7640000906111cd9084612ce5565b6111d79190612cfc565b90506111e38183612d37565b915080601860008282546111f79190612cd2565b9091555050600b54600090670de0b6b3a7640000906112169085612ce5565b6112209190612cfc565b90507f000000000000000000000000000000000000000000000000000000000000000060000b156112f45760007f000000000000000000000000000000000000000000000000000000000000000060000b13156112b3576112a27f0000000000000000000000000000000000000000000000000000000000000000600a612e6a565b6112ac9082612cfc565b90506112f4565b6112dc7f0000000000000000000000000000000000000000000000000000000000000000612e79565b6112e790600a612e6a565b6112f19082612ce5565b90505b600a548161130160055490565b61130b9190612cd2565b1115611373576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600c60248201527f636170206578636565646564000000000000000000000000000000000000000060448201526064016108a3565b61137d33826123e0565b604080518481526020810183905290810183905233907fbeae048c6d270d9469f86cf6e8fedda3c60ad770f16c24c9fc131c8e9a09101d906060015b60405180910390a2505061104d6001600955565b6113d56121b7565b6113df33826124d5565b600b546000906113f783670de0b6b3a7640000612ce5565b6114019190612cfc565b90507f000000000000000000000000000000000000000000000000000000000000000060000b156114d55760007f000000000000000000000000000000000000000000000000000000000000000060000b1315611494576114837f0000000000000000000000000000000000000000000000000000000000000000600a612e6a565b61148d9082612ce5565b90506114d5565b6114bd7f0000000000000000000000000000000000000000000000000000000000000000612e79565b6114c890600a612e6a565b6114d29082612cfc565b90505b6000670de0b6b3a7640000600e54836114ee9190612ce5565b6114f89190612cfc565b90506115048183612d37565b915080601860008282546115189190612cd2565b9250508190555081601760008282546115319190612d37565b90915550611578905073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000163384612698565b604080518481526020810184905290810182905233907fbd5034ffbd47e4e72a94baa2cdb74c6fad73cb3bcdc13036b72ec8306f5a7646906060016113b9565b60005473ffffffffffffffffffffffffffffffffffffffff16331461165f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff83169081179091556040519081527f686a7ab184e6928ddedba810af7b443d6baa40bf32c4787ccd72c5b4b28cae1b90602001610b26565b60005473ffffffffffffffffffffffffffffffffffffffff1633148061170757503360009081526002602052604090205460ff165b611793576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084016108a3565b601254158015906117a657506012544210155b156117f8576000601255601154600c80547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff9092169190911790555b601854811115611864576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f616d6f756e7420657863656564656420746865206665652062616c616e63650060448201526064016108a3565b80601860008282546118769190612d37565b92505081905550806017600082825461188f9190612d37565b9091555050600c546118db9073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000008116911683612698565b6018546040805183815260208101929092527f3799298d314837711ad9f0d00ed3bbb028e5b7ae43b72ce603fc640dc977380d9101610b26565b60005473ffffffffffffffffffffffffffffffffffffffff1633146119bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b601654158015906119ce575060155481145b80156119dc57506016544210155b156119ef576000601655601554600e5550565b6015819055611a01624f1a0042612cd2565b6016556015546040519081527fcb4fe4659d0bb0c9b214dcf3dd2bd69ba7c28e367a8613927bb1fe619200cc0c90602001610b26565b6017546040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa158015611ac4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611ae89190612eb7565b611af29190612d37565b60186000828254611b039190612cd2565b9091555050565b73ffffffffffffffffffffffffffffffffffffffff8316611bac576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff8216611c4f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f737300000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526004602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600460209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114611d8f5781811015611d82576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016108a3565b611d8f8484848403611b0a565b50505050565b73ffffffffffffffffffffffffffffffffffffffff8316611e38576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f647265737300000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff8216611edb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f657373000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff831660009081526003602052604090205481811015611f91576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e6365000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff80851660008181526003602052604080822086860390559286168082529083902080548601905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90611ffe9086815260200190565b60405180910390a3611d8f565b60085460ff166108bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f5061757361626c653a206e6f742070617573656400000000000000000000000060448201526064016108a3565b61207f61200b565b600880547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016109df565b60085460ff16156108bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a207061757365640000000000000000000000000000000060448201526064016108a3565b6121646120ef565b600880547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586120ca3390565b600260095403612223576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016108a3565b6002600955565b6040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa1580156122b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122db9190612eb7565b905061231f73ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001684308561276c565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015281907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa1580156123ab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123cf9190612eb7565b6123d99190612d37565b9392505050565b73ffffffffffffffffffffffffffffffffffffffff821661245d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064016108a3565b806005600082825461246f9190612cd2565b909155505073ffffffffffffffffffffffffffffffffffffffff82166000818152600360209081526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b73ffffffffffffffffffffffffffffffffffffffff8216612578576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360448201527f730000000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff82166000908152600360205260409020548181101561262e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60448201527f636500000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff831660008181526003602090815260408083208686039055600580548790039055518581529192917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9101611cb1565b505050565b60405173ffffffffffffffffffffffffffffffffffffffff83166024820152604481018290526126939084907fa9059cbb00000000000000000000000000000000000000000000000000000000906064015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff00000000000000000000000000000000000000000000000000000000909316929092179091526127ca565b60405173ffffffffffffffffffffffffffffffffffffffff80851660248301528316604482015260648101829052611d8f9085907f23b872dd00000000000000000000000000000000000000000000000000000000906084016126ea565b600061282c826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166128d69092919063ffffffff16565b805190915015612693578080602001905181019061284a9190612ed0565b612693576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f7420737563636565640000000000000000000000000000000000000000000060648201526084016108a3565b60606128e584846000856128ed565b949350505050565b60608247101561297f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c000000000000000000000000000000000000000000000000000060648201526084016108a3565b6000808673ffffffffffffffffffffffffffffffffffffffff1685876040516129a89190612ef2565b60006040518083038185875af1925050503d80600081146129e5576040519150601f19603f3d011682016040523d82523d6000602084013e6129ea565b606091505b50915091506129fb87838387612a06565b979650505050505050565b60608315612a9c578251600003612a955773ffffffffffffffffffffffffffffffffffffffff85163b612a95576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016108a3565b50816128e5565b6128e58383815115612ab15781518083602001fd5b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108a39190612b09565b60005b83811015612b00578181015183820152602001612ae8565b50506000910152565b6020815260008251806020840152612b28816040850160208701612ae5565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b803573ffffffffffffffffffffffffffffffffffffffff81168114612b7e57600080fd5b919050565b60008060408385031215612b9657600080fd5b612b9f83612b5a565b946020939093013593505050565b600080600060608486031215612bc257600080fd5b612bcb84612b5a565b9250612bd960208501612b5a565b9150604084013590509250925092565b600060208284031215612bfb57600080fd5b6123d982612b5a565b600060208284031215612c1657600080fd5b5035919050565b60008060408385031215612c3057600080fd5b612c3983612b5a565b9150612c4760208401612b5a565b90509250929050565b600181811c90821680612c6457607f821691505b602082108103612c9d577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b8082018082111561077057610770612ca3565b808202811582820484141761077057610770612ca3565b600082612d32577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b8181038181111561077057610770612ca3565b600181815b80851115612da357817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115612d8957612d89612ca3565b80851615612d9657918102915b93841c9390800290612d4f565b509250929050565b600082612dba57506001610770565b81612dc757506000610770565b8160018114612ddd5760028114612de757612e03565b6001915050610770565b60ff841115612df857612df8612ca3565b50506001821b610770565b5060208310610133831016604e8410600b8410161715612e26575081810a610770565b612e308383612d4a565b807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115612e6257612e62612ca3565b029392505050565b60006123d960ff841683612dab565b60008160000b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff808103612eae57612eae612ca3565b60000392915050565b600060208284031215612ec957600080fd5b5051919050565b600060208284031215612ee257600080fd5b815180151581146123d957600080fd5b60008251612f04818460208701612ae5565b919091019291505056fea2646970667358221220dd27c48bc21ec3c53fc2785d8ad28c9d9123c890594daa006172160dbd5821b164736f6c63430008110033"
    };
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.ts", ["require", "exports", "@ijstech/eth-contract", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.json.ts"], function (require, exports, eth_contract_2, GEM_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GEM = void 0;
    class GEM extends eth_contract_2.Contract {
        constructor(wallet, address) {
            super(wallet, address, GEM_json_1.default.abi, GEM_json_1.default.bytecode);
            this.assign();
        }
        deploy(params, options) {
            return this.__deploy([params.name, params.symbol, this.wallet.utils.toString(params.cap), params.baseToken, this.wallet.utils.toString(params.price), this.wallet.utils.toString(params.mintingFee), this.wallet.utils.toString(params.redemptionFee)], options);
        }
        parseApprovalEvent(receipt) {
            return this.parseEvents(receipt, "Approval").map(e => this.decodeApprovalEvent(e));
        }
        decodeApprovalEvent(event) {
            let result = event.data;
            return {
                owner: result.owner,
                spender: result.spender,
                value: new eth_contract_2.BigNumber(result.value),
                _event: event
            };
        }
        parseAuthorizeEvent(receipt) {
            return this.parseEvents(receipt, "Authorize").map(e => this.decodeAuthorizeEvent(e));
        }
        decodeAuthorizeEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parseBuyEvent(receipt) {
            return this.parseEvents(receipt, "Buy").map(e => this.decodeBuyEvent(e));
        }
        decodeBuyEvent(event) {
            let result = event.data;
            return {
                buyer: result.buyer,
                baseTokenAmount: new eth_contract_2.BigNumber(result.baseTokenAmount),
                gemAmount: new eth_contract_2.BigNumber(result.gemAmount),
                fee: new eth_contract_2.BigNumber(result.fee),
                _event: event
            };
        }
        parseDeauthorizeEvent(receipt) {
            return this.parseEvents(receipt, "Deauthorize").map(e => this.decodeDeauthorizeEvent(e));
        }
        decodeDeauthorizeEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parsePausedEvent(receipt) {
            return this.parseEvents(receipt, "Paused").map(e => this.decodePausedEvent(e));
        }
        decodePausedEvent(event) {
            let result = event.data;
            return {
                account: result.account,
                _event: event
            };
        }
        parseRedeemEvent(receipt) {
            return this.parseEvents(receipt, "Redeem").map(e => this.decodeRedeemEvent(e));
        }
        decodeRedeemEvent(event) {
            let result = event.data;
            return {
                redeemer: result.redeemer,
                gemAmount: new eth_contract_2.BigNumber(result.gemAmount),
                baseTokenAmount: new eth_contract_2.BigNumber(result.baseTokenAmount),
                fee: new eth_contract_2.BigNumber(result.fee),
                _event: event
            };
        }
        parseStartOwnershipTransferEvent(receipt) {
            return this.parseEvents(receipt, "StartOwnershipTransfer").map(e => this.decodeStartOwnershipTransferEvent(e));
        }
        decodeStartOwnershipTransferEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parseTransferEvent(receipt) {
            return this.parseEvents(receipt, "Transfer").map(e => this.decodeTransferEvent(e));
        }
        decodeTransferEvent(event) {
            let result = event.data;
            return {
                from: result.from,
                to: result.to,
                value: new eth_contract_2.BigNumber(result.value),
                _event: event
            };
        }
        parseTransferOwnershipEvent(receipt) {
            return this.parseEvents(receipt, "TransferOwnership").map(e => this.decodeTransferOwnershipEvent(e));
        }
        decodeTransferOwnershipEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parseTreasuryRedeemEvent(receipt) {
            return this.parseEvents(receipt, "TreasuryRedeem").map(e => this.decodeTreasuryRedeemEvent(e));
        }
        decodeTreasuryRedeemEvent(event) {
            let result = event.data;
            return {
                baseTokenAmount: new eth_contract_2.BigNumber(result.baseTokenAmount),
                newFeeBalance: new eth_contract_2.BigNumber(result.newFeeBalance),
                _event: event
            };
        }
        parseUnpausedEvent(receipt) {
            return this.parseEvents(receipt, "Unpaused").map(e => this.decodeUnpausedEvent(e));
        }
        decodeUnpausedEvent(event) {
            let result = event.data;
            return {
                account: result.account,
                _event: event
            };
        }
        parseUpdateCapEvent(receipt) {
            return this.parseEvents(receipt, "UpdateCap").map(e => this.decodeUpdateCapEvent(e));
        }
        decodeUpdateCapEvent(event) {
            let result = event.data;
            return {
                cap: new eth_contract_2.BigNumber(result.cap),
                _event: event
            };
        }
        parseUpdateMintingFeeEvent(receipt) {
            return this.parseEvents(receipt, "UpdateMintingFee").map(e => this.decodeUpdateMintingFeeEvent(e));
        }
        decodeUpdateMintingFeeEvent(event) {
            let result = event.data;
            return {
                mintingFee: new eth_contract_2.BigNumber(result.mintingFee),
                _event: event
            };
        }
        parseUpdateRedemptionFeeEvent(receipt) {
            return this.parseEvents(receipt, "UpdateRedemptionFee").map(e => this.decodeUpdateRedemptionFeeEvent(e));
        }
        decodeUpdateRedemptionFeeEvent(event) {
            let result = event.data;
            return {
                redemptionFee: new eth_contract_2.BigNumber(result.redemptionFee),
                _event: event
            };
        }
        parseUpdateTreasuryEvent(receipt) {
            return this.parseEvents(receipt, "UpdateTreasury").map(e => this.decodeUpdateTreasuryEvent(e));
        }
        decodeUpdateTreasuryEvent(event) {
            let result = event.data;
            return {
                treasury: result.treasury,
                _event: event
            };
        }
        assign() {
            let allowanceParams = (params) => [params.owner, params.spender];
            let allowance_call = async (params, options) => {
                let result = await this.call('allowance', allowanceParams(params), options);
                return new eth_contract_2.BigNumber(result);
            };
            this.allowance = allowance_call;
            let balanceOf_call = async (account, options) => {
                let result = await this.call('balanceOf', [account], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.balanceOf = balanceOf_call;
            let baseToken_call = async (options) => {
                let result = await this.call('baseToken', [], options);
                return result;
            };
            this.baseToken = baseToken_call;
            let cap_call = async (options) => {
                let result = await this.call('cap', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.cap = cap_call;
            let decimals_call = async (options) => {
                let result = await this.call('decimals', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.decimals = decimals_call;
            let decimalsDelta_call = async (options) => {
                let result = await this.call('decimalsDelta', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.decimalsDelta = decimalsDelta_call;
            let depositBalance_call = async (options) => {
                let result = await this.call('depositBalance', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.depositBalance = depositBalance_call;
            let feeBalance_call = async (options) => {
                let result = await this.call('feeBalance', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.feeBalance = feeBalance_call;
            let isPermitted_call = async (param1, options) => {
                let result = await this.call('isPermitted', [param1], options);
                return result;
            };
            this.isPermitted = isPermitted_call;
            let mintingFee_call = async (options) => {
                let result = await this.call('mintingFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.mintingFee = mintingFee_call;
            let name_call = async (options) => {
                let result = await this.call('name', [], options);
                return result;
            };
            this.name = name_call;
            let newCap_call = async (options) => {
                let result = await this.call('newCap', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newCap = newCap_call;
            let newCapEffectiveTime_call = async (options) => {
                let result = await this.call('newCapEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newCapEffectiveTime = newCapEffectiveTime_call;
            let newMintingFee_call = async (options) => {
                let result = await this.call('newMintingFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newMintingFee = newMintingFee_call;
            let newMintingFeeEffectiveTime_call = async (options) => {
                let result = await this.call('newMintingFeeEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newMintingFeeEffectiveTime = newMintingFeeEffectiveTime_call;
            let newOwner_call = async (options) => {
                let result = await this.call('newOwner', [], options);
                return result;
            };
            this.newOwner = newOwner_call;
            let newRedemptionFee_call = async (options) => {
                let result = await this.call('newRedemptionFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newRedemptionFee = newRedemptionFee_call;
            let newRedemptionFeeEffectiveTime_call = async (options) => {
                let result = await this.call('newRedemptionFeeEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newRedemptionFeeEffectiveTime = newRedemptionFeeEffectiveTime_call;
            let newTreasury_call = async (options) => {
                let result = await this.call('newTreasury', [], options);
                return result;
            };
            this.newTreasury = newTreasury_call;
            let newTreasuryEffectiveTime_call = async (options) => {
                let result = await this.call('newTreasuryEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newTreasuryEffectiveTime = newTreasuryEffectiveTime_call;
            let owner_call = async (options) => {
                let result = await this.call('owner', [], options);
                return result;
            };
            this.owner = owner_call;
            let paused_call = async (options) => {
                let result = await this.call('paused', [], options);
                return result;
            };
            this.paused = paused_call;
            let price_call = async (options) => {
                let result = await this.call('price', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.price = price_call;
            let redemptionFee_call = async (options) => {
                let result = await this.call('redemptionFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.redemptionFee = redemptionFee_call;
            let symbol_call = async (options) => {
                let result = await this.call('symbol', [], options);
                return result;
            };
            this.symbol = symbol_call;
            let totalSupply_call = async (options) => {
                let result = await this.call('totalSupply', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.totalSupply = totalSupply_call;
            let treasury_call = async (options) => {
                let result = await this.call('treasury', [], options);
                return result;
            };
            this.treasury = treasury_call;
            let approveParams = (params) => [params.spender, this.wallet.utils.toString(params.amount)];
            let approve_send = async (params, options) => {
                let result = await this.send('approve', approveParams(params), options);
                return result;
            };
            let approve_call = async (params, options) => {
                let result = await this.call('approve', approveParams(params), options);
                return result;
            };
            let approve_txData = async (params, options) => {
                let result = await this.txData('approve', approveParams(params), options);
                return result;
            };
            this.approve = Object.assign(approve_send, {
                call: approve_call,
                txData: approve_txData
            });
            let buy_send = async (amount, options) => {
                let result = await this.send('buy', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            let buy_call = async (amount, options) => {
                let result = await this.call('buy', [this.wallet.utils.toString(amount)], options);
                return;
            };
            let buy_txData = async (amount, options) => {
                let result = await this.txData('buy', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            this.buy = Object.assign(buy_send, {
                call: buy_call,
                txData: buy_txData
            });
            let decreaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.subtractedValue)];
            let decreaseAllowance_send = async (params, options) => {
                let result = await this.send('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            let decreaseAllowance_call = async (params, options) => {
                let result = await this.call('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            let decreaseAllowance_txData = async (params, options) => {
                let result = await this.txData('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            this.decreaseAllowance = Object.assign(decreaseAllowance_send, {
                call: decreaseAllowance_call,
                txData: decreaseAllowance_txData
            });
            let deny_send = async (user, options) => {
                let result = await this.send('deny', [user], options);
                return result;
            };
            let deny_call = async (user, options) => {
                let result = await this.call('deny', [user], options);
                return;
            };
            let deny_txData = async (user, options) => {
                let result = await this.txData('deny', [user], options);
                return result;
            };
            this.deny = Object.assign(deny_send, {
                call: deny_call,
                txData: deny_txData
            });
            let increaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.addedValue)];
            let increaseAllowance_send = async (params, options) => {
                let result = await this.send('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            let increaseAllowance_call = async (params, options) => {
                let result = await this.call('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            let increaseAllowance_txData = async (params, options) => {
                let result = await this.txData('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            this.increaseAllowance = Object.assign(increaseAllowance_send, {
                call: increaseAllowance_call,
                txData: increaseAllowance_txData
            });
            let pause_send = async (options) => {
                let result = await this.send('pause', [], options);
                return result;
            };
            let pause_call = async (options) => {
                let result = await this.call('pause', [], options);
                return;
            };
            let pause_txData = async (options) => {
                let result = await this.txData('pause', [], options);
                return result;
            };
            this.pause = Object.assign(pause_send, {
                call: pause_call,
                txData: pause_txData
            });
            let permit_send = async (user, options) => {
                let result = await this.send('permit', [user], options);
                return result;
            };
            let permit_call = async (user, options) => {
                let result = await this.call('permit', [user], options);
                return;
            };
            let permit_txData = async (user, options) => {
                let result = await this.txData('permit', [user], options);
                return result;
            };
            this.permit = Object.assign(permit_send, {
                call: permit_call,
                txData: permit_txData
            });
            let redeem_send = async (amount, options) => {
                let result = await this.send('redeem', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            let redeem_call = async (amount, options) => {
                let result = await this.call('redeem', [this.wallet.utils.toString(amount)], options);
                return;
            };
            let redeem_txData = async (amount, options) => {
                let result = await this.txData('redeem', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            this.redeem = Object.assign(redeem_send, {
                call: redeem_call,
                txData: redeem_txData
            });
            let redeemFee_send = async (amount, options) => {
                let result = await this.send('redeemFee', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            let redeemFee_call = async (amount, options) => {
                let result = await this.call('redeemFee', [this.wallet.utils.toString(amount)], options);
                return;
            };
            let redeemFee_txData = async (amount, options) => {
                let result = await this.txData('redeemFee', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            this.redeemFee = Object.assign(redeemFee_send, {
                call: redeemFee_call,
                txData: redeemFee_txData
            });
            let sync_send = async (options) => {
                let result = await this.send('sync', [], options);
                return result;
            };
            let sync_call = async (options) => {
                let result = await this.call('sync', [], options);
                return;
            };
            let sync_txData = async (options) => {
                let result = await this.txData('sync', [], options);
                return result;
            };
            this.sync = Object.assign(sync_send, {
                call: sync_call,
                txData: sync_txData
            });
            let takeOwnership_send = async (options) => {
                let result = await this.send('takeOwnership', [], options);
                return result;
            };
            let takeOwnership_call = async (options) => {
                let result = await this.call('takeOwnership', [], options);
                return;
            };
            let takeOwnership_txData = async (options) => {
                let result = await this.txData('takeOwnership', [], options);
                return result;
            };
            this.takeOwnership = Object.assign(takeOwnership_send, {
                call: takeOwnership_call,
                txData: takeOwnership_txData
            });
            let transferParams = (params) => [params.to, this.wallet.utils.toString(params.amount)];
            let transfer_send = async (params, options) => {
                let result = await this.send('transfer', transferParams(params), options);
                return result;
            };
            let transfer_call = async (params, options) => {
                let result = await this.call('transfer', transferParams(params), options);
                return result;
            };
            let transfer_txData = async (params, options) => {
                let result = await this.txData('transfer', transferParams(params), options);
                return result;
            };
            this.transfer = Object.assign(transfer_send, {
                call: transfer_call,
                txData: transfer_txData
            });
            let transferFromParams = (params) => [params.from, params.to, this.wallet.utils.toString(params.amount)];
            let transferFrom_send = async (params, options) => {
                let result = await this.send('transferFrom', transferFromParams(params), options);
                return result;
            };
            let transferFrom_call = async (params, options) => {
                let result = await this.call('transferFrom', transferFromParams(params), options);
                return result;
            };
            let transferFrom_txData = async (params, options) => {
                let result = await this.txData('transferFrom', transferFromParams(params), options);
                return result;
            };
            this.transferFrom = Object.assign(transferFrom_send, {
                call: transferFrom_call,
                txData: transferFrom_txData
            });
            let transferOwnership_send = async (newOwner, options) => {
                let result = await this.send('transferOwnership', [newOwner], options);
                return result;
            };
            let transferOwnership_call = async (newOwner, options) => {
                let result = await this.call('transferOwnership', [newOwner], options);
                return;
            };
            let transferOwnership_txData = async (newOwner, options) => {
                let result = await this.txData('transferOwnership', [newOwner], options);
                return result;
            };
            this.transferOwnership = Object.assign(transferOwnership_send, {
                call: transferOwnership_call,
                txData: transferOwnership_txData
            });
            let unpause_send = async (options) => {
                let result = await this.send('unpause', [], options);
                return result;
            };
            let unpause_call = async (options) => {
                let result = await this.call('unpause', [], options);
                return;
            };
            let unpause_txData = async (options) => {
                let result = await this.txData('unpause', [], options);
                return result;
            };
            this.unpause = Object.assign(unpause_send, {
                call: unpause_call,
                txData: unpause_txData
            });
            let updateCap_send = async (cap, options) => {
                let result = await this.send('updateCap', [this.wallet.utils.toString(cap)], options);
                return result;
            };
            let updateCap_call = async (cap, options) => {
                let result = await this.call('updateCap', [this.wallet.utils.toString(cap)], options);
                return;
            };
            let updateCap_txData = async (cap, options) => {
                let result = await this.txData('updateCap', [this.wallet.utils.toString(cap)], options);
                return result;
            };
            this.updateCap = Object.assign(updateCap_send, {
                call: updateCap_call,
                txData: updateCap_txData
            });
            let updateMintingFee_send = async (mintingFee, options) => {
                let result = await this.send('updateMintingFee', [this.wallet.utils.toString(mintingFee)], options);
                return result;
            };
            let updateMintingFee_call = async (mintingFee, options) => {
                let result = await this.call('updateMintingFee', [this.wallet.utils.toString(mintingFee)], options);
                return;
            };
            let updateMintingFee_txData = async (mintingFee, options) => {
                let result = await this.txData('updateMintingFee', [this.wallet.utils.toString(mintingFee)], options);
                return result;
            };
            this.updateMintingFee = Object.assign(updateMintingFee_send, {
                call: updateMintingFee_call,
                txData: updateMintingFee_txData
            });
            let updateRedemptionFee_send = async (redemptionFee, options) => {
                let result = await this.send('updateRedemptionFee', [this.wallet.utils.toString(redemptionFee)], options);
                return result;
            };
            let updateRedemptionFee_call = async (redemptionFee, options) => {
                let result = await this.call('updateRedemptionFee', [this.wallet.utils.toString(redemptionFee)], options);
                return;
            };
            let updateRedemptionFee_txData = async (redemptionFee, options) => {
                let result = await this.txData('updateRedemptionFee', [this.wallet.utils.toString(redemptionFee)], options);
                return result;
            };
            this.updateRedemptionFee = Object.assign(updateRedemptionFee_send, {
                call: updateRedemptionFee_call,
                txData: updateRedemptionFee_txData
            });
            let updateTreasury_send = async (treasury, options) => {
                let result = await this.send('updateTreasury', [treasury], options);
                return result;
            };
            let updateTreasury_call = async (treasury, options) => {
                let result = await this.call('updateTreasury', [treasury], options);
                return;
            };
            let updateTreasury_txData = async (treasury, options) => {
                let result = await this.txData('updateTreasury', [treasury], options);
                return result;
            };
            this.updateTreasury = Object.assign(updateTreasury_send, {
                call: updateTreasury_call,
                txData: updateTreasury_txData
            });
        }
    }
    GEM._abi = GEM_json_1.default.abi;
    exports.GEM = GEM;
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/index.ts", ["require", "exports", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.ts"], function (require, exports, ERC20_1, GEM_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GEM = exports.ERC20 = void 0;
    Object.defineProperty(exports, "ERC20", { enumerable: true, get: function () { return ERC20_1.ERC20; } });
    Object.defineProperty(exports, "GEM", { enumerable: true, get: function () { return GEM_1.GEM; } });
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/index.ts", ["require", "exports", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/index.ts", "@ijstech/eth-wallet"], function (require, exports, Contracts, eth_wallet_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deploy = exports.DefaultDeployOptions = exports.Contracts = void 0;
    exports.Contracts = Contracts;
    ;
    ;
    let progressHandler;
    exports.DefaultDeployOptions = {
        name: "SCOM Utility Token",
        symbol: "SCOM",
        cap: 10000000,
        baseToken: eth_wallet_5.Utils.nullAddress,
        price: 1,
        mintingFee: 0.025,
        redemptionFee: 0.05,
    };
    function logProgress(msg) {
        if (progressHandler)
            progressHandler(msg);
    }
    async function deploy(wallet, options, onProgress) {
        options.cap = eth_wallet_5.Utils.toDecimals(options.cap);
        options.price = eth_wallet_5.Utils.toDecimals(options.price);
        options.mintingFee = eth_wallet_5.Utils.toDecimals(options.mintingFee);
        options.redemptionFee = eth_wallet_5.Utils.toDecimals(options.redemptionFee);
        progressHandler = onProgress;
        let gem = new Contracts.GEM(wallet);
        logProgress('Deploy GEM');
        let address = await gem.deploy(options);
        logProgress('GEM deployed ' + address);
        return {
            gem: address
        };
    }
    exports.deploy = deploy;
    ;
    exports.default = {
        Contracts,
        deploy,
        DefaultDeployOptions: exports.DefaultDeployOptions
    };
});
define("@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.json.ts'/> 
    exports.default = {
        "abi": [
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "AddCommission", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Claim", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Skim", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "target", "type": "address" }, { "indexed": true, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "TransferBack", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "target", "type": "address" }, { "indexed": true, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "commissions", "type": "uint256" }], "name": "TransferForward", "type": "event" },
            { "inputs": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "contract IERC20[]", "name": "tokens", "type": "address[]" }], "name": "claimMultiple", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "claimantIdCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "contract IERC20", "name": "", "type": "address" }], "name": "claimantIds", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "claimantsInfo", "outputs": [{ "internalType": "address", "name": "claimant", "type": "address" }, { "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "components": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct Proxy.Commission[]", "name": "commissions", "type": "tuple[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "ethIn", "outputs": [], "stateMutability": "payable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "claimant", "type": "address" }, { "internalType": "contract IERC20", "name": "token", "type": "address" }], "name": "getClaimantBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "fromId", "type": "uint256" }, { "internalType": "uint256", "name": "count", "type": "uint256" }], "name": "getClaimantsInfo", "outputs": [{ "components": [{ "internalType": "address", "name": "claimant", "type": "address" }, { "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }], "internalType": "struct Proxy.ClaimantInfo[]", "name": "claimantInfoList", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "name": "lastBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "components": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bool", "name": "directTransfer", "type": "bool" }, { "components": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct Proxy.Commission[]", "name": "commissions", "type": "tuple[]" }], "internalType": "struct Proxy.TokensIn[]", "name": "tokensIn", "type": "tuple[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "contract IERC20[]", "name": "tokensOut", "type": "address[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "proxyCall", "outputs": [], "stateMutability": "payable", "type": "function" },
            { "inputs": [{ "internalType": "contract IERC20[]", "name": "tokens", "type": "address[]" }], "name": "skim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "components": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bool", "name": "directTransfer", "type": "bool" }, { "components": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct Proxy.Commission[]", "name": "commissions", "type": "tuple[]" }], "internalType": "struct Proxy.TokensIn", "name": "tokensIn", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "tokenIn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "stateMutability": "payable", "type": "receive" }
        ],
        "bytecode": "608060405234801561001057600080fd5b50612571806100206000396000f3fe6080604052600436106100cb5760003560e01c8063b60c164c11610074578063d3b7d4c31161004e578063d3b7d4c31461027c578063ee42d3a31461029c578063f303ad6e146102c957600080fd5b8063b60c164c146101b1578063c0da918d146101d1578063d2ef8464146101f157600080fd5b806373d8690f116100a557806373d8690f1461014257806383e40a5114610155578063b316d7141461019b57600080fd5b806301417e7b146100d7578063188ff72b146100ec5780631e83409a1461012257600080fd5b366100d257005b600080fd5b6100ea6100e5366004611f7a565b6102e9565b005b3480156100f857600080fd5b5061010c610107366004612027565b610493565b6040516101199190612049565b60405180910390f35b34801561012e57600080fd5b506100ea61013d3660046120bb565b610677565b6100ea610150366004612124565b610683565b34801561016157600080fd5b5061018d6101703660046121df565b600360209081526000928352604080842090915290825290205481565b604051908152602001610119565b3480156101a757600080fd5b5061018d60005481565b3480156101bd57600080fd5b506100ea6101cc366004612218565b610e18565b3480156101dd57600080fd5b506100ea6101ec36600461225a565b611000565b3480156101fd57600080fd5b5061024961020c3660046122d8565b600260208190526000918252604090912080546001820154919092015473ffffffffffffffffffffffffffffffffffffffff928316929091169083565b6040805173ffffffffffffffffffffffffffffffffffffffff948516815293909216602084015290820152606001610119565b34801561028857600080fd5b5061018d6102973660046121df565b611361565b3480156102a857600080fd5b5061018d6102b73660046120bb565b60016020526000908152604090205481565b3480156102d557600080fd5b506100ea6102e4366004612218565b6113aa565b600082815b818110156103bb5736868683818110610309576103096122f1565b9050604002019050806020013584610321919061234f565b935061033f61033360208301836120bb565b600083602001356113f7565b7fe3576de866d95e30a6b102b256dc468ead824ef133838792dc1813c3786414ef61036d60208301836120bb565b6040805173ffffffffffffffffffffffffffffffffffffffff909216825260006020838101919091528401359082015260600160405180910390a150806103b381612362565b9150506102ee565b5060006103c8833461239a565b600080805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb498054929350859290919061040890849061234f565b9091555050604080513381526020810183905290810184905260009073ffffffffffffffffffffffffffffffffffffffff8916907f0e25509c2c6fc37a8844100a9a4c5b2b038bd5daaf09d216161eb8574ad4878b9060600160405180910390a3600080855186602001848b5af180600003610488573d6000803e3d6000fd5b503d6000803e3d6000f35b60606000831180156104a757506000548311155b610512576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600d60248201527f6f7574206f6620626f756e64730000000000000000000000000000000000000060448201526064015b60405180910390fd5b60006001610520848661234f565b61052a919061239a565b90506000548111156105525750600054610544848261239a565b61054f90600161234f565b92505b8267ffffffffffffffff81111561056b5761056b611ea0565b6040519080825280602002602001820160405280156105d457816020015b60408051606081018252600080825260208083018290529282015282527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9092019101816105895790505b5091508360005b8481101561066e576000828152600260208181526040928390208351606081018552815473ffffffffffffffffffffffffffffffffffffffff90811682526001830154169281019290925290910154918101919091528451859083908110610645576106456122f1565b60200260200101819052508161065a90612362565b91508061066681612362565b9150506105db565b50505092915050565b6106808161151c565b50565b846000805b82811015610b5b57368989838181106106a3576106a36122f1565b90506020028101906106b591906123ad565b90506000806106c760608401846123eb565b9050905060005b818110156107c057366106e460608601866123eb565b838181106106f4576106f46122f1565b905060400201905080602001358461070c919061234f565b935061073561071e60208301836120bb565b61072b60208801886120bb565b83602001356113f7565b7fe3576de866d95e30a6b102b256dc468ead824ef133838792dc1813c3786414ef61076360208301836120bb565b61077060208801886120bb565b6040805173ffffffffffffffffffffffffffffffffffffffff9384168152929091166020838101919091528401359082015260600160405180910390a150806107b881612362565b9150506106ce565b50600090506107d382602085013561239a565b905081600160006107e760208701876120bb565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610830919061234f565b909155506000905061084560208501856120bb565b73ffffffffffffffffffffffffffffffffffffffff160361093d5784156108c8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f6d6f7265207468616e206f6e6520455448207472616e736665720000000000006044820152606401610509565b82602001353414610935576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f45544820616d6f756e74206e6f74206d617463686564000000000000000000006044820152606401610509565b809450610adb565b61094d6060840160408501612461565b15610a0c57600061096a61096460208601866120bb565b8461164a565b90508281146109d5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f636f6d6d697373696f6e20616d6f756e74206e6f74206d6174636865640000006044820152606401610509565b610a06338f846109e860208901896120bb565b73ffffffffffffffffffffffffffffffffffffffff169291906117a0565b50610adb565b6000610a28610a1e60208601866120bb565b856020013561164a565b905083602001358114610a97576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f616d6f756e74206e6f74206d61746368656400000000000000000000000000006044820152606401610509565b610ac78e6000610aaa60208801886120bb565b73ffffffffffffffffffffffffffffffffffffffff16919061187c565b610ad98e83610aaa60208801886120bb565b505b610ae860208401846120bb565b604080513381526020810184905290810184905273ffffffffffffffffffffffffffffffffffffffff918216918f16907f0e25509c2c6fc37a8844100a9a4c5b2b038bd5daaf09d216161eb8574ad4878b9060600160405180910390a35050508080610b5390612362565b915050610688565b50600080845185602001848d5af180600003610b7b573d6000803e3d6000fd5b5083915060005b8281101561048857600080878784818110610b9f57610b9f6122f1565b9050602002016020810190610bb491906120bb565b73ffffffffffffffffffffffffffffffffffffffff1603610c15576000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4954610c04904761239a565b9050610c108882611a03565b610d87565b60016000888885818110610c2b57610c2b6122f1565b9050602002016020810190610c4091906120bb565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054878784818110610c8d57610c8d6122f1565b9050602002016020810190610ca291906120bb565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff91909116906370a0823190602401602060405180830381865afa158015610d0e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d32919061247e565b610d3c919061239a565b9050610d878882898986818110610d5557610d556122f1565b9050602002016020810190610d6a91906120bb565b73ffffffffffffffffffffffffffffffffffffffff169190611b0d565b868683818110610d9957610d996122f1565b9050602002016020810190610dae91906120bb565b6040805173ffffffffffffffffffffffffffffffffffffffff8b8116825260208201859052928316928e16917fc2534859c9972270c16d5b4255d200f9a0385f9a6ce3add96c0427ff9fc70f93910160405180910390a35080610e1081612362565b915050610b82565b8060005b81811015610ffa57600080858584818110610e3957610e396122f1565b9050602002016020810190610e4e91906120bb565b905073ffffffffffffffffffffffffffffffffffffffff8116610eb4576000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4954479250610ea3908361239a565b9150610eaf3383611a03565b610f98565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff8216906370a0823190602401602060405180830381865afa158015610f1e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f42919061247e565b73ffffffffffffffffffffffffffffffffffffffff8216600090815260016020526040902054909250610f75908361239a565b9150610f9873ffffffffffffffffffffffffffffffffffffffff82163384611b0d565b604051828152339073ffffffffffffffffffffffffffffffffffffffff8316907f2ae72b44f59d038340fca5739135a1d51fc5ab720bb02d983e4c5ff4119ca7b89060200160405180910390a350508080610ff290612362565b915050610e1c565b50505050565b8160008061101160608401846123eb565b9050905060005b81811015611100573661102e60608601866123eb565b8381811061103e5761103e6122f1565b9050604002019050806020013584611056919061234f565b935061107561106860208301836120bb565b61072b60208a018a6120bb565b7fe3576de866d95e30a6b102b256dc468ead824ef133838792dc1813c3786414ef6110a360208301836120bb565b6110b060208a018a6120bb565b6040805173ffffffffffffffffffffffffffffffffffffffff9384168152929091166020838101919091528401359082015260600160405180910390a150806110f881612362565b915050611018565b50600061111183602086013561239a565b9050826001600061112560208801886120bb565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461116e919061234f565b9091555061118490506060850160408601612461565b156112255760006111a161119b60208701876120bb565b8561164a565b905083811461120c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f636f6d6d697373696f6e20616d6f756e74206e6f74206d6174636865640000006044820152606401610509565b61121f3389846109e860208a018a6120bb565b506112d7565b600061124161123760208701876120bb565b866020013561164a565b9050846020013581146112b0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f616d6f756e74206e6f74206d61746368656400000000000000000000000000006044820152606401610509565b6112c3886000610aaa60208901896120bb565b6112d58883610aaa60208901896120bb565b505b6112e460208501856120bb565b604080513381526020810184905290810185905273ffffffffffffffffffffffffffffffffffffffff918216918916907f0e25509c2c6fc37a8844100a9a4c5b2b038bd5daaf09d216161eb8574ad4878b9060600160405180910390a360008086518760200160008b5af180600003610488573d6000803e3d6000fd5b73ffffffffffffffffffffffffffffffffffffffff8083166000908152600360209081526040808320938516835292815282822054825260029081905291902001545b92915050565b8060005b81811015610ffa576113e58484838181106113cb576113cb6122f1565b90506020020160208101906113e091906120bb565b61151c565b806113ef81612362565b9150506113ae565b73ffffffffffffffffffffffffffffffffffffffff8084166000908152600360209081526040808320938616835292905290812054908190036114f057600080815461144290612362565b909155506040805160608101825273ffffffffffffffffffffffffffffffffffffffff80871680835286821660208085018281528587018981526000805481526002808552898220985189549089167fffffffffffffffffffffffff0000000000000000000000000000000000000000918216178a55935160018a01805491909916941693909317909655519501949094558254918352600384528483209083529092529190912055610ffa565b6000818152600260208190526040822001805484929061151190849061234f565b909155505050505050565b33600090815260036020908152604080832073ffffffffffffffffffffffffffffffffffffffff858116808652918452828520548086526002808652848720855160608101875281548516815260018083015490951681890152910180548287018190529088905593875291909452918420805493949293919283926115a390849061239a565b909155505073ffffffffffffffffffffffffffffffffffffffff84166115d2576115cd3382611a03565b6115f3565b6115f373ffffffffffffffffffffffffffffffffffffffff85163383611b0d565b6040805173ffffffffffffffffffffffffffffffffffffffff861681526020810183905233917f70eb43c4a8ae8c40502dcf22436c509c28d6ff421cf07c491be56984bd987068910160405180910390a250505050565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015260009073ffffffffffffffffffffffffffffffffffffffff8416906370a0823190602401602060405180830381865afa1580156116b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116db919061247e565b90506116ff73ffffffffffffffffffffffffffffffffffffffff84163330856117a0565b6040517f70a08231000000000000000000000000000000000000000000000000000000008152306004820152819073ffffffffffffffffffffffffffffffffffffffff8516906370a0823190602401602060405180830381865afa15801561176b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061178f919061247e565b611799919061239a565b9392505050565b60405173ffffffffffffffffffffffffffffffffffffffff80851660248301528316604482015260648101829052610ffa9085907f23b872dd00000000000000000000000000000000000000000000000000000000906084015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152611b63565b80158061191c57506040517fdd62ed3e00000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff838116602483015284169063dd62ed3e90604401602060405180830381865afa1580156118f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061191a919061247e565b155b6119a8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603660248201527f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f60448201527f20746f206e6f6e2d7a65726f20616c6c6f77616e6365000000000000000000006064820152608401610509565b60405173ffffffffffffffffffffffffffffffffffffffff83166024820152604481018290526119fe9084907f095ea7b300000000000000000000000000000000000000000000000000000000906064016117fa565b505050565b6040805160008082526020820190925273ffffffffffffffffffffffffffffffffffffffff8416908390604051611a3a91906124bb565b60006040518083038185875af1925050503d8060008114611a77576040519150601f19603f3d011682016040523d82523d6000602084013e611a7c565b606091505b50509050806119fe576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f5472616e7366657248656c7065723a204554485f5452414e534645525f46414960448201527f4c454400000000000000000000000000000000000000000000000000000000006064820152608401610509565b60405173ffffffffffffffffffffffffffffffffffffffff83166024820152604481018290526119fe9084907fa9059cbb00000000000000000000000000000000000000000000000000000000906064016117fa565b6000611bc5826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16611c6f9092919063ffffffff16565b8051909150156119fe5780806020019051810190611be391906124cd565b6119fe576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f742073756363656564000000000000000000000000000000000000000000006064820152608401610509565b6060611c7e8484600085611c86565b949350505050565b606082471015611d18576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c00000000000000000000000000000000000000000000000000006064820152608401610509565b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051611d4191906124bb565b60006040518083038185875af1925050503d8060008114611d7e576040519150601f19603f3d011682016040523d82523d6000602084013e611d83565b606091505b5091509150611d9487838387611d9f565b979650505050505050565b60608315611e35578251600003611e2e5773ffffffffffffffffffffffffffffffffffffffff85163b611e2e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610509565b5081611c7e565b611c7e8383815115611e4a5781518083602001fd5b806040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161050991906124ea565b73ffffffffffffffffffffffffffffffffffffffff8116811461068057600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600082601f830112611ee057600080fd5b813567ffffffffffffffff80821115611efb57611efb611ea0565b604051601f83017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908282118183101715611f4157611f41611ea0565b81604052838152866020858801011115611f5a57600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060008060608587031215611f9057600080fd5b8435611f9b81611e7e565b9350602085013567ffffffffffffffff80821115611fb857600080fd5b818701915087601f830112611fcc57600080fd5b813581811115611fdb57600080fd5b8860208260061b8501011115611ff057600080fd5b60208301955080945050604087013591508082111561200e57600080fd5b5061201b87828801611ecf565b91505092959194509250565b6000806040838503121561203a57600080fd5b50508035926020909101359150565b602080825282518282018190526000919060409081850190868401855b828110156120ae578151805173ffffffffffffffffffffffffffffffffffffffff90811686528782015116878601528501518585015260609093019290850190600101612066565b5091979650505050505050565b6000602082840312156120cd57600080fd5b813561179981611e7e565b60008083601f8401126120ea57600080fd5b50813567ffffffffffffffff81111561210257600080fd5b6020830191508360208260051b850101111561211d57600080fd5b9250929050565b600080600080600080600060a0888a03121561213f57600080fd5b873561214a81611e7e565b9650602088013567ffffffffffffffff8082111561216757600080fd5b6121738b838c016120d8565b909850965060408a0135915061218882611e7e565b9094506060890135908082111561219e57600080fd5b6121aa8b838c016120d8565b909550935060808a01359150808211156121c357600080fd5b506121d08a828b01611ecf565b91505092959891949750929550565b600080604083850312156121f257600080fd5b82356121fd81611e7e565b9150602083013561220d81611e7e565b809150509250929050565b6000806020838503121561222b57600080fd5b823567ffffffffffffffff81111561224257600080fd5b61224e858286016120d8565b90969095509350505050565b60008060006060848603121561226f57600080fd5b833561227a81611e7e565b9250602084013567ffffffffffffffff8082111561229757600080fd5b90850190608082880312156122ab57600080fd5b909250604085013590808211156122c157600080fd5b506122ce86828701611ecf565b9150509250925092565b6000602082840312156122ea57600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b808201808211156113a4576113a4612320565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361239357612393612320565b5060010190565b818103818111156113a4576113a4612320565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff818336030181126123e157600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe184360301811261242057600080fd5b83018035915067ffffffffffffffff82111561243b57600080fd5b6020019150600681901b360382131561211d57600080fd5b801515811461068057600080fd5b60006020828403121561247357600080fd5b813561179981612453565b60006020828403121561249057600080fd5b5051919050565b60005b838110156124b257818101518382015260200161249a565b50506000910152565b600082516123e1818460208701612497565b6000602082840312156124df57600080fd5b815161179981612453565b6020815260008251806020840152612509816040850160208701612497565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016919091016040019291505056fea2646970667358221220f508b1a2c41fe6f4d6b5ecc5632e0d04dc599d2fcd35dd9fb7e1454e8e5c0c5a64736f6c63430008110033"
    };
});
define("@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.ts", ["require", "exports", "@ijstech/eth-contract", "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.json.ts"], function (require, exports, eth_contract_3, Proxy_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Proxy = void 0;
    class Proxy extends eth_contract_3.Contract {
        constructor(wallet, address) {
            super(wallet, address, Proxy_json_1.default.abi, Proxy_json_1.default.bytecode);
            this.assign();
        }
        deploy(options) {
            return this.__deploy([], options);
        }
        parseAddCommissionEvent(receipt) {
            return this.parseEvents(receipt, "AddCommission").map(e => this.decodeAddCommissionEvent(e));
        }
        decodeAddCommissionEvent(event) {
            let result = event.data;
            return {
                to: result.to,
                token: result.token,
                amount: new eth_contract_3.BigNumber(result.amount),
                _event: event
            };
        }
        parseClaimEvent(receipt) {
            return this.parseEvents(receipt, "Claim").map(e => this.decodeClaimEvent(e));
        }
        decodeClaimEvent(event) {
            let result = event.data;
            return {
                from: result.from,
                token: result.token,
                amount: new eth_contract_3.BigNumber(result.amount),
                _event: event
            };
        }
        parseSkimEvent(receipt) {
            return this.parseEvents(receipt, "Skim").map(e => this.decodeSkimEvent(e));
        }
        decodeSkimEvent(event) {
            let result = event.data;
            return {
                token: result.token,
                to: result.to,
                amount: new eth_contract_3.BigNumber(result.amount),
                _event: event
            };
        }
        parseTransferBackEvent(receipt) {
            return this.parseEvents(receipt, "TransferBack").map(e => this.decodeTransferBackEvent(e));
        }
        decodeTransferBackEvent(event) {
            let result = event.data;
            return {
                target: result.target,
                token: result.token,
                sender: result.sender,
                amount: new eth_contract_3.BigNumber(result.amount),
                _event: event
            };
        }
        parseTransferForwardEvent(receipt) {
            return this.parseEvents(receipt, "TransferForward").map(e => this.decodeTransferForwardEvent(e));
        }
        decodeTransferForwardEvent(event) {
            let result = event.data;
            return {
                target: result.target,
                token: result.token,
                sender: result.sender,
                amount: new eth_contract_3.BigNumber(result.amount),
                commissions: new eth_contract_3.BigNumber(result.commissions),
                _event: event
            };
        }
        assign() {
            let claimantIdCount_call = async (options) => {
                let result = await this.call('claimantIdCount', [], options);
                return new eth_contract_3.BigNumber(result);
            };
            this.claimantIdCount = claimantIdCount_call;
            let claimantIdsParams = (params) => [params.param1, params.param2];
            let claimantIds_call = async (params, options) => {
                let result = await this.call('claimantIds', claimantIdsParams(params), options);
                return new eth_contract_3.BigNumber(result);
            };
            this.claimantIds = claimantIds_call;
            let claimantsInfo_call = async (param1, options) => {
                let result = await this.call('claimantsInfo', [this.wallet.utils.toString(param1)], options);
                return {
                    claimant: result.claimant,
                    token: result.token,
                    balance: new eth_contract_3.BigNumber(result.balance)
                };
            };
            this.claimantsInfo = claimantsInfo_call;
            let getClaimantBalanceParams = (params) => [params.claimant, params.token];
            let getClaimantBalance_call = async (params, options) => {
                let result = await this.call('getClaimantBalance', getClaimantBalanceParams(params), options);
                return new eth_contract_3.BigNumber(result);
            };
            this.getClaimantBalance = getClaimantBalance_call;
            let getClaimantsInfoParams = (params) => [this.wallet.utils.toString(params.fromId), this.wallet.utils.toString(params.count)];
            let getClaimantsInfo_call = async (params, options) => {
                let result = await this.call('getClaimantsInfo', getClaimantsInfoParams(params), options);
                return (result.map(e => ({
                    claimant: e.claimant,
                    token: e.token,
                    balance: new eth_contract_3.BigNumber(e.balance)
                })));
            };
            this.getClaimantsInfo = getClaimantsInfo_call;
            let lastBalance_call = async (param1, options) => {
                let result = await this.call('lastBalance', [param1], options);
                return new eth_contract_3.BigNumber(result);
            };
            this.lastBalance = lastBalance_call;
            let claim_send = async (token, options) => {
                let result = await this.send('claim', [token], options);
                return result;
            };
            let claim_call = async (token, options) => {
                let result = await this.call('claim', [token], options);
                return;
            };
            let claim_txData = async (token, options) => {
                let result = await this.txData('claim', [token], options);
                return result;
            };
            this.claim = Object.assign(claim_send, {
                call: claim_call,
                txData: claim_txData
            });
            let claimMultiple_send = async (tokens, options) => {
                let result = await this.send('claimMultiple', [tokens], options);
                return result;
            };
            let claimMultiple_call = async (tokens, options) => {
                let result = await this.call('claimMultiple', [tokens], options);
                return;
            };
            let claimMultiple_txData = async (tokens, options) => {
                let result = await this.txData('claimMultiple', [tokens], options);
                return result;
            };
            this.claimMultiple = Object.assign(claimMultiple_send, {
                call: claimMultiple_call,
                txData: claimMultiple_txData
            });
            let ethInParams = (params) => [params.target, params.commissions.map(e => ([e.to, this.wallet.utils.toString(e.amount)])), this.wallet.utils.stringToBytes(params.data)];
            let ethIn_send = async (params, options) => {
                let result = await this.send('ethIn', ethInParams(params), options);
                return result;
            };
            let ethIn_call = async (params, options) => {
                let result = await this.call('ethIn', ethInParams(params), options);
                return;
            };
            let ethIn_txData = async (params, options) => {
                let result = await this.txData('ethIn', ethInParams(params), options);
                return result;
            };
            this.ethIn = Object.assign(ethIn_send, {
                call: ethIn_call,
                txData: ethIn_txData
            });
            let proxyCallParams = (params) => [params.target, params.tokensIn.map(e => ([e.token, this.wallet.utils.toString(e.amount), e.directTransfer, e.commissions.map(e => ([e.to, this.wallet.utils.toString(e.amount)]))])), params.to, params.tokensOut, this.wallet.utils.stringToBytes(params.data)];
            let proxyCall_send = async (params, options) => {
                let result = await this.send('proxyCall', proxyCallParams(params), options);
                return result;
            };
            let proxyCall_call = async (params, options) => {
                let result = await this.call('proxyCall', proxyCallParams(params), options);
                return;
            };
            let proxyCall_txData = async (params, options) => {
                let result = await this.txData('proxyCall', proxyCallParams(params), options);
                return result;
            };
            this.proxyCall = Object.assign(proxyCall_send, {
                call: proxyCall_call,
                txData: proxyCall_txData
            });
            let skim_send = async (tokens, options) => {
                let result = await this.send('skim', [tokens], options);
                return result;
            };
            let skim_call = async (tokens, options) => {
                let result = await this.call('skim', [tokens], options);
                return;
            };
            let skim_txData = async (tokens, options) => {
                let result = await this.txData('skim', [tokens], options);
                return result;
            };
            this.skim = Object.assign(skim_send, {
                call: skim_call,
                txData: skim_txData
            });
            let tokenInParams = (params) => [params.target, [params.tokensIn.token, this.wallet.utils.toString(params.tokensIn.amount), params.tokensIn.directTransfer, params.tokensIn.commissions.map(e => ([e.to, this.wallet.utils.toString(e.amount)]))], this.wallet.utils.stringToBytes(params.data)];
            let tokenIn_send = async (params, options) => {
                let result = await this.send('tokenIn', tokenInParams(params), options);
                return result;
            };
            let tokenIn_call = async (params, options) => {
                let result = await this.call('tokenIn', tokenInParams(params), options);
                return;
            };
            let tokenIn_txData = async (params, options) => {
                let result = await this.txData('tokenIn', tokenInParams(params), options);
                return result;
            };
            this.tokenIn = Object.assign(tokenIn_send, {
                call: tokenIn_call,
                txData: tokenIn_txData
            });
        }
    }
    Proxy._abi = Proxy_json_1.default.abi;
    exports.Proxy = Proxy;
});
define("@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.json.ts'/> 
    exports.default = {
        "abi": [
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "AddCommission", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Claim", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Skim", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "target", "type": "address" }, { "indexed": true, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "TransferBack", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "target", "type": "address" }, { "indexed": true, "internalType": "contract IERC20", "name": "token", "type": "address" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "commissions", "type": "uint256" }], "name": "TransferForward", "type": "event" },
            { "inputs": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "contract IERC20[]", "name": "tokens", "type": "address[]" }], "name": "claimMultiple", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "claimantIdCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "contract IERC20", "name": "", "type": "address" }], "name": "claimantIds", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "claimantsInfo", "outputs": [{ "internalType": "address", "name": "claimant", "type": "address" }, { "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "components": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct ProxyV2.Commission[]", "name": "commissions", "type": "tuple[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "ethIn", "outputs": [], "stateMutability": "payable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "claimant", "type": "address" }, { "internalType": "contract IERC20", "name": "token", "type": "address" }], "name": "getClaimantBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "fromId", "type": "uint256" }, { "internalType": "uint256", "name": "count", "type": "uint256" }], "name": "getClaimantsInfo", "outputs": [{ "components": [{ "internalType": "address", "name": "claimant", "type": "address" }, { "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }], "internalType": "struct ProxyV2.ClaimantInfo[]", "name": "claimantInfoList", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "name": "lastBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "components": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bool", "name": "directTransfer", "type": "bool" }, { "components": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct ProxyV2.Commission[]", "name": "commissions", "type": "tuple[]" }, { "internalType": "uint256", "name": "totalCommissions", "type": "uint256" }], "internalType": "struct ProxyV2.TokensIn[]", "name": "tokensIn", "type": "tuple[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "contract IERC20[]", "name": "tokensOut", "type": "address[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "proxyCall", "outputs": [], "stateMutability": "payable", "type": "function" },
            { "inputs": [{ "internalType": "contract IERC20[]", "name": "tokens", "type": "address[]" }], "name": "skim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "components": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bool", "name": "directTransfer", "type": "bool" }, { "components": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct ProxyV2.Commission[]", "name": "commissions", "type": "tuple[]" }, { "internalType": "uint256", "name": "totalCommissions", "type": "uint256" }], "internalType": "struct ProxyV2.TokensIn", "name": "tokensIn", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "tokenIn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "stateMutability": "payable", "type": "receive" }
        ],
        "bytecode": "608060405234801561001057600080fd5b506125ab806100206000396000f3fe6080604052600436106100cb5760003560e01c8063b60c164c11610074578063ee42d3a31161004e578063ee42d3a31461027c578063f303ad6e146102a9578063fddaea46146102c957600080fd5b8063b60c164c146101b1578063d2ef8464146101d1578063d3b7d4c31461025c57600080fd5b80637c93df2b116100a55780637c93df2b1461014257806383e40a5114610155578063b316d7141461019b57600080fd5b806301417e7b146100d7578063188ff72b146100ec5780631e83409a1461012257600080fd5b366100d257005b600080fd5b6100ea6100e5366004611fb4565b6102e9565b005b3480156100f857600080fd5b5061010c610107366004612061565b610493565b6040516101199190612083565b60405180910390f35b34801561012e57600080fd5b506100ea61013d3660046120f5565b610677565b6100ea61015036600461215e565b610683565b34801561016157600080fd5b5061018d610170366004612219565b600360209081526000928352604080842090915290825290205481565b604051908152602001610119565b3480156101a757600080fd5b5061018d60005481565b3480156101bd57600080fd5b506100ea6101cc366004612252565b610e3d565b3480156101dd57600080fd5b506102296101ec366004612294565b600260208190526000918252604090912080546001820154919092015473ffffffffffffffffffffffffffffffffffffffff928316929091169083565b6040805173ffffffffffffffffffffffffffffffffffffffff948516815293909216602084015290820152606001610119565b34801561026857600080fd5b5061018d610277366004612219565b611025565b34801561028857600080fd5b5061018d6102973660046120f5565b60016020526000908152604090205481565b3480156102b557600080fd5b506100ea6102c4366004612252565b61106e565b3480156102d557600080fd5b506100ea6102e43660046122ad565b6110bb565b600082815b818110156103bb57368686838181106103095761030961232b565b90506040020190508060200135846103219190612389565b935061033f61033360208301836120f5565b60008360200135611431565b7fe3576de866d95e30a6b102b256dc468ead824ef133838792dc1813c3786414ef61036d60208301836120f5565b6040805173ffffffffffffffffffffffffffffffffffffffff909216825260006020838101919091528401359082015260600160405180910390a150806103b38161239c565b9150506102ee565b5060006103c883346123d4565b600080805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4980549293508592909190610408908490612389565b9091555050604080513381526020810183905290810184905260009073ffffffffffffffffffffffffffffffffffffffff8916907f0e25509c2c6fc37a8844100a9a4c5b2b038bd5daaf09d216161eb8574ad4878b9060600160405180910390a3600080855186602001848b5af180600003610488573d6000803e3d6000fd5b503d6000803e3d6000f35b60606000831180156104a757506000548311155b610512576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600d60248201527f6f7574206f6620626f756e64730000000000000000000000000000000000000060448201526064015b60405180910390fd5b600060016105208486612389565b61052a91906123d4565b9050600054811115610552575060005461054484826123d4565b61054f906001612389565b92505b8267ffffffffffffffff81111561056b5761056b611eda565b6040519080825280602002602001820160405280156105d457816020015b60408051606081018252600080825260208083018290529282015282527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9092019101816105895790505b5091508360005b8481101561066e576000828152600260208181526040928390208351606081018552815473ffffffffffffffffffffffffffffffffffffffff908116825260018301541692810192909252909101549181019190915284518590839081106106455761064561232b565b60200260200101819052508161065a9061239c565b9150806106668161239c565b9150506105db565b50505092915050565b61068081611556565b50565b846000805b82811015610b8057368989838181106106a3576106a361232b565b90506020028101906106b591906123e7565b90506000806106c76060840184612425565b9050905060005b818110156107c057366106e46060860186612425565b838181106106f4576106f461232b565b905060400201905080602001358461070c9190612389565b935061073561071e60208301836120f5565b61072b60208801886120f5565b8360200135611431565b7fe3576de866d95e30a6b102b256dc468ead824ef133838792dc1813c3786414ef61076360208301836120f5565b61077060208801886120f5565b6040805173ffffffffffffffffffffffffffffffffffffffff9384168152929091166020838101919091528401359082015260600160405180910390a150806107b88161239c565b9150506106ce565b5060009050816001826107d660208701876120f5565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461081f9190612389565b909155506000905061083460208501856120f5565b73ffffffffffffffffffffffffffffffffffffffff160361093c5784156108b7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f6d6f7265207468616e206f6e6520455448207472616e736665720000000000006044820152606401610509565b82602001353414610924576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f45544820616d6f756e74206e6f74206d617463686564000000000000000000006044820152606401610509565b6109328260208501356123d4565b9050809450610b00565b61094c606084016040850161249b565b15610a2457600061096d61096360208601866120f5565b8560800135611684565b9050828110156109d9576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f636f6d6d697373696f6e20616d6f756e74206e6f74206d6174636865640000006044820152606401610509565b6109eb608085013560208601356123d4565b9150610a1e338f84610a0060208901896120f5565b73ffffffffffffffffffffffffffffffffffffffff169291906117da565b50610b00565b6000610a40610a3660208601866120f5565b8560200135611684565b90508360200135811015610ab0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f616d6f756e74206e6f74206d61746368656400000000000000000000000000006044820152606401610509565b610aba83826123d4565b9150610aec8e6000610acf60208801886120f5565b73ffffffffffffffffffffffffffffffffffffffff1691906118b6565b610afe8e83610acf60208801886120f5565b505b610b0d60208401846120f5565b604080513381526020810184905290810184905273ffffffffffffffffffffffffffffffffffffffff918216918f16907f0e25509c2c6fc37a8844100a9a4c5b2b038bd5daaf09d216161eb8574ad4878b9060600160405180910390a35050508080610b789061239c565b915050610688565b50600080845185602001848d5af180600003610ba0573d6000803e3d6000fd5b5083915060005b8281101561048857600080878784818110610bc457610bc461232b565b9050602002016020810190610bd991906120f5565b73ffffffffffffffffffffffffffffffffffffffff1603610c3a576000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4954610c2990476123d4565b9050610c358882611a3d565b610dac565b60016000888885818110610c5057610c5061232b565b9050602002016020810190610c6591906120f5565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054878784818110610cb257610cb261232b565b9050602002016020810190610cc791906120f5565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff91909116906370a0823190602401602060405180830381865afa158015610d33573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d5791906124b8565b610d6191906123d4565b9050610dac8882898986818110610d7a57610d7a61232b565b9050602002016020810190610d8f91906120f5565b73ffffffffffffffffffffffffffffffffffffffff169190611b47565b868683818110610dbe57610dbe61232b565b9050602002016020810190610dd391906120f5565b6040805173ffffffffffffffffffffffffffffffffffffffff8b8116825260208201859052928316928e16917fc2534859c9972270c16d5b4255d200f9a0385f9a6ce3add96c0427ff9fc70f93910160405180910390a35080610e358161239c565b915050610ba7565b8060005b8181101561101f57600080858584818110610e5e57610e5e61232b565b9050602002016020810190610e7391906120f5565b905073ffffffffffffffffffffffffffffffffffffffff8116610ed9576000805260016020527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4954479250610ec890836123d4565b9150610ed43383611a3d565b610fbd565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff8216906370a0823190602401602060405180830381865afa158015610f43573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f6791906124b8565b73ffffffffffffffffffffffffffffffffffffffff8216600090815260016020526040902054909250610f9a90836123d4565b9150610fbd73ffffffffffffffffffffffffffffffffffffffff82163384611b47565b604051828152339073ffffffffffffffffffffffffffffffffffffffff8316907f2ae72b44f59d038340fca5739135a1d51fc5ab720bb02d983e4c5ff4119ca7b89060200160405180910390a3505080806110179061239c565b915050610e41565b50505050565b73ffffffffffffffffffffffffffffffffffffffff8083166000908152600360209081526040808320938516835292815282822054825260029081905291902001545b92915050565b8060005b8181101561101f576110a984848381811061108f5761108f61232b565b90506020020160208101906110a491906120f5565b611556565b806110b38161239c565b915050611072565b816000806110cc6060840184612425565b9050905060005b818110156111bb57366110e96060860186612425565b838181106110f9576110f961232b565b90506040020190508060200135846111119190612389565b935061113061112360208301836120f5565b61072b60208a018a6120f5565b7fe3576de866d95e30a6b102b256dc468ead824ef133838792dc1813c3786414ef61115e60208301836120f5565b61116b60208a018a6120f5565b6040805173ffffffffffffffffffffffffffffffffffffffff9384168152929091166020838101919091528401359082015260600160405180910390a150806111b38161239c565b9150506110d3565b506000826001826111cf60208801886120f5565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546112189190612389565b9091555061122e9050606085016040860161249b565b156112e857600061124f61124560208701876120f5565b8660800135611684565b9050838110156112bb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f636f6d6d697373696f6e20616d6f756e74206e6f74206d6174636865640000006044820152606401610509565b6112cd608086013560208701356123d4565b91506112e2338984610a0060208a018a6120f5565b506113a7565b60006113046112fa60208701876120f5565b8660200135611684565b90508460200135811015611374576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f616d6f756e74206e6f74206d61746368656400000000000000000000000000006044820152606401610509565b61137e84826123d4565b9150611393886000610acf60208901896120f5565b6113a58883610acf60208901896120f5565b505b6113b460208501856120f5565b604080513381526020810184905290810185905273ffffffffffffffffffffffffffffffffffffffff918216918916907f0e25509c2c6fc37a8844100a9a4c5b2b038bd5daaf09d216161eb8574ad4878b9060600160405180910390a360008086518760200160008b5af180600003610488573d6000803e3d6000fd5b73ffffffffffffffffffffffffffffffffffffffff80841660009081526003602090815260408083209386168352929052908120549081900361152a57600080815461147c9061239c565b909155506040805160608101825273ffffffffffffffffffffffffffffffffffffffff80871680835286821660208085018281528587018981526000805481526002808552898220985189549089167fffffffffffffffffffffffff0000000000000000000000000000000000000000918216178a55935160018a0180549190991694169390931790965551950194909455825491835260038452848320908352909252919091205561101f565b6000818152600260208190526040822001805484929061154b908490612389565b909155505050505050565b33600090815260036020908152604080832073ffffffffffffffffffffffffffffffffffffffff858116808652918452828520548086526002808652848720855160608101875281548516815260018083015490951681890152910180548287018190529088905593875291909452918420805493949293919283926115dd9084906123d4565b909155505073ffffffffffffffffffffffffffffffffffffffff841661160c576116073382611a3d565b61162d565b61162d73ffffffffffffffffffffffffffffffffffffffff85163383611b47565b6040805173ffffffffffffffffffffffffffffffffffffffff861681526020810183905233917f70eb43c4a8ae8c40502dcf22436c509c28d6ff421cf07c491be56984bd987068910160405180910390a250505050565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015260009073ffffffffffffffffffffffffffffffffffffffff8416906370a0823190602401602060405180830381865afa1580156116f1573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061171591906124b8565b905061173973ffffffffffffffffffffffffffffffffffffffff84163330856117da565b6040517f70a08231000000000000000000000000000000000000000000000000000000008152306004820152819073ffffffffffffffffffffffffffffffffffffffff8516906370a0823190602401602060405180830381865afa1580156117a5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117c991906124b8565b6117d391906123d4565b9392505050565b60405173ffffffffffffffffffffffffffffffffffffffff8085166024830152831660448201526064810182905261101f9085907f23b872dd00000000000000000000000000000000000000000000000000000000906084015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152611b9d565b80158061195657506040517fdd62ed3e00000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff838116602483015284169063dd62ed3e90604401602060405180830381865afa158015611930573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061195491906124b8565b155b6119e2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603660248201527f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f60448201527f20746f206e6f6e2d7a65726f20616c6c6f77616e6365000000000000000000006064820152608401610509565b60405173ffffffffffffffffffffffffffffffffffffffff8316602482015260448101829052611a389084907f095ea7b30000000000000000000000000000000000000000000000000000000090606401611834565b505050565b6040805160008082526020820190925273ffffffffffffffffffffffffffffffffffffffff8416908390604051611a7491906124f5565b60006040518083038185875af1925050503d8060008114611ab1576040519150601f19603f3d011682016040523d82523d6000602084013e611ab6565b606091505b5050905080611a38576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f5472616e7366657248656c7065723a204554485f5452414e534645525f46414960448201527f4c454400000000000000000000000000000000000000000000000000000000006064820152608401610509565b60405173ffffffffffffffffffffffffffffffffffffffff8316602482015260448101829052611a389084907fa9059cbb0000000000000000000000000000000000000000000000000000000090606401611834565b6000611bff826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16611ca99092919063ffffffff16565b805190915015611a385780806020019051810190611c1d9190612507565b611a38576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f742073756363656564000000000000000000000000000000000000000000006064820152608401610509565b6060611cb88484600085611cc0565b949350505050565b606082471015611d52576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c00000000000000000000000000000000000000000000000000006064820152608401610509565b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051611d7b91906124f5565b60006040518083038185875af1925050503d8060008114611db8576040519150601f19603f3d011682016040523d82523d6000602084013e611dbd565b606091505b5091509150611dce87838387611dd9565b979650505050505050565b60608315611e6f578251600003611e685773ffffffffffffffffffffffffffffffffffffffff85163b611e68576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610509565b5081611cb8565b611cb88383815115611e845781518083602001fd5b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105099190612524565b73ffffffffffffffffffffffffffffffffffffffff8116811461068057600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600082601f830112611f1a57600080fd5b813567ffffffffffffffff80821115611f3557611f35611eda565b604051601f83017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908282118183101715611f7b57611f7b611eda565b81604052838152866020858801011115611f9457600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060008060608587031215611fca57600080fd5b8435611fd581611eb8565b9350602085013567ffffffffffffffff80821115611ff257600080fd5b818701915087601f83011261200657600080fd5b81358181111561201557600080fd5b8860208260061b850101111561202a57600080fd5b60208301955080945050604087013591508082111561204857600080fd5b5061205587828801611f09565b91505092959194509250565b6000806040838503121561207457600080fd5b50508035926020909101359150565b602080825282518282018190526000919060409081850190868401855b828110156120e8578151805173ffffffffffffffffffffffffffffffffffffffff908116865287820151168786015285015185850152606090930192908501906001016120a0565b5091979650505050505050565b60006020828403121561210757600080fd5b81356117d381611eb8565b60008083601f84011261212457600080fd5b50813567ffffffffffffffff81111561213c57600080fd5b6020830191508360208260051b850101111561215757600080fd5b9250929050565b600080600080600080600060a0888a03121561217957600080fd5b873561218481611eb8565b9650602088013567ffffffffffffffff808211156121a157600080fd5b6121ad8b838c01612112565b909850965060408a013591506121c282611eb8565b909450606089013590808211156121d857600080fd5b6121e48b838c01612112565b909550935060808a01359150808211156121fd57600080fd5b5061220a8a828b01611f09565b91505092959891949750929550565b6000806040838503121561222c57600080fd5b823561223781611eb8565b9150602083013561224781611eb8565b809150509250929050565b6000806020838503121561226557600080fd5b823567ffffffffffffffff81111561227c57600080fd5b61228885828601612112565b90969095509350505050565b6000602082840312156122a657600080fd5b5035919050565b6000806000606084860312156122c257600080fd5b83356122cd81611eb8565b9250602084013567ffffffffffffffff808211156122ea57600080fd5b9085019060a082880312156122fe57600080fd5b9092506040850135908082111561231457600080fd5b5061232186828701611f09565b9150509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b808201808211156110685761106861235a565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036123cd576123cd61235a565b5060010190565b818103818111156110685761106861235a565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6183360301811261241b57600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe184360301811261245a57600080fd5b83018035915067ffffffffffffffff82111561247557600080fd5b6020019150600681901b360382131561215757600080fd5b801515811461068057600080fd5b6000602082840312156124ad57600080fd5b81356117d38161248d565b6000602082840312156124ca57600080fd5b5051919050565b60005b838110156124ec5781810151838201526020016124d4565b50506000910152565b6000825161241b8184602087016124d1565b60006020828403121561251957600080fd5b81516117d38161248d565b60208152600082518060208401526125438160408501602087016124d1565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016919091016040019291505056fea26469706673582212209cca70a9576e9493198c65a6086f463ebf4f83feb8872306feb8c98fcff97b4b64736f6c63430008110033"
    };
});
define("@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.ts", ["require", "exports", "@ijstech/eth-contract", "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.json.ts"], function (require, exports, eth_contract_4, ProxyV2_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProxyV2 = void 0;
    class ProxyV2 extends eth_contract_4.Contract {
        constructor(wallet, address) {
            super(wallet, address, ProxyV2_json_1.default.abi, ProxyV2_json_1.default.bytecode);
            this.assign();
        }
        deploy(options) {
            return this.__deploy([], options);
        }
        parseAddCommissionEvent(receipt) {
            return this.parseEvents(receipt, "AddCommission").map(e => this.decodeAddCommissionEvent(e));
        }
        decodeAddCommissionEvent(event) {
            let result = event.data;
            return {
                to: result.to,
                token: result.token,
                amount: new eth_contract_4.BigNumber(result.amount),
                _event: event
            };
        }
        parseClaimEvent(receipt) {
            return this.parseEvents(receipt, "Claim").map(e => this.decodeClaimEvent(e));
        }
        decodeClaimEvent(event) {
            let result = event.data;
            return {
                from: result.from,
                token: result.token,
                amount: new eth_contract_4.BigNumber(result.amount),
                _event: event
            };
        }
        parseSkimEvent(receipt) {
            return this.parseEvents(receipt, "Skim").map(e => this.decodeSkimEvent(e));
        }
        decodeSkimEvent(event) {
            let result = event.data;
            return {
                token: result.token,
                to: result.to,
                amount: new eth_contract_4.BigNumber(result.amount),
                _event: event
            };
        }
        parseTransferBackEvent(receipt) {
            return this.parseEvents(receipt, "TransferBack").map(e => this.decodeTransferBackEvent(e));
        }
        decodeTransferBackEvent(event) {
            let result = event.data;
            return {
                target: result.target,
                token: result.token,
                sender: result.sender,
                amount: new eth_contract_4.BigNumber(result.amount),
                _event: event
            };
        }
        parseTransferForwardEvent(receipt) {
            return this.parseEvents(receipt, "TransferForward").map(e => this.decodeTransferForwardEvent(e));
        }
        decodeTransferForwardEvent(event) {
            let result = event.data;
            return {
                target: result.target,
                token: result.token,
                sender: result.sender,
                amount: new eth_contract_4.BigNumber(result.amount),
                commissions: new eth_contract_4.BigNumber(result.commissions),
                _event: event
            };
        }
        assign() {
            let claimantIdCount_call = async (options) => {
                let result = await this.call('claimantIdCount', [], options);
                return new eth_contract_4.BigNumber(result);
            };
            this.claimantIdCount = claimantIdCount_call;
            let claimantIdsParams = (params) => [params.param1, params.param2];
            let claimantIds_call = async (params, options) => {
                let result = await this.call('claimantIds', claimantIdsParams(params), options);
                return new eth_contract_4.BigNumber(result);
            };
            this.claimantIds = claimantIds_call;
            let claimantsInfo_call = async (param1, options) => {
                let result = await this.call('claimantsInfo', [this.wallet.utils.toString(param1)], options);
                return {
                    claimant: result.claimant,
                    token: result.token,
                    balance: new eth_contract_4.BigNumber(result.balance)
                };
            };
            this.claimantsInfo = claimantsInfo_call;
            let getClaimantBalanceParams = (params) => [params.claimant, params.token];
            let getClaimantBalance_call = async (params, options) => {
                let result = await this.call('getClaimantBalance', getClaimantBalanceParams(params), options);
                return new eth_contract_4.BigNumber(result);
            };
            this.getClaimantBalance = getClaimantBalance_call;
            let getClaimantsInfoParams = (params) => [this.wallet.utils.toString(params.fromId), this.wallet.utils.toString(params.count)];
            let getClaimantsInfo_call = async (params, options) => {
                let result = await this.call('getClaimantsInfo', getClaimantsInfoParams(params), options);
                return (result.map(e => ({
                    claimant: e.claimant,
                    token: e.token,
                    balance: new eth_contract_4.BigNumber(e.balance)
                })));
            };
            this.getClaimantsInfo = getClaimantsInfo_call;
            let lastBalance_call = async (param1, options) => {
                let result = await this.call('lastBalance', [param1], options);
                return new eth_contract_4.BigNumber(result);
            };
            this.lastBalance = lastBalance_call;
            let claim_send = async (token, options) => {
                let result = await this.send('claim', [token], options);
                return result;
            };
            let claim_call = async (token, options) => {
                let result = await this.call('claim', [token], options);
                return;
            };
            let claim_txData = async (token, options) => {
                let result = await this.txData('claim', [token], options);
                return result;
            };
            this.claim = Object.assign(claim_send, {
                call: claim_call,
                txData: claim_txData
            });
            let claimMultiple_send = async (tokens, options) => {
                let result = await this.send('claimMultiple', [tokens], options);
                return result;
            };
            let claimMultiple_call = async (tokens, options) => {
                let result = await this.call('claimMultiple', [tokens], options);
                return;
            };
            let claimMultiple_txData = async (tokens, options) => {
                let result = await this.txData('claimMultiple', [tokens], options);
                return result;
            };
            this.claimMultiple = Object.assign(claimMultiple_send, {
                call: claimMultiple_call,
                txData: claimMultiple_txData
            });
            let ethInParams = (params) => [params.target, params.commissions.map(e => ([e.to, this.wallet.utils.toString(e.amount)])), this.wallet.utils.stringToBytes(params.data)];
            let ethIn_send = async (params, options) => {
                let result = await this.send('ethIn', ethInParams(params), options);
                return result;
            };
            let ethIn_call = async (params, options) => {
                let result = await this.call('ethIn', ethInParams(params), options);
                return;
            };
            let ethIn_txData = async (params, options) => {
                let result = await this.txData('ethIn', ethInParams(params), options);
                return result;
            };
            this.ethIn = Object.assign(ethIn_send, {
                call: ethIn_call,
                txData: ethIn_txData
            });
            let proxyCallParams = (params) => [params.target, params.tokensIn.map(e => ([e.token, this.wallet.utils.toString(e.amount), e.directTransfer, e.commissions.map(e => ([e.to, this.wallet.utils.toString(e.amount)])), this.wallet.utils.toString(e.totalCommissions)])), params.to, params.tokensOut, this.wallet.utils.stringToBytes(params.data)];
            let proxyCall_send = async (params, options) => {
                let result = await this.send('proxyCall', proxyCallParams(params), options);
                return result;
            };
            let proxyCall_call = async (params, options) => {
                let result = await this.call('proxyCall', proxyCallParams(params), options);
                return;
            };
            let proxyCall_txData = async (params, options) => {
                let result = await this.txData('proxyCall', proxyCallParams(params), options);
                return result;
            };
            this.proxyCall = Object.assign(proxyCall_send, {
                call: proxyCall_call,
                txData: proxyCall_txData
            });
            let skim_send = async (tokens, options) => {
                let result = await this.send('skim', [tokens], options);
                return result;
            };
            let skim_call = async (tokens, options) => {
                let result = await this.call('skim', [tokens], options);
                return;
            };
            let skim_txData = async (tokens, options) => {
                let result = await this.txData('skim', [tokens], options);
                return result;
            };
            this.skim = Object.assign(skim_send, {
                call: skim_call,
                txData: skim_txData
            });
            let tokenInParams = (params) => [params.target, [params.tokensIn.token, this.wallet.utils.toString(params.tokensIn.amount), params.tokensIn.directTransfer, params.tokensIn.commissions.map(e => ([e.to, this.wallet.utils.toString(e.amount)])), this.wallet.utils.toString(params.tokensIn.totalCommissions)], this.wallet.utils.stringToBytes(params.data)];
            let tokenIn_send = async (params, options) => {
                let result = await this.send('tokenIn', tokenInParams(params), options);
                return result;
            };
            let tokenIn_call = async (params, options) => {
                let result = await this.call('tokenIn', tokenInParams(params), options);
                return;
            };
            let tokenIn_txData = async (params, options) => {
                let result = await this.txData('tokenIn', tokenInParams(params), options);
                return result;
            };
            this.tokenIn = Object.assign(tokenIn_send, {
                call: tokenIn_call,
                txData: tokenIn_txData
            });
        }
    }
    ProxyV2._abi = ProxyV2_json_1.default.abi;
    exports.ProxyV2 = ProxyV2;
});
define("@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/index.ts", ["require", "exports", "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/Proxy.ts", "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/ProxyV2.ts"], function (require, exports, Proxy_1, ProxyV2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProxyV2 = exports.Proxy = void 0;
    Object.defineProperty(exports, "Proxy", { enumerable: true, get: function () { return Proxy_1.Proxy; } });
    Object.defineProperty(exports, "ProxyV2", { enumerable: true, get: function () { return ProxyV2_1.ProxyV2; } });
});
define("@scom/scom-gem-token/contracts/scom-commission-proxy-contract/index.ts", ["require", "exports", "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/contracts/index.ts"], function (require, exports, Contracts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onProgress = exports.deploy = exports.DefaultDeployOptions = exports.Contracts = void 0;
    exports.Contracts = Contracts;
    ;
    ;
    var progressHandler;
    exports.DefaultDeployOptions = {
        version: 'V1'
    };
    function progress(msg) {
        if (typeof (progressHandler) == 'function') {
            progressHandler(msg);
        }
        ;
    }
    async function deploy(wallet, options) {
        progress('Contracts deployment start');
        let proxy;
        if (options.version == 'V2') {
            proxy = new Contracts.ProxyV2(wallet);
        }
        else {
            proxy = new Contracts.Proxy(wallet);
        }
        progress('Deploy Proxy');
        await proxy.deploy();
        progress('Proxy deployed ' + proxy.address);
        progress('Contracts deployment finished');
        return {
            proxy: proxy.address
        };
    }
    exports.deploy = deploy;
    ;
    function onProgress(handler) {
        progressHandler = handler;
    }
    exports.onProgress = onProgress;
    ;
    exports.default = {
        Contracts,
        deploy,
        DefaultDeployOptions: exports.DefaultDeployOptions,
        onProgress
    };
});
define("@scom/scom-gem-token/API.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-gem-token/contracts/scom-gem-token-contract/index.ts", "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/index.ts", "@scom/scom-gem-token/utils/index.ts", "@scom/scom-gem-token/store/index.ts", "@scom/scom-token-list"], function (require, exports, eth_wallet_6, index_2, index_3, index_4, index_5, scom_token_list_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGemInfo = exports.getGemBalance = exports.redeemToken = exports.buyToken = exports.transfer = exports.getFee = exports.deployContract = void 0;
    async function getFee(contractAddress, type) {
        const wallet = eth_wallet_6.Wallet.getInstance();
        const contract = new index_2.Contracts.GEM(wallet, contractAddress);
        const fee = type === 'buy' ? await contract.mintingFee() : await contract.redemptionFee();
        const decimals = (await contract.decimals()).toNumber();
        return eth_wallet_6.Utils.fromDecimals(fee, decimals);
    }
    exports.getFee = getFee;
    async function getGemBalance(contractAddress) {
        const wallet = eth_wallet_6.Wallet.getInstance();
        const contract = new index_2.Contracts.GEM(wallet, contractAddress);
        const balance = await contract.balanceOf(wallet.address);
        return balance;
    }
    exports.getGemBalance = getGemBalance;
    async function deployContract(options, token, callback, confirmationCallback) {
        const wallet = eth_wallet_6.Wallet.getInstance();
        (0, index_4.registerSendTxEvents)({
            transactionHash: callback,
            confirmation: confirmationCallback
        });
        const gem = new index_2.Contracts.GEM(wallet);
        const receipt = await gem.deploy({
            name: options.name,
            symbol: options.symbol,
            cap: eth_wallet_6.Utils.toDecimals(options.cap).dp(0),
            mintingFee: eth_wallet_6.Utils.toDecimals(options.mintingFee).dp(0),
            redemptionFee: eth_wallet_6.Utils.toDecimals(options.redemptionFee).dp(0),
            price: eth_wallet_6.Utils.toDecimals(options.price).dp(0),
            baseToken: (token === null || token === void 0 ? void 0 : token.address) || ""
        });
        return gem.address;
    }
    exports.deployContract = deployContract;
    async function transfer(contractAddress, to, amount) {
        const wallet = eth_wallet_6.Wallet.getInstance();
        const contract = new index_2.Contracts.GEM(wallet, contractAddress);
        const receipt = await contract.transfer({
            to,
            amount: new eth_wallet_6.BigNumber(amount)
        });
        let value;
        if (receipt) {
            const event = contract.parseTransferEvent(receipt)[0];
            value = event.value;
        }
        return {
            receipt,
            value
        };
    }
    exports.transfer = transfer;
    async function getGemInfo(contractAddress) {
        var _a;
        const wallet = eth_wallet_6.Wallet.getInstance();
        const gem = new index_2.Contracts.GEM(wallet, contractAddress);
        try {
            const [priceValue, mintingFeeValue, redemptionFeeValue, decimalsValue, capValue, baseTokenValue, nameValue, symbolValue] = await Promise.all([
                gem.price(),
                gem.mintingFee(),
                gem.redemptionFee(),
                gem.decimals(),
                gem.cap(),
                gem.baseToken(),
                gem.name(),
                gem.symbol()
            ]);
            const chainId = wallet.chainId;
            const baseToken = (_a = scom_token_list_2.DefaultTokens[chainId]) === null || _a === void 0 ? void 0 : _a.find(t => { var _a; return ((_a = t.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == baseTokenValue.toLowerCase(); });
            return {
                price: priceValue,
                mintingFee: mintingFeeValue,
                redemptionFee: redemptionFeeValue,
                decimals: decimalsValue,
                cap: capValue,
                baseToken,
                name: nameValue,
                symbol: symbolValue
            };
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
    exports.getGemInfo = getGemInfo;
    async function buyToken(contractAddress, backerCoinAmount, token, commissions, callback, confirmationCallback) {
        try {
            (0, index_4.registerSendTxEvents)({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_6.Wallet.getInstance();
            const tokenDecimals = (token === null || token === void 0 ? void 0 : token.decimals) || 18;
            const amount = eth_wallet_6.Utils.toDecimals(backerCoinAmount, tokenDecimals).dp(0);
            const _commissions = (commissions || []).filter(v => v.chainId === (0, index_5.getChainId)()).map(v => {
                return {
                    to: v.walletAddress,
                    amount: amount.times(v.share)
                };
            });
            const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)) : new eth_wallet_6.BigNumber(0);
            const contract = new index_2.Contracts.GEM(wallet, contractAddress);
            let receipt;
            if (commissionsAmount.isZero()) {
                receipt = await contract.buy(amount);
            }
            else {
                let proxyAddress = (0, index_5.getProxyAddress)();
                const proxy = new index_3.Contracts.Proxy(wallet, proxyAddress);
                const txData = await contract.buy.txData(amount);
                const tokensIn = {
                    token: token.address,
                    amount: commissionsAmount.plus(amount),
                    directTransfer: false,
                    commissions: _commissions
                };
                receipt = await proxy.tokenIn({
                    target: contractAddress,
                    tokensIn,
                    data: txData
                });
            }
            if (receipt) {
                const data = contract.parseBuyEvent(receipt)[0];
                return {
                    receipt,
                    data
                };
            }
            return receipt;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
    exports.buyToken = buyToken;
    async function redeemToken(address, gemAmount, callback, confirmationCallback) {
        try {
            (0, index_4.registerSendTxEvents)({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_6.Wallet.getInstance();
            const contract = new index_2.Contracts.GEM(wallet, address);
            const receipt = await contract.redeem(eth_wallet_6.Utils.toDecimals(gemAmount).dp(0));
            if (receipt) {
                const data = contract.parseRedeemEvent(receipt)[0];
                return {
                    receipt,
                    data
                };
            }
            return receipt;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
    exports.redeemToken = redeemToken;
});
define("@scom/scom-gem-token/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-gem-token/data.json.ts'/> 
    exports.default = {
        "infuraId": "adc596bf88b648e2a8902bc9093930c5",
        "networks": [
            {
                "chainId": 97,
                "isMainChain": true,
                "isCrossChainSupported": true,
                "explorerName": "BSCScan",
                "explorerTxUrl": "https://testnet.bscscan.com/tx/",
                "explorerAddressUrl": "https://testnet.bscscan.com/address/",
                "isTestnet": true
            },
            {
                "chainId": 43113,
                "shortName": "AVAX Testnet",
                "isCrossChainSupported": true,
                "explorerName": "SnowTrace",
                "explorerTxUrl": "https://testnet.snowtrace.io/tx/",
                "explorerAddressUrl": "https://testnet.snowtrace.io/address/",
                "isTestnet": true
            }
        ],
        "proxyAddresses": {
            "97": "0x9602cB9A782babc72b1b6C96E050273F631a6870",
            "43113": "0x7f1EAB0db83c02263539E3bFf99b638E61916B96"
        },
        "embedderCommissionFee": "0.01",
        "defaultBuilderData": {
            "dappType": "buy",
            "hideDescription": false,
            "description": "Elon Gem Token is a cryptocurrency that honors the vision and innovative spirit of Elon Musk.",
            "chainSpecificProperties": {
                "43113": {
                    "contract": "0xCfF0d71140E9f4201b9151978BA1097732BbC36A"
                }
            },
            "defaultChainId": 43113,
            "networks": [
                {
                    "chainId": 43113
                },
                {
                    "chainId": 97
                }
            ],
            "wallets": [
                {
                    "name": "metamask"
                }
            ]
        }
    };
});
define("@scom/scom-gem-token", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-gem-token/utils/index.ts", "@scom/scom-gem-token/store/index.ts", "@scom/scom-token-list", "@scom/scom-gem-token/assets.ts", "@scom/scom-gem-token/index.css.ts", "@scom/scom-gem-token/API.ts", "@scom/scom-gem-token/data.json.ts", "@scom/scom-commission-fee-setup"], function (require, exports, components_7, eth_wallet_7, index_6, index_7, scom_token_list_3, assets_1, index_css_2, API_1, data_json_1, scom_commission_fee_setup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_7.Styles.Theme.ThemeVars;
    const buyTooltip = 'The fee the project owner will receive for token minting';
    const redeemTooltip = 'The spread the project owner will receive for redemptions';
    let ScomGemToken = class ScomGemToken extends components_7.Module {
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                wallets: [],
                networks: [],
                defaultChainId: 0
            };
            this.isApproving = false;
            this.tag = {};
            this.defaultEdit = true;
            this.onWalletConnect = async (connected) => {
                let chainId = (0, index_7.getChainId)();
                if (connected && !chainId) {
                    this.onSetupPage(true);
                }
                else {
                    this.onSetupPage(connected);
                }
                if (connected) {
                    this.updateContractAddress();
                    this.refreshDApp();
                }
                else
                    this.lblBalance.caption = '0.00';
            };
            this.onChainChanged = async () => {
                this.onSetupPage(true);
                this.updateContractAddress();
                this.refreshDApp();
            };
            this.updateTokenBalance = async () => {
                var _a;
                const token = (_a = this.gemInfo) === null || _a === void 0 ? void 0 : _a.baseToken;
                if (!token)
                    return;
                try {
                    const symbol = (token === null || token === void 0 ? void 0 : token.symbol) || '';
                    this.lblBalance.caption = token ? `${(await (0, index_6.getTokenBalance)(token)).toFixed(2)} ${symbol}` : `0 ${symbol}`;
                }
                catch (_b) { }
            };
            this.onDeploy = async (callback, confirmationCallback) => {
                if (this.contract || !this.gemInfo.name)
                    return;
                const params = {
                    name: this.gemInfo.name,
                    symbol: this.gemInfo.symbol,
                    cap: this.gemInfo.cap.toFixed(),
                    price: this.gemInfo.price.toFixed(),
                    mintingFee: this.gemInfo.mintingFee.toFixed(),
                    redemptionFee: this.gemInfo.redemptionFee.toFixed()
                };
                const result = await (0, API_1.deployContract)(params, this.gemInfo.baseToken, callback, confirmationCallback);
            };
            this.onBuyToken = async (quantity) => {
                this.mdAlert.closeModal();
                if (!this.gemInfo.name)
                    return;
                const callback = (error, receipt) => {
                    if (error) {
                        this.mdAlert.message = {
                            status: 'error',
                            content: (0, index_6.parseContractError)(error)
                        };
                        this.mdAlert.showModal();
                    }
                };
                await (0, API_1.buyToken)(this.contract, quantity, this.gemInfo.baseToken, this._data.commissions, callback, async (result) => {
                    console.log('buyToken: ', result);
                    this.edtGemQty.value = '';
                    this.edtAmount.value = '';
                    this.btnSubmit.enabled = false;
                    await this.updateTokenBalance();
                });
            };
            this.onRedeemToken = async () => {
                this.mdAlert.closeModal();
                if (!this.gemInfo.name)
                    return;
                const callback = (error, receipt) => {
                    if (error) {
                        this.mdAlert.message = {
                            status: 'error',
                            content: (0, index_6.parseContractError)(error)
                        };
                        this.mdAlert.showModal();
                    }
                };
                const gemAmount = this.edtAmount.value;
                await (0, API_1.redeemToken)(this.contract, gemAmount, callback, async (result) => {
                    console.log('redeemToken: ', result);
                    this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
                    this.edtAmount.value = '';
                    this.backerTokenBalanceLb.caption = '0.00';
                });
            };
            if (data_json_1.default)
                (0, index_7.setDataFromSCConfig)(data_json_1.default);
            this.$eventBus = components_7.application.EventBus;
            this.registerEvent();
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        registerEvent() {
            this.$eventBus.register(this, "isWalletConnected" /* EventId.IsWalletConnected */, () => this.onWalletConnect(true));
            this.$eventBus.register(this, "IsWalletDisconnected" /* EventId.IsWalletDisconnected */, () => this.onWalletConnect(false));
            this.$eventBus.register(this, "chainChanged" /* EventId.chainChanged */, this.onChainChanged);
        }
        get isBuy() {
            return this._data.dappType === 'buy';
        }
        get tokenSymbol() {
            var _a, _b;
            return ((_b = (_a = this.gemInfo) === null || _a === void 0 ? void 0 : _a.baseToken) === null || _b === void 0 ? void 0 : _b.symbol) || '';
        }
        get wallets() {
            var _a;
            return (_a = this._data.wallets) !== null && _a !== void 0 ? _a : [];
        }
        set wallets(value) {
            this._data.wallets = value;
        }
        get networks() {
            var _a;
            return (_a = this._data.networks) !== null && _a !== void 0 ? _a : [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            var _a;
            return (_a = this._data.showHeader) !== null && _a !== void 0 ? _a : true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
        }
        get defaultChainId() {
            return this._data.defaultChainId;
        }
        set defaultChainId(value) {
            this._data.defaultChainId = value;
        }
        async onSetupPage(isWalletConnected) {
            if (isWalletConnected)
                await this.initApprovalAction();
            else
                this.resetUI();
        }
        resetUI() {
            if (!this.feeLb.isConnected)
                return;
            // this.fromTokenLb.caption = '';
            // this.toTokenLb.caption = '';
            this.feeLb.caption = '0.00';
            this.lbYouWillGet.caption = '0.00';
            this.edtGemQty.value = '';
            this.btnSubmit.enabled = false;
            this.btnApprove.visible = false;
            this.edtAmount.value = '';
        }
        _getActions(propertiesSchema, themeSchema, category) {
            let self = this;
            const actions = [
                {
                    name: 'Commissions',
                    icon: 'dollar-sign',
                    command: (builder, userInputData) => {
                        let _oldData = {
                            wallets: [],
                            networks: [],
                            defaultChainId: 0
                        };
                        return {
                            execute: async () => {
                                _oldData = Object.assign({}, this._data);
                                let resultingData = Object.assign(Object.assign({}, self._data), { commissions: userInputData.commissions });
                                await self.setData(resultingData);
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                            },
                            undo: async () => {
                                this._data = Object.assign({}, _oldData);
                                await self.setData(this._data);
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                            },
                            redo: () => { }
                        };
                    },
                    customUI: {
                        render: (data, onConfirm) => {
                            const vstack = new components_7.VStack();
                            const config = new scom_commission_fee_setup_1.default(null, {
                                commissions: self._data.commissions || [],
                                fee: (0, index_7.getEmbedderCommissionFee)(),
                                networks: self._data.networks
                            });
                            const button = new components_7.Button(null, {
                                caption: 'Confirm',
                            });
                            vstack.append(config);
                            vstack.append(button);
                            button.onClick = async () => {
                                const commissions = config.commissions;
                                if (onConfirm)
                                    onConfirm(true, { commissions });
                            };
                            return vstack;
                        }
                    }
                }
            ];
            if (category && category !== 'offers') {
                actions.push({
                    name: 'Settings',
                    icon: 'cog',
                    command: (builder, userInputData) => {
                        let _oldData = {
                            wallets: [],
                            networks: [],
                            defaultChainId: 0
                        };
                        return {
                            execute: async () => {
                                _oldData = Object.assign({}, this._data);
                                if (userInputData.dappType != undefined)
                                    this._data.dappType = userInputData.dappType;
                                if (userInputData.logo != undefined)
                                    this._data.logo = userInputData.logo;
                                if (userInputData.description != undefined)
                                    this._data.description = userInputData.description;
                                this.refreshDApp();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                            },
                            undo: async () => {
                                this._data = Object.assign({}, _oldData);
                                this.refreshDApp();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: propertiesSchema
                });
                actions.push({
                    name: 'Theme Settings',
                    icon: 'palette',
                    command: (builder, userInputData) => {
                        let oldTag = {};
                        return {
                            execute: async () => {
                                if (!userInputData)
                                    return;
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder)
                                    builder.setTag(userInputData);
                                else
                                    this.setTag(userInputData);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(userInputData);
                            },
                            undo: () => {
                                if (!userInputData)
                                    return;
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: themeSchema
                });
            }
            return actions;
        }
        getConfigurators() {
            let self = this;
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: (category) => {
                        const propertiesSchema = {
                            type: 'object',
                            properties: {
                            // "contract": {
                            //   type: 'string'
                            // }
                            }
                        };
                        if (!this._data.hideDescription) {
                            propertiesSchema.properties['description'] = {
                                type: 'string',
                                format: 'multi'
                            };
                        }
                        const themeSchema = {
                            type: 'object',
                            properties: {
                                "dark": {
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
                                        }
                                    }
                                },
                                "light": {
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
                                        }
                                    }
                                }
                            }
                        };
                        return this._getActions(propertiesSchema, themeSchema, category);
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData(Object.assign(Object.assign({}, defaultData), data));
                    },
                    setTag: this.setTag.bind(this),
                    getTag: this.getTag.bind(this)
                },
                {
                    name: 'Emdedder Configurator',
                    target: 'Embedders',
                    elementName: 'i-scom-commission-fee-setup',
                    getLinkParams: () => {
                        const commissions = self._data.commissions || [];
                        return {
                            data: window.btoa(JSON.stringify(commissions))
                        };
                    },
                    setLinkParams: async (params) => {
                        if (params.data) {
                            const decodedString = window.atob(params.data);
                            const commissions = JSON.parse(decodedString);
                            let resultingData = Object.assign(Object.assign({}, self._data), { commissions });
                            await self.setData(resultingData);
                        }
                    },
                    bindOnChanged: (element, callback) => {
                        element.onChanged = async (data) => {
                            let resultingData = Object.assign(Object.assign({}, self._data), data);
                            await self.setData(resultingData);
                            await callback(data);
                        };
                    },
                    getData: () => {
                        const fee = (0, index_7.getEmbedderCommissionFee)();
                        return Object.assign(Object.assign({}, this.getData()), { fee });
                    },
                    setData: this.setData.bind(this),
                    setTag: this.setTag.bind(this),
                    getTag: this.getTag.bind(this)
                }
            ];
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            await this.onSetupPage((0, index_7.isWalletConnected)());
            this._data = data;
            const commissionFee = (0, index_7.getEmbedderCommissionFee)();
            this.iconOrderTotal.tooltip.content = `A commission fee of ${new eth_wallet_7.BigNumber(commissionFee).times(100)}% will be applied to the amount you input.`;
            this.updateContractAddress();
            await this.refreshDApp();
        }
        getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            var _a;
            this.tag[type] = (_a = this.tag[type]) !== null && _a !== void 0 ? _a : {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        async setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'light' || prop === 'dark')
                        this.updateTag(prop, newValue[prop]);
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            if (this.dappContainer)
                this.dappContainer.setTag(this.tag);
            this.updateTheme();
        }
        updateStyle(name, value) {
            value ?
                this.style.setProperty(name, value) :
                this.style.removeProperty(name);
        }
        updateTheme() {
            var _a, _b, _c, _d, _e, _f;
            const themeVar = ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.theme) || 'light';
            this.updateStyle('--text-primary', (_b = this.tag[themeVar]) === null || _b === void 0 ? void 0 : _b.fontColor);
            this.updateStyle('--background-main', (_c = this.tag[themeVar]) === null || _c === void 0 ? void 0 : _c.backgroundColor);
            this.updateStyle('--input-font_color', (_d = this.tag[themeVar]) === null || _d === void 0 ? void 0 : _d.inputFontColor);
            this.updateStyle('--input-background', (_e = this.tag[themeVar]) === null || _e === void 0 ? void 0 : _e.inputBackgroundColor);
            this.updateStyle('--colors-primary-main', (_f = this.tag[themeVar]) === null || _f === void 0 ? void 0 : _f.buttonBackgroundColor);
        }
        async confirm() {
            return new Promise(async (resolve, reject) => {
                try {
                    if (this.loadingElm)
                        this.loadingElm.visible = true;
                    await this.onDeploy((error, receipt) => {
                        if (error) {
                            this.mdAlert.message = {
                                status: 'error',
                                content: (0, index_6.parseContractError)(error)
                            };
                            this.mdAlert.showModal();
                            reject(error);
                        }
                    }, (receipt) => {
                        this.refreshDApp();
                    });
                }
                catch (error) {
                    this.mdAlert.message = {
                        status: 'error',
                        content: (0, index_6.parseContractError)(error)
                    };
                    this.mdAlert.showModal();
                    reject(error);
                }
                if (!this.contract && !this._data)
                    reject(new Error('Data missing'));
                resolve();
                if (this.loadingElm)
                    this.loadingElm.visible = false;
            });
        }
        async refreshDApp() {
            var _a, _b;
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
            this.imgLogo.url = this.imgLogo2.url = this._data.logo || assets_1.default.fullPath('img/gem-logo.png');
            const data = {
                wallets: this.wallets,
                networks: this.networks,
                showHeader: this.showHeader,
                defaultChainId: this.defaultChainId
            };
            if ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.setData)
                await this.dappContainer.setData(data);
            this.gemInfo = this.contract ? await (0, API_1.getGemInfo)(this.contract) : null;
            if ((_b = this.gemInfo) === null || _b === void 0 ? void 0 : _b.baseToken) {
                this.lbPrice.visible = true;
                this.hStackTokens.visible = true;
                this.pnlInputFields.visible = true;
                this.pnlUnsupportedNetwork.visible = false;
                this.renderTokenInput();
                const buyDesc = `Use ${this.gemInfo.name || ''} for services on Secure Compute, decentralized hosting, audits, sub-domains and more. Full backed, Redeemable and transparent at all times!`;
                const redeemDesc = `Redeem your ${this.gemInfo.name || ''} Tokens for the underlying token.`;
                const description = this._data.description || (this.isBuy ? buyDesc : redeemDesc);
                this.markdownViewer.load(description);
                if (!this.fromTokenLb.isConnected)
                    await this.fromTokenLb.ready();
                this.fromTokenLb.caption = `1 ${this.gemInfo.name || ''}`;
                if (!this.toTokenLb.isConnected)
                    await this.toTokenLb.ready();
                this.toTokenLb.caption = `1 ${this.tokenSymbol}`;
                if (!this.lblTitle.isConnected)
                    await this.lblTitle.ready();
                if (!this.lblTitle2.isConnected)
                    await this.lblTitle2.ready();
                this.lblTitle.visible = true;
                this.lblTitle2.visible = true;
                this.markdownViewer.visible = true;
                this.lblTitle.caption = this.lblTitle2.caption = `${this.isBuy ? 'Buy' : 'Redeem'} ${this.gemInfo.name || ''} - GEM Tokens`;
                if (!this.backerStack.isConnected)
                    await this.backerStack.ready();
                this.backerStack.visible = !this.isBuy;
                if (!this.pnlQty.isConnected)
                    await this.pnlQty.ready();
                this.pnlQty.visible = this.isBuy;
                this.balanceLayout.templateAreas = [['qty'], ['balance'], ['tokenInput'], ['redeem']];
                if (!this.edtGemQty.isConnected)
                    await this.edtGemQty.ready();
                this.edtGemQty.readOnly = !this.contract;
                this.edtGemQty.value = "";
                if (!this.isBuy) {
                    this.btnSubmit.enabled = false;
                    this.btnApprove.visible = false;
                    this.backerTokenImg.url = scom_token_list_3.assets.tokenPath(this.gemInfo.baseToken, (0, index_7.getChainId)());
                    if (!this.backerTokenBalanceLb.isConnected)
                        await this.backerTokenBalanceLb.ready();
                    this.backerTokenBalanceLb.caption = '0.00';
                }
                const feeValue = this.isBuy ? eth_wallet_7.Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : eth_wallet_7.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
                if (!this.feeLb.isConnected)
                    await this.feeLb.ready();
                this.feeLb.caption = `${feeValue || ''} ${this.gemInfo.name}`;
                const qty = Number(this.edtGemQty.value);
                const totalGemTokens = new eth_wallet_7.BigNumber(qty).minus(new eth_wallet_7.BigNumber(qty).times(feeValue)).toFixed();
                if (!this.lbYouWillGet.isConnected)
                    await this.lbYouWillGet.ready();
                this.lbYouWillGet.caption = `${totalGemTokens} ${this.gemInfo.name}`;
                this.feeTooltip.tooltip.content = this.isBuy ? buyTooltip : redeemTooltip;
                if (!this.lblBalance.isConnected)
                    await this.lblBalance.ready();
                this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
                this.updateTokenBalance();
            }
            else {
                this.lbPrice.visible = false;
                this.hStackTokens.visible = false;
                this.pnlInputFields.visible = false;
                this.lblTitle.visible = false;
                this.lblTitle2.visible = false;
                this.markdownViewer.visible = false;
                this.pnlUnsupportedNetwork.visible = true;
            }
        }
        async init() {
            this.isReadyCallbackQueued = true;
            super.init();
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const dappType = this.getAttribute('dappType', true);
                const description = this.getAttribute('description', true);
                const hideDescription = this.getAttribute('hideDescription', true);
                const logo = this.getAttribute('logo', true);
                const chainSpecificProperties = this.getAttribute('chainSpecificProperties', true);
                const networks = this.getAttribute('networks', true, []);
                const wallets = this.getAttribute('wallets', true, []);
                const showHeader = this.getAttribute('showHeader', true);
                const defaultChainId = this.getAttribute('defaultChainId', true, 1);
                (0, index_7.setDefaultChainId)(defaultChainId);
                await this.setData({
                    dappType,
                    description,
                    hideDescription,
                    logo,
                    chainSpecificProperties,
                    networks,
                    wallets,
                    showHeader,
                    defaultChainId
                });
            }
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        get contract() {
            var _a, _b, _c;
            return (_c = (_b = (_a = this._data.chainSpecificProperties) === null || _a === void 0 ? void 0 : _a[(0, index_7.getChainId)()]) === null || _b === void 0 ? void 0 : _b.contract) !== null && _c !== void 0 ? _c : '';
        }
        get dappType() {
            var _a;
            return (_a = this._data.dappType) !== null && _a !== void 0 ? _a : "buy";
        }
        set dappType(value) {
            this._data.dappType = value;
        }
        get description() {
            var _a;
            return (_a = this._data.description) !== null && _a !== void 0 ? _a : '';
        }
        set description(value) {
            this._data.description = value;
        }
        get hideDescription() {
            var _a;
            return (_a = this._data.hideDescription) !== null && _a !== void 0 ? _a : false;
        }
        set hideDescription(value) {
            this._data.hideDescription = value;
        }
        get logo() {
            var _a;
            return (_a = this._data.logo) !== null && _a !== void 0 ? _a : '';
        }
        set logo(value) {
            this._data.logo = value;
        }
        get chainSpecificProperties() {
            var _a;
            return (_a = this._data.chainSpecificProperties) !== null && _a !== void 0 ? _a : {};
        }
        set chainSpecificProperties(value) {
            this._data.chainSpecificProperties = value;
        }
        async initApprovalAction() {
            if (!this.approvalModelAction) {
                this._entryContract = (0, index_7.getProxyAddress)();
                this.approvalModelAction = (0, index_6.getERC20ApprovalModelAction)(this._entryContract, {
                    sender: this,
                    payAction: async () => {
                        await this.doSubmitAction();
                    },
                    onToBeApproved: async (token) => {
                        this.btnApprove.visible = true;
                        this.btnSubmit.enabled = false;
                        if (!this.isApproving) {
                            this.btnApprove.rightIcon.visible = false;
                            this.btnApprove.caption = 'Approve';
                        }
                        this.btnApprove.enabled = new eth_wallet_7.BigNumber(this.edtGemQty.value).gt(0);
                        this.isApproving = false;
                    },
                    onToBePaid: async (token) => {
                        this.btnApprove.visible = false;
                        this.isApproving = false;
                        this.btnSubmit.enabled = new eth_wallet_7.BigNumber(this.edtAmount.value).gt(0);
                    },
                    onApproving: async (token, receipt) => {
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
                    onApproved: async (token) => {
                        this.btnApprove.rightIcon.visible = false;
                        this.btnApprove.caption = 'Approve';
                        this.isApproving = false;
                        this.btnSubmit.visible = true;
                        this.btnSubmit.enabled = true;
                    },
                    onApprovingError: async (token, err) => {
                        this.mdAlert.message = {
                            status: 'error',
                            content: err.message
                        };
                        this.mdAlert.showModal();
                        this.btnApprove.caption = 'Approve';
                        this.btnApprove.rightIcon.visible = false;
                    },
                    onPaying: async (receipt) => {
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
                    onPaid: async (receipt) => {
                        this.btnSubmit.rightIcon.visible = false;
                    },
                    onPayingError: async (err) => {
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
                    this._entryContract = (0, index_7.getProxyAddress)();
                }
                this.approvalModelAction.setSpenderAddress(this._entryContract);
            }
        }
        updateSubmitButton(submitting) {
            this.btnSubmit.rightIcon.spin = submitting;
            this.btnSubmit.rightIcon.visible = submitting;
        }
        onApprove() {
            this.mdAlert.message = {
                status: 'warning',
                content: 'Approving'
            };
            this.mdAlert.showModal();
            this.approvalModelAction.doApproveAction(this.gemInfo.baseToken, eth_wallet_7.Utils.toDecimals(this.edtAmount.value, this.gemInfo.baseToken.decimals).toFixed());
        }
        async onQtyChanged() {
            const qty = Number(this.edtGemQty.value);
            const backerCoinAmount = this.getBackerCoinAmount(qty);
            const commissionFee = (0, index_7.getEmbedderCommissionFee)();
            this.edtAmount.value = new eth_wallet_7.BigNumber(qty).times(commissionFee).plus(qty).toFixed();
            const feeValue = this.isBuy ? eth_wallet_7.Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : eth_wallet_7.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
            const totalGemTokens = new eth_wallet_7.BigNumber(qty).minus(new eth_wallet_7.BigNumber(qty).times(feeValue)).toFixed();
            this.lbYouWillGet.caption = `${totalGemTokens} ${this.gemInfo.name}`;
            this.btnApprove.enabled = new eth_wallet_7.BigNumber(this.edtGemQty.value).gt(0);
            if (this.approvalModelAction && (0, index_7.isWalletConnected)())
                this.approvalModelAction.checkAllowance(this.gemInfo.baseToken, eth_wallet_7.Utils.toDecimals(backerCoinAmount, this.gemInfo.baseToken.decimals).toFixed());
        }
        async onAmountChanged() {
            const gemAmount = Number(this.edtAmount.value);
            this.backerTokenBalanceLb.caption = this.getBackerCoinAmount(gemAmount).toFixed(2);
            const balance = await this.getBalance();
            this.btnSubmit.enabled = balance.gt(0) && new eth_wallet_7.BigNumber(this.edtAmount.value).gt(0) && new eth_wallet_7.BigNumber(this.edtAmount.value).isLessThanOrEqualTo(balance);
        }
        getBackerCoinAmount(gemAmount) {
            const redemptionFee = eth_wallet_7.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
            const price = eth_wallet_7.Utils.fromDecimals(this.gemInfo.price).toFixed();
            return gemAmount / Number(price) - (gemAmount / Number(price) * Number(redemptionFee));
        }
        // private getGemAmount(backerCoinAmount: number) {
        //   const mintingFee = Utils.fromDecimals(this.gemInfo.mintingFee).toFixed();
        //   const price = Utils.fromDecimals(this.gemInfo.price).toFixed();
        //   return (backerCoinAmount - (backerCoinAmount * Number(mintingFee))) * Number(price);
        // }
        async getBalance(token) {
            let balance = new eth_wallet_7.BigNumber(0);
            const tokenData = token || this.gemInfo.baseToken;
            if (this.isBuy && tokenData) {
                balance = await (0, index_6.getTokenBalance)(tokenData);
            }
            else if (!this.isBuy && this.contract) {
                balance = await (0, API_1.getGemBalance)(this.contract);
                balance = eth_wallet_7.Utils.fromDecimals(balance);
            }
            return balance;
        }
        async doSubmitAction() {
            if (!this._data || !this.contract)
                return;
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
            }
            else {
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
        async onSubmit() {
            if (this.isBuy) {
                this.mdAlert.message = {
                    status: 'warning',
                    content: 'Confirming'
                };
                this.mdAlert.showModal();
                this.approvalModelAction.doPayAction();
            }
            else {
                this.doSubmitAction();
            }
        }
        async onSetMaxBalance() {
            this.edtAmount.value = (await this.getBalance()).toFixed(2);
            await this.onAmountChanged();
        }
        async renderTokenInput() {
            if (!this.edtAmount.isConnected)
                await this.edtAmount.ready();
            this.edtAmount.readOnly = this.isBuy || !this.contract;
            this.edtAmount.value = "";
            if (this.isBuy) {
                this.tokenElm.token = this.gemInfo.baseToken;
                this.tokenElm.visible = true;
                this.tokenElm.readonly = !!this.contract;
                this.gemLogoStack.visible = false;
                this.maxStack.visible = false;
                this.gridTokenInput.templateColumns = ['60%', 'auto'];
            }
            else {
                this.tokenElm.visible = false;
                if (!this.gemLogoStack.isConnected)
                    await this.gemLogoStack.ready();
                this.gemLogoStack.visible = true;
                this.gemLogoStack.clearInnerHTML();
                this.gemLogoStack.append(this.$render("i-image", { url: this._data.logo, class: index_css_2.imageStyle, width: 30, height: 30, fallbackUrl: assets_1.default.fullPath('img/gem-logo.png') }));
                if (!this.maxStack.isConnected)
                    await this.maxStack.ready();
                this.maxStack.visible = !!this.contract;
                if (!this.gridTokenInput.isConnected)
                    await this.gridTokenInput.ready();
                this.gridTokenInput.templateColumns = ['50px', 'auto', '100px'];
            }
        }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer" },
                this.$render("i-panel", { background: { color: Theme.background.main } },
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay", visible: false },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", width: 24, height: 24, name: "spinner", fill: "#FD4A4C" }),
                                this.$render("i-label", { caption: "Deploying...", font: { color: '#FD4A4C', size: '1.2em' }, class: "i-loading-spinner_text" }))),
                        this.$render("i-grid-layout", { id: 'gridDApp', width: '100%', height: '100%', templateColumns: ['repeat(2, 1fr)'], padding: { bottom: '1.563rem' } },
                            this.$render("i-vstack", { id: "pnlDescription", padding: { top: '0.5rem', bottom: '0.5rem', left: '5.25rem', right: '6.313rem' }, gap: "0.813rem" },
                                this.$render("i-hstack", null,
                                    this.$render("i-image", { id: 'imgLogo', class: index_css_2.imageStyle, height: 100 })),
                                this.$render("i-label", { id: "lblTitle", font: { bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' } }),
                                this.$render("i-markdown", { id: 'markdownViewer', class: index_css_2.markdownStyle, width: '100%', height: '100%', font: { size: '1rem' } })),
                            this.$render("i-vstack", { gap: "0.5rem", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, verticalAlignment: 'space-between' },
                                this.$render("i-vstack", { horizontalAlignment: 'center', id: "pnlLogoTitle", gap: '0.5rem' },
                                    this.$render("i-image", { id: 'imgLogo2', class: index_css_2.imageStyle, height: 100 }),
                                    this.$render("i-label", { id: "lblTitle2", font: { bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' } })),
                                this.$render("i-label", { id: "lbPrice", caption: "Price", font: { size: '1rem' }, opacity: 0.6 }),
                                this.$render("i-hstack", { id: "hStackTokens", gap: "4px", class: index_css_2.centerStyle, margin: { bottom: '1rem' } },
                                    this.$render("i-label", { id: "fromTokenLb", font: { bold: true, size: '1.5rem' } }),
                                    this.$render("i-label", { caption: "=", font: { bold: true, size: '1.5rem' } }),
                                    this.$render("i-label", { id: "toTokenLb", font: { bold: true, size: '1.5rem' } })),
                                this.$render("i-vstack", { gap: "0.5rem", id: 'pnlInputFields' },
                                    this.$render("i-grid-layout", { id: "balanceLayout", gap: { column: '0.5rem', row: '0.25rem' } },
                                        this.$render("i-hstack", { id: 'pnlQty', horizontalAlignment: 'end', verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'qty' } },
                                            this.$render("i-label", { caption: 'Qty', font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                            this.$render("i-input", { id: 'edtGemQty', value: 1, onChanged: this.onQtyChanged.bind(this), class: index_css_2.inputStyle, inputType: 'number', font: { size: '1rem', bold: true }, border: { radius: 4, style: 'solid', width: '1px', color: Theme.divider } })),
                                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'balance' } },
                                            this.$render("i-hstack", { verticalAlignment: 'center', gap: "0.5rem" },
                                                this.$render("i-label", { id: "lbOrderTotalTitle", caption: 'Total', font: { size: '1rem' } }),
                                                this.$render("i-icon", { id: "iconOrderTotal", name: "question-circle", fill: Theme.background.modal, width: 20, height: 20 })),
                                            this.$render("i-hstack", { verticalAlignment: 'center', gap: "0.5rem" },
                                                this.$render("i-label", { caption: 'Balance:', font: { size: '1rem' }, opacity: 0.6 }),
                                                this.$render("i-label", { id: 'lblBalance', font: { size: '1rem' }, opacity: 0.6 }))),
                                        this.$render("i-grid-layout", { id: 'gridTokenInput', verticalAlignment: "center", templateColumns: ['60%', 'auto'], border: { radius: 16 }, overflow: "hidden", background: { color: Theme.input.background }, font: { color: Theme.input.fontColor }, height: 56, width: "50%", margin: { left: 'auto', right: 'auto', top: '1rem' }, grid: { area: 'tokenInput' } },
                                            this.$render("i-panel", { id: "gemLogoStack", padding: { left: 10 }, visible: false }),
                                            this.$render("i-scom-gem-token-selection", { id: "tokenElm", class: index_css_2.tokenSelectionStyle, width: "100%" }),
                                            this.$render("i-input", { id: "edtAmount", width: '100%', height: '100%', minHeight: 40, border: { style: 'none' }, class: index_css_2.inputStyle, inputType: 'number', font: { size: '1.25rem' }, opacity: 0.3, onChanged: this.onAmountChanged.bind(this) }),
                                            this.$render("i-hstack", { id: "maxStack", horizontalAlignment: "end", visible: false },
                                                this.$render("i-button", { caption: "Max", padding: { top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }, margin: { right: 10 }, font: { size: '0.875rem', color: Theme.colors.primary.contrastText }, onClick: () => this.onSetMaxBalance() }))),
                                        this.$render("i-hstack", { id: "backerStack", horizontalAlignment: "space-between", verticalAlignment: "center", grid: { area: 'redeem' }, margin: { top: '1rem', bottom: '1rem' }, maxWidth: "50%", visible: false },
                                            this.$render("i-label", { caption: 'You get:', font: { size: '1rem' } }),
                                            this.$render("i-image", { id: "backerTokenImg", width: 20, height: 20, fallbackUrl: scom_token_list_3.assets.tokenPath() }),
                                            this.$render("i-label", { id: "backerTokenBalanceLb", caption: '0.00', font: { size: '1rem' } }))),
                                    this.$render("i-vstack", { horizontalAlignment: "center", verticalAlignment: 'center', gap: "8px", width: "50%", margin: { left: 'auto', right: 'auto', bottom: '1.313rem' } },
                                        this.$render("i-button", { id: "btnApprove", minWidth: '100%', caption: "Approve", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, visible: false, onClick: this.onApprove.bind(this) }),
                                        this.$render("i-button", { id: 'btnSubmit', width: '100%', caption: 'Submit', padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, background: { color: Theme.colors.primary.main }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, onClick: this.onSubmit.bind(this), enabled: false })),
                                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", gap: "0.5rem" },
                                        this.$render("i-hstack", { horizontalAlignment: "end", verticalAlignment: "center", gap: 4 },
                                            this.$render("i-label", { caption: "Transaction Fee", font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                            this.$render("i-icon", { id: "feeTooltip", name: "question-circle", fill: Theme.text.primary, width: 14, height: 14 })),
                                        this.$render("i-label", { id: "feeLb", font: { size: '1rem', bold: true }, opacity: 0.6, caption: "0" })),
                                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", gap: "0.5rem" },
                                        this.$render("i-label", { caption: "You will get", font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                        this.$render("i-label", { id: "lbYouWillGet", font: { size: '1rem', bold: true }, opacity: 0.6, caption: "0" }))),
                                this.$render("i-vstack", { id: 'pnlUnsupportedNetwork', visible: false, horizontalAlignment: 'center' },
                                    this.$render("i-label", { caption: 'This network is not supported.', font: { size: '1.5rem' } }))))),
                    this.$render("i-scom-gem-token-alert", { id: 'mdAlert' }))));
        }
    };
    ScomGemToken = __decorate([
        (0, components_7.customElements)('i-scom-gem-token')
    ], ScomGemToken);
    exports.default = ScomGemToken;
});
