# Headers

| **UMIP #** Leave blank - an UMIP no will be assigned at proposal stage|                                                                           |
| ------------------------|------------------------------------------------------------------------------------------------------------------------ |
| UMIP Title              | Add  BASKUSD, USDBASK, MPHUSD, USDMPH, APWUSD, USDAPW, SNOWUSD, USDSNOW, NDXUSD, USDNDX as a supported price identifiers|
| Authors                 | Shawn C. Hagenah(Hagz 48)www.shawnhagenah99@yahoo.com                                                                   |
| Status                  | Draft                                                                                                                   |
| Created                 | 5/31/2021                                                                                                               |
| Discourse Link          | *Insert link to discourse topic  **after**  it has been moved into draft UMIPs_*                                        |

# Summary

The DVM should support price requests for

- BASKUSD
- USDBASK
- MPHUSD
- USDMPH
- APWUSD
- USDAPW
- SNOWUSD
- USDSNOW
- NDXUSD
- USDNDX

The canonical identifiers should be:
`BASKUSD` , `USDBASK` ,  `MPHUSD` , `USDMPH` , `APWUSD` , `USDAPW` , `SNOWUSD` , `USDSNOW` , `NDXUSD` , and `USDNDX`.

# Motivation

Adding these  price identifiers allows the use of the base currencies as collateral for minting synthetics or call options. See also the [related collateral UMIP]
Any of the base currencies could used to mint yield dollars or other synthetics, and liquidators could identify under collateralized positions by comparing the USD value of the locked collateral.
Base currency call options could be minted and paid out based on the USD price of the base currency at expiry.
KPI options tied to the price of the base currency could be minted, with a payout increasing as the base currency price increases.

# BASK

## MARKETS & DATA SOURCES

Markets: Sushiswap

