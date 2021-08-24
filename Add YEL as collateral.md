**UMIP #**  - tbd

-   **UMIP title:** Add **YEL** as collateral currency 
-   **Author**  Chandler (chandler@umaproject.org)
-   **Status: Draft**
-   **Created:**  24 August 2021

## Summary (2-5 sentences)

This UMIP proposes adding **YEL token** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **YEL token [address](https://etherscan.io/token/0x7815bda662050d84718b988735218cffd32f75ea)**: 0x7815bda662050d84718b988735218cffd32f75ea  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **33 000  YEL tokens** needs to be added in the Store contract.
    

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by using the average market price of the token over the past 30 days on CoinGecko.

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value. This token has a significantly small value with tangible risk of the price going to zero. While trading activity shows stable prices the possibility of the token going to zero should be noted for any contract wishing to use YEL as collateral. 

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


