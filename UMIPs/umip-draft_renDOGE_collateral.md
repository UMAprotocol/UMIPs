## Headers
| UMIP-#    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add renDOGE as a collateral currency              |
| Authors    | Logan Fulcher (logan@opendao.io) |
| Status     | Draft                                                                                                                                    |
| Created    | January 20,2021                                                                                                                           |

## Summary (2-5 sentences)
This UMIP should add renDOGE to the supported collateral currencies into the global whitelist contract, allowing for the usage of renDOGE as collateral currency.

​

## Motivation
Dogecoin is a derivative of Luckycoin which forked from Litecoin and uses a Scrypt algorithm. It has been a presence in the crypto currency community since 2013, and despite its reputation as "only a meme coin," dogecoin sees ongoing mining and significant trade volume, particularly among the Litecoin mining community and its highly dedicated meme fan base. DOGE has a current market capitalization of $1.17 billion & 24 hour trading volume of approximately $256 million. The coin has maintained a top 100 position in market cap for nearly 8 years.

renDOGE is an ERC20 variant of DOGE and is the catalyst for the process of incorporating DOGE into decentralized finance. renDOGE is similar to renBTC, in that the DOGE is custodied in a permissionless manner by Ren. Thus, it is a straightforward process to move between DOGE and renDOGE. 

The motivation for adding renDOGE as a supported collateral in the global whitelist contract is for providing DOGE holders an opportunity to go long on DOGE - bringing it onto the Ethereum blockchain makes this possible. The process utilizes RenVM via OpenDAO to convert DOGE to renDOGE, then mint a stablecoin backed by DOGE ($DOGEO) as collateral, which is built on UMA. 

In process, renDOGE holders would supply tokens to the OpenDAO Platform as a collateral asset to mint DOGEO via underlying UMA contracts; the newly minted DOGEO, being a synthetic asset that traces the value of USD, could then be used elsewhere or converted into another stablecoin for a variety of purposes. Once users of the DOGEO token want their locked renDOGE collateral back, they would bring DOGEO back to the OpenDAO platform, settle any fees/interest, and then reclaim their renDOGE tokens which can be converted back into the original DOGE. A DOGEO/USDC pool will be created via Uniswap for easy access into other markets using DOGEO. It is also possible that DOGEO may find itself available for use in other future applications as well. 

​
​
## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The renDOGE address, [0x3832d2F059E55934220881F831bE501D180671A7](https://etherscan.io/token/0x3832d2F059E55934220881F831bE501D180671A7), needs to be added to the collateral currency whitelist introduced in UMIP-8. 
- A final fee of 50,000 renDOGE needs to be added for the renDOGE in the Store contract.



## Rationale
​
The rationale behind this change is that it fits into a larger goal of furthering adoption of the UMA protocol by allowing renDOGE to be used as collateral, whereas DOGE's wide user base, which currently lacks yet shows interest in defi integration, can leverage the UMA protocol. Other projects are currently working towards this goal as well. Major community members in the DOGE community, along with commercial enterprises, have already shown interest in our efforts. UMA is the best choice for furthering this endeavor, as the security, service, team, and reputation provided by UMA are certain to make these efforts successful and secure. 

The addition of renDOGE serves UMA, OpenDAO, Ren, their respective communities and members, the Dogecoin community, and the larger crypto and defi industries at large.

​

## Implementation
​
This change has no implementation other than adding the renDOGE token address to the collateral currency whitelist.


​
## Security Considerations
​
DOGE is designed to have an unlimited supply, leading to a steady negative pressure on the price. It is also subject to periods sudden volatility, as traffic is greatly affected by social media influencers; renDOGE should be expected to mirror this behavior. renDOGE minters will be provided with informational materials to help them use these new tools wisely, though the market risks will be comparable to the other collateral that is already accepted by UMA. Furthermore, the liquidity of the underlying DOGE and vast number of methods for acquiring DOGE should help mitigate most or all of the issues associated with said market volatility.


Additionally, it is important to note that renDOGE will likely be approximately 0.1% lower in price than DOGE, due to the 0.1% fee involved with going from renDOGE to DOGE, however, we don't expect this to greatly impact security. 
