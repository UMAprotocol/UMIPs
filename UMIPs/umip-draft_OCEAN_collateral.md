# Headers
| UMIP-#    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add Ocean as a collateral currency              |
| Authors    | Logan (logan@opendao.io) |
| Status     | Draft                                                                                                                                   |
| Created    | January 28, 2021                                                                                                                           |
| Created    | January 28, 2021                                                                                                                           |
|Link to Discourse|  https://discourse.umaproject.org/t/adding-ocean-as-collateral-umip/117                                                               |

## Summary (2-5 sentences)
This UMIP will add Ocean to the supported collateral currencies on the global whitelist contract, allowing the usage of Ocean as collateral currency. 

​
## Motivation
The motivation of adding Ocean as a supported collateral in the global whitelist contract is so that Ocean holders can go long on Ocean by minting a stablecoin backed by Ocean as collateral, which will be built on UMA.

The Ocean token is used to stake on data, to govern Ocean community funding, and to buy & sell data. Ocean and the smart contracts for Ocean functionality are deployed to Ethereum mainnet, and to further networks over time.

The supply of Ocean is capped at 1.41 billion tokens. 51% of this supply is disbursed according to a Bitcoin-like schedule over decades, to fund community projects curated by OceanDAO. At the time of writing, the Ocean token market cap is $243,700,423 with a 24-hour trading volume of $137,565,116. 

Ocean holders would supply tokens to the OpenDAO Platform as a collateral asset to mint OceanO via underlying UMA contracts and use the minted OceanO further on the OpenDAO platform or elsewhere, OceanO being a synthetic asset that traces the value of USD. Once users of the OceanO token want their locked Ocean collateral back, they would bring OceanO back to the OpenDAO platform, settle any fees/interest, and reclaim Ocean tokens. An OceanO/USDC pool will be created via uniswap for easy access into other markets using OceanO.

​
## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The Ocean address, [0x967da4048cD07aB37855c090aAF366e4ce1b9F48](https://etherscan.io/token/0x967da4048cD07aB37855c090aAF366e4ce1b9F48), 
needs to be added to the collateral currency whitelist introduced in UMIP-8. 

- A final fee of 1000 Ocean needs to be added for the Ocean in the Store contract.

​
## Rationale
​
The rationale behind this change is that it fits into a larger goal of furthering adoption of the UMA protocol by allowing Ocean tokens to be used as collateral, where Ocean’s projects with partners (such as OpenDAO) can leverage the UMA protocol. 

​
## Implementation
​
This change has no implementation other than adding the Ocean token address to the collateral currency whitelist.

​
## Security Considerations
​
In the current setting, there will need to be a significant event that erodes confidence in OceanDAO and the token for it to be a security or PR concern. We expect the distribution of Ocean to increase over time as Ocean Protocol expands its efforts, and then more price feeds can be incorporated.
