## Headers

| UMIP-182       |                                                              |
| -------------- | ------------------------------------------------------------ |
| UMIP Title     | Register Blast Parent Messenger in OracleHub and GovernorHub |
| Authors        | Reinis Martinsons (reinis@umaproject.org)                    |
| Status         | Draft                                                        |
| Created        | April 18, 2024                                               |
| Discourse Link | [UMA's Discourse]()                                          |

## Summary

This UMIP proposes to register the [Blast Parent Messenger](https://etherscan.io/address/0xe3C52FB4c395165b13f8184644D60357e7D3b995) with both the [Oracle Hub](https://etherscan.io/address/0x8fE658AeB8d55fd1F3E157Ff8B316E232ffFF372) and [Governor Hub](https://etherscan.io/address/0x94520d90A4EBaA98e5A7B8D6809463f65198C104) to facilitate cross-chain communication and ensure the operational functionality of newly deployed Blast contracts, including the Optimistic Oracle.

## Motivation

The registration of the Blast Parent Messenger with the Oracle and Governor Hubs is critical for enabling cross-chain communications, essential for the operation of Optimistic Oracles and governance processes on Blast EVM-compatible network.

## Technical Specification

To achieve the goals outlined in this UMIP, the following technical steps will be undertaken:

- Register the [Blast Parent Messenger](https://etherscan.io/address/0xe3C52FB4c395165b13f8184644D60357e7D3b995) with the [Oracle Hub](https://etherscan.io/address/0x8fE658AeB8d55fd1F3E157Ff8B316E232ffFF372).
- Register the [Blast Parent Messenger](https://etherscan.io/address/0xe3C52FB4c395165b13f8184644D60357e7D3b995) with the [Governor Hub](https://etherscan.io/address/0x94520d90A4EBaA98e5A7B8D6809463f65198C104).

These actions enable the Blast Parent Messenger to function as a message bridging component in the cross-chain communication infrastructure, facilitating message passing between Blast and Mainnet networks.

## Rationale

The registration of the Blast Parent Messenger with the Oracle and Governor Hubs is a necessary step to ensure the operational functionality of the Optimistic Oracle and governance processes on Blast EVM-compatible network. By enabling cross-chain communication, the Blast Parent Messenger can facilitate the transmission of messages between Blast and Mainnet networks, supporting the seamless operation of the UMA protocol across multiple chains.

## Security Considerations

The Blast Parent Messenger is an instance of the [Optimism_ParentMessenger](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/cross-chain-oracle/chain-adapters/Optimism_ParentMessenger.sol), a contract that has been audited and functioning within UMA's cross-chain infrastructure for several years. The proposed registration of the Blast Parent Messenger with the Oracle and Governor Hubs is a standard procedure that has been successfully implemented in previous UMIPs.

The contracts targeted for registration have undergone thorough auditing. The audit details are available [here](https://blog.openzeppelin.com/uma-audit-phase-6/).
