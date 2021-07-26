**UMIP #**  - tbd

-   **UMIP title:** Collateral Omnibus 5
-   **Author**  Chandler De Kock
-   **Status: Draft**
-   **Created:**  21 July
-   **Discourse Link:**  Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding **Polygon renBTC** , **RBN** for use as collateral in UMA contracts.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **renBTC** address [Polygon token address](https://polygonscan.com/token/0xdbf31df14b66535af65aac99c32e9ea844e14501) 0xdbf31df14b66535af65aac99c32e9ea844e14501 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **0.01 renBTC**

-   The **RBN** address [Ethereum token address](https://etherscan.io/token/0x6123B0049F904d730dB3C36a31167D9d4121fA6B) 0x6123B0049F904d730dB3C36a31167D9d4121fA6B needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **10 000 RBN** (note: an accurate final fee cannot be attained right now, instead an arbitrary figure of 10 000 tokens is deemed sufficient until such time an accurate price of RBN is available. This should be updated in a UPP at a later date)
    

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


