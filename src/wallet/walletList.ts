import { WalletPlugin } from '@ijstech/eth-wallet';
export const walletList = [
    {
        name: WalletPlugin.MetaMask,
        displayName: 'MetaMask',
        img: 'metamask'
    },
    {
        name: WalletPlugin.TrustWallet,
        displayName: 'Trust Wallet',
        img: 'trustwallet'
    },
    {
        name: WalletPlugin.BinanceChainWallet,
        displayName: 'Binance Chain Wallet',
        img: 'binanceChainWallet'
    },
    {
        name: WalletPlugin.WalletConnect,
        displayName: 'WalletConnect',
        iconFile: 'walletconnect'
    }
]