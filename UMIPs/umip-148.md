**UMIP-148**

- **UMIP title:** DOM, CRE8R and COMFI as approved collateral currencies 
- **Author:** Reinis Martinsons (reinis@umaproject.org), Geoff (stadnykgeoff1@gmail.com)
- **Status:** Approved
- **Created:** 26 January 2022
- **Discourse Link:**

## Summary (2-5 sentences)

This UMIP proposes adding **DOM** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

### DOM (Domination Finance)

- DOM token address 0xef5Fa9f3Dede72Ec306dfFf1A7eA0bB0A2F7046F on Ethereum (https://etherscan.io/address/0xef5Fa9f3Dede72Ec306dfFf1A7eA0bB0A2F7046F) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- DOM token address 0xc8aaeE7f1DEaC631259B8Bf2c65e71207cc53B0c on Polygon (https://polygonscan.com/address/0xc8aaeE7f1DEaC631259B8Bf2c65e71207cc53B0c) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- DOM token address 0xF56FbEc7823260D7510D63B63533153b58A01921 on Boba network (https://blockexplorer.boba.network/address/0xF56FbEc7823260D7510D63B63533153b58A01921) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 150000 DOM needs to be set in the Store contract for DOM token address on Ethereum, Polygon and Boba.

## CRE8R (CRE8R DAO)

- The CRE8R address [0xaa61d5dec73971cd4a026ef2820bb87b4a4ed8d6](https://etherscan.io/token/0xaa61d5dec73971cd4a026ef2820bb87b4a4ed8d6) on Ethereum needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 6000 CRE8R needs to be added in the Store contract.

## COMFI (CompliFi)

- The COMFI address [0x752efadc0a7e05ad1bcccda22c141d01a75ef1e4](https://etherscan.io/token/0x752efadc0a7e05ad1bcccda22c141d01a75ef1e4) on Ethereum needs to be added to the collateral currency whitelist introduced in UMIP-8.
- The COMFI address [0x72bba3aa59a1ccb1591d7cddb714d8e4d5597e96](https://polygonscan.com/token/0x72bba3aa59a1ccb1591d7cddb714d8e4d5597e96) on Polygon needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 1200 COMFI needs to be set in the Store contract for COMFI token address on Ethereum and Polygon.

## Rationale

Since there is no trading activity observed for DOM it was arbitrary assumed having $15 million market cap. Given the total supply of 1,500,000,000 DOM that would translate to $0.01 token price and 150000 DOM final fee targeting $1500 value. Final fee for DOM could be updated in the forthcoming UPP once the token is listed for trading.

COMFI and CRE8R final fees were targeted at an approximate $1500 value at the time of proposal.

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

As of time of authorship of this UMIP, DOM has no liquidity and trading activity and COMFI and CRE8R are both relatively illiquid. Because of this, developers using these currencies should take care to create "safe" contracts with it. As an example, use of DOM for a liquidatable and volatile synthetic would not be safe, as liquidators would not have access to capital required for liquidations. Its intended use case is to be used with non-liquidatable UMA contracts.
