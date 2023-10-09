var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
define("@scom/scom-gem-token/interface.tsx", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-gem-token/store/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list"], function (require, exports, components_1, eth_wallet_1, scom_network_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isClientWalletConnected = exports.State = void 0;
    class State {
        constructor(options) {
            this.networkMap = {};
            this.proxyAddresses = {};
            this.ipfsGatewayUrl = '';
            this.embedderCommissionFee = '0';
            this.rpcWalletId = '';
            this.initData(options);
        }
        initData(options) {
            if (options.networks) {
                this.setNetworkList(options.networks, options.infuraId);
            }
            if (options.ipfsGatewayUrl) {
                this.ipfsGatewayUrl = options.ipfsGatewayUrl;
            }
            if (options.proxyAddresses) {
                this.proxyAddresses = options.proxyAddresses;
            }
            if (options.embedderCommissionFee) {
                this.embedderCommissionFee = options.embedderCommissionFee;
            }
        }
        initRpcWallet(defaultChainId) {
            var _a, _b, _c;
            if (this.rpcWalletId) {
                return this.rpcWalletId;
            }
            const clientWallet = eth_wallet_1.Wallet.getClientInstance();
            const networkList = Object.values(((_a = components_1.application.store) === null || _a === void 0 ? void 0 : _a.networkMap) || []);
            const instanceId = clientWallet.initRpcWallet({
                networks: networkList,
                defaultChainId,
                infuraId: (_b = components_1.application.store) === null || _b === void 0 ? void 0 : _b.infuraId,
                multicalls: (_c = components_1.application.store) === null || _c === void 0 ? void 0 : _c.multicalls
            });
            this.rpcWalletId = instanceId;
            if (clientWallet.address) {
                const rpcWallet = eth_wallet_1.Wallet.getRpcWalletInstance(instanceId);
                rpcWallet.address = clientWallet.address;
            }
            return instanceId;
        }
        setNetworkList(networkList, infuraId) {
            const wallet = eth_wallet_1.Wallet.getClientInstance();
            this.networkMap = {};
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
                this.networkMap[network.chainId] = Object.assign(Object.assign({}, networkInfo), network);
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        getProxyAddress(chainId) {
            const _chainId = chainId || this.getChainId();
            const proxyAddresses = this.proxyAddresses;
            if (proxyAddresses) {
                return proxyAddresses[_chainId];
            }
            return null;
        }
        getRpcWallet() {
            return this.rpcWalletId ? eth_wallet_1.Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
        }
        isRpcWalletConnected() {
            const wallet = this.getRpcWallet();
            return wallet === null || wallet === void 0 ? void 0 : wallet.isConnected;
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet === null || rpcWallet === void 0 ? void 0 : rpcWallet.chainId;
        }
        async setApprovalModelAction(options) {
            const approvalOptions = Object.assign(Object.assign({}, options), { spenderAddress: '' });
            let wallet = this.getRpcWallet();
            this.approvalModel = new eth_wallet_1.ERC20ApprovalModel(wallet, approvalOptions);
            let approvalModelAction = this.approvalModel.getAction();
            return approvalModelAction;
        }
    }
    exports.State = State;
    function isClientWalletConnected() {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
});
define("@scom/scom-gem-token/utils/token.ts", ["require", "exports", "@ijstech/eth-wallet"], function (require, exports, eth_wallet_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerSendTxEvents = exports.getTokenBalance = exports.getERC20Amount = void 0;
    const getERC20Amount = async (wallet, tokenAddress, decimals) => {
        let erc20 = new eth_wallet_2.Erc20(wallet, tokenAddress, decimals);
        return await erc20.balance;
    };
    exports.getERC20Amount = getERC20Amount;
    const getTokenBalance = async (wallet, token) => {
        let balance = new eth_wallet_2.BigNumber(0);
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
        const wallet = eth_wallet_2.Wallet.getClientInstance();
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
define("@scom/scom-gem-token/utils/index.ts", ["require", "exports", "@scom/scom-gem-token-contract", "@ijstech/components", "@scom/scom-gem-token/utils/token.ts"], function (require, exports, scom_gem_token_contract_1, components_2, token_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerSendTxEvents = exports.getTokenBalance = exports.getERC20Amount = exports.getProxySelectors = exports.formatNumber = void 0;
    const formatNumber = (value, decimalFigures) => {
        if (typeof value === 'object') {
            value = value.toFixed();
        }
        const minValue = '0.0000001';
        return components_2.FormatUtils.formatNumber(value, { decimalFigures: decimalFigures || 4, minValue });
    };
    exports.formatNumber = formatNumber;
    async function getProxySelectors(state, chainId, contractAddress) {
        const wallet = state.getRpcWallet();
        await wallet.init();
        if (wallet.chainId != chainId)
            await wallet.switchNetwork(chainId);
        let contract = new scom_gem_token_contract_1.Contracts.GEM(wallet, contractAddress);
        let permittedProxyFunctions = [
            "buy",
            "redeem"
        ];
        let selectors = permittedProxyFunctions
            .map(e => e + "(" + contract._abi.filter(f => f.name == e)[0].inputs.map(f => f.type).join(',') + ")")
            .map(e => wallet.soliditySha3(e).substring(0, 10))
            .map(e => contract.address.toLowerCase() + e.replace("0x", ""));
        return selectors;
    }
    exports.getProxySelectors = getProxySelectors;
    Object.defineProperty(exports, "getERC20Amount", { enumerable: true, get: function () { return token_1.getERC20Amount; } });
    Object.defineProperty(exports, "getTokenBalance", { enumerable: true, get: function () { return token_1.getTokenBalance; } });
    Object.defineProperty(exports, "registerSendTxEvents", { enumerable: true, get: function () { return token_1.registerSendTxEvents; } });
});
define("@scom/scom-gem-token/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDir = components_3.application.currentModuleDir;
    function fullPath(path) {
        return `${moduleDir}/${path}`;
    }
    ;
    exports.default = {
        fullPath
    };
});
define("@scom/scom-gem-token/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.inputStyle = exports.markdownStyle = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    exports.markdownStyle = components_4.Styles.style({
        overflowWrap: 'break-word',
        color: Theme.text.primary
    });
    exports.inputStyle = components_4.Styles.style({
        $nest: {
            '> input': {
                textAlign: 'right'
            },
            'input[readonly]': {
                cursor: 'default'
            }
        }
    });
});
define("@scom/scom-gem-token/API.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-gem-token-contract", "@scom/scom-commission-proxy-contract", "@scom/scom-gem-token/utils/index.ts", "@scom/scom-token-list"], function (require, exports, eth_wallet_3, scom_gem_token_contract_2, scom_commission_proxy_contract_1, index_1, scom_token_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGemInfo = exports.getGemBalance = exports.redeemToken = exports.buyToken = exports.transfer = exports.getFee = exports.deployContract = void 0;
    async function getFee(state, contractAddress, type) {
        const wallet = state.getRpcWallet();
        const contract = new scom_gem_token_contract_2.Contracts.GEM(wallet, contractAddress);
        const fee = type === 'buy' ? await contract.mintingFee() : await contract.redemptionFee();
        const decimals = (await contract.decimals()).toNumber();
        return eth_wallet_3.Utils.fromDecimals(fee, decimals);
    }
    exports.getFee = getFee;
    async function getGemBalance(state, contractAddress) {
        const wallet = state.getRpcWallet();
        const contract = new scom_gem_token_contract_2.Contracts.GEM(wallet, contractAddress);
        const balance = await contract.balanceOf(wallet.address);
        return balance;
    }
    exports.getGemBalance = getGemBalance;
    async function deployContract(options, token, callback, confirmationCallback) {
        const wallet = eth_wallet_3.Wallet.getClientInstance();
        (0, index_1.registerSendTxEvents)({
            transactionHash: callback,
            confirmation: confirmationCallback
        });
        const gem = new scom_gem_token_contract_2.Contracts.GEM(wallet);
        const receipt = await gem.deploy({
            name: options.name,
            symbol: options.symbol,
            cap: eth_wallet_3.Utils.toDecimals(options.cap).dp(0),
            mintingFee: eth_wallet_3.Utils.toDecimals(options.mintingFee).dp(0),
            redemptionFee: eth_wallet_3.Utils.toDecimals(options.redemptionFee).dp(0),
            price: eth_wallet_3.Utils.toDecimals(options.price).dp(0),
            baseToken: (token === null || token === void 0 ? void 0 : token.address) || ""
        });
        return gem.address;
    }
    exports.deployContract = deployContract;
    async function transfer(contractAddress, to, amount) {
        const wallet = eth_wallet_3.Wallet.getClientInstance();
        const contract = new scom_gem_token_contract_2.Contracts.GEM(wallet, contractAddress);
        const receipt = await contract.transfer({
            to,
            amount: new eth_wallet_3.BigNumber(amount)
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
    async function getGemInfo(state, contractAddress) {
        var _a;
        const wallet = state.getRpcWallet();
        const gem = new scom_gem_token_contract_2.Contracts.GEM(wallet, contractAddress);
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
            const baseToken = (_a = scom_token_list_1.DefaultTokens[chainId]) === null || _a === void 0 ? void 0 : _a.find(t => { var _a; return ((_a = t.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == baseTokenValue.toLowerCase(); });
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
    async function buyToken(state, contractAddress, backerCoinAmount, token, commissions, callback, confirmationCallback) {
        try {
            (0, index_1.registerSendTxEvents)({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_3.Wallet.getClientInstance();
            const tokenDecimals = (token === null || token === void 0 ? void 0 : token.decimals) || 18;
            const amount = eth_wallet_3.Utils.toDecimals(backerCoinAmount, tokenDecimals).dp(0);
            const _commissions = (commissions || []).filter(v => v.chainId === state.getChainId()).map(v => {
                return {
                    to: v.walletAddress,
                    amount: amount.times(v.share)
                };
            });
            const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)) : new eth_wallet_3.BigNumber(0);
            const contract = new scom_gem_token_contract_2.Contracts.GEM(wallet, contractAddress);
            let receipt;
            if (commissionsAmount.isZero()) {
                receipt = await contract.buy(amount);
            }
            else {
                let proxyAddress = state.getProxyAddress();
                const proxy = new scom_commission_proxy_contract_1.Contracts.Proxy(wallet, proxyAddress);
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
            if (callback)
                callback(err);
            return null;
        }
    }
    exports.buyToken = buyToken;
    async function redeemToken(address, gemAmount, callback, confirmationCallback) {
        try {
            (0, index_1.registerSendTxEvents)({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_3.Wallet.getClientInstance();
            const contract = new scom_gem_token_contract_2.Contracts.GEM(wallet, address);
            const receipt = await contract.redeem(eth_wallet_3.Utils.toDecimals(gemAmount).dp(0));
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
            if (callback)
                callback(err);
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
                "explorerName": "BSCScan",
                "explorerTxUrl": "https://testnet.bscscan.com/tx/",
                "explorerAddressUrl": "https://testnet.bscscan.com/address/",
            },
            {
                "chainId": 43113,
                "explorerName": "SnowTrace",
                "explorerTxUrl": "https://testnet.snowtrace.io/tx/",
                "explorerAddressUrl": "https://testnet.snowtrace.io/address/",
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
define("@scom/scom-gem-token/formSchema.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getProjectOwnerSchema = exports.getFormSchema = void 0;
    ///<amd-module name='@scom/scom-gem-token/formSchema.json.ts'/> 
    const theme = {
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
    };
    function getFormSchema(hideDescription) {
        const dataSchema = {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    format: 'multi'
                },
                dark: {
                    type: 'object',
                    properties: theme
                },
                light: {
                    type: 'object',
                    properties: theme
                }
            }
        };
        const uiSchema = {
            type: 'Categorization',
            elements: [
                {
                    type: 'Category',
                    label: 'General',
                    elements: [
                        {
                            type: 'VerticalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    label: 'Description',
                                    scope: '#/properties/description'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'Category',
                    label: 'Theme',
                    elements: [
                        {
                            type: 'VerticalLayout',
                            elements: [
                                {
                                    type: 'Control',
                                    label: 'Dark',
                                    scope: '#/properties/dark'
                                },
                                {
                                    type: 'Control',
                                    label: 'Light',
                                    scope: '#/properties/light'
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        if (hideDescription) {
            delete dataSchema.properties.description;
            uiSchema.elements.shift();
        }
        return {
            dataSchema: dataSchema,
            uiSchema: uiSchema
        };
    }
    exports.getFormSchema = getFormSchema;
    function getProjectOwnerSchema() {
        return {
            dataSchema: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                        format: 'multi'
                    },
                    contractAddress: {
                        type: 'string',
                        required: true
                    },
                    dark: {
                        type: 'object',
                        properties: theme
                    },
                    light: {
                        type: 'object',
                        properties: theme
                    }
                }
            },
            uiSchema: {
                type: 'Categorization',
                elements: [
                    {
                        type: 'Category',
                        label: 'General',
                        elements: [
                            {
                                type: 'VerticalLayout',
                                elements: [
                                    {
                                        type: 'Control',
                                        label: 'Description',
                                        scope: '#/properties/description'
                                    },
                                    {
                                        type: 'Control',
                                        scope: '#/properties/contractAddress'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'Category',
                        label: 'Theme',
                        elements: [
                            {
                                type: 'VerticalLayout',
                                elements: [
                                    {
                                        type: 'Control',
                                        label: 'Dark',
                                        scope: '#/properties/dark'
                                    },
                                    {
                                        type: 'Control',
                                        label: 'Light',
                                        scope: '#/properties/light'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }
    exports.getProjectOwnerSchema = getProjectOwnerSchema;
});
define("@scom/scom-gem-token", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-gem-token/utils/index.ts", "@scom/scom-gem-token/store/index.ts", "@scom/scom-token-list", "@scom/scom-gem-token/assets.ts", "@scom/scom-gem-token/index.css.ts", "@scom/scom-gem-token/API.ts", "@scom/scom-gem-token/data.json.ts", "@scom/scom-commission-fee-setup", "@scom/scom-gem-token/formSchema.json.ts"], function (require, exports, components_5, eth_wallet_4, index_2, index_3, scom_token_list_2, assets_1, index_css_1, API_1, data_json_1, scom_commission_fee_setup_1, formSchema_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_5.Styles.Theme.ThemeVars;
    const buyTooltip = 'The fee the project owner will receive for token minting';
    const redeemTooltip = 'The spread the project owner will receive for redemptions';
    let ScomGemToken = class ScomGemToken extends components_5.Module {
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
            this.rpcWalletEvents = [];
            this.onWalletConnect = async () => {
                if (index_3.isClientWalletConnected) {
                    this.updateContractAddress();
                }
                else {
                    this.lblBalance.caption = '0.00';
                }
                this.initializeWidgetConfig();
            };
            this.onChainChanged = async () => {
                this.updateContractAddress();
                this.initializeWidgetConfig();
            };
            this.updateTokenBalance = async () => {
                var _a;
                const token = (_a = this.gemInfo) === null || _a === void 0 ? void 0 : _a.baseToken;
                if (!token)
                    return;
                try {
                    const symbol = (token === null || token === void 0 ? void 0 : token.symbol) || '';
                    this.lblBalance.caption = token ? `${(0, index_2.formatNumber)(await (0, index_2.getTokenBalance)(this.rpcWallet, token))} ${symbol}` : `0 ${symbol}`;
                }
                catch (_b) { }
            };
            this.initWallet = async () => {
                try {
                    await eth_wallet_4.Wallet.getClientInstance().init();
                    await this.rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.showTxStatusModal = (status, content) => {
                if (!this.txStatusModal)
                    return;
                let params = { status };
                if (status === 'success') {
                    params.txtHash = content;
                }
                else {
                    params.content = content;
                }
                this.txStatusModal.message = Object.assign({}, params);
                this.txStatusModal.showModal();
            };
            this.onBuyToken = async (quantity) => {
                if (!this.gemInfo.name)
                    return;
                const callback = (error, receipt) => {
                    if (error) {
                        this.showTxStatusModal('error', error);
                    }
                    else if (receipt) {
                        this.showTxStatusModal('success', receipt);
                    }
                };
                await (0, API_1.buyToken)(this.state, this.contract, quantity, this.gemInfo.baseToken, this._data.commissions, callback, async (result) => {
                    this.edtGemQty.value = '';
                    this.edtAmount.value = '';
                    this.btnSubmit.enabled = false;
                    await this.updateTokenBalance();
                });
            };
            this.onRedeemToken = async () => {
                if (!this.gemInfo.name)
                    return;
                const callback = (error, receipt) => {
                    if (error) {
                        this.showTxStatusModal('error', error);
                    }
                    else if (receipt) {
                        this.showTxStatusModal('success', receipt);
                    }
                };
                const gemAmount = this.edtAmount.value;
                await (0, API_1.redeemToken)(this.contract, gemAmount, callback, async (result) => {
                    this.lblBalance.caption = `${(0, index_2.formatNumber)(await this.getBalance())} ${this.tokenSymbol}`;
                    this.edtAmount.value = '';
                    this.backerTokenBalanceLb.caption = '0.00';
                });
            };
            this.state = new index_3.State(data_json_1.default);
        }
        removeRpcWalletEvents() {
            const rpcWallet = this.rpcWallet;
            for (let event of this.rpcWalletEvents) {
                rpcWallet.unregisterWalletEvent(event);
            }
            this.rpcWalletEvents = [];
        }
        onHide() {
            this.dappContainer.onHide();
            this.removeRpcWalletEvents();
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get chainId() {
            return this.state.getChainId();
        }
        get rpcWallet() {
            return this.state.getRpcWallet();
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
        getBuilderActions(dataSchema, uiSchema, category) {
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
                            const vstack = new components_5.VStack();
                            const config = new scom_commission_fee_setup_1.default(null, {
                                commissions: self._data.commissions || [],
                                fee: this.state.embedderCommissionFee,
                                networks: self._data.networks
                            });
                            const hstack = new components_5.HStack(null, {
                                verticalAlignment: 'center',
                            });
                            const button = new components_5.Button(hstack, {
                                caption: 'Confirm',
                                width: '100%',
                                height: 40,
                                font: { color: Theme.colors.primary.contrastText }
                            });
                            vstack.append(config);
                            vstack.append(hstack);
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
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = {
                            wallets: [],
                            networks: [],
                            defaultChainId: 0
                        };
                        let oldTag = {};
                        return {
                            execute: async () => {
                                oldData = JSON.parse(JSON.stringify(this._data));
                                const { dappType, logo, description } = userInputData, themeSettings = __rest(userInputData, ["dappType", "logo", "description"]);
                                const generalSettings = {
                                    dappType,
                                    logo,
                                    description
                                };
                                if (generalSettings.dappType != undefined)
                                    this._data.dappType = generalSettings.dappType;
                                if (generalSettings.logo != undefined)
                                    this._data.logo = generalSettings.logo;
                                if (generalSettings.description != undefined)
                                    this._data.description = generalSettings.description;
                                await this.resetRpcWallet();
                                this.refreshDApp();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder === null || builder === void 0 ? void 0 : builder.setTag)
                                    builder.setTag(themeSettings);
                                else
                                    this.setTag(themeSettings);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(themeSettings);
                            },
                            undo: async () => {
                                this._data = JSON.parse(JSON.stringify(oldData));
                                this.refreshDApp();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder === null || builder === void 0 ? void 0 : builder.setTag)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: dataSchema,
                    userInputUISchema: uiSchema
                });
            }
            return actions;
        }
        getProjectOwnerActions() {
            const formSchema = (0, formSchema_json_1.getProjectOwnerSchema)();
            const actions = [
                {
                    name: 'Settings',
                    userInputDataSchema: formSchema.dataSchema,
                    userInputUISchema: formSchema.uiSchema
                }
            ];
            return actions;
        }
        getConfigurators() {
            let self = this;
            return [
                {
                    name: 'Project Owner Configurator',
                    target: 'Project Owners',
                    getProxySelectors: async (chainId) => {
                        const selectors = await (0, index_2.getProxySelectors)(this.state, chainId, this.contract);
                        return selectors;
                    },
                    getActions: () => {
                        return this.getProjectOwnerActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        await this.setData(data);
                    },
                    setTag: this.setTag.bind(this),
                    getTag: this.getTag.bind(this)
                },
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: (category) => {
                        const formSchema = (0, formSchema_json_1.getFormSchema)(this._data.hideDescription);
                        const dataSchema = Object.assign({}, formSchema.dataSchema);
                        const uiSchema = Object.assign({}, formSchema.uiSchema);
                        return this.getBuilderActions(dataSchema, uiSchema, category);
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
                        const fee = this.state.embedderCommissionFee;
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
        async resetRpcWallet() {
            var _a;
            this.removeRpcWalletEvents();
            const rpcWalletId = await this.state.initRpcWallet(this.defaultChainId);
            const rpcWallet = this.rpcWallet;
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.onChainChanged();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.onWalletConnect();
            });
            this.rpcWalletEvents.push(chainChangedEvent, connectedEvent);
            const data = {
                defaultChainId: this.defaultChainId,
                wallets: this.wallets,
                networks: this.networks,
                showHeader: this.showHeader,
                rpcWalletId: rpcWallet.instanceId || ''
            };
            if ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.setData)
                this.dappContainer.setData(data);
        }
        async setData(value) {
            var _a;
            this._data = value;
            await this.resetRpcWallet();
            if (!this.tokenElm.isConnected)
                await this.tokenElm.ready();
            // if (this.tokenElm.rpcWalletId !== this.rpcWallet.instanceId) {
            //   this.tokenElm.rpcWalletId = this.rpcWallet.instanceId;
            // }
            this.tokenElm.chainId = (_a = this.state.getChainId()) !== null && _a !== void 0 ? _a : this.defaultChainId;
            await this.initializeWidgetConfig();
            const commissionFee = this.state.embedderCommissionFee;
            this.iconOrderTotal.tooltip.content = `A commission fee of ${new eth_wallet_4.BigNumber(commissionFee).times(100)}% will be applied to the amount you input.`;
            this.updateContractAddress();
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
            var _a;
            const themeVar = ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.theme) || 'light';
            const { fontColor, backgroundColor, inputFontColor, inputBackgroundColor, buttonBackgroundColor } = this.tag[themeVar] || {};
            this.updateStyle('--text-primary', fontColor);
            this.updateStyle('--background-main', backgroundColor);
            this.updateStyle('--input-font_color', inputFontColor);
            this.updateStyle('--input-background', inputBackgroundColor);
            this.updateStyle('--colors-primary-main', buttonBackgroundColor);
        }
        // async confirm() {
        //   return new Promise<void>(async (resolve, reject) => {
        //     try {
        //       if (this.loadingElm) this.loadingElm.visible = true;
        //       await this.onDeploy((error: Error, receipt?: string) => {
        //         if (error) {
        //           this.showTxStatusModal('error', error);
        //           reject(error);
        //         }
        //       }, (receipt: any) => {
        //         this.refreshDApp();
        //       });
        //     } catch (error) {
        //       this.showTxStatusModal('error', error);
        //       reject(error);
        //     }
        //     if (!this.contract && !this._data)
        //       reject(new Error('Data missing'));
        //     resolve();
        //     if (this.loadingElm) this.loadingElm.visible = false;
        //   })
        // }
        // private onDeploy = async (callback?: any, confirmationCallback?: any) => {
        //   if (this.contract || !this.gemInfo.name) return;
        //   const params = {
        //     name: this.gemInfo.name,
        //     symbol: this.gemInfo.symbol,
        //     cap: this.gemInfo.cap.toFixed(),
        //     price: this.gemInfo.price.toFixed(),
        //     mintingFee: this.gemInfo.mintingFee.toFixed(),
        //     redemptionFee: this.gemInfo.redemptionFee.toFixed()
        //   }
        //   const result = await deployContract(
        //     params,
        //     this.gemInfo.baseToken,
        //     callback,
        //     confirmationCallback
        //   );
        // }
        async initializeWidgetConfig() {
            scom_token_list_2.tokenStore.updateTokenMapData(this.chainId);
            const rpcWallet = this.rpcWallet;
            if (rpcWallet.address) {
                scom_token_list_2.tokenStore.updateAllTokenBalances(rpcWallet);
            }
            await this.initWallet();
            if ((0, index_3.isClientWalletConnected)()) {
                this.refreshDApp();
                await this.initApprovalAction();
            }
            else {
                this.renderEmpty();
            }
        }
        async renderEmpty() {
            if (!this.btnSubmit.isConnected)
                await this.btnSubmit.ready();
            if (!this.lbPrice.isConnected)
                await this.lbPrice.ready();
            if (!this.hStackTokens.isConnected)
                await this.hStackTokens.ready();
            if (!this.pnlInputFields.isConnected)
                await this.pnlInputFields.ready();
            if (!this.lblTitle.isConnected)
                await this.lblTitle.ready();
            if (!this.lblTitle2.isConnected)
                await this.lblTitle2.ready();
            if (!this.markdownViewer.isConnected)
                await this.markdownViewer.ready();
            if (!this.pnlUnsupportedNetwork.isConnected)
                await this.pnlUnsupportedNetwork.ready();
            this.btnSubmit.caption = this.submitButtonCaption;
            this.lbPrice.visible = false;
            this.hStackTokens.visible = false;
            this.pnlInputFields.visible = false;
            this.lblTitle.visible = false;
            this.lblTitle2.visible = false;
            this.markdownViewer.visible = false;
            this.pnlUnsupportedNetwork.visible = true;
        }
        async refreshDApp() {
            var _a;
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
            if (!this.btnSubmit.isConnected)
                await this.btnSubmit.ready();
            this.btnSubmit.caption = this.submitButtonCaption;
            this.imgLogo.url = this.imgLogo2.url = this.logo || assets_1.default.fullPath('img/gem-logo.png');
            this.gemInfo = this.contract ? await (0, API_1.getGemInfo)(this.state, this.contract) : null;
            if ((_a = this.gemInfo) === null || _a === void 0 ? void 0 : _a.baseToken) {
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
                    this.backerTokenImg.url = scom_token_list_2.assets.tokenPath(this.gemInfo.baseToken, this.chainId);
                    if (!this.backerTokenBalanceLb.isConnected)
                        await this.backerTokenBalanceLb.ready();
                    this.backerTokenBalanceLb.caption = '0.00';
                }
                else {
                    this.btnSubmit.enabled = new eth_wallet_4.BigNumber(this.edtAmount.value).gt(0);
                }
                const feeValue = this.isBuy ? eth_wallet_4.Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : eth_wallet_4.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
                if (!this.feeLb.isConnected)
                    await this.feeLb.ready();
                this.feeLb.caption = `${feeValue || ''} ${this.gemInfo.name}`;
                const qty = Number(this.edtGemQty.value);
                const totalGemTokens = new eth_wallet_4.BigNumber(qty).minus(new eth_wallet_4.BigNumber(qty).times(feeValue));
                if (!this.lbYouWillGet.isConnected)
                    await this.lbYouWillGet.ready();
                this.lbYouWillGet.caption = `${(0, index_2.formatNumber)(totalGemTokens)} ${this.gemInfo.name}`;
                this.feeTooltip.tooltip.content = this.isBuy ? buyTooltip : redeemTooltip;
                if (!this.lblBalance.isConnected)
                    await this.lblBalance.ready();
                this.lblBalance.caption = `${(0, index_2.formatNumber)(await this.getBalance())} ${this.tokenSymbol}`;
                this.updateTokenBalance();
            }
            else {
                this.renderEmpty();
            }
            if (!this.state.isRpcWalletConnected()) {
                this.btnSubmit.enabled = true;
            }
        }
        get contract() {
            var _a, _b, _c, _d;
            return (_d = (_a = this._data.contractAddress) !== null && _a !== void 0 ? _a : (_c = (_b = this._data.chainSpecificProperties) === null || _b === void 0 ? void 0 : _b[this.chainId]) === null || _c === void 0 ? void 0 : _c.contract) !== null && _d !== void 0 ? _d : '';
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
            var _a, _b;
            if ((_a = this._data.logo) === null || _a === void 0 ? void 0 : _a.startsWith('ipfs://')) {
                return this._data.logo.replace('ipfs://', '/ipfs/');
            }
            return (_b = this._data.logo) !== null && _b !== void 0 ? _b : '';
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
                this._entryContract = this.state.getProxyAddress();
                this.approvalModelAction = await this.state.setApprovalModelAction({
                    sender: this,
                    payAction: async () => {
                        await this.doSubmitAction();
                    },
                    onToBeApproved: async (token) => {
                        this.btnApprove.visible = true;
                        this.btnSubmit.enabled = !this.state.isRpcWalletConnected();
                        if (!this.isApproving) {
                            this.btnApprove.rightIcon.visible = false;
                            this.btnApprove.caption = 'Approve';
                        }
                        this.btnApprove.enabled = new eth_wallet_4.BigNumber(this.edtGemQty.value).gt(0);
                        this.isApproving = false;
                    },
                    onToBePaid: async (token) => {
                        this.btnApprove.visible = false;
                        this.isApproving = false;
                        this.btnSubmit.enabled = !this.state.isRpcWalletConnected() || new eth_wallet_4.BigNumber(this.edtAmount.value).gt(0);
                    },
                    onApproving: async (token, receipt) => {
                        this.isApproving = true;
                        this.btnApprove.rightIcon.spin = true;
                        this.btnApprove.rightIcon.visible = true;
                        this.btnApprove.caption = `Approving ${token.symbol}`;
                        this.btnSubmit.visible = false;
                        if (receipt) {
                            this.showTxStatusModal('success', receipt);
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
                        this.showTxStatusModal('error', err);
                        this.btnApprove.caption = 'Approve';
                        this.btnApprove.rightIcon.visible = false;
                    },
                    onPaying: async (receipt) => {
                        if (receipt) {
                            this.showTxStatusModal('success', receipt);
                            this.btnSubmit.enabled = false;
                            this.btnSubmit.rightIcon.visible = true;
                        }
                    },
                    onPaid: async (receipt) => {
                        this.btnSubmit.caption = this.submitButtonCaption;
                        this.btnSubmit.rightIcon.visible = false;
                    },
                    onPayingError: async (err) => {
                        this.showTxStatusModal('error', err);
                    }
                });
                this.state.approvalModel.spenderAddress = this._entryContract;
            }
        }
        updateContractAddress() {
            if (this.approvalModelAction) {
                if (!this._data.commissions || this._data.commissions.length == 0) {
                    this._entryContract = this.contract;
                }
                else {
                    this._entryContract = this.state.getProxyAddress();
                }
                this.state.approvalModel.spenderAddress = this._entryContract;
            }
        }
        updateSubmitButton(submitting) {
            this.btnSubmit.rightIcon.spin = submitting;
            this.btnSubmit.rightIcon.visible = submitting;
        }
        get submitButtonCaption() {
            return !this.state.isRpcWalletConnected() ? 'Switch Network' : 'Submit';
        }
        onApprove() {
            this.showTxStatusModal('warning', 'Approving');
            this.approvalModelAction.doApproveAction(this.gemInfo.baseToken, eth_wallet_4.Utils.toDecimals(this.edtAmount.value, this.gemInfo.baseToken.decimals).toFixed());
        }
        async onQtyChanged() {
            const qty = Number(this.edtGemQty.value);
            const backerCoinAmount = this.getBackerCoinAmount(qty);
            const commissionFee = this.state.embedderCommissionFee;
            this.edtAmount.value = new eth_wallet_4.BigNumber(qty).times(commissionFee).plus(qty).toFixed();
            const feeValue = this.isBuy ? eth_wallet_4.Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : eth_wallet_4.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
            const totalGemTokens = new eth_wallet_4.BigNumber(qty).minus(new eth_wallet_4.BigNumber(qty).times(feeValue));
            this.lbYouWillGet.caption = `${(0, index_2.formatNumber)(totalGemTokens)} ${this.gemInfo.name}`;
            this.btnApprove.enabled = new eth_wallet_4.BigNumber(this.edtGemQty.value).gt(0);
            if (this.approvalModelAction && this.state.isRpcWalletConnected())
                this.approvalModelAction.checkAllowance(this.gemInfo.baseToken, backerCoinAmount.toString());
        }
        async onAmountChanged() {
            const gemAmount = Number(this.edtAmount.value);
            this.backerTokenBalanceLb.caption = (0, index_2.formatNumber)(this.getBackerCoinAmount(gemAmount));
            const balance = await this.getBalance();
            this.btnSubmit.enabled = !this.state.isRpcWalletConnected() || balance.gt(0) && new eth_wallet_4.BigNumber(this.edtAmount.value).gt(0) && new eth_wallet_4.BigNumber(this.edtAmount.value).isLessThanOrEqualTo(balance);
        }
        getBackerCoinAmount(gemAmount) {
            const redemptionFee = eth_wallet_4.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
            const price = eth_wallet_4.Utils.fromDecimals(this.gemInfo.price).toFixed();
            const amount = new eth_wallet_4.BigNumber(gemAmount);
            return amount.dividedBy(price).minus(amount.dividedBy(price).multipliedBy(redemptionFee));
        }
        // private getGemAmount(backerCoinAmount: number) {
        //   const mintingFee = Utils.fromDecimals(this.gemInfo.mintingFee).toFixed();
        //   const price = Utils.fromDecimals(this.gemInfo.price).toFixed();
        //   return (backerCoinAmount - (backerCoinAmount * Number(mintingFee))) * Number(price);
        // }
        async getBalance(token) {
            let balance = new eth_wallet_4.BigNumber(0);
            const tokenData = token || this.gemInfo.baseToken;
            if (this.isBuy && tokenData) {
                balance = await (0, index_2.getTokenBalance)(this.rpcWallet, tokenData);
            }
            else if (!this.isBuy && this.contract) {
                balance = await (0, API_1.getGemBalance)(this.state, this.contract);
                balance = eth_wallet_4.Utils.fromDecimals(balance);
            }
            return balance;
        }
        async doSubmitAction() {
            var _a;
            if (!this._data || !this.contract)
                return;
            this.updateSubmitButton(true);
            // if (!this.tokenElm.token) {
            //   this.showTxStatusModal('error', 'Token Required');
            //   this.updateSubmitButton(false);
            //   return;
            // }
            const balance = await this.getBalance();
            if (this._type === 'buy') {
                const qty = this.edtGemQty.value ? Number(this.edtGemQty.value) : 1;
                if (balance.lt(this.getBackerCoinAmount(qty))) {
                    this.showTxStatusModal('error', `Insufficient ${((_a = this.tokenElm.token) === null || _a === void 0 ? void 0 : _a.symbol) || ''} Balance`);
                    this.updateSubmitButton(false);
                    return;
                }
                await this.onBuyToken(qty);
            }
            else {
                if (!this.edtAmount.value) {
                    this.showTxStatusModal('error', 'Amount Required');
                    this.updateSubmitButton(false);
                    return;
                }
                if (balance.lt(this.edtAmount.value)) {
                    this.showTxStatusModal('error', `Insufficient ${this.gemInfo.name} Balance`);
                    this.updateSubmitButton(false);
                    return;
                }
                await this.onRedeemToken();
            }
            this.updateSubmitButton(false);
        }
        async onSubmit() {
            if (!this.state.isRpcWalletConnected()) {
                const chainId = this.chainId;
                const clientWallet = eth_wallet_4.Wallet.getClientInstance();
                await clientWallet.switchNetwork(chainId);
                return;
            }
            if (this.isBuy) {
                this.showTxStatusModal('warning', 'Comfirming');
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
            var _a;
            if (!this.edtAmount.isConnected)
                await this.edtAmount.ready();
            if (!this.tokenElm.isConnected)
                await this.tokenElm.ready();
            this.edtAmount.readOnly = this.isBuy || !this.contract;
            this.edtAmount.value = "";
            if (this.isBuy) {
                // if (this.tokenElm.rpcWalletId !== this.rpcWallet.instanceId) {
                //   this.tokenElm.rpcWalletId = this.rpcWallet.instanceId;
                // }
                this.tokenElm.chainId = (_a = this.state.getChainId()) !== null && _a !== void 0 ? _a : this.defaultChainId;
                this.tokenElm.token = this.gemInfo.baseToken;
                this.tokenElm.visible = true;
                this.tokenElm.tokenReadOnly = !!this.contract;
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
                this.gemLogoStack.append(this.$render("i-image", { url: this.logo, border: { radius: 4 }, width: 30, height: 30, fallbackUrl: assets_1.default.fullPath('img/gem-logo.png') }));
                if (!this.maxStack.isConnected)
                    await this.maxStack.ready();
                this.maxStack.visible = !!this.contract;
                if (!this.gridTokenInput.isConnected)
                    await this.gridTokenInput.ready();
                this.gridTokenInput.templateColumns = ['50px', 'auto', '100px'];
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
                                    this.$render("i-image", { id: 'imgLogo', height: 100, border: { radius: 4 } })),
                                this.$render("i-label", { id: "lblTitle", font: { bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' } }),
                                this.$render("i-markdown", { id: 'markdownViewer', class: index_css_1.markdownStyle, width: '100%', height: '100%', font: { size: '1rem' } })),
                            this.$render("i-vstack", { gap: "0.5rem", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, verticalAlignment: 'space-between' },
                                this.$render("i-vstack", { horizontalAlignment: 'center', id: "pnlLogoTitle", gap: '0.5rem' },
                                    this.$render("i-image", { id: 'imgLogo2', height: 100, border: { radius: 4 } }),
                                    this.$render("i-label", { id: "lblTitle2", font: { bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' } })),
                                this.$render("i-label", { id: "lbPrice", caption: "Price", font: { size: '1rem' }, opacity: 0.6 }),
                                this.$render("i-hstack", { id: "hStackTokens", gap: "4px", class: 'text-center', margin: { bottom: '1rem' } },
                                    this.$render("i-label", { id: "fromTokenLb", font: { bold: true, size: '1.5rem' } }),
                                    this.$render("i-label", { caption: "=", font: { bold: true, size: '1.5rem' } }),
                                    this.$render("i-label", { id: "toTokenLb", font: { bold: true, size: '1.5rem' } })),
                                this.$render("i-vstack", { gap: "0.5rem", id: 'pnlInputFields' },
                                    this.$render("i-grid-layout", { id: "balanceLayout", gap: { column: '0.5rem', row: '0.25rem' } },
                                        this.$render("i-hstack", { id: 'pnlQty', horizontalAlignment: 'end', verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'qty' } },
                                            this.$render("i-label", { caption: 'Qty', font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                            this.$render("i-input", { id: 'edtGemQty', value: 1, background: { color: Theme.input.background }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, inputType: 'number', font: { size: '1rem', bold: true }, border: { radius: 4, style: 'solid', width: '1px', color: Theme.divider }, class: index_css_1.inputStyle, onChanged: this.onQtyChanged })),
                                        this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'balance' } },
                                            this.$render("i-hstack", { verticalAlignment: 'center', gap: "0.5rem" },
                                                this.$render("i-label", { id: "lbOrderTotalTitle", caption: 'Total', font: { size: '1rem' } }),
                                                this.$render("i-icon", { id: "iconOrderTotal", name: "question-circle", fill: Theme.text.primary, width: 20, height: 20, opacity: 0.6 })),
                                            this.$render("i-hstack", { verticalAlignment: 'center', gap: "0.5rem" },
                                                this.$render("i-label", { caption: 'Balance:', font: { size: '1rem' }, opacity: 0.6 }),
                                                this.$render("i-label", { id: 'lblBalance', font: { size: '1rem' }, opacity: 0.6 }))),
                                        this.$render("i-grid-layout", { id: 'gridTokenInput', verticalAlignment: "center", templateColumns: ['60%', 'auto'], border: { radius: 16 }, overflow: "hidden", background: { color: Theme.input.background }, font: { color: Theme.input.fontColor }, height: 56, width: "50%", margin: { left: 'auto', right: 'auto', top: '1rem' }, padding: { left: '0px' }, grid: { area: 'tokenInput' } },
                                            this.$render("i-panel", { id: "gemLogoStack", padding: { left: 10 }, visible: false }),
                                            this.$render("i-scom-token-input", { id: "tokenElm", isBalanceShown: false, isBtnMaxShown: false, isCommonShown: false, isInputShown: false, isSortBalanceShown: false, padding: { top: '0px', left: '0px', right: '11px', bottom: '0px' }, width: "100%" }),
                                            this.$render("i-input", { id: "edtAmount", width: '100%', height: '100%', minHeight: 40, border: { style: 'none' }, inputType: 'number', font: { size: '1.25rem' }, background: { color: Theme.input.background }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, class: index_css_1.inputStyle, onChanged: this.onAmountChanged }),
                                            this.$render("i-hstack", { id: "maxStack", horizontalAlignment: "end", visible: false },
                                                this.$render("i-button", { caption: "Max", padding: { top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }, margin: { right: 10 }, font: { size: '0.875rem', color: Theme.colors.primary.contrastText }, onClick: () => this.onSetMaxBalance() }))),
                                        this.$render("i-hstack", { id: "backerStack", horizontalAlignment: "space-between", verticalAlignment: "center", grid: { area: 'redeem' }, margin: { top: '1rem', bottom: '1rem' }, maxWidth: "50%", visible: false },
                                            this.$render("i-label", { caption: 'You get:', font: { size: '1rem' } }),
                                            this.$render("i-image", { id: "backerTokenImg", width: 20, height: 20, fallbackUrl: scom_token_list_2.assets.tokenPath() }),
                                            this.$render("i-label", { id: "backerTokenBalanceLb", caption: '0.00', font: { size: '1rem' } }))),
                                    this.$render("i-vstack", { horizontalAlignment: "center", verticalAlignment: 'center', gap: "8px", width: "50%", margin: { left: 'auto', right: 'auto', bottom: '1.313rem' } },
                                        this.$render("i-button", { id: "btnApprove", minWidth: '100%', caption: "Approve", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, visible: false, onClick: this.onApprove }),
                                        this.$render("i-button", { id: 'btnSubmit', width: '100%', caption: 'Submit', padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, background: { color: Theme.colors.primary.main }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, onClick: this.onSubmit, enabled: false })),
                                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", gap: "0.5rem" },
                                        this.$render("i-hstack", { horizontalAlignment: "end", verticalAlignment: "center", gap: 4 },
                                            this.$render("i-label", { caption: "Transaction Fee", font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                            this.$render("i-icon", { id: "feeTooltip", name: "question-circle", opacity: 0.6, fill: Theme.text.primary, width: 14, height: 14 })),
                                        this.$render("i-label", { id: "feeLb", font: { size: '1rem', bold: true }, opacity: 0.6, caption: "0" })),
                                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", gap: "0.5rem" },
                                        this.$render("i-label", { caption: "You will get", font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                        this.$render("i-label", { id: "lbYouWillGet", font: { size: '1rem', bold: true }, opacity: 0.6, caption: "0" }))),
                                this.$render("i-vstack", { id: 'pnlUnsupportedNetwork', visible: false, horizontalAlignment: 'center' },
                                    this.$render("i-label", { caption: 'This network is not supported.', font: { size: '1.5rem' } }))))),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }))));
        }
    };
    ScomGemToken = __decorate([
        (0, components_5.customElements)('i-scom-gem-token')
    ], ScomGemToken);
    exports.default = ScomGemToken;
});
