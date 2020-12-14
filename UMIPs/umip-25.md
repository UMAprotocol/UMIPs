# Headers
| UMIP-25     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH-FEB21 and GASETH-MAR21 as a supported DVM price identifier                                                                                                 |
| Authors    | Feddas 
| Status     | Draft                                                                                                                                   |
| Created    | December 10th, 2020                                                                                                                              |

## Summary (2-5 sentences)
This UMIP will reference a synthetic token to be created with this price identifier. This token will be referred to as 'uGAS' and will represent the token that tracks this identifier with the most ETH volume on Uniswap unless a different contract is determined by voters to be more legitimate.

The DVM should support requests for a price that resolves to either the median monthly Ethereum gas price or a 2-hour Time-Weighted Average Price (TWAP) on the highest volume Uniswap ETH/uGAS pool. The price resolution method to use will depend on the the timestamp the price request was made at.

#### Identifier GASETH-FEB21:

For a price request made at or after the Unix timestamp `1614556800` (March 1, 2021 00:00:00 UTC), the price will be resolved with the median monthly gas price calculation defined for GASETH-1M-1M in UMIP-20.

For a price request made before `1614556800`, the price will be resolved to a 2-hour TWAP for the Uniswap price of the listed synthetic token in ETH. The synthetic token address will be listed in the Technical Specification section.

#### Identifier GASETH-MAR21: 

For a price request made at or after the Unix timestamp `1617235200` (April 1, 2021 00:00:00 UTC), the price will be resolved with the median monthly gas price calculation defined for GASETH-1M-1M in UMIP-20.

For a price request made before `1617235200`, the price will be resolved to a 2-hour TWAP for the Uniswap price of the listed synthetic token in ETH. The synthetic token address will be listed in the Technical Specification section.

## Motivation
The motivation for these price identifiers is explained in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).

## Technical Specification
Technical specifications are the same as in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md) except: 
- Identifier name: GASETH-FEB21 and GASETH-MAR21

## Rationale
Please reference the Rationale section in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md) for a full walkthrough of the rationale behind calculating aggregatory gas prices.

## Implementation
Implementation is the same as in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md) except the time stamps are adjusted for each identifier according to: 

Identifier GASETH-FEB21: Unix timestamp `1614556800` (March 1, 2021 00:00:00 UTC)

Identifier GASETH-MAR21: Unix timestamp `1617235200` (April 1, 2021 00:00:00 UTC)

## Security considerations
Please reference the security considerations section in [umip-22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md)
