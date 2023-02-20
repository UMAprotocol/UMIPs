## Headers

| UMIP-167       |                                               |
| -------------- | --------------------------------------------- |
| UMIP Title     | Add ACX as a supported collateral currency    |
| Authors        | Matt Rice (matt@umaproject.org)               |
| Status         | Draft                                         |
| Created        | 2022-11-22                                    |
| Discourse Link | https://github.com/UMAprotocol/UMIPs/pull/561 |

## Summary (2-5 sentences)

This UMIP proposes adding ACX for use as collateral in UMA contracts.

## Motivation

The addition of this collateral currency offers additional functionality to the UMA protocol and increases the range of contracts that can be built.

## Technical Specification

To accomplish this upgrade, the following changes need to be made:

- The ACX address [0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F](https://etherscan.io/address/0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F) needs to be added to the collateral currency whitelist introduced in UMIP-8.
- A final fee of 15000 needs to be added for ACX in the Store contract.

## Rationale

This store fee was chosen as it is approximately equivalent to $1500 in line with other collateral currencies as determined by the expected price of ACX with a $100MM fully diluted valuation. Because there are 1 billion ACX tokens in existance, this FDV would imply a per-token value of $0.1, meaning 15000 ACX would be roughly equivalent to $1500. Once the token has DEX liquidity, this final fee can be updated if it deviates too much from the desired $1500 target.

## Implementation

This change has no implementations other than the aforementioned governor transactions.

## Security considerations

Adding a collateral currency introduces a level of risk into the UMA Ecosystem. This collateral type should be monitored to ensure that the proposed collateral continues to have value.

Contract deployers considering using this collateral in an UMA contract should refer to the [guidelines on collateral type usage](https://docs.umaproject.org/uma-tokenholders/guidence-on-collateral-currency-addition) to ensure appropriate use.
