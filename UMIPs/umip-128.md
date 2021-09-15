## Headers
UMIP-128

-   UMIP title: Add DFX as a Polygon collateral currency
-   Author:  Chandler (chandler@umaproject.org)
-   Status: Last Call
-   Created:  10 September 2021

## Summary (2-5 sentences)

This UMIP proposes adding **DFX** for use as collateral in UMA contracts for the Polygon Network. DFX has already been approved for use as collateral on Ethereum.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

- The DFX [Polygon token](https://polygonscan.com/address/0xe7804d91dfcde7f776c90043e03eaa6df87e6395): 0xe7804d91dfcde7f776c90043e03eaa6df87e6395 needs to be added to the collateral currency whitelist introduced in UMIP-8.

- A final fee of **800 DFX** needs to be added to the Store Contract.
- The final fee for Ethereum mainnet DFX was previously set to 400. This will also be updated to 800 to match the polygon final fee.


## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by the latest prices on CoinMarketCap and CoinGecko.

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


