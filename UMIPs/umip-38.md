## Headers
| UMIP-38  |                                                                                                                                         |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|                                                                                                                                    
| UMIP Title | Add YAM as a collateral currency                  |
| Authors    | Ross Galloway (ross@yam.finance)  |
| Status     | Draft                                                                                    |                                               
| Created    | January 23, 2021                                                                       |

## Summary (2-5 sentences)
This UMIP will add YAM (Governance token of the YamDAO) to the supported collateral currencies to the AddressWhitelist contract, allowing UMA users to mint synthetics using 
YAM as the collateral currency. The proposed final fee is 150 YAM per request.

## Motivation
Adding YAM as a collateral currency to UMA will allow the YAM governance token to be used to create new synthetic assets and will allow it to be used within products that are built upon UMA. YAM could be used as a collateral to mint OpenDAO's perpetual stablecoin. This adds additional utility to the YAM token and serves as a test case for adding additional governance and community tokens to the UMA whitelist.

The YamDAO is currently building out https://degenerative.finance, which is a derivatives front end built on UMA. Degenerative is the current custodian of the uGAS derivative and we plan to add more derivatives in the future. One planned derivative that we hope to cross list with OpenDAO (https://opendao.gitbook.io/whitepaper-v2/) is their perpetual stablecoin. We would provide the means to mint perpetual dollars with the collateral types currently offered and would like to also offer YAM as a collateral type.

Yam is a collaborative community innovating at the intersection of decentralized governance and programmable finance. Our open, fair and ethical philosophy fosters an inclusive and energetic culture. We are a fair-launch DAO pushing the bounds of innovation and launching experiments to enable the very promise of what DeFi can become for the world: a global, permissionless financial ecosystem.

The YamDAO has a treasury of approximately $4.2 million in stablecoins, ETH, and assorted other assets (as of 1/23/2020). The treasury does not contain YAM tokens. The YAM market-cap is approximately $23 million and trades with roughly $1 million of volume daily (https://www.coingecko.com/en/coins/yam). 

Current Projects under the YAM umbrella:
Degenerative Finance: Derivatives built using the UMA Protocol (https://degenerative.finance)
Umbrella: Insurance protocol (in production)
Yam DAO Set: Managed treasury product built on Set Protocol V2

## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The YAM address, [0x0aacfbec6a24756c20d41914f2caba817c0d8521](https://etherscan.io/token/0x0aacfbec6a24756c20d41914f2caba817c0d8521) on Mainnet, needs to be added to the collateral currency AddressWhitelist introduced in UMIP-8.
   
- A final fee of 150 YAM needs to be added for YAM in the Store contract.

## Rationale
This change encourages wider adoption of the UMA protocol through strengthening ties with the YAM DAO. Beyond allowing YAM token holders to mint stablecoins and other future synthetic assets with their tokens, it opens up new strategies for treasury management within the DAO itself, including community backed credit lines.  

150 YAM was chosen because it is similar to the amount chosen for other collateral types.

## Implementation
This change has no implementation other than adding the YAM address to the collateral currency AddressWhitelist and adding the YAM final fee to the Store contract.


## Security considerations

Anyone deploying a new priceless token contract using this collateral should take note to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent. $UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

YAM itself should present  little risk. It is a standard ERC-20 token. The rebasing function of the token contract was turned off on December 26, 2020 (https://etherscan.io/tx/0xf7b24fc7b69b6b85f28089691406ba57d878a799f0753d2f6a9f2d5821b77c9a) so there are no longer complications that would arise from a dynamically
changing supply. The Governable parameters of the Token are controlled by YAM governance, which requires an on-chain vote for any changes and is protected from malicious action by a governor contract with a 3/5 multisig that can veto governance actions if deemed malicious.

 
The project was audited by PeckShield: https://github.com/yam-finance/yamV3/blob/master/PeckShield-Audit-Report-YAMv3Update-v1.0.pdf
