## Headers
| UMIP-PLACEHOLDER    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Register Oracle Hub             |
| Authors    | Nick Pai (nick@umaproject.org) |
| Status     | Draft                                                                                                                                    |
| Created    | January 10, 2022                                                                                                                           |

# Summary (2-5 sentences)
This UMIP will have the effect of registering an oracle hub contract that will enable the optimistic oracle deployed on non-mainnet EVM networks to make cross-chain price requests to the DVM on mainnet Ethereum.

# Motivation
[This audit](https://blog.openzeppelin.com/uma-audit-phase-6/) includes a hub and spoke architecture that UMA can use to broadcast messages between mainnet, where the DVM is deployed, and other EVM networks. The hub collects messages sent between an "oracle spoke" deployed on any non-mainnet EVM networks and the DVM on mainnet, and therefore it must be approved to submit price requests to the DVM. It might be helpful to review [this UMIP](https://github.com/UMAprotocol/UMIPs/pull/350) that approved an "oracle root tunnel" that specifically sent messages between Polygon and Ethereum. The oracle hub is similar to the root tunnel except that it can be used for other EVM networks besides Polygon and it can communicate with many networks at the same time, hence why its referred to as an N-to-1 "hub" and not a 1-to-1 "tunnel".

# Cross Chain Infrastructure
[This folder](https://github.com/UMAprotocol/protocol/tree/34f3180b48397a2ba9211cc6fae33a327b9cb165/packages/core/contracts/cross-chain-oracle) contains contracts that are built on top of bridge protocols to enable UMA's Optimistic Oracle and
Governance contracts to send messages across EVM networks.

## Hub and Spoke Architecture
*Hub and *Spoke contracts are included that are respectively deployed on "Parent" and "Child" networks. As the Hub
and Spoke names imply, one Hub is designed to service many Spokes. For example, the `OracleHub` can broadcast price
resolutions from the DVM on mainnet to any number of `OracleSpoke` contracts on other EVM networks like Polygon,
Arbitrum, Optimism, and more. Similarly, the `GovernorHub` can be used by the DVM to send governance transactions to
any number of `GovernanceSpoke` contracts on other EVM networks.

Hub and Spoke contract implementations are network agnostic, but Messenger contracts are network-specific because
they are the contracts that actually send intra-network messages.

## Parent and Child Messengers
*Hub and *Spoke contracts communicate via a Parent-Child tunnel: a `ParentMessenger` contract is always deployed
to the network that the *Hub contract is deployed to, and the `ChildMessenger` contract is always deployed to the
*Spoke contract's network.

So, *Hub and *Spoke contracts have a "1-to-N" relationship, and each *Hub and *Spoke pairing has one `ParentMessenger`
and `ChildMessenger` contract deployed to the *Hub and *Spoke networks respectively.

Depending on the specific EVM networks that the *Hub and *Spoke contracts are deployed to, the implementations of the
Messenger contracts will differ. For example, sending messages between Mainnet and Arbitrum requires calling different
system contract interfaces than sending messages between Mainnet and Polygon does. This is why each network has its own
Messenger contract implementation in the `/chain-adapters` folder.

# Technical Specification
To accomplish this upgrade, the following actions need to be taken:
- The `OracleHub` will need to be registered with the `Registry` so that it can make requests to the DVM. The address for the oracle hub is [here](https://etherscan.io/address/0x8fE658AeB8d55fd1F3E157Ff8B316E232ffFF372#readContract).

# Rationale
Currently, the optimistic oracle deployed on non-mainnet EVMs such as Arbitrum, Optimism and Boba can make price requests to the oracle spoke on those chains, but the oracle spoke cannot relay price requests to the DVM via the oracle hub, which is unregistered. 

This UMIP will productionize the optimistic oracle infrastructure on these non-Mainnet EVMs and secure it by the canonical DVM on Ethereum.

# Security considerations
This repo has been audited by OpenZeppelin and the audit feedback can be found in this [here](https://blog.openzeppelin.com/uma-audit-phase-6/).