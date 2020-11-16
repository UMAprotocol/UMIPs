# Headers
| UMIP-x     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH-TWAP-1Mx1M as a supported DVM price identifier                                                                                                 |
| Authors    | Sean Brown (@sean@umaproject.org), Kevin Chan (kevin@umaproject.org)
| Status     | Draft                                                                                                                                   |
| Created    | November 12th, 2020                                                                                                                              |

## Summary (2-5 sentences)
The DVM should support requests for a price that resolves to either the median monthly Ethereum gas price or a self-referential token 2-hour Time-Weighted Average Price (TWAP). The price resolution method to use will depend on the the timestamp the price request was made at.

For a price request made at or after the Unix timestamp `1612051200` (Jan 31, 2021 00:00:00 UTC), the price will be resolved with the median monthly gas price calculation defined for GASETH-1M-1M in UMIP-20.

For a price request made before `1612051200`, the price will be resolved to a 2-hour TWAP for the Uniswap price of the synthetic token issued by the requesting contract using the GASETH-TWAP-1Mx1M price identifier.

## Motivation
The motivation for calculating aggregatory Ethereum gas prices in a set amount of units of gas is explained in UMIP-16 and UMIP-20.

For the creation of a tokenized gas price futures contract, it is desired that the DVM return either the monthly median gas price for 1 million units of gas, or a self-referential 2-hour TWAP on the market price of the contract’s token. The type of price that the DVM will return is dependent on the timestamp the price request is made at. This timestamp is the expiry timestamp of the contract that is intended to use this price identifier, so the TWAP calculation is used pre-expiry and the median monthly gas price calculation is used at expiry.

This pricing structure will allow for the creation of a tokenized futures contract that is collateralized at the **expected** price for the median monthly gas price settlement, rather than the actual median monthly gas price. This is important because the market price of a futures contract is based upon the expectation of the underlying price movement, rather than the current underlying price. Token minters should not be able to collateralize positions at a different price compared to the market price that they could sell the tokens for. This could lead to intentional and frequent under-collateralization, but is remedied by using the token’s market TWAP as the collateralization reference.

## Technical Specification

The definition of this identifier should be:
- Identifier name: GASETH-TWAP-1Mx1M
- Base Currency: ETH
- Quote Currency: GAS
- Sources: any Ethereum full node or data set of Ethereum node data. On-chain Uniswap data. 
- Result Processing: multiply by a million when calculating aggregatory gas prices.
- Input Processing: See the UMIP-16 Implementation Section. Additionally, if the contract using this price identifier is an expiring contract, inputs will change depending on the price request timestamp in comparison to the expiry timestamp.
- Price Steps: 1 Wei (1e-18)
- Pre-Timestamp Price Rounding: N/A because the median algorithm and query as described in the UMIP-16 implementation section cannot produce numbers with higher precision than 1 Wei (1e-18). 
- Post-Timestamp Price Rounding: None.
- Pricing Interval: 1 second
- Dispute timestamp rounding: down

## Rationale

Please reference the Rationale section in UMIP-16 and UMIP-20 for a full walkthrough of the rationale behind calculating aggregatory gas prices.

This price identifier will conditionally use a different price calculation methodology depending on the implied expiry state of the contract making the price request. This choice was made because a synthetic token, that is trading based on the future price of an underlying index, will have its price affected by expectations of the future movement of the underlying. If there is a large discrepancy in the synthetic’s price and the underlying index, arbitrageurs could take advantage of the difference in price by minting tokens at a rate determined by the underlying, abandoning their collateral to be liquidated and selling the tokens at the higher trading rate. Additionally, if a token is trading at a price that is higher than the notional value of the backing collateral, there would be no economic incentive for a liquidator to perform a liquidation.

A 2-hour TWAP was chosen to mitigate any risk of attempted price manipulation attempts on the market price of the synthetic. To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate the trading price of a token for an extended amount of time. This is described further in the Security Considerations section. 

## Implementation

If the price request's UTC timestamp is less than `1612051200`, voters will need to calculate a 2-hour TWAP for the contract’s token. This TWAP will be over a time interval defined by the price request timestamp and two hours before the price request timestamp. The price data used will be any on-chain price event of the associated synthetic token in the token’s highest volume Ether/synthetic gas token Uniswap pool. As the token price will already implicitly be tracking the GASETH-1M-1M price, it should be left “as returned” without any scaling transformation. The final DVM price should be returned with the synthetic token as the denominator of the price pair and should be submitted with 18 decimals.  

If the price request's UTC timestamp is at or after `1612051200`, a price request for GASETH-TWAP-1Mx1M will follow the calculation methodology for the GASETH-1M-1M identifier defined in the UMIP-20 Rationale and Implementation sections.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to be vague as voters are responsible for defining broad market consensus.

[Here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) is a reference implementation for an off-chain price feed that calculates the TWAP of a token based on Uniswap price data. This feed should be used as a convenient way to query a realtime or historical price, but voters are encouraged to build their own off-chain price feeds.

## Security considerations

Security considerations pertaining to calculating an aggregate gas price are covered in the Security Considerations section of [UMIP-16](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-16.md).

There are two general security considerations for using a self-referential token price for collateralization.

1. **Token price manipulation** - Under illiquid market conditions, an attacker could attempt to drive prices down to withdraw more collateral than normally allowed or drive prices up to trigger liquidations.  However, it is important to note that almost all attacks that have been performed on DeFi projects are executed with flash loans, which allows the attacker to obtain leverage and instantaneously manipulate a price and extract collateral.  Collateralization based off of a TWAP should make these attacks ineffective and would require attackers to use significantly more capital and take more risk to exploit any vulnerabilities.
2. **Mismatch between TWAP and gap higher in token price** - An aggressive gap higher in the token price accompanied by real buying and then a follow through rally could create a concern.  In this scenario we could see the TWAP of the token significantly lag the actual market price and create an opportunity for sponsors to mint tokens with less collateral than what they can sell them from in the market.  It is important to note that this is an edge case scenario either driven by an irrational change in market expectations - as the 30-day median gas price should be slow moving by design - or it can be driven by a “fat finger” mistake which is a vulnerability to any market.  Even in this edge case we believe the design of the token and the parameters chosen should mitigate risks.  The current Expiring Multi Party (EMP) contract requires sponsors to mint tokens with enough collateral to meet the Global Collateral Ratio (GCR) which has stood well above 200% for other contracts.  Therefore, assuming the GCR is similar for uGAS, the market would need to first rally at least 100% before potentially being exposed.  If the sponsor wishes to withdraw collateral below the GCR  they would request a “slow withdrawal” which would subject him to a 2 hour “liveness period” where anybody can liquidate the position if it fell below the required collateral ratio.  The combination of the GCR and 2 hour “liveness period” allows the 2 hour TWAP to “catch up” to the market price and would protect from this scenario and deter sponsors from attempting to exploit it.

This is the first DVM supported price identifier of its kind, so synthetic token holders should proceed with caution when interacting with a contract using this identifier. Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified.
