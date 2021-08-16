**UMIP #**  - tbd

-   **UMIP title:** Add MATIC, INST and JRT as collateral currency 
-   **Author**  Chandler De Kock (chandler@umaproject.org)
-   **Status: Draft**
-   **Created:**  12 August 2021

## Summary (2-5 sentences)

This UMIP proposes adding **MATIC**, **INST** and **JRT** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:


 ### Matic token (note that the token on Polygon is Wrapped Matic)   
-   The MATIC [Ethereum token address](https://etherscan.io/address/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0):  0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0
-   The WMATIC [Polygon token address](https://polygonscan.com/token/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270): 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270
-   A final fee of **380 MATIC** needs to be added for Store in the contract.

### InstaDapp token
-   The INST [Ethereum token address](https://etherscan.io/address/0x6f40d4a6237c257fff2db00fa0510deeecd303eb): 0x6f40d4a6237c257fff2db00fa0510deeecd303eb
-   The INST [Polygon token address](https://polygonscan.com/address/0xf50D05A1402d0adAfA880D36050736f9f6ee7dee): 0xf50D05A1402d0adAfA880D36050736f9f6ee7dee
-   A final fee of **45 INST** needs to be added for Store in the contract.

### Jarvis reward token
-   The JRT [Ethereum token address](https://etherscan.io/address/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270): 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270
-   A final fee of **4000 JRT** needs to be added for Store in the contract.
    
## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by looking at the price on CoinGecko, Coinmarketcap and Cryptowatch.

## Implementation

This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.


