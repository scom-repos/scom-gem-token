rm -rf src/contracts &&
mkdir -p src/contracts/gem-token-contract &&
mkdir -p src/contracts/scom-commission-proxy-contract &&
cp -r node_modules/@scom/gem-token-contract/src/* src/contracts/gem-token-contract &&
cp -r node_modules/@scom/scom-commission-proxy-contract/src/* src/contracts/scom-commission-proxy-contract