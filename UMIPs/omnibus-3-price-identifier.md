## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add POOLUSD, USDPOOL, BADGER/USD, USD/BADGER, GNOUSD, USDGNO, OHMUSD, USDOHM, IDLEUSD and USDIDLE as supported price identifiers |
| Authors             | Reinis Martinsons (reinis@umaproject.org)                                                      |
| Status              | Draft                                                         |
| Created             | July 13, 2021                                              |
| Discourse Link      | [Discourse](https://discourse.umaproject.org/t/price-identifier-omnibus-for-pool-badger-gno-ohm-and-idle/1248)            |

# Summary 

The DVM should support price requests for the below listed asset pairs:
- POOL/USD
- USD/POOL
- BADGER/USD
- USD/BADGER
- GNO/USD
- USD/GNO
- OHM/USD
- USD/OHM
- IDLE/USD
- USD/IDLE

The canonical identifiers should be `POOLUSD`, `USDPOOL`, `BADGER/USD`, `USD/BADGER`, `GNOUSD`, `USDGNO`, `OHMUSD`, `USDOHM`, `IDLEUSD` and `USDIDLE`.

# Motivation

These price identifiers would allow the above listed assets to be used for the creation range tokens. These tokens are also being proposed to be used as collateral in UMA contracts. As showcased in [this article](https://medium.com/uma-project/uma-raises-2-6mm-in-the-pilot-of-the-range-token-de5be578fa5e), the range token is a new treasury primitive that enables DAOs to access funds and diversify their treasury without directly selling their native tokens.

Proactively approving these price identifiers will make it easier for development teams and protocol treasuries to create new products using these ERC20 tokens and their price identifiers.

# POOL

## Data Specifications

-----------------------------------------
- Price identifier name: POOLUSD and USDPOOL
- Markets & Pairs:
  - POOL/ETH: [Uniswap v2](https://v2.info.uniswap.org/pair/0x85cb0bab616fe88a89a35080516a8928f38b518b) and [SushiSwap](https://analytics.sushi.com/pairs/0x577959c519c24ee6add28ad96d3531bc6878ba34)
  - ETH/USD(T): Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Example data providers: Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Cost to use: Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Real-time data update frequency: price is updated with every Ethereum block (~15 seconds per block)
- Historical data update frequency: price is updated with every Ethereum block (~15 seconds per block)

## Price Feed Implementation

This price identifier uses the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js), [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) with example configuration below:

```
  POOLUSD: {
    type: "expression",
    expression: `
      median( (POOL_ETH_UNI * ETHUSD), (POOL_ETH_SUSHI * ETHUSD) )
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      POOL_ETH_UNI: {
        type: "uniswap",
        uniswapAddress: "0x85cb0bab616fe88a89a35080516a8928f38b518b",
        twapLength: 300,
      },
      POOL_ETH_SUSHI: {
        type: "uniswap",
        uniswapAddress: "0x577959c519c24ee6add28ad96d3531bc6878ba34",
        twapLength: 300,
      },
    },
  },
  USDPOOL: {
    type: "expression",
    expression: "1 / POOLUSD",
  },
