# Guide to write a UMIP for a Price Identifier


### Below is a detailed guide for creating a UMIP to register a new price identifier with UMA’s Data Verification Mechanism (DVM). 

|                                     |
| ---------- | ----------------------------------- |
| UMIP | <#>sdfsdf
| UMIP Title | <Title> |
| Authors    | [Author]  |
| Status     | Draft                               |
| Created    | January 7, 2021                    |

## Summary


This UMIP will add the following [BadgerDAO Setts Vauls](https://badger.finance/) as approved collateral currencies.
- bwBTC/ETH SLP
- brenBTCcrv LP
- bsBTCcrv LP
- btBTCcrv LP
- bhrenBTCcrv LP 

 This will involve adding it to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 0.000000026 wBTC/ETH SLP, 0.02 brenBTCcrv LP,  0.02 bsBTCcrv LP, 0.02 btBTCcrv LP, 0.02 bhrenBTCcrv LP per request.

View [here](https://badgerdao.medium.com/sett-vault-user-guide-9040b2f4b7a4) for an overview of Setts Vaults

## Motivation

BadgerDAO’s first product is Sett vault, an automated DeFi aggregator focused on tokenized BTC assets. Users that tokenized Bitcoin in our vaults receive a corresponding “b” denominated token in return that represents their vault position. Unfortunately these vault positions then become illiquid. 

Many of BadgerDAO's users would like to borrow against their BTC vault positions as collateral to mint Badger Dollars. At the time of writing, Badger’s Sett Vaults have brought in over 600m in TVL. To allow synthetic tokens created with the EMP to take advantage of this liquidity,  bwBTC/ETH SLP, brenBTCcrv LP, bsBTCcrv LP, btBTCcrv LP, bhrenBTCcrv LP would be great additions as collateral currencies and showcase DeFi’s ability of “money legos”.

bwBTC/ETH SLP, brenBTCcrv LP, bsBTCcrv LP, btBTCcrv LP, bhrenBTCcrv LP as collateral is expected to have a variety of deployments. The timing for adding it now, and the immediate application, is for use with USDbwBTC/ETH SLP, USDbrenBTCcrv LP, USDbsBTCcrv LP, USDbtBTCcrv LP, USDbhrenBTCcrv LP  which will enable the creation of Badger Dollars, a yield dollar token. This price identifier is described in UMIP X.

## Technical Specification

To accomplish this upgrade, six changes need to be made:

- The wBTC/ETH SLP address, 0x758a43ee2bff8230eeb784879cdcff4828f2544d, needs to be added to the collateral currency whitelist introduced in UMIP-34
- The brenBTCcrv LP address, 0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545, needs to be added to the collateral currency whitelist introduced in UMIP-34
- The bsBTCcrv LP address, 0xd04c48A53c111300aD41190D63681ed3dAd998eC, needs to be added to the collateral currency whitelist introduced in UMIP-34
- The btBTCcrv LP address, 0xb9D076fDe463dbc9f915E5392F807315Bf940334, needs to be added to the collateral currency whitelist introduced in UMIP-35
- The bhrenBTCcrv LP address, 0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87, needs to be added to the collateral currency whitelist introduced in UMIP-35
- A final fee of 0.000000026 for the wBTC/ETH SLP and 0.02 for the bwBTC/ETH SLP, brenBTCcrv LP, bsBTCcrv LP, btBTCcrv LP, bhrenBTCcrv LP assets needs to be added in the Store contract.


## Rationale

With $600M in bitcoin assets illiquid, the ability to use it as collateral to borrow Badger Dollars, reopens the possibilities of participating in open finance. This is a big step forward for DeFi as an industry. 

UMA will be the first to use BTC Sett vault LP tokens as collateral and may see an significant increase in TVL due to the strong desire for the Badger Sett stakers to get leverage while building trust with the underlying UMA protocol. 


## Implementation

This change has no implementation other than adding the collateral type to the whitelist.

## Security considerations

Badger’s Sett Vault LP tokens are backed by real $BTC represented in the curve.fi pool or Sushiswap decentralized exchange, the LP tokens are a persistently valuable ERC20 token, including it as a collateral currency should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with bwBTC/ETH SLP, brenBTCcrv LP, bsBTCcrv LP, btBTCcrv LP, bhrenBTCcrv LP as the collateral currency. They should recognize that, relative to most fiat currencies, bwBTC/ETH SLP, brenBTCcrv LP, bsBTCcrv LP, btBTCcrv LP, bhrenBTCcrv LP are much more volatile than Dai. This volatility should be taken into account when parameterizing or using these EMP contracts.
