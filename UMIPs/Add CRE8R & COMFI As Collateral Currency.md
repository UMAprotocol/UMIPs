-   **UMIP title:** Add CRE8R and COMFI as collateral currency
-   **Author:**  Geoff (stadnykgeoff1@gmail.com)
-   **Status:** Draft
-   **Created:**  19 January 2022

## Summary (2-5 sentences)

This UMIP proposes adding CRE8R and COMFI for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

## Ethereum Mainnet

-   The CRE8R address https://etherscan.io/token/0xaa61d5dec73971cd4a026ef2820bb87b4a4ed8d6 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of 5,280 CRE8R needs to be added in the Store contract.
    
-   The COMFI address https://etherscan.io/token/0x752efadc0a7e05ad1bcccda22c141d01a75ef1e4 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of 1,430 COMFI needs to be added in the Store contract.

## Polygon

-  The COMFI address https://polygonscan.com/token/0x72bba3aa59a1ccb1591d7cddb714d8e4d5597e96 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-  A final fee of 1,430 COMFI needs to be added in the Store contract.

## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by querying CoinGecko.

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

