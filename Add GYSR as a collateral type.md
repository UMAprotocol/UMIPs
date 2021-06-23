

**UMIP #**  - tbd

-   **UMIP title:**  Add  GSYR  as collateral currency
-   **Author**  Mhairi McAlpine (mhairi@umaproject.org
-   **Status: Draft**
-   **Created:**  23rd June 2021
-   **Discourse Link:**  

## Summary (2-5 sentences)

This UMIP proposes adding  GSYR for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The  GSYR token  address  [0xbEa98c05eEAe2f3bC8c3565Db7551Eb738c8CCAb](https://etherscan.io/token/0xbEa98c05eEAe2f3bC8c3565Db7551Eb738c8CCAb)  needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of  2000 needs to be added for  GSYR  in the Store contract.

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by  querying CoinGecko on 23rd June 2021

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem. This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the guidelines on collateral type usage available here **(insert docs link)** to ensure appropriate use.
