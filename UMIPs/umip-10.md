## Headers
| UMIP-10    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add WETH as a collateral currency              |
| Authors    | Matt Rice (matt@umaproject.org), Clayton Roche (clayton@umaproject.org) |
| Status     | Final                                                                                                                                    |
| Created    | July 16, 2020                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will add WETH as an approved collateral currency. This will involve adding it to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 0.1 WETH per request.

## Motivation
ETH is the most liquid currency on Ethereum. Many users on Ethereum like to borrow against their ETH to get leverage on their ETH. At the time of writing, over 1.9mm ETH are locked in MakerDAO in this fashion. To allow synthetic tokens created with the EMP to take advantage of this liquidity and desire for leverage, WETH (ETH wrapped in an ERC20) seems like an important and safe addition to Dai as the second approved collateral currency.

WETH as collateral is expected to have a variety of deployments.  The timing for adding it now, and the immediate application, is for use with USDETH, which will enable the creation of yUSD, a yielding dollar token.  This price identifier is described in UMIP 6.

## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The WETH address, [0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2), needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 0.1 needs to be added for the WETH in the Store contract.

## Rationale

The rationale behind this change is giving deployers more useful collateral currency options.  WETH needs to be used instead of ETH due to it being an ERC20, whereas native ETH is not.

0.1 was chosen because 0.1 WETH is about twice as large as the current DAI final fee (10 DAI). This accounts for the fact that WETH is a much more volatile asset. Voters cannot change the final fees immediately when the price changes on collateral assets, so this additional cushioning helps protect the system from DoS attacks in times of volatility.

## Implementation

This change has no implementation other than the two aforementioned governor transactions that will be proposed.

## Security considerations
Since WETH is a persistently valuable ERC20 token, including it as a collateral currency should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with WETH as the collateral currency. They should recognize that, relative to most fiat currencies, WETH is much more volatile than Dai. This volatility should be taken into account when parameterizing or using these EMP contracts.

For added assurance, WETH is not listed on the [buggy ERC20 contracts list](https://github.com/sec-bit/awesome-buggy-erc20-tokens/blob/master/bad_tokens.all.csv).
