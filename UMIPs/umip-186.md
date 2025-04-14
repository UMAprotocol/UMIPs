| UMIP-186   |                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| UMIP Title | Increase SPAT to 65% in VotingV2 Contract                                                                             |
| Authors    | Lee Poettcker                                                                                                         |
| Created    | April 10, 2025                                                                                                        |
| Discussion | [Discourse](https://discourse.uma.xyz/t/increase-spat-to-65/2177)                                                     |

### Summary
This proposal modifies the Settlement Price Approval Threshold (SPAT) parameter within UMA's VotingV2 contract from 50% to 65%. SPAT is the percentage of staked UMA that needs to agree for a dispute resolution vote to pass. Raising the SPAT means that voters must come to a strong consensus to settle a dispute. Analysis of 2025 voting data shows only 6/291 requests (2%) would have been affected by this change.

### Background
The Data Verification Mechanism (DVM) currently requires the majority vote to reach a SPAT which is calculated as the majority token weighted vote divided by all staked UMA. If the SPAT is met the dispute is resolved to the majority vote. If the SPAT is not met, the vote “rolls” to the next voting round to be tried again. This continues until the dispute is resolved or the vote rolls 5 times and is subsequently deleted without being resolved. 

### Motivation
The DVM is designed for voters converge on an unambiguous Schelling point. However, the current 50% SPAT allows disputes to resolve where nearly half of participants disagree - a condition that risks enforcing weakly supported outcomes during contentious votes. 

By raising the SPAT, weak majority votes will roll which allows additional time for voters to reconsider their position, UMA community discussion, and requesters can optionally choose to clarify their request. This additional time should help subsequent votes towards a stronger majority that better reflects the Schelling point and is a more reliable dispute resolution.

This change does increase the risk that votes will roll 5 times and go unresolved which is undesirable. However, this puts pressure on requesters to ensure their requests can be resolved to a strong Schelling point via the original rules or clarifications.

### Technical Specification
To make the proposed change, the UMA [GovernorV2](https://etherscan.io/address/0x7b292034084a41b9d441b71b6e3557edd0463fa8) contract should call the [VotingV2](https://etherscan.io/address/0x004395edb43efca9885cedad51ec9faf93bd34ac) contract’s [setGatAndSpat](https://etherscan.io/address/0x004395edb43efca9885cedad51ec9faf93bd34ac#writeProxyContract#F19) function with the following arguments:
GAT: 5M UMA (note: unchanged)
SPAT: 65%

### Rationale
The new SPAT value of 65% was chosen to increase the minimum consensus needed while being below the minimum voter participation and keeping rolled votes relatively infrequent to not overburden voters. 

The voting participation rate in 2025 has averaged 92% with a minimum of 67%. Below is a histogram showing the occurrence of votes by the majority vote share over the last 12 months. As a point of reference, there have been 11 votes with less than 65% majority vote share in 2025. 

***Note: see [Discourse post](https://discourse.uma.xyz/t/increase-spat-to-65/2177) to view histogram.**

Over the last year, there have been 14 rolled votes. The average majority vote share was 45%. In the second round, 13 of these votes passed and the average majority vote share was 77%. The one remaining vote passed in the third round with a majority vote share of 59%. This shows that as votes get re-rolled UMA voters do typically converge to a stronger consensus.

A historical analysis of majority vote percentages was performed. A SPAT of 65% was chosen to limit the number of rolled votes and be below the lowest vote participation rates.

### Security Considerations
This proposal requires no code changes, only a parameter update. Raising the SPAT will also increase the cost of corrupting the DVM as any attack will now require 66% of staked UMA instead of 51%. 

### Risks
A higher SPAT will lead to more rolled votes and therefore more votes. However, as shown in the data above this is expected to be minimal.
Requests that roll will have a longer time to resolution.
Persistently contentious requests that can’t make a >65% majority vote within 5 rolls will be deleted and go unresolved. 

### Implementation
1. Discourse discussion
2. Onchain governance vote 
