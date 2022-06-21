## Headers

| UMIP-163; Magic Price Feed            |                                                      |
| ------------------- | ---------------------------------------------------- |
| UMIP Title          | Add MAGICETH, MAGICUSD, ETHMAGIC and USDMAGIC as supported price identifiers |
| Authors             | Mr. Bahama                                             |
| Status              | Last Call                                            |
| Created             | 11 June 2022    |



# Summary

The DVM should support price requests for MAGIC/ETH, MAGIC/USD, ETH/MAGIC and USD/MAGIC pairs.

The canonical identifier should be `MAGICETH`, `MAGICUSD`, `ETHMAGIC` and `USDMAGIC`.

# Motivation

At the moment, DVM, does not support the requested price identifiers.

MAGIC is the currency and base economic infrastructure for play-to-own games in TreasureDAO

There is currently no way to have a 2 week TWAP for MAGIC/ETH and MAGIC/USDC which would enable games to create in-game assets embedded with option payouts. For example, players could acquire an in-game asset (ERC721 or ERC-1155) embedded with an option to purchase MAGIC token(s) at a discount. 


# Data Specifications

- Price identifier name: MAGICETH and MAGICUSD

- Market and pairs:
    - MAGIC/WETH: [Sushiswap](https://app.sushi.com/analytics/pools/0xb7e50106a5bd3cf21af210a755f9c8740890a8c9?chainId=42161)
 

- Example data providers:
    - MAGIC/WETH: Sushiswap

    https://www.coingecko.com/en/coins/magic#markets

- Real-time data update frequency:
    - AMM pools: updated every block mined

# Price feed implementation

This price identifier uses the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.ts) and [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.ts) with the example configuration below:

```
  "MAGICUSD": {
    type: "expression",
     expression: ` 
      MAGICETH * ETHUSD
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      MAGICETH: {
        type: "uniswap",
        uniswapAddress: "0xB7E50106A5bd3Cf21AF210A755F9C8740890A8c9",
        twapLength: 1209600
      },
      ETHUSD: {
        type: "medianizer",
        invertPrice: false,
        minTimeBetweenUpdates: 60,
        twapLength: 1209600,
        ohlcPeriods: 21600, 
        medianizedFeeds: [
          { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
          { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
          { type: "cryptowatch", exchange: "kraken", pair: "ethusd" },
        ],
      }
    },
  },
  ```


  # Technical Specifications

- Price identifier name: MAGICETH
- Base Currency: MAGIC
- Quote Currency: ETH
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: .00025 ETH (26 MAy 2022 16:24:00 UTC)
-----------------------------------------

- Price identifier name: ETHMAGIC
- Base Currency: ETH
- Quote Currency: MAGIC
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 4000 MAGIC (26 MAy 2022 16:24:00 UTC)
-----------------------------------------

- Price identifier name: MAGICUSD
- Base Currency: MAGIC
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.45 USD (26 MAy 2022 16:24:00 UTC)

-----------------------------------------

- Price identifier name: USDMAGIC
- Base Currency: USD
- Quote Currency: MAGIC
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 2.25 MAGIC (26 MAy 2022 16:24:00 UTC)

# Rationale

MAGIC token has predominant volume in Sushiswap at the time of writing the UMIP with average volume of 1.3M, folowed by the OKX  pool with average volume of 94K. For this price identifier it is also assumed that 1 USDT = 1 USD holds at all times.

MAGIC has predominant liquidity and volume activity in the AMMs paired with WETH. In order to mitigate attempted price manipulation a two-week  TWAP would be applied.


# Implementation

Voters should query for the price of MAGIC/WETH and MAGIC/USDC on SushiSwap. When determining the price for MAGIC/USDC it should also take into account MAGIC/USDT on OKX. Use the ETH/USDC price as specified via UMIP-6. Recommended endpoints are provided in the markets and data sources section (To be added by DevX). 

### MAGICUSD & USDMAGIC

1. Query the MAGICETH price from SushiSwap using a 2-week TWAP.
2. Query the ETH/USD price as per UMIP-6 using a 2-week TWAP. 
3. Multiply the MAGICETH Sushi price by the ETH/USD price from step 2 to get a MAGIC/USD price.
4. Query the MAGICUSDT price from OKX using a 2-week TWAP.
5. Take the average value of the Sushiswap and OKX results.
6. Round the result to 8 decimal places to get the MAGICUSD value.
7. (for USD/MAGIC) Take the inverse of the result of step 6, before rounding, (1/ MAGIC/USD) to get the USD/MAGIC price, and round to 8 decimals.

### MAGICETH & ETHMAGIC

1. Query the MAGIC/ETH price from SushiSwap using a 2-week TWAP.
2. Query the ETH/USD price as per UMIP-6 using a 2-week TWAP. 
3. Multiply the MAGI/CETH price by the ETH/USD price and round to 8 decimals to get the MAGICETH final price.
4. (for ETH/MAGIC) Take the inverse of the result of step 3, before rounding, (1/ MAGIC/ETH) to get the ETHMAGIC price, and round to 8 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# Security considerations

The inclusion of this requested price identifier should not present a security concern for DVM.

Liquidity is ample specially in the Sushiswap pool, currently over 5M, it should allow the usage of its price feed, even for liquidatable contracts.

