## Headers
| UMIP-96   |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BNT, vBNT, BAND, SDT, KP3R, CREAM, CHAIN, and ERN as approved collateral currencies              |
| Authors    | John Shutt (john@umaproject.org), Deepanshu Hooda  (deepanshuhooda2000@gmail.com), Britt, Aaron (bitznbrewz), Shawn Hagenah (Hagz48) |
| Status     | Last Call                                                                                                                                   |
| Created    | May 2, 2021                                                                                                                           |
| [Discourse Link](https://discourse.umaproject.org/t/add-band-sdt-kp3r-cream-lpool-chain-sand-ern-and-pols-as-approved-collateral-currencies/1054)    |                                                                                                                     |

# Summary (2-5 sentences)
This UMIP will add BNT, vBNT, BAND, SDT, KP3R, CREAM, CHAIN, and ERN as approved collateral currencies. This will involve adding these to the whitelist and adding flat final fees to charge per-request.

# Motivation

Adding a collection of popular and liquid ERC20 tokens as collateral types will allow for a variety of contract deployments. These could be used with ERC20/USD price identifiers that are also being proposed to create yield dollars or covered calls collateralized by each of these tokens, among many other use cases.

Proactively approving these collateral types and price feeds will make it easier for development teams and protocol treasuries to create new products using these ERC20 tokens.

# Proposed Collateral Currencies
Note : The final fee for all ERC20 tokens will be ~$400 at time of writing

## BNT (Bancor Network Token)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The BNT address, [0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c][BNT], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 100 BNT needs to be added for BNT in the Store contract.

[BNT]: https://etherscan.io/token/0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Adding BNT as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. The Bancor community has a particularly strong interest in call options and is pursuing BNT and vBNT price identifiers in a related UMIP.

### Token Summary

The Bancor network is an automated market maker, and Bancor's native reserve currency token, BNT, is the default reserve currency for all smart tokens created on the Bancor network. One of the promises of BNT's ICO was that investors in the coin would gain interest on the transaction fees as other crypto coins are converted into and out of BNT.

Bancor's protocol converts between different ERC-20 compatible tokens. Each smart token is linked to smart contracts that hold reserves of other ERC-20 tokens. The tokens are converted internally based on these reserves and depending upon the volume of user requests.

Essentially, smart tokens can be thought of as coins that hold the monetary value of other compatible virtual coins. It is the same in principle to a central bank that holds foreign currency reserves and converts between them as required.

The Bancor protocol supports all virtual currency tokens that are compatible with the ERC-20 format. Any smart token created on the Bancor network is also ERC-20 compatible, and therefore compatible with other tokens on the network.

### Security Considerations

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. UMA holders should take note of the collaterals changes, or if added to robustness (e.g. via TWAPs) are necessary to prevent market manipulation.

BNT has a circulating supply of 194,685,628 BNT and a max supply of 194,685,628. Bancor pools are the most active trading markets for BNT, which is also available on Coinbase and other CEXs.

---

## vBNT (Bancor Governance Token)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The vBNT address, [0x48fb253446873234f2febbf9bdeaa72d9d387f94][vBNT], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 270 vBNT needs to be added for vBNT in the Store contract.

[vBNT]: https://etherscan.io/token/0x48fb253446873234f2febbf9bdeaa72d9d387f94

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Adding vBNT as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. The Bancor community has a particularly strong interest in call options and is pursuing BNT and vBNT price identifiers in a related UMIP.

### Token Summary

vBNT is the governance token of Bancor. It is generated by users who stake BNT in any whitelisted pool and represents their % ownership of the pool. This makes vBNT similar to an LP token, except you can also use it to vote in Bancor governance.

### Security Considerations

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. UMA holders should take note of the collaterals changes, or if added to robustness (e.g. via TWAPs) are necessary to prevent market manipulation.

The BNT/vBNT Bancor pool is the only active trading market, with strong liquidity and over $1M in daily volume.

---

## BAND (Band Protocol)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The BAND address, [0xba11d00c5f74255f56a5e366f4f77f5a186d7f55][BAND], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 50 BAND needs to be added for BAND in the Store contract.

[BAND]: https://etherscan.io/token/0xba11d00c5f74255f56a5e366f4f77f5a186d7f55 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Adding BAND as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to a large community interested in DeFi oracles, which may lead to more integrations with new products that would be well served by UMA's oracle design.

### Token Summary

Band protocol is a cross chain data oracle platform, that is able to take on real world data and supply it to on-chain applications, while also connecting to smart contracts to facilitate the exchange of information between on-chain and off-chain data sources. It was an Ethereum-native project but switched to Cosmos network in June 2020 and currently spans Ethereum, Cosmos, Binance, Polygon, and other ecosystems.

### Security Considerations

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. UMA holders should take note of the collaterals changes, or if added to robustness(Eg. via TWAPs) are necessary to prevent market manipulation.

An additional consideration is that on-chain liquidity for BAND is not particularly strong, with only $250,000 in liquidity in a Uniswap v2 pool and a nearly empty Uniswap v3 pool. If large amounts of BAND are used as collateral in liquidatable contracts, more on-chain liquidity would be desirable to make it easier to liquidate undercollateralized positions. This is a moot point if BAND is used for non-liquidatable contracts.

BAND has a circulating supply of 20.494 Million BAND coins and a max supply of 100 Million. Binance is the current most active market trading it.

---

## SDT (Stake DAO)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

 * The SDT address, [0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f][SDT], needs to be added to the collateral currency whitelist introduced in UMIP-8.
 * A final fee of 185 SDT needs to be added for SDT in the Store contract.

[SDT]: https://etherscan.io/token/0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Adding SDT as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to an emerging DAO community leveraging DeFi to find staking and automated investment opportunities, who may be interested in integrating products from the UMA ecosystem.

### Security Considerations

$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

SDT has a circulating supply of 9.9 Million SDT coins and a max supply of 45.6 Million. Uniswap (v2) is most active trading market.

---

## KP3R (Keep3rV1)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The KP3R address, [0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44][KP3R], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 3 KP3R needs to be added for KP3R in the Store contract.

[KP3R]: https://etherscan.io/token/0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Adding KP3R as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to a broad community of smart contract "keepers" who perform important transactions that need to be externally triggered. This may improve the robustness of UMA liquidation, dispute, and price proposal bot ecosystem.

### Token Summary

Keep3r Network is a decentralized keeper network for projects that need external devops and for external teams to find keeper jobs. Teams can make use of Keep3r to automate certain tasks such as maintaining price oracles, harvesting/re-investing yields, or anything else that requires external execution. Keep3r exists to incentivize Keepers to perform these jobs.

### Security Considerations

$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

KP3R has a circulating supply of 231,573 KP3R coins and a max supply of 231,573. Sushiswap is the most active trading market.

---
   
## CREAM (Cream)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The CREAM address, [0x2ba592f78db6436527729929aaf6c908497cb200][CREAM], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 4 CREAM needs to be added for CREAM in the Store contract.

[CREAM]: https://etherscan.io/token/0x2ba592f78db6436527729929aaf6c908497cb200 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Adding CREAM as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to the community of a large and popular decentralized lending protocol, which spans Ethereum and Binance Smart Chain and is part of the YFI ecosystem.

## Token Summary

C.R.E.A.M. Finance is a decentralized lending protocol for individuals and protocols to access financial services. The protocol is permissionless, transparent, and non-custodial.

Currently, C.R.E.A.M. is live on Ethereum, Binance Smart Chain, and Fantom.

C.R.E.A.M. Finance’s smart contract money markets are focused on longtail assets – with the goal of increasing capital efficiency for all assets in crypto markets.

Users are able to lend any supported assets on our markets, and use the provided capital as collateral to borrow another supported asset.

C.R.E.A.M. offers a wide range of tokens on their money markets, including: stablecoins (USDT, USDC, BUSD); interest-bearing stablecoins (yCRV, yyCRV); defi tokens (YFI, SUSHI, CREAM, CREAM); LP-tokens (USDC-ETH SLP, WBTC-ETH SLP); and other cryptocurrencies (ETH, LINK). This list is not exhaustive.

### Security Considerations

Cream has been audited by Trail of Bits as of 28 Jan 2021. A link to the audit report can be found [here](https://github.com/trailofbits/publications/blob/master/reviews/CREAMSummary.pdf).

$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

CREAM has a circulating supply of 721,640 CREAM coins and a max supply of 9,000,000. Gate.io is the current most active market trading it and it has over $1 million in liquidity on Sushiswap.

---

## CHAIN (Chain Games)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The CHAIN address, [0xc4c2614e694cf534d407ee49f8e44d125e4681c4][CHAIN], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 3000 CHAIN needs to be added for CHAIN in the Store contract.

[CHAIN]: https://etherscan.io/token/0xc4c2614e694cf534d407ee49f8e44d125e4681c4 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

The CHAIN token is the primary medium of exchange used for all entry fees and contest payouts on the Chain Games network, which combines original blockchain games with prize-based e-sports competitions.

Adding CHAIN as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to an emerging blockchain gaming community.

### Token Summary

CHAIN is the native token for Chain Games, a blockchain gaming platform that combines smart contract-based wagering with state-of-the-art gameplay. The CHAIN token is the primary medium of exchange on the platform and can also be used for staking and governance of the protocol. Additionally, CHAIN uses a deflationary feature, where 1% of CHAIN used as transaction fees will be burned.

It is a relatively new currency, but is currently available on multiple exchanges, including Uniswap, Bilaxy, Gate.io, and PancakeSwap. Chain Games has a well-defined roadmap and community acceptance indicates that CHAIN will be able to hold value over time. They intend to pursue cross-chain compatibility, but is not available at this tim

### Security Considerations

Chain Games smart contracts were audited by HackenProof before deploying on main net, but the audit does not appear to be publicly available. The Chain Games operates on a Non-Custodial model, reducing exposure to users. The whitepaper can be found [here](https://chaingames.io/wp-content/uploads/2020/10/WP_CHAINGAME_26_Sep_2020.pdf) for additional details. As mentioned above, CHAIN has a deflationary measure built in, which should serve to stabilize the value of this token in the future.

Relative to most fiat currencies, CHAIN is much more volatile and is very nascent in the Ethereum ecosystem. Contract developers should exercise caution when parameterizing EMP contracts using CHAIN as a collateral currency.

$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

CHAIN has a circulating supply of 293,097,683.00 CHAIN coins and a max supply of 500 Million. Its top market is Uniswap v2.

---
## ERN (Ethernity Chain)

### Technical Specification
To accomplish this upgrade, two changes need to be made:

* The ERN address, [0xbbc2ae13b23d715c30720f079fcd9b4a74093505][ERN], needs to be added to the collateral currency whitelist introduced in UMIP-8.
* A final fee of 70 ERN needs to be added for ERN in the Store contract.

[ERN]: https://etherscan.io/token/0xbbc2ae13b23d715c30720f079fcd9b4a74093505 

### Implementation

This change has no implementation other than proposing the two aforementioned governor transactions that will be proposed.

### Rationale

Ethernity Chain is a community-oriented platform that produces limited edition authenticated NFTs and trading cards created by your favorite artists and endorsed by notable figures. Built on the Ethereum Network, it aims to build the biggest A-NFT library, reward its creators and raise funds for charitable causes forever. Its unique DEFI applications allow ERN token holders to farm rare A-NFTs and vote on proposals that will amend the Ethernity Chain ecosystem.

Adding ERN as an UMA collateral type will open up additional use cases, including yield dollars and KPI options. It will also introduce UMA to an emerging NFT community.

### Token Summary

ERN is the native token for Ethernity Chain, a decentralized application platform that allows artists to create and sell artwork that is inspired and backed by celebrities for charity. ERN tokens are used to purchase these authenticated NFTs, as well as for farming, staking, and voting within the Ethernity Chain ecosystem.

This relatively new, PoS based, ERC20 token has quickly gained traction in the greater community as interest in NFTs increases exponentially. It is available on multiple exchanges, including Uniswap, Gate.io, 1inch, and Hoo.

### Security Considerations

Ethernity Chain smart contract has been audited by Immune Bytes, which you can view Here. One low severity-risk regarding the ERN token was identified and addressed in the final version of the whitepaper.

Relative to most fiat currencies, ERN is much more volatile and is very nascent in the Ethereum ecosystem. Contract developers should exercise caution when parameterizing EMP contracts using ERN as a collateral currency.

$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.

ERN has a circulating supply of 9,684,684 ERN coins and a max supply of 30 Million. Its top markets are Uniswap v2 and Uniswap v3.
