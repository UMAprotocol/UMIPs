| UMIP-XX   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add UST as whitelisted collateral currencies              |
| Authors    | Pascal Tallarida (pascal@jarvis.network)                 |
| Status     | Draft                                                 |
| Created    | 09/05/2021   
| Discourse link    | https://discourse.umaproject.org/t/add-ust-as-approved-collateral/1059                                   |

## Summary

This UMIP will add TerraUSD (UST) as approved collateral currencies. This will involve adding the currencies to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 400 UST per request.

## Motivation

UST is a decentralized algorithmic stablecoin pegged to the US dollar, issued on the Terra blockchain and wrapped onto various Blockchain.

UST has been launched in September 2020, following the success of TerraKRW (KRT), a stablecoin pegged to the Korean Won (KRW). Since launch, UST became the 5th largest stablecoin, right behdind DAI, with a $2 Bn market capitalisation. $360M of UST are currently circulating on the Ethereum Blockchain.

Unlike other algorithmic stablecoin, UST has been incredibly stable. 

Terra USD(UST) uses an elastic supply to maintain its peg to the USD. As example when there is a high demand for UST and the stable coin is traded above 1 USD, the supply of UST will be increase by minting new UST, thus bringing back down the price to a dollar. Vice versa if there is a shortage in demand for UST, the protocol will buy back UST and will burn in, thus reducing the supply and pushing the price back up to be equal to 1 USD. Also arbitrage opportunities are an incentivization to keep the price at 1 USD.

The above algorithmic approach is achieved by using LUNA token as collateral for UST. In order to mint a new supply of UST, the protocol will have to burn LUNA tokens. Vice versa if the supply of UST have to be reduced, the protocol will burn UST tokens and mint LUNA tokens.

It is listed agasint USDT on Bittrex and Kucoin, and in the UST Curve meta-pool (UST+3pool).

Adding UST as collateral will allow the creation of new synthetic assets backed by this stablecoin. For example, it will allow us, at Jarvis, to launch new liquidity pools based on UST (see [UMIP-34](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-34.md)).



## Technical Specification

To accomplish this upgrade, two changes need to be made:

- The UST address, 0xa47c8bf37f92abed4a126bda807a7b7498661acd, needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 400 UST needs to be added for UST in the Store contract.

## Rationale

The rationale behind this change is giving deployers more useful collateral currency options.


400 UST was chosen as the final fee for UST because this is the practical equivalent to the final fee of already
approved stablecoins.



## Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

## Security considerations
Adding UST as a collateral does not present any major foreseeable risks to the protocol. 

Since UST is a decentralized and algorithmic stablecoin, it bears technical risks of losing its peg, but with a proven track record with KRT, and the level of integration of UST, the risk is limited.

Using UST as collateral for contract deployers and users should account for the potential fluctuations away from the peg.
