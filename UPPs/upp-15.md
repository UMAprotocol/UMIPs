## Status

Draft

## Summary

This UPP proposes adding native USDC for use as collateral in UMA contracts on Optimism, Polygon, and Arbitrum.

## Rationale

Bridged USDC is currently approved as a collateral currency on Optimism, Arbitrum, and Polygon. Native USDC is already approved on Ethereum mainnet and Avalanche. 

This UPP is proposing to update Optimism, Polygon, and Arbitrum to include native USDC.

## Specifics

To implement this upgrade, a final fee of **250** needs to be added for the following addresses in the Store contract on Optimism, Arbitrum, and Polygon:

-   USDC Optimism: [0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85](https://optimistic.etherscan.io/token/0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85)
-   USDC Arbitrum [0xaf88d065e77c8cC2239327C5EDb3A432268e5831](https://arbiscan.io/address/0xaf88d065e77c8cC2239327C5EDb3A432268e5831)
-   USDC Polygon [0x3c499c542cef5e3811e1192ce70d8cc03d5c3359](https://polygonscan.com/address/0x3c499c542cef5e3811e1192ce70d8cc03d5c3359)


