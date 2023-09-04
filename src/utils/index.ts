import { BigNumber, IRpcWallet } from "@ijstech/eth-wallet";
import { Contracts } from '@scom/scom-gem-token-contract';

export const formatNumber = (value: any, decimals?: number) => {
  let val = value;
  const minValue = '0.0000001';
  if (typeof value === 'string') {
    val = new BigNumber(value).toNumber();
  } else if (typeof value === 'object') {
    val = value.toNumber();
  }
  if (val != 0 && new BigNumber(val).lt(minValue)) {
    return `<${minValue}`;
  }
  return formatNumberWithSeparators(val, decimals || 2);
};

export const formatNumberWithSeparators = (value: number, precision?: number) => {
  if (!value) value = 0;
  if (precision) {
    let outputStr = '';
    if (value >= 1) {
      const unit = Math.pow(10, precision);
      const rounded = Math.floor(value * unit) / unit;
      outputStr = rounded.toLocaleString('en-US', { maximumFractionDigits: precision });
    }
    else {
      outputStr = value.toLocaleString('en-US', { maximumSignificantDigits: precision });
    }

    if (outputStr.length > 18) {
      outputStr = outputStr.substring(0, 18) + '...'
    }
    return outputStr;
  }
  else {
    return value.toLocaleString('en-US');
  }
}

export async function getProxySelectors(wallet: IRpcWallet, chainId: number, contractAddress: string): Promise<string[]> {
  if (wallet.chainId != chainId) await wallet.switchNetwork(chainId);
  let contract = new Contracts.GEM(wallet, contractAddress);
  let permittedProxyFunctions: (keyof Contracts.GEM)[] = [
    "buy",
    "redeem"
  ];
  let selectors = permittedProxyFunctions
    .map(e => e + "(" + contract._abi.filter(f => f.name == e)[0].inputs.map(f => f.type).join(',') + ")")
    .map(e => wallet.soliditySha3(e).substring(0, 10))
    .map(e => contract.address.toLowerCase() + e.replace("0x", ""));
  return selectors;
}

export {
  getERC20Amount,
  getTokenBalance,
  registerSendTxEvents
} from './token';
