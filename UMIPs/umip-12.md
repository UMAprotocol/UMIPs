## Headers
| UMIP-12    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add PERL as a collateral currency              |
| Authors    | TJ (tj@perlin.net) |
| Status     | Draft                                                                                                                                    |
| Created    | August 31, 2020                                                                                                                           |

## Summary (2-5 sentences)
This UMIP will add PERL to the supported collateral currencies into the global whitelist contract, allowing the usage of PERL as collateral currency.

## Motivation
PERL is the utility token of Perlin Network. PERL is expected to have a variety of uses, including as collateral for the creation of synthetic commodity tokens on UMA. 

Perlin intends to use the PERL token collateral to launch a variety of synthetic assets collateralized by its token.  These assets will be provided to customers of financial products across markets including commodities.  More information on the Perlin products can be found on the website: https://perlinx.finance/

## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The PERL address, 0xeca82185adCE47f39c684352B0439f030f860318, needs to be added to the collateral currency whitelist introduced in UMIP-8. 
- A final fee of 4000 PERL needs to be added for the PERL in the Store contract.


## Rationale

The rationale behind this change is that it fits into a larger goal of getting adoption of UMA protocol by allowing Perlin’s token (PERL) to be used as collateral, where Perlin’s projects with partners (including ICC Carbon Council) can leverage on UMA protocol.

## Implementation

This change has no implementation other than adding the PERL address to the collateral currency whitelist.

## Security considerations
Adding this new collateral by itself may introduce minimal security risk to the DVM or priceless financial contract users. The token contract is based on a battle-tested OpenZeppelin template, and all changes had been audited by a third party audit firm.

Audit Certificate: 
https://certificate.quantstamp.com/full/perlin-xerc-20-emission
https://certificate.quantstamp.com/full/perlin-x-rewards-sol

Anyone deploying a new priceless token contract using this collateral should take note to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.
$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.
 
With ETH/WETH as a benchmark, we will be looking at longevity, token supply & demand, volatility & liquidity of PERL.
With sufficient runway raised for 10 years, there is low risk of PERL token becoming valueless in the short term.
Token Supply & Demand: Ethereum currently has extra ~13-14k ETH minted on a daily basis. At a current supply of 112 million ETH, that is about issuance of 2.08% every 180 days.

PERL has a token unlock every 6 months which will occur 6 more times, representing an increase of circulating supply by 38.62%, 47.48%,18.48%, 14.48% 5.05%, and 1.74% respectively. This is a circulating supply shock that needs to be considered while using PERL as collateral. 

Volatility & Liquidity:
PERL currently has a market cap of ~21mm USD, and daily volume of ~4mm USD, which represents a volume to market cap ratio of 18.33%. 
ETH currently has a market cap of ~44.3 bil USD, and daily volume of ~ 12.21 bil USD, which represents a volume to market cap ratio of 32%.
Given the above data points, we submit that PERL should be an acceptable collateral type for the DVM to continue to operate as intended.

## Appendix

**The following considerations apply to anyone launching an EMP contract using PERL as collateral, in particular when determining the collateral ratio.  **

Comparison of ETH/PERL coefficient of variation (COV)
By looking at the COV of ETHUSDT and PERLUSDT, PERL has twice the volatility of ETH. For this reason we recommend double the haircut applied for WETH collateral(20%) on PERL as collateral (40%), equivalent to a collateral requirement(liquidation ratio) of at least 1.67.
![COV OF PERLUSDT](https://lh4.googleusercontent.com/wqlcjavAT9LJavtFETVPLQjiGWhKZA4Xc41IFDgoohlgE4yqTD006Rqw-XfoBBVf5eN2ww0KRJWk5fAfjFXGsUGKHLFV_w5_vjxahX7pwuRQ9OwO6DLJw3pyNwjeQpLw-M5htOSq)
COV of PERLUSDT
![COV OF PERLUSDT](https://lh5.googleusercontent.com/nAeD2NLxGh4tj4kFm_ZT9RacfP-F4Bg0MXhKMUtRvBvBzbZbbftCIw82wMxvaxB6jUuk36VM_ArPn2ifUnnUKrDZfd3mY3DgVGAXKvA-EaW7SCE2dX3oi7DuH2gEoyF9OTVtCbdA)
COV of ETHUSDT

**Estimation of value locked up in the pool**
To maximise the liquidity of PERL and reduce its volatility, Perlin will be incentivising users to stake their PERL in liquidity pools as well. With the current incentive mechanism, we are estimating about 20-40% of circulating PERLs to be locked up in liquidity pools.

**Balancer slippage calculation**
With that in mind, we can calculate the slippage and price impacts of any large sale of PERLs.

Assuming there’s 5 million USD worth of PERL, and 5 million USD stablecoins locked up in a 50/50 pools, which have a swap fee of 0.3%
With 40% haircut applied on PERL, an expiry of 600k of synthetic asset represents a possible sell of 1MM usd worth of PERL. In a worst case scenario where all 1 MM USD worth of PERL are being sold, we can calculate the slippage and effective price below.

![COV OF PERLUSDT](https://lh6.googleusercontent.com/7yMLiTrvagz5hfeI3zLKkdFa4_LgJh08zTKw4_CnRp_wPg3FozyB2Q4LZWQtrn2827rnmlfhNJ91lCmQfQZ57-fkSzJN9AyR2zih1ka1Fl1iOKPOybwDXCqQPwyYCQ6MqzV9QXzK)

Bi is the Balance of the token being sold to the pool (16,666,667 PERL), wi is the weight of the token being sold to the pool (0.5) and wo is the weight of the token being bought from the pool (0.5). So the linearized slippage formula for this pool would be:

SLi=(1-0.003)(0.5+0.5)(2*83,333,335)*0.5*1,666,667 = 0.1992

Representing an effective price impact of 20%. 
This is a non-negligible price impact that may trigger cascading liquidations. If all of the liquidators seek to sell the collateral (PERL), that may continue the downward spiral.

Hence it is essential for contract owners to exercise extreme caution during events of supply shock. However, in reality not all extra PERL will be sold. It might be added to the liquidity pools with more stablecoins, which actually improves liquidity and reduces the volatility.

There will be an extra 37% PERL on 26th August. The team will closely monitor the price impact in relation to the size of the liquidity pools, and ultimately determine what’s the minimum liquidity in the pools, and the safe ratio of % of PERL used as collateral vs % of PERL in the liquidity pool before we start creating synthetic assets with PERL. We will consistently use a conservative approach as we collect more data for modelling the risk.
