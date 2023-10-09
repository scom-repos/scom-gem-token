import { BigNumber } from "@ijstech/eth-wallet";
import { Contracts } from '@scom/scom-gem-token-contract';
import { State } from "../store/index";
import { FormatUtils } from "@ijstech/components";

export const formatNumber = (value: number | string | BigNumber, decimalFigures?: number) => {
  if (typeof value === 'object') {
    value = value.toFixed();
  }
  const minValue = '0.0000001';
  return FormatUtils.formatNumber(value, {decimalFigures: decimalFigures || 4, minValue});
};

export async function getProxySelectors(state: State, chainId: number, contractAddress: string): Promise<string[]> {
  const wallet = state.getRpcWallet();
  await wallet.init();
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
