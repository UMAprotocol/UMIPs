**UMIP #**  - tbd

-   **UMIP title:** Add **PSP** (ParaSwap), **BEAN** (Beanstalk), and **TETU** as collateral currency 
-   **Author:**  Geoff (stadnykgeoff1@gmail.com)
-   **Status:** Draft
-   **Created:**  4 April 2022
-   **Discourse Link:**  Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding **PSP, BEAN, & TETU** for use as collateral in UMA contracts.

## Motivation

The addition of these collateral currencies offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

### PSP
-   The **PSP** address on Ethereum **https://etherscan.io/token/0xcafe001067cdef266afb7eb5a286dcfd277f3de5** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **15,000** needs to be added for **PSP** in the Store contract.
-   The **PSP** address on Polygon **https://polygonscan.com/token/0x42d61D766B85431666B39B89C43011f24451bFf6** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **15,000** needs to be added for **PSP** in the Store contract.
-   The **dePSP** address on Arbitrum **https://arbiscan.io/token/0x090b575f274d00dff18e7387e7fbd622794db427** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **15,000** needs to be added for **PSP** in the Store contract.

### BEAN
-   The **BEAN** address on Ethereum **https://etherscan.io/token/0xDC59ac4FeFa32293A95889Dc396682858d52e5Db** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **1,500** needs to be added for **BEAN** in the Store Contract.

### TETU
-   The **TETU** address on Polygon **https://polygonscan.com/token/0x255707B70BF90aa112006E1b07B9AeA6De021424** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **40,000** needs to be added for **TETU** in the Store Contract.

## Rationale

The store fees were chosen as they are approximately equivalent to $1500 in line with other collateral currencies as determined by **[CoinGecko](https://www.coingecko.com/)**

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.
