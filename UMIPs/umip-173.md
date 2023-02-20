## Headers

| UMIP-166    |                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------ |
| UMIP Title | Approve DVM upgrade to DVM2.0                                  |
| Authors    | Chris Maree (chris@umaproject.org), Pablo Maldonado (pablo@umaproject.org)       |
| Status     | Draft                                                                                     |
| Created    | x                                                                          |

## Summary

This UMIP proposes an upgrade to the UMA Data Verification Mechanism(DVM) that re-works core parts of UMA's tokenomics.
At a high level, this upgrade adds a new staking and slashing mechanism wherein voters earn a pro-rata share of emissions
 for staking and are slashed for voting wrong (or not voting). This upgrade also re-works a number of other DVM contracts
 such as an updated governor, proposer contract and new designated voting contract. Finally, this upgrade as a new
 emergency recovery mechanism to the DVM that enables emergency admin proposals to bypass the DVM's schelling point 
 oracle system in the event of an emergency. More detail on the individual changes are broken down in the sections that
 follow.

## Motivation & Rationale
The current UMA tokenonomics suffers from a few issues that the proposed upgrade aims to address: 

1. The current system has a flaw wherein an attacker can create spurious votes with the intention of capturing UMA inflation
rewards. This becomes an issue when the rewards a voter receives exceed the cost of the final fee (currently ~$1500).
In practice, this means that you need to be voting with ~225k UMA (at an UMA price of $2.15 and considering average vote
participation over a number of recent votes) to profit from creating spurious votes.

2. It is currently hard to work out the APY a voter receives for participating in the UMA system. One needs to consider
the number of other UMA involved in votes and, crucially, estimate how many voting rounds per period of time there will be
to work out an implied APY. This is difficult as the number of requests (and the resultant emissions) changes depending
on externalities that cant easily be modeled. This also poses complexities when working out the UMA inflation over time as
it is so dependent on the number of requests. Ideally, the UMA supply inflation (and the associated voter APY) are easy
to find and are not a function of the number of requests. 

3. The current UMA tokenomics does not distinguish between price requests and governance actions. Ideally, the DVM
should governance actions as democratic and avoid the schelling point penalty for voting against the majority in these
requests.

4. Today the DVM has no way of enforcing dynamic rewards for participation depending on dynamics of a given vote.
For example, we might want to penalize non-participation more if a vote is contentious. Ultimately, it would be useful to
have a more flexable mechanism for the conditions under which a voter is rewarded (or punished.)

5. Lastly, the current UMA tokenomics does not incentivize the locking up (staking) of UMA. The DVM and UMA token interplay
should drive up the UMA token price through the removal of liquid UMA through a staking mechanism. This should also make
UMA more antifragile to price shocks and general market movements through the removal of liquidity.

The proposed upgrade aims to address all of the identified issues, as well as adding in some additional nice-to-haves. A
full list of the functionality change is listed below:

1. New DVM participation incentives:
    1. Staking rewards are emitted at a constant rate per block. This means you can work out the overall UMA inflation over time and stakers can easily work out their APY for staking in the system. This emission is shared prorate among all stakers.
    2. Slashing mechanism that redistributes tokens from inactive and wrong voters to the stakers who have resolved the vote correctly. This hardens the schelling point by adding a more punitive cost function with being wrong.
    3. Dynamic slashing library that can configure the amount slashed as a function of vote participation metrics. For example, the system could be configured to slash non-participates more highly the more contentious a vote is. The configuration of this module is left up to UMA governance and can be changed later via a DVM vote.
    4. Governance votes are treated as a special price request category where slashing mechanism is not applied.
