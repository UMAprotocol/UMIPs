# Headers
| UMIP-XX     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add ETHV Index v1 as price identifiers                                                                                                    |
| Authors    | Cole Kennelly (crypto.kennelly@gmail.com)
| Status     | Draft                                                                                                                                   |
| Created    | December 23, 2020                                                                                                                              |

## Summary 
This UMIP will reference a synthetic token to be created with this price identifier. This token will be referred to as 'ETHV' and will represent the token that tracks this identifier.

The DVM should support requests for a price that resolves to the ETHV Index v1 value. 

## Motivation
The DVM currently does not support ETHV Index v1 or any other volatility indices.

Volatility indices / products are a staple of the traiditional financial system, allowing market participants to speculate / hedge volatility. No on-chain volatility products exist today. Adding ETHV Index v1 would enable the first on-chain volatility products.  

## Technical Specification

The definition of this identifier should be:
- Identifier name: ETHV Index v1
- Base Currency: USD
- Quote Currency: ETHV
- Source: https://volmex-labs.firebaseio.com/current_evix/evix.json
- Result Processing: Median
- Input Processing: None.
- Price Steps: 0.0001 (4 decimals in more general trading format)
- Rounding: Closest, 0.0001 up
- Decimal: 18 (1e18)
- Pricing Interval: 60 seconds
- Dispute timestamp rounding: down

## Rationale

ETHV Index v1 tracks the 30-day implied volatility of Ether (ETH). ETHV Index v1 derives currently 30 day IV from eight near the money options close to days from expiry. Options prices are currently programmatically sourced in real-time from the most liquid ETH options market. 

## Implementation

The value of this identifier for a given timestamp should be determined by querying for the current ETHV Index v1 value from the provided endpoint. 
