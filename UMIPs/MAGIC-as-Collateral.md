**UMIP-161**

- **UMIP title:** Add MAGIC as collateral currency
- **Author:** Mr.Bahama
- **Status:** Ready for Review
- **Created:** 26 May 2022
- **Discourse Link:**

## Summary (2-5 sentences)

This UMIP proposes adding MAGIC for use as collateral in UMA contracts.

## Motivation

MAGIC token is economic infrastructure for various play-to-own games using TreasureDAO. Adding MAGIC to UMA contracts will enable the Treasure ecosystem to incorporate more flexible in-game assets with defi. 

## Technical Specification

To accomplish this upgrade, the following changes need to be made:


- MAGIC token address 0x539bdE0d7Dbd336b79148AA742883198BBF60342

https://arbiscan.io/token/0x539bdE0d7Dbd336b79148AA742883198BBF60342

- A final fee of 5500 MAGIC needs to be set in the Store contract for MAGIC token


## Rationale

The MAGIC final fee were targeted at an approximate $1500 value at the time of proposal.

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

