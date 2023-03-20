import * as Contracts from './contracts/index';
export {Contracts};
import {IWallet, BigNumber, Utils} from '@ijstech/eth-wallet';


export interface IDeployOptions {
    // gem's constructor
    name:string;
    symbol:string;
    cap:number|BigNumber;
    baseToken:string;
    price:number|BigNumber;
    mintingFee:number|BigNumber;
    redemptionFee:number|BigNumber    
};
export interface IDeployResult {
    gem: string;
};
let progressHandler: any;
export var DefaultDeployOptions: IDeployOptions = {
    name: "SCOM Utility Token",
    symbol: "SCOM",
    cap: 10000000,
    baseToken: Utils.nullAddress,
    price: 1,
    mintingFee: 0.025,
    redemptionFee: 0.05,
};
function logProgress(msg: string){
    if (progressHandler)
        progressHandler(msg);  
}
export async function deploy(wallet: IWallet, options: IDeployOptions, onProgress?:(msg:string)=>void): Promise<IDeployResult>{
    options.cap = Utils.toDecimals(options.cap);
    options.price = Utils.toDecimals(options.price);
    options.mintingFee = Utils.toDecimals(options.mintingFee);
    options.redemptionFee = Utils.toDecimals(options.redemptionFee);
    progressHandler = onProgress;
    let gem = new Contracts.GEM(wallet);
    logProgress('Deploy GEM');
    let address = await gem.deploy(options);
    logProgress('GEM deployed ' + address)
    return {
        gem: address
    };
};
export default {
    Contracts,
    deploy,
    DefaultDeployOptions
};