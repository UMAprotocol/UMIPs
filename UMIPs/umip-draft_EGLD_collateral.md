# Headers
| UMIP - #    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add eGLD as a collateral currency              |
| Authors    | Logan (logan@opendao.io) |
| Status     | Draft                                                                                                                                   |
| Created    | Feb 13th, 2021 |
|Discourse Link| https://discourse.umaproject.org/t/add-egld-as-supported-collateral-currency/223    |

## Summary
This UMIP will add EGLD to the supported collateral currencies on the global whitelist contract, allowing the usage of eGold as collateral currency. This serves as an important step to allow for the creation of the EGLDO stablecoin.
​
## Motivation
The motivation of adding eGold as a supported collateral in the global whitelist contract is so that eGold holders can go long on eGold by minting a stablecoin backed by EGLD as collateral, which will be built on UMA.

The Elrond eGold (EGLD) Token is native to the Elrond Network and will be used for everything fromstaking, governance, transactions, smart contracts and validator rewards.

EGLD has a circulating supply of 17 Million EGLD coins and a max supply of 20.4 Million. Binance is the current most active market trading it, and at the time of writing has a market cap of $3,083,114,914 with a 24 hour trading volume of $604,440,356. More information on Elrond can be found on the website: https://elrond.com/

eGold holders would supply tokens to the OpenDAO Platform as a collateral asset to mint EGLDO via underlying UMA contracts and use the minted EGLDO further on the OpenDAO platform or elsewhere, EGLDO being a synthetic asset that traces the value of USD. Once users of the EGLDO token want their locked eGold collateral back, they would bring EGLDO back to the OpenDAO platform, settle any fees/interest, and reclaim the original EGLD tokens. An EGLDO/USDC pool will be created via uniswap for easy access into other markets using EGLDO.

​
## Technical Specifications
To accomplish this upgrade, two changes need to be made:
- The EGLD address, [0xe3fb646fC31Ca12657B17070bC31a52E323b8543]
(https://etherscan.io/token/0xe3fb646fC31Ca12657B17070bC31a52E323b8543), 
needs to be added to the collateral currency whitelist introduced in UMIP-8. 

- A final fee of 3 EGLD needs to be added for the EGLD in the Store contract.

​
## Rationale
​
The rationale behind this change is that it fits into a larger goal of furthering adoption of the UMA protocol by allowing Elrond’s eGold token to be used as collateral, where Elrond’s projects with partners (such as OpenDAO) can leverage the UMA protocol. 

​
## Implementation
​
This change has no implementation other than adding the EGLD token address (noted in Technical Specifications) to the collateral currency whitelist.

​
## Security Considerations
​
In the current setting, there will need to be a significant event that erodes confidence in Elrond and the eGold token for it to be a security or PR concern. We expect the distribution of EGLD to increase over time as the Elrond network expands its efforts, thereby decreasing the likelihood of any foul play. 
