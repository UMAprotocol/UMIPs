**UMIP-164**

- **UMIP title:** Add THOR as collateral currency
- **Author:** abg4
- **Status:** Approved
- **Created:** 28 June 2022

## Summary (2-5 sentences)

This UMIP proposes adding THOR for use as collateral in UMA contracts.

## Motivation

The THOR token acts as a governance, utility, and proof of membership token. Adding THOR to UMA contracts will enable the Thorswap ecosystem to incorporate KPI Options to incentivize their community.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:


- The following address on Ethereum needs to be added to the collateral currency whitelist introduced in UMIP-8:

     - THOR token address 0xa5f2211B9b8170F694421f2046281775E8468044

     - https://etherscan.io/address/0xa5f2211B9b8170F694421f2046281775E8468044

- A final fee of 6500 THOR needs to be set in the Store contract for THOR token


## Rationale

The THOR final fee were targeted at an approximate $1500 value at the time of proposal.

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.