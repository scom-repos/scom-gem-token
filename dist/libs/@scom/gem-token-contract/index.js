define("@scom/gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts'/> 
    exports.default = {
        "abi": [
            { "inputs": [{ "internalType": "string", "name": "name_", "type": "string" }, { "internalType": "string", "name": "symbol_", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
            { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
        ],
        "bytecode": "60806040523480156200001157600080fd5b5060405162000e0f38038062000e0f83398101604081905262000034916200011f565b600362000042838262000218565b50600462000051828262000218565b505050620002e4565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200008257600080fd5b81516001600160401b03808211156200009f576200009f6200005a565b604051601f8301601f19908116603f01168101908282118183101715620000ca57620000ca6200005a565b81604052838152602092508683858801011115620000e757600080fd5b600091505b838210156200010b5785820183015181830184015290820190620000ec565b600093810190920192909252949350505050565b600080604083850312156200013357600080fd5b82516001600160401b03808211156200014b57600080fd5b620001598683870162000070565b935060208501519150808211156200017057600080fd5b506200017f8582860162000070565b9150509250929050565b600181811c908216806200019e57607f821691505b602082108103620001bf57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200021357600081815260208120601f850160051c81016020861015620001ee5750805b601f850160051c820191505b818110156200020f57828155600101620001fa565b5050505b505050565b81516001600160401b038111156200023457620002346200005a565b6200024c8162000245845462000189565b84620001c5565b602080601f8311600181146200028457600084156200026b5750858301515b600019600386901b1c1916600185901b1785556200020f565b600085815260208120601f198616915b82811015620002b55788860151825594840194600190910190840162000294565b5085821015620002d45787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b610b1b80620002f46000396000f3fe608060405234801561001057600080fd5b50600436106100c95760003560e01c80633950935111610081578063a457c2d71161005b578063a457c2d714610194578063a9059cbb146101a7578063dd62ed3e146101ba57600080fd5b8063395093511461014357806370a082311461015657806395d89b411461018c57600080fd5b806318160ddd116100b257806318160ddd1461010f57806323b872dd14610121578063313ce5671461013457600080fd5b806306fdde03146100ce578063095ea7b3146100ec575b600080fd5b6100d6610200565b6040516100e39190610908565b60405180910390f35b6100ff6100fa36600461099d565b610292565b60405190151581526020016100e3565b6002545b6040519081526020016100e3565b6100ff61012f3660046109c7565b6102ac565b604051601281526020016100e3565b6100ff61015136600461099d565b6102d0565b610113610164366004610a03565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6100d661031c565b6100ff6101a236600461099d565b61032b565b6100ff6101b536600461099d565b610401565b6101136101c8366004610a25565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b60606003805461020f90610a58565b80601f016020809104026020016040519081016040528092919081815260200182805461023b90610a58565b80156102885780601f1061025d57610100808354040283529160200191610288565b820191906000526020600020905b81548152906001019060200180831161026b57829003601f168201915b5050505050905090565b6000336102a081858561040f565b60019150505b92915050565b6000336102ba8582856105c2565b6102c5858585610699565b506001949350505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff871684529091528120549091906102a09082908690610317908790610aab565b61040f565b60606004805461020f90610a58565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909190838110156103f4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6102c5828686840361040f565b6000336102a0818585610699565b73ffffffffffffffffffffffffffffffffffffffff83166104b1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff8216610554576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f737300000000000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600160209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146106935781811015610686576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016103eb565b610693848484840361040f565b50505050565b73ffffffffffffffffffffffffffffffffffffffff831661073c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f647265737300000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff82166107df576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f657373000000000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610895576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e6365000000000000000000000000000000000000000000000000000060648201526084016103eb565b73ffffffffffffffffffffffffffffffffffffffff848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3610693565b600060208083528351808285015260005b8181101561093557858101830151858201604001528201610919565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8301168501019250505092915050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461099857600080fd5b919050565b600080604083850312156109b057600080fd5b6109b983610974565b946020939093013593505050565b6000806000606084860312156109dc57600080fd5b6109e584610974565b92506109f360208501610974565b9150604084013590509250925092565b600060208284031215610a1557600080fd5b610a1e82610974565b9392505050565b60008060408385031215610a3857600080fd5b610a4183610974565b9150610a4f60208401610974565b90509250929050565b600181811c90821680610a6c57607f821691505b602082108103610aa5577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b808201808211156102a6577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fdfea26469706673582212200b1c8209991f9f505c1b93652182a21c393f29b72d5b8e98cb86249fd9872e6664736f6c63430008110033"
    };
});
define("@scom/gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts", ["require", "exports", "@ijstech/eth-contract", "@scom/gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.json.ts"], function (require, exports, eth_contract_1, ERC20_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ERC20 = void 0;
    class ERC20 extends eth_contract_1.Contract {
        constructor(wallet, address) {
            super(wallet, address, ERC20_json_1.default.abi, ERC20_json_1.default.bytecode);
            this.assign();
        }
        deploy(params, options) {
            return this.__deploy([params.name, params.symbol], options);
        }
        parseApprovalEvent(receipt) {
            return this.parseEvents(receipt, "Approval").map(e => this.decodeApprovalEvent(e));
        }
        decodeApprovalEvent(event) {
            let result = event.data;
            return {
                owner: result.owner,
                spender: result.spender,
                value: new eth_contract_1.BigNumber(result.value),
                _event: event
            };
        }
        parseTransferEvent(receipt) {
            return this.parseEvents(receipt, "Transfer").map(e => this.decodeTransferEvent(e));
        }
        decodeTransferEvent(event) {
            let result = event.data;
            return {
                from: result.from,
                to: result.to,
                value: new eth_contract_1.BigNumber(result.value),
                _event: event
            };
        }
        assign() {
            let allowanceParams = (params) => [params.owner, params.spender];
            let allowance_call = async (params, options) => {
                let result = await this.call('allowance', allowanceParams(params), options);
                return new eth_contract_1.BigNumber(result);
            };
            this.allowance = allowance_call;
            let balanceOf_call = async (account, options) => {
                let result = await this.call('balanceOf', [account], options);
                return new eth_contract_1.BigNumber(result);
            };
            this.balanceOf = balanceOf_call;
            let decimals_call = async (options) => {
                let result = await this.call('decimals', [], options);
                return new eth_contract_1.BigNumber(result);
            };
            this.decimals = decimals_call;
            let name_call = async (options) => {
                let result = await this.call('name', [], options);
                return result;
            };
            this.name = name_call;
            let symbol_call = async (options) => {
                let result = await this.call('symbol', [], options);
                return result;
            };
            this.symbol = symbol_call;
            let totalSupply_call = async (options) => {
                let result = await this.call('totalSupply', [], options);
                return new eth_contract_1.BigNumber(result);
            };
            this.totalSupply = totalSupply_call;
            let approveParams = (params) => [params.spender, this.wallet.utils.toString(params.amount)];
            let approve_send = async (params, options) => {
                let result = await this.send('approve', approveParams(params), options);
                return result;
            };
            let approve_call = async (params, options) => {
                let result = await this.call('approve', approveParams(params), options);
                return result;
            };
            this.approve = Object.assign(approve_send, {
                call: approve_call
            });
            let decreaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.subtractedValue)];
            let decreaseAllowance_send = async (params, options) => {
                let result = await this.send('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            let decreaseAllowance_call = async (params, options) => {
                let result = await this.call('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            this.decreaseAllowance = Object.assign(decreaseAllowance_send, {
                call: decreaseAllowance_call
            });
            let increaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.addedValue)];
            let increaseAllowance_send = async (params, options) => {
                let result = await this.send('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            let increaseAllowance_call = async (params, options) => {
                let result = await this.call('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            this.increaseAllowance = Object.assign(increaseAllowance_send, {
                call: increaseAllowance_call
            });
            let transferParams = (params) => [params.to, this.wallet.utils.toString(params.amount)];
            let transfer_send = async (params, options) => {
                let result = await this.send('transfer', transferParams(params), options);
                return result;
            };
            let transfer_call = async (params, options) => {
                let result = await this.call('transfer', transferParams(params), options);
                return result;
            };
            this.transfer = Object.assign(transfer_send, {
                call: transfer_call
            });
            let transferFromParams = (params) => [params.from, params.to, this.wallet.utils.toString(params.amount)];
            let transferFrom_send = async (params, options) => {
                let result = await this.send('transferFrom', transferFromParams(params), options);
                return result;
            };
            let transferFrom_call = async (params, options) => {
                let result = await this.call('transferFrom', transferFromParams(params), options);
                return result;
            };
            this.transferFrom = Object.assign(transferFrom_send, {
                call: transferFrom_call
            });
        }
    }
    exports.ERC20 = ERC20;
    ERC20._abi = ERC20_json_1.default.abi;
});
define("@scom/gem-token-contract/contracts/GEM.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/gem-token-contract/contracts/GEM.json.ts'/> 
    exports.default = {
        "abi": [
            { "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "_cap", "type": "uint256" }, { "internalType": "contract IERC20Metadata", "name": "_baseToken", "type": "address" }, { "internalType": "uint256", "name": "_price", "type": "uint256" }, { "internalType": "uint256", "name": "_mintingFee", "type": "uint256" }, { "internalType": "uint256", "name": "_redemptionFee", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "Authorize", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "baseTokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "gemAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "Buy", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "Deauthorize", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "redeemer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "gemAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "baseTokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "Redeem", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "StartOwnershipTransfer", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "user", "type": "address" }], "name": "TransferOwnership", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "baseTokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newFeeBalance", "type": "uint256" }], "name": "TreasuryRedeem", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "cap", "type": "uint256" }], "name": "UpdateCap", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "mintingFee", "type": "uint256" }], "name": "UpdateMintingFee", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "redemptionFee", "type": "uint256" }], "name": "UpdateRedemptionFee", "type": "event" },
            { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "treasury", "type": "address" }], "name": "UpdateTreasury", "type": "event" },
            { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "baseToken", "outputs": [{ "internalType": "contract IERC20Metadata", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "buy", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "cap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "decimalsDelta", "outputs": [{ "internalType": "int8", "name": "", "type": "int8" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "deny", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "depositBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "feeBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isPermitted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "mintingFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newCap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newCapEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newMintingFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newMintingFeeEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newRedemptionFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newRedemptionFeeEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newTreasury", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "newTreasuryEffectiveTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "price", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "redeemFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "redemptionFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "sync", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "takeOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "newOwner_", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [], "name": "treasury", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
            { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "_cap", "type": "uint256" }], "name": "updateCap", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "_mintingFee", "type": "uint256" }], "name": "updateMintingFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "uint256", "name": "_redemptionFee", "type": "uint256" }], "name": "updateRedemptionFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
            { "inputs": [{ "internalType": "address", "name": "_treasury", "type": "address" }], "name": "updateTreasury", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
        ],
        "bytecode": "60c06040523480156200001157600080fd5b50604051620034e2380380620034e28339810160408190526200003491620002a5565b600080546001600160a01b0319163317905586866006620000568382620003e8565b506007620000658282620003e8565b50506008805460ff191690555060016009556001600160a01b038416620000dd5760405162461bcd60e51b815260206004820152602160248201527f62617365546f6b656e2063616e27742062652061206e756c6c206164647265736044820152607360f81b60648201526084015b60405180910390fd5b826000036200012f5760405162461bcd60e51b815260206004820152601360248201527f70726963652063616e2774206265207a65726f000000000000000000000000006044820152606401620000d4565b6012846001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000170573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620001969190620004b4565b620001a29190620004e0565b60000b60a052600a949094556001600160a01b03909216608052600b55600c80546001600160a01b03191633179055600d55600e5550620005169050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200020857600080fd5b81516001600160401b0380821115620002255762000225620001e0565b604051601f8301601f19908116603f01168101908282118183101715620002505762000250620001e0565b816040528381526020925086838588010111156200026d57600080fd5b600091505b8382101562000291578582018301518183018401529082019062000272565b600093810190920192909252949350505050565b600080600080600080600060e0888a031215620002c157600080fd5b87516001600160401b0380821115620002d957600080fd5b620002e78b838c01620001f6565b985060208a0151915080821115620002fe57600080fd5b506200030d8a828b01620001f6565b60408a015160608b0151919850965090506001600160a01b03811681146200033457600080fd5b809450506080880151925060a0880151915060c0880151905092959891949750929550565b600181811c908216806200036e57607f821691505b6020821081036200038f57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620003e357600081815260208120601f850160051c81016020861015620003be5750805b601f850160051c820191505b81811015620003df57828155600101620003ca565b5050505b505050565b81516001600160401b03811115620004045762000404620001e0565b6200041c8162000415845462000359565b8462000395565b602080601f8311600181146200045457600084156200043b5750858301515b600019600386901b1c1916600185901b178555620003df565b600085815260208120601f198616915b82811015620004855788860151825594840194600190910190840162000464565b5085821015620004a45787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b600060208284031215620004c757600080fd5b815160ff81168114620004d957600080fd5b9392505050565b600082810b9082900b03607f198112607f821317156200051057634e487b7160e01b600052601160045260246000fd5b92915050565b60805160a051612f446200059e60003960008181610654015281816112240152818161124f0152818161127c015281816112b801528181611405015281816114300152818161145d015261149901526000818161058f01528181611551015281816118b201528181611a680152818161225b015281816122f7015261234f0152612f446000f3fe608060405234801561001057600080fd5b506004361061030a5760003560e01c80638456cb591161019c578063c55dae63116100ee578063dd62ed3e11610097578063f87fcd0f11610071578063f87fcd0f1461069c578063f913036d146106af578063fff6cae9146106c257600080fd5b8063dd62ed3e14610609578063f0484a771461064f578063f2fde38b1461068957600080fd5b8063d96a094a116100c8578063d96a094a146105da578063d9a3ce36146105ed578063db006a75146105f657600080fd5b8063c55dae631461058a578063d4ee1d90146105b1578063d8b954ed146105d157600080fd5b8063a035b1fe11610150578063a7d688961161012a578063a7d6889614610551578063a9059cbb14610564578063c0275a251461057757600080fd5b8063a035b1fe14610522578063a2f55ae51461052b578063a457c2d71461053e57600080fd5b806394bf74921161018157806394bf7492146104fe57806395d89b41146105075780639c52a7f11461050f57600080fd5b80638456cb59146104d65780638da5cb5b146104de57600080fd5b8063458f58151161026057806361d027b31161020957806375808390116101e357806375808390146104b1578063798bd59f146104ba5780637f51bb1f146104c357600080fd5b806361d027b31461045257806370a08231146104725780637572a2bc146104a857600080fd5b8063605361721161023a578063605361721461043857806360b71d4e1461044057806361bc1a491461044957600080fd5b8063458f58151461041b5780635a64ad95146104245780635c975abb1461042d57600080fd5b8063313ce567116102c25780633f4ba83a1161029c5780633f4ba83a146103a95780633fd8cc4e146103b35780634579b8b4146103d657600080fd5b8063313ce5671461037e578063355274ea1461038d578063395093511461039657600080fd5b806318160ddd116102f357806318160ddd14610350578063208c6eee1461036257806323b872dd1461036b57600080fd5b806306fdde031461030f578063095ea7b31461032d575b600080fd5b6103176106ca565b6040516103249190612b09565b60405180910390f35b61034061033b366004612b83565b61075c565b6040519015158152602001610324565b6005545b604051908152602001610324565b61035460135481565b610340610379366004612bad565b610776565b60405160128152602001610324565b610354600a5481565b6103406103a4366004612b83565b61079a565b6103b16107e6565b005b6103406103c1366004612be9565b60026020526000908152604090205460ff1681565b6011546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610324565b610354600e5481565b610354600d5481565b60085460ff16610340565b6103b16108be565b61035460185481565b61035460175481565b600c546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b610354610480366004612be9565b73ffffffffffffffffffffffffffffffffffffffff1660009081526003602052604090205490565b61035460165481565b61035460105481565b61035460155481565b6103b16104d1366004612be9565b6109e9565b6103b1610b31565b6000546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b61035460125481565b610317610c02565b6103b161051d366004612be9565b610c11565b610354600b5481565b6103b1610539366004612be9565b610d34565b61034061054c366004612b83565b610e5a565b6103b161055f366004612c04565b610f2b565b610340610572366004612b83565b611050565b6103b1610585366004612c04565b61105e565b6103f67f000000000000000000000000000000000000000000000000000000000000000081565b6001546103f69073ffffffffffffffffffffffffffffffffffffffff1681565b610354600f5481565b6103b16105e8366004612c04565b611180565b61035460145481565b6103b1610604366004612c04565b6113cd565b610354610617366004612c1d565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260046020908152604080832093909416825291909152205490565b6106767f000000000000000000000000000000000000000000000000000000000000000081565b60405160009190910b8152602001610324565b6103b1610697366004612be9565b6115b8565b6103b16106aa366004612c04565b6116d2565b6103b16106bd366004612c04565b611915565b6103b1611a37565b6060600680546106d990612c50565b80601f016020809104026020016040519081016040528092919081815260200182805461070590612c50565b80156107525780601f1061072757610100808354040283529160200191610752565b820191906000526020600020905b81548152906001019060200180831161073557829003601f168201915b5050505050905090565b60003361076a818585611b0a565b60019150505b92915050565b600033610784858285611cbe565b61078f858585611d95565b506001949350505050565b33600081815260046020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490919061076a90829086906107e1908790612cd2565b611b0a565b60005473ffffffffffffffffffffffffffffffffffffffff1633148061081b57503360009081526002602052604090205460ff165b6108ac576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6108b461200b565b6108bc612077565b565b60015473ffffffffffffffffffffffffffffffffffffffff163314610965576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084016108a3565b600180546000805473ffffffffffffffffffffffffffffffffffffffff83167fffffffffffffffffffffffff000000000000000000000000000000000000000091821681179092559091169091556040519081527fcfaaa26691e16e66e73290fc725eee1a6b4e0e693a1640484937aac25ffb55a4906020015b60405180910390a1565b60005473ffffffffffffffffffffffffffffffffffffffff163314610a90576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b601180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8316179055610add6202a30042612cd2565b60125560115460405173ffffffffffffffffffffffffffffffffffffffff90911681527f1f54d231bb9d500b1923e4a1cb25e600f366a8368873d9af7c1c623814df19fc906020015b60405180910390a150565b60005473ffffffffffffffffffffffffffffffffffffffff16331480610b6657503360009081526002602052604090205460ff165b610bf2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084016108a3565b610bfa6120ef565b6108bc61215c565b6060600780546106d990612c50565b60005473ffffffffffffffffffffffffffffffffffffffff163314610cb8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff811660008181526002602090815260409182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016905590519182527f79ede3839cd7a7d8bd77e97e5c890565fe4f76cdbbeaa364646e28a8695a78849101610b26565b60005473ffffffffffffffffffffffffffffffffffffffff163314610ddb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff811660008181526002602090815260409182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016600117905590519182527f6d81a01b39982517ba331aeb4f387b0f9cc32334b65bb9a343a077973cf7adf59101610b26565b33600081815260046020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490919083811015610f1e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f00000000000000000000000000000000000000000000000000000060648201526084016108a3565b61078f8286868403611b0a565b60005473ffffffffffffffffffffffffffffffffffffffff163314610fd2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b60105415801590610fe45750600f5481145b8015610ff257506010544210155b15611005576000601055600f54600a5550565b600f8190556110176202a30042612cd2565b601055600f546040519081527f3b499d333a6661bd0059d289a2b6f94c0031fa04fa48949544552fcc2021c0bc90602001610b26565b50565b60003361076a818585611d95565b60005473ffffffffffffffffffffffffffffffffffffffff163314611105576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b60145415801590611117575060135481145b801561112557506014544210155b15611138576000601455601354600d5550565b601381905561114a6202a30042612cd2565b6014556013546040519081527f1c9debc18a776994f1856d0eedf7d2861a46d412d421c170674d9329b5c53b2390602001610b26565b6111886121b7565b6111906120ef565b61119a338261222a565b905080601760008282546111ae9190612cd2565b9091555050600d54600090670de0b6b3a7640000906111cd9084612ce5565b6111d79190612cfc565b90506111e38183612d37565b915080601860008282546111f79190612cd2565b9091555050600b54600090670de0b6b3a7640000906112169085612ce5565b6112209190612cfc565b90507f000000000000000000000000000000000000000000000000000000000000000060000b156112f45760007f000000000000000000000000000000000000000000000000000000000000000060000b13156112b3576112a27f0000000000000000000000000000000000000000000000000000000000000000600a612e6a565b6112ac9082612cfc565b90506112f4565b6112dc7f0000000000000000000000000000000000000000000000000000000000000000612e79565b6112e790600a612e6a565b6112f19082612ce5565b90505b600a548161130160055490565b61130b9190612cd2565b1115611373576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600c60248201527f636170206578636565646564000000000000000000000000000000000000000060448201526064016108a3565b61137d33826123e0565b604080518481526020810183905290810183905233907fbeae048c6d270d9469f86cf6e8fedda3c60ad770f16c24c9fc131c8e9a09101d906060015b60405180910390a2505061104d6001600955565b6113d56121b7565b6113df33826124d5565b600b546000906113f783670de0b6b3a7640000612ce5565b6114019190612cfc565b90507f000000000000000000000000000000000000000000000000000000000000000060000b156114d55760007f000000000000000000000000000000000000000000000000000000000000000060000b1315611494576114837f0000000000000000000000000000000000000000000000000000000000000000600a612e6a565b61148d9082612ce5565b90506114d5565b6114bd7f0000000000000000000000000000000000000000000000000000000000000000612e79565b6114c890600a612e6a565b6114d29082612cfc565b90505b6000670de0b6b3a7640000600e54836114ee9190612ce5565b6114f89190612cfc565b90506115048183612d37565b915080601860008282546115189190612cd2565b9250508190555081601760008282546115319190612d37565b90915550611578905073ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000163384612698565b604080518481526020810184905290810182905233907fbd5034ffbd47e4e72a94baa2cdb74c6fad73cb3bcdc13036b72ec8306f5a7646906060016113b9565b60005473ffffffffffffffffffffffffffffffffffffffff16331461165f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff83169081179091556040519081527f686a7ab184e6928ddedba810af7b443d6baa40bf32c4787ccd72c5b4b28cae1b90602001610b26565b60005473ffffffffffffffffffffffffffffffffffffffff1633148061170757503360009081526002602052604090205460ff165b611793576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f416374696f6e20706572666f726d656420627920756e617574686f72697a656460448201527f20616464726573732e000000000000000000000000000000000000000000000060648201526084016108a3565b601254158015906117a657506012544210155b156117f8576000601255601154600c80547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff9092169190911790555b601854811115611864576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f616d6f756e7420657863656564656420746865206665652062616c616e63650060448201526064016108a3565b80601860008282546118769190612d37565b92505081905550806017600082825461188f9190612d37565b9091555050600c546118db9073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000008116911683612698565b6018546040805183815260208101929092527f3799298d314837711ad9f0d00ed3bbb028e5b7ae43b72ce603fc640dc977380d9101610b26565b60005473ffffffffffffffffffffffffffffffffffffffff1633146119bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416374696f6e20706572666f726d6564206279206e6f6e2d6f776e657220616460448201527f64726573732e000000000000000000000000000000000000000000000000000060648201526084016108a3565b601654158015906119ce575060155481145b80156119dc57506016544210155b156119ef576000601655601554600e5550565b6015819055611a01624f1a0042612cd2565b6016556015546040519081527fcb4fe4659d0bb0c9b214dcf3dd2bd69ba7c28e367a8613927bb1fe619200cc0c90602001610b26565b6017546040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201527f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa158015611ac4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611ae89190612eb7565b611af29190612d37565b60186000828254611b039190612cd2565b9091555050565b73ffffffffffffffffffffffffffffffffffffffff8316611bac576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff8216611c4f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f737300000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526004602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8381166000908152600460209081526040808320938616835292905220547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114611d8f5781811015611d82576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016108a3565b611d8f8484848403611b0a565b50505050565b73ffffffffffffffffffffffffffffffffffffffff8316611e38576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f647265737300000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff8216611edb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f657373000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff831660009081526003602052604090205481811015611f91576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e6365000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff80851660008181526003602052604080822086860390559286168082529083902080548601905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90611ffe9086815260200190565b60405180910390a3611d8f565b60085460ff166108bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f5061757361626c653a206e6f742070617573656400000000000000000000000060448201526064016108a3565b61207f61200b565b600880547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016109df565b60085460ff16156108bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f5061757361626c653a207061757365640000000000000000000000000000000060448201526064016108a3565b6121646120ef565b600880547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586120ca3390565b600260095403612223576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016108a3565b6002600955565b6040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa1580156122b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122db9190612eb7565b905061231f73ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001684308561276c565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015281907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa1580156123ab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123cf9190612eb7565b6123d99190612d37565b9392505050565b73ffffffffffffffffffffffffffffffffffffffff821661245d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064016108a3565b806005600082825461246f9190612cd2565b909155505073ffffffffffffffffffffffffffffffffffffffff82166000818152600360209081526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b73ffffffffffffffffffffffffffffffffffffffff8216612578576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360448201527f730000000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff82166000908152600360205260409020548181101561262e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60448201527f636500000000000000000000000000000000000000000000000000000000000060648201526084016108a3565b73ffffffffffffffffffffffffffffffffffffffff831660008181526003602090815260408083208686039055600580548790039055518581529192917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9101611cb1565b505050565b60405173ffffffffffffffffffffffffffffffffffffffff83166024820152604481018290526126939084907fa9059cbb00000000000000000000000000000000000000000000000000000000906064015b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff00000000000000000000000000000000000000000000000000000000909316929092179091526127ca565b60405173ffffffffffffffffffffffffffffffffffffffff80851660248301528316604482015260648101829052611d8f9085907f23b872dd00000000000000000000000000000000000000000000000000000000906084016126ea565b600061282c826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166128d69092919063ffffffff16565b805190915015612693578080602001905181019061284a9190612ed0565b612693576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f7420737563636565640000000000000000000000000000000000000000000060648201526084016108a3565b60606128e584846000856128ed565b949350505050565b60608247101561297f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c000000000000000000000000000000000000000000000000000060648201526084016108a3565b6000808673ffffffffffffffffffffffffffffffffffffffff1685876040516129a89190612ef2565b60006040518083038185875af1925050503d80600081146129e5576040519150601f19603f3d011682016040523d82523d6000602084013e6129ea565b606091505b50915091506129fb87838387612a06565b979650505050505050565b60608315612a9c578251600003612a955773ffffffffffffffffffffffffffffffffffffffff85163b612a95576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016108a3565b50816128e5565b6128e58383815115612ab15781518083602001fd5b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108a39190612b09565b60005b83811015612b00578181015183820152602001612ae8565b50506000910152565b6020815260008251806020840152612b28816040850160208701612ae5565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b803573ffffffffffffffffffffffffffffffffffffffff81168114612b7e57600080fd5b919050565b60008060408385031215612b9657600080fd5b612b9f83612b5a565b946020939093013593505050565b600080600060608486031215612bc257600080fd5b612bcb84612b5a565b9250612bd960208501612b5a565b9150604084013590509250925092565b600060208284031215612bfb57600080fd5b6123d982612b5a565b600060208284031215612c1657600080fd5b5035919050565b60008060408385031215612c3057600080fd5b612c3983612b5a565b9150612c4760208401612b5a565b90509250929050565b600181811c90821680612c6457607f821691505b602082108103612c9d577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b8082018082111561077057610770612ca3565b808202811582820484141761077057610770612ca3565b600082612d32577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b8181038181111561077057610770612ca3565b600181815b80851115612da357817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115612d8957612d89612ca3565b80851615612d9657918102915b93841c9390800290612d4f565b509250929050565b600082612dba57506001610770565b81612dc757506000610770565b8160018114612ddd5760028114612de757612e03565b6001915050610770565b60ff841115612df857612df8612ca3565b50506001821b610770565b5060208310610133831016604e8410600b8410161715612e26575081810a610770565b612e308383612d4a565b807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115612e6257612e62612ca3565b029392505050565b60006123d960ff841683612dab565b60008160000b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff808103612eae57612eae612ca3565b60000392915050565b600060208284031215612ec957600080fd5b5051919050565b600060208284031215612ee257600080fd5b815180151581146123d957600080fd5b60008251612f04818460208701612ae5565b919091019291505056fea2646970667358221220dd27c48bc21ec3c53fc2785d8ad28c9d9123c890594daa006172160dbd5821b164736f6c63430008110033"
    };
});
define("@scom/gem-token-contract/contracts/GEM.ts", ["require", "exports", "@ijstech/eth-contract", "@scom/gem-token-contract/contracts/GEM.json.ts"], function (require, exports, eth_contract_2, GEM_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GEM = void 0;
    class GEM extends eth_contract_2.Contract {
        constructor(wallet, address) {
            super(wallet, address, GEM_json_1.default.abi, GEM_json_1.default.bytecode);
            this.assign();
        }
        deploy(params, options) {
            return this.__deploy([params.name, params.symbol, this.wallet.utils.toString(params.cap), params.baseToken, this.wallet.utils.toString(params.price), this.wallet.utils.toString(params.mintingFee), this.wallet.utils.toString(params.redemptionFee)], options);
        }
        parseApprovalEvent(receipt) {
            return this.parseEvents(receipt, "Approval").map(e => this.decodeApprovalEvent(e));
        }
        decodeApprovalEvent(event) {
            let result = event.data;
            return {
                owner: result.owner,
                spender: result.spender,
                value: new eth_contract_2.BigNumber(result.value),
                _event: event
            };
        }
        parseAuthorizeEvent(receipt) {
            return this.parseEvents(receipt, "Authorize").map(e => this.decodeAuthorizeEvent(e));
        }
        decodeAuthorizeEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parseBuyEvent(receipt) {
            return this.parseEvents(receipt, "Buy").map(e => this.decodeBuyEvent(e));
        }
        decodeBuyEvent(event) {
            let result = event.data;
            return {
                buyer: result.buyer,
                baseTokenAmount: new eth_contract_2.BigNumber(result.baseTokenAmount),
                gemAmount: new eth_contract_2.BigNumber(result.gemAmount),
                fee: new eth_contract_2.BigNumber(result.fee),
                _event: event
            };
        }
        parseDeauthorizeEvent(receipt) {
            return this.parseEvents(receipt, "Deauthorize").map(e => this.decodeDeauthorizeEvent(e));
        }
        decodeDeauthorizeEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parsePausedEvent(receipt) {
            return this.parseEvents(receipt, "Paused").map(e => this.decodePausedEvent(e));
        }
        decodePausedEvent(event) {
            let result = event.data;
            return {
                account: result.account,
                _event: event
            };
        }
        parseRedeemEvent(receipt) {
            return this.parseEvents(receipt, "Redeem").map(e => this.decodeRedeemEvent(e));
        }
        decodeRedeemEvent(event) {
            let result = event.data;
            return {
                redeemer: result.redeemer,
                gemAmount: new eth_contract_2.BigNumber(result.gemAmount),
                baseTokenAmount: new eth_contract_2.BigNumber(result.baseTokenAmount),
                fee: new eth_contract_2.BigNumber(result.fee),
                _event: event
            };
        }
        parseStartOwnershipTransferEvent(receipt) {
            return this.parseEvents(receipt, "StartOwnershipTransfer").map(e => this.decodeStartOwnershipTransferEvent(e));
        }
        decodeStartOwnershipTransferEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parseTransferEvent(receipt) {
            return this.parseEvents(receipt, "Transfer").map(e => this.decodeTransferEvent(e));
        }
        decodeTransferEvent(event) {
            let result = event.data;
            return {
                from: result.from,
                to: result.to,
                value: new eth_contract_2.BigNumber(result.value),
                _event: event
            };
        }
        parseTransferOwnershipEvent(receipt) {
            return this.parseEvents(receipt, "TransferOwnership").map(e => this.decodeTransferOwnershipEvent(e));
        }
        decodeTransferOwnershipEvent(event) {
            let result = event.data;
            return {
                user: result.user,
                _event: event
            };
        }
        parseTreasuryRedeemEvent(receipt) {
            return this.parseEvents(receipt, "TreasuryRedeem").map(e => this.decodeTreasuryRedeemEvent(e));
        }
        decodeTreasuryRedeemEvent(event) {
            let result = event.data;
            return {
                baseTokenAmount: new eth_contract_2.BigNumber(result.baseTokenAmount),
                newFeeBalance: new eth_contract_2.BigNumber(result.newFeeBalance),
                _event: event
            };
        }
        parseUnpausedEvent(receipt) {
            return this.parseEvents(receipt, "Unpaused").map(e => this.decodeUnpausedEvent(e));
        }
        decodeUnpausedEvent(event) {
            let result = event.data;
            return {
                account: result.account,
                _event: event
            };
        }
        parseUpdateCapEvent(receipt) {
            return this.parseEvents(receipt, "UpdateCap").map(e => this.decodeUpdateCapEvent(e));
        }
        decodeUpdateCapEvent(event) {
            let result = event.data;
            return {
                cap: new eth_contract_2.BigNumber(result.cap),
                _event: event
            };
        }
        parseUpdateMintingFeeEvent(receipt) {
            return this.parseEvents(receipt, "UpdateMintingFee").map(e => this.decodeUpdateMintingFeeEvent(e));
        }
        decodeUpdateMintingFeeEvent(event) {
            let result = event.data;
            return {
                mintingFee: new eth_contract_2.BigNumber(result.mintingFee),
                _event: event
            };
        }
        parseUpdateRedemptionFeeEvent(receipt) {
            return this.parseEvents(receipt, "UpdateRedemptionFee").map(e => this.decodeUpdateRedemptionFeeEvent(e));
        }
        decodeUpdateRedemptionFeeEvent(event) {
            let result = event.data;
            return {
                redemptionFee: new eth_contract_2.BigNumber(result.redemptionFee),
                _event: event
            };
        }
        parseUpdateTreasuryEvent(receipt) {
            return this.parseEvents(receipt, "UpdateTreasury").map(e => this.decodeUpdateTreasuryEvent(e));
        }
        decodeUpdateTreasuryEvent(event) {
            let result = event.data;
            return {
                treasury: result.treasury,
                _event: event
            };
        }
        assign() {
            let allowanceParams = (params) => [params.owner, params.spender];
            let allowance_call = async (params, options) => {
                let result = await this.call('allowance', allowanceParams(params), options);
                return new eth_contract_2.BigNumber(result);
            };
            this.allowance = allowance_call;
            let balanceOf_call = async (account, options) => {
                let result = await this.call('balanceOf', [account], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.balanceOf = balanceOf_call;
            let baseToken_call = async (options) => {
                let result = await this.call('baseToken', [], options);
                return result;
            };
            this.baseToken = baseToken_call;
            let cap_call = async (options) => {
                let result = await this.call('cap', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.cap = cap_call;
            let decimals_call = async (options) => {
                let result = await this.call('decimals', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.decimals = decimals_call;
            let decimalsDelta_call = async (options) => {
                let result = await this.call('decimalsDelta', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.decimalsDelta = decimalsDelta_call;
            let depositBalance_call = async (options) => {
                let result = await this.call('depositBalance', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.depositBalance = depositBalance_call;
            let feeBalance_call = async (options) => {
                let result = await this.call('feeBalance', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.feeBalance = feeBalance_call;
            let isPermitted_call = async (param1, options) => {
                let result = await this.call('isPermitted', [param1], options);
                return result;
            };
            this.isPermitted = isPermitted_call;
            let mintingFee_call = async (options) => {
                let result = await this.call('mintingFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.mintingFee = mintingFee_call;
            let name_call = async (options) => {
                let result = await this.call('name', [], options);
                return result;
            };
            this.name = name_call;
            let newCap_call = async (options) => {
                let result = await this.call('newCap', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newCap = newCap_call;
            let newCapEffectiveTime_call = async (options) => {
                let result = await this.call('newCapEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newCapEffectiveTime = newCapEffectiveTime_call;
            let newMintingFee_call = async (options) => {
                let result = await this.call('newMintingFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newMintingFee = newMintingFee_call;
            let newMintingFeeEffectiveTime_call = async (options) => {
                let result = await this.call('newMintingFeeEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newMintingFeeEffectiveTime = newMintingFeeEffectiveTime_call;
            let newOwner_call = async (options) => {
                let result = await this.call('newOwner', [], options);
                return result;
            };
            this.newOwner = newOwner_call;
            let newRedemptionFee_call = async (options) => {
                let result = await this.call('newRedemptionFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newRedemptionFee = newRedemptionFee_call;
            let newRedemptionFeeEffectiveTime_call = async (options) => {
                let result = await this.call('newRedemptionFeeEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newRedemptionFeeEffectiveTime = newRedemptionFeeEffectiveTime_call;
            let newTreasury_call = async (options) => {
                let result = await this.call('newTreasury', [], options);
                return result;
            };
            this.newTreasury = newTreasury_call;
            let newTreasuryEffectiveTime_call = async (options) => {
                let result = await this.call('newTreasuryEffectiveTime', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.newTreasuryEffectiveTime = newTreasuryEffectiveTime_call;
            let owner_call = async (options) => {
                let result = await this.call('owner', [], options);
                return result;
            };
            this.owner = owner_call;
            let paused_call = async (options) => {
                let result = await this.call('paused', [], options);
                return result;
            };
            this.paused = paused_call;
            let price_call = async (options) => {
                let result = await this.call('price', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.price = price_call;
            let redemptionFee_call = async (options) => {
                let result = await this.call('redemptionFee', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.redemptionFee = redemptionFee_call;
            let symbol_call = async (options) => {
                let result = await this.call('symbol', [], options);
                return result;
            };
            this.symbol = symbol_call;
            let totalSupply_call = async (options) => {
                let result = await this.call('totalSupply', [], options);
                return new eth_contract_2.BigNumber(result);
            };
            this.totalSupply = totalSupply_call;
            let treasury_call = async (options) => {
                let result = await this.call('treasury', [], options);
                return result;
            };
            this.treasury = treasury_call;
            let approveParams = (params) => [params.spender, this.wallet.utils.toString(params.amount)];
            let approve_send = async (params, options) => {
                let result = await this.send('approve', approveParams(params), options);
                return result;
            };
            let approve_call = async (params, options) => {
                let result = await this.call('approve', approveParams(params), options);
                return result;
            };
            this.approve = Object.assign(approve_send, {
                call: approve_call
            });
            let buy_send = async (amount, options) => {
                let result = await this.send('buy', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            let buy_call = async (amount, options) => {
                let result = await this.call('buy', [this.wallet.utils.toString(amount)], options);
                return;
            };
            this.buy = Object.assign(buy_send, {
                call: buy_call
            });
            let decreaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.subtractedValue)];
            let decreaseAllowance_send = async (params, options) => {
                let result = await this.send('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            let decreaseAllowance_call = async (params, options) => {
                let result = await this.call('decreaseAllowance', decreaseAllowanceParams(params), options);
                return result;
            };
            this.decreaseAllowance = Object.assign(decreaseAllowance_send, {
                call: decreaseAllowance_call
            });
            let deny_send = async (user, options) => {
                let result = await this.send('deny', [user], options);
                return result;
            };
            let deny_call = async (user, options) => {
                let result = await this.call('deny', [user], options);
                return;
            };
            this.deny = Object.assign(deny_send, {
                call: deny_call
            });
            let increaseAllowanceParams = (params) => [params.spender, this.wallet.utils.toString(params.addedValue)];
            let increaseAllowance_send = async (params, options) => {
                let result = await this.send('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            let increaseAllowance_call = async (params, options) => {
                let result = await this.call('increaseAllowance', increaseAllowanceParams(params), options);
                return result;
            };
            this.increaseAllowance = Object.assign(increaseAllowance_send, {
                call: increaseAllowance_call
            });
            let pause_send = async (options) => {
                let result = await this.send('pause', [], options);
                return result;
            };
            let pause_call = async (options) => {
                let result = await this.call('pause', [], options);
                return;
            };
            this.pause = Object.assign(pause_send, {
                call: pause_call
            });
            let permit_send = async (user, options) => {
                let result = await this.send('permit', [user], options);
                return result;
            };
            let permit_call = async (user, options) => {
                let result = await this.call('permit', [user], options);
                return;
            };
            this.permit = Object.assign(permit_send, {
                call: permit_call
            });
            let redeem_send = async (amount, options) => {
                let result = await this.send('redeem', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            let redeem_call = async (amount, options) => {
                let result = await this.call('redeem', [this.wallet.utils.toString(amount)], options);
                return;
            };
            this.redeem = Object.assign(redeem_send, {
                call: redeem_call
            });
            let redeemFee_send = async (amount, options) => {
                let result = await this.send('redeemFee', [this.wallet.utils.toString(amount)], options);
                return result;
            };
            let redeemFee_call = async (amount, options) => {
                let result = await this.call('redeemFee', [this.wallet.utils.toString(amount)], options);
                return;
            };
            this.redeemFee = Object.assign(redeemFee_send, {
                call: redeemFee_call
            });
            let sync_send = async (options) => {
                let result = await this.send('sync', [], options);
                return result;
            };
            let sync_call = async (options) => {
                let result = await this.call('sync', [], options);
                return;
            };
            this.sync = Object.assign(sync_send, {
                call: sync_call
            });
            let takeOwnership_send = async (options) => {
                let result = await this.send('takeOwnership', [], options);
                return result;
            };
            let takeOwnership_call = async (options) => {
                let result = await this.call('takeOwnership', [], options);
                return;
            };
            this.takeOwnership = Object.assign(takeOwnership_send, {
                call: takeOwnership_call
            });
            let transferParams = (params) => [params.to, this.wallet.utils.toString(params.amount)];
            let transfer_send = async (params, options) => {
                let result = await this.send('transfer', transferParams(params), options);
                return result;
            };
            let transfer_call = async (params, options) => {
                let result = await this.call('transfer', transferParams(params), options);
                return result;
            };
            this.transfer = Object.assign(transfer_send, {
                call: transfer_call
            });
            let transferFromParams = (params) => [params.from, params.to, this.wallet.utils.toString(params.amount)];
            let transferFrom_send = async (params, options) => {
                let result = await this.send('transferFrom', transferFromParams(params), options);
                return result;
            };
            let transferFrom_call = async (params, options) => {
                let result = await this.call('transferFrom', transferFromParams(params), options);
                return result;
            };
            this.transferFrom = Object.assign(transferFrom_send, {
                call: transferFrom_call
            });
            let transferOwnership_send = async (newOwner, options) => {
                let result = await this.send('transferOwnership', [newOwner], options);
                return result;
            };
            let transferOwnership_call = async (newOwner, options) => {
                let result = await this.call('transferOwnership', [newOwner], options);
                return;
            };
            this.transferOwnership = Object.assign(transferOwnership_send, {
                call: transferOwnership_call
            });
            let unpause_send = async (options) => {
                let result = await this.send('unpause', [], options);
                return result;
            };
            let unpause_call = async (options) => {
                let result = await this.call('unpause', [], options);
                return;
            };
            this.unpause = Object.assign(unpause_send, {
                call: unpause_call
            });
            let updateCap_send = async (cap, options) => {
                let result = await this.send('updateCap', [this.wallet.utils.toString(cap)], options);
                return result;
            };
            let updateCap_call = async (cap, options) => {
                let result = await this.call('updateCap', [this.wallet.utils.toString(cap)], options);
                return;
            };
            this.updateCap = Object.assign(updateCap_send, {
                call: updateCap_call
            });
            let updateMintingFee_send = async (mintingFee, options) => {
                let result = await this.send('updateMintingFee', [this.wallet.utils.toString(mintingFee)], options);
                return result;
            };
            let updateMintingFee_call = async (mintingFee, options) => {
                let result = await this.call('updateMintingFee', [this.wallet.utils.toString(mintingFee)], options);
                return;
            };
            this.updateMintingFee = Object.assign(updateMintingFee_send, {
                call: updateMintingFee_call
            });
            let updateRedemptionFee_send = async (redemptionFee, options) => {
                let result = await this.send('updateRedemptionFee', [this.wallet.utils.toString(redemptionFee)], options);
                return result;
            };
            let updateRedemptionFee_call = async (redemptionFee, options) => {
                let result = await this.call('updateRedemptionFee', [this.wallet.utils.toString(redemptionFee)], options);
                return;
            };
            this.updateRedemptionFee = Object.assign(updateRedemptionFee_send, {
                call: updateRedemptionFee_call
            });
            let updateTreasury_send = async (treasury, options) => {
                let result = await this.send('updateTreasury', [treasury], options);
                return result;
            };
            let updateTreasury_call = async (treasury, options) => {
                let result = await this.call('updateTreasury', [treasury], options);
                return;
            };
            this.updateTreasury = Object.assign(updateTreasury_send, {
                call: updateTreasury_call
            });
        }
    }
    exports.GEM = GEM;
    GEM._abi = GEM_json_1.default.abi;
});
define("@scom/gem-token-contract/contracts/index.ts", ["require", "exports", "@scom/gem-token-contract/contracts/@openzeppelin/contracts/token/ERC20/ERC20.ts", "@scom/gem-token-contract/contracts/GEM.ts"], function (require, exports, ERC20_1, GEM_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GEM = exports.ERC20 = void 0;
    Object.defineProperty(exports, "ERC20", { enumerable: true, get: function () { return ERC20_1.ERC20; } });
    Object.defineProperty(exports, "GEM", { enumerable: true, get: function () { return GEM_1.GEM; } });
});
define("@scom/gem-token-contract", ["require", "exports", "@scom/gem-token-contract/contracts/index.ts", "@ijstech/eth-wallet"], function (require, exports, Contracts, eth_wallet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deploy = exports.DefaultDeployOptions = exports.Contracts = void 0;
    exports.Contracts = Contracts;
    ;
    ;
    let progressHandler;
    exports.DefaultDeployOptions = {
        name: "SCOM Utility Token",
        symbol: "SCOM",
        cap: 10000000,
        baseToken: eth_wallet_1.Utils.nullAddress,
        price: 1,
        mintingFee: 0.025,
        redemptionFee: 0.05,
    };
    function logProgress(msg) {
        if (progressHandler)
            progressHandler(msg);
    }
    async function deploy(wallet, options, onProgress) {
        options.cap = eth_wallet_1.Utils.toDecimals(options.cap);
        options.price = eth_wallet_1.Utils.toDecimals(options.price);
        options.mintingFee = eth_wallet_1.Utils.toDecimals(options.mintingFee);
        options.redemptionFee = eth_wallet_1.Utils.toDecimals(options.redemptionFee);
        progressHandler = onProgress;
        let gem = new Contracts.GEM(wallet);
        logProgress('Deploy GEM');
        let address = await gem.deploy(options);
        logProgress('GEM deployed ' + address);
        return {
            gem: address
        };
    }
    exports.deploy = deploy;
    ;
    exports.default = {
        Contracts,
        deploy,
        DefaultDeployOptions: exports.DefaultDeployOptions
    };
});
