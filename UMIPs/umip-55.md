## Headers

| UMIP-55    |                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------ |
| UMIP Title | Approve Upgraded DVM Voting Contract to add ancillaryData                                  |
| Authors    | Matt Rice (matt@umaproject.org)                                                            |
| Status     | Approved                                                                                     |
| Created    | February 16, 2021                                                                          |

## Summary

This UMIP proposes an upgrade to the Voting module within the DVM to add flexibility to price identifiers. This upgrade
will allow price requests to include a data blob of arbitrary length (up to 8192 bytes) to provide additional arguments
or data for the price resolution process.

## Motivation & Rationale

Governance votes are extremely common and fairly costly. The largest contributor to governance votes is the requirement
for any contract that wants to track a new asset to have a new identifier approved for that asset. This means the
developer who's deploying this contract must write a new UMIP, the team must review, and all voters must submit votes
to approve the new identifier. That's a lot of effort considering most price identifiers are not controversial, and
their prices are often pulled from the similar sources as existing price identifiers.

A similar issue is presented when contracts want the DVM to provide more arbitrary computation. One could imagine
options contracts that need to have identifiers that return prices based on the option expiry and the strike price
in addition to the timestamp of the price request. Right now, the DVM only allows users to pass in a single timestamp
to note the time at which the price was requested. Unless a new identifier were created for each expiry, strike price
combination, there is no way for the DVM to price something as complex as an option. There are other, more complex use
cases for the DVM performing "decentralized computation" rather than just looking up a price.

The solution to these problems is giving deployers the ability to define price identifiers that take arbitrary
parameters.

In the first example, users can create meta price identifiers that define the _types_ of prices that can
be requested. For instance, a price identifier could allow any asset listed on Uniswap, Sushiswap, Balancer, Binance,
Coinbase, FTX, Huobi, OKEX, or Kraken. The user could provide a list of exchanges and the way they're identified on
each exchange in the ancillary data, which could be decoded by voters and bots alike.

In the second example, an option price identifier could be created and users could encode the expiry and strike price
in their ancillary data, which would give voters and bots the ability to compute the true price of any option without
needing many distinct identifiers.

## Technical Specification

This UMIP adds a Voting contract that is effectively identical to the previous Voting contract, except that most
methods now accept an additional `ancillaryData` argument. However, these overloaded methods were _added_, meaning the
existing methods will continue to work, they just will not allow the caller to provide `ancillaryData`. See the new
[voting ancillary interface](https://github.com/UMAprotocol/protocol/blob/f29b368a5fb616317790e030cef3a88be60fab84/packages/core/contracts/oracle/interfaces/VotingAncillaryInterface.sol)
for the newly overloaded methods that allow voters to vote on price requests that use ancillary data. See the new
[oracle ancillary interface](https://github.com/UMAprotocol/protocol/blob/f29b368a5fb616317790e030cef3a88be60fab84/packages/core/contracts/oracle/interfaces/OracleAncillaryInterface.sol)
that allows requesters to submit and interact with price requests that include `ancillaryData`.

## Implementation

See the updated
[Voting.sol](https://github.com/UMAprotocol/protocol/blob/f29b368a5fb616317790e030cef3a88be60fab84/packages/core/contracts/oracle/implementation/Voting.sol)
for details on how this was implemented. Note: the changes were fairly minor.

To upgrade the transaction will involve 5 steps:

1. Voting.sol and the [VotingUpgrader contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/umips/VotingUpgrader.sol)
must be deployed. Once done, the addresses will be listed in this UMIP below.
1. The new Voting.sol must be given minting privileges for the UMA token to allow it to pay inflationary rewards.
1. Finder ownership must be passed to the `VotingUpgrader`.
1. The existing voting contract's ownership must be passed to the `VotingUpgrader`.
1. The `VotingUpgrader`'s `upgrade()` method must be called.

See
[this script](https://github.com/UMAprotocol/protocol/blob/f29b368a5fb616317790e030cef3a88be60fab84/packages/core/scripts/voting-upgrade-umip/1_Propose.js)
for more details on how this is performed.

Step 1 happens beforehand. Steps 2-5 must be approved by the voters, which will be done in the vote for this UMIP.

Relevant Addresses (do not approve unless they are verified):
- `Voting`: [0x8B1631ab830d11531aE83725fDa4D86012eCCd77](https://etherscan.io/address/0x8b1631ab830d11531ae83725fda4d86012eccd77)
- `VotingUpgrader`: [0xEb07cd1Bb36514d4E6c0438FfaD62Cc96498723c](https://etherscan.io/address/0xeb07cd1bb36514d4e6c0438ffad62cc96498723c)

## Security considerations

These changes _have_ been audited by OpenZeppelin and the full audit report can be read [here](https://blog.openzeppelin.com/uma-audit-phase-4/).
