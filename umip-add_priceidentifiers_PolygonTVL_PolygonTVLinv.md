## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add PolygonTVL and PolygonTVLinv as a supported price identifier |
| Authors             | Artem Zvyagin (zvyaginartems@gmail.com), Kirill Mokhniuk (kirillmokhniuk@gmail.com), Vitaliy Gataulin (vitalygataulin@gmail.com)                                                       |
| Status              | Draft                                                         |
| Created             | June 07, 2021                                                 |
| Discourse Link      | **Create a post in [UMA's Discourse](https://discourse.umaproject.org/c/umips/18) and link here**            |

# Summary

The DVM should support price requests for Polygon(Matic) total value locked (TVL).
PolygonTVL and PolygonTVLinv reflects usual and inverted Polygon(Matic) TVL:

PolygonTVL = Polygon(Matic) TVL / 10^9

PolygonTVLinv = 1 / Polygon(Matic) TVL * 10^9

# Motivation
TVL of Defi projects are still pretty volatile so if you can predict where TVL will go you need some tools for investing based on TVL.

Polygon(Matic) TVL is needed to create a synthetic token that will reflect the Polygon(Matic) TVL. These tokens can be minted and sold when investors think that Polygon TVL will decrease.

Inverted Polygon(Matic) TVL is needed to create a synthetic token that will reflect the inverted Polygon(Matic) TVL. These tokens can be minted and sold when investors think that Polygon TVL will increase.

# Data Specifications

To determine TVL, you should use the project Defi Llama (https://defillama.com/protocol/polygon) and calculate it in USD by formulas:

PolygonTVL = Polygon(Matic) TVL / 10^9

PolygonTVLinv = 1 / Polygon(Matic) TVL * 10^9.

**Defi Llama About:** (https://defillama.com/about)

DefiLlama is committed to accurate data without ads or sponsored content, and transparency.
We list DeFi projects from all chains.
Thanks to CoinGecko, SNX Tools and PickleJar.info
Based on Uniswap.info and its fork SushiSwap.vision.

**How Defi Llama calculate TVL:** (https://docs.llama.fi/list-your-project/what-to-include-as-tvl)

Generally, any asset that is held in one of the protocol's contracts can be considered as part of TVL, with two notable exceptions:

* Assets on pool2, that is, money that is providing liquidity to an AMM pool where one of the tokens is from the protocol (except on some cases where those assets are performing an active function such as being used as collateral).
* Non-crypto assets that are external to the blockchain, such as bonds or fiat currency. We don't consider the dollars stored on Tether's bank account as TVL, for example.

**How Defi Llama calculate Polygon(Matic) TVL:**

https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/polygon/index.js

-----------------------------------------
- Price identifier name: PolygonTVL
- Example data providers: Defi Llama
- Cost to use: Free
- Data update frequency: 1 hour
-----------------------------------------
- Price identifier name: PolygonTVLinv
- Example data providers: Defi Llama
- Cost to use: Free
- Data update frequency: 1 hour


# Price Feed Implementation

Price feed implementation described in the Data Specifications section.

# Technical Specifications

-----------------------------------------
- Price identifier name: PolygonTVL
- Base Currency: USD
- Quote Currency: None. This is a ratio
- Rounding: Round to nearest 3 decimal places (fourth decimal place digit >= 5 rounds up and < 5 rounds down)
-----------------------------------------
- Price identifier name: PolygonTVLinv
- Base Currency: USD
- Quote Currency: None. This is a ratio
- Rounding: Round to nearest 3 decimal places (fourth decimal place digit >= 5 rounds up and < 5 rounds down)

# Rationale

We had the option to use CoinGecko or DefiPulse as data providers. Unfortunately, CoinGecko API can't provide Polygon TVL data, so we can't use it currently.
DefiPulse is not decentralized enough and it is not transparent how it calculates TVL.
That why we decided to use DefiLlama as a source of TVL data.

# Implementation

-----------------------------------------
PolygonTVL

1. Make a GET request https://api.llama.fi/tvl/Polygon and take answer (just a number, there is no nesting).
2. Calculating by formula: PolygonTVL = Polygon(Matic) TVL / 10^9 (where Polygon(Matic) TVL is the response
   from request above).

Round to nearest 3 decimal places (fourth decimal place digit >= 5 rounds up and < 5 rounds down)

-----------------------------------------
PolygonTVLinv

1. Make a GET request https://api.llama.fi/tvl/Polygon and take the answer (just a number, there is no nesting).
2. Calculating by formula: PolygonTVLinv = 1 / Polygon(Matic) TVL * 10^9 (where Polygon(Matic) TVL is the response
   from request above).
   
Round to nearest 3 decimal places (fourth decimal place digit >= 5 rounds up and < 5 rounds down)

For receiving historical TVL data make a GET request: https://api.llama.fi/protocol/Polygon/:
Returns historical data on the TVL of a protocol along with some basic data on it.


# Security Considerations

The only reason for concern is the shutdown of the servers hosting the site. All the source code of the project (backend, interface, adapter, sdk) can be found in the repository https://github.com/DefiLlama and deploy the servers. Also (unlikely) the TVL calculation may change critically (https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/projects/polygon/index.js).

There are probably the same security considerations when using a price channel available with hourly granularity. Contract creators are likely to have to specify longer liquidation and recall periods so that prices can be accurately reported. As a result, large price spikes may occur 1 hour ago, which may lead to the unexpected liquidation of token sponsors.
