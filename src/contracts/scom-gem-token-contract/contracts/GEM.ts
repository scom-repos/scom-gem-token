import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./GEM.json";
export interface IDeployParams {name:string;symbol:string;cap:number|BigNumber;baseToken:string;price:number|BigNumber;mintingFee:number|BigNumber;redemptionFee:number|BigNumber}
export interface IAllowanceParams {owner:string;spender:string}
export interface IApproveParams {spender:string;amount:number|BigNumber}
export interface IDecreaseAllowanceParams {spender:string;subtractedValue:number|BigNumber}
export interface IIncreaseAllowanceParams {spender:string;addedValue:number|BigNumber}
export interface ITransferParams {to:string;amount:number|BigNumber}
export interface ITransferFromParams {from:string;to:string;amount:number|BigNumber}
export class GEM extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(params: IDeployParams, options?: TransactionOptions): Promise<string>{
        return this.__deploy([params.name,params.symbol,this.wallet.utils.toString(params.cap),params.baseToken,this.wallet.utils.toString(params.price),this.wallet.utils.toString(params.mintingFee),this.wallet.utils.toString(params.redemptionFee)], options);
    }
    parseApprovalEvent(receipt: TransactionReceipt): GEM.ApprovalEvent[]{
        return this.parseEvents(receipt, "Approval").map(e=>this.decodeApprovalEvent(e));
    }
    decodeApprovalEvent(event: Event): GEM.ApprovalEvent{
        let result = event.data;
        return {
            owner: result.owner,
            spender: result.spender,
            value: new BigNumber(result.value),
            _event: event
        };
    }
    parseAuthorizeEvent(receipt: TransactionReceipt): GEM.AuthorizeEvent[]{
        return this.parseEvents(receipt, "Authorize").map(e=>this.decodeAuthorizeEvent(e));
    }
    decodeAuthorizeEvent(event: Event): GEM.AuthorizeEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parseBuyEvent(receipt: TransactionReceipt): GEM.BuyEvent[]{
        return this.parseEvents(receipt, "Buy").map(e=>this.decodeBuyEvent(e));
    }
    decodeBuyEvent(event: Event): GEM.BuyEvent{
        let result = event.data;
        return {
            buyer: result.buyer,
            baseTokenAmount: new BigNumber(result.baseTokenAmount),
            gemAmount: new BigNumber(result.gemAmount),
            fee: new BigNumber(result.fee),
            _event: event
        };
    }
    parseDeauthorizeEvent(receipt: TransactionReceipt): GEM.DeauthorizeEvent[]{
        return this.parseEvents(receipt, "Deauthorize").map(e=>this.decodeDeauthorizeEvent(e));
    }
    decodeDeauthorizeEvent(event: Event): GEM.DeauthorizeEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parsePausedEvent(receipt: TransactionReceipt): GEM.PausedEvent[]{
        return this.parseEvents(receipt, "Paused").map(e=>this.decodePausedEvent(e));
    }
    decodePausedEvent(event: Event): GEM.PausedEvent{
        let result = event.data;
        return {
            account: result.account,
            _event: event
        };
    }
    parseRedeemEvent(receipt: TransactionReceipt): GEM.RedeemEvent[]{
        return this.parseEvents(receipt, "Redeem").map(e=>this.decodeRedeemEvent(e));
    }
    decodeRedeemEvent(event: Event): GEM.RedeemEvent{
        let result = event.data;
        return {
            redeemer: result.redeemer,
            gemAmount: new BigNumber(result.gemAmount),
            baseTokenAmount: new BigNumber(result.baseTokenAmount),
            fee: new BigNumber(result.fee),
            _event: event
        };
    }
    parseStartOwnershipTransferEvent(receipt: TransactionReceipt): GEM.StartOwnershipTransferEvent[]{
        return this.parseEvents(receipt, "StartOwnershipTransfer").map(e=>this.decodeStartOwnershipTransferEvent(e));
    }
    decodeStartOwnershipTransferEvent(event: Event): GEM.StartOwnershipTransferEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parseTransferEvent(receipt: TransactionReceipt): GEM.TransferEvent[]{
        return this.parseEvents(receipt, "Transfer").map(e=>this.decodeTransferEvent(e));
    }
    decodeTransferEvent(event: Event): GEM.TransferEvent{
        let result = event.data;
        return {
            from: result.from,
            to: result.to,
            value: new BigNumber(result.value),
            _event: event
        };
    }
    parseTransferOwnershipEvent(receipt: TransactionReceipt): GEM.TransferOwnershipEvent[]{
        return this.parseEvents(receipt, "TransferOwnership").map(e=>this.decodeTransferOwnershipEvent(e));
    }
    decodeTransferOwnershipEvent(event: Event): GEM.TransferOwnershipEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parseTreasuryRedeemEvent(receipt: TransactionReceipt): GEM.TreasuryRedeemEvent[]{
        return this.parseEvents(receipt, "TreasuryRedeem").map(e=>this.decodeTreasuryRedeemEvent(e));
    }
    decodeTreasuryRedeemEvent(event: Event): GEM.TreasuryRedeemEvent{
        let result = event.data;
        return {
            baseTokenAmount: new BigNumber(result.baseTokenAmount),
            newFeeBalance: new BigNumber(result.newFeeBalance),
            _event: event
        };
    }
    parseUnpausedEvent(receipt: TransactionReceipt): GEM.UnpausedEvent[]{
        return this.parseEvents(receipt, "Unpaused").map(e=>this.decodeUnpausedEvent(e));
    }
    decodeUnpausedEvent(event: Event): GEM.UnpausedEvent{
        let result = event.data;
        return {
            account: result.account,
            _event: event
        };
    }
    parseUpdateCapEvent(receipt: TransactionReceipt): GEM.UpdateCapEvent[]{
        return this.parseEvents(receipt, "UpdateCap").map(e=>this.decodeUpdateCapEvent(e));
    }
    decodeUpdateCapEvent(event: Event): GEM.UpdateCapEvent{
        let result = event.data;
        return {
            cap: new BigNumber(result.cap),
            _event: event
        };
    }
    parseUpdateMintingFeeEvent(receipt: TransactionReceipt): GEM.UpdateMintingFeeEvent[]{
        return this.parseEvents(receipt, "UpdateMintingFee").map(e=>this.decodeUpdateMintingFeeEvent(e));
    }
    decodeUpdateMintingFeeEvent(event: Event): GEM.UpdateMintingFeeEvent{
        let result = event.data;
        return {
            mintingFee: new BigNumber(result.mintingFee),
            _event: event
        };
    }
    parseUpdateRedemptionFeeEvent(receipt: TransactionReceipt): GEM.UpdateRedemptionFeeEvent[]{
        return this.parseEvents(receipt, "UpdateRedemptionFee").map(e=>this.decodeUpdateRedemptionFeeEvent(e));
    }
    decodeUpdateRedemptionFeeEvent(event: Event): GEM.UpdateRedemptionFeeEvent{
        let result = event.data;
        return {
            redemptionFee: new BigNumber(result.redemptionFee),
            _event: event
        };
    }
    parseUpdateTreasuryEvent(receipt: TransactionReceipt): GEM.UpdateTreasuryEvent[]{
        return this.parseEvents(receipt, "UpdateTreasury").map(e=>this.decodeUpdateTreasuryEvent(e));
    }
    decodeUpdateTreasuryEvent(event: Event): GEM.UpdateTreasuryEvent{
        let result = event.data;
        return {
            treasury: result.treasury,
            _event: event
        };
    }
    allowance: {
        (params: IAllowanceParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    approve: {
        (params: IApproveParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IApproveParams, options?: TransactionOptions) => Promise<boolean>;
        txData: (params: IApproveParams, options?: TransactionOptions) => Promise<string>;
    }
    balanceOf: {
        (account:string, options?: TransactionOptions): Promise<BigNumber>;
    }
    baseToken: {
        (options?: TransactionOptions): Promise<string>;
    }
    buy: {
        (amount:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (amount:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (amount:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    cap: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    decimals: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    decimalsDelta: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    decreaseAllowance: {
        (params: IDecreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IDecreaseAllowanceParams, options?: TransactionOptions) => Promise<boolean>;
        txData: (params: IDecreaseAllowanceParams, options?: TransactionOptions) => Promise<string>;
    }
    deny: {
        (user:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (user:string, options?: TransactionOptions) => Promise<void>;
        txData: (user:string, options?: TransactionOptions) => Promise<string>;
    }
    depositBalance: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    feeBalance: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    increaseAllowance: {
        (params: IIncreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IIncreaseAllowanceParams, options?: TransactionOptions) => Promise<boolean>;
        txData: (params: IIncreaseAllowanceParams, options?: TransactionOptions) => Promise<string>;
    }
    isPermitted: {
        (param1:string, options?: TransactionOptions): Promise<boolean>;
    }
    mintingFee: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    name: {
        (options?: TransactionOptions): Promise<string>;
    }
    newCap: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    newCapEffectiveTime: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    newMintingFee: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    newMintingFeeEffectiveTime: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    newOwner: {
        (options?: TransactionOptions): Promise<string>;
    }
    newRedemptionFee: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    newRedemptionFeeEffectiveTime: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    newTreasury: {
        (options?: TransactionOptions): Promise<string>;
    }
    newTreasuryEffectiveTime: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    owner: {
        (options?: TransactionOptions): Promise<string>;
    }
    pause: {
        (options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (options?: TransactionOptions) => Promise<void>;
        txData: (options?: TransactionOptions) => Promise<string>;
    }
    paused: {
        (options?: TransactionOptions): Promise<boolean>;
    }
    permit: {
        (user:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (user:string, options?: TransactionOptions) => Promise<void>;
        txData: (user:string, options?: TransactionOptions) => Promise<string>;
    }
    price: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    redeem: {
        (amount:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (amount:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (amount:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    redeemFee: {
        (amount:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (amount:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (amount:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    redemptionFee: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    symbol: {
        (options?: TransactionOptions): Promise<string>;
    }
    sync: {
        (options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (options?: TransactionOptions) => Promise<void>;
        txData: (options?: TransactionOptions) => Promise<string>;
    }
    takeOwnership: {
        (options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (options?: TransactionOptions) => Promise<void>;
        txData: (options?: TransactionOptions) => Promise<string>;
    }
    totalSupply: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    transfer: {
        (params: ITransferParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ITransferParams, options?: TransactionOptions) => Promise<boolean>;
        txData: (params: ITransferParams, options?: TransactionOptions) => Promise<string>;
    }
    transferFrom: {
        (params: ITransferFromParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ITransferFromParams, options?: TransactionOptions) => Promise<boolean>;
        txData: (params: ITransferFromParams, options?: TransactionOptions) => Promise<string>;
    }
    transferOwnership: {
        (newOwner:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (newOwner:string, options?: TransactionOptions) => Promise<void>;
        txData: (newOwner:string, options?: TransactionOptions) => Promise<string>;
    }
    treasury: {
        (options?: TransactionOptions): Promise<string>;
    }
    unpause: {
        (options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (options?: TransactionOptions) => Promise<void>;
        txData: (options?: TransactionOptions) => Promise<string>;
    }
    updateCap: {
        (cap:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (cap:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (cap:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    updateMintingFee: {
        (mintingFee:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (mintingFee:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (mintingFee:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    updateRedemptionFee: {
        (redemptionFee:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (redemptionFee:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (redemptionFee:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    updateTreasury: {
        (treasury:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (treasury:string, options?: TransactionOptions) => Promise<void>;
        txData: (treasury:string, options?: TransactionOptions) => Promise<string>;
    }
    private assign(){
        let allowanceParams = (params: IAllowanceParams) => [params.owner,params.spender];
        let allowance_call = async (params: IAllowanceParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('allowance',allowanceParams(params),options);
            return new BigNumber(result);
        }
        this.allowance = allowance_call
        let balanceOf_call = async (account:string, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('balanceOf',[account],options);
            return new BigNumber(result);
        }
        this.balanceOf = balanceOf_call
        let baseToken_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('baseToken',[],options);
            return result;
        }
        this.baseToken = baseToken_call
        let cap_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('cap',[],options);
            return new BigNumber(result);
        }
        this.cap = cap_call
        let decimals_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('decimals',[],options);
            return new BigNumber(result);
        }
        this.decimals = decimals_call
        let decimalsDelta_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('decimalsDelta',[],options);
            return new BigNumber(result);
        }
        this.decimalsDelta = decimalsDelta_call
        let depositBalance_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('depositBalance',[],options);
            return new BigNumber(result);
        }
        this.depositBalance = depositBalance_call
        let feeBalance_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('feeBalance',[],options);
            return new BigNumber(result);
        }
        this.feeBalance = feeBalance_call
        let isPermitted_call = async (param1:string, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('isPermitted',[param1],options);
            return result;
        }
        this.isPermitted = isPermitted_call
        let mintingFee_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('mintingFee',[],options);
            return new BigNumber(result);
        }
        this.mintingFee = mintingFee_call
        let name_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('name',[],options);
            return result;
        }
        this.name = name_call
        let newCap_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newCap',[],options);
            return new BigNumber(result);
        }
        this.newCap = newCap_call
        let newCapEffectiveTime_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newCapEffectiveTime',[],options);
            return new BigNumber(result);
        }
        this.newCapEffectiveTime = newCapEffectiveTime_call
        let newMintingFee_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newMintingFee',[],options);
            return new BigNumber(result);
        }
        this.newMintingFee = newMintingFee_call
        let newMintingFeeEffectiveTime_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newMintingFeeEffectiveTime',[],options);
            return new BigNumber(result);
        }
        this.newMintingFeeEffectiveTime = newMintingFeeEffectiveTime_call
        let newOwner_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('newOwner',[],options);
            return result;
        }
        this.newOwner = newOwner_call
        let newRedemptionFee_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newRedemptionFee',[],options);
            return new BigNumber(result);
        }
        this.newRedemptionFee = newRedemptionFee_call
        let newRedemptionFeeEffectiveTime_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newRedemptionFeeEffectiveTime',[],options);
            return new BigNumber(result);
        }
        this.newRedemptionFeeEffectiveTime = newRedemptionFeeEffectiveTime_call
        let newTreasury_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('newTreasury',[],options);
            return result;
        }
        this.newTreasury = newTreasury_call
        let newTreasuryEffectiveTime_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newTreasuryEffectiveTime',[],options);
            return new BigNumber(result);
        }
        this.newTreasuryEffectiveTime = newTreasuryEffectiveTime_call
        let owner_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('owner',[],options);
            return result;
        }
        this.owner = owner_call
        let paused_call = async (options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('paused',[],options);
            return result;
        }
        this.paused = paused_call
        let price_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('price',[],options);
            return new BigNumber(result);
        }
        this.price = price_call
        let redemptionFee_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('redemptionFee',[],options);
            return new BigNumber(result);
        }
        this.redemptionFee = redemptionFee_call
        let symbol_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('symbol',[],options);
            return result;
        }
        this.symbol = symbol_call
        let totalSupply_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('totalSupply',[],options);
            return new BigNumber(result);
        }
        this.totalSupply = totalSupply_call
        let treasury_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('treasury',[],options);
            return result;
        }
        this.treasury = treasury_call
        let approveParams = (params: IApproveParams) => [params.spender,this.wallet.utils.toString(params.amount)];
        let approve_send = async (params: IApproveParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('approve',approveParams(params),options);
            return result;
        }
        let approve_call = async (params: IApproveParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('approve',approveParams(params),options);
            return result;
        }
        let approve_txData = async (params: IApproveParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('approve',approveParams(params),options);
            return result;
        }
        this.approve = Object.assign(approve_send, {
            call:approve_call
            , txData:approve_txData
        });
        let buy_send = async (amount:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('buy',[this.wallet.utils.toString(amount)],options);
            return result;
        }
        let buy_call = async (amount:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('buy',[this.wallet.utils.toString(amount)],options);
            return;
        }
        let buy_txData = async (amount:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('buy',[this.wallet.utils.toString(amount)],options);
            return result;
        }
        this.buy = Object.assign(buy_send, {
            call:buy_call
            , txData:buy_txData
        });
        let decreaseAllowanceParams = (params: IDecreaseAllowanceParams) => [params.spender,this.wallet.utils.toString(params.subtractedValue)];
        let decreaseAllowance_send = async (params: IDecreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('decreaseAllowance',decreaseAllowanceParams(params),options);
            return result;
        }
        let decreaseAllowance_call = async (params: IDecreaseAllowanceParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('decreaseAllowance',decreaseAllowanceParams(params),options);
            return result;
        }
        let decreaseAllowance_txData = async (params: IDecreaseAllowanceParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('decreaseAllowance',decreaseAllowanceParams(params),options);
            return result;
        }
        this.decreaseAllowance = Object.assign(decreaseAllowance_send, {
            call:decreaseAllowance_call
            , txData:decreaseAllowance_txData
        });
        let deny_send = async (user:string, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('deny',[user],options);
            return result;
        }
        let deny_call = async (user:string, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('deny',[user],options);
            return;
        }
        let deny_txData = async (user:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('deny',[user],options);
            return result;
        }
        this.deny = Object.assign(deny_send, {
            call:deny_call
            , txData:deny_txData
        });
        let increaseAllowanceParams = (params: IIncreaseAllowanceParams) => [params.spender,this.wallet.utils.toString(params.addedValue)];
        let increaseAllowance_send = async (params: IIncreaseAllowanceParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('increaseAllowance',increaseAllowanceParams(params),options);
            return result;
        }
        let increaseAllowance_call = async (params: IIncreaseAllowanceParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('increaseAllowance',increaseAllowanceParams(params),options);
            return result;
        }
        let increaseAllowance_txData = async (params: IIncreaseAllowanceParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('increaseAllowance',increaseAllowanceParams(params),options);
            return result;
        }
        this.increaseAllowance = Object.assign(increaseAllowance_send, {
            call:increaseAllowance_call
            , txData:increaseAllowance_txData
        });
        let pause_send = async (options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('pause',[],options);
            return result;
        }
        let pause_call = async (options?: TransactionOptions): Promise<void> => {
            let result = await this.call('pause',[],options);
            return;
        }
        let pause_txData = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('pause',[],options);
            return result;
        }
        this.pause = Object.assign(pause_send, {
            call:pause_call
            , txData:pause_txData
        });
        let permit_send = async (user:string, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('permit',[user],options);
            return result;
        }
        let permit_call = async (user:string, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('permit',[user],options);
            return;
        }
        let permit_txData = async (user:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('permit',[user],options);
            return result;
        }
        this.permit = Object.assign(permit_send, {
            call:permit_call
            , txData:permit_txData
        });
        let redeem_send = async (amount:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('redeem',[this.wallet.utils.toString(amount)],options);
            return result;
        }
        let redeem_call = async (amount:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('redeem',[this.wallet.utils.toString(amount)],options);
            return;
        }
        let redeem_txData = async (amount:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('redeem',[this.wallet.utils.toString(amount)],options);
            return result;
        }
        this.redeem = Object.assign(redeem_send, {
            call:redeem_call
            , txData:redeem_txData
        });
        let redeemFee_send = async (amount:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('redeemFee',[this.wallet.utils.toString(amount)],options);
            return result;
        }
        let redeemFee_call = async (amount:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('redeemFee',[this.wallet.utils.toString(amount)],options);
            return;
        }
        let redeemFee_txData = async (amount:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('redeemFee',[this.wallet.utils.toString(amount)],options);
            return result;
        }
        this.redeemFee = Object.assign(redeemFee_send, {
            call:redeemFee_call
            , txData:redeemFee_txData
        });
        let sync_send = async (options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('sync',[],options);
            return result;
        }
        let sync_call = async (options?: TransactionOptions): Promise<void> => {
            let result = await this.call('sync',[],options);
            return;
        }
        let sync_txData = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('sync',[],options);
            return result;
        }
        this.sync = Object.assign(sync_send, {
            call:sync_call
            , txData:sync_txData
        });
        let takeOwnership_send = async (options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('takeOwnership',[],options);
            return result;
        }
        let takeOwnership_call = async (options?: TransactionOptions): Promise<void> => {
            let result = await this.call('takeOwnership',[],options);
            return;
        }
        let takeOwnership_txData = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('takeOwnership',[],options);
            return result;
        }
        this.takeOwnership = Object.assign(takeOwnership_send, {
            call:takeOwnership_call
            , txData:takeOwnership_txData
        });
        let transferParams = (params: ITransferParams) => [params.to,this.wallet.utils.toString(params.amount)];
        let transfer_send = async (params: ITransferParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('transfer',transferParams(params),options);
            return result;
        }
        let transfer_call = async (params: ITransferParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('transfer',transferParams(params),options);
            return result;
        }
        let transfer_txData = async (params: ITransferParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('transfer',transferParams(params),options);
            return result;
        }
        this.transfer = Object.assign(transfer_send, {
            call:transfer_call
            , txData:transfer_txData
        });
        let transferFromParams = (params: ITransferFromParams) => [params.from,params.to,this.wallet.utils.toString(params.amount)];
        let transferFrom_send = async (params: ITransferFromParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('transferFrom',transferFromParams(params),options);
            return result;
        }
        let transferFrom_call = async (params: ITransferFromParams, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('transferFrom',transferFromParams(params),options);
            return result;
        }
        let transferFrom_txData = async (params: ITransferFromParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('transferFrom',transferFromParams(params),options);
            return result;
        }
        this.transferFrom = Object.assign(transferFrom_send, {
            call:transferFrom_call
            , txData:transferFrom_txData
        });
        let transferOwnership_send = async (newOwner:string, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('transferOwnership',[newOwner],options);
            return result;
        }
        let transferOwnership_call = async (newOwner:string, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('transferOwnership',[newOwner],options);
            return;
        }
        let transferOwnership_txData = async (newOwner:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('transferOwnership',[newOwner],options);
            return result;
        }
        this.transferOwnership = Object.assign(transferOwnership_send, {
            call:transferOwnership_call
            , txData:transferOwnership_txData
        });
        let unpause_send = async (options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('unpause',[],options);
            return result;
        }
        let unpause_call = async (options?: TransactionOptions): Promise<void> => {
            let result = await this.call('unpause',[],options);
            return;
        }
        let unpause_txData = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('unpause',[],options);
            return result;
        }
        this.unpause = Object.assign(unpause_send, {
            call:unpause_call
            , txData:unpause_txData
        });
        let updateCap_send = async (cap:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('updateCap',[this.wallet.utils.toString(cap)],options);
            return result;
        }
        let updateCap_call = async (cap:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('updateCap',[this.wallet.utils.toString(cap)],options);
            return;
        }
        let updateCap_txData = async (cap:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('updateCap',[this.wallet.utils.toString(cap)],options);
            return result;
        }
        this.updateCap = Object.assign(updateCap_send, {
            call:updateCap_call
            , txData:updateCap_txData
        });
        let updateMintingFee_send = async (mintingFee:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('updateMintingFee',[this.wallet.utils.toString(mintingFee)],options);
            return result;
        }
        let updateMintingFee_call = async (mintingFee:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('updateMintingFee',[this.wallet.utils.toString(mintingFee)],options);
            return;
        }
        let updateMintingFee_txData = async (mintingFee:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('updateMintingFee',[this.wallet.utils.toString(mintingFee)],options);
            return result;
        }
        this.updateMintingFee = Object.assign(updateMintingFee_send, {
            call:updateMintingFee_call
            , txData:updateMintingFee_txData
        });
        let updateRedemptionFee_send = async (redemptionFee:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('updateRedemptionFee',[this.wallet.utils.toString(redemptionFee)],options);
            return result;
        }
        let updateRedemptionFee_call = async (redemptionFee:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('updateRedemptionFee',[this.wallet.utils.toString(redemptionFee)],options);
            return;
        }
        let updateRedemptionFee_txData = async (redemptionFee:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('updateRedemptionFee',[this.wallet.utils.toString(redemptionFee)],options);
            return result;
        }
        this.updateRedemptionFee = Object.assign(updateRedemptionFee_send, {
            call:updateRedemptionFee_call
            , txData:updateRedemptionFee_txData
        });
        let updateTreasury_send = async (treasury:string, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('updateTreasury',[treasury],options);
            return result;
        }
        let updateTreasury_call = async (treasury:string, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('updateTreasury',[treasury],options);
            return;
        }
        let updateTreasury_txData = async (treasury:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('updateTreasury',[treasury],options);
            return result;
        }
        this.updateTreasury = Object.assign(updateTreasury_send, {
            call:updateTreasury_call
            , txData:updateTreasury_txData
        });
    }
}
export module GEM{
    export interface ApprovalEvent {owner:string,spender:string,value:BigNumber,_event:Event}
    export interface AuthorizeEvent {user:string,_event:Event}
    export interface BuyEvent {buyer:string,baseTokenAmount:BigNumber,gemAmount:BigNumber,fee:BigNumber,_event:Event}
    export interface DeauthorizeEvent {user:string,_event:Event}
    export interface PausedEvent {account:string,_event:Event}
    export interface RedeemEvent {redeemer:string,gemAmount:BigNumber,baseTokenAmount:BigNumber,fee:BigNumber,_event:Event}
    export interface StartOwnershipTransferEvent {user:string,_event:Event}
    export interface TransferEvent {from:string,to:string,value:BigNumber,_event:Event}
    export interface TransferOwnershipEvent {user:string,_event:Event}
    export interface TreasuryRedeemEvent {baseTokenAmount:BigNumber,newFeeBalance:BigNumber,_event:Event}
    export interface UnpausedEvent {account:string,_event:Event}
    export interface UpdateCapEvent {cap:BigNumber,_event:Event}
    export interface UpdateMintingFeeEvent {mintingFee:BigNumber,_event:Event}
    export interface UpdateRedemptionFeeEvent {redemptionFee:BigNumber,_event:Event}
    export interface UpdateTreasuryEvent {treasury:string,_event:Event}
}