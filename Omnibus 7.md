**UMIP #**  - tbd

-   **UMIP title:** Add **PERP**, **GRO** as collateral currency 
-   **Author**  Chandler (chandler@umaproject.org)
-   **Status: Draft**
-   **Created:**  28 September 2021

## Summary (2-5 sentences)

This UMIP proposes adding **PERP** and **GRO** for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following needs to be added to the collateral currency whitelist introduced in UMIP-8.

### PERP
-   The **PERP** Ethereum [token address](https://etherscan.io/token/0xbc396689893d065f41bc2c6ecbee5e0085233447): 0xbc396689893d065f41bc2c6ecbee5e0085233447 
-   A final fee of **28 PERP tokens** needs to be added in the Store contract.

### GRO
-   The **GRO** Ethereum [token address](https://etherscan.io/address/0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7): 0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7 
-   A final fee of **10 000 GRO tokens** needs to be added in the Store contract. 

## Rationale

This store fee was chosen as it is approximately equivalent to $400 in line with other collateral currencies as determined by using the average price observed on Coinmarketcap. For the GRO token, the fee is set above the expected value of $400 since there is no live trading price. 

## Implementation


This change has no implementations other than the aforementioned governor transactions

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem.  This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.

