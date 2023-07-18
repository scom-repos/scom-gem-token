import { Module, customModule, Container, application, VStack } from '@ijstech/components';
import { getMulticallInfoList } from '@scom/scom-multicall';
import { INetwork } from '@ijstech/eth-wallet';
import getNetworkList from '@scom/scom-network-list';
import ScomGemToken from '@scom/scom-gem-token';
@customModule
export default class Module1 extends Module {
    private gemTokenEl: ScomGemToken;
    private mainStack: VStack;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        const multicalls = getMulticallInfoList();
        const networkMap = this.getNetworkMap(options.infuraId);
        application.store = {
            infuraId: options.infuraId,
            multicalls,
            networkMap
        }
    }

    private getNetworkMap = (infuraId?: string) => {
        const networkMap = {};
        const defaultNetworkList: INetwork[] = getNetworkList();
        const defaultNetworkMap: Record<number, INetwork> = defaultNetworkList.reduce((acc, cur) => {
            acc[cur.chainId] = cur;
            return acc;
        }, {});
        for (const chainId in defaultNetworkMap) {
            const networkInfo = defaultNetworkMap[chainId];
            const explorerUrl = networkInfo.blockExplorerUrls && networkInfo.blockExplorerUrls.length ? networkInfo.blockExplorerUrls[0] : "";
            if (infuraId && networkInfo.rpcUrls && networkInfo.rpcUrls.length > 0) {
                for (let i = 0; i < networkInfo.rpcUrls.length; i++) {
                    networkInfo.rpcUrls[i] = networkInfo.rpcUrls[i].replace(/{INFURA_ID}/g, infuraId);
                }
            }
            networkMap[networkInfo.chainId] = {
                ...networkInfo,
                symbol: networkInfo.nativeCurrency?.symbol || "",
                explorerTxUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}tx/` : "",
                explorerAddressUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}address/` : ""
            }
        }
        return networkMap;
    }

    async init() {
        super.init();
        this.gemTokenEl = await ScomGemToken.create({
            "dappType": "buy",
            "logo": "https://ipfs.scom.dev/ipfs/bafkreifzi3sk4sjq4aiqejmjaw2omdytl5ll5qbvesq7h5r3ubht2xlxam",
            "description": "Welcome fellow gamers! Are you looking to enhance your gaming experience and get an edge over your competition? Look no further than Gem Tokens!  Gem Tokens are a new form of in-game currency that can be used to unlock special items, boost your character's abilities, and access exclusive features. With Gem Tokens, you can upgrade your gaming experience and get ahead in the game.",
            chainSpecificProperties: {
                43113: { contract: "0xCfF0d71140E9f4201b9151978BA1097732BbC36A" }
            },
            "networks": [
                {
                  "chainId": 43113
                }
              ],
            "wallets": [
              { "name": "metamask" }
            ],
            defaultChainId: 43113
        });
        this.mainStack.appendChild(this.gemTokenEl);
    }

    render() {
        return <i-panel>
            <i-vstack id="mainStack" margin={{top: '1rem', left: '1rem'}} gap="2rem">
                <i-scom-gem-token
                    dappType="buy"
                    networks={[
                        {
                          "chainId": 43113
                        }
                    ]}
                    wallets={[
                        {
                            "name": "metamask"
                        }
                    ]}
                    defaultChainId={43113}
                ></i-scom-gem-token>
            </i-vstack>
        </i-panel>
    }
}