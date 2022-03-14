**UMIP #**  - tbd

-   **UMIP title:** Add VESQ (VSQ) & Fiat DAO (FDT) as collateral currencies. 
-   **Author:**  Geoff (stadnykgeoff1@gmail.com)
-   **Status:** Draft
-   **Created:**  14 March 2022
-   **Discourse Link:**  Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding VSQ & FDT for use as collateral in UMA contracts.

## Motivation

The addition of these collateral currencies offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **VSQ** address **https://polygonscan.com/token/0x29F1e986FCa02B7E54138c04C4F503DdDD250558** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **257 VSQ** needs to be added in the Store contract.

-   The **FDT** address **https://etherscan.io/token/0xed1480d12be41d92f36f5f7bdd88212e381a3677** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **9,375 FDT** needs to be added in the Store contract.
    
## Rationale

These store fees were chosen as they are approximately equivalent to $1500 in line with other collateral currencies as determined by **[VSQ](https://www.coingecko.com/en/coins/vesq) & [FDT](https://www.coingecko.com/en/coins/fiat-dao-token)** values from **CoinGecko**

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.
