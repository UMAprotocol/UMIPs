## Headers
| UMIP-tbd   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BAND, SDT, KP3R, CREAM, CHAIN, and ERN as approved collateral currencies              |
| Authors    | John Shutt (john@umaproject.org), Deepanshu Hooda  (deepanshuhooda2000@gmail.com) |
| Status     | Draft                                                                                                                                    |
| Created    | May 2, 2021                                                                                                                           |
| [Discourse Link](https://discourse.umaproject.org/t/add-band-sdt-kp3r-cream-lpool-chain-sand-ern-and-pols-as-approved-collateral-currencies/1054)    |                                                                                                                     |

# Summary (2-5 sentences)
This UMIP will add BAND, SDT, KP3R, CREAM, CHAIN, and ERN as approved collateral currencies. This will involve adding these to the whitelist and adding flat final fees to charge per-request.

# Motivation

Adding a collection of popular and liquid ERC20 tokens as collateral types will allow for a variety of contract deployments. These could be used with ERC20/USD price identifiers that are also being proposed to create yield dollars or covered calls collateralized by each of these tokens, among many other use cases.

Proactively approving these collateral types and price feeds will make it easier for development teams and protocol treasuries to create new products using these ERC20 tokens.

# Proposed Collateral Currencies
Note : The final fee for all ERC20 tokens will be ~$400 at time of writing


## BAND (Band Protocol)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The BAND address, [0xba11d00c5f74255f56a5e366f4f77f5a186d7f55][BAND], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 35 BAND needs to be added for BAND in the Store contract.

[BAND]: https://etherscan.io/token/0xba11d00c5f74255f56a5e366f4f77f5a186d7f55 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

---

## SDT (Stake DAO)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The SDT address, [0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f][SDT], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 135 SDT needs to be added for SDT in the Store contract.

[SDT]: https://etherscan.io/token/0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

---

## KP3R (Keep3rV1)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The KP3R address, [0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44][KP3R], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 1.65 KP3R needs to be added for KP3R in the Store contract.

[KP3R]: https://etherscan.io/token/0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

---
   
## CREAM (Cream)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The CREAM address, [0x2ba592f78db6436527729929aaf6c908497cb200][CREAM], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 3.35 CREAM needs to be added for CREAM in the Store contract.

[CREAM]: https://etherscan.io/token/0x2ba592f78db6436527729929aaf6c908497cb200 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Adding CREAM as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to the community of a large and popular decentralized lending protocol, which spans Ethereum and Binance Smart Chain and is part of the YFI ecosystem.

### Security Considerations

CREAM has persistently strong liquidity, so including it as a collateral currency should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with this token as the collateral currency. 

They should recognize that, relative to most fiat currencies, CREAM is much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.

CREAM has a circulating supply of 720,000 CREAM coins and a max supply of 9 Million. Gate.io is the current most active market trading it and it has over $1 million in liquidity on SushiSwap.

---

## CHAIN (Chain Games)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The CHAIN address, [0xc4c2614e694cf534d407ee49f8e44d125e4681c4][CHAIN], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 2000 CHAIN needs to be added for CHAIN in the Store contract.

[CHAIN]: https://etherscan.io/token/0xc4c2614e694cf534d407ee49f8e44d125e4681c4 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

The CHAIN token is the primary medium of exchange used for all entry fees and contest payouts on the Chain Games network, which combines original blockchain games with prize-based e-sports competitions.

Adding CHAIN as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to an emerging blockchain gaming community.

### Security Considerations

CHAIN has persistently strong liquidity, so including it as a collateral currency should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with this token as the collateral currency. 

They should recognize that, relative to most fiat currencies, CHAIN is much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.

CHAIN has a circulating supply of 290 Million CHAIN coins and a max supply of 500 Million. Its top market is Uniswap v2.

---
## ERN (Ethernity Chain)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The ERN address, [0xbbc2ae13b23d715c30720f079fcd9b4a74093505][ERN], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 35 ERN needs to be added for ERN in the Store contract.

[ERN]: https://etherscan.io/token/0xbbc2ae13b23d715c30720f079fcd9b4a74093505 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Ethernity Chain is a community-oriented platform that produces limited edition authenticated NFTs and trading cards created by your favorite artists and endorsed by notable figures. Built on the Ethereum Network, it aims to build the biggest A-NFT library, reward its creators and raise funds for charitable causes forever. Its unique DEFI applications allow ERN token holders to farm rare A-NFTs and vote on proposals that will amend the Ethernity Chain ecosystem.

Adding ERN as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to an emerging NFT community.

### Security Considerations

ERN has persistently strong liquidity, so including it as a collateral currency should impose no additional risk to the protocol.

The only security implication is for contract deployers and users who are considering using EMP contracts with this token as the collateral currency. 

They should recognize that, relative to most fiat currencies, ERN is much more volatile. This volatility should be taken into account when parameterizing or using these EMP contracts.

ERN has a circulating supply of 11 Million ERN coins and a max supply of 30 Million. Its top markets are Uniswap v2 and Uniswap v3.
