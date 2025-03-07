| UMIP-184   |                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| UMIP Title | UMA Emissions Reduction                                                                                               |
| Authors    | Dylan O’Reilly, Lee Poettcker, Chase Coleman                                                                          |
| Created    | March 5, 2025                                                                                                         |
| Snapshot   | [Snapshot](https://snapshot.box/#/s:uma.eth/proposal/0xfd0f453660188b4ed6157be5c8844db7fbdedffd4550a3b94e50c22ade78b8f6)|
| Discussion | [Discourse](https://discourse.uma.xyz/t/umip-184-update-uma-emission-rate/2000)                                       |

## Summary

The UMA DAO should initiate a measured reduction in the current emissions rate to help optimize UMA’s token economics whilst maintaining a robust voting base to ensure protocol security and viability.

## Motivation & Rationale

The current emissions are providing UMA stakers with an APY exceeding 27% per annum.
This is quite high relative to rates you can earn in the market today (ETH: ~5%, Stables: ~15%). Details on our current emissions:

- Emissions Rate: 0.18 UMA per second (5,676,480 UMA per annum) (source: Etherscan)
- Circulating Supply: 84,605,309 UMA (source: CoinGecko)
- Current Inflation Rate: 6.7%
- Cumulative Stake: 21.6M UMA
- Current APY: ~26%
- 30 Day Average Voters (Dec 2024): 280
- 30 Day Average Voting Power (Dec 2024): 18.4M UMA
- Participation Rate (Dec 2024): 22% (Voting Power / Circulating Supply)
There are several reasons why we think the UMA DAO should reduce emissions:
1. Potential Overpayment: Our current emissions may be higher than necessary to maintain our current staking and voter base.
2. Staker/ Voter Inelasticity: We believe the voting base is relatively inelastic and will likely remain stable even with reduced rates. UMA voters will still earn handsome rewards for their participation in the voting process even if current rates were to half.
3. Reduced sell pressure: Reducing excess UMA supply hitting the market could positively impact the value of the underlying asset.

## Specification & Implementation

We propose lowering the emission rate over 3 separate cuts of 0.025 UMA per second, each signed off by individual votes and followed by analysis periods. The terminal emissions rate should not be lower than 0.105 UMA per second (~15% APR).

This first proposal will involve the following:
1. Cut: reduce emissions by 14% (0.18 UMA/s to 0.155 UMA/s)[~26.3% APR to 22.6% APR]
2. Analysis: assess impact on staking / voting base
- Safeguard: Revert cut and pause further reductions if the 7 day moving average of voters who reveal falls by >20% of the 30 day moving average of the same metric on the day the vote passes.
- Subsequent cuts: Additional 0.025 UMA per second reduction votes if analysis suggests the voting base has not decreased significantly.

These votes should occur every 2 months until the terminal emissions rate is reached or the safeguard measure comes into effect.

The recurring proposals should follow this flow:
1. Reporting is posted on discourse for information and discussion with community
2. Snapshot vote starts three days after the above is posted. If passed, move to DVM with bonds sponsored by RL as outlined in the governance docs.
3. DVM vote executes the setEmissionRate function on the VotingV2 contract through UMA DAO’s GovernorV2 contract.

## Goals

1. Find the optimal emissions rate that balances rewards and participation
2. Reduce inflation while maintaining a healthy staking ecosystem
3. Improve overall token economics for UMA

## Potential Downside
If the staking / voting base is more elastic than anticipated this could lead to a reduction in the economic security provided by the Optimistic Oracle as some voters unstake. There is a possibility that these persons exit from the UMA system and do not return. APYs should increase to make it more attractive for new stakers / voters to come in and replace these persons if this occurs. We also have our analysis safeguard in place to revert cuts if the staking base reaction is outsized.

## Voting

- A yes vote means that you would like to decrease the emissions rate from 0.18 UMA/s to 0.155 UMA/s.
- A no vote means that you would like to keep the emissions rate at 0.18 UMA/s

DVM vote to follow if Snapshot vote is successful.
