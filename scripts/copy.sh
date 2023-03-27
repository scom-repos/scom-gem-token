rm -rf src/contracts &&
mkdir -p src/contracts/scom-gem-token-contract &&
mkdir -p src/contracts/scom-commission-proxy-contract &&
cp -r node_modules/@scom/scom-gem-token-contract/src/* src/contracts/scom-gem-token-contract &&
cp -r node_modules/@scom/scom-commission-proxy-contract/src/* src/contracts/scom-commission-proxy-contract