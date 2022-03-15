**UMIP 145**

- **UMIP title:** Add BOBA, YAM and JRT as supported collateral currencies
- **Author:** Reinis Martinsons (reinis@umaproject.org)
- **Status:** Approved
- **Created:** 13 January 2022
- **Discourse Link:** https://discourse.umaproject.org/t/collateral-omnibus-9/1391

## Summary (2-5 sentences)

This UMIP proposes adding **BOBA**, **YAM** and **JRT** for use as collateral in UMA contracts.

## Motivation

The addition of these collateral currencies offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

### BOBA

- BOBA token address 0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc on Ethereum (https://etherscan.io/address/0x42bbfa2e77757c645eeaad1655e0911a7553efbc) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 600 BOBA needs to be set in the Store contract for BOBA token address 0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc on Ethereum.
- A final fee of 600 BOBA also needs to be set in the Store contract for BOBA token address 0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7 on Boba network (https://blockexplorer.boba.network/address/0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7). Note that it has already been added to the collateral currency whitelist as part of deploying required UMA contract infrastructure on Boba network, but its initial final fee now is not consistent with $1500 value target.

### YAM

- The YAM token address 0xb3b681dee0435ecc0a508e40b02b3c9068d618cd on [Polygon](https://polygonscan.com/token/0xb3b681dee0435ecc0a508e40b02b3c9068d618cd) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 4000 YAM needs to be set in the Store contract for the YAM token address on Polygon. Note that this is a different amount than what is set for the already whitelisted YAM token on Ethereum.
- A final fee of 4000 needs to be set in the Store contract for the YAM token on Ethereum mainnet [0x0aacfbec6a24756c20d41914f2caba817c0d8521](https://etherscan.io/address/0x0aacfbec6a24756c20d41914f2caba817c0d8521). Note that this token is already whitelisted and thus this will only update the final fee. 

### JRT

- JRT token address 0x596eBE76e2DB4470966ea395B0d063aC6197A8C5 on Polygon (https://polygonscan.com/address/0x596ebe76e2db4470966ea395b0d063ac6197a8c5) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 22000 JRT needs to be set in the Store contract for JRT token address on Polygon. Note that this is the same amount as for already whitelisted JRT token on Ethereum.

## Rationale

The store fees for BOBA and YAM were chosen as they is approximately equivalent to $1500 in line with other collateral currencies as determined by using the current CoinGecko prices.

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

