## Headers

| UMIP-x            |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add PERPUSD and USDPERP as supported price identifiers |
| Authors             | Sean Brown (@smb2796)                     |
| Status              | Draft                                                     |
| Created             | Dec 31, 2021                                                 |

# Summary 

The DVM should support price requests for the below listed asset pairs:
- PERP/USD
- USD/PERP


The canonical identifiers should be `PERPUSD` and `USDPERP`.

# Motivation

These price identifiers would allow the above listed assets to be used for the creation of various products related to [Perpetual protocol](https://www.perp.com/).


## Data Specifications

-----------------------------------------
- Price identifier name: PERPUSD and USDPERP
- Markets & Pairs:
  - PERP/USDT: Binance and OKEx
  - PERP/USD: Coinbase Pro
- Example data providers: Cryptowatch
- Real-time data update frequency: price is updated every minute
- Historical data update frequency: price is updated every minute

## Price Feed Implementation

This price identifier uses the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) with example configuration below:

```
  PERPUSD: {
    type: "expression",
    expression: `
      median( POOL_USDT_BINANCE, POOL_USDT_OKEX, POOL_USD_CBPRO )
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      POOL_USDT_BINANCE: { type: "cryptowatch", exchange: "binance", pair: "perpusdt" },
      POOL_USDT_OKEX: { type: "cryptowatch", exchange: "okex", pair: "perpusdt" },
      POOL_USD_CBPRO: { type: "cryptowatch", exchange: "coinbase-pro", pair: "perpusd" },
    },
  },
  USDPERP: {
    type: "expression",
    expression: "1 / PERPUSD",
  },
```

## Technical Specifications

-----------------------------------------
- Price identifier name: PERPUSD
- Base Currency: PERP
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 9.00 (31 Dec 2021 16:30:00 GMT)
-----------------------------------------
- Price identifier name: USDPERP
- Base Currency: USD
- Quote Currency: PERP
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.111 (31 Dec 2021 16:30:00 GMT)

## Ancillary Data Specifications

This price identifiers can optionally include ancillary data to specify the twap length that these values should be computed using. When converted from bytes to UTF-8, the ancillary data should be a dictionary containing a period key:value pair like so:

```twapLength:3600```

`twapLength` should be specified in seconds. If a `twapLength` key value pair is not present, then the ancillary data should default to 0.

When the ancillary data dictionary "twapLength:3600" is stored as bytes, the result would be: 0x747761704c656e6774683a33363030


## Rationale

The three most voluminous exchanges for the PERP token are Binance, OKEx and Coinbase Pro. Pricing information for all three of these is readily available and suitable for pricing the PERP token.

## Implementation

```
1. Query the POOL/USD price from Binance, OKEx and Coinbase Pro using whatever TWAP is defined for the ancillary data `twapLength` value. Note that `twapLength` should be defined in seconds. If there is no ancillary data or no `twapLength` key present, then the most recent price that falls before the price request timestamp should be used.
2. Take the median of the PERP/USD results from step 1.
3. Round result from step 2 to 8 decimals to get the PERP/USD price.
4. (for USD/PERP) Take the inverse of the result of step 3.
5. (for USD/PERP) Round result from step 4 to 8 decimals to get the USD/PERP price.
```

Voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus.

## Security considerations

Adding these new identifiers by themselves pose little security risk to the DVM or priceless financial contract users. However, anyone using these price identifiers should take care to parameterize their price requests appropriately for their use case. 