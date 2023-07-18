import { BigNumber, Utils, Wallet } from '@ijstech/eth-wallet';
import { DappType, ICommissionInfo, IDeploy, IGemInfo } from './interface';
import { Contracts } from './contracts/scom-gem-token-contract/index';
import { Contracts as ProxyContracts } from './contracts/scom-commission-proxy-contract/index';
import { registerSendTxEvents } from './utils/index';
import { getEmbedderCommissionFee, getProxyAddress, getChainId, getRpcWallet } from './store/index';
import { DefaultTokens, ITokenObject } from '@scom/scom-token-list';

async function getFee(contractAddress: string, type: DappType) {
  const wallet = getRpcWallet();
  const contract = new Contracts.GEM(wallet, contractAddress);
  const fee = type === 'buy' ? await contract.mintingFee() : await contract.redemptionFee();
  const decimals = (await contract.decimals()).toNumber();
  return Utils.fromDecimals(fee, decimals);
}

async function getGemBalance(contractAddress: string) {
  const wallet = getRpcWallet();
  const contract = new Contracts.GEM(wallet, contractAddress);
  const balance = await contract.balanceOf(wallet.address);
  return balance;
}

async function deployContract(
  options: IDeploy,
  token: ITokenObject,
  callback?: any,
  confirmationCallback?: any
) {
  const wallet = Wallet.getClientInstance();
  registerSendTxEvents({
    transactionHash: callback,
    confirmation: confirmationCallback
  });
  const gem = new Contracts.GEM(wallet);
  const receipt = await gem.deploy(
    {
      name: options.name,
      symbol: options.symbol,
      cap: Utils.toDecimals(options.cap).dp(0),
      mintingFee: Utils.toDecimals(options.mintingFee).dp(0),
      redemptionFee: Utils.toDecimals(options.redemptionFee).dp(0),
      price: Utils.toDecimals(options.price).dp(0),
      baseToken: token?.address || ""
    }
  );
  return gem.address;
}

async function transfer(contractAddress: string, to: string, amount: string) {
  const wallet = Wallet.getClientInstance();
  const contract = new Contracts.GEM(wallet, contractAddress);
  const receipt = await contract.transfer({
    to,
    amount: new BigNumber(amount)
  });
  let value;
  if (receipt) {
    const event = contract.parseTransferEvent(receipt)[0];
    value = event.value;
  }
  return {
    receipt,
    value
  };
}

async function getGemInfo(contractAddress: string): Promise<IGemInfo> {
  const wallet = getRpcWallet();
  const gem = new Contracts.GEM(wallet, contractAddress);

  try {
    const [priceValue, mintingFeeValue, redemptionFeeValue, decimalsValue, capValue, baseTokenValue, nameValue, symbolValue] = await Promise.all([
      gem.price(),
      gem.mintingFee(),
      gem.redemptionFee(),
      gem.decimals(),
      gem.cap(),
      gem.baseToken(),
      gem.name(),
      gem.symbol()
    ]);
    const chainId = wallet.chainId;
    const baseToken = DefaultTokens[chainId]?.find(t => t.address?.toLowerCase() == baseTokenValue.toLowerCase());
    return {
      price: priceValue,
      mintingFee: mintingFeeValue,
      redemptionFee: redemptionFeeValue,
      decimals: decimalsValue,
      cap: capValue,
      baseToken,
      name: nameValue,
      symbol: symbolValue
    };
  }
  catch (e) {
    console.error(e);
  }
  return null;
}

async function buyToken(
  contractAddress: string,
  backerCoinAmount: number,
  token: ITokenObject,
  commissions: ICommissionInfo[],
  callback?: any,
  confirmationCallback?: any
) {
  try {
    registerSendTxEvents({
      transactionHash: callback,
      confirmation: confirmationCallback
    });
    const wallet = Wallet.getClientInstance();
    const tokenDecimals = token?.decimals || 18;
    const amount = Utils.toDecimals(backerCoinAmount, tokenDecimals).dp(0);
    const _commissions = (commissions || []).filter(v => v.chainId === getChainId()).map(v => {
      return {
        to: v.walletAddress,
        amount: amount.times(v.share)
      }
    })
    const commissionsAmount = _commissions.length ? _commissions.map(v => v.amount).reduce((a, b) => a.plus(b)) : new BigNumber(0);
    const contract = new Contracts.GEM(wallet, contractAddress);

    let receipt;
    if (commissionsAmount.isZero()) {
      receipt = await contract.buy(amount);
    }
    else {
      let proxyAddress = getProxyAddress();
      const proxy = new ProxyContracts.Proxy(wallet, proxyAddress);
      const txData = await contract.buy.txData(amount);
      const tokensIn =
      {
        token: token.address,
        amount: commissionsAmount.plus(amount),
        directTransfer: false,
        commissions: _commissions
      };
      receipt = await proxy.tokenIn({
        target: contractAddress,
        tokensIn,
        data: txData
      })
    }

    if (receipt) {
      const data = contract.parseBuyEvent(receipt)[0];
      return {
        receipt,
        data
      }
    }
    return receipt;
  }
  catch (err) {
    if (callback) callback(err);
    return null;
  }
}

async function redeemToken(
  address: string,
  gemAmount: string,
  callback?: any,
  confirmationCallback?: any
) {
  try {
    registerSendTxEvents({
      transactionHash: callback,
      confirmation: confirmationCallback
    });
    const wallet = Wallet.getClientInstance();
    const contract = new Contracts.GEM(wallet, address);
    const receipt = await contract.redeem(Utils.toDecimals(gemAmount).dp(0));
    if (receipt) {
      const data = contract.parseRedeemEvent(receipt)[0];
      return {
        receipt,
        data
      }
    }
    return receipt;
  } catch (err) {
    if (callback) callback(err);
    return null;
  }
}

export {
  deployContract,
  getFee,
  transfer,
  buyToken,
  redeemToken,
  getGemBalance,
  getGemInfo
}
