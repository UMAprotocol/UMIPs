## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add Impossible Finance(IF) as collateral                      |
| Authors             | Howy Ho, Calvin Chu                                           |
| Status              | Draft                                                         |
| Created             | April 27th, 2021                                              |
[Discourse Link](https://discourse.umaproject.org/t/adding-impossible-finance-if-as-collateral/1017)

# Summary

This UIMP will add Impossible Finance tokens as a collateral currency for UMA. This process involves adding our governance tokens to the whitelist an adding a flat

# Motivation

Impossible Finance's next suite of products focuses on building products revolving around fundraising.

By approving this UMIP, Impossible Finance will be able to mint synthetic USD stablecoins tied to the IF ecosystem (IFUSD) backed by Impossible Finance tokens as collateral. This design will create a pool of stablecoins tied to our ecosystem (and the IF token) which allows us to manage risk and not be reliant on price movements of other stablecoins.

# Technical Specifications

1. The [IF address](https://etherscan.io/address/0xb0e1fc65c1a741b4662b813eb787d369b8614af1#code), 0xb0e1fc65c1a741b4662b813eb787d369b8614af1, will need to be whitelisted to add it as collateral. This whitelist was introduced in UMIP-8.

We note that the current version of IF is a native [BSC asset](https://bscscan.com/address/0xb0e1fc65c1a741b4662b813eb787d369b8614af1#code) and we're working with anyswap.exchange and multichain.xyz bridges to bridge our governance token to ETH.

2. A final fee of 200 IF needs to be enabled in the store contract.

# Rationale

Whitelisting IF allows us to mint IFUSD synthetic tokens for use in our ecosystem. This design enables synthetic stablecoins tied to a defi ecosystem's health. This enables defi teams to create a treasury with better risk management long term.

We chose 200 IF as the fee because this is around 450-500 USD which historically is close to what other collateral tokens have used.

# Implementation

This change has no implementation other than the two aforementioned governor transactions that will be proposed.

# Security Considerations

The primary usage of IF tokens will be to create value-backed IFUSD synthetics for use in our ecosystem. We note that IF tokens is a volatile currency with a low trading volume currently. Its price is also very closely tied to the health of the Impossible Finance ecosystem. As such, users that are considering using IF as collateral should ensure that their positions are sufficiently collaterized.

Another inherent risk in this system is the anyswap.exchange/multichain.xyz bridges which in theory, have access to mint an infinite amount of tokens on chains non-native to the asset. The bridge designs uses secure Multiparty-Computation (MPC) technology which the Impossible team has reviewed along with the audit report of the implementation. Our findings are that the technology and implementation is secure and sufficiently decentralized and should pose negligible risk.
