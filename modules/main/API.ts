import { BigNumber, Utils, Wallet } from '@ijstech/eth-wallet';
import { DappType, IDeploy, ITokenObject } from '@modules/interface';
import { Contracts, deploy } from '@scom/gem-token-contract';
import { registerSendTxEvents } from '@modules/utils';

async function getFee(contractAddress: string, type: DappType) {
  const wallet = Wallet.getInstance();
  const contract = new Contracts.GEM(wallet, contractAddress);
  const fee = type === 'buy' ? await contract.mintingFee() : await contract.redemptionFee();
  const decimals = (await contract.decimals()).toNumber();
  return Utils.fromDecimals(fee, decimals);
}

async function getGemBalance(contractAddress: string) {
  const wallet = Wallet.getInstance();
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
  const wallet = Wallet.getInstance();
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
  const wallet = Wallet.getInstance();
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

async function buyToken(
  address: string,
  backerCoinAmount: number,
  callback?: any,
  confirmationCallback?: any
) {
  try {
    registerSendTxEvents({
      transactionHash: callback,
      confirmation: confirmationCallback
    });
    const wallet = Wallet.getInstance();
    const contract = new Contracts.GEM(wallet, address);
    const receipt = await contract.buy(Utils.toDecimals(backerCoinAmount).dp(0));
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
    console.error(err);
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
    const wallet = Wallet.getInstance();
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
    console.error(err);
    return null;
  }
}

export {
  deployContract,
  getFee,
  transfer,
  buyToken,
  redeemToken,
  getGemBalance
}