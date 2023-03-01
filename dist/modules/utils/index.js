define("@pageblock-gem-token/utils/token.ts", ["require", "exports", "@ijstech/eth-wallet"], function (require, exports, eth_wallet_1) {
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
define("@pageblock-gem-token/utils/approvalModel.ts", ["require", "exports", "@ijstech/eth-wallet", "@pageblock-gem-token/utils/token.ts"], function (require, exports, eth_wallet_2, token_1) {
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
define("@pageblock-gem-token/utils", ["require", "exports", "@ijstech/eth-wallet", "@pageblock-gem-token/utils/token.ts", "@pageblock-gem-token/utils/approvalModel.ts"], function (require, exports, eth_wallet_3, token_2, approvalModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getERC20ApprovalModelAction = exports.getERC20Allowance = exports.ApprovalStatus = exports.registerSendTxEvents = exports.getTokenBalance = exports.getERC20Amount = exports.parseContractError = exports.formatNumberWithSeparators = exports.formatNumber = void 0;
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
    Object.defineProperty(exports, "getERC20Amount", { enumerable: true, get: function () { return token_2.getERC20Amount; } });
    Object.defineProperty(exports, "getTokenBalance", { enumerable: true, get: function () { return token_2.getTokenBalance; } });
    Object.defineProperty(exports, "registerSendTxEvents", { enumerable: true, get: function () { return token_2.registerSendTxEvents; } });
    Object.defineProperty(exports, "ApprovalStatus", { enumerable: true, get: function () { return approvalModel_1.ApprovalStatus; } });
    Object.defineProperty(exports, "getERC20Allowance", { enumerable: true, get: function () { return approvalModel_1.getERC20Allowance; } });
    Object.defineProperty(exports, "getERC20ApprovalModelAction", { enumerable: true, get: function () { return approvalModel_1.getERC20ApprovalModelAction; } });
});
