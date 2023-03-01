var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@pageblock-gem-token/main/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.centerStyle = exports.tokenSelectionStyle = exports.inputStyle = exports.markdownStyle = exports.imageStyle = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    exports.imageStyle = components_1.Styles.style({
        $nest: {
            '&>img': {
                maxWidth: 'unset',
                maxHeight: 'unset',
                borderRadius: 4
            }
        }
    });
    exports.markdownStyle = components_1.Styles.style({
        overflowWrap: 'break-word'
    });
    exports.inputStyle = components_1.Styles.style({
        $nest: {
            '> input': {
                background: Theme.input.background,
                color: Theme.input.fontColor,
                border: 0,
                padding: '0.25rem 0.5rem',
                textAlign: 'right'
            }
        }
    });
    exports.tokenSelectionStyle = components_1.Styles.style({
        $nest: {
            'i-button.token-button': {
                justifyContent: 'start'
            }
        }
    });
    exports.centerStyle = components_1.Styles.style({
        textAlign: 'center'
    });
});
define("@pageblock-gem-token/main/API.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/gem-token-contract", "@pageblock-gem-token/utils"], function (require, exports, eth_wallet_1, gem_token_contract_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGemBalance = exports.redeemToken = exports.buyToken = exports.transfer = exports.getFee = exports.deployContract = void 0;
    async function getFee(contractAddress, type) {
        const wallet = eth_wallet_1.Wallet.getInstance();
        const contract = new gem_token_contract_1.Contracts.GEM(wallet, contractAddress);
        const fee = type === 'buy' ? await contract.mintingFee() : await contract.redemptionFee();
        const decimals = (await contract.decimals()).toNumber();
        return eth_wallet_1.Utils.fromDecimals(fee, decimals);
    }
    exports.getFee = getFee;
    async function getGemBalance(contractAddress) {
        const wallet = eth_wallet_1.Wallet.getInstance();
        const contract = new gem_token_contract_1.Contracts.GEM(wallet, contractAddress);
        const balance = await contract.balanceOf(wallet.address);
        return balance;
    }
    exports.getGemBalance = getGemBalance;
    async function deployContract(options, token, callback, confirmationCallback) {
        const wallet = eth_wallet_1.Wallet.getInstance();
        utils_1.registerSendTxEvents({
            transactionHash: callback,
            confirmation: confirmationCallback
        });
        const gem = new gem_token_contract_1.Contracts.GEM(wallet);
        const receipt = await gem.deploy({
            name: options.name,
            symbol: options.symbol,
            cap: eth_wallet_1.Utils.toDecimals(options.cap).dp(0),
            mintingFee: eth_wallet_1.Utils.toDecimals(options.mintingFee).dp(0),
            redemptionFee: eth_wallet_1.Utils.toDecimals(options.redemptionFee).dp(0),
            price: eth_wallet_1.Utils.toDecimals(options.price).dp(0),
            baseToken: (token === null || token === void 0 ? void 0 : token.address) || ""
        });
        return gem.address;
    }
    exports.deployContract = deployContract;
    async function transfer(contractAddress, to, amount) {
        const wallet = eth_wallet_1.Wallet.getInstance();
        const contract = new gem_token_contract_1.Contracts.GEM(wallet, contractAddress);
        const receipt = await contract.transfer({
            to,
            amount: new eth_wallet_1.BigNumber(amount)
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
    async function buyToken(address, backerCoinAmount, callback, confirmationCallback) {
        try {
            utils_1.registerSendTxEvents({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_1.Wallet.getInstance();
            const contract = new gem_token_contract_1.Contracts.GEM(wallet, address);
            const receipt = await contract.buy(eth_wallet_1.Utils.toDecimals(backerCoinAmount).dp(0));
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
            utils_1.registerSendTxEvents({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_1.Wallet.getInstance();
            const contract = new gem_token_contract_1.Contracts.GEM(wallet, address);
            const receipt = await contract.redeem(eth_wallet_1.Utils.toDecimals(gemAmount).dp(0));
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
define("@pageblock-gem-token/main", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@pageblock-gem-token/utils", "@pageblock-gem-token/store", "@pageblock-gem-token/wallet", "@pageblock-gem-token/main/index.css.ts", "@pageblock-gem-token/assets", "@pageblock-gem-token/main/API.ts"], function (require, exports, components_2, eth_wallet_2, utils_2, store_1, wallet_1, index_css_1, assets_1, API_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    const buyTooltip = 'The fee the project owner will receive for token minting';
    const redeemTooltip = 'The spread the project owner will receive for redemptions';
    let Main = class Main extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this._oldData = {};
            this._data = {
                name: '',
                symbol: '',
                cap: '',
                redemptionFee: '',
                price: '',
                mintingFee: ''
            };
            this.isApproving = false;
            this.defaultEdit = true;
            this.onWalletConnect = async (connected) => {
                let chainId = wallet_1.getChainId();
                if (connected && !chainId) {
                    this.onSetupPage(true);
                }
                else {
                    this.onSetupPage(connected);
                }
                if (connected)
                    await this.updateTokenBalance();
            };
            this.onChainChanged = async () => {
                this.onSetupPage(true);
                await this.updateTokenBalance();
                if (this.tokenElm)
                    this.tokenElm.token = undefined;
            };
            this.updateTokenBalance = async () => {
                if (!this._data.token)
                    return;
                let chainId = wallet_1.getChainId();
                const _tokenList = store_1.getTokenList(chainId);
                const token = _tokenList.find(t => { var _a; return (t.address && t.address == ((_a = this._data.token) === null || _a === void 0 ? void 0 : _a.address)) || (t.symbol == this.tokenSymbol); });
                const symbol = (token === null || token === void 0 ? void 0 : token.symbol) || '';
                this.lblBalance.caption = `${(await this.getBalance(token)).toFixed(2)} ${symbol}`;
            };
            this.onDeploy = async (callback, confirmationCallback) => {
                if (this._contract || !this._data.name)
                    return;
                const params = {
                    name: this._data.name,
                    symbol: this._data.symbol,
                    cap: this._data.cap,
                    price: this._data.price,
                    mintingFee: this._data.mintingFee,
                    redemptionFee: this._data.redemptionFee
                };
                const result = await API_1.deployContract(params, this._data.token, callback, confirmationCallback);
                this._contract = result;
                this._data.contract = this._contract;
            };
            this.onBuyToken = async (quantity) => {
                this.mdAlert.closeModal();
                if (!this._data.name)
                    return;
                const callback = (error, receipt) => {
                    if (error) {
                        this.mdAlert.message = {
                            status: 'error',
                            content: utils_2.parseContractError(error)
                        };
                        this.mdAlert.showModal();
                    }
                };
                await API_1.buyToken(this._contract, quantity, callback, async (result) => {
                    console.log('buyToken: ', result);
                    this.edtGemQty.value = '';
                    this.edtAmount.value = '';
                    this.btnSubmit.enabled = false;
                    await this.updateTokenBalance();
                });
            };
            this.onRedeemToken = async () => {
                this.mdAlert.closeModal();
                if (!this._data.name)
                    return;
                const callback = (error, receipt) => {
                    if (error) {
                        this.mdAlert.message = {
                            status: 'error',
                            content: utils_2.parseContractError(error)
                        };
                        this.mdAlert.showModal();
                    }
                };
                const gemAmount = this.edtAmount.value;
                await API_1.redeemToken(this._contract, gemAmount, callback, async (result) => {
                    console.log('redeemToken: ', result);
                    this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
                    this.edtAmount.value = '';
                    this.backerTokenBalanceLb.caption = '0.00';
                });
            };
            if (options) {
                store_1.setDataFromSCConfig(options);
            }
            this.$eventBus = components_2.application.EventBus;
            this.registerEvent();
        }
        registerEvent() {
            this.$eventBus.register(this, "isWalletConnected" /* IsWalletConnected */, () => this.onWalletConnect(true));
            this.$eventBus.register(this, "IsWalletDisconnected" /* IsWalletDisconnected */, () => this.onWalletConnect(false));
            this.$eventBus.register(this, "chainChanged" /* chainChanged */, this.onChainChanged);
        }
        get isBuy() {
            return this._data.dappType === 'buy';
        }
        get tokenSymbol() {
            var _a, _b;
            return ((_b = (_a = this._data) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.symbol) || '';
        }
        async onSetupPage(isWalletConnected) {
            if (isWalletConnected)
                await this.initApprovalAction();
        }
        getActions() {
            const actions = [
                {
                    name: 'Settings',
                    icon: 'cog',
                    command: (builder, userInputData) => {
                        return {
                            execute: async () => {
                                this._oldData = this._data;
                                if (userInputData.name != undefined)
                                    this._data.name = userInputData.name;
                                if (userInputData.symbol != undefined)
                                    this._data.symbol = userInputData.symbol;
                                if (userInputData.dappType != undefined)
                                    this._data.dappType = userInputData.dappType;
                                if (userInputData.logo != undefined)
                                    this._data.logo = userInputData.logo;
                                if (userInputData.description != undefined)
                                    this._data.description = userInputData.description;
                                if (userInputData.cap != undefined)
                                    this._data.cap = userInputData.cap;
                                if (userInputData.chainId != undefined)
                                    this._data.chainId = userInputData.chainId;
                                if (userInputData.price != undefined)
                                    this._data.price = userInputData.price;
                                if (userInputData.redemptionFee != undefined)
                                    this._data.redemptionFee = userInputData.redemptionFee;
                                if (userInputData.mintingFee != undefined)
                                    this._data.mintingFee = userInputData.mintingFee;
                                if (userInputData.token != undefined)
                                    this._data.token = userInputData.token;
                                if (userInputData.contract != undefined)
                                    this._data.contract = userInputData.contract;
                                this.configDApp.data = this._data;
                                this._contract = this._data.contract;
                                await this.initApprovalAction();
                                this.refreshDApp();
                            },
                            undo: async () => {
                                this._data = this._oldData;
                                this.configDApp.data = this._data;
                                this._contract = this.configDApp.data.contract;
                                await this.initApprovalAction();
                                this.refreshDApp();
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: {
                        type: 'object',
                        properties: {
                            "contract": {
                                type: 'string'
                            },
                            "description": {
                                type: 'string'
                            }
                        }
                    }
                },
                {
                    name: 'Theme Settings',
                    icon: 'palette',
                    command: (builder, userInputData) => {
                        return {
                            execute: async () => {
                                if (userInputData) {
                                    this.oldTag = this.tag;
                                    this.setTag(userInputData);
                                    if (builder)
                                        builder.setTag(userInputData);
                                }
                            },
                            undo: () => {
                                if (userInputData) {
                                    this.setTag(this.oldTag);
                                    if (builder)
                                        builder.setTag(this.oldTag);
                                }
                            },
                            redo: () => { }
                        };
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
            ];
            return actions;
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            this._contract = data.contract;
            this.configDApp.data = data;
            await this.initApprovalAction();
            this.refreshDApp();
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.tag = value;
            this.updateTheme();
        }
        updateTheme() {
            var _a, _b, _c, _d, _e;
            if ((_a = this.tag) === null || _a === void 0 ? void 0 : _a.fontColor)
                this.style.setProperty('--text-primary', this.tag.fontColor);
            if ((_b = this.tag) === null || _b === void 0 ? void 0 : _b.backgroundColor)
                this.style.setProperty('--background-main', this.tag.backgroundColor);
            if ((_c = this.tag) === null || _c === void 0 ? void 0 : _c.inputFontColor)
                this.style.setProperty('--input-font_color', this.tag.inputFontColor);
            if ((_d = this.tag) === null || _d === void 0 ? void 0 : _d.inputBackgroundColor)
                this.style.setProperty('--input-background', this.tag.inputBackgroundColor);
            if ((_e = this.tag) === null || _e === void 0 ? void 0 : _e.buttonBackgroundColor)
                this.style.setProperty('--colors-primary-main', this.tag.buttonBackgroundColor);
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
            return new Promise(async (resolve, reject) => {
                await this.preview();
                try {
                    if (this.loadingElm)
                        this.loadingElm.visible = true;
                    await this.onDeploy((error, receipt) => {
                        if (error) {
                            this.mdAlert.message = {
                                status: 'error',
                                content: utils_2.parseContractError(error)
                            };
                            this.mdAlert.showModal();
                            reject(error);
                        }
                    }, (receipt) => {
                        this._contract = receipt.contractAddress;
                        this._data.contract = this._contract;
                        this.initApprovalAction();
                        this.refreshDApp();
                    });
                }
                catch (error) {
                    this.mdAlert.message = {
                        status: 'error',
                        content: utils_2.parseContractError(error)
                    };
                    this.mdAlert.showModal();
                    reject(error);
                }
                if (!this._contract && !this._data)
                    reject(new Error('Data missing'));
                resolve();
                if (this.loadingElm)
                    this.loadingElm.visible = false;
            });
        }
        async discard() {
            this.gridDApp.visible = true;
            this.configDApp.visible = false;
        }
        async config() { }
        validate() {
            const data = this.configDApp.data;
            if (!data ||
                !data.token ||
                !data.name ||
                !data.symbol ||
                data.cap === undefined ||
                data.cap === null ||
                data.mintingFee === undefined ||
                data.mintingFee === null ||
                data.redemptionFee === undefined ||
                data.redemptionFee === null ||
                !data.price) {
                this.mdAlert.message = {
                    status: 'error',
                    content: 'Required field is missing.'
                };
                this.mdAlert.showModal();
                return false;
            }
            return true;
        }
        async refreshDApp() {
            this._type = this._data.dappType;
            this.renderTokenInput();
            this.imgLogo.url = this._data.logo || assets_1.default.fullPath('img/gem-logo.svg');
            const buyDesc = `Use ${this._data.name || ''} for services on Secure Compute, decentralized hosting, audits, sub-domains and more. Full backed, Redeemable and transparent at all times!`;
            const redeemDesc = `Redeem your ${this._data.name || ''} Tokens for the underlying token.`;
            const description = this._data.description || (this.isBuy ? buyDesc : redeemDesc);
            this.markdownViewer.load(description);
            this.fromTokenLb.caption = `1 ${this._data.name || ''}`;
            this.toTokenLb.caption = `1 ${this.tokenSymbol}`;
            this.lblTitle.caption = `${this.isBuy ? 'Buy' : 'Redeem'} ${this._data.name || ''} - GEM Tokens`;
            this.backerStack.visible = !this.isBuy;
            this.balanceLayout.templateAreas = [['qty'], ['balance'], ['tokenInput'], ['redeem']];
            this.pnlQty.visible = this.isBuy;
            this.edtGemQty.readOnly = !this._contract;
            this.edtGemQty.value = "";
            if (!this.isBuy) {
                this.btnSubmit.enabled = false;
                this.btnApprove.visible = false;
                this.backerTokenImg.url = assets_1.default.tokenPath(this._data.token, wallet_1.getChainId());
                this.backerTokenBalanceLb.caption = '0.00';
            }
            const feeValue = this.isBuy ? this._data.mintingFee : this._data.redemptionFee;
            this.feeLb.caption = `${feeValue || ''} ${this.tokenSymbol}`;
            this.feeTooltip.tooltip.content = this.isBuy ? buyTooltip : redeemTooltip;
            this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
        }
        async init() {
            super.init();
            await this.initWalletData();
            await this.onSetupPage(wallet_1.isWalletConnected());
            this.setTag({
                fontColor: '#000000',
                inputFontColor: '#ffffff',
                inputBackgroundColor: '#333333',
                buttonBackgroundColor: '#FE6502'
            });
        }
        async initWalletData() {
            const selectedProvider = localStorage.getItem('walletProvider');
            const isValidProvider = Object.values(eth_wallet_2.WalletPlugin).includes(selectedProvider);
            if (wallet_1.hasWallet() && isValidProvider) {
                await wallet_1.connectWallet(selectedProvider);
            }
        }
        async initApprovalAction() {
            if (!this.approvalModelAction && wallet_1.isWalletConnected() && this._contract) {
                this.approvalModelAction = utils_2.getERC20ApprovalModelAction(this._contract, {
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
                        this.btnApprove.enabled = new eth_wallet_2.BigNumber(this.edtGemQty.value).gt(0);
                        this.isApproving = false;
                    },
                    onToBePaid: async (token) => {
                        this.btnApprove.visible = false;
                        this.isApproving = false;
                        this.btnSubmit.enabled = new eth_wallet_2.BigNumber(this.edtAmount.value).gt(0);
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
        async selectToken(token) {
            this._data.token = token;
            this.backerTokenImg.url = assets_1.default.tokenPath(this._data.token, wallet_1.getChainId());
            this.toTokenLb.caption = `1 ${this.tokenSymbol}`;
            this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
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
            this.approvalModelAction.doApproveAction(this._data.token, this.edtAmount.value);
        }
        async onQtyChanged() {
            const qty = Number(this.edtGemQty.value);
            const backerCoinAmount = this.getBackerCoinAmount(qty);
            this.edtAmount.value = backerCoinAmount;
            this.btnApprove.enabled = new eth_wallet_2.BigNumber(this.edtGemQty.value).gt(0);
            if (this.approvalModelAction)
                this.approvalModelAction.checkAllowance(this._data.token, this.edtAmount.value);
        }
        async onAmountChanged() {
            const gemAmount = Number(this.edtAmount.value);
            this.backerTokenBalanceLb.caption = this.getBackerCoinAmount(gemAmount).toFixed(2);
            const balance = await this.getBalance();
            this.btnSubmit.enabled = balance.gt(0) && new eth_wallet_2.BigNumber(this.edtAmount.value).gt(0) && new eth_wallet_2.BigNumber(this.edtAmount.value).isLessThanOrEqualTo(balance);
        }
        getBackerCoinAmount(gemAmount) {
            return gemAmount / Number(this._data.price) - (gemAmount / Number(this._data.price) * Number(this._data.redemptionFee));
        }
        getGemAmount(backerCoinAmount) {
            return (backerCoinAmount - (backerCoinAmount * Number(this._data.mintingFee))) * Number(this._data.price);
        }
        async getBalance(token) {
            let balance = new eth_wallet_2.BigNumber(0);
            const tokenData = token || this._data.token;
            if (this.isBuy && tokenData) {
                balance = await utils_2.getTokenBalance(tokenData);
            }
            else if (!this.isBuy && this._contract) {
                balance = await API_1.getGemBalance(this._contract);
                balance = eth_wallet_2.Utils.fromDecimals(balance);
            }
            return balance;
        }
        async doSubmitAction() {
            if (!this._data || !this._contract)
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
        renderTokenInput() {
            this.edtAmount.readOnly = this.isBuy || !this._contract;
            this.edtAmount.value = "";
            if (this.isBuy) {
                this.tokenElm.token = this._data.token;
                this.tokenElm.visible = true;
                this.tokenElm.readonly = !!this._contract;
                this.gemLogoStack.visible = false;
                this.maxStack.visible = false;
                this.gridTokenInput.templateColumns = ['60%', 'auto'];
            }
            else {
                this.tokenElm.visible = false;
                this.gemLogoStack.visible = true;
                this.gemLogoStack.clearInnerHTML();
                this.gemLogoStack.append(this.$render("i-image", { url: this._data.logo, class: index_css_1.imageStyle, width: 30, height: 30, fallbackUrl: assets_1.default.fullPath('img/gem-logo.svg') }));
                this.maxStack.visible = !!this._contract;
                this.gridTokenInput.templateColumns = ['50px', 'auto', '100px'];
            }
        }
        render() {
            return (this.$render("i-panel", { background: { color: Theme.background.main } },
                this.$render("i-panel", null,
                    this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay", visible: false },
                        this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                            this.$render("i-icon", { class: "i-loading-spinner_icon", width: 24, height: 24, name: "spinner", fill: "#FD4A4C" }),
                            this.$render("i-label", { caption: "Deploying...", font: { color: '#FD4A4C', size: '1.2em' }, class: "i-loading-spinner_text" }))),
                    this.$render("i-grid-layout", { id: 'gridDApp', width: '100%', height: '100%', templateColumns: ['repeat(2, 1fr)'], padding: { bottom: '1.563rem' } },
                        this.$render("i-vstack", { padding: { top: '0.5rem', bottom: '0.5rem', left: '5.25rem', right: '6.313rem' }, gap: "0.813rem" },
                            this.$render("i-hstack", null,
                                this.$render("i-image", { id: 'imgLogo', class: index_css_1.imageStyle, height: 100 })),
                            this.$render("i-label", { id: "lblTitle", font: { bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' } }),
                            this.$render("i-markdown", { id: 'markdownViewer', class: index_css_1.markdownStyle, width: '100%', height: '100%', font: { size: '1rem' } })),
                        this.$render("i-vstack", { gap: "0.5rem", padding: { top: '3.375rem', bottom: '0.5rem', left: '0.5rem', right: '5.25rem' }, verticalAlignment: 'space-between' },
                            this.$render("i-label", { caption: "Price", font: { size: '1rem' }, opacity: 0.6 }),
                            this.$render("i-hstack", { gap: "4px", class: index_css_1.centerStyle, margin: { bottom: '1rem' } },
                                this.$render("i-label", { id: "fromTokenLb", font: { bold: true, size: '1.5rem' } }),
                                this.$render("i-label", { caption: "=", font: { bold: true, size: '1.5rem' } }),
                                this.$render("i-label", { id: "toTokenLb", font: { bold: true, size: '1.5rem' } })),
                            this.$render("i-vstack", { gap: "0.5rem" },
                                this.$render("i-grid-layout", { id: "balanceLayout", gap: { column: '0.5rem', row: '0.25rem' } },
                                    this.$render("i-hstack", { id: 'pnlQty', visible: false, horizontalAlignment: 'end', verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'qty' } },
                                        this.$render("i-label", { caption: 'Qty', font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                        this.$render("i-input", { id: 'edtGemQty', value: 1, onChanged: this.onQtyChanged.bind(this), class: index_css_1.inputStyle, inputType: 'number', font: { size: '1rem', bold: true }, border: { radius: 4 } })),
                                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'balance' } },
                                        this.$render("i-label", { caption: 'Your donation', font: { size: '1rem' } }),
                                        this.$render("i-hstack", { verticalAlignment: 'center', gap: "0.5rem" },
                                            this.$render("i-label", { caption: 'Balance:', font: { size: '1rem' }, opacity: 0.6 }),
                                            this.$render("i-label", { id: 'lblBalance', font: { size: '1rem' }, opacity: 0.6 }))),
                                    this.$render("i-grid-layout", { id: 'gridTokenInput', verticalAlignment: "center", templateColumns: ['60%', 'auto'], border: { radius: 16 }, overflow: "hidden", background: { color: Theme.input.background }, font: { color: Theme.input.fontColor }, height: 56, width: "100%", grid: { area: 'tokenInput' } },
                                        this.$render("i-panel", { id: "gemLogoStack", padding: { left: 10 }, visible: false }),
                                        this.$render("gem-token-selection", { id: "tokenElm", class: index_css_1.tokenSelectionStyle, width: "100%", onSelectToken: this.selectToken.bind(this) }),
                                        this.$render("i-input", { id: "edtAmount", width: '100%', height: '100%', minHeight: 40, class: index_css_1.inputStyle, inputType: 'number', font: { size: '1.25rem' }, opacity: 0.3, onChanged: this.onAmountChanged.bind(this) }),
                                        this.$render("i-hstack", { id: "maxStack", horizontalAlignment: "end", visible: false },
                                            this.$render("i-button", { caption: "Max", padding: { top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }, margin: { right: 10 }, font: { size: '0.875rem', color: Theme.colors.primary.contrastText }, onClick: () => this.onSetMaxBalance() }))),
                                    this.$render("i-hstack", { id: "backerStack", horizontalAlignment: "space-between", verticalAlignment: "center", grid: { area: 'redeem' }, margin: { top: '1rem', bottom: '1rem' }, maxWidth: "50%", visible: false },
                                        this.$render("i-label", { caption: 'You get:', font: { size: '1rem' } }),
                                        this.$render("i-image", { id: "backerTokenImg", width: 20, height: 20, fallbackUrl: assets_1.default.tokenPath() }),
                                        this.$render("i-label", { id: "backerTokenBalanceLb", caption: '0.00', font: { size: '1rem' } }))),
                                this.$render("i-vstack", { horizontalAlignment: "center", verticalAlignment: 'center', gap: "8px", margin: { bottom: '1.313rem' } },
                                    this.$render("i-button", { id: "btnApprove", minWidth: '100%', caption: "Approve", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, visible: false, onClick: this.onApprove.bind(this) }),
                                    this.$render("i-button", { id: 'btnSubmit', minWidth: '100%', caption: 'Submit', padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, background: { color: Theme.colors.primary.main }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, onClick: this.onSubmit.bind(this), enabled: false })),
                                this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", gap: "0.5rem" },
                                    this.$render("i-hstack", { horizontalAlignment: "end", verticalAlignment: "center", gap: 4 },
                                        this.$render("i-label", { caption: "Transaction Fee", font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                        this.$render("i-icon", { id: "feeTooltip", name: "question-circle", fill: Theme.text.primary, width: 14, height: 14 })),
                                    this.$render("i-label", { id: "feeLb", font: { size: '1rem', bold: true }, opacity: 0.6, caption: "0" })))))),
                this.$render("gem-token-config", { id: 'configDApp', visible: false }),
                this.$render("gem-token-alert", { id: 'mdAlert' })));
        }
    };
    Main = __decorate([
        components_2.customModule
    ], Main);
    exports.default = Main;
});
