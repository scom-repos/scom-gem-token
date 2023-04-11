var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
            balance = await exports.getERC20Amount(wallet, token.address, token.decimals);
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
                let allowance = await exports.getERC20Allowance(token, this.options.spenderAddress);
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
                token_1.registerSendTxEvents({
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
        token_1.registerSendTxEvents({
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
        return exports.formatNumberWithSeparators(val, decimals || 4);
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
        const staticMessageMap = {
            'execution reverted: OAXDEX: INVALID_SIGNATURE': 'Invalid signature',
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
define("@scom/scom-gem-token/wallet/index.ts", ["require", "exports", "@ijstech/eth-wallet"], function (require, exports, eth_wallet_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getChainId = exports.isWalletConnected = void 0;
    const defaultChainId = 1;
    function isWalletConnected() {
        const wallet = eth_wallet_4.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isWalletConnected = isWalletConnected;
    const getChainId = () => {
        const wallet = eth_wallet_4.Wallet.getInstance();
        return isWalletConnected() ? wallet.chainId : defaultChainId;
    };
    exports.getChainId = getChainId;
});
define("@scom/scom-gem-token/store/tokens/mainnet/avalanche.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Avalanche = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/mainnet/avalanche.ts'/> 
    exports.Tokens_Avalanche = [
        {
            "address": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
            "name": "Wrapped AVAX",
            "symbol": "WAVAX",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "name": "OpenSwap",
            "symbol": "OSWAP",
            "address": "0xb32aC3C79A94aC1eb258f3C830bBDbc676483c93",
            "decimals": 18,
            "isCommon": true
        },
        { "address": "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", "name": "USD Coin", "symbol": "USDC.e", "decimals": 6, "isCommon": true },
        {
            "address": "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
            "name": "Wrapped Ether",
            "symbol": "WETH.e",
            "decimals": 18,
            "isCommon": true
        },
        { "address": "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", "name": "Tether USD", "symbol": "USDT.e", "decimals": 6, "isCommon": true },
        { "address": "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5", "name": "BENQI", "symbol": "QI", "decimals": 18 },
        { "address": "0x60781C2586D68229fde47564546784ab3fACA982", "name": "Pangolin", "symbol": "PNG", "decimals": 18 },
        {
            "address": "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
            "name": "Dai Stablecoin",
            "symbol": "DAI.e",
            "decimals": 18,
            "isCommon": true
        },
        { "address": "0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4", "name": "Avalaunch", "symbol": "XAVA", "decimals": 18 },
        { "address": "0x130966628846BFd36ff31a822705796e8cb8C18D", "name": "Magic Internet Money", "symbol": "MIM", "decimals": 18 },
        { "address": "0x50b7545627a5162F82A992c33b87aDc75187B218", "name": "Wrapped BTC", "symbol": "WBTC.e", "decimals": 8 },
        { "address": "0x5947BB275c521040051D82396192181b413227A3", "name": "Chainlink Token", "symbol": "LINK.e", "decimals": 18 },
        { "address": "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64", "name": "Frax", "symbol": "FRAX", "decimals": 18 },
        { "address": "0x4f60a160D8C2DDdaAfe16FCC57566dB84D674BD6", "name": "Jewels", "symbol": "JEWEL", "decimals": 18 },
        { "address": "0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7", "name": "Yak Token", "symbol": "YAK", "decimals": 18 },
        { "address": "0x214DB107654fF987AD859F34125307783fC8e387", "name": "Frax Share", "symbol": "FXS", "decimals": 18 },
        { "address": "0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB", "name": "TrueUSD", "symbol": "TUSD", "decimals": 18 },
        { "address": "0xCE1bFFBD5374Dac86a2893119683F4911a2F7814", "name": "Spell Token", "symbol": "SPELL", "decimals": 18 },
        { "address": "0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c", "name": "PenguinToken", "symbol": "PEFI", "decimals": 18 },
        { "address": "0x346A59146b9b4a77100D369a3d18E8007A9F46a6", "name": "AVAI", "symbol": "AVAI", "decimals": 18 },
        { "address": "0x321E7092a180BB43555132ec53AaA65a5bF84251", "name": "Governance OHM", "symbol": "gOHM", "decimals": 18 },
        { "address": "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", "name": "JoeToken", "symbol": "JOE", "decimals": 18 },
        { "address": "0xdef1fac7Bf08f173D286BbBDcBeeADe695129840", "name": "Cerby Token", "symbol": "CERBY", "decimals": 18 },
        { "address": "0x63682bDC5f875e9bF69E201550658492C9763F89", "name": "Betswap.gg", "symbol": "BSGG", "decimals": 18 },
        { "address": "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33", "name": "JoeBar", "symbol": "xJOE", "decimals": 18 },
        { "address": "0xe0Ce60AF0850bF54072635e66E79Df17082A1109", "name": "Ice Token", "symbol": "ICE", "decimals": 18 },
        { "address": "0x3Ee97d514BBef95a2f110e6B9b73824719030f7a", "name": "Staked Spell Token", "symbol": "sSPELL", "decimals": 18 },
        { "address": "0xCDEB5641dC5BF05845317B00643A713CCC3b22e6", "name": "Huobi", "symbol": "HT", "decimals": 18 },
        { "address": "0xA56B1b9f4e5A1A1e0868F5Fd4352ce7CdF0C2A4F", "name": "Matic", "symbol": "MATIC", "decimals": 18 },
        { "address": "0xF873633DF9D5cDd62BB1f402499CC470a72A02D7", "name": "MoonRiver", "symbol": "MOVR", "decimals": 18 },
        { "address": "0xA384Bc7Cdc0A93e686da9E7B8C0807cD040F4E0b", "name": "WOWSwap", "symbol": "WOW", "decimals": 18 },
        { "address": "0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b", "name": "Wrapped Memo", "symbol": "wMEMO", "decimals": 18 },
        { "address": "0xb54f16fB19478766A268F172C9480f8da1a7c9C3", "name": "Time", "symbol": "TIME", "decimals": 18 },
        { "address": "0x37B608519F91f70F2EeB0e5Ed9AF4061722e4F76", "name": "SushiToken", "symbol": "SUSHI", "decimals": 18 },
        { "address": "0x63a72806098Bd3D9520cC43356dD78afe5D386D9", "name": "Aave Token", "symbol": "AAVE", "decimals": 18 }
    ];
});
define("@scom/scom-gem-token/store/tokens/mainnet/ethereum.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Ethereuem = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/mainnet/ethereum.ts'/> 
    exports.Tokens_Ethereuem = [
        {
            "address": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
            "name": "Aave",
            "symbol": "AAVE",
            "decimals": 18
        },
        {
            "address": "0xfF20817765cB7f73d4bde2e66e067E58D11095C2",
            "name": "Amp",
            "symbol": "AMP",
            "decimals": 18
        },
        {
            "name": "Aragon Network Token",
            "address": "0x960b236A07cf122663c4303350609A66A7B288C0",
            "symbol": "ANT",
            "decimals": 18
        },
        {
            "name": "Balancer",
            "address": "0xba100000625a3754423978a60c9317c58a424e3D",
            "symbol": "BAL",
            "decimals": 18
        },
        {
            "address": "0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55",
            "name": "Band Protocol",
            "symbol": "BAND",
            "decimals": 18
        },
        {
            "name": "Bancor Network Token",
            "address": "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C",
            "symbol": "BNT",
            "decimals": 18
        },
        {
            "name": "Compound",
            "address": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
            "symbol": "COMP",
            "decimals": 18
        },
        {
            "name": "Curve DAO Token",
            "address": "0xD533a949740bb3306d119CC777fa900bA034cd52",
            "symbol": "CRV",
            "decimals": 18
        },
        {
            "address": "0x41e5560054824eA6B0732E656E3Ad64E20e94E45",
            "name": "Civic",
            "symbol": "CVC",
            "decimals": 8
        },
        {
            "name": "Dai Stablecoin",
            "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            "symbol": "DAI",
            "decimals": 18,
            "isCommon": true
        },
        {
            "address": "0x0AbdAce70D3790235af448C88547603b945604ea",
            "name": "district0x",
            "symbol": "DNT",
            "decimals": 18
        },
        {
            "name": "Gnosis Token",
            "address": "0x6810e776880C02933D47DB1b9fc05908e5386b96",
            "symbol": "GNO",
            "decimals": 18
        },
        {
            "address": "0xc944E90C64B2c07662A292be6244BDf05Cda44a7",
            "name": "The Graph",
            "symbol": "GRT",
            "decimals": 18
        },
        {
            "address": "0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC",
            "name": "Keep Network",
            "symbol": "KEEP",
            "decimals": 18
        },
        {
            "name": "Kyber Network Crystal",
            "address": "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
            "symbol": "KNC",
            "decimals": 18
        },
        {
            "name": "ChainLink Token",
            "address": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
            "symbol": "LINK",
            "decimals": 18
        },
        {
            "name": "Loom Network",
            "address": "0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0",
            "symbol": "LOOM",
            "decimals": 18
        },
        {
            "name": "LoopringCoin V2",
            "address": "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD",
            "symbol": "LRC",
            "decimals": 18
        },
        {
            "address": "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
            "name": "Decentraland",
            "symbol": "MANA",
            "decimals": 18
        },
        {
            "name": "Maker",
            "address": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
            "symbol": "MKR",
            "decimals": 18
        },
        {
            "address": "0xec67005c4E498Ec7f55E092bd1d35cbC47C91892",
            "name": "Melon",
            "symbol": "MLN",
            "decimals": 18
        },
        {
            "name": "Numeraire",
            "address": "0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671",
            "symbol": "NMR",
            "decimals": 18
        },
        {
            "address": "0x4fE83213D56308330EC302a8BD641f1d0113A4Cc",
            "name": "NuCypher",
            "symbol": "NU",
            "decimals": 18
        },
        {
            "name": "Orchid",
            "address": "0x4575f41308EC1483f3d399aa9a2826d74Da13Deb",
            "symbol": "OXT",
            "decimals": 18
        },
        {
            "name": "Republic Token",
            "address": "0x408e41876cCCDC0F92210600ef50372656052a38",
            "symbol": "REN",
            "decimals": 18
        },
        {
            "name": "Reputation Augur v1",
            "address": "0x1985365e9f78359a9B6AD760e32412f4a445E862",
            "symbol": "REP",
            "decimals": 18
        },
        {
            "name": "Reputation Augur v2",
            "address": "0x221657776846890989a759BA2973e427DfF5C9bB",
            "symbol": "REPv2",
            "decimals": 18
        },
        {
            "name": "Synthetix Network Token",
            "address": "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
            "symbol": "SNX",
            "decimals": 18
        },
        {
            "name": "Storj Token",
            "address": "0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC",
            "symbol": "STORJ",
            "decimals": 8
        },
        {
            "address": "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa",
            "name": "tBTC",
            "symbol": "TBTC",
            "decimals": 18
        },
        {
            "name": "UMA Voting Token v1",
            "address": "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
            "symbol": "UMA",
            "decimals": 18
        },
        {
            "name": "Uniswap",
            "address": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
            "symbol": "UNI",
            "decimals": 18
        },
        {
            "name": "USDCoin",
            "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "symbol": "USDC",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "Tether USD",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "symbol": "USDT",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "Wrapped BTC",
            "address": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            "symbol": "WBTC",
            "decimals": 8,
            "isCommon": true
        },
        {
            "address": "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
            "name": "yearn finance",
            "symbol": "YFI",
            "decimals": 18
        },
        {
            "name": "0x Protocol Token",
            "address": "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
            "symbol": "ZRX",
            "decimals": 18
        },
        {
            "name": "openANX Token",
            "address": "0x701C244b988a513c945973dEFA05de933b23Fe1D",
            "symbol": "OAX",
            "decimals": 18
        },
        {
            "name": "Wrapped Ether",
            "symbol": "WETH",
            "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/mainnet/polygon.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Polygon = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/mainnet/polygon.ts'/> 
    exports.Tokens_Polygon = [
        {
            "address": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            "name": "Wrapped Matic",
            "symbol": "WMATIC",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        { "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", "name": "Wrapped Ether", "symbol": "WETH", "decimals": 18 },
        { "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", "name": "USD Coin (PoS)", "symbol": "USDC", "decimals": 6, "isCommon": true },
        { "address": "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683", "name": "SAND", "symbol": "SAND", "decimals": 18 },
        { "address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "name": "(PoS) Tether USD", "symbol": "USDT", "decimals": 6 },
        { "address": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", "name": "(PoS) Wrapped BTC", "symbol": "WBTC", "decimals": 8 },
        { "address": "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", "name": "miMATIC", "symbol": "miMATIC", "decimals": 18 },
        {
            "address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
            "name": "(PoS) Dai Stablecoin",
            "symbol": "DAI",
            "decimals": 18,
            "isCommon": true
        },
        { "address": "0x831753DD7087CaC61aB5644b308642cc1c33Dc13", "name": "Quickswap", "symbol": "QUICK", "decimals": 18 },
        { "address": "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32", "name": "Telcoin (PoS)", "symbol": "TEL", "decimals": 2 },
        { "address": "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7", "name": "Aavegotchi GHST Token (PoS)", "symbol": "GHST", "decimals": 18 },
        { "address": "0x580A84C73811E1839F75d86d75d88cCa0c241fF4", "name": "Qi Dao", "symbol": "QI", "decimals": 18 },
        { "address": "0xE5417Af564e4bFDA1c483642db72007871397896", "name": "Gains Network", "symbol": "GNS", "decimals": 18 },
        { "address": "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", "name": "Aave (PoS)", "symbol": "AAVE", "decimals": 18, "isCommon": true },
        { "address": "0xc6C855AD634dCDAd23e64DA71Ba85b8C51E5aD7c", "name": "Decentral Games ICE", "symbol": "ICE", "decimals": 18 },
        { "address": "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", "name": "ChainLink Token", "symbol": "LINK", "decimals": 18 },
        { "address": "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b", "name": "Avalanche Token", "symbol": "AVAX", "decimals": 18 },
        { "address": "0xB85517b87BF64942adf3A0B9E4c71E4Bc5Caa4e5", "name": "Fantom Token", "symbol": "FTM", "decimals": 18 },
        { "address": "0x229b1b6C23ff8953D663C4cBB519717e323a0a84", "name": "BLOK", "symbol": "BLOK", "decimals": 18 }
    ];
});
define("@scom/scom-gem-token/store/tokens/mainnet/bsc.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_BSC = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/mainnet/bsc.ts'/> 
    exports.Tokens_BSC = [
        {
            "name": "OpenSwap",
            "symbol": "OSWAP",
            "address": "0xb32aC3C79A94aC1eb258f3C830bBDbc676483c93",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "PancakeSwap Token",
            "symbol": "CAKE",
            "address": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
            "decimals": 18
        },
        {
            "name": "Cardano Token",
            "symbol": "ADA",
            "address": "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
            "decimals": 18
        },
        {
            "name": "AdEx Network",
            "symbol": "ADX",
            "address": "0x6bfF4Fb161347ad7de4A625AE5aa3A1CA7077819",
            "decimals": 18
        },
        {
            "name": "My Neigbor Alice",
            "symbol": "ALICE",
            "address": "0xAC51066d7bEC65Dc4589368da368b212745d63E8",
            "decimals": 6
        },
        {
            "name": "AlpaToken",
            "symbol": "ALPA",
            "address": "0xc5E6689C9c8B02be7C49912Ef19e79cF24977f03",
            "decimals": 18
        },
        {
            "name": "Alpaca",
            "symbol": "ALPACA",
            "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
            "decimals": 18
        },
        {
            "name": "AlphaToken",
            "symbol": "ALPHA",
            "address": "0xa1faa113cbE53436Df28FF0aEe54275c13B40975",
            "decimals": 18
        },
        {
            "name": "Ampleforth",
            "symbol": "AMPL",
            "address": "0xDB021b1B247fe2F1fa57e0A87C748Cc1E321F07F",
            "decimals": 9
        },
        {
            "name": "Ankr",
            "symbol": "ANKR",
            "address": "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
            "decimals": 18
        },
        {
            "name": "anyMTLX",
            "symbol": "anyMTLX",
            "address": "0x5921DEE8556c4593EeFCFad3CA5e2f618606483b",
            "decimals": 18
        },
        {
            "name": "APYSwap",
            "symbol": "APYS",
            "address": "0x37dfACfaeDA801437Ff648A1559d73f4C40aAcb7",
            "decimals": 18
        },
        {
            "name": "ARPA",
            "symbol": "ARPA",
            "address": "0x6F769E65c14Ebd1f68817F5f1DcDb61Cfa2D6f7e",
            "decimals": 18
        },
        {
            "name": "ARIVA",
            "symbol": "ARV",
            "address": "0x6679eB24F59dFe111864AEc72B443d1Da666B360",
            "decimals": 8
        },
        {
            "name": "AS Roma",
            "symbol": "ASR",
            "address": "0x80D5f92C2c8C682070C95495313dDB680B267320",
            "decimals": 2
        },
        {
            "name": "Automata",
            "symbol": "ATA",
            "address": "0xA2120b9e674d3fC3875f415A7DF52e382F141225",
            "decimals": 18
        },
        {
            "name": "Atletico de Madrid",
            "symbol": "ATM",
            "address": "0x25E9d05365c867E59C1904E7463Af9F312296f9E",
            "decimals": 2
        },
        {
            "name": "Cosmos Token",
            "symbol": "ATOM",
            "address": "0x0Eb3a705fc54725037CC9e008bDede697f62F335",
            "decimals": 18
        },
        {
            "name": "AUTOv2",
            "symbol": "AUTO",
            "address": "0xa184088a740c695E156F91f5cC086a06bb78b827",
            "decimals": 18
        },
        {
            "name": "Axie Infinity Shard",
            "symbol": "AXS",
            "address": "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0",
            "decimals": 18
        },
        {
            "name": "BabyCake",
            "symbol": "BABYCAKE",
            "address": "0xdB8D30b74bf098aF214e862C90E647bbB1fcC58c",
            "decimals": 18
        },
        {
            "name": "Bakery Token",
            "symbol": "BAKE",
            "address": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5",
            "decimals": 18
        },
        {
            "name": "AllianceBlock",
            "symbol": "bALBT",
            "address": "0x72fAa679E1008Ad8382959FF48E392042A8b06f7",
            "decimals": 18
        },
        {
            "name": "BAND Protocol Token",
            "symbol": "BAND",
            "address": "0xAD6cAEb32CD2c308980a548bD0Bc5AA4306c6c18",
            "decimals": 18
        },
        {
            "name": "Basic Attention Token",
            "symbol": "BAT",
            "address": "0x101d82428437127bF1608F699CD651e6Abf9766E",
            "decimals": 18
        },
        {
            "name": "bBADGER",
            "symbol": "bBADGER",
            "address": "0x1F7216fdB338247512Ec99715587bb97BBf96eae",
            "decimals": 18
        },
        {
            "name": "Conflux",
            "symbol": "bCFX",
            "address": "0x045c4324039dA91c52C55DF5D785385Aab073DcF",
            "decimals": 18
        },
        {
            "name": "Bitcoin Cash Token",
            "symbol": "BCH",
            "address": "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
            "decimals": 18
        },
        {
            "name": "bDIGG",
            "symbol": "bDIGG",
            "address": "0x5986D5c77c65e5801a5cAa4fAE80089f870A71dA",
            "decimals": 18
        },
        {
            "name": "bDollar",
            "symbol": "BDO",
            "address": "0x190b589cf9Fb8DDEabBFeae36a813FFb2A702454",
            "decimals": 18
        },
        {
            "name": "Bella Protocol",
            "symbol": "BEL",
            "address": "0x8443f091997f06a61670B735ED92734F5628692F",
            "decimals": 18
        },
        {
            "name": "Belt",
            "symbol": "BELT",
            "address": "0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f",
            "decimals": 18
        },
        {
            "name": "Beta Finance",
            "symbol": "BETA",
            "address": "0xBe1a001FE942f96Eea22bA08783140B9Dcc09D28",
            "decimals": 18
        },
        {
            "name": "Beacon ETH",
            "symbol": "BETH",
            "address": "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
            "decimals": 18
        },
        {
            "name": "b.earnfi",
            "symbol": "BFI",
            "address": "0x81859801b01764D4f0Fa5E64729f5a6C3b91435b",
            "decimals": 18
        },
        {
            "name": "Beefy.finance",
            "symbol": "BIFI",
            "address": "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
            "decimals": 18
        },
        {
            "name": "BLINk",
            "symbol": "BLK",
            "address": "0x63870A18B6e42b01Ef1Ad8A2302ef50B7132054F",
            "decimals": 6
        },
        {
            "name": "Binamon",
            "symbol": "BMON",
            "address": "0x08ba0619b1e7A582E0BCe5BBE9843322C954C340",
            "decimals": 18
        },
        {
            "name": "Multiplier",
            "symbol": "bMXX",
            "address": "0x4131b87F74415190425ccD873048C708F8005823",
            "decimals": 18
        },
        {
            "name": "Bondly",
            "symbol": "BONDLY",
            "address": "0x5D0158A5c3ddF47d4Ea4517d8DB0D76aA2e87563",
            "decimals": 18
        },
        {
            "name": "OPEN Governance Token",
            "symbol": "bOPEN",
            "address": "0xF35262a9d427F96d2437379eF090db986eaE5d42",
            "decimals": 18
        },
        {
            "name": "BoringDAO",
            "symbol": "BORING",
            "address": "0xffEecbf8D7267757c2dc3d13D730E97E15BfdF7F",
            "decimals": 18
        },
        {
            "name": "BunnyPark",
            "symbol": "BP",
            "address": "0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1",
            "decimals": 18
        },
        {
            "name": "ROOBEE",
            "symbol": "bROOBEE",
            "address": "0xE64F5Cb844946C1F102Bd25bBD87a5aB4aE89Fbe",
            "decimals": 18
        },
        {
            "name": "Berry",
            "symbol": "BRY",
            "address": "0xf859Bf77cBe8699013d6Dbc7C2b926Aaf307F830",
            "decimals": 18
        },
        {
            "name": "BSC Ecosystem Defi blue chips",
            "symbol": "BSCDEFI",
            "address": "0x40E46dE174dfB776BB89E04dF1C47d8a66855EB3",
            "decimals": 18
        },
        {
            "name": "BSCPad",
            "symbol": "BSCPAD",
            "address": "0x5A3010d4d8D3B5fB49f8B6E57FB9E48063f16700",
            "decimals": 18
        },
        {
            "name": "BSCEX",
            "symbol": "BSCX",
            "address": "0x5Ac52EE5b2a633895292Ff6d8A89bB9190451587",
            "decimals": 18
        },
        {
            "name": "Binance Pegged Bitcoin",
            "symbol": "BTCB",
            "address": "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
            "decimals": 18
        },
        {
            "name": "Standard BTC Hashrate Token",
            "symbol": "BTCST",
            "address": "0x78650B139471520656b9E7aA7A5e9276814a38e9",
            "decimals": 17
        },
        {
            "name": "Bittrue",
            "symbol": "BTR",
            "address": "0x5a16E8cE8cA316407c6E6307095dc9540a8D62B3",
            "decimals": 18
        },
        {
            "name": "Bittorrent",
            "symbol": "BTT",
            "address": "0x8595F9dA7b868b1822194fAEd312235E43007b49",
            "decimals": 18
        },
        {
            "name": "Bunny Token",
            "symbol": "BUNNY",
            "address": "0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51",
            "decimals": 18
        },
        {
            "name": "Burger Swap",
            "symbol": "BURGER",
            "address": "0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f",
            "decimals": 18
        },
        {
            "name": "Binance Pegged BUSD",
            "symbol": "BUSD",
            "address": "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "BUX",
            "symbol": "BUX",
            "address": "0x211FfbE424b90e25a15531ca322adF1559779E45",
            "decimals": 18
        },
        {
            "name": "Coin98",
            "symbol": "C98",
            "address": "0xaEC945e04baF28b135Fa7c640f624f8D90F1C3a6",
            "decimals": 18
        },
        {
            "name": "CanYaCoin",
            "symbol": "CAN",
            "address": "0x007EA5C0Ea75a8DF45D288a4debdD5bb633F9e56",
            "decimals": 18
        },
        {
            "name": "CryptoArt.ai",
            "symbol": "CART",
            "address": "0x5C8C8D560048F34E5f7f8ad71f2f81a89DBd273e",
            "decimals": 18
        },
        {
            "name": "ChainGuardians",
            "symbol": "CGG",
            "address": "0x1613957159E9B0ac6c80e824F7Eea748a32a0AE2",
            "decimals": 18
        },
        {
            "name": "Tranchess",
            "symbol": "CHESS",
            "address": "0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6",
            "decimals": 18
        },
        {
            "name": "Chromia",
            "symbol": "CHR",
            "address": "0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE",
            "decimals": 6
        },
        {
            "name": "Compound Finance",
            "symbol": "COMP",
            "address": "0x52CE071Bd9b1C4B00A0b92D298c512478CaD67e8",
            "decimals": 18
        },
        {
            "name": "Contentos",
            "symbol": "COS",
            "address": "0x96Dd399F9c3AFda1F194182F71600F1B65946501",
            "decimals": 18
        },
        {
            "name": "Cream",
            "symbol": "CREAM",
            "address": "0xd4CB328A82bDf5f03eB737f37Fa6B370aef3e888",
            "decimals": 18
        },
        {
            "name": "CertiK Token",
            "symbol": "CTK",
            "address": "0xA8c2B8eec3d368C0253ad3dae65a5F2BBB89c929",
            "decimals": 6
        },
        {
            "name": "Concentrated Voting Power",
            "symbol": "CVP",
            "address": "0x5Ec3AdBDae549Dce842e24480Eb2434769e22B2E",
            "decimals": 18
        },
        {
            "name": "Cyclone",
            "symbol": "CYC",
            "address": "0x810EE35443639348aDbbC467b33310d2AB43c168",
            "decimals": 18
        },
        {
            "name": "Binance Pegged DAI",
            "symbol": "DAI",
            "address": "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "Dego.Finance",
            "symbol": "DEGO",
            "address": "0x3FdA9383A84C05eC8f7630Fe10AdF1fAC13241CC",
            "decimals": 18
        },
        {
            "name": "Deri",
            "symbol": "DERI",
            "address": "0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5",
            "decimals": 18
        },
        {
            "name": "DeXe",
            "symbol": "DEXE",
            "address": "0x039cB485212f996A9DBb85A9a75d898F94d38dA6",
            "decimals": 18
        },
        {
            "name": "DefiDollar DAO",
            "symbol": "DFD",
            "address": "0x9899a98b222fCb2f3dbee7dF45d943093a4ff9ff",
            "decimals": 18
        },
        {
            "name": "DFuture",
            "symbol": "DFT",
            "address": "0x42712dF5009c20fee340B245b510c0395896cF6e",
            "decimals": 18
        },
        {
            "name": "Decentral Games",
            "symbol": "DG",
            "address": "0x9Fdc3ae5c814b79dcA2556564047C5e7e5449C19",
            "decimals": 18
        },
        {
            "name": "Ditto",
            "symbol": "DITTO",
            "address": "0x233d91A0713155003fc4DcE0AFa871b508B3B715",
            "decimals": 9
        },
        {
            "name": "Dodo",
            "symbol": "DODO",
            "address": "0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2",
            "decimals": 18
        },
        {
            "name": "Dogecoin",
            "symbol": "DOGE",
            "address": "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
            "decimals": 8
        },
        {
            "name": "Dopple Finance",
            "symbol": "DOP",
            "address": "0x844FA82f1E54824655470970F7004Dd90546bB28",
            "decimals": 18
        },
        {
            "name": "Polkadot Token",
            "symbol": "DOT",
            "address": "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
            "decimals": 18
        },
        {
            "name": "Dusk",
            "symbol": "DUSK",
            "address": "0xB2BD0749DBE21f623d9BABa856D3B0f0e1BFEc9C",
            "decimals": 18
        },
        {
            "name": "Dvision Network",
            "symbol": "DVI",
            "address": "0x758FB037A375F17c7e195CC634D77dA4F554255B",
            "decimals": 18
        },
        {
            "name": "Elrond",
            "symbol": "EGLD",
            "address": "0xbF7c81FFF98BbE61B40Ed186e4AfD6DDd01337fe",
            "decimals": 18
        },
        {
            "name": "EOS Token",
            "symbol": "EOS",
            "address": "0x56b6fB708fC5732DEC1Afc8D8556423A2EDcCbD6",
            "decimals": 18
        },
        {
            "name": "Ellipsis",
            "symbol": "EPS",
            "address": "0xA7f552078dcC247C2684336020c03648500C6d9F",
            "decimals": 18
        },
        {
            "name": "Binance Pegged ETH",
            "symbol": "ETH",
            "address": "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
            "decimals": 18
        },
        {
            "name": "Easy V2",
            "symbol": "EZ",
            "address": "0x5512014efa6Cd57764Fa743756F7a6Ce3358cC83",
            "decimals": 18
        },
        {
            "name": "Filecoin",
            "symbol": "FIL",
            "address": "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
            "decimals": 18
        },
        {
            "name": "Refinable",
            "symbol": "FINE",
            "address": "0x4e6415a5727ea08aAE4580057187923aeC331227",
            "decimals": 18
        },
        {
            "name": "ForTube",
            "symbol": "FOR",
            "address": "0x658A109C5900BC6d2357c87549B651670E5b0539",
            "decimals": 18
        },
        {
            "name": "Formation Finance",
            "symbol": "FORM",
            "address": "0x25A528af62e56512A19ce8c3cAB427807c28CC19",
            "decimals": 18
        },
        {
            "name": "fry.world",
            "symbol": "FRIES",
            "address": "0x393B312C01048b3ed2720bF1B090084C09e408A1",
            "decimals": 18
        },
        {
            "name": "Frontier Token",
            "symbol": "FRONT",
            "address": "0x928e55daB735aa8260AF3cEDadA18B5f70C72f1b",
            "decimals": 18
        },
        {
            "name": "Fuel",
            "symbol": "FUEL",
            "address": "0x2090c8295769791ab7A3CF1CC6e0AA19F35e441A",
            "decimals": 18
        },
        {
            "name": "GreenTrust",
            "symbol": "GNT",
            "address": "0xF750A26EB0aCf95556e8529E72eD530f3b60f348",
            "decimals": 18
        },
        {
            "name": "Gourmet Galaxy",
            "symbol": "GUM",
            "address": "0xc53708664b99DF348dd27C3Ac0759d2DA9c40462",
            "decimals": 18
        },
        {
            "name": "Hacken",
            "symbol": "HAI",
            "address": "0xaA9E582e5751d703F85912903bacADdFed26484C",
            "decimals": 8
        },
        {
            "name": "Hakka Finance",
            "symbol": "HAKKA",
            "address": "0x1D1eb8E8293222e1a29d2C0E4cE6C0Acfd89AaaC",
            "decimals": 18
        },
        {
            "name": "HARD",
            "symbol": "HARD",
            "address": "0xf79037F6f6bE66832DE4E7516be52826BC3cBcc4",
            "decimals": 6
        },
        {
            "name": "Helmet.insure",
            "symbol": "Helmet",
            "address": "0x948d2a81086A075b3130BAc19e4c6DEe1D2E3fE8",
            "decimals": 18
        },
        {
            "name": "MetaHero",
            "symbol": "HERO",
            "address": "0xD40bEDb44C081D2935eebA6eF5a3c8A31A1bBE13",
            "decimals": 18
        },
        {
            "name": "StepHero",
            "symbol": "HERO",
            "address": "0xE8176d414560cFE1Bf82Fd73B986823B89E4F545",
            "decimals": 18
        },
        {
            "name": "Hedget",
            "symbol": "HGET",
            "address": "0xC7d8D35EBA58a0935ff2D5a33Df105DD9f071731",
            "decimals": 6
        },
        {
            "name": "Hoo",
            "symbol": "HOO",
            "address": "0xE1d1F66215998786110Ba0102ef558b22224C016",
            "decimals": 8
        },
        {
            "name": "Hot Cross Token",
            "symbol": "HOTCROSS",
            "address": "0x4FA7163E153419E0E1064e418dd7A99314Ed27b6",
            "decimals": 18
        },
        {
            "name": "Hotbit",
            "symbol": "HTB",
            "address": "0x4e840AADD28DA189B9906674B4Afcb77C128d9ea",
            "decimals": 18
        },
        {
            "name": "HYFI",
            "symbol": "HYFI",
            "address": "0x9a319b959e33369C5eaA494a770117eE3e585318",
            "decimals": 18
        },
        {
            "name": "Horizon Protocol",
            "symbol": "HZN",
            "address": "0xC0eFf7749b125444953ef89682201Fb8c6A917CD",
            "decimals": 18
        },
        {
            "name": "Impossible Finance",
            "symbol": "IF",
            "address": "0xB0e1fc65C1a741b4662B813eB787d369b8614Af1",
            "decimals": 18
        },
        {
            "name": "Injective Protocol",
            "symbol": "INJ",
            "address": "0xa2B726B1145A4773F68593CF171187d8EBe4d495",
            "decimals": 18
        },
        {
            "name": "IoTeX",
            "symbol": "IOTX",
            "address": "0x9678E42ceBEb63F23197D726B29b1CB20d0064E5",
            "decimals": 18
        },
        {
            "name": "Itam",
            "symbol": "ITAM",
            "address": "0x04C747b40Be4D535fC83D09939fb0f626F32800B",
            "decimals": 18
        },
        {
            "name": "Juggernaut Finance",
            "symbol": "JGN",
            "address": "0xC13B7a43223BB9Bf4B69BD68Ab20ca1B79d81C75",
            "decimals": 18
        },
        {
            "name": "Juventus",
            "symbol": "JUV",
            "address": "0xC40C9A843E1c6D01b7578284a9028854f6683b1B",
            "decimals": 2
        },
        {
            "name": "Kalmar",
            "symbol": "KALM",
            "address": "0x4BA0057f784858a48fe351445C672FF2a3d43515",
            "decimals": 18
        },
        {
            "name": "KAVA",
            "symbol": "KAVA",
            "address": "0x5F88AB06e8dfe89DF127B2430Bba4Af600866035",
            "decimals": 6
        },
        {
            "name": "Kattana",
            "symbol": "KTN",
            "address": "0xDAe6c2A48BFAA66b43815c5548b10800919c993E",
            "decimals": 18
        },
        {
            "name": "Qian Governance Token",
            "symbol": "KUN",
            "address": "0x1A2fb0Af670D0234c2857FaD35b789F8Cb725584",
            "decimals": 18
        },
        {
            "name": "FC Lazio Fan Token",
            "symbol": "LAZIO",
            "address": "0x77d547256A2cD95F32F67aE0313E450Ac200648d",
            "decimals": 8
        },
        {
            "name": "Lien",
            "symbol": "LIEN",
            "address": "0x5d684ADaf3FcFe9CFb5ceDe3abf02F0Cdd1012E3",
            "decimals": 8
        },
        {
            "name": "Lightning",
            "symbol": "LIGHT",
            "address": "0x037838b556d9c9d654148a284682C55bB5f56eF4",
            "decimals": 18
        },
        {
            "name": "Linear Finance",
            "symbol": "LINA",
            "address": "0x762539b45A1dCcE3D36d080F74d1AED37844b878",
            "decimals": 18
        },
        {
            "name": "ChainLink Token",
            "symbol": "LINK",
            "address": "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
            "decimals": 18
        },
        {
            "name": "Litentry",
            "symbol": "LIT",
            "address": "0xb59490aB09A0f526Cc7305822aC65f2Ab12f9723",
            "decimals": 18
        },
        {
            "name": "Lympo Market Token",
            "symbol": "LMT",
            "address": "0x9617857E191354dbEA0b714d78Bc59e57C411087",
            "decimals": 18
        },
        {
            "name": "Litecoin Token",
            "symbol": "LTC",
            "address": "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
            "decimals": 18
        },
        {
            "name": "LTO Network",
            "symbol": "LTO",
            "address": "0x857B222Fc79e1cBBf8Ca5f78CB133d1b7CF34BBd",
            "decimals": 18
        },
        {
            "name": "lUSD",
            "symbol": "lUSD",
            "address": "0x23e8a70534308a4AAF76fb8C32ec13d17a3BD89e",
            "decimals": 18
        },
        {
            "name": "Mirror AMZN Token",
            "symbol": "mAMZN",
            "address": "0x3947B992DC0147D2D89dF0392213781b04B25075",
            "decimals": 18
        },
        {
            "name": "Unmarshal",
            "symbol": "MARSH",
            "address": "0x2FA5dAF6Fe0708fBD63b1A7D1592577284f52256",
            "decimals": 18
        },
        {
            "name": "Mask Network",
            "symbol": "MASK",
            "address": "0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3",
            "decimals": 18
        },
        {
            "name": "Math",
            "symbol": "MATH",
            "address": "0xF218184Af829Cf2b0019F8E6F0b2423498a36983",
            "decimals": 18
        },
        {
            "name": "Mobox",
            "symbol": "MBOX",
            "address": "0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377",
            "decimals": 18
        },
        {
            "name": "MCDEX",
            "symbol": "MCB",
            "address": "0x5fE80d2CD054645b9419657d3d10d26391780A7B",
            "decimals": 18
        },
        {
            "name": "Mirror COIN",
            "symbol": "mCOIN",
            "address": "0x49022089e78a8D46Ec87A3AF86a1Db6c189aFA6f",
            "decimals": 18
        },
        {
            "name": "MacaronSwap",
            "symbol": "MCRN",
            "address": "0xacb2d47827C9813AE26De80965845D80935afd0B",
            "decimals": 18
        },
        {
            "name": "Mirror GOOGL Token",
            "symbol": "mGOOGL",
            "address": "0x62D71B23bF15218C7d2D7E48DBbD9e9c650B173f",
            "decimals": 18
        },
        {
            "name": "Mirror Finance",
            "symbol": "MIR",
            "address": "0x5B6DcF557E2aBE2323c48445E8CC948910d8c2c9",
            "decimals": 18
        },
        {
            "name": "Mix",
            "symbol": "MIX",
            "address": "0xB67754f5b4C704A24d2db68e661b2875a4dDD197",
            "decimals": 18
        },
        {
            "name": "Mirror NFLX Token",
            "symbol": "mNFLX",
            "address": "0xa04F060077D90Fe2647B61e4dA4aD1F97d6649dc",
            "decimals": 18
        },
        {
            "name": "Meter",
            "symbol": "MTRG",
            "address": "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F",
            "decimals": 18
        },
        {
            "name": "Mirror TSLA Token",
            "symbol": "mTSLA",
            "address": "0xF215A127A196e3988C09d052e16BcFD365Cd7AA3",
            "decimals": 18
        },
        {
            "name": "MX Token",
            "symbol": "MX",
            "address": "0x9F882567A62a5560d147d64871776EeA72Df41D3",
            "decimals": 18
        },
        {
            "name": "NAOS Finance",
            "symbol": "NAOS",
            "address": "0x758d08864fB6cCE3062667225ca10b8F00496cc2",
            "decimals": 18
        },
        {
            "name": "NAR Token",
            "symbol": "NAR",
            "address": "0xA1303E6199b319a891b79685F0537D289af1FC83",
            "decimals": 18
        },
        {
            "name": "APENFT",
            "symbol": "NFT",
            "address": "0x1fC9004eC7E5722891f5f38baE7678efCB11d34D",
            "decimals": 6
        },
        {
            "name": "Nerve Finance",
            "symbol": "NRV",
            "address": "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096",
            "decimals": 18
        },
        {
            "name": "Nuls",
            "symbol": "NULS",
            "address": "0x8CD6e29d3686d24d3C2018CEe54621eA0f89313B",
            "decimals": 8
        },
        {
            "name": "NerveNetwork",
            "symbol": "NVT",
            "address": "0xf0E406c49C63AbF358030A299C0E00118C4C6BA5",
            "decimals": 8
        },
        {
            "name": "Nyanswop Token",
            "symbol": "NYA",
            "address": "0xbFa0841F7a90c4CE6643f651756EE340991F99D5",
            "decimals": 18
        },
        {
            "name": "O3 Swap",
            "symbol": "O3",
            "address": "0xEe9801669C6138E84bD50dEB500827b776777d28",
            "decimals": 18
        },
        {
            "name": "Oddz",
            "symbol": "ODDZ",
            "address": "0xCD40F2670CF58720b694968698A5514e924F742d",
            "decimals": 18
        },
        {
            "name": "OG",
            "symbol": "OG",
            "address": "0xf05E45aD22150677a017Fbd94b84fBB63dc9b44c",
            "decimals": 2
        },
        {
            "name": "Oin Finance",
            "symbol": "OIN",
            "address": "0x658E64FFcF40D240A43D52CA9342140316Ae44fA",
            "decimals": 8
        },
        {
            "name": "Harmony One",
            "symbol": "ONE",
            "address": "0x03fF0ff224f904be3118461335064bB48Df47938",
            "decimals": 18
        },
        {
            "name": "BigOne Token",
            "symbol": "ONE",
            "address": "0x04BAf95Fd4C52fd09a56D840bAEe0AB8D7357bf0",
            "decimals": 18
        },
        {
            "name": "Ontology Token",
            "symbol": "ONT",
            "address": "0xFd7B3A77848f1C2D67E05E54d78d174a0C850335",
            "decimals": 18
        },
        {
            "name": "The Orbs Network",
            "symbol": "ORBS",
            "address": "0xeBd49b26169e1b52c04cFd19FCf289405dF55F80",
            "decimals": 18
        },
        {
            "name": "pBTC",
            "symbol": "pBTC",
            "address": "0xeD28A457A5A76596ac48d87C0f577020F6Ea1c4C",
            "decimals": 18
        },
        {
            "name": "PolyCrowns",
            "symbol": "pCWS",
            "address": "0xbcf39F0EDDa668C58371E519AF37CA705f2bFcbd",
            "decimals": 18
        },
        {
            "name": "Perlin X",
            "symbol": "PERL",
            "address": "0x0F9E4D49f25de22c2202aF916B681FBB3790497B",
            "decimals": 18
        },
        {
            "name": "Phala Network",
            "symbol": "PHA",
            "address": "0x0112e557d400474717056C4e6D40eDD846F38351",
            "decimals": 18
        },
        {
            "name": "Polkamon",
            "symbol": "PMON",
            "address": "0x1796ae0b0fa4862485106a0de9b654eFE301D0b2",
            "decimals": 18
        },
        {
            "name": "PNT",
            "symbol": "PNT",
            "address": "0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92",
            "decimals": 18
        },
        {
            "name": "pTokens OPEN",
            "symbol": "pOPEN",
            "address": "0xaBaE871B7E3b67aEeC6B46AE9FE1A91660AadAC5",
            "decimals": 18
        },
        {
            "name": "Moonpot",
            "symbol": "POTS",
            "address": "0x3Fcca8648651E5b974DD6d3e50F61567779772A8",
            "decimals": 18
        },
        {
            "name": "Prometeus",
            "symbol": "PROM",
            "address": "0xaF53d56ff99f1322515E54FdDE93FF8b3b7DAFd5",
            "decimals": 18
        },
        {
            "name": "Prosper",
            "symbol": "PROS",
            "address": "0xEd8c8Aa8299C10f067496BB66f8cC7Fb338A3405",
            "decimals": 18
        },
        {
            "name": "Paris Saint-Germain",
            "symbol": "PSG",
            "address": "0xBc5609612b7C44BEf426De600B5fd1379DB2EcF1",
            "decimals": 2
        },
        {
            "name": "Qubit Token",
            "symbol": "QBT",
            "address": "0x17B7163cf1Dbd286E262ddc68b553D899B93f526",
            "decimals": 18
        },
        {
            "name": "QuarkChain Token",
            "symbol": "QKC",
            "address": "0xA1434F1FC3F437fa33F7a781E041961C0205B5Da",
            "decimals": 18
        },
        {
            "name": "QIAN second generation dollar",
            "symbol": "QSD",
            "address": "0x07AaA29E63FFEB2EBf59B33eE61437E1a91A3bb2",
            "decimals": 18
        },
        {
            "name": "QUSD Stablecoin",
            "symbol": "QUSD",
            "address": "0xb8C540d00dd0Bf76ea12E4B4B95eFC90804f924E",
            "decimals": 18
        },
        {
            "name": "Rabbit Finance",
            "symbol": "RABBIT",
            "address": "0x95a1199EBA84ac5f19546519e287d43D2F0E1b41",
            "decimals": 18
        },
        {
            "name": "Ramp DEFI",
            "symbol": "RAMP",
            "address": "0x8519EA49c997f50cefFa444d240fB655e89248Aa",
            "decimals": 18
        },
        {
            "name": "Reef",
            "symbol": "REEF",
            "address": "0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e",
            "decimals": 18
        },
        {
            "name": "renBTC",
            "symbol": "renBTC",
            "address": "0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c",
            "decimals": 8
        },
        {
            "name": "renDOGE",
            "symbol": "renDOGE",
            "address": "0xc3fEd6eB39178A541D274e6Fc748d48f0Ca01CC3",
            "decimals": 8
        },
        {
            "name": "renZEC",
            "symbol": "renZEC",
            "address": "0x695FD30aF473F2960e81Dc9bA7cB67679d35EDb7",
            "decimals": 8
        },
        {
            "name": "REVV",
            "symbol": "REVV",
            "address": "0x833F307aC507D47309fD8CDD1F835BeF8D702a93",
            "decimals": 18
        },
        {
            "name": "RFOX",
            "symbol": "RFOX",
            "address": "0x0a3A21356793B49154Fd3BbE91CBc2A16c0457f5",
            "decimals": 18
        },
        {
            "name": "Rangers Protocol",
            "symbol": "RPG",
            "address": "0xc2098a8938119A52B1F7661893c0153A6CB116d5",
            "decimals": 18
        },
        {
            "name": "rUSD",
            "symbol": "rUSD",
            "address": "0x07663837218A003e66310a01596af4bf4e44623D",
            "decimals": 18
        },
        {
            "name": "SafeMoon",
            "symbol": "SAFEMOON",
            "address": "0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3",
            "decimals": 9
        },
        {
            "name": "bDollar Share",
            "symbol": "sBDO",
            "address": "0x0d9319565be7f53CeFE84Ad201Be3f40feAE2740",
            "decimals": 18
        },
        {
            "name": "SafePal Token",
            "symbol": "SFP",
            "address": "0xD41FDb03Ba84762dD66a0af1a6C8540FF1ba5dfb",
            "decimals": 18
        },
        {
            "name": "Seedify",
            "symbol": "SFUND",
            "address": "0x477bC8d23c634C154061869478bce96BE6045D12",
            "decimals": 18
        },
        {
            "name": "CryptoBlades Skill Token",
            "symbol": "SKILL",
            "address": "0x154A9F9cbd3449AD22FDaE23044319D6eF2a1Fab",
            "decimals": 18
        },
        {
            "name": "SPARTAN PROTOCOL TOKEN",
            "symbol": "SPARTA",
            "address": "0x3910db0600eA925F63C36DdB1351aB6E2c6eb102",
            "decimals": 18
        },
        {
            "name": "Splintershards",
            "symbol": "SPS",
            "address": "0x1633b7157e7638C4d6593436111Bf125Ee74703F",
            "decimals": 18
        },
        {
            "name": "StableXSwap",
            "symbol": "STAX",
            "address": "0x0Da6Ed8B13214Ff28e9Ca979Dd37439e8a88F6c4",
            "decimals": 18
        },
        {
            "name": "Sushi",
            "symbol": "SUSHI",
            "address": "0x947950BcC74888a40Ffa2593C5798F11Fc9124C4",
            "decimals": 18
        },
        {
            "name": "Suterusu",
            "symbol": "SUTER",
            "address": "0x4CfbBdfBd5BF0814472fF35C72717Bd095ADa055",
            "decimals": 18
        },
        {
            "name": "Swampy",
            "symbol": "SWAMP",
            "address": "0xc5A49b4CBe004b6FD55B30Ba1dE6AC360FF9765d",
            "decimals": 18
        },
        {
            "name": "SWGToken",
            "symbol": "SWG",
            "address": "0xe792f64C582698b8572AAF765bDC426AC3aEfb6B",
            "decimals": 18
        },
        {
            "name": "Swingby",
            "symbol": "SWINGBY",
            "address": "0x71DE20e0C4616E7fcBfDD3f875d568492cBE4739",
            "decimals": 18
        },
        {
            "name": "Switcheo",
            "symbol": "SWTH",
            "address": "0x250b211EE44459dAd5Cd3bCa803dD6a7EcB5d46C",
            "decimals": 8
        },
        {
            "name": "Swipe",
            "symbol": "SXP",
            "address": "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
            "decimals": 18
        },
        {
            "name": "Tau Bitcoin",
            "symbol": "tBTC",
            "address": "0x2cD1075682b0FCCaADd0Ca629e138E64015Ba11c",
            "decimals": 9
        },
        {
            "name": "Tau DOGE",
            "symbol": "tDOGE",
            "address": "0xe550a593d09FBC8DCD557b5C88Cea6946A8b404A",
            "decimals": 8
        },
        {
            "name": "Tenet",
            "symbol": "TEN",
            "address": "0xdFF8cb622790b7F92686c722b02CaB55592f152C",
            "decimals": 18
        },
        {
            "name": "TitanSwap",
            "symbol": "TITAN",
            "address": "0xe898EDc43920F357A93083F1d4460437dE6dAeC2",
            "decimals": 18
        },
        {
            "name": "TokoCrypto",
            "symbol": "TKO",
            "address": "0x9f589e3eabe42ebC94A44727b3f3531C0c877809",
            "decimals": 18
        },
        {
            "name": "Alien Worlds",
            "symbol": "TLM",
            "address": "0x2222227E22102Fe3322098e4CBfE18cFebD57c95",
            "decimals": 4
        },
        {
            "name": "Telos",
            "symbol": "TLOS",
            "address": "0xb6C53431608E626AC81a9776ac3e999c5556717c",
            "decimals": 18
        },
        {
            "name": "TokenPocket",
            "symbol": "TPT",
            "address": "0xECa41281c24451168a37211F0bc2b8645AF45092",
            "decimals": 4
        },
        {
            "name": "Unitrade",
            "symbol": "TRADE",
            "address": "0x7af173F350D916358AF3e218Bdf2178494Beb748",
            "decimals": 18
        },
        {
            "name": "Tron",
            "symbol": "TRX",
            "address": "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
            "decimals": 18
        },
        {
            "name": "True USD",
            "symbol": "TUSD",
            "address": "0x14016E85a25aeb13065688cAFB43044C2ef86784",
            "decimals": 18
        },
        {
            "name": "Trust Wallet",
            "symbol": "TWT",
            "address": "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
            "decimals": 18
        },
        {
            "name": "Tixl",
            "symbol": "TXL",
            "address": "0x1FFD0b47127fdd4097E54521C9E2c7f0D66AafC5",
            "decimals": 18
        },
        {
            "name": "UpBots",
            "symbol": "UBXT",
            "address": "0xBbEB90cFb6FAFa1F69AA130B7341089AbeEF5811",
            "decimals": 18
        },
        {
            "name": "Unifi Token",
            "symbol": "UNFI",
            "address": "0x728C5baC3C3e370E372Fc4671f9ef6916b814d8B",
            "decimals": 18
        },
        {
            "name": "Uniswap",
            "symbol": "UNI",
            "address": "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
            "decimals": 18
        },
        {
            "name": "Binance Pegged USD Coin",
            "symbol": "USDC",
            "address": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
            "decimals": 18
        },
        {
            "name": "Binance Pegged USDT",
            "symbol": "USDT",
            "address": "0x55d398326f99059fF775485246999027B3197955",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "USDX",
            "symbol": "USDX",
            "address": "0x1203355742e76875154C0D13eB81DCD7711dC7d9",
            "decimals": 6
        },
        {
            "name": "UST Token",
            "symbol": "UST",
            "address": "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",
            "decimals": 18
        },
        {
            "name": "VAI Stablecoin",
            "symbol": "VAI",
            "address": "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
            "decimals": 18
        },
        {
            "name": "Venus Reward Token",
            "symbol": "VRT",
            "address": "0x5F84ce30DC3cF7909101C69086c50De191895883",
            "decimals": 18
        },
        {
            "name": "Yieldwatch",
            "symbol": "WATCH",
            "address": "0x7A9f28EB62C791422Aa23CeAE1dA9C847cBeC9b0",
            "decimals": 18
        },
        {
            "name": "Wault",
            "symbol": "WAULTx",
            "address": "0xB64E638E60D154B43f660a6BF8fD8a3b249a6a21",
            "decimals": 18
        },
        {
            "name": "WBNB Token",
            "symbol": "WBNB",
            "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "name": "BitWell Token",
            "symbol": "WELL",
            "address": "0xf07a32Eb035b786898c00bB1C64d8c6F8E7a46D5",
            "decimals": 18
        },
        {
            "name": "WaultSwap",
            "symbol": "WEX",
            "address": "0xa9c41A46a6B3531d28d5c32F6633dd2fF05dFB90",
            "decimals": 18
        },
        {
            "name": "WINk",
            "symbol": "WIN",
            "address": "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
            "decimals": 18
        },
        {
            "name": "Wrapped MASS",
            "symbol": "WMASS",
            "address": "0x7e396BfC8a2f84748701167c2d622F041A1D7a17",
            "decimals": 8
        },
        {
            "name": "Wootrade",
            "symbol": "WOO",
            "address": "0x4691937a7508860F876c9c0a2a617E7d9E945D4B",
            "decimals": 18
        },
        {
            "name": "Wall Street Games",
            "symbol": "WSG",
            "address": "0xA58950F05FeA2277d2608748412bf9F802eA4901",
            "decimals": 18
        },
        {
            "name": "Soteria",
            "symbol": "wSOTE",
            "address": "0x541E619858737031A1244A5d0Cd47E5ef480342c",
            "decimals": 18
        },
        {
            "name": "Xcademy",
            "symbol": "XCAD",
            "address": "0x431e0cD023a32532BF3969CddFc002c00E98429d",
            "decimals": 18
        },
        {
            "name": "Exeedme",
            "symbol": "XED",
            "address": "0x5621b5A3f4a8008c4CCDd1b942B121c8B1944F1f",
            "decimals": 18
        },
        {
            "name": "XEND",
            "symbol": "XEND",
            "address": "0x4a080377f83D669D7bB83B3184a8A5E61B500608",
            "decimals": 18
        },
        {
            "name": "xMARK",
            "symbol": "xMARK",
            "address": "0x26A5dFab467d4f58fB266648CAe769503CEC9580",
            "decimals": 9
        },
        {
            "name": "XRP Token",
            "symbol": "XRP",
            "address": "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
            "decimals": 18
        },
        {
            "name": "Tezos Token",
            "symbol": "XTZ",
            "address": "0x16939ef78684453bfDFb47825F8a5F714f12623a",
            "decimals": 18
        },
        {
            "name": "Venus Token",
            "symbol": "XVS",
            "address": "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
            "decimals": 18
        },
        {
            "name": "yearn.finance",
            "symbol": "YFI",
            "address": "0x88f1A5ae2A3BF98AEAF342D26B30a79438c9142e",
            "decimals": 18
        },
        {
            "name": "YFII.finance Token",
            "symbol": "YFII",
            "address": "0x7F70642d88cf1C4a3a7abb072B53B929b653edA5",
            "decimals": 18
        },
        {
            "name": "Zcash Token",
            "symbol": "ZEC",
            "address": "0x1Ba42e5193dfA8B03D15dd1B86a3113bbBEF8Eeb",
            "decimals": 18
        },
        {
            "name": "ZeroSwapToken",
            "symbol": "ZEE",
            "address": "0x44754455564474A89358B2C2265883DF993b12F0",
            "decimals": 18
        },
        {
            "name": "Zilliqa",
            "symbol": "ZIL",
            "address": "0xb86AbCb37C3A4B64f74f59301AFF131a1BEcC787",
            "decimals": 12
        },
        {
            "name": "openANX Token",
            "symbol": "OAX",
            "address": "0x31720B2276Df3b3B757B55845d17Eea184d4fc8f",
            "decimals": 18
        },
        {
            "name": "Impossible Decentralized Incubator Access Token",
            "symbol": "IDIA",
            "address": "0x0b15Ddf19D47E6a86A56148fb4aFFFc6929BcB89",
            "decimals": 18
        },
        {
            "name": "Biswap",
            "symbol": "BSW",
            "address": "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
            "decimals": 18
        },
        {
            "name": "OpenSwap Booster - IDIA Series #1",
            "symbol": "bqIDIA1",
            "address": "0x46c5BC0656301c3DFb8EF8fc44CfBF89ef121348",
            "decimals": 18
        },
        {
            "name": "OGS",
            "symbol": "OGS",
            "address": "0x416947e6Fc78F158fd9B775fA846B72d768879c2",
            "decimals": 18
        },
        {
            "name": "dummy BVR",
            "symbol": "dBVR",
            "address": "0x16C5e51BFa38a6dD109bcc4921a92AEF13B14Ed9",
            "decimals": 18
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/mainnet/fantom.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Fantom = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/mainnet/fantom.ts'/> 
    exports.Tokens_Fantom = [
        {
            "address": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
            "name": "Wrapped Fantom",
            "symbol": "WFTM",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        { "address": "0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7", "name": "TOMB", "symbol": "TOMB", "decimals": 18 },
        { "address": "0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37", "name": "TSHARE", "symbol": "TSHARE", "decimals": 18 },
        { "address": "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", "name": "USD Coin", "symbol": "USDC", "decimals": 6, "isCommon": true },
        { "address": "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE", "name": "SpookyToken", "symbol": "BOO", "decimals": 18 },
        { "address": "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", "name": "Dai Stablecoin", "symbol": "DAI", "decimals": 18 },
        { "address": "0x74b23882a30290451A17c44f4F05243b6b58C76d", "name": "Ethereum", "symbol": "ETH", "decimals": 18 },
        { "address": "0x321162Cd933E2Be498Cd2267a90534A804051b11", "name": "Bitcoin", "symbol": "BTC", "decimals": 8 },
        { "address": "0x049d68029688eAbF473097a2fC38ef61633A3C7A", "name": "Frapped USDT", "symbol": "fUSDT", "decimals": 6 },
        { "address": "0x82f0B8B456c1A451378467398982d4834b6829c1", "name": "Magic Internet Money", "symbol": "MIM", "decimals": 18 },
        { "address": "0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475", "name": "Scream", "symbol": "SCREAM", "decimals": 18 },
        { "address": "0x5602df4A94eB6C680190ACCFA2A475621E0ddBdc", "name": "Spartacus", "symbol": "SPA", "decimals": 9 },
        { "address": "0xd8321AA83Fb0a4ECd6348D4577431310A6E0814d", "name": "Geist.Finance Protocol Token", "symbol": "GEIST", "decimals": 18 },
        { "address": "0xD67de0e0a0Fd7b15dC8348Bb9BE742F3c5850454", "name": "Binance", "symbol": "BNB", "decimals": 18 },
        { "address": "0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0", "name": "Hector", "symbol": "HEC", "decimals": 9 },
        { "address": "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8", "name": "ChainLink", "symbol": "LINK", "decimals": 18 },
        { "address": "0x9879aBDea01a879644185341F7aF7d8343556B7a", "name": "TrueUSD", "symbol": "TUSD", "decimals": 18 },
        { "address": "0xfB98B335551a418cD0737375a2ea0ded62Ea213b", "name": "miMATIC", "symbol": "miMATIC", "decimals": 18 },
        { "address": "0xae75A438b2E0cB8Bb01Ec1E1e376De11D44477CC", "name": "Sushi", "symbol": "SUSHI", "decimals": 18 },
        { "address": "0xdDcb3fFD12750B45d32E084887fdf1aABAb34239", "name": "Anyswap", "symbol": "ANY", "decimals": 18 },
        { "address": "0x511D35c52a3C244E7b8bd92c0C297755FbD89212", "name": "Avalanche", "symbol": "AVAX", "decimals": 18 },
        { "address": "0x468003B688943977e6130F4F68F23aad939a1040", "name": "Spell Token", "symbol": "SPELL", "decimals": 18 },
        { "address": "0x5Cc61A78F164885776AA610fb0FE1257df78E59B", "name": "SpiritSwap Token", "symbol": "SPIRIT", "decimals": 18 },
        { "address": "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9", "name": "Liquid Driver", "symbol": "LQDR", "decimals": 18 },
        { "address": "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355", "name": "Frax", "symbol": "FRAX", "decimals": 18 }
    ];
});
define("@scom/scom-gem-token/store/tokens/mainnet/cronos.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Cronos = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/mainnet/cronos.ts'/> 
    exports.Tokens_Cronos = [
        {
            "address": "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
            "name": "WCRO",
            "symbol": "WCRO",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "address": "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
            "name": "WETH",
            "symbol": "WCRO",
            "decimals": 18,
            "isCommon": true
        },
        {
            "address": "0x062E66477Faf219F25D27dCED647BF57C3107d52",
            "name": "WBTC",
            "symbol": "WBTC",
            "decimals": 8,
            "isCommon": true
        },
        {
            "address": "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
            "name": "USDC",
            "symbol": "USDC",
            "decimals": 6,
            "isCommon": true
        },
        {
            "address": "0x66e428c3f67a68878562e79A0234c1F83c208770",
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 6,
            "isCommon": true
        },
        {
            "address": "0xF2001B145b43032AAF5Ee2884e456CCd805F677D",
            "name": "DAI",
            "symbol": "DAI",
            "decimals": 18,
            "isCommon": true
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/mainnet/index.ts", ["require", "exports", "@scom/scom-gem-token/store/tokens/mainnet/avalanche.ts", "@scom/scom-gem-token/store/tokens/mainnet/ethereum.ts", "@scom/scom-gem-token/store/tokens/mainnet/polygon.ts", "@scom/scom-gem-token/store/tokens/mainnet/bsc.ts", "@scom/scom-gem-token/store/tokens/mainnet/fantom.ts", "@scom/scom-gem-token/store/tokens/mainnet/cronos.ts"], function (require, exports, avalanche_1, ethereum_1, polygon_1, bsc_1, fantom_1, cronos_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Cronos = exports.Tokens_Fantom = exports.Tokens_BSC = exports.Tokens_Polygon = exports.Tokens_Ethereuem = exports.Tokens_Avalanche = void 0;
    Object.defineProperty(exports, "Tokens_Avalanche", { enumerable: true, get: function () { return avalanche_1.Tokens_Avalanche; } });
    Object.defineProperty(exports, "Tokens_Ethereuem", { enumerable: true, get: function () { return ethereum_1.Tokens_Ethereuem; } });
    Object.defineProperty(exports, "Tokens_Polygon", { enumerable: true, get: function () { return polygon_1.Tokens_Polygon; } });
    Object.defineProperty(exports, "Tokens_BSC", { enumerable: true, get: function () { return bsc_1.Tokens_BSC; } });
    Object.defineProperty(exports, "Tokens_Fantom", { enumerable: true, get: function () { return fantom_1.Tokens_Fantom; } });
    Object.defineProperty(exports, "Tokens_Cronos", { enumerable: true, get: function () { return cronos_1.Tokens_Cronos; } });
});
define("@scom/scom-gem-token/store/tokens/testnet/kovan.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Kovan = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/kovan.ts'/> 
    exports.Tokens_Kovan = [
        {
            "name": "Wrapped ETH",
            "address": "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
            "symbol": "WETH",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "name": "USDC",
            "address": "0xe7EB1b3f0b7f287a93c34A313552974669C425B6",
            "symbol": "USDC",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "USDT",
            "address": "0xDcdAFd9461c2df544F6E2165481E8174e45fEbD8",
            "symbol": "USDT",
            "decimals": 6,
            "isCommon": true,
            "isVaultToken": true
        },
        {
            "name": "DAI",
            "address": "0x25b061e0fcBB2Fbe38A5e669957eFF3DFE03d28f",
            "symbol": "DAI",
            "decimals": 18
        },
        {
            "name": "openANX Token",
            "address": "0xbe01a8e3F1E3841ccbf6eeEB09215A3a3bdBe336",
            "symbol": "OAX",
            "decimals": 18
        },
        {
            "name": "CAKE",
            "address": "0x5f33463E584D7D2Caa50b597984F0C4512A79aaf",
            "symbol": "CAKE",
            "decimals": 18
        },
        {
            "name": "Uniswap",
            "symbol": "UNI",
            "address": "0xB409C977546d60BFBcd235Bb6cDfB71b1364e509",
            "decimals": 18
        },
        {
            "name": "OpenSwap",
            "address": "0x28A6a9079fA8e041179cD13F4652af2B315b6fd8",
            "symbol": "OSWAP",
            "decimals": 18
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/bsc-testnet.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_BSC_Testnet = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/bsc-testnet.ts'/> 
    exports.Tokens_BSC_Testnet = [
        {
            "name": "Wrapped BNB",
            "address": "0xae13d989dac2f0debff460ac112a837c89baa7cd",
            "symbol": "WBNB",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "name": "USDT",
            "address": "0x29386B60e0A9A1a30e1488ADA47256577ca2C385",
            "symbol": "USDT",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "BUSD Token",
            "symbol": "BUSD",
            "address": "0xDe9334C157968320f26e449331D6544b89bbD00F",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "USDC",
            "address": "0x278B02d1b60AcD3334682F0dcF29AECcc62b28B3",
            "symbol": "USDC",
            "decimals": 18
        },
        {
            "name": "DAI",
            "address": "0xB78DAa2F1A2de8270a5641f052FaFC4b2b3ea3B1",
            "symbol": "DAI",
            "decimals": 18
        },
        {
            "name": "openANX Token",
            "address": "0x8677048f3eD472610514bA6EF6Ec2f03b550eBdB",
            "symbol": "OAX",
            "decimals": 18
        },
        {
            "name": "CAKE",
            "address": "0xEF899e45461F4614655AEe012ec69ae12F97F81e",
            "symbol": "CAKE",
            "decimals": 18
        },
        {
            "name": "BakeryToken",
            "address": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5",
            "symbol": "BAKE",
            "decimals": 18
        },
        {
            "name": "Polkadot Token",
            "symbol": "DOT",
            "address": "0x6679b8031519fA81fE681a93e98cdddA5aafa95b",
            "decimals": 18
        },
        {
            "name": "Impossible Finance",
            "symbol": "IF",
            "address": "0x3245fD889abe511A7d57643905368F8Ec8fd4A92",
            "decimals": 18
        },
        {
            "name": "Coin98",
            "symbol": "C98",
            "address": "0x5EB137B421AE7Be6Ce26C3dE7c828c475C9a69b1",
            "decimals": 18
        },
        {
            "name": "Impossible Decentralized Incubator Access Token",
            "symbol": "IDIA",
            "address": "0x52423B7F0769d0365EbdD79342ce167eB9C29AE2",
            "decimals": 18
        },
        {
            "name": "OpenSwap",
            "address": "0x45eee762aaeA4e5ce317471BDa8782724972Ee19",
            "symbol": "OSWAP",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "mOpenSwap",
            "address": "0xC2C76387eB1cd15f2f55D2463b5AAd6fca062EB1",
            "symbol": "mOSWAP",
            "decimals": 18
        },
        {
            "name": "Project",
            "address": "0x100c8C9eFCb56A253d5A82059647A2adEFDC984A",
            "symbol": "PRO",
            "decimals": 18
        },
        {
            "name": "mProject",
            "address": "0x05039f76eB9Dcb6aB49b4D5860980e32f976e17b",
            "symbol": "mPRO",
            "decimals": 18
        },
        {
            "name": "mIDIA",
            "address": "0x18CE3F88De23DC2A72f3aDDeB048caa01059E9f3",
            "symbol": "mIDIA",
            "decimals": 18
        },
        {
            "name": "Testing",
            "address": "0xc9E10b2a33631c1F9b185Df07198591d507CcE20",
            "symbol": "TS",
            "decimals": 18
        },
        {
            "name": "tokenT",
            "address": "0xb79aA5c1730Ad78dD958f05fD87022aeF3e50721",
            "symbol": "TT",
            "decimals": 18
        },
        {
            "name": "JetSwap Token",
            "address": "0x8839903E0D698e5976C39E34bDED66F7B9a1b8c9",
            "symbol": "WINGS",
            "decimals": 18
        },
        {
            "name": "dummy BVR",
            "address": "0x9DbD7024804a2a6131BE7C8dE7A7773c5c119419",
            "symbol": "dBVR",
            "decimals": 18
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/fuji.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Fuji = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/fuji.ts'/> 
    exports.Tokens_Fuji = [
        {
            "name": "Wrapped AVAX",
            "address": "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
            "symbol": "WAVAX",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "name": "Pangolin",
            "address": "0x6d0A79756774c7cbac6Ce5c5e3b0f40b0ccCcB20",
            "symbol": "PNG",
            "decimals": 18
        },
        {
            "name": "OpenSwap",
            "address": "0x78d9D80E67bC80A11efbf84B7c8A65Da51a8EF3C",
            "symbol": "OSWAP",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "Tether USD",
            "address": "0xb9C31Ea1D475c25E58a1bE1a46221db55E5A7C6e",
            "symbol": "USDT.e",
            "decimals": 6
        },
        {
            "name": "HakuSwap Token",
            "address": "0x2093f387FA92d3963A4Bc8Fd8E4f88cD82c0d14A",
            "symbol": "HAKU",
            "decimals": 18
        },
        {
            "name": "Snowball",
            "address": "0xF319e2f610462F846d6e93F51CdC862EEFF2a554",
            "symbol": "SNOB",
            "decimals": 18
        },
        {
            "name": "TEDDY",
            "address": "0x7B635b81920F2C9B7a217DD898BeC9F6D309470D",
            "symbol": "TEDDY",
            "decimals": 18
        },
        {
            "name": "AxialToken",
            "address": "0x57b8a194230ef402584130B1eD31d2C4682d7a71",
            "symbol": "AXIAL",
            "decimals": 18
        },
        {
            "name": "USDC",
            "address": "0xA269756ccf60766FB311BeE71c07F53Af1d15bDE",
            "symbol": "USDC",
            "decimals": 6
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/mumbai.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Mumbai = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/mumbai.ts'/> 
    exports.Tokens_Mumbai = [
        {
            "name": "USDT",
            "address": "0xF6Bf7c1213fdCe4AA92e7c91865cD586891B9cF6",
            "symbol": "USDT",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "OpenSwap",
            "address": "0xA9d603421e2777b8BEa685272611A01fF3bc6523",
            "symbol": "OSWAP",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "Wrapped MATIC",
            "address": "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
            "symbol": "WMATIC",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "name": "USDC",
            "address": "0x87a86a498E50D9cb81cE7B4682Db90eDB32A2A01",
            "symbol": "USDC",
            "decimals": 6
        },
        {
            "name": "Tidal Token",
            "address": "0xE4c020c5B74A44cf21549C36E8762Da77FAaf134",
            "symbol": "TIDAL",
            "decimals": 18
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/fantom-testnet.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Fantom_Testnet = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/fantom-testnet.ts'/> 
    exports.Tokens_Fantom_Testnet = [
        {
            "address": "0xf1277d1Ed8AD466beddF92ef448A132661956621",
            "decimals": 18,
            "name": "Wrapped Fantom",
            "symbol": "WFTM",
            "isWETH": true
        },
        {
            "name": "OpenSwap",
            "address": "0xDe0399014ED809e0E5976D391013dEd315c6B778",
            "symbol": "OSWAP",
            "decimals": 18,
            "isCommon": true
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/amino.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Amino = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/amino.ts'/> 
    exports.Tokens_Amino = [
        {
            "name": "USDT",
            "address": "0x28A6a9079fA8e041179cD13F4652af2B315b6fd8",
            "symbol": "USDT",
            "decimals": 18
        },
        {
            "name": "CAKE",
            "address": "0x8dc927D1c259A2EdA099712eAFB57509aD4164b7",
            "symbol": "CAKE",
            "decimals": 18
        },
        {
            "name": "BUSD",
            "address": "0x5d3e849B757afD8500b0F514933eEb55a92EB757",
            "symbol": "BUSD",
            "decimals": 18
        },
        {
            "name": "Wrapped ACT",
            "address": "0xBB04C4927A05Cf7d3e329E6333658D48A9313356",
            "symbol": "WACT",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/aminoX-testnet.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_AminoXTestnet = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/aminoX-testnet.ts'/> 
    exports.Tokens_AminoXTestnet = [
        {
            "name": "OpenSwap",
            "address": "0xA0AF68AB35fa4618b57C1A7CFc07A8caa0cBf07E",
            "symbol": "OSWAP",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "Tether USD",
            "address": "0xFFfffffF8d2EE523a2206206994597c13D831EC7",
            "symbol": "USDT",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "DAI Stablecoin",
            "address": "0xFFFffffFE89094c44da98B954eEDEac495271D0f",
            "symbol": "DAI",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "Wrapped ACT",
            "address": "0xCb5e100fdF7d24f25865fa85673D9bD6Bb4674ab",
            "symbol": "WACT",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/cronos-testnet.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Cronos_Testnet = void 0;
    ///<amd-module name='@scom/scom-gem-token/store/tokens/testnet/cronos-testnet.ts'/> 
    exports.Tokens_Cronos_Testnet = [
        {
            "address": "0x6a3173618859C7cd40fAF6921b5E9eB6A76f1fD4",
            "name": "Wrapped CRO",
            "symbol": "WCRO",
            "decimals": 18,
            "isCommon": true,
            "isWETH": true
        },
        {
            "name": "WETH",
            "address": "0x796135E94527c38433e9c42f4Cd91ca931E5e6A6",
            "symbol": "WETH",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "WBTC",
            "address": "0xEE200f25d7B1B9518AC944fd60b113d39bee209c",
            "symbol": "WBTC",
            "decimals": 8,
            "isCommon": true
        },
        {
            "name": "USDC",
            "address": "0x25f0965F285F03d6F6B3B21c8EC3367412Fd0ef6",
            "symbol": "USDC",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "USDT",
            "address": "0xa144617Afd9205AF1ceDE3Cc671da1a409A82c5a",
            "symbol": "USDT",
            "decimals": 6,
            "isCommon": true
        },
        {
            "name": "DAI",
            "address": "0x8662A8111daEC7570a1bDF3dbd3E163d41563904",
            "symbol": "DAI",
            "decimals": 18,
            "isCommon": true
        },
        {
            "name": "OSWAP",
            "address": "0xA09d20Bac0A83b0d1454a2B3BA7A39D55ca00628",
            "symbol": "OSWAP",
            "decimals": 18,
            "isCommon": true
        }
    ];
});
define("@scom/scom-gem-token/store/tokens/testnet/index.ts", ["require", "exports", "@scom/scom-gem-token/store/tokens/testnet/kovan.ts", "@scom/scom-gem-token/store/tokens/testnet/bsc-testnet.ts", "@scom/scom-gem-token/store/tokens/testnet/fuji.ts", "@scom/scom-gem-token/store/tokens/testnet/mumbai.ts", "@scom/scom-gem-token/store/tokens/testnet/fantom-testnet.ts", "@scom/scom-gem-token/store/tokens/testnet/amino.ts", "@scom/scom-gem-token/store/tokens/testnet/aminoX-testnet.ts", "@scom/scom-gem-token/store/tokens/testnet/cronos-testnet.ts"], function (require, exports, kovan_1, bsc_testnet_1, fuji_1, mumbai_1, fantom_testnet_1, amino_1, aminoX_testnet_1, cronos_testnet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tokens_Cronos_Testnet = exports.Tokens_AminoXTestnet = exports.Tokens_Amino = exports.Tokens_Fantom_Testnet = exports.Tokens_Mumbai = exports.Tokens_Fuji = exports.Tokens_BSC_Testnet = exports.Tokens_Kovan = void 0;
    Object.defineProperty(exports, "Tokens_Kovan", { enumerable: true, get: function () { return kovan_1.Tokens_Kovan; } });
    Object.defineProperty(exports, "Tokens_BSC_Testnet", { enumerable: true, get: function () { return bsc_testnet_1.Tokens_BSC_Testnet; } });
    Object.defineProperty(exports, "Tokens_Fuji", { enumerable: true, get: function () { return fuji_1.Tokens_Fuji; } });
    Object.defineProperty(exports, "Tokens_Mumbai", { enumerable: true, get: function () { return mumbai_1.Tokens_Mumbai; } });
    Object.defineProperty(exports, "Tokens_Fantom_Testnet", { enumerable: true, get: function () { return fantom_testnet_1.Tokens_Fantom_Testnet; } });
    Object.defineProperty(exports, "Tokens_Amino", { enumerable: true, get: function () { return amino_1.Tokens_Amino; } });
    Object.defineProperty(exports, "Tokens_AminoXTestnet", { enumerable: true, get: function () { return aminoX_testnet_1.Tokens_AminoXTestnet; } });
    Object.defineProperty(exports, "Tokens_Cronos_Testnet", { enumerable: true, get: function () { return cronos_testnet_1.Tokens_Cronos_Testnet; } });
});
define("@scom/scom-gem-token/store/tokens/index.ts", ["require", "exports", "@scom/scom-gem-token/store/tokens/mainnet/index.ts", "@scom/scom-gem-token/store/tokens/testnet/index.ts"], function (require, exports, index_1, index_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultTokens = exports.ChainNativeTokenByChainId = exports.DefaultERC20Tokens = void 0;
    const DefaultERC20Tokens = {
        1: index_1.Tokens_Ethereuem,
        25: index_1.Tokens_Cronos,
        42: index_2.Tokens_Kovan,
        56: index_1.Tokens_BSC,
        97: index_2.Tokens_BSC_Testnet,
        137: index_1.Tokens_Polygon,
        338: index_2.Tokens_Cronos_Testnet,
        31337: index_2.Tokens_Amino,
        80001: index_2.Tokens_Mumbai,
        43113: index_2.Tokens_Fuji,
        43114: index_1.Tokens_Avalanche,
        250: index_1.Tokens_Fantom,
        4002: index_2.Tokens_Fantom_Testnet,
        13370: index_2.Tokens_AminoXTestnet
    };
    exports.DefaultERC20Tokens = DefaultERC20Tokens;
    const ChainNativeTokenByChainId = {
        1: { address: undefined, decimals: 18, symbol: "ETH", name: 'ETH', isNative: true },
        25: { address: undefined, decimals: 18, symbol: "CRO", name: 'CRO', isNative: true },
        42: { address: undefined, decimals: 18, symbol: "ETH", name: 'ETH', isNative: true },
        56: { address: undefined, decimals: 18, symbol: "BNB", name: 'BNB', isNative: true },
        97: { address: undefined, decimals: 18, symbol: "BNB", name: 'BNB', isNative: true },
        137: { address: undefined, decimals: 18, symbol: "MATIC", name: 'MATIC', isNative: true },
        338: { address: undefined, decimals: 18, symbol: "TCRO", name: 'TCRO', isNative: true },
        31337: { address: undefined, decimals: 18, symbol: "ACT", name: 'ACT', isNative: true },
        80001: { address: undefined, decimals: 18, symbol: "MATIC", name: 'MATIC', isNative: true },
        43114: { address: undefined, decimals: 18, symbol: "AVAX", name: 'AVAX', isNative: true },
        43113: { address: undefined, decimals: 18, symbol: "AVAX", name: 'AVAX', isNative: true },
        250: { address: undefined, decimals: 18, symbol: "FTM", name: 'FTM', isNative: true },
        4002: { address: undefined, decimals: 18, symbol: "FTM", name: 'FTM', isNative: true },
        13370: { address: undefined, decimals: 18, symbol: "ACT", name: 'ACT', isNative: true }, //Amino X Testnet
    };
    exports.ChainNativeTokenByChainId = ChainNativeTokenByChainId;
    const DefaultTokens = Object.keys(ChainNativeTokenByChainId).reduce((result, key) => {
        result[Number(key)] = [...DefaultERC20Tokens[Number(key)], ChainNativeTokenByChainId[Number(key)]];
        return result;
    }, {});
    exports.DefaultTokens = DefaultTokens;
});
define("@scom/scom-gem-token/store/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-gem-token/wallet/index.ts", "@scom/scom-gem-token/store/tokens/index.ts", "@scom/scom-gem-token/store/tokens/index.ts"], function (require, exports, components_1, eth_wallet_5, index_3, index_4, index_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.switchNetwork = exports.getContractAddress = exports.getEmbedderCommissionFee = exports.setDataFromSCConfig = exports.state = exports.getNetworkName = exports.SupportedNetworks = exports.WalletPlugin = exports.getTokenList = void 0;
    const getTokenList = (chainId) => {
        const tokenList = [...index_4.DefaultTokens[chainId]];
        return tokenList;
    };
    exports.getTokenList = getTokenList;
    var WalletPlugin;
    (function (WalletPlugin) {
        WalletPlugin["MetaMask"] = "metamask";
        WalletPlugin["WalletConnect"] = "walletconnect";
    })(WalletPlugin = exports.WalletPlugin || (exports.WalletPlugin = {}));
    ;
    exports.SupportedNetworks = [
        {
            name: "BSC Testnet",
            chainId: 97,
            img: "bsc"
        },
        {
            name: "Avalanche FUJI C-Chain",
            chainId: 43113,
            img: "avax"
        }
    ];
    const getNetworkName = (chainId) => {
        var _a;
        return ((_a = exports.SupportedNetworks.find(v => v.chainId === chainId)) === null || _a === void 0 ? void 0 : _a.name) || "";
    };
    exports.getNetworkName = getNetworkName;
    exports.state = {
        contractInfoByChain: {},
        embedderCommissionFee: "0"
    };
    const setDataFromSCConfig = (options) => {
        if (options.contractInfo) {
            setContractInfo(options.contractInfo);
        }
        if (options.embedderCommissionFee) {
            setEmbedderCommissionFee(options.embedderCommissionFee);
        }
    };
    exports.setDataFromSCConfig = setDataFromSCConfig;
    const setContractInfo = (data) => {
        exports.state.contractInfoByChain = data;
    };
    const getContractInfo = (chainId) => {
        return exports.state.contractInfoByChain[chainId];
    };
    const setEmbedderCommissionFee = (fee) => {
        exports.state.embedderCommissionFee = fee;
    };
    const getEmbedderCommissionFee = () => {
        return exports.state.embedderCommissionFee;
    };
    exports.getEmbedderCommissionFee = getEmbedderCommissionFee;
    const getContractAddress = (type) => {
        var _a;
        const chainId = eth_wallet_5.Wallet.getInstance().chainId;
        const contracts = getContractInfo(chainId) || {};
        return (_a = contracts[type]) === null || _a === void 0 ? void 0 : _a.address;
    };
    exports.getContractAddress = getContractAddress;
    async function switchNetwork(chainId) {
        var _a;
        if (!index_3.isWalletConnected()) {
            components_1.application.EventBus.dispatch("chainChanged" /* chainChanged */, chainId);
            return;
        }
        const wallet = eth_wallet_5.Wallet.getClientInstance();
        if (((_a = wallet === null || wallet === void 0 ? void 0 : wallet.clientSideProvider) === null || _a === void 0 ? void 0 : _a.name) === WalletPlugin.MetaMask) {
            await wallet.switchNetwork(chainId);
        }
    }
    exports.switchNetwork = switchNetwork;
    __exportStar(index_5, exports);
});
define("@scom/scom-gem-token/scom-network-picker/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDir = components_2.application.currentModuleDir;
    function fullPath(path) {
        return `${moduleDir}/${path}`;
    }
    ;
    exports.default = {
        img: {
            network: {
                bsc: fullPath('img/networks/bsc.png'),
                eth: fullPath('img/networks/eth.png'),
                amio: fullPath('img/networks/amio.png'),
                avax: fullPath('img/networks/avax.png'),
                ftm: fullPath('img/networks/ftm.png'),
                polygon: fullPath('img/networks/polygon.png'),
            }
        },
        fullPath
    };
});
define("@scom/scom-gem-token/scom-network-picker/store/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    ;
});
define("@scom/scom-gem-token/scom-network-picker/store/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet"], function (require, exports, components_3, eth_wallet_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.switchNetwork = exports.isWalletConnected = exports.isDefaultNetworkFromWallet = exports.getEnv = exports.getInfuraId = exports.isValidEnv = exports.getSiteSupportedNetworks = exports.getDefaultChainId = exports.getNetworkType = exports.getNetworkList = exports.getNetworkInfo = exports.getWalletProvider = exports.getChainId = exports.updateNetworks = exports.networks = exports.WalletPlugin = void 0;
    var WalletPlugin;
    (function (WalletPlugin) {
        WalletPlugin["MetaMask"] = "metamask";
        WalletPlugin["WalletConnect"] = "walletconnect";
    })(WalletPlugin = exports.WalletPlugin || (exports.WalletPlugin = {}));
    exports.networks = [
        {
            name: "Ethereum",
            chainId: 1,
            img: "eth",
            rpc: "https://mainnet.infura.io/v3/{InfuraId}",
            symbol: "ETH",
            env: "mainnet",
            explorerName: "Etherscan",
            explorerTxUrl: "https://etherscan.io/tx/",
            explorerAddressUrl: "https://etherscan.io/address/"
        },
        {
            name: "Kovan Test Network",
            chainId: 42,
            img: "eth",
            rpc: "https://kovan.infura.io/v3/{InfuraId}",
            symbol: "ETH",
            env: "testnet",
            explorerName: "Etherscan",
            explorerTxUrl: "https://kovan.etherscan.io/tx/",
            explorerAddressUrl: "https://kovan.etherscan.io/address/"
        },
        {
            name: "Binance Smart Chain",
            chainId: 56,
            img: "bsc",
            rpc: "https://bsc-dataseed.binance.org/",
            symbol: "BNB",
            env: "mainnet",
            explorerName: "BSCScan",
            explorerTxUrl: "https://bscscan.com/tx/",
            explorerAddressUrl: "https://bscscan.com/address/"
        },
        {
            name: "Polygon",
            chainId: 137,
            img: "polygon",
            symbol: "MATIC",
            env: "mainnet",
            explorerName: "PolygonScan",
            explorerTxUrl: "https://polygonscan.com/tx/",
            explorerAddressUrl: "https://polygonscan.com/address/"
        },
        {
            name: "Fantom Opera",
            chainId: 250,
            img: "ftm",
            rpc: "https://rpc.ftm.tools/",
            symbol: "FTM",
            env: "mainnet",
            explorerName: "FTMScan",
            explorerTxUrl: "https://ftmscan.com/tx/",
            explorerAddressUrl: "https://ftmscan.com/address/"
        },
        {
            name: "BSC Testnet",
            chainId: 97,
            img: "bsc",
            rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            symbol: "BNB",
            env: "testnet",
            explorerName: "BSCScan",
            explorerTxUrl: "https://testnet.bscscan.com/tx/",
            explorerAddressUrl: "https://testnet.bscscan.com/address/"
        },
        {
            name: "Amino Testnet",
            chainId: 31337,
            img: "amio",
            symbol: "ACT",
            env: "testnet"
        },
        {
            name: "Avalanche FUJI C-Chain",
            chainId: 43113,
            img: "avax",
            rpc: "https://api.avax-test.network/ext/bc/C/rpc",
            symbol: "AVAX",
            env: "testnet",
            explorerName: "SnowTrace",
            explorerTxUrl: "https://testnet.snowtrace.io/tx/",
            explorerAddressUrl: "https://testnet.snowtrace.io/address/"
        },
        {
            name: "Mumbai",
            chainId: 80001,
            img: "polygon",
            rpc: "https://matic-mumbai.chainstacklabs.com",
            symbol: "MATIC",
            env: "testnet",
            explorerName: "PolygonScan",
            explorerTxUrl: "https://mumbai.polygonscan.com/tx/",
            explorerAddressUrl: "https://mumbai.polygonscan.com/address/"
        },
        {
            name: "Fantom Testnet",
            chainId: 4002,
            img: "ftm",
            rpc: "https://rpc.testnet.fantom.network/",
            symbol: "FTM",
            env: "testnet",
            explorerName: "FTMScan",
            explorerTxUrl: "https://testnet.ftmscan.com/tx/",
            explorerAddressUrl: "https://testnet.ftmscan.com/address/"
        },
        {
            name: "AminoX Testnet",
            chainId: 13370,
            img: "amio",
            symbol: "ACT",
            env: "testnet",
            explorerName: "AminoX Explorer",
            explorerTxUrl: "https://aminoxtestnet.blockscout.alphacarbon.network/tx/",
            explorerAddressUrl: "https://aminoxtestnet.blockscout.alphacarbon.network/address/"
        }
    ];
    const updateNetworks = (options) => {
        if (options.env) {
            setEnv(options.env);
        }
        if (options.infuraId) {
            setInfuraId(options.infuraId);
        }
        if (options.networks) {
            setNetworkList(options.networks, options.infuraId);
        }
        if (options.defaultChainId) {
            setDefaultChainId(options.defaultChainId);
        }
    };
    exports.updateNetworks = updateNetworks;
    function getChainId() {
        return eth_wallet_6.Wallet.getInstance().chainId;
    }
    exports.getChainId = getChainId;
    ;
    function getWalletProvider() {
        return localStorage.getItem('walletProvider') || '';
    }
    exports.getWalletProvider = getWalletProvider;
    ;
    const state = {
        networkMap: {},
        defaultChainId: 0,
        infuraId: "",
        env: "",
        defaultNetworkFromWallet: false,
        requireLogin: false
    };
    function getWallet() {
        return eth_wallet_6.Wallet.getInstance();
    }
    ;
    const setNetworkList = (networkList, infuraId) => {
        var _a;
        state.networkMap = {};
        state.defaultNetworkFromWallet = networkList === "*";
        if (state.defaultNetworkFromWallet) {
            const wallet = getWallet();
            const networksMap = wallet.networksMap;
            for (const chainId in networksMap) {
                const networkInfo = networksMap[chainId];
                const rpc = networkInfo.rpcUrls && networkInfo.rpcUrls.length ? networkInfo.rpcUrls[0] : "";
                const explorerUrl = networkInfo.blockExplorerUrls && networkInfo.blockExplorerUrls.length ? networkInfo.blockExplorerUrls[0] : "";
                state.networkMap[networkInfo.chainId] = {
                    chainId: networkInfo.chainId,
                    name: networkInfo.chainName,
                    rpc: state.infuraId && rpc ? rpc.replace(/{InfuraId}/g, state.infuraId) : rpc,
                    symbol: ((_a = networkInfo.nativeCurrency) === null || _a === void 0 ? void 0 : _a.symbol) || "",
                    explorerTxUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}tx/` : "",
                    explorerAddressUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}address/` : "",
                };
            }
            return;
        }
        exports.networks.forEach(network => {
            const rpc = infuraId && network.rpc ? network.rpc.replace(/{InfuraId}/g, infuraId) : network.rpc;
            state.networkMap[network.chainId] = Object.assign(Object.assign({}, network), { isDisabled: true, rpc });
        });
        if (Array.isArray(networkList)) {
            for (let network of networkList) {
                if (infuraId && network.rpc) {
                    network.rpc = network.rpc.replace(/{InfuraId}/g, infuraId);
                }
                Object.assign(state.networkMap[network.chainId], Object.assign({ isDisabled: false }, network));
            }
        }
    };
    const getNetworkInfo = (chainId) => {
        return state.networkMap[chainId];
    };
    exports.getNetworkInfo = getNetworkInfo;
    const getNetworkList = () => {
        return Object.values(state.networkMap);
    };
    exports.getNetworkList = getNetworkList;
    const getNetworkType = (chainId) => {
        var _a;
        let network = exports.getNetworkInfo(chainId);
        return (_a = network === null || network === void 0 ? void 0 : network.explorerName) !== null && _a !== void 0 ? _a : 'Unknown';
    };
    exports.getNetworkType = getNetworkType;
    const setDefaultChainId = (chainId) => {
        state.defaultChainId = chainId;
    };
    const getDefaultChainId = () => {
        return state.defaultChainId;
    };
    exports.getDefaultChainId = getDefaultChainId;
    const getSiteSupportedNetworks = () => {
        let networkFullList = Object.values(state.networkMap);
        let list = networkFullList.filter(network => !network.isDisabled && exports.isValidEnv(network.env));
        return list;
    };
    exports.getSiteSupportedNetworks = getSiteSupportedNetworks;
    const isValidEnv = (env) => {
        const _env = state.env === 'testnet' || state.env === 'mainnet' ? state.env : "";
        return !_env || !env || env === _env;
    };
    exports.isValidEnv = isValidEnv;
    const setInfuraId = (infuraId) => {
        state.infuraId = infuraId;
    };
    const getInfuraId = () => {
        return state.infuraId;
    };
    exports.getInfuraId = getInfuraId;
    const setEnv = (env) => {
        state.env = env;
    };
    const getEnv = () => {
        return state.env;
    };
    exports.getEnv = getEnv;
    const isDefaultNetworkFromWallet = () => {
        return state.defaultNetworkFromWallet;
    };
    exports.isDefaultNetworkFromWallet = isDefaultNetworkFromWallet;
    function isWalletConnected() {
        const wallet = eth_wallet_6.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isWalletConnected = isWalletConnected;
    async function switchNetwork(chainId) {
        var _a;
        if (!isWalletConnected()) {
            components_3.application.EventBus.dispatch("chainChanged" /* chainChanged */, chainId);
            return;
        }
        const wallet = eth_wallet_6.Wallet.getClientInstance();
        if (((_a = wallet === null || wallet === void 0 ? void 0 : wallet.clientSideProvider) === null || _a === void 0 ? void 0 : _a.name) === WalletPlugin.MetaMask) {
            await wallet.switchNetwork(chainId);
        }
    }
    exports.switchNetwork = switchNetwork;
});
define("@scom/scom-gem-token/scom-network-picker/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    exports.default = components_4.Styles.style({
        $nest: {
            '::-webkit-scrollbar-track': {
                borderRadius: '12px',
                border: '1px solid transparent',
                backgroundColor: 'unset'
            },
            '::-webkit-scrollbar': {
                width: '8px',
                backgroundColor: 'unset'
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.5) 0% 0% no-repeat padding-box'
            },
            '.btn-network': {
                boxShadow: 'none'
            },
            '.os-modal': {
                boxSizing: 'border-box',
                $nest: {
                    '.i-modal_header': {
                        borderRadius: '10px 10px 0 0',
                        background: 'unset',
                        borderBottom: `2px solid ${Theme.divider}`,
                        padding: '1rem 0',
                        fontWeight: 700,
                        fontSize: '1rem'
                    },
                    '.modal': {
                        padding: 0
                    },
                    '.list-view': {
                        $nest: {
                            '.list-item': {
                                cursor: 'pointer',
                                transition: 'all .3s ease-in',
                                $nest: {
                                    '&.disabled': {
                                        cursor: 'default',
                                        $nest: {
                                            '&:hover > *': {
                                                opacity: '0.5 !important',
                                            }
                                        }
                                    }
                                }
                            },
                            '&.is-button': {
                                $nest: {
                                    '.is-active': {
                                        $nest: {
                                            '> *': {
                                                opacity: 1
                                            },
                                            '&:after': {
                                                content: "''",
                                                top: '50%',
                                                left: 12,
                                                position: 'absolute',
                                                background: '#20bf55',
                                                borderRadius: '50%',
                                                width: 10,
                                                height: 10,
                                                transform: 'translate3d(-50%,-50%,0)'
                                            }
                                        }
                                    },
                                    '.list-item': {
                                        $nest: {
                                            '> *': {
                                                opacity: .5
                                            }
                                        }
                                    },
                                    '.list-item:not(.is-active):hover': {
                                        $nest: {
                                            '> *': {
                                                opacity: 1
                                            }
                                        }
                                    }
                                }
                            },
                            '&.is-combobox': {
                                $nest: {
                                    '.is-active': {
                                        background: Theme.action.active,
                                        fontWeight: 600
                                    },
                                    '.list-item:not(.is-active):hover': {
                                        background: Theme.action.hover
                                    }
                                }
                            }
                        }
                    },
                    '&> div': {
                        transform: 'scale(1)'
                    }
                }
            },
            '.box-shadow > div': {
                boxShadow: '0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08), 0 9px 28px 8px rgba(0,0,0,.05)'
            },
            '.is-ellipsis': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            },
            '.btn-cb-network': {
                justifyContent: "space-between"
            },
            '.btn-cb-network:hover': {
                border: `1px solid ${Theme.colors.primary.main}`
            },
            '.btn-focus': {
                border: `1px solid ${Theme.colors.primary.main}`,
                boxShadow: '0 0 0 2px rgba(87, 75, 144, .2)'
            },
            '.full-width': {
                width: '100%'
            }
        }
    });
});
define("@scom/scom-gem-token/scom-network-picker/index.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-gem-token/scom-network-picker/assets.ts", "@scom/scom-gem-token/scom-network-picker/store/index.ts", "@scom/scom-gem-token/scom-network-picker/index.css.ts"], function (require, exports, components_5, assets_1, index_6, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_5.Styles.Theme.ThemeVars;
    let ScomNetworkPicker = class ScomNetworkPicker extends components_5.Module {
        constructor(parent, options) {
            super(parent, options);
            this._networkList = [];
            this.networkPlaceholder = 'Select Network';
        }
        get selectedNetwork() {
            return this._selectedNetwork;
        }
        get type() {
            return this._type;
        }
        set type(value) {
            if (value === this._type)
                return;
            this._type = value;
            this.renderUI();
        }
        setNetworkByChainId(chainId) {
            const network = this.getNetwork(chainId);
            if (network)
                this.setNetwork(network);
        }
        clearNetwork() {
            this._selectedNetwork = undefined;
            this.btnNetwork.caption = this.networkPlaceholder;
            this.networkMapper.forEach((value, key) => {
                value.classList.remove('is-active');
            });
        }
        getNetwork(chainId) {
            return this._networkList.find(net => net.chainId === chainId) || null;
        }
        getNetworkLabel() {
            var _a, _b, _c;
            if (this._selectedNetwork) {
                const img = ((_a = this._selectedNetwork) === null || _a === void 0 ? void 0 : _a.img)
                    ? assets_1.default.img.network[this._selectedNetwork.img] ||
                        components_5.application.assets(this._selectedNetwork.img)
                    : undefined;
                return `<i-hstack verticalAlignment="center" gap="1.125rem">
        <i-panel>
          <i-image width=${17} height=${17} url="${img}"></i-image>
        </i-panel>
        <i-label caption="${(_c = (_b = this._selectedNetwork) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : ''}"></i-label>
      </i-hstack>`;
            }
            else {
                return this.type === 'button' ? 'Unsupported Network' : this.networkPlaceholder;
            }
        }
        setNetwork(network) {
            var _a;
            this._selectedNetwork = network;
            if (this.btnNetwork) {
                this.btnNetwork.caption = this.getNetworkLabel();
                this.btnNetwork.opacity = 1;
            }
            (_a = this.networkMapper) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => {
                var _a;
                const chainId = (_a = this._selectedNetwork) === null || _a === void 0 ? void 0 : _a.chainId;
                if (key === chainId) {
                    value.classList.add('is-active');
                }
                else {
                    value.classList.remove('is-active');
                }
            });
        }
        async onNetworkSelected(network) {
            this.mdNetwork.visible = false;
            if (!network)
                return;
            if (this._switchNetworkOnSelect)
                await index_6.switchNetwork(network.chainId);
            this.setNetwork(network);
            this._onCustomNetworkSelected && this._onCustomNetworkSelected(network);
        }
        // private updateConnectedLabel(isConnected: boolean) {
        //   if (isConnected) {
        //     this.lbConnected.caption = 'Connected'
        //     this.lbConnected.font = {color: Theme.colors.success.main, weight: 500, size: '13px'}
        //     this.lbConnected.background = {color: Theme.colors.success.light}
        //   } else {
        //     this.lbConnected.caption = 'Not Connected'
        //     this.lbConnected.font = {color: Theme.colors.error.main, weight: 500, size: '13px'}
        //     this.lbConnected.background = {color: Theme.colors.error.light}
        //   }
        // }
        renderNetworks() {
            this.gridNetworkGroup.clearInnerHTML();
            this.networkMapper = new Map();
            this.gridNetworkGroup.append(...this._networkList.map((network) => {
                const img = network.img ? (this.$render("i-image", { url: assets_1.default.img.network[network.img] || components_5.application.assets(network.img), width: this.type === 'button' ? 34 : 16, height: this.type === 'button' ? 34 : 16 })) : ([]);
                const isActive = this._selectedNetwork ? this._selectedNetwork.chainId === network.chainId : false;
                const hsNetwork = (this.$render("i-hstack", { onClick: () => this.onNetworkSelected(network), background: { color: this.type === 'button' ? Theme.colors.secondary.light : 'transparent' }, border: { radius: this.type === 'button' ? 10 : '0px' }, position: 'relative', class: isActive ? 'is-active list-item' : 'list-item', verticalAlignment: "center", overflow: "hidden", padding: this.type === 'button' ? { top: '0.65rem', bottom: '0.65rem', left: '0.5rem', right: '0.5rem' } : { top: '5px', bottom: '5px', left: '0.75rem', right: '0.75rem' } },
                    this.$render("i-hstack", { margin: { left: this.type === 'button' ? '1rem' : '0px' }, verticalAlignment: 'center', gap: this.type === 'button' ? '0.75rem' : '1.125rem', lineHeight: 1.375 },
                        this.$render("i-panel", null, img),
                        this.$render("i-label", { caption: network.name, wordBreak: 'break-word', font: {
                                size: '.875rem',
                                bold: this.type === 'button',
                                color: this.type === 'button' ? Theme.colors.primary.dark : Theme.text.primary,
                                weight: 400
                            }, class: "is-ellipsis" }))));
                this.networkMapper.set(network.chainId, hsNetwork);
                return hsNetwork;
            }));
        }
        renderModalItem() {
            const grid = (this.$render("i-grid-layout", { id: 'gridNetworkGroup', width: '100%', columnsPerRow: 1, templateRows: ['max-content'], class: `list-view ${this.type === 'button' ? ' is-button' : 'is-combobox'}`, gap: { row: this.type === 'button' ? '0.5rem' : '0px' } }));
            if (this.type === 'button') {
                return (this.$render("i-vstack", { height: "100%", padding: { left: '1rem', right: '1rem', bottom: '2rem', top: '0.5rem' }, lineHeight: 1.5, gap: "1rem" },
                    this.$render("i-hstack", { horizontalAlignment: "space-between", class: "i-modal_header" },
                        this.$render("i-label", { caption: "Supported Network", font: { color: Theme.colors.primary.main, size: '1rem' } }),
                        this.$render("i-icon", { name: "times", width: 16, height: 16, fill: Theme.colors.primary.main, onClick: () => this.mdNetwork.visible = false })),
                    this.$render("i-label", { id: 'lblNetworkDesc', font: { size: '.875rem' }, wordBreak: 'break-word', caption: 'We support the following networks, please click to connect.' }),
                    this.$render("i-panel", { height: 'calc(100% - 160px)', overflow: { y: 'auto' } }, grid)));
            }
            else {
                return (this.$render("i-panel", { margin: { top: '0.25rem' }, padding: { top: 5, bottom: 5 }, overflow: { y: 'auto' }, maxHeight: 300, border: { radius: 2 } }, grid));
            }
        }
        async renderUI() {
            this.pnlNetwork.clearInnerHTML();
            if (this._type === 'combobox')
                await this.renderCombobox();
            else
                await this.renderButton();
            this.mdNetwork.item = this.renderModalItem();
            this.mdNetwork.classList.add('os-modal');
            this.btnNetwork.classList.add('btn-network');
            this.pnlNetwork.appendChild(this.btnNetwork);
            this.pnlNetwork.appendChild(this.mdNetwork);
            this.renderNetworks();
        }
        async renderButton() {
            this.mdNetwork = await components_5.Modal.create({
                width: 440,
                border: { radius: 10 }
            });
            this.btnNetwork = await components_5.Button.create({
                height: 40,
                padding: {
                    top: '0.5rem',
                    bottom: '0.5rem',
                    left: '0.75rem',
                    right: '0.75rem',
                },
                border: { radius: 5 },
                font: { color: Theme.colors.primary.contrastText },
                caption: this.getNetworkLabel(),
                onClick: () => {
                    this.mdNetwork.visible = !this.mdNetwork.visible;
                }
            });
        }
        async renderCombobox() {
            this.mdNetwork = await components_5.Modal.create({
                showBackdrop: false,
                minWidth: 200,
                popupPlacement: 'bottom'
            });
            this.mdNetwork.classList.add('full-width');
            this.btnNetwork = await components_5.Button.create({
                lineHeight: 1.875,
                width: '100%',
                padding: {
                    top: '0.5rem',
                    bottom: '0.5rem',
                    left: '0.75rem',
                    right: '0.75rem',
                },
                border: { radius: 5, width: '1px', style: 'solid', color: Theme.divider },
                font: { color: Theme.text.primary },
                rightIcon: { name: 'angle-down', width: 20, height: 20, fill: Theme.text.primary },
                background: { color: 'transparent' },
                caption: this.getNetworkLabel(),
                onClick: () => {
                    this.mdNetwork.visible = !this.mdNetwork.visible;
                    this.btnNetwork.classList.add('btn-focus');
                }
            });
            this.btnNetwork.classList.add('btn-cb-network');
            this.mdNetwork.classList.add('box-shadow');
            this.mdNetwork.onClose = () => {
                var _a;
                this.btnNetwork.opacity = ((_a = this._selectedNetwork) === null || _a === void 0 ? void 0 : _a.chainId) ? 1 : 0.5;
            };
            this.mdNetwork.onOpen = () => {
                this.btnNetwork.opacity = 0.5;
            };
        }
        init() {
            this.classList.add(index_css_1.default);
            super.init();
            const networksAttr = this.getAttribute('networks', true);
            this._networkList = networksAttr === '*' ? index_6.networks : networksAttr;
            const selectedChainId = this.getAttribute('selectedChainId', true);
            if (selectedChainId)
                this.setNetworkByChainId(selectedChainId);
            this._switchNetworkOnSelect = this.getAttribute('switchNetworkOnSelect', true, false);
            this._onCustomNetworkSelected = this.getAttribute('onCustomNetworkSelected', true);
            this.type = this.getAttribute('type', true, 'button');
            document.addEventListener('click', (event) => {
                const target = event.target;
                const btnNetwork = target.closest('.btn-network');
                if (!btnNetwork || !btnNetwork.isSameNode(this.btnNetwork)) {
                    this.btnNetwork.classList.remove('btn-focus');
                }
                else {
                    this.btnNetwork.classList.add('btn-focus');
                }
            });
        }
        render() {
            return (this.$render("i-panel", { width: '100%' },
                this.$render("i-panel", { id: 'pnlNetwork', width: '100%' })));
        }
    };
    ScomNetworkPicker = __decorate([
        components_5.customModule,
        components_5.customElements('i-scom-network-picker')
    ], ScomNetworkPicker);
    exports.default = ScomNetworkPicker;
});
define("@scom/scom-gem-token/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDir = components_6.application.currentModuleDir;
    function fullPath(path) {
        return `${moduleDir}/${path}`;
    }
    ;
    const TokenFolderName = {
        1: "ethereum",
        25: "cronos",
        42: "kovan",
        56: "bsc",
        97: "bsc-testnet",
        137: "polygon",
        338: "cronos-testnet",
        31337: "amino",
        80001: "mumbai",
        43113: "fuji",
        43114: "avalanche",
        250: "fantom",
        4002: "fantom-testnet",
        13370: "aminox-testnet"
    };
    function tokenPath(tokenObj, chainId) {
        var _a;
        const pathPrefix = 'img/tokens';
        if (tokenObj && (chainId !== undefined && chainId >= 0)) {
            let folderName = TokenFolderName[chainId];
            let fileName = (!tokenObj.isNative ? (((_a = tokenObj === null || tokenObj === void 0 ? void 0 : tokenObj.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '') : tokenObj.symbol) + '.png';
            return fullPath(`${pathPrefix}/${folderName}/${fileName}`);
        }
        else {
            return fullPath(`${pathPrefix}/Custom.png`);
        }
    }
    exports.default = {
        logo: fullPath('img/logo.svg'),
        img: {
            network: {
                bsc: fullPath('img/networks/bsc.png'),
                eth: fullPath('img/networks/eth.png'),
                amio: fullPath('img/networks/amio.png'),
                avax: fullPath('img/networks/avax.png'),
                ftm: fullPath('img/networks/ftm.png'),
                polygon: fullPath('img/networks/polygon.png'),
            }
        },
        fullPath,
        tokenPath
    };
});
define("@scom/scom-gem-token/config/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tableStyle = exports.customStyle = void 0;
    const Theme = components_7.Styles.Theme.ThemeVars;
    exports.customStyle = components_7.Styles.style({
        $nest: {
            'input': {
                paddingLeft: '10px'
            },
            '.nft-network-select': {
                $nest: {
                    '.os-modal .modal': {
                        background: Theme.combobox.background
                    },
                    '.modal > i-panel': {
                        borderRadius: 8
                    },
                    'i-label': {
                        fontSize: '1rem !important'
                    },
                    '.list-item': {
                        padding: '0.5rem 1rem !important'
                    }
                }
            }
        }
    });
    exports.tableStyle = components_7.Styles.style({
        $nest: {
            '.i-table-header>tr>th': {
                fontSize: '0.875rem !important',
                opacity: 0.6
            }
        }
    });
});
define("@scom/scom-gem-token/config/index.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-gem-token/utils/index.ts", "@scom/scom-gem-token/store/index.ts", "@scom/scom-gem-token/assets.ts", "@scom/scom-gem-token/config/index.css.ts"], function (require, exports, components_8, eth_wallet_7, index_7, index_8, assets_2, index_css_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_8.Styles.Theme.ThemeVars;
    let Config = class Config extends components_8.Module {
        constructor() {
            super(...arguments);
            this.commissionsTableColumns = [
                {
                    title: 'Network',
                    fieldName: 'chainId',
                    key: 'chainId',
                    textAlign: 'left',
                    onRenderCell: function (source, columnData, rowData) {
                        const network = index_8.SupportedNetworks.find(net => net.chainId === columnData);
                        if (!network)
                            return this.$render("i-panel", null);
                        const imgUrl = assets_2.default.img.network[network.img] || '';
                        const hstack = new components_8.HStack(undefined, {
                            verticalAlignment: 'center',
                            gap: 5
                        });
                        const imgEl = new components_8.Icon(hstack, {
                            image: { url: imgUrl, width: 16, height: 16 }
                        });
                        const lbName = new components_8.Label(hstack, {
                            caption: network.name || '',
                            font: { size: '0.875rem' }
                        });
                        hstack.append(imgEl, lbName);
                        return hstack;
                    }
                },
                {
                    title: 'Wallet',
                    fieldName: 'walletAddress',
                    key: 'walletAddress',
                    onRenderCell: function (source, columnData, rowData) {
                        const replaced = columnData.slice(6, columnData.length - 9);
                        const caption = ((columnData === null || columnData === void 0 ? void 0 : columnData.length) < 15) ? columnData : columnData.replace(replaced, '...');
                        return new components_8.Label(undefined, {
                            caption: caption || '',
                            font: { size: '0.875rem' },
                            tooltip: {
                                content: columnData
                            }
                        });
                    }
                },
                {
                    title: '',
                    fieldName: '',
                    key: '',
                    textAlign: 'center',
                    onRenderCell: async (source, data, rowData) => {
                        const icon = new components_8.Icon(undefined, {
                            name: "edit",
                            fill: Theme.text.primary,
                            height: 14,
                            width: 14
                        });
                        icon.onClick = async (source) => {
                            this.networkPicker.setNetworkByChainId(rowData.chainId);
                            this.inputWalletAddress.value = rowData.walletAddress;
                            this.modalAddCommission.visible = true;
                        };
                        icon.classList.add('pointer');
                        return icon;
                    }
                },
                {
                    title: '',
                    fieldName: '',
                    key: '',
                    textAlign: 'center',
                    onRenderCell: async (source, data, rowData) => {
                        const icon = new components_8.Icon(undefined, {
                            name: "times",
                            fill: Theme.colors.primary.main,
                            height: 14,
                            width: 14
                        });
                        icon.onClick = async (source) => {
                            const index = this.commissionInfoList.findIndex(v => v.walletAddress == rowData.walletAddress && v.chainId == rowData.chainId);
                            if (index >= 0) {
                                this.commissionInfoList.splice(index, 1);
                                this.tableCommissions.data = this.commissionInfoList;
                                this.toggleVisible();
                                if (this._onCustomCommissionsChanged) {
                                    await this._onCustomCommissionsChanged({
                                        commissions: this.commissionInfoList
                                    });
                                }
                            }
                        };
                        icon.classList.add('pointer');
                        return icon;
                    }
                }
            ];
        }
        async init() {
            super.init();
            this.commissionInfoList = [];
            const embedderFee = index_8.getEmbedderCommissionFee();
            this.lbCommissionShare.caption = `${index_7.formatNumber(new eth_wallet_7.BigNumber(embedderFee).times(100).toFixed(), 4)} %`;
        }
        get data() {
            const config = {};
            config.commissions = this.tableCommissions.data || [];
            return config;
        }
        set data(config) {
            this.tableCommissions.data = config.commissions || [];
            this.toggleVisible();
        }
        get onCustomCommissionsChanged() {
            return this._onCustomCommissionsChanged;
        }
        set onCustomCommissionsChanged(value) {
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
            var _a;
            const embedderFee = index_8.getEmbedderCommissionFee();
            this.commissionInfoList.push({
                chainId: (_a = this.networkPicker.selectedNetwork) === null || _a === void 0 ? void 0 : _a.chainId,
                walletAddress: this.inputWalletAddress.value,
                share: embedderFee
            });
            this.tableCommissions.data = this.commissionInfoList;
            this.toggleVisible();
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
            else if (!index_7.isWalletAddress(this.inputWalletAddress.value)) {
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
        onNetworkSelected(network) {
            this.validateModalFields();
        }
        onInputWalletAddressChanged() {
            this.validateModalFields();
        }
        toggleVisible() {
            var _a, _b;
            const hasData = !!((_b = (_a = this.tableCommissions) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.length);
            this.tableCommissions.visible = hasData;
            this.pnlEmptyWallet.visible = !hasData;
            this.btnAddWallet.visible = hasData;
        }
        render() {
            return (this.$render("i-vstack", { gap: '0.5rem', padding: { top: '1rem', bottom: '1rem' }, class: index_css_2.customStyle },
                this.$render("i-vstack", { gap: "5px" },
                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", gap: "4px" },
                        this.$render("i-hstack", { gap: "4px" },
                            this.$render("i-label", { caption: "Commission Fee: ", opacity: 0.6, font: { size: '1rem' } }),
                            this.$render("i-label", { id: "lbCommissionShare", font: { size: '1rem' } }),
                            this.$render("i-icon", { name: "question-circle", fill: Theme.background.modal, width: 20, height: 20 })),
                        this.$render("i-button", { id: "btnAddWallet", caption: "Add Wallet", border: { radius: '58px' }, padding: { top: '0.3rem', bottom: '0.3rem', left: '1rem', right: '1rem' }, background: { color: Theme.colors.primary.main }, font: { color: Theme.colors.primary.contrastText, size: '0.75rem', weight: 400 }, visible: false, onClick: this.onAddCommissionClicked.bind(this) })),
                    this.$render("i-vstack", { id: "pnlEmptyWallet", border: { radius: '8px' }, background: { color: Theme.background.modal }, padding: { top: '1.875rem', bottom: '1.875rem', left: '1.563rem', right: '1.563rem' }, gap: "1.25rem", width: "100%", class: "text-center" },
                        this.$render("i-label", { caption: "To receive commission fee please add your wallet address", font: { size: '1rem' } }),
                        this.$render("i-panel", null,
                            this.$render("i-button", { caption: "Add Wallet", border: { radius: '58px' }, padding: { top: '0.75rem', bottom: '0.75rem', left: '2.5rem', right: '2.5rem' }, background: { color: Theme.colors.primary.main }, font: { color: Theme.colors.primary.contrastText, size: '0.875rem', weight: 400 }, onClick: this.onAddCommissionClicked.bind(this) })))),
                this.$render("i-table", { id: 'tableCommissions', visible: false, data: this.commissionInfoList, columns: this.commissionsTableColumns, class: index_css_2.tableStyle }),
                this.$render("i-modal", { id: 'modalAddCommission', maxWidth: '600px', closeIcon: { name: 'times-circle' }, onClose: this.onModalAddCommissionClosed },
                    this.$render("i-grid-layout", { width: '100%', verticalAlignment: 'center', gap: { row: '1rem' }, padding: { top: '1rem', bottom: '1rem', left: '2rem', right: '2rem' }, templateColumns: ['1fr', '3fr'], templateRows: ['auto', 'auto', 'auto', 'auto'], templateAreas: [
                            ['title', 'title'],
                            ['lbNetwork', 'network'],
                            ["lbWalletAddress", "walletAddress"],
                            ["lbErrMsg", "errMsg"],
                            ['btnConfirm', 'btnConfirm']
                        ] },
                        this.$render("i-hstack", { width: '100%', horizontalAlignment: 'center', grid: { area: 'title' }, margin: { bottom: '1.5rem' } },
                            this.$render("i-label", { caption: "Add Wallet", font: { size: '1.5rem' } })),
                        this.$render("i-label", { caption: "Network", grid: { area: 'lbNetwork' }, font: { size: '1rem' } }),
                        this.$render("i-scom-network-picker", { id: 'networkPicker', grid: { area: 'network' }, display: "block", type: 'combobox', networks: index_8.SupportedNetworks, background: { color: Theme.combobox.background }, border: { radius: 8, width: '1px', style: 'solid', color: Theme.input.background }, onCustomNetworkSelected: this.onNetworkSelected, class: "nft-network-select" }),
                        this.$render("i-label", { caption: "Wallet Address", grid: { area: 'lbWalletAddress' }, font: { size: '1rem' } }),
                        this.$render("i-input", { id: 'inputWalletAddress', grid: { area: 'walletAddress' }, width: '100%', height: 45, border: { radius: 8, width: '1px', style: 'solid', color: Theme.divider }, onChanged: this.onInputWalletAddressChanged }),
                        this.$render("i-label", { id: 'lbErrMsg', font: { color: '#ed5748' }, grid: { area: 'errMsg' } }),
                        this.$render("i-hstack", { width: '100%', horizontalAlignment: 'center', grid: { area: 'btnConfirm' }, margin: { top: '1.25rem' } },
                            this.$render("i-button", { id: "btnConfirm", enabled: false, caption: "Add Wallet", border: { radius: '58px' }, padding: { top: '0.75rem', bottom: '0.75rem', left: '2.5rem', right: '2.5rem' }, background: { color: Theme.colors.primary.main }, font: { color: Theme.colors.primary.contrastText, size: '0.875rem', weight: 400 }, onClick: this.onConfirmCommissionClicked.bind(this) }))))));
        }
    };
    Config = __decorate([
        components_8.customModule,
        components_8.customElements("i-scom-gem-token-config")
    ], Config);
    exports.default = Config;
});
define("@scom/scom-gem-token/token-selection/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.modalStyle = exports.tokenStyle = exports.buttonStyle = exports.scrollbarStyle = void 0;
    const Theme = components_9.Styles.Theme.ThemeVars;
    exports.scrollbarStyle = components_9.Styles.style({
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
    exports.buttonStyle = components_9.Styles.style({
        boxShadow: 'none'
    });
    exports.tokenStyle = components_9.Styles.style({
        $nest: {
            '&:hover': {
                background: Theme.action.hover
            }
        }
    });
    exports.modalStyle = components_9.Styles.style({
        $nest: {
            '.modal': {
                padding: 0,
                paddingBottom: '1rem',
                borderRadius: 8
            }
        }
    });
});
define("@scom/scom-gem-token/token-selection/index.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-gem-token/store/index.ts", "@scom/scom-gem-token/assets.ts", "@scom/scom-gem-token/wallet/index.ts", "@scom/scom-gem-token/token-selection/index.css.ts"], function (require, exports, components_10, index_9, assets_3, index_10, index_css_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenSelection = void 0;
    const Theme = components_10.Styles.Theme.ThemeVars;
    const fallBackUrl = assets_3.default.tokenPath();
    ;
    let TokenSelection = class TokenSelection extends components_10.Module {
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
            this.$eventBus = components_10.application.EventBus;
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
                const chainId = index_10.getChainId();
                const _tokenList = index_9.getTokenList(chainId);
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
            const chainId = index_10.getChainId();
            const _tokenList = index_9.getTokenList(chainId);
            return _tokenList.map((token) => {
                const tokenObject = Object.assign({}, token);
                const nativeToken = index_9.ChainNativeTokenByChainId[chainId];
                if (token.symbol === nativeToken.symbol) {
                    Object.assign(tokenObject, { isNative: true });
                }
                if (!index_10.isWalletConnected()) {
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
            const chainId = index_10.getChainId();
            const tokenIconPath = assets_3.default.tokenPath(token, chainId);
            return (this.$render("i-hstack", { width: '100%', class: `pointer ${index_css_3.tokenStyle}`, verticalAlignment: 'center', padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, border: { radius: 5 }, gap: '0.5rem', onClick: () => this.selectToken(token) },
                this.$render("i-image", { width: 36, height: 36, url: tokenIconPath, fallbackUrl: fallBackUrl }),
                this.$render("i-vstack", { gap: '0.25rem' },
                    this.$render("i-label", { font: { size: '0.875rem', bold: true }, caption: token.symbol }),
                    this.$render("i-label", { font: { size: '0.75rem' }, caption: token.name }))));
        }
        updateTokenButton(token) {
            const chainId = this.chainId || index_10.getChainId();
            if (token) {
                const tokenIconPath = assets_3.default.tokenPath(token, chainId);
                const icon = new components_10.Icon(this.btnTokens, {
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
                this.$render("i-button", { id: 'btnTokens', class: `${index_css_3.buttonStyle} token-button`, width: '100%', height: 40, caption: 'Select a token', rightIcon: { width: 14, height: 14, name: 'angle-down' }, border: { radius: 0 }, background: { color: 'transparent' }, font: { color: Theme.input.fontColor }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, onClick: this.showTokenModal.bind(this) }),
                this.$render("i-modal", { id: 'mdTokenSelection', class: index_css_3.modalStyle, width: 400 },
                    this.$render("i-hstack", { horizontalAlignment: 'space-between', verticalAlignment: 'center', padding: { top: '1rem', bottom: '1rem' }, border: { bottom: { width: 1, style: 'solid', color: '#f1f1f1' } }, margin: { bottom: '1rem', left: '1rem', right: '1rem' }, gap: 4 },
                        this.$render("i-label", { caption: 'Select a token', font: { size: '1.125rem', bold: true } }),
                        this.$render("i-icon", { width: 24, height: 24, class: 'pointer', name: 'times', fill: Theme.colors.primary.main, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.25rem', right: '0.25rem' }, onClick: this.closeTokenModal.bind(this) })),
                    this.$render("i-grid-layout", { id: 'gridTokenList', class: index_css_3.scrollbarStyle, maxHeight: '45vh', columnsPerRow: 1, overflow: { y: 'auto' }, padding: { bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }))));
        }
    };
    TokenSelection = __decorate([
        components_10.customElements('i-scom-gem-token-selection')
    ], TokenSelection);
    exports.TokenSelection = TokenSelection;
});
define("@scom/scom-gem-token/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.centerStyle = exports.tokenSelectionStyle = exports.inputStyle = exports.markdownStyle = exports.imageStyle = void 0;
    const Theme = components_11.Styles.Theme.ThemeVars;
    exports.imageStyle = components_11.Styles.style({
        $nest: {
            '&>img': {
                maxWidth: 'unset',
                maxHeight: 'unset',
                borderRadius: 4
            }
        }
    });
    exports.markdownStyle = components_11.Styles.style({
        overflowWrap: 'break-word'
    });
    exports.inputStyle = components_11.Styles.style({
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
    exports.tokenSelectionStyle = components_11.Styles.style({
        $nest: {
            'i-button.token-button': {
                justifyContent: 'start'
            }
        }
    });
    exports.centerStyle = components_11.Styles.style({
        textAlign: 'center'
    });
});
define("@scom/scom-gem-token/alert/index.tsx", ["require", "exports", "@ijstech/components"], function (require, exports, components_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Alert = void 0;
    const Theme = components_12.Styles.Theme.ThemeVars;
    ;
    let Alert = class Alert extends components_12.Module {
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
        components_12.customElements('i-scom-gem-token-alert')
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
    exports.ERC20 = ERC20;
    ERC20._abi = ERC20_json_1.default.abi;
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
    exports.GEM = GEM;
    GEM._abi = GEM_json_1.default.abi;
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/index.ts", ["require", "exports", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/GEM.ts"], function (require, exports, ERC20_1, GEM_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GEM = exports.ERC20 = void 0;
    Object.defineProperty(exports, "ERC20", { enumerable: true, get: function () { return ERC20_1.ERC20; } });
    Object.defineProperty(exports, "GEM", { enumerable: true, get: function () { return GEM_1.GEM; } });
});
define("@scom/scom-gem-token/contracts/scom-gem-token-contract/index.ts", ["require", "exports", "@scom/scom-gem-token/contracts/scom-gem-token-contract/contracts/index.ts", "@ijstech/eth-wallet"], function (require, exports, Contracts, eth_wallet_8) {
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
        baseToken: eth_wallet_8.Utils.nullAddress,
        price: 1,
        mintingFee: 0.025,
        redemptionFee: 0.05,
    };
    function logProgress(msg) {
        if (progressHandler)
            progressHandler(msg);
    }
    async function deploy(wallet, options, onProgress) {
        options.cap = eth_wallet_8.Utils.toDecimals(options.cap);
        options.price = eth_wallet_8.Utils.toDecimals(options.price);
        options.mintingFee = eth_wallet_8.Utils.toDecimals(options.mintingFee);
        options.redemptionFee = eth_wallet_8.Utils.toDecimals(options.redemptionFee);
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
    exports.Proxy = Proxy;
    Proxy._abi = Proxy_json_1.default.abi;
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
    exports.ProxyV2 = ProxyV2;
    ProxyV2._abi = ProxyV2_json_1.default.abi;
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
define("@scom/scom-gem-token/API.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-gem-token/contracts/scom-gem-token-contract/index.ts", "@scom/scom-gem-token/contracts/scom-commission-proxy-contract/index.ts", "@scom/scom-gem-token/utils/index.ts", "@scom/scom-gem-token/store/index.ts", "@scom/scom-gem-token/wallet/index.ts"], function (require, exports, eth_wallet_9, index_11, index_12, index_13, index_14, index_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGemInfo = exports.getGemBalance = exports.redeemToken = exports.buyToken = exports.transfer = exports.getFee = exports.deployContract = void 0;
    async function getFee(contractAddress, type) {
        const wallet = eth_wallet_9.Wallet.getInstance();
        const contract = new index_11.Contracts.GEM(wallet, contractAddress);
        const fee = type === 'buy' ? await contract.mintingFee() : await contract.redemptionFee();
        const decimals = (await contract.decimals()).toNumber();
        return eth_wallet_9.Utils.fromDecimals(fee, decimals);
    }
    exports.getFee = getFee;
    async function getGemBalance(contractAddress) {
        const wallet = eth_wallet_9.Wallet.getInstance();
        const contract = new index_11.Contracts.GEM(wallet, contractAddress);
        const balance = await contract.balanceOf(wallet.address);
        return balance;
    }
    exports.getGemBalance = getGemBalance;
    async function deployContract(options, token, callback, confirmationCallback) {
        const wallet = eth_wallet_9.Wallet.getInstance();
        index_13.registerSendTxEvents({
            transactionHash: callback,
            confirmation: confirmationCallback
        });
        const gem = new index_11.Contracts.GEM(wallet);
        const receipt = await gem.deploy({
            name: options.name,
            symbol: options.symbol,
            cap: eth_wallet_9.Utils.toDecimals(options.cap).dp(0),
            mintingFee: eth_wallet_9.Utils.toDecimals(options.mintingFee).dp(0),
            redemptionFee: eth_wallet_9.Utils.toDecimals(options.redemptionFee).dp(0),
            price: eth_wallet_9.Utils.toDecimals(options.price).dp(0),
            baseToken: (token === null || token === void 0 ? void 0 : token.address) || ""
        });
        return gem.address;
    }
    exports.deployContract = deployContract;
    async function transfer(contractAddress, to, amount) {
        const wallet = eth_wallet_9.Wallet.getInstance();
        const contract = new index_11.Contracts.GEM(wallet, contractAddress);
        const receipt = await contract.transfer({
            to,
            amount: new eth_wallet_9.BigNumber(amount)
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
        const wallet = eth_wallet_9.Wallet.getInstance();
        const gem = new index_11.Contracts.GEM(wallet, contractAddress);
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
            const baseToken = (_a = index_14.DefaultTokens[chainId]) === null || _a === void 0 ? void 0 : _a.find(t => { var _a; return ((_a = t.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == baseTokenValue.toLowerCase(); });
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
            index_13.registerSendTxEvents({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_9.Wallet.getInstance();
            const tokenDecimals = (token === null || token === void 0 ? void 0 : token.decimals) || 18;
            const amount = eth_wallet_9.Utils.toDecimals(backerCoinAmount, tokenDecimals).dp(0);
            const _commissions = (commissions || []).filter(v => v.chainId === index_15.getChainId()).map(v => {
                return {
                    to: v.walletAddress,
                    amount: amount.times(v.share)
                };
            });
            const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)) : new eth_wallet_9.BigNumber(0);
            const contract = new index_11.Contracts.GEM(wallet, contractAddress);
            let receipt;
            if (commissionsAmount.isZero()) {
                receipt = await contract.buy(amount);
            }
            else {
                let proxyAddress = index_14.getContractAddress('Proxy');
                const proxy = new index_12.Contracts.Proxy(wallet, proxyAddress);
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
            index_13.registerSendTxEvents({
                transactionHash: callback,
                confirmation: confirmationCallback
            });
            const wallet = eth_wallet_9.Wallet.getInstance();
            const contract = new index_11.Contracts.GEM(wallet, address);
            const receipt = await contract.redeem(eth_wallet_9.Utils.toDecimals(gemAmount).dp(0));
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
define("@scom/scom-gem-token/scconfig.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-gem-token/scconfig.json.ts'/> 
    exports.default = {
        "env": "testnet",
        "logo": "logo",
        "main": "@scom-gem-token/main",
        "assets": "@scom-gem-token/assets",
        "moduleDir": "modules",
        "modules": {
            "@scom-gem-token/assets": {
                "path": "assets"
            },
            "@scom-gem-token/interface": {
                "path": "interface"
            },
            "@scom-gem-token/utils": {
                "path": "utils"
            },
            "@scom-gem-token/store": {
                "path": "store"
            },
            "@scom-gem-token/wallet": {
                "path": "wallet"
            },
            "@scom-gem-token/token-selection": {
                "path": "token-selection"
            },
            "@scom-gem-token/alert": {
                "path": "alert"
            },
            "@scom-gem-token/config": {
                "path": "config"
            },
            "@scom-gem-token/main": {
                "path": "main"
            },
            "@scom-gem-token/loading": {
                "path": "loading"
            }
        },
        "dependencies": {
            "@ijstech/eth-contract": "*",
            "@scom/scom-gem-token-contract": "*"
        },
        "contractInfo": {
            "43113": {
                "Proxy": {
                    "address": "0x7f1EAB0db83c02263539E3bFf99b638E61916B96"
                }
            }
        },
        "embedderCommissionFee": "0.01"
    };
});
define("@scom/scom-gem-token", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-gem-token/utils/index.ts", "@scom/scom-gem-token/store/index.ts", "@scom/scom-gem-token/wallet/index.ts", "@scom/scom-gem-token/index.css.ts", "@scom/scom-gem-token/assets.ts", "@scom/scom-gem-token/API.ts", "@scom/scom-gem-token/scconfig.json.ts"], function (require, exports, components_13, eth_wallet_10, index_16, index_17, index_18, index_css_4, assets_4, API_1, scconfig_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_13.Styles.Theme.ThemeVars;
    const buyTooltip = 'The fee the project owner will receive for token minting';
    const redeemTooltip = 'The spread the project owner will receive for redemptions';
    let ScomGemToken = class ScomGemToken extends components_13.Module {
        constructor(parent, options) {
            super(parent, options);
            this._oldData = {};
            this._data = {};
            this.isApproving = false;
            this.tag = {};
            this.oldTag = {};
            this.defaultEdit = true;
            this.onWalletConnect = async (connected) => {
                let chainId = index_18.getChainId();
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
                    this.lblBalance.caption = token ? `${(await index_16.getTokenBalance(token)).toFixed(2)} ${symbol}` : `0 ${symbol}`;
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
                const result = await API_1.deployContract(params, this.gemInfo.baseToken, callback, confirmationCallback);
            };
            this.onBuyToken = async (quantity) => {
                this.mdAlert.closeModal();
                if (!this.gemInfo.name)
                    return;
                const callback = (error, receipt) => {
                    if (error) {
                        this.mdAlert.message = {
                            status: 'error',
                            content: index_16.parseContractError(error)
                        };
                        this.mdAlert.showModal();
                    }
                };
                await API_1.buyToken(this.contract, quantity, this.gemInfo.baseToken, this._data.commissions, callback, async (result) => {
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
                            content: index_16.parseContractError(error)
                        };
                        this.mdAlert.showModal();
                    }
                };
                const gemAmount = this.edtAmount.value;
                await API_1.redeemToken(this.contract, gemAmount, callback, async (result) => {
                    console.log('redeemToken: ', result);
                    this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
                    this.edtAmount.value = '';
                    this.backerTokenBalanceLb.caption = '0.00';
                });
            };
            if (scconfig_json_1.default) {
                index_17.setDataFromSCConfig(scconfig_json_1.default);
            }
            this.$eventBus = components_13.application.EventBus;
            this.registerEvent();
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
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
            return ((_b = (_a = this.gemInfo) === null || _a === void 0 ? void 0 : _a.baseToken) === null || _b === void 0 ? void 0 : _b.symbol) || '';
        }
        async onSetupPage(isWalletConnected) {
            if (isWalletConnected)
                this.networkPicker.setNetworkByChainId(index_18.getChainId());
            await this.initApprovalAction();
        }
        getEmbedderActions() {
            const propertiesSchema = {
                type: 'object',
                properties: {}
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
                    backgroundColor: {
                        type: 'string',
                        format: 'color',
                        readOnly: true
                    },
                    fontColor: {
                        type: 'string',
                        format: 'color',
                        readOnly: true
                    },
                    inputBackgroundColor: {
                        type: 'string',
                        format: 'color',
                        readOnly: true
                    },
                    inputFontColor: {
                        type: 'string',
                        format: 'color',
                        readOnly: true
                    },
                    buttonBackgroundColor: {
                        type: 'string',
                        format: 'color',
                        readOnly: true
                    }
                }
            };
            return this._getActions(propertiesSchema, themeSchema);
        }
        getActions() {
            const propertiesSchema = {
                type: 'object',
                properties: {
                    "contract": {
                        type: 'string'
                    }
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
            };
            return this._getActions(propertiesSchema, themeSchema);
        }
        _getActions(propertiesSchema, themeSchema) {
            const actions = [
                {
                    name: 'Settings',
                    icon: 'cog',
                    command: (builder, userInputData) => {
                        return {
                            execute: async () => {
                                this._oldData = Object.assign({}, this._data);
                                if (userInputData.dappType != undefined)
                                    this._data.dappType = userInputData.dappType;
                                if (userInputData.logo != undefined)
                                    this._data.logo = userInputData.logo;
                                if (userInputData.description != undefined)
                                    this._data.description = userInputData.description;
                                this.configDApp.data = this._data;
                                this.refreshDApp();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                            },
                            undo: async () => {
                                this._data = Object.assign({}, this._oldData);
                                this.configDApp.data = this._data;
                                this.refreshDApp();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: propertiesSchema
                },
                {
                    name: 'Theme Settings',
                    icon: 'palette',
                    command: (builder, userInputData) => {
                        return {
                            execute: async () => {
                                if (!userInputData)
                                    return;
                                this.oldTag = Object.assign({}, this.tag);
                                if (builder)
                                    builder.setTag(userInputData);
                                else
                                    this.setTag(userInputData);
                            },
                            undo: () => {
                                if (!userInputData)
                                    return;
                                this.tag = Object.assign({}, this.oldTag);
                                if (builder)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.oldTag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: themeSchema
                }
            ];
            return actions;
        }
        getConfigurators() {
            let self = this;
            return [
                {
                    name: 'Commissions',
                    target: 'Embedders',
                    elementName: 'i-scom-gem-token-config',
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
                        element.onCustomCommissionsChanged = async (data) => {
                            let resultingData = Object.assign(Object.assign({}, self._data), data);
                            await self.setData(resultingData);
                            await callback(data);
                        };
                    }
                }
            ];
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            this.configDApp.data = data;
            const commissionFee = index_17.getEmbedderCommissionFee();
            this.lbOrderTotal.caption = `Total (+${new eth_wallet_10.BigNumber(commissionFee).times(100)}% Commission Fee)`;
            this.updateContractAddress();
            this.refreshDApp();
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop))
                    this.tag[prop] = newValue[prop];
            }
            this.updateTheme();
        }
        updateStyle(name, value) {
            value ?
                this.style.setProperty(name, value) :
                this.style.removeProperty(name);
        }
        updateTheme() {
            var _a, _b, _c, _d, _e;
            this.updateStyle('--text-primary', (_a = this.tag) === null || _a === void 0 ? void 0 : _a.fontColor);
            this.updateStyle('--background-main', (_b = this.tag) === null || _b === void 0 ? void 0 : _b.backgroundColor);
            this.updateStyle('--input-font_color', (_c = this.tag) === null || _c === void 0 ? void 0 : _c.inputFontColor);
            this.updateStyle('--input-background', (_d = this.tag) === null || _d === void 0 ? void 0 : _d.inputBackgroundColor);
            this.updateStyle('--colors-primary-main', (_e = this.tag) === null || _e === void 0 ? void 0 : _e.buttonBackgroundColor);
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
                                content: index_16.parseContractError(error)
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
                        content: index_16.parseContractError(error)
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
            this.imgLogo.url = this.imgLogo2.url = this._data.logo || assets_4.default.fullPath('img/gem-logo.png');
            this.gemInfo = this.contract ? await API_1.getGemInfo(this.contract) : null;
            console.log('this.gemInfo', this.gemInfo);
            if (this.gemInfo) {
                this.pnlInputFields.visible = true;
                this.pnlUnsupportedNetwork.visible = false;
                this.renderTokenInput();
                const buyDesc = `Use ${this.gemInfo.name || ''} for services on Secure Compute, decentralized hosting, audits, sub-domains and more. Full backed, Redeemable and transparent at all times!`;
                const redeemDesc = `Redeem your ${this.gemInfo.name || ''} Tokens for the underlying token.`;
                const description = this._data.description || (this.isBuy ? buyDesc : redeemDesc);
                this.markdownViewer.load(description);
                this.fromTokenLb.caption = `1 ${this.gemInfo.name || ''}`;
                this.toTokenLb.caption = `1 ${this.tokenSymbol}`;
                this.lblTitle.caption = this.lblTitle2.caption = `${this.isBuy ? 'Buy' : 'Redeem'} ${this.gemInfo.name || ''} - GEM Tokens`;
                this.backerStack.visible = !this.isBuy;
                this.balanceLayout.templateAreas = [['qty'], ['balance'], ['tokenInput'], ['redeem']];
                this.pnlQty.visible = this.isBuy;
                this.edtGemQty.readOnly = !this.contract;
                this.edtGemQty.value = "";
                if (!this.isBuy) {
                    this.btnSubmit.enabled = false;
                    this.btnApprove.visible = false;
                    this.backerTokenImg.url = assets_4.default.tokenPath(this.gemInfo.baseToken, index_18.getChainId());
                    this.backerTokenBalanceLb.caption = '0.00';
                }
                const feeValue = this.isBuy ? eth_wallet_10.Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : eth_wallet_10.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
                this.feeLb.caption = `${feeValue || ''} ${this.gemInfo.name}`;
                const qty = Number(this.edtGemQty.value);
                const totalGemTokens = new eth_wallet_10.BigNumber(qty).minus(new eth_wallet_10.BigNumber(qty).times(feeValue)).toFixed();
                this.lbYouWillGet.caption = `${totalGemTokens} ${this.gemInfo.name}`;
                this.feeTooltip.tooltip.content = this.isBuy ? buyTooltip : redeemTooltip;
                this.lblBalance.caption = `${(await this.getBalance()).toFixed(2)} ${this.tokenSymbol}`;
                this.updateTokenBalance();
            }
            else {
                this.pnlInputFields.visible = false;
                this.pnlUnsupportedNetwork.visible = true;
            }
        }
        async init() {
            this.isReadyCallbackQueued = true;
            super.init();
            await this.onSetupPage(index_18.isWalletConnected());
            // if (!this.tag || (typeof this.tag === 'object' && !Object.keys(this.tag).length)) {
            //   this.setTag({
            //     fontColor: '#000000',
            //     inputFontColor: '#ffffff',
            //     inputBackgroundColor: '#333333',
            //     buttonBackgroundColor: '#FE6502',
            //     backgroundColor: '#ffffff'
            //   });
            // }
            // this.$eventBus.dispatch('embedInitialized', this);
            this._data.dappType = this.getAttribute('dappType', true);
            this._data.description = this.getAttribute('description', true);
            this._data.hideDescription = this.getAttribute('hideDescription', true);
            this._data.logo = this.getAttribute('logo', true);
            this._data.chainSpecificProperties = this.getAttribute('chainSpecificProperties', true);
            if (this.configDApp)
                this.configDApp.data = this._data;
            this.updateContractAddress();
            await this.refreshDApp();
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        get contract() {
            var _a, _b, _c;
            return (_c = (_b = (_a = this._data.chainSpecificProperties) === null || _a === void 0 ? void 0 : _a[index_18.getChainId()]) === null || _b === void 0 ? void 0 : _b.contract) !== null && _c !== void 0 ? _c : '';
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
                this._entryContract = index_17.getContractAddress('Proxy');
                this.approvalModelAction = index_16.getERC20ApprovalModelAction(this._entryContract, {
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
                        this.btnApprove.enabled = new eth_wallet_10.BigNumber(this.edtGemQty.value).gt(0);
                        this.isApproving = false;
                    },
                    onToBePaid: async (token) => {
                        this.btnApprove.visible = false;
                        this.isApproving = false;
                        this.btnSubmit.enabled = new eth_wallet_10.BigNumber(this.edtAmount.value).gt(0);
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
                    this._entryContract = index_17.getContractAddress('Proxy');
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
            this.approvalModelAction.doApproveAction(this.gemInfo.baseToken, this.edtAmount.value);
        }
        async onQtyChanged() {
            const qty = Number(this.edtGemQty.value);
            const backerCoinAmount = this.getBackerCoinAmount(qty);
            const commissionFee = index_17.getEmbedderCommissionFee();
            this.edtAmount.value = new eth_wallet_10.BigNumber(qty).times(commissionFee).plus(qty).toFixed();
            const feeValue = this.isBuy ? eth_wallet_10.Utils.fromDecimals(this.gemInfo.mintingFee).toFixed() : eth_wallet_10.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
            const totalGemTokens = new eth_wallet_10.BigNumber(qty).minus(new eth_wallet_10.BigNumber(qty).times(feeValue)).toFixed();
            this.lbYouWillGet.caption = `${totalGemTokens} ${this.gemInfo.name}`;
            this.btnApprove.enabled = new eth_wallet_10.BigNumber(this.edtGemQty.value).gt(0);
            if (this.approvalModelAction)
                this.approvalModelAction.checkAllowance(this.gemInfo.baseToken, eth_wallet_10.Utils.toDecimals(backerCoinAmount, this.gemInfo.baseToken.decimals).toFixed());
        }
        async onAmountChanged() {
            const gemAmount = Number(this.edtAmount.value);
            this.backerTokenBalanceLb.caption = this.getBackerCoinAmount(gemAmount).toFixed(2);
            const balance = await this.getBalance();
            this.btnSubmit.enabled = balance.gt(0) && new eth_wallet_10.BigNumber(this.edtAmount.value).gt(0) && new eth_wallet_10.BigNumber(this.edtAmount.value).isLessThanOrEqualTo(balance);
        }
        getBackerCoinAmount(gemAmount) {
            const redemptionFee = eth_wallet_10.Utils.fromDecimals(this.gemInfo.redemptionFee).toFixed();
            const price = eth_wallet_10.Utils.fromDecimals(this.gemInfo.price).toFixed();
            return gemAmount / Number(price) - (gemAmount / Number(price) * Number(redemptionFee));
        }
        getGemAmount(backerCoinAmount) {
            const mintingFee = eth_wallet_10.Utils.fromDecimals(this.gemInfo.mintingFee).toFixed();
            const price = eth_wallet_10.Utils.fromDecimals(this.gemInfo.price).toFixed();
            return (backerCoinAmount - (backerCoinAmount * Number(mintingFee))) * Number(price);
        }
        async getBalance(token) {
            let balance = new eth_wallet_10.BigNumber(0);
            const tokenData = token || this.gemInfo.baseToken;
            if (this.isBuy && tokenData) {
                balance = await index_16.getTokenBalance(tokenData);
            }
            else if (!this.isBuy && this.contract) {
                balance = await API_1.getGemBalance(this.contract);
                balance = eth_wallet_10.Utils.fromDecimals(balance);
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
        renderTokenInput() {
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
                this.gemLogoStack.visible = true;
                this.gemLogoStack.clearInnerHTML();
                this.gemLogoStack.append(this.$render("i-image", { url: this._data.logo, class: index_css_4.imageStyle, width: 30, height: 30, fallbackUrl: assets_4.default.fullPath('img/gem-logo.png') }));
                this.maxStack.visible = !!this.contract;
                this.gridTokenInput.templateColumns = ['50px', 'auto', '100px'];
            }
        }
        onNetworkSelected(network) {
            console.log('network selected', network);
        }
        render() {
            return (this.$render("i-panel", { background: { color: Theme.background.main } },
                this.$render("i-panel", null,
                    this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay", visible: false },
                        this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                            this.$render("i-icon", { class: "i-loading-spinner_icon", width: 24, height: 24, name: "spinner", fill: "#FD4A4C" }),
                            this.$render("i-label", { caption: "Deploying...", font: { color: '#FD4A4C', size: '1.2em' }, class: "i-loading-spinner_text" }))),
                    this.$render("i-grid-layout", { id: 'gridDApp', width: '100%', height: '100%', templateColumns: ['repeat(2, 1fr)'], padding: { bottom: '1.563rem' } },
                        this.$render("i-vstack", { id: "pnlDescription", padding: { top: '0.5rem', bottom: '0.5rem', left: '5.25rem', right: '6.313rem' }, gap: "0.813rem" },
                            this.$render("i-hstack", null,
                                this.$render("i-image", { id: 'imgLogo', class: index_css_4.imageStyle, height: 100 })),
                            this.$render("i-label", { id: "lblTitle", font: { bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' } }),
                            this.$render("i-markdown", { id: 'markdownViewer', class: index_css_4.markdownStyle, width: '100%', height: '100%', font: { size: '1rem' } })),
                        this.$render("i-vstack", { gap: "0.5rem", padding: { top: '1rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, verticalAlignment: 'space-between' },
                            this.$render("i-vstack", { horizontalAlignment: 'center', id: "pnlLogoTitle", gap: '0.5rem' },
                                this.$render("i-image", { id: 'imgLogo2', class: index_css_4.imageStyle, height: 100 }),
                                this.$render("i-label", { id: "lblTitle2", font: { bold: true, size: '1.25rem', color: '#3940F1', transform: 'uppercase' } })),
                            this.$render("i-label", { caption: "Price", font: { size: '1rem' }, opacity: 0.6 }),
                            this.$render("i-hstack", { gap: "4px", class: index_css_4.centerStyle, margin: { bottom: '1rem' } },
                                this.$render("i-label", { id: "fromTokenLb", font: { bold: true, size: '1.5rem' } }),
                                this.$render("i-label", { caption: "=", font: { bold: true, size: '1.5rem' } }),
                                this.$render("i-label", { id: "toTokenLb", font: { bold: true, size: '1.5rem' } })),
                            this.$render("i-grid-layout", { width: '100%', verticalAlignment: 'center', padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, templateColumns: ['1fr', '2fr'], templateRows: ['auto'], templateAreas: [
                                    ['lbNetwork', 'network']
                                ] },
                                this.$render("i-label", { caption: "Network", grid: { area: 'lbNetwork' }, font: { size: '0.875rem' } }),
                                this.$render("i-scom-network-picker", { id: 'networkPicker', type: "combobox", grid: { area: 'network' }, networks: index_17.SupportedNetworks, switchNetworkOnSelect: true, selectedChainId: index_18.getChainId(), onCustomNetworkSelected: this.onNetworkSelected })),
                            this.$render("i-vstack", { gap: "0.5rem", id: 'pnlInputFields' },
                                this.$render("i-grid-layout", { id: "balanceLayout", gap: { column: '0.5rem', row: '0.25rem' } },
                                    this.$render("i-hstack", { id: 'pnlQty', visible: false, horizontalAlignment: 'end', verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'qty' } },
                                        this.$render("i-label", { caption: 'Qty', font: { size: '1rem', bold: true }, opacity: 0.6 }),
                                        this.$render("i-input", { id: 'edtGemQty', value: 1, onChanged: this.onQtyChanged.bind(this), class: index_css_4.inputStyle, inputType: 'number', font: { size: '1rem', bold: true }, border: { radius: 4 } })),
                                    this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: 'center', gap: "0.5rem", grid: { area: 'balance' } },
                                        this.$render("i-label", { id: "lbOrderTotal", caption: 'Total', font: { size: '1rem' } }),
                                        this.$render("i-hstack", { verticalAlignment: 'center', gap: "0.5rem" },
                                            this.$render("i-label", { caption: 'Balance:', font: { size: '1rem' }, opacity: 0.6 }),
                                            this.$render("i-label", { id: 'lblBalance', font: { size: '1rem' }, opacity: 0.6 }))),
                                    this.$render("i-grid-layout", { id: 'gridTokenInput', verticalAlignment: "center", templateColumns: ['60%', 'auto'], border: { radius: 16 }, overflow: "hidden", background: { color: Theme.input.background }, font: { color: Theme.input.fontColor }, height: 56, width: "100%", grid: { area: 'tokenInput' } },
                                        this.$render("i-panel", { id: "gemLogoStack", padding: { left: 10 }, visible: false }),
                                        this.$render("i-scom-gem-token-selection", { id: "tokenElm", class: index_css_4.tokenSelectionStyle, width: "100%" }),
                                        this.$render("i-input", { id: "edtAmount", width: '100%', height: '100%', minHeight: 40, class: index_css_4.inputStyle, inputType: 'number', font: { size: '1.25rem' }, opacity: 0.3, onChanged: this.onAmountChanged.bind(this) }),
                                        this.$render("i-hstack", { id: "maxStack", horizontalAlignment: "end", visible: false },
                                            this.$render("i-button", { caption: "Max", padding: { top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }, margin: { right: 10 }, font: { size: '0.875rem', color: Theme.colors.primary.contrastText }, onClick: () => this.onSetMaxBalance() }))),
                                    this.$render("i-hstack", { id: "backerStack", horizontalAlignment: "space-between", verticalAlignment: "center", grid: { area: 'redeem' }, margin: { top: '1rem', bottom: '1rem' }, maxWidth: "50%", visible: false },
                                        this.$render("i-label", { caption: 'You get:', font: { size: '1rem' } }),
                                        this.$render("i-image", { id: "backerTokenImg", width: 20, height: 20, fallbackUrl: assets_4.default.tokenPath() }),
                                        this.$render("i-label", { id: "backerTokenBalanceLb", caption: '0.00', font: { size: '1rem' } }))),
                                this.$render("i-vstack", { horizontalAlignment: "center", verticalAlignment: 'center', gap: "8px", margin: { bottom: '1.313rem' } },
                                    this.$render("i-button", { id: "btnApprove", minWidth: '100%', caption: "Approve", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, visible: false, onClick: this.onApprove.bind(this) }),
                                    this.$render("i-button", { id: 'btnSubmit', minWidth: '100%', caption: 'Submit', padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, font: { size: '1rem', color: Theme.colors.primary.contrastText, bold: true }, background: { color: Theme.colors.primary.main }, rightIcon: { visible: false, fill: Theme.colors.primary.contrastText }, border: { radius: 12 }, onClick: this.onSubmit.bind(this), enabled: false })),
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
                this.$render("i-scom-gem-token-config", { id: 'configDApp', visible: false }),
                this.$render("i-scom-gem-token-alert", { id: 'mdAlert' })));
        }
    };
    ScomGemToken = __decorate([
        components_13.customElements('i-scom-gem-token')
    ], ScomGemToken);
    exports.default = ScomGemToken;
});
