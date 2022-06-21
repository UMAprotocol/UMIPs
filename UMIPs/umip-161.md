**UMIP-161**

- **UMIP title:** Add MAGIC as collateral currency
- **Author:** Mr.Bahama
- **Status:** Approved
- **Created:** 26 May 2022

## Summary (2-5 sentences)

This UMIP proposes adding MAGIC for use as collateral in UMA contracts.

## Motivation

MAGIC token is economic infrastructure for various play-to-own games using TreasureDAO. Adding MAGIC to UMA contracts will enable the Treasure ecosystem to incorporate more flexible in-game assets with defi. 

## Technical Specification

To accomplish this upgrade, the following changes need to be made:


- The following address on Arbitrum needs to be added to the collateral currency whitelist introduced in UMIP-8:

     - MAGIC token address 0x539bdE0d7Dbd336b79148AA742883198BBF60342

     - https://arbiscan.io/token/0x539bdE0d7Dbd336b79148AA742883198BBF60342

- The token on ethereum mainnet also needs to be added to the collateral currency whitelist. 

     - 0xB0c7a3Ba49C7a6EaBa6cD4a96C55a1391070Ac9A

     - https://etherscan.io/token/0xB0c7a3Ba49C7a6EaBa6cD4a96C55a1391070Ac9A

- A final fee of 5500 MAGIC needs to be set in the Store contract for MAGIC token


## Rationale

The MAGIC final fee were targeted at an approximate $1500 value at the time of proposal.

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

