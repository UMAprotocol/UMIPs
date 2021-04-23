## Headers

| UMIP [#]            |                                                                           |
| ------------------- | ------------------------------------------------------------------------- |
| UMIP Title          | Add PUNKETH-TWAP as DVM price identifier                                  |
| Authors             | Kevin Chan (kevin@umaproject.org), Chase Coleman (chase@umaproject.org)   |
| Status              | Draft                                                                     |
| Created             | April 19, 2021                                                            |
| Discourse Link      | Coming soon                                                               |


# Summary 

This UMIP introduces a new TWAP price identifier for a synthetic token referred to as uPUNK.

This UMIP is required to support requests for a price that is able to resolve to either the median trade price, as proposed in [UMIP XYZ](./umip-add-cryptopunk-expiry.md), or the 2-hour time-weighted-average-price (TWAP). This price identifier will resolve to the 2-hour TWAP on the highest volume Uniswap ETH/uPUNK pool (for a specified iteration of uPUNK, i.e. uPUNK-JUNE21).


# Motivation

Creating this price identifier allows for the creation of uPUNK, an NFT index based on the CryptoPunk (the original NFT). This is importnat because it allows:

- A collector wishing to hedge the risk of purchasing a CryptoPunk could mint `uPUNK` which would provide protection against downward price movements in the value of CryptoPunks.
- An investor who believes that the median trade price of CryptoPunks will increase could purchase `uPUNK` at its current trading price and then hold until the price appreciated (i.e., assume a long position).
- An investor who believes that the median trade price of CryptoPunks will decrease could mint `uPUNK` and sell the minted tokens (i.e., assume a short position).

For more information about the motivation, we refer the reader to [UMIP XYZ](./umip-add-cryptopunk-expiry.md).


# Data Specifications

All relevant price data is computed using information that can be found on the blockchain by examining the Uniswap prices.

-----------------------------------------
- Price identifier name: `PUNKETH-TWAP`
- Markets & Pairs: Uniswap `uPUNK/ETH`
- Example price providers: The Uniswap price data can be obtained directly from the blockchain
- Cost to use: [Infura](https://infura.io/) supports up to 100,000 requests per day for free. This information should also available on [The Graph](https://thegraph.com/)
- Real-time price update frequency: Updated every block
- Historical price update frequency: Updated every block


# Price Feed Implementation

The price can be determined using the existing [Uniswap price feed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js). The only required input would be determining which pool has the highest volume.

An example configuration for the Uniswap feed is below

```
"uPUNK-JUNE21": {
  type: "uniswap",
  uniswapAddress: {TBD -- Would correspond to the uPunk address that expired in June 2021},
  twapLength: 7200
},
```


# Technical Specifications

-----------------------------------------
- Price identifier name: `PUNKETH-TWAP`
- Base Currency: CryptoPunk
- Quote Currency: ETH
- Rounding: Round to 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 22.430000 (as of 21 April 2021 19:34 UTC)


# Rationale

The PUNKETH-TWAP price is necessary to support a market in which people may disagree about the fundamental value of the asset going forward. At expiry, there is a clear way to value the uPUNK, i.e., the median computation described in [UMIP XYZ](./umip-add-cryptopunk-median.md), however, the value of uPUNK prior to that seems less obvious and we'd like to let the markets price the asset.

This self-referential component was also used in uGAS, see [UMIP 22](./umip-22.md) and has proven successful in that context.


# Implementation

When a price request that relies on this price identifier is made, the following process should be followed:

1. The end TWAP timestamp equals the price request timestamp.
2. The start TWAP timestamp is defined by the end TWAP timestamp - TWAP period (2 hours).
3. A single Uniswap price is defined for each timestamp as the price that the ETH/uPUNK ppool returns at the end of the latest block whose timestamp is less than or equal to the timestamp that is queried for.
4. The TWAP is an average of the prices for each timestamp between the start and end timestamps. Each price in this average will receive equal weight.
5. The final price should be returned with ETH


**Example**

If the timestamp requested was `1619222400` then:

* The end TWAP timestamp would be `1619222400`
* The start TWAP timestamp would be `1619222400 - 7200` -> `1619215200`
* The Uniswap price would be found for \{`1619215200`, `1619215201`, `1619215202`, ..., `1619222400`\}
* Average the prices corresponding with each price and then report this average


# Security Considerations

The main concerns of the TWAP price are:

1. **Token price manipulation**: If the Uniswap pool is not sufficiently liquid, then attackers could try to drive down the Uniswap price and withdraw more collateral than intended. Most DeFi attacks have been done using flash loans, but flash loans would be ineffective since the price is measured at the end of each block. Collateralizaton based on the TWAP price would make it more capital intensive (and thus risky) to target the token price in this way.
2. **TWAP mismatch**: If the price of the token rises quickly then there would become a mismatch between the market price and the TWAP price. This might allow sponsers to mint tokens with less collateral than what they could seel them for on the market. Reasonable levels of collateralizaton requirements and the 2 hour "liveness period" help combat this concern.

Both of these concerns are originally discussed in [UMIP 22](./umip-22.md)
