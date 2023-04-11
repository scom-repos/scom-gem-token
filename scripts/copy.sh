rm -rf src/contracts &&
rm -rf src/scom-network-picker &&
mkdir -p src/contracts/scom-gem-token-contract &&
mkdir -p src/contracts/scom-commission-proxy-contract &&
cp -r node_modules/@scom/scom-gem-token-contract/src/* src/contracts/scom-gem-token-contract &&
cp -r node_modules/@scom/scom-commission-proxy-contract/src/* src/contracts/scom-commission-proxy-contract &&
mkdir src/scom-network-picker &&
cp -r node_modules/@scom/scom-network-picker/src/* src/scom-network-picker &&
cp -r src/scom-network-picker/img/* src/img &&
rm -rf src/scom-network-picker/img