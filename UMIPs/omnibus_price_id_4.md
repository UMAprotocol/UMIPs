# Headers

| **UMIP #** Leave blank - an UMIP no will be assigned at proposal stage|                                                                           |
| ------------------------|------------------------------------------------------------------------------------------------------------------------ |
| UMIP Title              | Add MPHUSD, USDMPH, NDXUSD, USDNDX as supported price identifiers                                                       |
| Authors                 | Aaron (@bitznbrewz)                                                                                                     |
| Status                  | Draft                                                                                                                   |
| Created                 | 6/22/2021                                                                                                               |
| Discourse Link          | *Insert link to discourse topic  **after**  it has been moved into draft UMIPs_*                                        |

# Summary

The DVM should support price requests for

- MPHUSD
- USDMPH
- NDXUSD
- USDNDX

The canonical identifiers should be:
`MPHUSD` , `USDMPH` , `NDXUSD` , and `USDNDX`.

# Motivation

Adding these price identifiers allows the use of the base currencies as collateral for minting synthetics or call options.

Any of the base currencies could be used to mint yield dollars or other synthetics, and liquidators could identify undercollateralized positions by comparing the USD value of the locked collateral.
Base currency call options could be minted and paid out based on the USD price of the base currency at expiry.
KPI options tied to the price of the base currency could be minted, with a payout increasing as the base currency price increases.

# MPH

## Markets and Data Sources

Markets: SushiSwap, GateIO, Uniswap, and Bancor

* Uniswap: [MPH/ETH](https://v2.info.uniswap.org/pair/0x4d96369002fc5b9687ee924d458a7e5baa5df34e)

* SushiSwap: [MPH/ETH](https://analytics.sushi.com/pairs/0xb2c29e311916a346304f83aa44527092d5bd4f0f)

* Gateio: [MPH/USDT](https://api.cryptowat.ch/markets/gateio/mphusdt/price)

* Bancor: [MPH/BNT](https://app.bancor.network/eth/data)

https://app.bancor.network/eth/portfolio/stake/add/single/0xAbf26410b1cfF45641aF087eE939E52e328ceE46


How often is the provided price update?
- Both Uniswap and SushiSwap updated their price with every Ethereum block (~15 seconds per block)
- On Cryptowatch, the lower bound on the price update frequency is a minute.

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No
- The free tier (of Cryptowatch) is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

What would be the cost of sending 15,000 queries?
- Approximately $5 using Cryptowatch

Provide recommended endpoints to query for historical prices from each market listed.
* Uniswap V2: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
* SushiSwap: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

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

This price identifier uses the [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) and [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js),
and [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) price feeds

```
MPHUSD: {
  type: "expression",
  expression: `
    median( (MPH_ETH_UNI * ETHUSD), (MPH_ETH_SUSHI * ETHUSD), MPH_USD_GATE )
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    MPH_ETH_UNI: { type: "uniswap", uniswapAddress: "0x4d96369002fc5b9687ee924d458a7e5baa5df34e", twapLength: 900 },
    MPH_ETH_SUSHI: { type: "uniswap", uniswapAddress: "0xb2c29e311916a346304f83aa44527092d5bd4f0f", twapLength: 900 },
    MPH_USD_GATE: { type: "cryptowatch", exchange: "gateio", pair: "mphusdt" },
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
    1 / mph_usd
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

Audited by Peckshield and Quantstamp. Additional features were Audited by Certik and Peckshield.
Audit links:
- [Certik ZC](https://gateway.pinata.cloud/ipfs/QmQq23FvF4dJNTjEyDGm1hDHBnLrpU1FmJJsch8kCSGt3U)
- [Peckshield ZC](https://github.com/peckshield/publications/blob/master/audit_reports/peckshield-audit-report-88mph%20Zero%20Coupon%20Bonds-v1.0.pdf)
- [Peckshield V2](https://github.com/peckshield/publications/blob/master/audit_reports/peckshield-audit-report-88mph-v1.0.pdf)
- [Quantstamp v2](https://certificate.quantstamp.com/full/88-mph)

$UMA holders should evaluate the ongoing cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of the collaterals nature as liquidity, if the collateral changes, or if added robustness (e.g., via TWAPs) are necessary to prevent market manipulation.

**MPH**:https://discourse.umaproject.org/u/Hagz48

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
    NDX_ETH_UNI * ETHUSD
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    NDX_ETH_UNI: { type: "uniswap", uniswapAddress: "0x46af8ac1b82f73db6aacc1645d40c56191ab787b", twapLength: 900 },
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
    ndx_usd = NDX_ETH_UNI * ETHUSD;
    1 / ndx_usd
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    NDX_ETH_UNI: { type: "uniswap", uniswapAddress: "0x46af8ac1b82f73db6aacc1645d40c56191ab787b", twapLength: 900},
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

Audit Reports:
- https://github.com/monoceros-alpha/audit-indexed-finance-2020-10
- https://github.com/maxsam4/indexed-finance-review

Additionally, Indexed Finance is still in beta and has not yet been audited by an established security firm, however they have been audited by two individuals with previous associations to security firms.
$UMA-holders should evaluate the ongoing cost and benefit of supporting this asset as collateral and also contemplate removing support of this collateral if liquidity concerns are identified. $UMA-holders should take note of the collateral’s nature as liquidity of the collateral changes, or if added robustness (e.g., via TWAPs) are necessary to prevent market manipulation
**NDX**:https://discourse.umaproject.org/u/Britt



