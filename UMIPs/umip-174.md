## Headers

| UMIP-174   |                                                                                        |
| ---------- | -------------------------------------------------------------------------------------- |
| UMIP Title | Update UMA emission rate                                                               |
| Authors    | Reinis Martinsons (reinis@umaproject.org)                                              |
| Status     | Draft                                                                                  |
| Created    | March 06, 2023                                                                         |
| Discussion | [Discourse](https://discourse.uma.xyz/t/feat-update-uma-emission/1940)                 |

## Summary

This UMIP proposes to set a new emission rate for the VotingV2 contract at 0.18 UMA per second.

## Motivation & Rationale

When upgrading the DVM system following [UMIP-173](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-173.md),
 the emission rate was initially set to zero. This was done to ensure fair participation when staking UMA tokens at the
 VotingV2 contract so that everyone has sufficient time to familiarize themselves with the new system and to ensure that
 no one can make outsized returns by staking early.

The new emission rate of 0.18 UMA per second aims to keep similar growth in total supply as the previous DVM system.
 Assuming 100 resolved requests annually (which is approximate to resolved requests in 2022) at current supply of 113M
 UMA, the previous system with 0.05% inflation rewards per request would imply 0.18 UMA minted per second.

Depending on the total amount of UMA staked in the new VotingV2 contract the expected APR for stakers will be as follows:

| Total UMA staked | Expected APR |
| ---------------- | ------------ |
| 20M              | 28%          |
| 25M              | 23%          |
| 30M              | 19%          |

Though actual return for individual stakers who vote correctly can be even higher due to redistribution of slashing for
 incorrect and missed votes.

## Implementation & Technical Specification

This UMIP proposes a governance transaction that sets the `emissionRate` parameter of the VotingV2 contract to 0.18 UMA
 scaled by 1e18.

## Security considerations

The new emission rate of 0.18 UMA per second is expected to keep similar growth in total supply as the previous DVM system.
 The new emission rate is also expected to be sufficient to incentivize voters to participate in the system.