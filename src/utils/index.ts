import { BigNumber } from "@ijstech/eth-wallet";
import { ITokenObject, WETHByChainId } from '@scom/scom-token-list';
import { Contracts } from "@scom/oswap-openswap-contract";
import { State } from '../store/index';
import { getSwapProxySelectors } from '@scom/scom-dex-list';
import { IProviderUI } from '../interface';

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

const getWETH = (chainId: number): ITokenObject => {
  return WETHByChainId[chainId];
};

const getFactoryAddress = (state: State, key: string): string => {
  const factoryAddress = state.getDexDetail(key, state.getChainId())?.factoryAddress || '';
  return factoryAddress;
}

export const getProviderProxySelectors = async (state: State, providers: IProviderUI[]) => {
  const wallet = state.getRpcWallet();
  await wallet.init();
  let selectorsSet: Set<string> = new Set();
  for (let provider of providers) {
    const dex = state.getDexInfoList({ key: provider.key, chainId: provider.chainId })[0];
    if (dex) {
      const routerAddress = dex.details.find(v => v.chainId === provider.chainId)?.routerAddress || '';
      const selectors = await getSwapProxySelectors(wallet, dex.dexType, provider.chainId, routerAddress);
      selectors.forEach(v => selectorsSet.add(v));
    }
  }
  return Array.from(selectorsSet);
}

export const getPair = async (state: State, market: string, tokenA: ITokenObject, tokenB: ITokenObject) => {
  const wallet: any = state.getRpcWallet();
  let chainId = state.getChainId();
  if (!tokenA.address) tokenA = getWETH(chainId);
  if (!tokenB.address) tokenB = getWETH(chainId);
  let factory = new Contracts.OSWAP_Factory(wallet, getFactoryAddress(state, market));
  let pair = await factory.getPair({
    param1: tokenA.address!,
    param2: tokenB.address!
  });
  return pair;
}

export {
  getERC20Amount,
  getTokenBalance,
  registerSendTxEvents
} from './token';
