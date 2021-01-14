# Headers

| UMIP - X |                                     |
| ---------- | ----------------------------------- |
| UMIP Title | Add bwBTC/ETH SLP and bBadger as collateral currencies |
| Authors    | BitcoinPalmer  |
| Status     | Draft                               |
| Created    | January 7, 2021                    |

## Summary


This UMIP will add bwBTC/ETH SLP and bBadger, two BadgerDAO vault LP tokens, as approved collateral currencies. 

 This will involve adding it to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 0.01 bwBTC/ETH SLP and 50 bBadger per request.

View [here](https://badgerdao.medium.com/sett-vault-user-guide-9040b2f4b7a4) for an overview of Badger DAO's Setts Vaults

## Motivation

BadgerDAO’s first product is Sett vault, an automated DeFi aggregator focused on tokenized BTC assets. Users that tokenized Bitcoin in our vaults receive a corresponding “b” denominated token in return that represents their vault position. Unfortunately these vault positions then become illiquid. 

Many of BadgerDAO's users would like to borrow against their BTC vault positions as collateral to mint Badger Dollars. At the time of writing, Badger’s Sett Vaults have brought in over 600m in TVL. To allow synthetic tokens created with the EMP to take advantage of this liquidity,  bwBTC/ETH SLP and bBadger, would be great additions as collateral currencies and showcase DeFi’s ability of “money legos”.

bwBTC/ETH SLP and bBadger as collateral is expected to have a variety of deployments. The timing for adding it now, and the immediate application, is for use with a USDbwBTC/ETH SLP and bBadger price identifiers which will enable the creation of Badger Dollars, a yield dollar token. 

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

- The bwBTC/ETH SLP address, 0x758a43ee2bff8230eeb784879cdcff4828f2544d, needs to be added to the collateral currency whitelist 
- The bBadger address, 0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28, needs to be added to the collateral currency whitelist 
- A final fee of 0.01 for the wBTC/ETH SLP needs to be added in the Store contract.
- A final fee of 50 for bBadger asset needs to be added in the Store contract.




## Rationale

With $600M in bitcoin assets illiquid, the ability to use it as collateral to borrow Badger Dollars, reopens the possibilities of participating in open finance. This is a big step forward for DeFi as an industry. 

UMA will be the first to use BTC Sett vault LP tokens as collateral and may see an significant increase in TVL due to the strong desire for the Badger Sett stakers to get leverage while building trust with the underlying UMA protocol. 


## Implementation

This change has no implementation other than adding the collateral type to the whitelist.

## Security considerations

Badger’s Sett Vault LP tokens are backed by real $BTC represented in the Sushiswap decentralized exchange, the LP tokens are a persistently valuable ERC20 token, including it as a collateral currency should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with bwBTC/ETH SLP and bBadger as the collateral currency. They should recognize that, relative to most fiat currencies, bwBTC/ETH SLP and bBadger are much more volatile than Dai. This volatility should be taken into account when parameterizing or using these EMP contracts.
