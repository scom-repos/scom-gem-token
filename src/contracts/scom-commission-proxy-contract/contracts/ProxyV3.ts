import {IWallet, Contract as _Contract, Transaction, TransactionReceipt, BigNumber, Event, IBatchRequestObj, TransactionOptions} from "@ijstech/eth-contract";
import Bin from "./ProxyV3.json";
export interface IAddProjectAdminParams {projectId:number|BigNumber;admin:string}
export interface ICampaignAccumulatedCommissionParams {param1:number|BigNumber;param2:string}
export interface IClaimantIdsParams {param1:string;param2:string}
export interface IGetCampaignParams {campaignId:number|BigNumber;returnArrays:boolean}
export interface IGetCampaignArrayData1Params {campaignId:number|BigNumber;targetAndSelectorsStart:number|BigNumber;targetAndSelectorsLength:number|BigNumber;referrersStart:number|BigNumber;referrersLength:number|BigNumber}
export interface IGetCampaignArrayData2Params {campaignId:number|BigNumber;inTokensStart:number|BigNumber;inTokensLength:number|BigNumber;outTokensStart:number|BigNumber;outTokensLength:number|BigNumber}
export interface IGetClaimantBalanceParams {claimant:string;token:string}
export interface IGetClaimantsInfoParams {fromId:number|BigNumber;count:number|BigNumber}
export interface IProxyCallParams {campaignId:number|BigNumber;target:string;data:string;referrer:string;to:string;tokensIn:{token:string,amount:number|BigNumber}[];tokensOut:string[]}
export interface IRemoveProjectAdminParams {projectId:number|BigNumber;admin:string}
export interface IStakeParams {projectId:number|BigNumber;token:string;amount:number|BigNumber}
export interface IStakeMultipleParams {projectId:number|BigNumber;token:string[];amount:(number|BigNumber)[]}
export interface IStakesBalanceParams {param1:number|BigNumber;param2:string}
export interface ITransferProjectOwnershipParams {projectId:number|BigNumber;newOwner:string}
export interface IUnstakeParams {projectId:number|BigNumber;token:string;amount:number|BigNumber}
export interface IUnstakeMultipleParams {projectId:number|BigNumber;token:string[];amount:(number|BigNumber)[]}
export class ProxyV3 extends _Contract{
    static _abi: any = Bin.abi;
    constructor(wallet: IWallet, address?: string){
        super(wallet, address, Bin.abi, Bin.bytecode);
        this.assign()
    }
    deploy(protocolRate:number|BigNumber, options?: TransactionOptions): Promise<string>{
        return this.__deploy([this.wallet.utils.toString(protocolRate)], options);
    }
    parseAddCommissionEvent(receipt: TransactionReceipt): ProxyV3.AddCommissionEvent[]{
        return this.parseEvents(receipt, "AddCommission").map(e=>this.decodeAddCommissionEvent(e));
    }
    decodeAddCommissionEvent(event: Event): ProxyV3.AddCommissionEvent{
        let result = event.data;
        return {
            to: result.to,
            token: result.token,
            commission: new BigNumber(result.commission),
            commissionBalance: new BigNumber(result.commissionBalance),
            protocolFee: new BigNumber(result.protocolFee),
            protocolFeeBalance: new BigNumber(result.protocolFeeBalance),
            _event: event
        };
    }
    parseAddProjectAdminEvent(receipt: TransactionReceipt): ProxyV3.AddProjectAdminEvent[]{
        return this.parseEvents(receipt, "AddProjectAdmin").map(e=>this.decodeAddProjectAdminEvent(e));
    }
    decodeAddProjectAdminEvent(event: Event): ProxyV3.AddProjectAdminEvent{
        let result = event.data;
        return {
            projectId: new BigNumber(result.projectId),
            admin: result.admin,
            _event: event
        };
    }
    parseAuthorizeEvent(receipt: TransactionReceipt): ProxyV3.AuthorizeEvent[]{
        return this.parseEvents(receipt, "Authorize").map(e=>this.decodeAuthorizeEvent(e));
    }
    decodeAuthorizeEvent(event: Event): ProxyV3.AuthorizeEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parseClaimEvent(receipt: TransactionReceipt): ProxyV3.ClaimEvent[]{
        return this.parseEvents(receipt, "Claim").map(e=>this.decodeClaimEvent(e));
    }
    decodeClaimEvent(event: Event): ProxyV3.ClaimEvent{
        let result = event.data;
        return {
            from: result.from,
            token: result.token,
            amount: new BigNumber(result.amount),
            _event: event
        };
    }
    parseClaimProtocolFeeEvent(receipt: TransactionReceipt): ProxyV3.ClaimProtocolFeeEvent[]{
        return this.parseEvents(receipt, "ClaimProtocolFee").map(e=>this.decodeClaimProtocolFeeEvent(e));
    }
    decodeClaimProtocolFeeEvent(event: Event): ProxyV3.ClaimProtocolFeeEvent{
        let result = event.data;
        return {
            token: result.token,
            amount: new BigNumber(result.amount),
            _event: event
        };
    }
    parseDeauthorizeEvent(receipt: TransactionReceipt): ProxyV3.DeauthorizeEvent[]{
        return this.parseEvents(receipt, "Deauthorize").map(e=>this.decodeDeauthorizeEvent(e));
    }
    decodeDeauthorizeEvent(event: Event): ProxyV3.DeauthorizeEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parseNewCampaignEvent(receipt: TransactionReceipt): ProxyV3.NewCampaignEvent[]{
        return this.parseEvents(receipt, "NewCampaign").map(e=>this.decodeNewCampaignEvent(e));
    }
    decodeNewCampaignEvent(event: Event): ProxyV3.NewCampaignEvent{
        let result = event.data;
        return {
            campaignId: new BigNumber(result.campaignId),
            _event: event
        };
    }
    parseNewProjectEvent(receipt: TransactionReceipt): ProxyV3.NewProjectEvent[]{
        return this.parseEvents(receipt, "NewProject").map(e=>this.decodeNewProjectEvent(e));
    }
    decodeNewProjectEvent(event: Event): ProxyV3.NewProjectEvent{
        let result = event.data;
        return {
            projectId: new BigNumber(result.projectId),
            _event: event
        };
    }
    parseRemoveProjectAdminEvent(receipt: TransactionReceipt): ProxyV3.RemoveProjectAdminEvent[]{
        return this.parseEvents(receipt, "RemoveProjectAdmin").map(e=>this.decodeRemoveProjectAdminEvent(e));
    }
    decodeRemoveProjectAdminEvent(event: Event): ProxyV3.RemoveProjectAdminEvent{
        let result = event.data;
        return {
            projectId: new BigNumber(result.projectId),
            admin: result.admin,
            _event: event
        };
    }
    parseSetProtocolRateEvent(receipt: TransactionReceipt): ProxyV3.SetProtocolRateEvent[]{
        return this.parseEvents(receipt, "SetProtocolRate").map(e=>this.decodeSetProtocolRateEvent(e));
    }
    decodeSetProtocolRateEvent(event: Event): ProxyV3.SetProtocolRateEvent{
        let result = event.data;
        return {
            protocolRate: new BigNumber(result.protocolRate),
            _event: event
        };
    }
    parseSkimEvent(receipt: TransactionReceipt): ProxyV3.SkimEvent[]{
        return this.parseEvents(receipt, "Skim").map(e=>this.decodeSkimEvent(e));
    }
    decodeSkimEvent(event: Event): ProxyV3.SkimEvent{
        let result = event.data;
        return {
            token: result.token,
            to: result.to,
            amount: new BigNumber(result.amount),
            _event: event
        };
    }
    parseStakeEvent(receipt: TransactionReceipt): ProxyV3.StakeEvent[]{
        return this.parseEvents(receipt, "Stake").map(e=>this.decodeStakeEvent(e));
    }
    decodeStakeEvent(event: Event): ProxyV3.StakeEvent{
        let result = event.data;
        return {
            projectId: new BigNumber(result.projectId),
            token: result.token,
            amount: new BigNumber(result.amount),
            balance: new BigNumber(result.balance),
            _event: event
        };
    }
    parseStartOwnershipTransferEvent(receipt: TransactionReceipt): ProxyV3.StartOwnershipTransferEvent[]{
        return this.parseEvents(receipt, "StartOwnershipTransfer").map(e=>this.decodeStartOwnershipTransferEvent(e));
    }
    decodeStartOwnershipTransferEvent(event: Event): ProxyV3.StartOwnershipTransferEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parseTakeoverProjectOwnershipEvent(receipt: TransactionReceipt): ProxyV3.TakeoverProjectOwnershipEvent[]{
        return this.parseEvents(receipt, "TakeoverProjectOwnership").map(e=>this.decodeTakeoverProjectOwnershipEvent(e));
    }
    decodeTakeoverProjectOwnershipEvent(event: Event): ProxyV3.TakeoverProjectOwnershipEvent{
        let result = event.data;
        return {
            projectId: new BigNumber(result.projectId),
            newOwner: result.newOwner,
            _event: event
        };
    }
    parseTransferBackEvent(receipt: TransactionReceipt): ProxyV3.TransferBackEvent[]{
        return this.parseEvents(receipt, "TransferBack").map(e=>this.decodeTransferBackEvent(e));
    }
    decodeTransferBackEvent(event: Event): ProxyV3.TransferBackEvent{
        let result = event.data;
        return {
            target: result.target,
            token: result.token,
            sender: result.sender,
            amount: new BigNumber(result.amount),
            _event: event
        };
    }
    parseTransferForwardEvent(receipt: TransactionReceipt): ProxyV3.TransferForwardEvent[]{
        return this.parseEvents(receipt, "TransferForward").map(e=>this.decodeTransferForwardEvent(e));
    }
    decodeTransferForwardEvent(event: Event): ProxyV3.TransferForwardEvent{
        let result = event.data;
        return {
            target: result.target,
            token: result.token,
            sender: result.sender,
            amount: new BigNumber(result.amount),
            _event: event
        };
    }
    parseTransferOwnershipEvent(receipt: TransactionReceipt): ProxyV3.TransferOwnershipEvent[]{
        return this.parseEvents(receipt, "TransferOwnership").map(e=>this.decodeTransferOwnershipEvent(e));
    }
    decodeTransferOwnershipEvent(event: Event): ProxyV3.TransferOwnershipEvent{
        let result = event.data;
        return {
            user: result.user,
            _event: event
        };
    }
    parseTransferProjectOwnershipEvent(receipt: TransactionReceipt): ProxyV3.TransferProjectOwnershipEvent[]{
        return this.parseEvents(receipt, "TransferProjectOwnership").map(e=>this.decodeTransferProjectOwnershipEvent(e));
    }
    decodeTransferProjectOwnershipEvent(event: Event): ProxyV3.TransferProjectOwnershipEvent{
        let result = event.data;
        return {
            projectId: new BigNumber(result.projectId),
            newOwner: result.newOwner,
            _event: event
        };
    }
    parseUnstakeEvent(receipt: TransactionReceipt): ProxyV3.UnstakeEvent[]{
        return this.parseEvents(receipt, "Unstake").map(e=>this.decodeUnstakeEvent(e));
    }
    decodeUnstakeEvent(event: Event): ProxyV3.UnstakeEvent{
        let result = event.data;
        return {
            projectId: new BigNumber(result.projectId),
            token: result.token,
            amount: new BigNumber(result.amount),
            balance: new BigNumber(result.balance),
            _event: event
        };
    }
    addProjectAdmin: {
        (params: IAddProjectAdminParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IAddProjectAdminParams, options?: TransactionOptions) => Promise<void>;
        txData: (params: IAddProjectAdminParams, options?: TransactionOptions) => Promise<string>;
    }
    campaignAccumulatedCommission: {
        (params: ICampaignAccumulatedCommissionParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    claim: {
        (token:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (token:string, options?: TransactionOptions) => Promise<void>;
        txData: (token:string, options?: TransactionOptions) => Promise<string>;
    }
    claimMultiple: {
        (tokens:string[], options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (tokens:string[], options?: TransactionOptions) => Promise<void>;
        txData: (tokens:string[], options?: TransactionOptions) => Promise<string>;
    }
    claimMultipleProtocolFee: {
        (tokens:string[], options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (tokens:string[], options?: TransactionOptions) => Promise<void>;
        txData: (tokens:string[], options?: TransactionOptions) => Promise<string>;
    }
    claimProtocolFee: {
        (token:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (token:string, options?: TransactionOptions) => Promise<void>;
        txData: (token:string, options?: TransactionOptions) => Promise<string>;
    }
    claimantIdCount: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    claimantIds: {
        (params: IClaimantIdsParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    claimantsInfo: {
        (param1:number|BigNumber, options?: TransactionOptions): Promise<{claimant:string,token:string,balance:BigNumber}>;
    }
    deny: {
        (user:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (user:string, options?: TransactionOptions) => Promise<void>;
        txData: (user:string, options?: TransactionOptions) => Promise<string>;
    }
    getCampaign: {
        (params: IGetCampaignParams, options?: TransactionOptions): Promise<{projectId:BigNumber,maxInputTokensInEachCall:BigNumber,maxOutputTokensInEachCall:BigNumber,referrersRequireApproval:boolean,startDate:BigNumber,endDate:BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[],referrers:string[]}>;
    }
    getCampaignArrayData1: {
        (params: IGetCampaignArrayData1Params, options?: TransactionOptions): Promise<{targetAndSelectors:string[],referrers:string[]}>;
    }
    getCampaignArrayData2: {
        (params: IGetCampaignArrayData2Params, options?: TransactionOptions): Promise<{inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[]}>;
    }
    getCampaignArrayLength: {
        (campaignId:number|BigNumber, options?: TransactionOptions): Promise<{targetAndSelectorsLength:BigNumber,inTokensLength:BigNumber,outTokensLength:BigNumber,referrersLength:BigNumber}>;
    }
    getCampaignsLength: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    getClaimantBalance: {
        (params: IGetClaimantBalanceParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    getClaimantsInfo: {
        (params: IGetClaimantsInfoParams, options?: TransactionOptions): Promise<{claimant:string,token:string,balance:BigNumber}[]>;
    }
    getProject: {
        (projectId:number|BigNumber, options?: TransactionOptions): Promise<{owner:string,newOwner:string,projectAdmins:string[]}>;
    }
    getProjectAdminsLength: {
        (projectId:number|BigNumber, options?: TransactionOptions): Promise<BigNumber>;
    }
    getProjectsLength: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    isPermitted: {
        (param1:string, options?: TransactionOptions): Promise<boolean>;
    }
    lastBalance: {
        (param1:string, options?: TransactionOptions): Promise<BigNumber>;
    }
    newCampaign: {
        (params:{projectId:number|BigNumber,maxInputTokensInEachCall:number|BigNumber,maxOutputTokensInEachCall:number|BigNumber,referrersRequireApproval:boolean,startDate:number|BigNumber,endDate:number|BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],referrers:string[]}, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params:{projectId:number|BigNumber,maxInputTokensInEachCall:number|BigNumber,maxOutputTokensInEachCall:number|BigNumber,referrersRequireApproval:boolean,startDate:number|BigNumber,endDate:number|BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],referrers:string[]}, options?: TransactionOptions) => Promise<BigNumber>;
        txData: (params:{projectId:number|BigNumber,maxInputTokensInEachCall:number|BigNumber,maxOutputTokensInEachCall:number|BigNumber,referrersRequireApproval:boolean,startDate:number|BigNumber,endDate:number|BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],referrers:string[]}, options?: TransactionOptions) => Promise<string>;
    }
    newOwner: {
        (options?: TransactionOptions): Promise<string>;
    }
    newProject: {
        (admins:string[], options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (admins:string[], options?: TransactionOptions) => Promise<BigNumber>;
        txData: (admins:string[], options?: TransactionOptions) => Promise<string>;
    }
    owner: {
        (options?: TransactionOptions): Promise<string>;
    }
    permit: {
        (user:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (user:string, options?: TransactionOptions) => Promise<void>;
        txData: (user:string, options?: TransactionOptions) => Promise<string>;
    }
    protocolFeeBalance: {
        (param1:string, options?: TransactionOptions): Promise<BigNumber>;
    }
    protocolRate: {
        (options?: TransactionOptions): Promise<BigNumber>;
    }
    proxyCall: {
        (params: IProxyCallParams, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IProxyCallParams, options?: number|BigNumber|TransactionOptions) => Promise<void>;
        txData: (params: IProxyCallParams, options?: number|BigNumber|TransactionOptions) => Promise<string>;
    }
    removeProjectAdmin: {
        (params: IRemoveProjectAdminParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IRemoveProjectAdminParams, options?: TransactionOptions) => Promise<void>;
        txData: (params: IRemoveProjectAdminParams, options?: TransactionOptions) => Promise<string>;
    }
    setProtocolRate: {
        (newRate:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (newRate:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (newRate:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    skim: {
        (tokens:string[], options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (tokens:string[], options?: TransactionOptions) => Promise<void>;
        txData: (tokens:string[], options?: TransactionOptions) => Promise<string>;
    }
    stake: {
        (params: IStakeParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IStakeParams, options?: TransactionOptions) => Promise<void>;
        txData: (params: IStakeParams, options?: TransactionOptions) => Promise<string>;
    }
    stakeETH: {
        (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions) => Promise<void>;
        txData: (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions) => Promise<string>;
    }
    stakeMultiple: {
        (params: IStakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IStakeMultipleParams, options?: number|BigNumber|TransactionOptions) => Promise<void>;
        txData: (params: IStakeMultipleParams, options?: number|BigNumber|TransactionOptions) => Promise<string>;
    }
    stakesBalance: {
        (params: IStakesBalanceParams, options?: TransactionOptions): Promise<BigNumber>;
    }
    takeOwnership: {
        (options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (options?: TransactionOptions) => Promise<void>;
        txData: (options?: TransactionOptions) => Promise<string>;
    }
    takeoverProjectOwnership: {
        (projectId:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (projectId:number|BigNumber, options?: TransactionOptions) => Promise<void>;
        txData: (projectId:number|BigNumber, options?: TransactionOptions) => Promise<string>;
    }
    transferOwnership: {
        (newOwner:string, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (newOwner:string, options?: TransactionOptions) => Promise<void>;
        txData: (newOwner:string, options?: TransactionOptions) => Promise<string>;
    }
    transferProjectOwnership: {
        (params: ITransferProjectOwnershipParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: ITransferProjectOwnershipParams, options?: TransactionOptions) => Promise<void>;
        txData: (params: ITransferProjectOwnershipParams, options?: TransactionOptions) => Promise<string>;
    }
    unstake: {
        (params: IUnstakeParams, options?: TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IUnstakeParams, options?: TransactionOptions) => Promise<void>;
        txData: (params: IUnstakeParams, options?: TransactionOptions) => Promise<string>;
    }
    unstakeETH: {
        (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions) => Promise<void>;
        txData: (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions) => Promise<string>;
    }
    unstakeMultiple: {
        (params: IUnstakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt>;
        call: (params: IUnstakeMultipleParams, options?: number|BigNumber|TransactionOptions) => Promise<void>;
        txData: (params: IUnstakeMultipleParams, options?: number|BigNumber|TransactionOptions) => Promise<string>;
    }
    private assign(){
        let campaignAccumulatedCommissionParams = (params: ICampaignAccumulatedCommissionParams) => [this.wallet.utils.toString(params.param1),params.param2];
        let campaignAccumulatedCommission_call = async (params: ICampaignAccumulatedCommissionParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('campaignAccumulatedCommission',campaignAccumulatedCommissionParams(params),options);
            return new BigNumber(result);
        }
        this.campaignAccumulatedCommission = campaignAccumulatedCommission_call
        let claimantIdCount_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('claimantIdCount',[],options);
            return new BigNumber(result);
        }
        this.claimantIdCount = claimantIdCount_call
        let claimantIdsParams = (params: IClaimantIdsParams) => [params.param1,params.param2];
        let claimantIds_call = async (params: IClaimantIdsParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('claimantIds',claimantIdsParams(params),options);
            return new BigNumber(result);
        }
        this.claimantIds = claimantIds_call
        let claimantsInfo_call = async (param1:number|BigNumber, options?: TransactionOptions): Promise<{claimant:string,token:string,balance:BigNumber}> => {
            let result = await this.call('claimantsInfo',[this.wallet.utils.toString(param1)],options);
            return {
                claimant: result.claimant,
                token: result.token,
                balance: new BigNumber(result.balance)
            };
        }
        this.claimantsInfo = claimantsInfo_call
        let getCampaignParams = (params: IGetCampaignParams) => [this.wallet.utils.toString(params.campaignId),params.returnArrays];
        let getCampaign_call = async (params: IGetCampaignParams, options?: TransactionOptions): Promise<{projectId:BigNumber,maxInputTokensInEachCall:BigNumber,maxOutputTokensInEachCall:BigNumber,referrersRequireApproval:boolean,startDate:BigNumber,endDate:BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[],referrers:string[]}> => {
            let result = await this.call('getCampaign',getCampaignParams(params),options);
            return (
            {
                projectId: new BigNumber(result.projectId),
                maxInputTokensInEachCall: new BigNumber(result.maxInputTokensInEachCall),
                maxOutputTokensInEachCall: new BigNumber(result.maxOutputTokensInEachCall),
                referrersRequireApproval: result.referrersRequireApproval,
                startDate: new BigNumber(result.startDate),
                endDate: new BigNumber(result.endDate),
                targetAndSelectors: result.targetAndSelectors,
                acceptAnyInToken: result.acceptAnyInToken,
                acceptAnyOutToken: result.acceptAnyOutToken,
                inTokens: result.inTokens,
                directTransferInToken: result.directTransferInToken,
                commissionInTokenConfig: result.commissionInTokenConfig.map(e=>(
                    {
                        rate: new BigNumber(e.rate),
                        feeOnProjectOwner: e.feeOnProjectOwner,
                        capPerTransaction: new BigNumber(e.capPerTransaction),
                        capPerCampaign: new BigNumber(e.capPerCampaign)
                    }
                )),
                outTokens: result.outTokens,
                commissionOutTokenConfig: result.commissionOutTokenConfig.map(e=>(
                    {
                        rate: new BigNumber(e.rate),
                        feeOnProjectOwner: e.feeOnProjectOwner,
                        capPerTransaction: new BigNumber(e.capPerTransaction),
                        capPerCampaign: new BigNumber(e.capPerCampaign)
                    }
                )),
                referrers: result.referrers
            }
            );
        }
        this.getCampaign = getCampaign_call
        let getCampaignArrayData1Params = (params: IGetCampaignArrayData1Params) => [this.wallet.utils.toString(params.campaignId),this.wallet.utils.toString(params.targetAndSelectorsStart),this.wallet.utils.toString(params.targetAndSelectorsLength),this.wallet.utils.toString(params.referrersStart),this.wallet.utils.toString(params.referrersLength)];
        let getCampaignArrayData1_call = async (params: IGetCampaignArrayData1Params, options?: TransactionOptions): Promise<{targetAndSelectors:string[],referrers:string[]}> => {
            let result = await this.call('getCampaignArrayData1',getCampaignArrayData1Params(params),options);
            return {
                targetAndSelectors: result.targetAndSelectors,
                referrers: result.referrers
            };
        }
        this.getCampaignArrayData1 = getCampaignArrayData1_call
        let getCampaignArrayData2Params = (params: IGetCampaignArrayData2Params) => [this.wallet.utils.toString(params.campaignId),this.wallet.utils.toString(params.inTokensStart),this.wallet.utils.toString(params.inTokensLength),this.wallet.utils.toString(params.outTokensStart),this.wallet.utils.toString(params.outTokensLength)];
        let getCampaignArrayData2_call = async (params: IGetCampaignArrayData2Params, options?: TransactionOptions): Promise<{inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:BigNumber,feeOnProjectOwner:boolean,capPerTransaction:BigNumber,capPerCampaign:BigNumber}[]}> => {
            let result = await this.call('getCampaignArrayData2',getCampaignArrayData2Params(params),options);
            return {
                inTokens: result.inTokens,
                directTransferInToken: result.directTransferInToken,
                commissionInTokenConfig: result.commissionInTokenConfig.map(e=>(
                    {
                        rate: new BigNumber(e.rate),
                        feeOnProjectOwner: e.feeOnProjectOwner,
                        capPerTransaction: new BigNumber(e.capPerTransaction),
                        capPerCampaign: new BigNumber(e.capPerCampaign)
                    }
                )),
                outTokens: result.outTokens,
                commissionOutTokenConfig: result.commissionOutTokenConfig.map(e=>(
                    {
                        rate: new BigNumber(e.rate),
                        feeOnProjectOwner: e.feeOnProjectOwner,
                        capPerTransaction: new BigNumber(e.capPerTransaction),
                        capPerCampaign: new BigNumber(e.capPerCampaign)
                    }
                ))
            };
        }
        this.getCampaignArrayData2 = getCampaignArrayData2_call
        let getCampaignArrayLength_call = async (campaignId:number|BigNumber, options?: TransactionOptions): Promise<{targetAndSelectorsLength:BigNumber,inTokensLength:BigNumber,outTokensLength:BigNumber,referrersLength:BigNumber}> => {
            let result = await this.call('getCampaignArrayLength',[this.wallet.utils.toString(campaignId)],options);
            return {
                targetAndSelectorsLength: new BigNumber(result.targetAndSelectorsLength),
                inTokensLength: new BigNumber(result.inTokensLength),
                outTokensLength: new BigNumber(result.outTokensLength),
                referrersLength: new BigNumber(result.referrersLength)
            };
        }
        this.getCampaignArrayLength = getCampaignArrayLength_call
        let getCampaignsLength_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('getCampaignsLength',[],options);
            return new BigNumber(result);
        }
        this.getCampaignsLength = getCampaignsLength_call
        let getClaimantBalanceParams = (params: IGetClaimantBalanceParams) => [params.claimant,params.token];
        let getClaimantBalance_call = async (params: IGetClaimantBalanceParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('getClaimantBalance',getClaimantBalanceParams(params),options);
            return new BigNumber(result);
        }
        this.getClaimantBalance = getClaimantBalance_call
        let getClaimantsInfoParams = (params: IGetClaimantsInfoParams) => [this.wallet.utils.toString(params.fromId),this.wallet.utils.toString(params.count)];
        let getClaimantsInfo_call = async (params: IGetClaimantsInfoParams, options?: TransactionOptions): Promise<{claimant:string,token:string,balance:BigNumber}[]> => {
            let result = await this.call('getClaimantsInfo',getClaimantsInfoParams(params),options);
            return (result.map(e=>(
                {
                    claimant: e.claimant,
                    token: e.token,
                    balance: new BigNumber(e.balance)
                }
            )));
        }
        this.getClaimantsInfo = getClaimantsInfo_call
        let getProject_call = async (projectId:number|BigNumber, options?: TransactionOptions): Promise<{owner:string,newOwner:string,projectAdmins:string[]}> => {
            let result = await this.call('getProject',[this.wallet.utils.toString(projectId)],options);
            return {
                owner: result.owner,
                newOwner: result.newOwner,
                projectAdmins: result.projectAdmins
            };
        }
        this.getProject = getProject_call
        let getProjectAdminsLength_call = async (projectId:number|BigNumber, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('getProjectAdminsLength',[this.wallet.utils.toString(projectId)],options);
            return new BigNumber(result);
        }
        this.getProjectAdminsLength = getProjectAdminsLength_call
        let getProjectsLength_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('getProjectsLength',[],options);
            return new BigNumber(result);
        }
        this.getProjectsLength = getProjectsLength_call
        let isPermitted_call = async (param1:string, options?: TransactionOptions): Promise<boolean> => {
            let result = await this.call('isPermitted',[param1],options);
            return result;
        }
        this.isPermitted = isPermitted_call
        let lastBalance_call = async (param1:string, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('lastBalance',[param1],options);
            return new BigNumber(result);
        }
        this.lastBalance = lastBalance_call
        let newOwner_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('newOwner',[],options);
            return result;
        }
        this.newOwner = newOwner_call
        let owner_call = async (options?: TransactionOptions): Promise<string> => {
            let result = await this.call('owner',[],options);
            return result;
        }
        this.owner = owner_call
        let protocolFeeBalance_call = async (param1:string, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('protocolFeeBalance',[param1],options);
            return new BigNumber(result);
        }
        this.protocolFeeBalance = protocolFeeBalance_call
        let protocolRate_call = async (options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('protocolRate',[],options);
            return new BigNumber(result);
        }
        this.protocolRate = protocolRate_call
        let stakesBalanceParams = (params: IStakesBalanceParams) => [this.wallet.utils.toString(params.param1),params.param2];
        let stakesBalance_call = async (params: IStakesBalanceParams, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('stakesBalance',stakesBalanceParams(params),options);
            return new BigNumber(result);
        }
        this.stakesBalance = stakesBalance_call
        let addProjectAdminParams = (params: IAddProjectAdminParams) => [this.wallet.utils.toString(params.projectId),params.admin];
        let addProjectAdmin_send = async (params: IAddProjectAdminParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('addProjectAdmin',addProjectAdminParams(params),options);
            return result;
        }
        let addProjectAdmin_call = async (params: IAddProjectAdminParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('addProjectAdmin',addProjectAdminParams(params),options);
            return;
        }
        let addProjectAdmin_txData = async (params: IAddProjectAdminParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('addProjectAdmin',addProjectAdminParams(params),options);
            return result;
        }
        this.addProjectAdmin = Object.assign(addProjectAdmin_send, {
            call:addProjectAdmin_call
            , txData:addProjectAdmin_txData
        });
        let claim_send = async (token:string, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('claim',[token],options);
            return result;
        }
        let claim_call = async (token:string, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('claim',[token],options);
            return;
        }
        let claim_txData = async (token:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('claim',[token],options);
            return result;
        }
        this.claim = Object.assign(claim_send, {
            call:claim_call
            , txData:claim_txData
        });
        let claimMultiple_send = async (tokens:string[], options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('claimMultiple',[tokens],options);
            return result;
        }
        let claimMultiple_call = async (tokens:string[], options?: TransactionOptions): Promise<void> => {
            let result = await this.call('claimMultiple',[tokens],options);
            return;
        }
        let claimMultiple_txData = async (tokens:string[], options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('claimMultiple',[tokens],options);
            return result;
        }
        this.claimMultiple = Object.assign(claimMultiple_send, {
            call:claimMultiple_call
            , txData:claimMultiple_txData
        });
        let claimMultipleProtocolFee_send = async (tokens:string[], options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('claimMultipleProtocolFee',[tokens],options);
            return result;
        }
        let claimMultipleProtocolFee_call = async (tokens:string[], options?: TransactionOptions): Promise<void> => {
            let result = await this.call('claimMultipleProtocolFee',[tokens],options);
            return;
        }
        let claimMultipleProtocolFee_txData = async (tokens:string[], options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('claimMultipleProtocolFee',[tokens],options);
            return result;
        }
        this.claimMultipleProtocolFee = Object.assign(claimMultipleProtocolFee_send, {
            call:claimMultipleProtocolFee_call
            , txData:claimMultipleProtocolFee_txData
        });
        let claimProtocolFee_send = async (token:string, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('claimProtocolFee',[token],options);
            return result;
        }
        let claimProtocolFee_call = async (token:string, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('claimProtocolFee',[token],options);
            return;
        }
        let claimProtocolFee_txData = async (token:string, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('claimProtocolFee',[token],options);
            return result;
        }
        this.claimProtocolFee = Object.assign(claimProtocolFee_send, {
            call:claimProtocolFee_call
            , txData:claimProtocolFee_txData
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
        let newCampaign_send = async (params:{projectId:number|BigNumber,maxInputTokensInEachCall:number|BigNumber,maxOutputTokensInEachCall:number|BigNumber,referrersRequireApproval:boolean,startDate:number|BigNumber,endDate:number|BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],referrers:string[]}, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('newCampaign',[[this.wallet.utils.toString(params.projectId),this.wallet.utils.toString(params.maxInputTokensInEachCall),this.wallet.utils.toString(params.maxOutputTokensInEachCall),params.referrersRequireApproval,this.wallet.utils.toString(params.startDate),this.wallet.utils.toString(params.endDate),params.targetAndSelectors,params.acceptAnyInToken,params.acceptAnyOutToken,params.inTokens,params.directTransferInToken,params.commissionInTokenConfig.map(e=>([this.wallet.utils.toString(e.rate),e.feeOnProjectOwner,this.wallet.utils.toString(e.capPerTransaction),this.wallet.utils.toString(e.capPerCampaign)])),params.outTokens,params.commissionOutTokenConfig.map(e=>([this.wallet.utils.toString(e.rate),e.feeOnProjectOwner,this.wallet.utils.toString(e.capPerTransaction),this.wallet.utils.toString(e.capPerCampaign)])),params.referrers]],options);
            return result;
        }
        let newCampaign_call = async (params:{projectId:number|BigNumber,maxInputTokensInEachCall:number|BigNumber,maxOutputTokensInEachCall:number|BigNumber,referrersRequireApproval:boolean,startDate:number|BigNumber,endDate:number|BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],referrers:string[]}, options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newCampaign',[[this.wallet.utils.toString(params.projectId),this.wallet.utils.toString(params.maxInputTokensInEachCall),this.wallet.utils.toString(params.maxOutputTokensInEachCall),params.referrersRequireApproval,this.wallet.utils.toString(params.startDate),this.wallet.utils.toString(params.endDate),params.targetAndSelectors,params.acceptAnyInToken,params.acceptAnyOutToken,params.inTokens,params.directTransferInToken,params.commissionInTokenConfig.map(e=>([this.wallet.utils.toString(e.rate),e.feeOnProjectOwner,this.wallet.utils.toString(e.capPerTransaction),this.wallet.utils.toString(e.capPerCampaign)])),params.outTokens,params.commissionOutTokenConfig.map(e=>([this.wallet.utils.toString(e.rate),e.feeOnProjectOwner,this.wallet.utils.toString(e.capPerTransaction),this.wallet.utils.toString(e.capPerCampaign)])),params.referrers]],options);
            return new BigNumber(result);
        }
        let newCampaign_txData = async (params:{projectId:number|BigNumber,maxInputTokensInEachCall:number|BigNumber,maxOutputTokensInEachCall:number|BigNumber,referrersRequireApproval:boolean,startDate:number|BigNumber,endDate:number|BigNumber,targetAndSelectors:string[],acceptAnyInToken:boolean,acceptAnyOutToken:boolean,inTokens:string[],directTransferInToken:boolean[],commissionInTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],outTokens:string[],commissionOutTokenConfig:{rate:number|BigNumber,feeOnProjectOwner:boolean,capPerTransaction:number|BigNumber,capPerCampaign:number|BigNumber}[],referrers:string[]}, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('newCampaign',[[this.wallet.utils.toString(params.projectId),this.wallet.utils.toString(params.maxInputTokensInEachCall),this.wallet.utils.toString(params.maxOutputTokensInEachCall),params.referrersRequireApproval,this.wallet.utils.toString(params.startDate),this.wallet.utils.toString(params.endDate),params.targetAndSelectors,params.acceptAnyInToken,params.acceptAnyOutToken,params.inTokens,params.directTransferInToken,params.commissionInTokenConfig.map(e=>([this.wallet.utils.toString(e.rate),e.feeOnProjectOwner,this.wallet.utils.toString(e.capPerTransaction),this.wallet.utils.toString(e.capPerCampaign)])),params.outTokens,params.commissionOutTokenConfig.map(e=>([this.wallet.utils.toString(e.rate),e.feeOnProjectOwner,this.wallet.utils.toString(e.capPerTransaction),this.wallet.utils.toString(e.capPerCampaign)])),params.referrers]],options);
            return result;
        }
        this.newCampaign = Object.assign(newCampaign_send, {
            call:newCampaign_call
            , txData:newCampaign_txData
        });
        let newProject_send = async (admins:string[], options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('newProject',[admins],options);
            return result;
        }
        let newProject_call = async (admins:string[], options?: TransactionOptions): Promise<BigNumber> => {
            let result = await this.call('newProject',[admins],options);
            return new BigNumber(result);
        }
        let newProject_txData = async (admins:string[], options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('newProject',[admins],options);
            return result;
        }
        this.newProject = Object.assign(newProject_send, {
            call:newProject_call
            , txData:newProject_txData
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
        let proxyCallParams = (params: IProxyCallParams) => [this.wallet.utils.toString(params.campaignId),params.target,this.wallet.utils.stringToBytes(params.data),params.referrer,params.to,params.tokensIn.map(e=>([e.token,this.wallet.utils.toString(e.amount)])),params.tokensOut];
        let proxyCall_send = async (params: IProxyCallParams, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('proxyCall',proxyCallParams(params),options);
            return result;
        }
        let proxyCall_call = async (params: IProxyCallParams, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            let result = await this.call('proxyCall',proxyCallParams(params),options);
            return;
        }
        let proxyCall_txData = async (params: IProxyCallParams, options?: number|BigNumber|TransactionOptions): Promise<string> => {
            let result = await this.txData('proxyCall',proxyCallParams(params),options);
            return result;
        }
        this.proxyCall = Object.assign(proxyCall_send, {
            call:proxyCall_call
            , txData:proxyCall_txData
        });
        let removeProjectAdminParams = (params: IRemoveProjectAdminParams) => [this.wallet.utils.toString(params.projectId),params.admin];
        let removeProjectAdmin_send = async (params: IRemoveProjectAdminParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('removeProjectAdmin',removeProjectAdminParams(params),options);
            return result;
        }
        let removeProjectAdmin_call = async (params: IRemoveProjectAdminParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('removeProjectAdmin',removeProjectAdminParams(params),options);
            return;
        }
        let removeProjectAdmin_txData = async (params: IRemoveProjectAdminParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('removeProjectAdmin',removeProjectAdminParams(params),options);
            return result;
        }
        this.removeProjectAdmin = Object.assign(removeProjectAdmin_send, {
            call:removeProjectAdmin_call
            , txData:removeProjectAdmin_txData
        });
        let setProtocolRate_send = async (newRate:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('setProtocolRate',[this.wallet.utils.toString(newRate)],options);
            return result;
        }
        let setProtocolRate_call = async (newRate:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('setProtocolRate',[this.wallet.utils.toString(newRate)],options);
            return;
        }
        let setProtocolRate_txData = async (newRate:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('setProtocolRate',[this.wallet.utils.toString(newRate)],options);
            return result;
        }
        this.setProtocolRate = Object.assign(setProtocolRate_send, {
            call:setProtocolRate_call
            , txData:setProtocolRate_txData
        });
        let skim_send = async (tokens:string[], options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('skim',[tokens],options);
            return result;
        }
        let skim_call = async (tokens:string[], options?: TransactionOptions): Promise<void> => {
            let result = await this.call('skim',[tokens],options);
            return;
        }
        let skim_txData = async (tokens:string[], options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('skim',[tokens],options);
            return result;
        }
        this.skim = Object.assign(skim_send, {
            call:skim_call
            , txData:skim_txData
        });
        let stakeParams = (params: IStakeParams) => [this.wallet.utils.toString(params.projectId),params.token,this.wallet.utils.toString(params.amount)];
        let stake_send = async (params: IStakeParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('stake',stakeParams(params),options);
            return result;
        }
        let stake_call = async (params: IStakeParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('stake',stakeParams(params),options);
            return;
        }
        let stake_txData = async (params: IStakeParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('stake',stakeParams(params),options);
            return result;
        }
        this.stake = Object.assign(stake_send, {
            call:stake_call
            , txData:stake_txData
        });
        let stakeETH_send = async (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('stakeETH',[this.wallet.utils.toString(projectId)],options);
            return result;
        }
        let stakeETH_call = async (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            let result = await this.call('stakeETH',[this.wallet.utils.toString(projectId)],options);
            return;
        }
        let stakeETH_txData = async (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<string> => {
            let result = await this.txData('stakeETH',[this.wallet.utils.toString(projectId)],options);
            return result;
        }
        this.stakeETH = Object.assign(stakeETH_send, {
            call:stakeETH_call
            , txData:stakeETH_txData
        });
        let stakeMultipleParams = (params: IStakeMultipleParams) => [this.wallet.utils.toString(params.projectId),params.token,this.wallet.utils.toString(params.amount)];
        let stakeMultiple_send = async (params: IStakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('stakeMultiple',stakeMultipleParams(params),options);
            return result;
        }
        let stakeMultiple_call = async (params: IStakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            let result = await this.call('stakeMultiple',stakeMultipleParams(params),options);
            return;
        }
        let stakeMultiple_txData = async (params: IStakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<string> => {
            let result = await this.txData('stakeMultiple',stakeMultipleParams(params),options);
            return result;
        }
        this.stakeMultiple = Object.assign(stakeMultiple_send, {
            call:stakeMultiple_call
            , txData:stakeMultiple_txData
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
        let takeoverProjectOwnership_send = async (projectId:number|BigNumber, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('takeoverProjectOwnership',[this.wallet.utils.toString(projectId)],options);
            return result;
        }
        let takeoverProjectOwnership_call = async (projectId:number|BigNumber, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('takeoverProjectOwnership',[this.wallet.utils.toString(projectId)],options);
            return;
        }
        let takeoverProjectOwnership_txData = async (projectId:number|BigNumber, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('takeoverProjectOwnership',[this.wallet.utils.toString(projectId)],options);
            return result;
        }
        this.takeoverProjectOwnership = Object.assign(takeoverProjectOwnership_send, {
            call:takeoverProjectOwnership_call
            , txData:takeoverProjectOwnership_txData
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
        let transferProjectOwnershipParams = (params: ITransferProjectOwnershipParams) => [this.wallet.utils.toString(params.projectId),params.newOwner];
        let transferProjectOwnership_send = async (params: ITransferProjectOwnershipParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('transferProjectOwnership',transferProjectOwnershipParams(params),options);
            return result;
        }
        let transferProjectOwnership_call = async (params: ITransferProjectOwnershipParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('transferProjectOwnership',transferProjectOwnershipParams(params),options);
            return;
        }
        let transferProjectOwnership_txData = async (params: ITransferProjectOwnershipParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('transferProjectOwnership',transferProjectOwnershipParams(params),options);
            return result;
        }
        this.transferProjectOwnership = Object.assign(transferProjectOwnership_send, {
            call:transferProjectOwnership_call
            , txData:transferProjectOwnership_txData
        });
        let unstakeParams = (params: IUnstakeParams) => [this.wallet.utils.toString(params.projectId),params.token,this.wallet.utils.toString(params.amount)];
        let unstake_send = async (params: IUnstakeParams, options?: TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('unstake',unstakeParams(params),options);
            return result;
        }
        let unstake_call = async (params: IUnstakeParams, options?: TransactionOptions): Promise<void> => {
            let result = await this.call('unstake',unstakeParams(params),options);
            return;
        }
        let unstake_txData = async (params: IUnstakeParams, options?: TransactionOptions): Promise<string> => {
            let result = await this.txData('unstake',unstakeParams(params),options);
            return result;
        }
        this.unstake = Object.assign(unstake_send, {
            call:unstake_call
            , txData:unstake_txData
        });
        let unstakeETH_send = async (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('unstakeETH',[this.wallet.utils.toString(projectId)],options);
            return result;
        }
        let unstakeETH_call = async (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            let result = await this.call('unstakeETH',[this.wallet.utils.toString(projectId)],options);
            return;
        }
        let unstakeETH_txData = async (projectId:number|BigNumber, options?: number|BigNumber|TransactionOptions): Promise<string> => {
            let result = await this.txData('unstakeETH',[this.wallet.utils.toString(projectId)],options);
            return result;
        }
        this.unstakeETH = Object.assign(unstakeETH_send, {
            call:unstakeETH_call
            , txData:unstakeETH_txData
        });
        let unstakeMultipleParams = (params: IUnstakeMultipleParams) => [this.wallet.utils.toString(params.projectId),params.token,this.wallet.utils.toString(params.amount)];
        let unstakeMultiple_send = async (params: IUnstakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<TransactionReceipt> => {
            let result = await this.send('unstakeMultiple',unstakeMultipleParams(params),options);
            return result;
        }
        let unstakeMultiple_call = async (params: IUnstakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<void> => {
            let result = await this.call('unstakeMultiple',unstakeMultipleParams(params),options);
            return;
        }
        let unstakeMultiple_txData = async (params: IUnstakeMultipleParams, options?: number|BigNumber|TransactionOptions): Promise<string> => {
            let result = await this.txData('unstakeMultiple',unstakeMultipleParams(params),options);
            return result;
        }
        this.unstakeMultiple = Object.assign(unstakeMultiple_send, {
            call:unstakeMultiple_call
            , txData:unstakeMultiple_txData
        });
    }
}
export module ProxyV3{
    export interface AddCommissionEvent {to:string,token:string,commission:BigNumber,commissionBalance:BigNumber,protocolFee:BigNumber,protocolFeeBalance:BigNumber,_event:Event}
    export interface AddProjectAdminEvent {projectId:BigNumber,admin:string,_event:Event}
    export interface AuthorizeEvent {user:string,_event:Event}
    export interface ClaimEvent {from:string,token:string,amount:BigNumber,_event:Event}
    export interface ClaimProtocolFeeEvent {token:string,amount:BigNumber,_event:Event}
    export interface DeauthorizeEvent {user:string,_event:Event}
    export interface NewCampaignEvent {campaignId:BigNumber,_event:Event}
    export interface NewProjectEvent {projectId:BigNumber,_event:Event}
    export interface RemoveProjectAdminEvent {projectId:BigNumber,admin:string,_event:Event}
    export interface SetProtocolRateEvent {protocolRate:BigNumber,_event:Event}
    export interface SkimEvent {token:string,to:string,amount:BigNumber,_event:Event}
    export interface StakeEvent {projectId:BigNumber,token:string,amount:BigNumber,balance:BigNumber,_event:Event}
    export interface StartOwnershipTransferEvent {user:string,_event:Event}
    export interface TakeoverProjectOwnershipEvent {projectId:BigNumber,newOwner:string,_event:Event}
    export interface TransferBackEvent {target:string,token:string,sender:string,amount:BigNumber,_event:Event}
    export interface TransferForwardEvent {target:string,token:string,sender:string,amount:BigNumber,_event:Event}
    export interface TransferOwnershipEvent {user:string,_event:Event}
    export interface TransferProjectOwnershipEvent {projectId:BigNumber,newOwner:string,_event:Event}
    export interface UnstakeEvent {projectId:BigNumber,token:string,amount:BigNumber,balance:BigNumber,_event:Event}
}