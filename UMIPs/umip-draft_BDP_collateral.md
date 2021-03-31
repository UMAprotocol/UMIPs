# Headers
| UMIP - #    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BDP as a collateral currency              |
| Authors    | Logan (logan@opendao.io) |
| Status     | Draft                                                                                                                                   |
| Created    | March 31, 2021                                                                                                                           |
| Link to Discourse|    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                       |

## Summary (2-5 sentences)
This UMIP will add Big Data Protocol’s BDP to the supported collateral currencies on the global whitelist contract, allowing the usage of BDP as collateral currency. This serves as an important step to allow for the creation of the stablecoin backed by a basket of assets including BDP.

​
## Motivation
The motivation of adding BDP as a supported collateral in the global whitelist contract is so that BDP holders can go long on Big Data Protocol by minting a stablecoin backed by BDP as collateral, which will be built on UMA.

Big Data Protocol is a fork of and close collaborator of Ocean Protocol. The protocol buys and sells private data while preserving privacy, and incentivizes the publication of quality data assets through data farming. Big Data Protocol is deployed to Ethereum mainnet, and is in the process of expanding to other networks. The BDP token allows access to, and is used to pay fees on, the protocol. Learn more at https://bigdataprotocol.com/ 

BDP has a total supply of 32-million, with 24-million already in circulation. At the time of writing, the Big Data Protocol token market cap is $83,872,700 with a 24-hour trading volume of $10,790,928. 

BDP holders would supply tokens to the OpenDAO Platform as a collateral asset to mint an OpenDAO stablecoin via underlying UMA contracts and use the minted OpenDAO stablecoin further on the OpenDAO platform or elsewhere, with the OpenDAO stablecoin being a synthetic asset that traces the value of USD. Once users of the OpenDAO stablecoin want to redeem their locked BDP collateral, they would bring the OpenDAO stablecoin back to the OpenDAO platform, settle any fees/interest, and then reclaim their BDP tokens. An OpenDAO stablecoin/USDC pool will be created for easier access into other markets using the OpenDAO stablecoin.

​
## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The BDP address, [0xf3dcbc6d72a4e1892f7917b7c43b74131df8480e](https://etherscan.io/token/0xf3dcbc6D72a4E1892f7917b7C43b74131Df8480e), 
needs to be added to the collateral currency whitelist introduced in UMIP-8. 

- A final fee of approximately 130 BDP needs to be added for the Big Data Protocol in the Store contract.

​
## Rationale
​
The rationale behind this change is that it fits into a larger goal of furthering adoption of the UMA protocol by allowing Big Data Protocols’ tokens to be used as collateral, where Big Data Protocol’s projects with partners (such as OpenDAO) can leverage the UMA protocol. 

​
## Implementation
​
This change has no implementation other than adding the BDP token address to the collateral currency whitelist.

​
## Security Considerations
​
In the current setting, there will need to be a significant event that erodes confidence in Ocean and/or Big Data Protocol and the token for it to be a security or PR concern. We expect the distribution of BDP to increase over time as the protocol expands its efforts, and then more diverse price feeds can be incorporated.
