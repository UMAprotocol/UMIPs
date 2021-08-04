## Headers

| UMIP-110|                                                                           |
| ------------------------|------------------------------------------------------------------------------------------------------------------------ |
| UMIP Title              | Add BASKUSD, USDBASK, APWUSD, USDAPW, SNOWUSD, USDSNOW as supported price identifiers                                   |
| Authors                 | Shawn C. Hagenah(Hagz 48)www.shawnhagenah99@yahoo.com and Aaron (@bitznbrewz)                                           |
| Status                  | Approved                                                                                                                   |
| Created                 | 5/31/2021                                                                                                               |
| Discourse Link          | https://discourse.umaproject.org/t/add-mph-apw-snow-and-ndx-as-price-identifiers/1148                                   |

# Summary

The DVM should support price requests for

- BASKUSD
- USDBASK
- APWUSD
- USDAPW
- SNOWUSD
- USDSNOW

The canonical identifiers should be:
`BASKUSD` , `USDBASK` , `APWUSD` , `USDAPW` , `SNOWUSD` , and `USDSNOW`. 

# MOTIVATION

Adding these price identifiers allows the use of the base currencies as 
collateral for minting synthetics or call options.

Any of the base currencies could be used to mint yield dollars or other 
synthetics, and liquidators could identify undercollateralized positions by 
comparing the USD value of the locked collateral. Base currency call options 
could be minted and paid out based on the USD price of the base currency at 
expiry. KPI options tied to the price of the base currency could be minted, 
with a payout increasing as the base currency price increases.

Proactively approving these price identifiers will make it easier for 
development teams and protocol treasuries to create new products using these 
ERC20 tokens and their price identifiers.

# RATIONALE

All of these base currencies have deep liquidity on Uniswap, SushiSwap, or both,
and some have good liquidity on centralized exchanges, as well. The 
specifications for each price identifier are based on where the token has the
highest volume and liquidity, which should give the most accurate price for
the base currency. So, if a token has deep liquidity and high volume on Uniswap 
but little or no CEX activity, we would use a Uniswap TWAP. If a token has deep 
liquidity and high volume on two CEXs and Uniswap, we would take the median of 
the three prices (with a TWAP for Uniswap).



# BASK

## MARKETS & DATA SOURCES

Markets: SushiSwap

* SushiSwap [BASK/ETH](https://analytics.sushi.com/pairs/0x34d25a4749867ef8b62a0cd1e2d7b4f7af167e01)

How often is the provided price updated?
- For SushiSwap, the price is updated with every Ethereum block (~15 seconds per block)

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

Provide recommended endpoints to query for historical prices from each market listed.
* SushiSwap: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

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

This price identifier uses the [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) and [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feeds

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

Voters should query for the price of BASK/ETH on SushiSwap and the ETHUSD price as specified via UMIP-6. Recommended endpoints are provided in the markets and data sources section.

```
1. Query the BASK/ETH price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD price as per UMIP-6.
3. Multiply the BASK/ETH price by the ETH/USD price and round to 6 decimals to get the BASK/USD price.
4. The result from step 5 should be rounded to six decimals to determine the BASKUSD price.
5. (for USD/BASK) Take the inverse of the result of step 3, before rounding, (1/ BASK/USD) to get the USD/BASK price, and round to 6 decimals.
```

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

## SECURITY CONSIDERATIONS

Audited by Haechi

https://github.com/basketdao/contracts/tree/main/audits

This project is currently in Beta testing. Additionally, the inclusion of only a single market makes this subject to possible manipulation $UMA holders should evaluate the ongoing cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of the collaterals nature as liquidity, if the collateral changes, or if added robustness(e.g., via TWAPs) are necessary to prevent market manipulation.

**BASK**: https://discourse.umaproject.org/u/Hagz48



# APW

## Markets and Data Sources

Markets: SushiSwap

SushiSwap: [APW/ETH](https://analytics.sushi.com/pairs/0x53162d78dca413d9e28cf62799d17a9e278b60e8)

How often is the provided price updated?
- SushiSwap price is updated with every Ethereum block (~15 seconds per block)

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- No

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

Provide recommended endpoints to query for historical prices from each market listed.

* SushiSwap: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

SushiSwap Query:

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
4. (for USD/APW) Take the inverse of the result of step 3 (1/ APW/USD), before rounding, to get the USD/APW price. Then, round to 6 decimals.
```

## Security Considerations

Audited by Bramah Systems.

An inclusion of a single market makes that price subject to manipulation, this is something that must be considered by UMA governance.  $UMA holders should evaluate the ongoing cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of this collateral nature as liquidity, if the collateral changes, or if added robustness(e.g., via TWAPs) are necessary to prevent market manipulation
**APWINE**:https://discourse.umaproject.org/u/Hagz48

# SNOW

## Markets and Data Sources

Markets: Uniswap

* Uniswap [SNOW/ETH](https://v2.info.uniswap.org/pair/0xe4f8f3cb9b33247789e4984a457bb69a1a621df3)


How often is the provided price update?
- Uniswap updates their price with every Ethereum block (~15 seconds per block)

Do these sources allow for querying up to 74 hours of historical data?
- Yes

Is an API key required to query these sources?
- No

Is there a cost associated with usage?
- For uniswap subgraph, no

If there is a free tier available, how many queries does it allow for?
- Subgraph is free to use

Provide recommended endpoints to query for historical prices from each market listed.
- Uniswap V2: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

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

Uses the [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js)
and [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feeds.

```
SNOWUSD: {
  type: "expression",
  expression: `
    SNOW_ETH_UNI * ETHUSD
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    SNOW_ETH_UNI: { type: "uniswap", uniswapAddress: "0xe4f8f3cb9b33247789e4984a457bb69a1a621df3", twapLength: 900, invertPrice: true  },
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
    snow_usd = (SNOW_ETH_UNI * ETHUSD)
    1 / snow_usd
  `,
  lookback: 7200,
  minTimeBetweenUpdates: 60,
  priceFeedDecimals: 8,
  customFeeds: {
    SNOW_ETH_UNI: { type: "uniswap", uniswapAddress: "0xe4f8f3cb9b33247789e4984a457bb69a1a621df3", twapLength: 900, invertPrice: true  },
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
1. Query the SNOW/ETH price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD price as per UMIP-6.
3. Multiply the SNOW/ETH price by the ETH/USD price and round to 6 decimals to get the SNOW/USD price.
4. The result from step 3 should be rounded to six decimals to determine the SNOWUSD price.
5. (for USD/SNOW) Take the inverse of the result of step 4, before rounding, (1/ SNOW/USD) to get the USD/SNOW price, and round to 6 decimals.
```

## Security Considerations

Audited by Quantstamp

https://hackmd.io/@9GUQpanJRF6cloQ0fwyPFw/r1_ctUuqv

The SNOW protocol is in Beta. $UMA holders should evaluate the ongoing cost and benefit of supporting this asset as a collateral if liquidity concerns are identified. UMA holders should take note of this collateral nature as liquidity, if the collateral changes, or if added robustness(e.g., via TWAPs) are necessary to prevent market manipulation

**SNOW**:https://discourse.umaproject.org/u/Hagz48