* Sushiswap [BASK/ETH](https://analytics.sushi.com/pairs/0x34d25a4749867ef8b62a0cd1e2d7b4f7af167e01)

How often is the provided price updated?
- For Sushiswap, the price is updated with every Ethereum block (~15 seconds per block)

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

Provide recommended endpoints to query for historical prices from each market listed.
* Sushiswap: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

Sushi Query:
```
{
 pair(
  id:"0x34d25a4749867ef8b62a0cd1e2d7b4f7af167e01",
  block: {
    number:12519741
  }
){
  token0 {
    id
    symbol
    name
    derivedETH
  }
  token1 {
    id
    symbol
    name
    derivedETH
  }
  token0Price
  token1Price
}
}


```

## PRICE FEED IMPLEMENTATION

This price identifier uses the [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feeds

```
BASKUSD: {
  type: "expression",
  expression: `
    BASK_ETH_SUSHI * ETHUSD
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    BASK_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0x34d25a4749867ef8b62a0cd1e2d7b4f7af167e01", twapLength: 900 },
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },
  },
},
USDBASK: {
  type: "expression",
  expression: `
    bask_usd = BASK_ETH_SUSHI * ETHUSD
    1 / bask_usd
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    BASK_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0x34d25a4749867ef8b62a0cd1e2d7b4f7af167e01", twapLength: 900 },
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },
  }
}
```

## TECHNICAL SPECIFICATIONS

### BASK/USD

**Price Identifier Name:** BASKUSD

**Base Currency:** BASK

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/BASK

**Price Identifier Name:** USDBASK

**Base Currency:** USD

**Quote currency:** BASK

**Intended Collateral Currency:** BASK

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of BASK/USD at the price request timestamp on Coinbase Pro and Binance. Recommended endpoints are provided in the markets and data sources section.

```
1. Query the BASK/ETH price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD price as per UMIP-6.
3. Multiply the BASK/ETH price by the ETH/USD price and round to 6 decimals to get the BASK/USD price.
4. The result from step 5 should be rounded to six decimals to determine the BASKUSD price.
5. (for USD/BASK) Take the inverse of the result of step 5, before rounding, (1/ BASK/USD) to get the USD/BASK price, and round to 6 decimals.
```

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

## SECURITY CONSIDERATIONS

Audited by Haechi

A final fee of 6 BASK needs to be added to the store contract.

This project is currently in Beta testing. Additionally, the inclusion of only a single market makes this subject to possible manipulation $UMA holders should evaluate the on going cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of the collaterals nature as liquidity, if the collateral changes, or if added robustness(Eg. via TWAPs) are necessary to prevent market manipulation.

**BASK**: https://discourse.umaproject.org/u/Hagz48 


# MPH

## Markets and Data Sources

Markets: Sushiswap and Uniswap

* Uniswap: [MPH/ETH](https://v2.info.uniswap.org/pair/0x4d96369002fc5b9687ee924d458a7e5baa5df34e)

* Sushiswap: [MPH/ETH](https://analytics.sushi.com/pairs/0xb2c29e311916a346304f83aa44527092d5bd4f0f)

How often is the provided price update?
- Both Uniswap and Sushiswap updated their price with every Ethereum block (~15 seconds per block)

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

Provide recommended endpoints to query for historical prices from each market listed.
* Uniswap V2: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
* Sushiswap: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

Uniswap Query:

```
{
	pair (
    id:"0x4d96369002fc5b9687ee924d458a7e5baa5df34e",
    block: {
      number:12519741
    }
  ){
    token0 {
      id
      symbol
      name
      derivedETH
    }
    token1 {
      id
      symbol
      name
      derivedETH
    }
    token0Price
    token1Price
  }
}
```

Sushi Query:

```
{
 pair(
  id:"0xb2c29e311916a346304f83aa44527092d5bd4f0f",
  block: {
    number:12519741
  }
){
  token0 {
    id
    symbol
    name
    derivedETH
  }
  token1 {
    id
    symbol
    name
    derivedETH
  }
  token0Price
  token1Price
}
}

```

## Price Feed Implementation

This price identifier uses the [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feeds

```
MPHUSD: {
  type: "expression",
  expression: `
    median( (MPH_ETH_UNI * ETHUSD), (MPH_ETH_SUSHI * ETHUSD) )
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    MPH_ETH_UNI: { type: "uniswap", uniswapAddress: "0x4d96369002fc5b9687ee924d458a7e5baa5df34e", twapLength: 900 },
    MPH_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0xb2c29e311916a346304f83aa44527092d5bd4f0f", twapLength: 900 },
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },

  }
},
USDMPH: {
  type: "expression",
  expression: `
    mph_usd = median ( (MPH_ETH_UNI * ETHUSD ), (MPH_ETH_SUSHI * ETHUSD) );
    1 / sdt_usd
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    MPH_ETH_UNI: { type: "uniswap", uniswapAddress: "0x4d96369002fc5b9687ee924d458a7e5baa5df34e", twapLength: 900 },
    MPH_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0xb2c29e311916a346304f83aa44527092d5bd4f0f", twapLength: 900},
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },
  }
},
```

## Technical Specifications

### MPH/USD

**Price Identifier Name:** MPHUSD

**Base Currency:** MPH

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.


### USD/MPH

**Price Identifier Name:** USDMPH

**Base Currency:** USD

**Quote currency:** MPH

**Intended Collateral Currency:** MPH

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.


## Implementation


```
1. Query MPH/ETH Price from SushiSwap and Uniswap using 15-minute TWAP.
2. Take the median of the price from the 2 sources.
3. Query the ETH/USD Price as per UMIP-6.
4. Multiply the MPH/ETH price by the ETH/USD price and round to 6 decimals to get the MPH/USD price.
5. (for USD/MPH) Take the inverse of the result of step 4 (1/ MPH/USD), before rounding, to get the USD/MPH price. Then, round to 6 decimals.
```

## Security Considerations

Audited by Peck shield and Quantstamp. Additional features were Audited by Certik and Peckshield.

A final fee of 9 MPH needs to be added to the store contract

$UMA holders should evaluate the on going cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of the collaterals nature as liquidity, if the collateral changes, or if added robustness(Eg. via TWAPs) are necessary to prevent market manipulation.

**MPH**:https://discourse.umaproject.org/u/Hagz48

# APW

## Markets and Data Sources

Markets: Sushiswap

Sushiswap: [APW/ETH](https://analytics.sushi.com/pairs/0x53162d78dca413d9e28cf62799d17a9e278b60e8)

How often is the provided price updated?
- Sushiswap price is updated with every Ethereum block (~15 seconds per block)

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

Provide recommended endpoints to query for historical prices from each market listed.

* Sushiswap: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

Sushiswap Query:

```
{
 pair(
  id:"0x53162d78dca413d9e28cf62799d17a9e278b60e8",
  block: {
    number:12519741
  }
){
  token0 {
    id
    symbol
    name
    derivedETH
  }
  token1 {
    id
    symbol
    name
    derivedETH
  }
  token0Price
  token1Price
}
}
```

## Price Feed Implementation

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

```
APWUSD: {
  type: "expression",
  expression: `
    APW_ETH_SUSHI * ETHUSD
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    APW_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0x53162d78dca413d9e28cf62799d17a9e278b60e8", twapLength: 900 },
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },

  }
},
USDAPW: {
  type: "expression",
  expression: `
    apw_usd = APW_ETH_SUSHI * ETHUSD;
    1 / apw_usd
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    APW_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0x53162d78dca413d9e28cf62799d17a9e278b60e8", twapLength: 900},
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },
  }
},
```

## Technical Specifications

### APW/USD

**Price Identifier Name:** APWUSD

**Base Currency:** APW

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/APW

**Price Identifier Name:** USDAPW

**Base Currency:** USD

**Quote currency:** APW

**Intended Collateral Currency:** APW

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

## Implementation

```
1. Query APW/ETH Price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the APW/ETH price by the ETH/USD price and round to 6 decimals to get the APW/USD price.
4. (for USD/APW) Take the inverse of the result of step 4 (1/ APW/USD), before rounding, to get the USD/APW price. Then, round to 6 decimals.
```

## Security Considerations

Audited by Bramah Systems.

A final fee of 178 APW needs to be added to the store contract.

An inclusion of a single market makes that price subject to manipulation, this is something that must be considered by UMA governance.  $UMA holders should evaluate the ongoing cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of this collateral nature as liquidity, if the collateral changes, or if added robustness(Eg. via TWAPs) are necessary to prevent market manipulation
**APWINE**:https://discourse.umaproject.org/u/Hagz48

# SNOW

## Markets and Data Sources

Markets: Uniswap and Gate.io

* Gate.io [SNOW/USDT](https://api.cryptowat.ch/markets/gateio/snowusdt/price)
* Uniswap [SNOW/ETH](https://v2.info.uniswap.org/pair/0xe4f8f3cb9b33247789e4984a457bb69a1a621df3)


How often is the provided price update?
- Uniswap updates their price with every Ethereum block (~15 seconds per block)
- For Cryptowatch, the lower bound on the price update frequency is a minute

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- For uniswap subgraph, no
- For Cryptowatch, yes

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use
- Cryptowatch, the free tier is limited to 10 API credits per 24 hours; the cost of querying the market price of a given exchange is 0.005 API credits

Provide recommended endpoints to query for historical prices from each market listed.
- Uniswap V2: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
- Gate.io: https://api.cryptowat.ch/markets/gateio/snowusdt/ohlc?after=1617848822&before=1617848822&periods=60

Uniswap Query:
```
{
	pair (
    id:"0xe4f8f3cb9b33247789e4984a457bb69a1a621df3",
    block: {
      number:12519741
    }
  ){
    token0 {
      id
      symbol
      name
      derivedETH
    }
    token1 {
      id
      symbol
      name
      derivedETH
    }
    token0Price
    token1Price
  }
}
```

## Price Feed Implementation

```
SNOWUSD: {
  type: "expression",
  expression: `
    median( (SNOW_ETH_UNI * ETHUSD), SNOW_USD_GATE)
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    SNOW_USD_GATE: { type: "cryptowatch", exchange: "gateio", pair: "snowusdt" },
    SNOW_ETH_UNI: { type: "uniswap", uniswapAddress: "0xe4f8f3cb9b33247789e4984a457bb69a1a621df3", twapLength: 900 },
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },
  },
},
USDSNOW: {
  type: "expression",
  expression: `
    snow_usd = median( (SNOW_ETH_UNI * ETHUSD), SNOW_USD_GATE)
    1 / snow_usd
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    SNOW_USD_GATE: { type: "cryptowatch", exchange: "gateio", pair: "snowusdt" },
    SNOW_ETH_UNI: { type: "uniswap", uniswapAddress: "0xe4f8f3cb9b33247789e4984a457bb69a1a621df3", twapLength: 900 },
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },
  }
}
```

## Technical Specifications

### SNOW/USD

**Price Identifier Name:** SNOWUSD

**Base Currency:** SNOW

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/SNOW

**Price Identifier Name:** USDSNOW

**Base Currency:** USD

**Quote currency:** SNOW

**Intended Collateral Currency:** SNOW

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

## Implementation

```
1. For the cryptowatch endpoint, voters should use the open price of the 1 minute OHLC period that the timestamp falls in for both Binance and Coinbase Pro
2. Query the SNOW/ETH price from Uniswap using 15-minute TWAP.
3. Query the ETH/USD price as per UMIP-6.
4. Multiply the SNOW/ETH price by the ETH/USD price and round to 6 decimals to get the BAND/USD price.
5. The median of Steps 1 and 4 should be taken.
6. The result from step 5 should be rounded to six decimals to determine the SNOWUSD price.
7. (for USD/SNOW) Take the inverse of the result of step 5, before rounding, (1/ SNOW/USD) to get the USD/BAND price, and round to 6 decimals.
```

## Security Considerations

Audited by Quantstamp

A final fee of 39 SNOW needs to be added to the store contract.

The SNOW protocol is in Beta. $UMA holders should evaluate the ongoing cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of this collateral nature as liquidity, if the collateral changes, or if added robustness(Eg. via TWAPs) are necessary to prevent market manipulation

**SNOW**:https://discourse.umaproject.org/u/Hagz48


# NDX

## Markets and Data Sources

Markets: Uniswap

* Uniswap: [NDX/ETH](https://v2.info.uniswap.org/pair/0x46af8ac1b82f73db6aacc1645d40c56191ab787b)

How often is the provided price updated?
- Uniswap price is updated with every Ethereum block (~15 seconds)

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

Provide recommended endpoints to query for historical prices from each market listed.

* Uniswap: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2


Uniswap Query:

```
{
 pair(
  id:"0x46af8ac1b82f73db6aacc1645d40c56191ab787b",
  block: {
    number:12519741
  }
){
  token0 {
    id
    symbol
    name
    derivedETH
  }
  token1 {
    id
    symbol
    name
    derivedETH
  }
  token0Price
  token1Price
}
}

```

## Price Feed Implementation

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

```
NDXUSD: {
  type: "expression",
  expression: `
    NDX_ETH_SUSHI * ETHUSD
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    NDX_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0x46af8ac1b82f73db6aacc1645d40c56191ab787b", twapLength: 900 },
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },

  }
},
USDNDX: {
  type: "expression",
  expression: `
    ndx_usd = NDX_ETH_SUSHI * ETHUSD;
    1 / ndx_usd
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    NDX_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0x46af8ac1b82f73db6aacc1645d40c56191ab787b", twapLength: 900},
    ETHUSD: {
      type: "medianizer",
      minTimeBetweenUpdates: 60,
      medianizedFeeds: [
        { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
        { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
        { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
      ]
    },
  }
},
```

## Technical Specifications

### NDX/USD

**Price Identifier Name:** NDXUSD

**Base Currency:** NDX

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/NDX

**Price Identifier Name:** USDNDX

**Base Currency:** USD

**Quote currency:** NDX

**Intended Collateral Currency:** NDX

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

## Implementation

```
1. Query NDX/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6 from for the timestamp requested.
3. Multiply the result from step 1 by the ETH/USD price from step 2 and round to 6 decimals to get the NDX/USD price.
4. (for USD/NDX) Take the inverse of the result of step 3 (1/ NDX/USD), before rounding, to get the USD/NDX price. Then, round to 6 decimals.
```

## Security Considerations

Relative to most fiat currencies, NDX is much more volatile and is very nascent (March 2021) in the Ethereum ecosystem. It also has poor liquidity at this time, being traded almost exclusively on Uniswap. Liquidation should improve as tokens are distributed, but at the time NDX is very concentrated to the NDX governance organization. Contract developers should exercise extreme caution when parameterizing EMP contracts using NDX as a collateral currency

Additionally, Indexed finance is still in beta and has not yet been audited by an established security firm, however they have been audited by two individuals with previous associations to security firms.
$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation
**NDX**:https://discourse.umaproject.org/u/Britt

