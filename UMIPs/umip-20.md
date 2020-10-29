# Headers
| UMIP-20     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add GASETH-1HR-1M GASETH-4HR-1M GASETH-1D-1M GASETH-1W-1M GASETH-1M-1M as price identifiers                                                                                                 |
| Authors    | Sean Brown (@sean@umaproject.org)
| Status     | Final                                                                                                                                    |
| Created    | October 29th, 2020                                                                                                                           |

## Summary (2-5 sentences)
The DVM should support requests for aggregatory gas prices on the Ethereum blockchain in multiples of a million. This will reflect the price of a million units of gas.

## Motivation
As specified in price identifiers approved with [UMIP-16](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-16.md), the DVM currently supports reporting aggregatory gas prices of finalized blocks on the Ethereum blockchain. A gas price is the amount of Ether that is paid per unit of gas. 

For the creation of a tokenized gas price futures contract, it is desired that the DVM return the aggregatory gas price for 1 million units of gas. Using the gas price for a million units of gas is more suitable for a tokenized futures contract because tokens will actually represent a non-negligible amount of value. If a token was built with the identifiers defined in UMIP-16, participants would need to transact in millions/billions of tokens to capture any substantial value, as the price of each token would be somewhere in the range of 10-150 Gwei. This is thought to not be an optimal user experience and is the motivation for this UMIP.

## Technical Specification

The definition of this identifier should be:
- Identifier name: GASETH-1HR-1M GASETH-4HR-1M GASETH-1D-1M GASETH-1W-1M GASETH-1M-1M 
- Base Currency: ETH
- Quote Currency: GAS
- Sources: any Ethereum full node or data set of Ethereum node data
- Result Processing: Exact. Multiply by a million.
- Input Processing: see the UMIP-16  section
- Price Steps: 1 Wei (1e-18)
- Rounding: Closest: N/A because the median algorithm and query as described below cannot produce numbers with higher precision than 1 Wei (1e-18).
- Pricing Interval: 1 second
- Dispute timestamp rounding: down
- Output processing: None

## Rationale

Please reference the *Rationale* section in [UMIP-16](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-16.md) for a full walkthrough of the Rationale behind calculating aggregatory gas prices.

One million was chosen as the multiplier because, at the expected range of gas prices (10-150 gwei), this will result in prices being returned in the range of .01-.15 ETH. This range seems acceptable from a user experience perspective as an expected token value.

## Implementation

A price request for one of these identifiers will follow the calculation methodology for the matching price identifier defined in the [UMIP-16](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-16.md) *Rationale* and *Implementation* sections.

Price identifier matching between the two UMIPs is as follows.

| UMIP-20 Identifier |  UMIP-16 Counterpart |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| GASETH-1HR-1M | GASETH-1HR |
| GASETH-4HR-1M | GASETH-4HR |
| GASETH-1D-1M | GASETH-1D |
| GASETH-1W-1M | GASETH-1W |
| GASETH-1M-1M | GASETH-1M |

The results of each price identifier will then need to be multiplied by 1 million and if needed converted to Ether.

An example calculation would be:
- GASETH-1M-1M is requested at timestamp t
- The GASETH-1M price is calculated for timestamp t.
- The result of GASETH-1M is 50,000,000,001 Wei (50 Gwei).
- This is multiplied by 1,000,000 to give 50,000,000,001,000,000 (5 * 10^16) (represents price of 1 million units of gas)
- If the results are still in Wei (as they will be if using the BigQuery implementation example) the results will need to be converted into Ether: 50,000,000,001,000,000 * 10^-18 = 0.050000000001000000 Ether

## Security considerations

There are no additional security considerations other than what are listed in the *Security considerations* section of UMIP-16. This is because the only transformation done on the original identifiers is multiplying by a constant.