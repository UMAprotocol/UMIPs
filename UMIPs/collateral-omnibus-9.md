**UMIP #** - tbd

- **UMIP title:** Add BOBA, DOM and JRT as collateral currency 
- **Author:** Reinis Martinsons (reinis@umaproject.org)
- **Status:** Draft
- **Created:** 13 January 2022
- **Discourse Link:** Insert link to discourse topic after it has been moved into draft UMIPs

## Summary (2-5 sentences)

This UMIP proposes adding **BOBA**, **DOM** and **JRT** for use as collateral in UMA contracts.

## Motivation

The addition of these collateral currencies offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

### BOBA

- BOBA token address 0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc on Ethereum (https://etherscan.io/address/0x42bbfa2e77757c645eeaad1655e0911a7553efbc) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 600 BOBA needs to be set in the Store contract for BOBA token address 0x42bBFa2e77757C645eeaAd1655E0911a7553Efbc on Ethereum.
- A final fee of 600 BOBA also needs to be set in the Store contract for BOBA token address 0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7 on Boba network (https://blockexplorer.boba.network/address/0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7). Note that it has already been added to the collateral currency whitelist as part of deploying required UMA contract infrastructure on Boba network, but its initial final fee now is not consistent with $1500 value target.

### DOM

- DOM token address 0xef5Fa9f3Dede72Ec306dfFf1A7eA0bB0A2F7046F on Ethereum (https://etherscan.io/address/0xef5Fa9f3Dede72Ec306dfFf1A7eA0bB0A2F7046F) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- DOM token address 0xc8aaeE7f1DEaC631259B8Bf2c65e71207cc53B0c on Polygon (https://polygonscan.com/address/0xc8aaeE7f1DEaC631259B8Bf2c65e71207cc53B0c) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- DOM token address 0xb063fDCE9cF1c111a576Bff7Bf75C6cc7DB4Cc3f on Boba network (https://blockexplorer.boba.network/address/0xb063fDCE9cF1c111a576Bff7Bf75C6cc7DB4Cc3f) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 150000 DOM needs to be set in the Store contract for DOM token address on Ethereum, Polygon and Boba.

### JRT

- JRT token address 0x596eBE76e2DB4470966ea395B0d063aC6197A8C5 on Polygon (https://polygonscan.com/address/0x596ebe76e2db4470966ea395b0d063ac6197a8c5) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 22000 JRT needs to be set in the Store contract for JRT token address on Polygon. Note that this is the same amount as for already whitelisted JRT token on Ethereum.

## Rationale

Store fee for BOBA was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by using the current CoinGecko prices.

Since there is no trading activity observed for DOM it was arbitrary assumed having $15 million market cap. Given the total supply of 1,500,000,000 DOM that would translate to $0.01 token price and 150000 DOM final fee targeting $1500 value. Final fee for DOM could be updated in the forthcoming UPP once the token is listed for trading.

## Implementation


This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

As of time of authorship of this UMIP DOM has no liquidity and trading activity. Because of this, developers using DOM should take care to create "safe" contracts with it. As an example, use of DOM for a liquidatable and volatile synthetic would not be safe, as liquidators would not have access to capital required for liquidations. Its intended use case is to be used with non-liquidatable UMA contracts.