```
***Note**: this assumes `ETHUSD` defined in [default price feed configuration](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js)*

## Technical Specifications

-----------------------------------------
- Price identifier name: POOLUSD
- Base Currency: POOL
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 9.18390777 (19 Jul 2021 12:00:00 GMT)
-----------------------------------------
- Price identifier name: USDPOOL
- Base Currency: USD
- Quote Currency: POOL
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.10888611 (19 Jul 2021 12:00:00 GMT)

## Rationale

POOL token does not have any recognizable liquidity on CEXs, thus, the only viable alternative currently is to query its pricing from available AMM pools on Uniswap and SushiSwap. In order to mitigate attempted price manipulation 5 minute TWAP would be applied.

## Implementation

```
1. Query POOL/ETH price from Uniswap v2 and SushiSwap using 5-minute TWAP.
2. Query the ETH/USD price as per UMIP-6.
3. Multiply each of POOL/ETH prices in step 1 with ETH/USD price from step 2.
4. Take the median of results from step 3.
5. Round result from step 4 to 8 decimals to get the POOL/USD price.
6. (for USD/POOL) Take the inverse of the result of step 4.
7. (for USD/POOL) Round result from step 6 to 8 decimals to get the USD/POOL price.
```

Voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus. Considering limited liquidity of POOL token voters should watch out for any attempted price manipulation.

## Security considerations

POOL token does not have any recognizable liquidity on CEXs and also its on-chain liquidity is not particularly strong, with around $3 million combined on both Uniswap and SushiSwap pools. Even though TWAP price processing is applied, this might not be sufficient to protect against well capitalized attacks on liquidatable contracts. Thus, it is strongly advised to use this price identifier only for non-liquidatable contracts like issuing range tokens.

UMA holders should also consider re-defining this identifier as liquidity in the underlying asset changes.

# BADGER

## Data Specifications

-----------------------------------------
- Price identifier name: BADGER/USD and USD/BADGER
- Markets & Pairs:
  - BADGER/USDT: [Binance](https://www.binance.com/en/trade/BADGER_USDT)
  - BADGER/WBTC: [Uniswap v2](https://v2.info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859) and [SushiSwap](https://analytics.sushi.com/pairs/0x110492b31c59716ac47337e616804e3e3adc0b4a)
  - BTC/USD(T): Refer to `BTCUSD` in [UMIP-7](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-7.md)
- Example data providers:
  - BADGER/USDT: CryptoWatch
  - BTC/USD(T): Refer to `BTCUSD` in [UMIP-7](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-7.md)
- Cost to use: CryptoWatch has a free tier subject to [rate limiting](https://docs.cryptowat.ch/rest-api/rate-limit) and [pricing plan ](https://cryptowat.ch/pricing) beyond their free tier.
- Real-time data update frequency:
  - CryptoWatch: price is updated with every trade.
  - AMM pools: price is updated with every Ethereum block (~15 seconds per block)
- Historical data update frequency:
  - CryptoWatch: the lower bound on the price update frequency is a minute
  - AMM pools: price is updated with every Ethereum block (~15 seconds per block)

## Price Feed Implementation

This price identifier uses the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js), [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) with example configuration below:

```
  "BADGER/USD": {
    type: "expression",
    // Note: lower-case variables are intermediate, upper-case are configured feeds.
    expression: `
      badger_usd_sushi = BTCUSD * BADGER_WBTC_SUSHI;
      badger_usd_uni = BTCUSD * BADGER_WBTC_UNI;
      median( badger_usd_sushi, badger_usd_uni, BADGER_USD_BINANCE )
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      BADGER_WBTC_SUSHI: {
        type: "uniswap",
        uniswapAddress: "0x110492b31c59716ac47337e616804e3e3adc0b4a",
        twapLength: 300,
        invertPrice: true,
      },
      BADGER_WBTC_UNI: {
        type: "uniswap",
        uniswapAddress: "0xcd7989894bc033581532d2cd88da5db0a4b12859",
        twapLength: 300,
        invertPrice: true,
      },
      BADGER_USD_BINANCE: { type: "cryptowatch", exchange: "binance", pair: "badgerusdt" },
    },
  },
  "USD/BADGER": {
    type: "expression",
    expression: "1 / BADGER\\/USD",
  },
```
***Note**: this assumes `BTCUSD` defined in [default price feed configuration](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js)*

## Technical Specifications

-----------------------------------------
- Price identifier name: BADGER/USD
- Base Currency: BADGER
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 7.53336069 (19 Jul 2021 12:00:00 GMT)
-----------------------------------------
- Price identifier name: USD/BADGER
- Base Currency: USD
- Quote Currency: BADGER
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.13274288 (19 Jul 2021 12:00:00 GMT)

## Rationale

BADGER token has well distributed trading activity among CEXs with highest trading volumes on Binance that will be supplemented with available AMM pools for this price identifier. For this price identifier it is also assumed that 1 USDT = 1 BUSD = 1 USD.

BADGER has quite strong liquidity on Uniswap and Sushiswap pools paired with WBTC. In order to mitigate attempted price manipulation 5 minute TWAP would be applied. For this price identifier it will be assumed that 1 WBTC = 1 BTC. In case WBTC looses its peg voters would still be able to detect it and need to resolve it by using actual WBTC value instead.

## Implementation

```
1. Query BADGER/WBTC price from Uniswap v2 and SushiSwap using 5-minute TWAP.
2. Query the BTC/USD price as per UMIP-7.
3. Multiply each of BADGER/WBTC prices in step 1 with BTC/USD price from step 2.
4. Take the open BADGER/USDT price of the 1 minute OHLC period that the timestamp falls in from Binance.
5. Take the median of all results from step 3 and 4.
6. Round result from step 5 to 8 decimals to get the BADGER/USD price.
7. (for USD/BADGER) Take the inverse of the result of step 5.
8. (for USD/BADGER) Round result from step 7 to 8 decimals to get the USD/BADGER price.
```

Voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus.

## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Even though the liquidity of BADGER is quite reasonable with combined liquidity around $15 million on Uniswap and SushiSwap users still should be aware that the main expected application for this price identifier is to be used in non-liquidatable contracts.

# GNO

## Data Specifications

-----------------------------------------
- Price identifier name: GNOUSD and USDGNO
- Markets & Pairs:
  - GNO/USD: [Kraken](https://trade.kraken.com/markets/kraken/gno/usd)
  - GNO/ETH: [Balancer](https://pools.balancer.exchange/#/pool/0xe42237f32708bd5c04d69cc77e1e36c8f911a016/) and [Uniswap v3](https://v3.info.uniswap.org/#/pools/0xa46466ad5507be77ff5abdc27df9dfeda9bd7aee)
  - ETH/USD(T): Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Example data providers:
  - GNO/USD: CryptoWatch
  - ETH/USD(T): Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Cost to use: CryptoWatch has a free tier subject to [rate limiting](https://docs.cryptowat.ch/rest-api/rate-limit) and [pricing plan ](https://cryptowat.ch/pricing) beyond their free tier.
- Real-time data update frequency:
  - CryptoWatch: price is updated with every trade.
  - AMM pools: price is updated with every Ethereum block (~15 seconds per block)
- Historical data update frequency:
  - CryptoWatch: the lower bound on the price update frequency is a minute
  - AMM pools: price is updated with every Ethereum block (~15 seconds per block)

## Price Feed Implementation

This price identifier uses the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js), [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js), [BalancerPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/BalancerPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) with example configuration below:

```
  GNOUSD: {
    type: "expression",
    // Note: lower-case variables are intermediate, upper-case are configured feeds.
    expression: `
      gno_usd_uni = ETHUSD * GNO_ETH_UNI;
      gno_usd_bal = ETHUSD * GNO_ETH_BAL;
      median( gno_usd_uni, gno_usd_bal, GNO_USD_KRAKEN )
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      GNO_ETH_UNI: {
        type: "uniswap",
        version: "v3",
        uniswapAddress: "0xa46466ad5507be77ff5abdc27df9dfeda9bd7aee",
        twapLength: 300,
      },
      GNO_ETH_BAL: {
        type: "balancer",
        balancerAddress: "0xe42237f32708bd5c04d69cc77e1e36c8f911a016",
        balancerTokenIn: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        balancerTokenOut: "0x6810e776880c02933d47db1b9fc05908e5386b96",
        lookback: 7200,
        twapLength: 300,
      },
      GNO_USD_KRAKEN: { type: "cryptowatch", exchange: "kraken", pair: "gnousd" },
    },
  },
  USDGNO: {
    type: "expression",
    expression: "1 / GNOUSD",
  },
```
***Note**: this assumes `ETHUSD` defined in [default price feed configuration](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js)*

## Technical Specifications

-----------------------------------------
- Price identifier name: GNOUSD
- Base Currency: GNO
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 160.04968267 (19 Jul 2021 12:00:00 GMT)
-----------------------------------------
- Price identifier name: USDGNO
- Base Currency: USD
- Quote Currency: GNO
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.00624806 (19 Jul 2021 12:00:00 GMT)

## Rationale

GNO token has high activity reported on BKEX, but since BKEX price information is not available through CryptoWatch it will be replaced with Kraken exchange and supplemented with available AMM pools for this price identifier.

GNO has quite strong liquidity on Uniswap and Balancer pools paired with WETH. In order to mitigate attempted price manipulation 5 minute TWAP would be applied.

## Implementation

```
1. Query GNO/ETH price from Uniswap v3 and Balancer using 5-minute TWAP.
2. Query the ETH/USD price as per UMIP-6.
3. Multiply each of GNO/ETH prices in step 1 with ETH/USD price from step 2.
4. Take the open GNO/USD price of the 1 minute OHLC period that the timestamp falls in from Kraken.
5. Take the median of all results from step 3 and 4.
6. Round result from step 5 to 8 decimals to get the GNO/USD price.
7. (for USD/GNO) Take the inverse of the result of step 5.
8. (for USD/GNO) Round result from step 7 to 8 decimals to get the USD/GNO price.
```

Voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus.

## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Even though the liquidity of GNO is quite reasonable with combined liquidity above $20 million on Uniswap and Balancer users still should be aware that the main expected application for this price identifier is to be used in non-liquidatable contracts.

# OHM

## Data Specifications

-----------------------------------------
- Price identifier name: OHMUSD and USDOHM
- Markets & Pairs:
  - OHM/DAI: [SushiSwap](https://analytics.sushi.com/pairs/0x34d7d7aaf50ad4944b70b320acb24c95fa2def7c)
  - OHM/FRAX: [Uniswap v2](https://v2.info.uniswap.org/pair/0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877)
- Example data providers: NA, use on-chain data
- Cost to use: NA for on-chain data
- Real-time data update frequency: price is updated with every Ethereum block (~15 seconds per block)
- Historical data update frequency: price is updated with every Ethereum block (~15 seconds per block)

## Price Feed Implementation

This price identifier uses the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) with example configuration below:

```
  OHMUSD: {
    type: "expression",
    expression: `
      median( OHM_DAI_SUSHI, OHM_FRAX_UNI )
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      OHM_DAI_SUSHI: {
        type: "uniswap",
        uniswapAddress: "0x34d7d7aaf50ad4944b70b320acb24c95fa2def7c",
        twapLength: 300,
      },
      OHM_FRAX_UNI: {
        type: "uniswap",
        uniswapAddress: "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877",
        twapLength: 300,
      },
    },
  },
  USDOHM: {
    type: "expression",
    expression: "1 / OHMUSD",
  },
```

## Technical Specifications

-----------------------------------------
- Price identifier name: OHMUSD
- Base Currency: OHM
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 626.93574430 (19 Jul 2021 12:00:00 GMT)
-----------------------------------------
- Price identifier name: USDOHM
- Base Currency: USD
- Quote Currency: OHM
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.00159506 (19 Jul 2021 12:00:00 GMT)

## Rationale

OHM token does not have any visible liquidity on CEXs, thus, the only viable alternative currently is to query its pricing from available AMM pools on Uniswap and SushiSwap. In order to mitigate attempted price manipulation 5 minute TWAP would be applied. For this price identifier it will be assumed that 1 DAI = 1 FRAX = 1 USD. In case either DAI or FRAX loose their peg voters would still be able to detect it and need to resolve it by using actual pair token value instead.

## Implementation

```
1. Query OHM/USD price from Uniswap v2 and SushiSwap using 5-minute TWAP.
2. Take the median of results from step 1.
3. Round result from step 2 to 8 decimals to get the OHM/USD price.
4. (for USD/OHM) Take the inverse of the result of step 2.
5. (for USD/OHM) Round result from step 4 to 8 decimals to get the USD/OHM price.
```

Voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus.

## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders.

Even though the liquidity of OHM is quite reasonable with combined liquidity above $35 million on Uniswap and SushiSwap users still should be aware that the main expected application for this price identifier is to be used in non-liquidatable contracts.

# IDLE

## Data Specifications

-----------------------------------------
- Price identifier name: IDLEUSD and USDIDLE
- Markets & Pairs:
  - IDLE/ETH: [SushiSwap](https://analytics.sushi.com/pairs/0xa7f11e026a0af768d285360a855f2bded3047530)
  - ETH/USD(T): Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Example data providers: Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Cost to use: Refer to `ETHUSD` in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)
- Real-time data update frequency: price is updated with every Ethereum block (~15 seconds per block)
- Historical data update frequency: price is updated with every Ethereum block (~15 seconds per block)

## Price Feed Implementation

This price identifier uses the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js), [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) with example configuration below:

```
  IDLEUSD: {
    type: "expression",
    expression: `
      IDLE_ETH_SUSHI * ETHUSD
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      IDLE_ETH_SUSHI: {
        type: "uniswap",
        uniswapAddress: "0xa7f11e026a0af768d285360a855f2bded3047530",
        twapLength: 300,
      },
    },
  },
  USDIDLE: {
    type: "expression",
    expression: "1 / IDLEUSD",
  },
