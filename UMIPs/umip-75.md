# Headers

| UMIP-75 |                                     |
| ---------- | ----------------------------------- |
| UMIP Title | Add bDigg as a collateral collateral currency |
| Authors    | Sean Brown (@smb2796)  |
| Status     | Last Call                               |
| Created    | April 7, 2021                    |
| [Discourse](https://discourse.umaproject.org/t/add-bdigg-as-a-collateral-currency/854)    |

## Summary

This UMIP will add bDigg, the BadgerDAO DIGG vault LP token, as an approved collateral currency. 

This will involve adding it to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 0.016 bDigg per request.

View [here](https://badgerdao.medium.com/sett-vault-user-guide-9040b2f4b7a4) for an overview of Badger DAO's Setts Vaults

## Motivation

BadgerDAO’s first product is Sett vault, an automated DeFi aggregator focused on tokenized BTC assets. Users that tokenized Bitcoin in our vaults receive a corresponding “b” denominated token in return that represents their vault position. Unfortunately these vault positions then become illiquid. 

Many of BadgerDAO's users would like to borrow against their BTC vault positions as collateral to mint Badger Dollars. At the time of writing, Badger’s Sett Vaults have brought in over 1b in TVL. To allow synthetic tokens created with the EMP to take advantage of this liquidity, bwBTC/ETH SLP and bBadger have already been added as whitelisted collateral types and bDigg is a logical next addition. See below for a description of bDigg.

- **bBadger**
    - Digg tokens are staked in the Badger Sett Vault to mint bDigg token(s)
    - View [here](https://etherscan.io/address/0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a) for the associated token address


bDigg as collateral is expected to have a variety of deployments. The timing for adding it now, and the immediate application, is for use with a USD/bDiggwhich will enable the creation of another type of Badger Dollar, a yield dollar token.

**Note** - 'b' tokens are implemented as upgradeable proxy contracts.  All governance functions are currently controlled via a multisig by the core Badger Team.  

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

- The bDigg address, 0x7e7e112a68d8d2e221e11047a72ffc1065c38e1a, needs to be added to the collateral currency whitelist 
- A final fee of 0.016 needs to be added in the Store contract (~$400 at time of writing)

## Rationale

With $20m in illiquid Digg assets locked in the Digg vault, the ability to use these as collateral to borrow Badger Dollars reopens the possibilities of participating in open finance. In combination with the bDigg/USD price identifier which is also being proposed, bDigg could be used to create call options on the bDigg token price.

## Implementation

This change has no implementation other than the aforementioned governor transactions.

## Security considerations

Digg is an elastic supply rebasing token that is intended to track the price of Bitcoin by adjusting the supply of Digg. Because of the rebasing mechanism, the price of Digg (and bDigg) can be prone to large amounts of volatility. The bDigg supply is not elastic in the same way as DIGG.

To read more about this, view the Digg explainer [here](https://badger.finance/digg). Contract deployers and users should take care to adjust contract parameteriziation and usage to account for the potential volatility.
