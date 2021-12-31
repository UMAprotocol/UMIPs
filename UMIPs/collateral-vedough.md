## Headers
UMIP-x

-   UMIP title: Add veDOUGH as supported collateral currencies 
-   Author: Sean Brown (@smb2796)
-   Status: Draft
-   Created: Dec 31, 2021


## Summary (2-5 sentences)

This UMIP proposes adding veDOUGH as a supported collateral currency.

## Motivation

The motivation for adding veDOUGH is to use it as collateral within KPI options.

## Technical Specification

To accomplish this upgrade, the following changes needs to be added to the collateral currency whitelist introduced in UMIP-8.

-   The **veDOUGH** Ethereum token needs to be registered: [0xe6136f2e90eeea7280ae5a0a8e6f48fb222af945](
- A final fee of **3500 veDOUGH** needs to be added in the Store contract.


## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies.

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.