import { BigNumber, Erc20, Wallet, IWallet, ISendTxEventsOptions } from "@ijstech/eth-wallet";
import { ITokenObject } from "../interface";

export const getERC20Amount = async (wallet: IWallet, tokenAddress: string, decimals: number) => {
  let erc20 = new Erc20(wallet, tokenAddress, decimals);
  return await erc20.balance;
}

export const getTokenBalance = async (token: ITokenObject) => {
  const wallet = Wallet.getInstance();
  let balance = new BigNumber(0);
  if (!token) return balance;
  if (token.address) {
    balance = await getERC20Amount(wallet, token.address, token.decimals);
  } else {
    balance = await wallet.balance;
  }
  return balance;
}

export const registerSendTxEvents = (sendTxEventHandlers: ISendTxEventsOptions) => {
  const wallet = Wallet.getClientInstance();
  wallet.registerSendTxEvents({
    transactionHash: (error: Error, receipt?: string) => {
      if (sendTxEventHandlers.transactionHash) {
        sendTxEventHandlers.transactionHash(error, receipt);
      }
    },
    confirmation: (receipt: any) => {
      if (sendTxEventHandlers.confirmation) {
        sendTxEventHandlers.confirmation(receipt);
      }
    },
  })
}