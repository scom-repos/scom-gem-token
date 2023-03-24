import { BigNumber } from "@ijstech/eth-wallet";

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
  return formatNumberWithSeparators(val, decimals || 4);
};

export const formatNumberWithSeparators = (value: number, precision?: number) => {
  if (!value) value = 0;
  if (precision) {
    let outputStr = '';
    if (value >= 1) {
      outputStr = value.toLocaleString('en-US', { maximumFractionDigits: precision });
    }
    else {
      outputStr = value.toLocaleString('en-US', { maximumSignificantDigits: precision });
    }

    if (outputStr.length > 18) {
      outputStr = outputStr.substr(0, 18) + '...'
    }
    return outputStr;
  }
  else {
    return value.toLocaleString('en-US');
  }
}

export function parseContractError(oMessage: any): string {
  if (typeof oMessage === 'string') return oMessage;

  let message = '';
  if (oMessage.message && oMessage.message.includes('Internal JSON-RPC error.'))
    message = JSON.parse(oMessage.message.replace('Internal JSON-RPC error.\n', '')).message;

  const staticMessageMap: { [key: string]: string } = {
    'execution reverted: OAXDEX: INVALID_SIGNATURE': 'Invalid signature',
    'MetaMask Tx Signature: User denied transaction signature.': 'User denied transaction signature',
    'execution reverted: backerCoin can\'t be a null address': 'BackerCoin can\'t be a null address',
    'execution reverted: price can\'t be zero': 'Price can\'t be zero',
    'execution reverted: mintingFee can\'t exceed 1': 'MintingFee can\'t exceed 1',
    'execution reverted: redemptionFee can\'t exceed 1': 'RedemptionFee can\'t exceed 1'
  }

  return staticMessageMap[message] ?? `Unknown Error: ${message}`;
}

export function isWalletAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export {
  getERC20Amount,
  getTokenBalance,
  registerSendTxEvents
} from './token';

export {
  ApprovalStatus,
  getERC20Allowance,
  getERC20ApprovalModelAction,
  IERC20ApprovalOptions,
  IERC20ApprovalAction
} from './approvalModel';