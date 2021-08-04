**UMIP 120**

-   **UMIP title:** Add Polygon renBTC and RBN as collateral currencies.
-   **Author**  Chandler De Kock (chandler@umaproject.org)
-   **Status: Approved**
-   **Created:**  21 July

## Summary (2-5 sentences)

This UMIP proposes adding **Polygon renBTC** , **RBN** for use as collateral in UMA contracts.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **renBTC** address [Polygon token address](https://polygonscan.com/token/0xdbf31df14b66535af65aac99c32e9ea844e14501) 0xdbf31df14b66535af65aac99c32e9ea844e14501 needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **0.012 renBTC**

-   The **RBN** address [Ethereum token address](https://etherscan.io/token/0x6123B0049F904d730dB3C36a31167D9d4121fA6B) 0x6123B0049F904d730dB3C36a31167D9d4121fA6B needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **10 000 RBN** 

*Note*: a precisely accurate final fee cannot be obtained currently for RBN, since RBN is not yet actively traded. Instead a somewhat arbitrary amount of 10,000 tokens was chosen.

RBN has a max total supply of 1b RBN. RBN is a protocol that has gained a large amount of traction, so an estimated starting market cap of $50m seems reasonable. This would give RBN a starting price of $0.05, putting the final fee at $500 - or right around the $400 target value.

This should however be updated in a UPP at a later date if needed.
    

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


