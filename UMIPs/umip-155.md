## Headers
- UMIP-155
- UMIP title: Add **VSQ** as collateral currency
- Author: Geoff (stadnykgeoff1@gmail.com)
- Status: Approved
- Created: 24 March 2022
- Discourse Link: https://discourse.umaproject.org/t/umip-proposal-create-add-vsq-as-collateral-on-polygon/1576

## Summary (2-5 sentences)

This UMIP proposes adding **VSQ** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **VSQ** address on Polygon **https://polygonscan.com/token/0x29F1e986FCa02B7E54138c04C4F503DdDD250558** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **250** needs to be added for **VSQ** in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by **[CoinGecko](https://www.coingecko.com/en/coins/vesq)**

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.