2. Spam protection mechanism enabling governance to selectively delete particular DVM price requests, if they are deemed spam.
3. Recovery mechanism where bonded emergency proposals can be executed short-circuiting the normal voting mechanism. This enables the DVM to recover from any kind of internal failure mode that could occur (breakage in the commit reveal system, contract issues or other) through a permissionless upgrade flow.
5. First class vote delegation support enabling a 1 to 1 relationship between the delegator and delegate wallets. This lets a voter delegate from a secure cold storage wallet to a hot wallet. The hot wallet can commit, reveal and claim and re-stake their rewards but cant access the underlying stake. More complex delegation systems (pooled UMA staking with delegate voting ect) can be built on top of this externally to the core UMA contracts, if desired.
4. Governance proposals now include ancillary data enabling better identification for voters.
5. Price requests now contain a unique identifier, enabling easier tracking and support in front ends.
6. A number of gas optimizations were made throughout the protocol.

## Implementation & Technical Specification
This UMIP upgrades the following contracts in the UMA DVM system:
1. Core DVM voting contract: `Voting.sol` → `VotingV2.sol` (implementation [here](https://github.com/UMAprotocol/protocol/blob/17de20eb9d43243ff8151fe3dfff19d0423bd87c/packages/core/contracts/oracle/implementation/VotingV2.sol)).
2. Proposal contract for governance actions: `Proposer.sol` → `ProposerV2.sol` (implementation [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/ProposerV2.sol))
3. Governor contract that manages UMA ecosystem contracts `Governor.sol` → `GovernorV2.sol` (implementation [here](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/oracle/implementation/GovernorV2.sol))
4. New `EmergencyProposer.sol` contract that enables the bi-passing of the schelling point oracle through a bonded, permissionless upgrade flow (implementation [here](https://github.com/UMAprotocol/protocol/blob/17de20eb9d43243ff8151fe3dfff19d0423bd87c/packages/core/contracts/oracle/implementation/EmergencyProposer.sol))
5. New `SlashingLibrary.sol` that calculates the amount of tokens to slash for not voting or voting wrong (implementation [here](https://github.com/UMAprotocol/protocol/blob/17de20eb9d43243ff8151fe3dfff19d0423bd87c/packages/core/contracts/oracle/implementation/SlashingLibrary.sol))

The associated deployments for these contracts can be found in this table:
| **Contract Name**       | **Deployment Address** |
|-------------------------|------------------------|
| `VotingV2.sol`          |                        |
| `ProposerV2.sol`        |                        |
| `EmergencyProposer.sol` |                        |
| `GovernorV2.sol`        |                        |
| `SlashingLibrary.sol`   |                        |



The proposed upgrade process involves a number of steps and is described in detail [here](https://github.com/UMAprotocol/protocol/blob/master/packages/scripts/src/upgrade-tests/voting2/readme.md). The upgrade involves proposing a number of upgrade transactions to the DVM that are then executed. These transaction involve a number of detailed steps (and the exact implementation can be found [here](https://github.com/UMAprotocol/protocol/blob/17de20eb9d43243ff8151fe3dfff19d0423bd87c/packages/scripts/src/upgrade-tests/voting2/1_Propose.ts)) and are briefly mentioned below:
1. Changing the minter permissions on the UMA token
2. Adding the new governor as the owner of the voting token
3. Transferring old governor tokens to the new governor
4. Transferring ownership of the finder to the [VotingUpgraderV2.sol](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/umips/VotingUpgraderV2.sol). This contract is used in a number of subsequent steps to ensure that the upgrade process is atomic.
5. Transfer ownership of existing voting to voting upgrader
6. Temporarily add the Governor as a contract creator
7. Register the ProposerV2 as a verified contract
8. Register the GovernorV2 as a verified contract
9. Transfer ownership of all remaining contracts to the voting upgrader
10. Transfer all multirole ownership to the voting upgrader
11. Reset governance ownership to the voting upgrader for both the old and new governor


When executed, these transaction have the effect of moving all internal ownership to the voting upgrader contract and using this to upgrade the UMA DVM system atomically. Please see the linked upgrade scripts that outline the upgrade process in detail.





## Security considerations
The upgraded DVM contracts listed above have been audited by Open Zeppelin in two separate audits ([report1](), [report2]()). Additionally, the upgrade process presented above as was also audited by OZ.
