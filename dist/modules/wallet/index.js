define("@pageblock-gem-token/wallet/walletList.ts", ["require", "exports", "@ijstech/eth-wallet"], function (require, exports, eth_wallet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.walletList = void 0;
    exports.walletList = [
        {
            name: eth_wallet_1.WalletPlugin.MetaMask,
            displayName: 'MetaMask',
            img: 'metamask'
        },
        {
            name: eth_wallet_1.WalletPlugin.TrustWallet,
            displayName: 'Trust Wallet',
            img: 'trustwallet'
        },
        {
            name: eth_wallet_1.WalletPlugin.BinanceChainWallet,
            displayName: 'Binance Chain Wallet',
            img: 'binanceChainWallet'
        },
        {
            name: eth_wallet_1.WalletPlugin.WalletConnect,
            displayName: 'WalletConnect',
            iconFile: 'walletconnect'
        }
    ];
});
define("@pageblock-gem-token/wallet", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@pageblock-gem-token/wallet/walletList.ts"], function (require, exports, components_1, eth_wallet_2, walletList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getChainId = exports.hasWallet = exports.connectWallet = exports.isWalletConnected = void 0;
    const defaultChainId = 1;
    function isWalletConnected() {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isWalletConnected = isWalletConnected;
    async function connectWallet(walletPlugin, eventHandlers) {
        let wallet = eth_wallet_2.Wallet.getClientInstance();
        const walletOptions = '';
        let providerOptions = walletOptions[walletPlugin];
        if (!wallet.chainId) {
            wallet.chainId = defaultChainId;
        }
        await wallet.connect(walletPlugin, {
            onAccountChanged: (account) => {
                var _a, _b;
                if (eventHandlers && eventHandlers.accountsChanged) {
                    eventHandlers.accountsChanged(account);
                }
                const connected = !!account;
                if (connected) {
                    localStorage.setItem('walletProvider', ((_b = (_a = eth_wallet_2.Wallet.getClientInstance()) === null || _a === void 0 ? void 0 : _a.clientSideProvider) === null || _b === void 0 ? void 0 : _b.walletPlugin) || '');
                }
                components_1.application.EventBus.dispatch("isWalletConnected" /* IsWalletConnected */, connected);
            },
            onChainChanged: (chainIdHex) => {
                const chainId = Number(chainIdHex);
                if (eventHandlers && eventHandlers.chainChanged) {
                    eventHandlers.chainChanged(chainId);
                }
                components_1.application.EventBus.dispatch("chainChanged" /* chainChanged */, chainId);
            }
        }, providerOptions);
        return wallet;
    }
    exports.connectWallet = connectWallet;
    const hasWallet = () => {
        let hasWallet = false;
        for (let wallet of walletList_1.walletList) {
            if (eth_wallet_2.Wallet.isInstalled(wallet.name)) {
                hasWallet = true;
                break;
            }
        }
        return hasWallet;
    };
    exports.hasWallet = hasWallet;
    const getChainId = () => {
        const wallet = eth_wallet_2.Wallet.getInstance();
        return isWalletConnected() ? wallet.chainId : defaultChainId;
    };
    exports.getChainId = getChainId;
});
