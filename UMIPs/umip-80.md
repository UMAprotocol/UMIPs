## Headers
| UMIP-80    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add SharedStake(SGT) as Collateral               |
| Authors    | Warren Muffett (wmuffet@yahoo.com) and Chimera |
| Status     | Last Call                                                                                                                                    |
| Created    | April 9th, 2021                                                                                                                          |
| Discourse Link    | https://discourse.umaproject.org/t/add-sgt-as-an-approved-collateral/813                                                                                                                          |

## Summary (2-5 sentences)
This UMIP will add SGT as an approved collateral currency. This will involve adding the governance token to the whitelist and adding a flat final fee to charge per-request. The proposed final fee is 30 SGT per request.

The tokenomics of SGT are continuously evolving, with the DAO driving innovation. Reference https://docs.sharedstake.org/sgt/tokenomics to learn more about the tokenomics and distribution of SGT.


## Motivation
SharedStake is an initial custodial staking service that allows anyone to stake their ETH without having to maintain or monitor validator nodes. Simply put, SharedStake removes friction associated with ETH 2 staking

By adding SGT as collateral, Sharedstake will be able to create derivative contracts such as KPI options that will be proposed shortly after. This is an opportunity to incentive growth of the SharedStake platform alongside the usage of KPI options. 

Technical Specification
- The SGT address, 0x84810bcf08744d5862b8181f12d17bfd57d3b078, would need to be whitelisted to add it as collateral, as introduced in UMIP-8. 
- A final fee of 30 SGT needs to be added in the store contract.

## Technical Specification
To accomplish this upgrade, two changes need to be made:
- The SGT address, [0x84810bcf08744d5862b8181f12d17bfd57d3b078](https://etherscan.io/token/0x84810bcf08744d5862b8181f12d17bfd57d3b078),  needs to be added to the collateral currency whitelist introduced in UMIP-8. 
- A final fee of 30 SGT needs to be added in the store contract.

## Rationale

Whitelisting SGT provides another useful collateral option for UMA users interest in Ethereum 2.0 staking options and is a prerequisite for creating KPI option contracts. 

30 SGT was chosen for the fee because this sits around $500, which we have seen other collateral tokens use in the past. 

## Implementation

This change has no implementation other than the two aforementioned governor transactions that will be proposed.

## Security considerations
There are a couple security implications for contract deployers and users who are considering using EMP contracts with SGT as collateral currency. Contract deployers and users of SGT should be aware that it is a volatile currency and sponsors should take care to keep their positions over-collateralized when using the Sharedstake Governance token.

Both the distribution schedule and the underlying ETH custodial process could have an effect on SGT price. The custodial process allows for ETH holders to pool together their holdings to stake for ETH 2.0. The underlying ETH is withdrawable throughout the process by burning vETH2.