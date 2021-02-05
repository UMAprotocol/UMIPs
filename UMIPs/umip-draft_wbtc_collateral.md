# Headers
| UMIP-#    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add Wrapped Bitcoin as a collateral currency              |
| Authors    | Logan (logan@opendao.io) |
| Status     |Draft                                                                                                                                   |
| Created    | Feb 2, 2021                                                                                                                           |
| Link to Discourse   | https://discourse.umaproject.org/t/adding-wbtc-as-collateral-umip/123                                                           |

## Summary (2-5 sentences)
This UMIP will add Wrapped Bitcoin (WBTC) to the supported collateral currencies on the global whitelist contract, allowing the usage of WBTC as collateral currency. 

​
## Motivation
The motivation for adding WBTC as a supported collateral in the global whitelist contract is to add utility to the UMA architecture; access to WBTC as a collateral currency creates opportunities for partner projects to better leverage the protocol.

Wrapped Bitcoin (WBTC) is an ERC-20 token on the Ethereum blockchain that represents Bitcoin. Each WBTC is backed 1:1 with Bitcoin. Wrapped Bitcoin allows for Bitcoin transfers to be conducted quicker on the Ethereum blockchain and opens up the possibility for BTC to be used in the decentralized finance ecosystem. The Bitcoin collateral is held in custody by the centralized custodian, BitGo. Bitcoin can be converted to Wrapped Bitcoin and vice versa quite easily.

At the time of writing, WBTC is trading at $33,767.47 with a 24-hour trading volume of $346,285,873. There is a circulating supply of 116,870 WBTC coins with a max supply of 116,870. Uniswap is the current most active market trading it.

​
## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The WBTC address, 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599](https://etherscan.io/token/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599), 
needs to be added to the collateral currency whitelist introduced in UMIP-8. 

- A final fee of 0.0147 WBTC (~$500)  needs to be added for the WBTC in the Store contract.

​
## Rationale
​
The rationale behind this change is that it fits into a larger goal of furthering adoption of the UMA protocol by allowing WBTC to be used as collateral, where WBTC can be utilized by projects with partners (such as OpenDAO) to leverage the UMA protocol. 

​
## Implementation
​
This change has no implementation other than adding the WBTC token address to the collateral currency whitelist.

​
## Security Considerations

Wrapped tokens carry the risk of price decoupling from their collateral currency thereby creating a vector of attack for potential bad actors, particularly when the market supporting said wrapped token has low volume/liquidity. However, WBTC’s history of keeping its peg, along with its deep liquidity and high volumes should be sufficient enough to insulate against any of the aforementioned attempts at manipulation.


 Additionally, the conversion bewteen BTC/WBTC and WBTC/BTC is completed in a fast and transparent manner, thereby increasing 'good faith' in the collateral. Users may refer to WBTC’s “orderbook dashboard” (https://WBTC.network/dashboard/order-book) to see a record of all minting and burning of WBTC on the Ethereum network. Also, users can access WBTC’s “proof of assets dashboard” (https://WBTC.network/dashboard/audit) to view the transaction amounts and the total amounts of BTC held under custody.


For final consideration, WBTC is centralized in that the BTC collateral is custodied by BitGo and thus presents a failure-bottleneck; however, it is important to note that BitGo is one of the most reputable centralized custodians in the world and has highly advanced coin security protocols in place. Furthermore, BitGo is covered by digital asset insurance worth up to $100 million in the worst case scenario.

​
In the current setting, there will need to be a significant event that erodes confidence in WBTC and/or BitGo for it to be a security or PR concern.
