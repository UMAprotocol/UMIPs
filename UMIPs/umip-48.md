# Headers
| UMIP-48     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH_JUN21 as a supported price identifier                                                                                             |
| Authors    | nonstopTheo (nonstoptheo@yam.finance)
| Status     | Approved                                                                                                                                   |
| Created    | February 10th, 2021                                                                                                                              |
| Link to Discourse| https://discourse.umaproject.org/t/umip-48-add-gaseth-jun21-as-a-supported-price-identifier/217

## SUMMARY
This UMIP will reference a synthetic token to be created with this price identifier. This token will be referred to as 'uGAS' and will represent the token that tracks this identifier with the most ETH volume on Uniswap unless a different contract is determined by voters to be more legitimate.

This follows the exact same process as UMIP-22 but uses a different timestamp.

The DVM should support requests for a price that resolves to either the median monthly Ethereum gas price or a 2-hour Time-Weighted Average Price (TWAP) on the highest volume Uniswap ETH/uGAS pool. The price resolution method to use will depend on the the timestamp the price request was made at.

For a price request made at or after the Unix timestamp `1625097600` (July 1, 2021 00:00:00 UTC), the price will be resolved with the median monthly gas price calculation defined for GASETH-1M-1M in UMIP-20.

For a price request made before `1625097600`, the price will be resolved to a 2-hour TWAP for the Uniswap price of the listed synthetic token in ETH. The synthetic token address will be listed in the Technical Specification section.


## MOTIVATION
The motivation for these price identifiers is explained in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).


# MARKETS & DATA SOURCES

Please refer to [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).


# PRICE FEED IMPLEMENTATION

To further explain the price feed implementation beyond what is stated in [umip-22]: The price feed being used is the Uniswap price feed and only the Uniswap TWAP calculation will need to be queried in real-time. The Uniswap price feed is referenced [here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js).


# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - GASETH_JUN21

**2. Base Currency** - uGAS

**3. Quote currency** - ETH

**4. Intended Collateral Currency** - WETH

**5. Collateral Decimals** - 18 decimals

**6. Rounding** - Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

# IMPLEMENTATION
The identifier requires updated timestamps.

For a price request made at or after the Unix timestamp `1625097600` (July 1, 2021 00:00:00 UTC), the price will be resolved with the median monthly gas price calculation defined for GASETH-1M-1M in UMIP-20.

For a price request made before `1625097600`, the price will be resolved to a 2-hour TWAP for the Uniswap price of the listed synthetic token in ETH. The synthetic token address will be listed in the Technical Specification section.

Updated rounding: 6 decimals

# Security considerations

Please reference the security considerations section in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md)
