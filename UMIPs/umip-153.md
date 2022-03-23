## Headers
- UMIP-153
- UMIP title: Add Fiat DAO (FDT) as a collateral currency. 
- Author: Geoff (stadnykgeoff1@gmail.com)
- Status: Last Call
- Created: 14 March 2022
- Discourse Link: https://discourse.umaproject.org/t/umip-proposal-create-vsq-and-fdt-collateral-adds/1571

## Summary (2-5 sentences)

This UMIP proposes adding FDT for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

-   The **FDT** address on Ethereum **https://etherscan.io/token/0xed1480d12be41d92f36f5f7bdd88212e381a3677** needs to be added to the collateral currency whitelist introduced in UMIP-8.
-   A final fee of **9,000 FDT** needs to be added in the Store contract.
    
## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by **[FDT](https://www.coingecko.com/en/coins/fiat-dao-token)** values from **CoinGecko**

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.
