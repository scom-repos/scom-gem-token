export default {
    "env": "testnet",
    "logo": "logo",
    "main": "@pageblock-gem-token/main",
    "assets": "@pageblock-gem-token/assets",
    "moduleDir": "modules",
    "modules": {
        "@pageblock-gem-token/assets": {
            "path": "assets"
        },
        "@pageblock-gem-token/interface": {
            "path": "interface"
        },
        "@pageblock-gem-token/utils": {
            "path": "utils"
        },
        "@pageblock-gem-token/store": {
            "path": "store"
        },
        "@pageblock-gem-token/wallet": {
            "path": "wallet"
        },
        "@pageblock-gem-token/token-selection": {
            "path": "token-selection"
        },
        "@pageblock-gem-token/alert": {
            "path": "alert"
        },
        "@pageblock-gem-token/config": {
            "path": "config"
        },
        "@pageblock-gem-token/main": {
            "path": "main"
        },
        "@pageblock-gem-token/loading": {
            "path": "loading"
        }
    },
    "dependencies": {
        "@ijstech/eth-contract": "*",
        "@scom/gem-token-contract": "*"
    },
    "contractInfo": {
        "43113": {
            "Proxy": {
                "address": "0x7f1EAB0db83c02263539E3bFf99b638E61916B96"
            }
        }
    },
    "commissionFee": "0.01"
}