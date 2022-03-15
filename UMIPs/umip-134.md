## Headers
UMIP-134

-   UMIP title: Add AQUA and IDIA as collateral currency 
-   Author:  Chandler (chandler@umaproject.org)
-   Status: Approved
-   Created:  12 October 2021

## Summary (2-5 sentences)

This UMIP proposes adding **AQUA** and **IDIA**  for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be added to the collateral currency whitelist introduced in UMIP-8.

### AQUA
-   The **AQUA** address [token address](https://etherscan.io/address/0xd34a24006b862f4e9936c506691539d6433ad297): 0xd34a24006b862f4e9936c506691539d6433ad297 
-   A final fee of **700 000 AQUA** needs to be added for the Store contract.
    
### IDIA
-   The **IDIA** address [token address](https://etherscan.io/address/0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89): 0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89 
-   A final fee of **450 IDIA** needs to be added for the Store contract.

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by using the current coinmarketcap prices.


## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

IDIA is currently primarily used on BSC and has minimal liquidity on Ethereum mainnet. Because of this, developers using mainnet IDIA should take care to create "safe" contracts with it. As an example, use of IDIA for a liquidatable and volatile synthetic would likely not be practical, as liquidators would not necessarily have immediate access to capital required for liquidations. Its intended use case is to be used with non-liquidatable UMA contracts. 


