## Headers
| UMIP-36    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add Dynamic Set Dollar as a collateral currency              |
| Authors    | John (dsdravage@gmail.com), Sean (sean@opendao.io) |
| Status     | Final                                                                                                                                    |
| Created    | January 13, 2021                                                                                                                           |
 
## Summary (2-5 sentences)
This UMIP will add DSD to the supported collateral currencies into the global whitelist contract, allowing the usage of DSD as collateral currency.

​
## Motivation
Dynamic Set Dollar (DSD) is a fast growing algorithmic stablecoin. DSD has a current market capitalization of $128 million & $28.7 million in liquidity. The volume since inception (under two months) has exceeded $444 million at the time of this writing. 

The motivation of adding DSD as a supported collateral in the global whitelist contract is so that DSD holders can go long on DSD by minting a stablecoin backed by DSD as collateral, which will be built on UMA.

DSD holders would supply tokens to the OpenDAO Platform as a collateral asset to mint DSDO via underlying UMA contracts and use the minted DSDO elsewhere. DSDO being a synthetic asset that traces the value of USD. Once users of the DSDO token want their locked DSD collateral back they would bring DSDO back to the OpenDAO platform, settle any fees/interest and reclaim DSD tokens. A DSDO/USDC pool will be created via uniswap & sushiswap for easy access into other markets using DSDO.

​
​
## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The DSD address, [0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3](https://etherscan.io/token/0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3), needs to be added to the collateral currency whitelist introduced in UMIP-8. 
- A final fee of 600 DSD needs to be added for the DSD in the Store contract.

_Note:-_ 

Dynamic Set Dollar is not a rebase token. The “expansion” only goes to users who have tokens bonded (staked) in the dao or to liquidity providers who have bonded the lp tokens to the app. The tokens are claimed through the website [dsd.finance](https://dsd.finance). The contractions are voluntary. Users burn their tokens for coupons that promise a premium when the price returns to peg. The coupons expire if not redeemed in 30 days.

​
​
## Rationale
​
The rationale behind this change is that it fits into a larger goal of getting adoption of UMA protocol by allowing DSD’s token (DSD) to be used as collateral, where DSD’s projects with partners (such as OpenDAO) can leverage the UMA protocol.


​
​
## Implementation
​
This change has no implementation other than adding the DSD token address to the collateral currency whitelist.

​
## Security Considerations
​
Dynamic Set Dollar is designed to have cycles. During the "debt" cycle (twap<1.00) DSD may significantly lose value temporarily. As the cycles continue the amplitude of each debt cycle will minimize untill the peg of 1.00 is bootstrapped.
The other cycle of DSD is the expansion cycle, users bonded (staked) to dsd.finance and the DAO contract will be minting tokens up to 2% of the total supply every epoch. This requires a price point of $1.50 as the supply grows the expansions overtime will also be much smaller and sustainable.