```
***Note**: this assumes `ETHUSD` defined in [default price feed configuration](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js)*

## Technical Specifications

-----------------------------------------
- Price identifier name: IDLEUSD
- Base Currency: IDLE
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 3.20436254 (19 Jul 2021 12:00:00 GMT)
-----------------------------------------
- Price identifier name: USDIDLE
- Base Currency: USD
- Quote Currency: IDLE
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.31207455 (19 Jul 2021 12:00:00 GMT)

## Rationale

IDLE token does not have any visible liquidity on CEXs, thus, the only viable alternative currently is to query its pricing from SushiSwap. Even though there is also Uniswap v2 pool available, its liquidity is deemed insufficient for reliable information, though it can be added to this price identifier later once sufficient liquidity is developed. In order to mitigate attempted price manipulation 5 minute TWAP would be applied.

## Implementation

```
1. Query IDLE/ETH price from SushiSwap using 5-minute TWAP.
2. Query the ETH/USD price as per UMIP-6.
3. Multiply IDLE/ETH price in step 1 with ETH/USD price from step 2.
4. Round result from step 3 to 8 decimals to get the IDLE/USD price.
5. (for USD/IDLE) Take the inverse of the result of step 3.
6. (for USD/IDLE) Round result from step 5 to 8 decimals to get the USD/IDLE price.
```

Voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus. Considering limited liquidity of IDLE token voters should watch out for any attempted price manipulation.

## Security considerations

IDLE token does not have any visible liquidity on CEXs and also its on-chain liquidity is quite weak, with less than $2 million on SushiSwap pool. Even though TWAP price processing is applied, this might not be sufficient to protect against well capitalized attacks on liquidatable contracts. Thus, it is strongly advised to use this price identifier only for non-liquidatable contracts like issuing range tokens.

UMA holders should also consider re-defining this identifier as liquidity in the underlying asset changes.

