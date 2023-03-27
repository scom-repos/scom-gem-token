export default {
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
}