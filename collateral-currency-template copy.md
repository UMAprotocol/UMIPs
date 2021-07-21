**UMIP #**  - tbd

-   **UMIP title:** Collateral Omnibus 5
-   **Author**  Chandler De Kock
-   **Status: Draft**
-   **Created:**  21 July
-   **Discourse Link:**  Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding **renBTC** for use as collateral in UMA contracts.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **token** address [Polygon token address](https://polygonscan.com/token/0xdbf31df14b66535af65aac99c32e9ea844e14501) 0xdbf31df14b66535af65aac99c32e9ea844e14501 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **0.01 renBTC**
    

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


