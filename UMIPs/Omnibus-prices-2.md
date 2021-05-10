## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | [Add LONUSD, USDLON, BANKUSD, USDBANK, MASKUSD, USDMASK, VSPUSD, USDVSP, SFIUSD, USDSFI, FRAXUSD, USDFRAX, DEXTFFUSD, USDDEXTF, ORNUSD, USDORN, BONDUSD, USDBOND, PUNK-BASICUSD and USDPUNK-BASIC as price identifiers]                                                                                                  |
| Authors    | John Shutt (john@umaproject.org), Deepanshu Hooda (deepanshuhooda2000@gmail.com) |
| Status     | Draft                                                                                                                                  |
| Created    | April 29, 2021
| Link to Discourse    | [Link](https://discourse.umaproject.org/t/add-lonusd-usdlon-bankusd-usdbank-maskusd-usdmask-vspusd-usdvsp-sfiusd-usdsfi-fraxusd-usdfrax-dextffusd-usddextf-ornusd-usdorn-bondusd-usdbond-punk-basicusd-and-usdpunk-basic-as-price-identifiers/1036)


# SUMMARY

The DVM should support price requests for the below price indices:
- LON/USD
- USD/LON
- BANK/USD
- USD/BANK
- MASK/USD
- USD/MASK
- VSP/USD
- USD/VSP
- SFI/USD
- USD/SFI
- FRAX/USD
- USD/FRAX
- DEXTF/USD
- USD/DEXTF
- ORN/USD
- USD/ORN
- BOND/USD
- USD/BOND 
- PUNK-BASIC/USD
- USD/PUNK-BASIC

The canonical identifiers should be `LONUSD`, `USDLON`, `BANKUSD`, `USDBANK`, `MASKUSD`, `USDMASK`, `VSPUSD`, `USDVSP`, `SFIUSD`, `USDSFI`, `FRAXUSD`, `USDFRAX`, `DEXTFFUSD`, `USDDEXTF`, `ORNUSD`, `USDORN`, `BONDUSD`, `USDBOND`, `PUNK-BASICUSD` and `USDPUNK-BASIC`.
# MOTIVATION

1. What are the financial positions enabled by adding these price identifiers that do not already exist?

- These price identifiers allow the use of the base currencies as collateral for minting synthetics or call options. See also [the related collateral UMIP](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-82.md).

2. Please provide an example of a person interacting with a contract that uses these price identifiers.

- Any of the base currencies could be used to mint yield dollars or other synthetics, and liquidators could identify undercollateralized positions by comparing the USD value of the synthetic to the value of the locked collateral.
- Base currency call options could be minted and paid out based on the USD price of the base currency at expiry.
- KPI options tied to the price of the base currency could be minted, with a payout increasing as the base currency price increases.

# RATIONALE

All of these base currencies have deep liquidity on Uniswap, SushiSwap, or both, and some have good liquidity on centralized exchanges, as well. The specifications for each price identifier are based on how we can find the most accurate price for the base currency. So, if a token has deep liquidity and high volume on Uniswap but little or no CEX activity, we would use a Uniswap TWAP. If a token has deep liquidity and high volume on two CEXs and Uniswap, we would take the median of the three prices (with a TWAP for Uniswap).

# LON

## MARKETS & DATA SOURCES

**Required questions**

Market: OKEx, Uniswap, SushiSwap

* OKEx LON/USDT: https://api.cryptowat.ch/markets/okex/lonusdt/price
* SUSHISWAP LON/USDT: https://analytics.sushi.com/pairs/0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f
* UNISWAP LON/ETH: https://v2.info.uniswap.org/pair/0x7924a818013f39cf800f5589ff1f1f0def54f31f


How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* OKEx: https://api.cryptowat.ch/markets/okex/lonusdt/ohlc?after=1617848822&before=1617848822&periods=60


Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - Every 60 seconds for CW. Every block for Uniswap and Sushiswap.

Is an API key required to query these sources?

   - CW has a free tier, but requires an API key beyond that.

Is there a cost associated with usage?

   - Yes. Cryptowatch requires a purchase of credits beyond their free tier.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits.
   - Therefore, querying exchange can be performed 2000 times per day.
   - In other words, exchange can be queried at most every 43 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).
[ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).
```js
LONUSD: {
    type: "expression",
    expression: 
	SPOT_UNISWAP_USDT = UNISWAP_ETH * ETHUSD;
        median( SPOT_UNISWAP_USDT, SPOT_OKEX_USDT,SPOT_SUSHISWAP_USDT);
    ,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      SPOT_OKEX_USDT: { type: "cryptowatch", exchange: "okex", pair: "lonusdt" },
      SPOT_SUSHISWAP_USDT: {
        type: "uniswap",
        uniswapAddress: "0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f",
        twapLength: 2
      },
      UNISWAP_ETH: {
            type: "uniswap",
            uniswapAddress: "0x7924a818013f39cf800f5589ff1f1f0def54f31f",
            twapLength: 2
          },
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

### LON/USD

**Price Identifier Name:** LONUSD

**Base Currency:** LON

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/LON

**Price Identifier Name:** USDLON

**Base Currency:** USD

**Quote currency:** LON

**Intended Collateral Currency:** LON

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of LON/USD at the price request timestamp on OKEx. Recommended endpoints are provided in the markets and data sources section.

1. For the price request timestamp, query for the LON/USDT price on Okex. The open price of the 60-second OHLC period that this price request timestamp falls in should be used.
2. Query the ETHUSD price by following the guidelines of UMIP-6.
3. Query LON/USDT Price from Sushiswap using 2 hour TWAP.
4. Query LON/ETH Price from Uniswap using 2 hour TWAP.
5. Take the median of the price from step 1 , step 3 and result of the multiplication of step 4 * step 2.
6. The result should be rounded to six decimals to determine the LONUSD price.
7. (for USD/LON) Take the inverse of the result of step 5 (1/ LON/USD), before rounding, to get the USD/LON price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.


# BANK

## MARKETS & DATA SOURCES

 **Required questions**

Market: SushiSwap

SushiSwap: [BANK/ETH](https://analytics.sushi.com/pairs/0x938625591adb4e865b882377e2c965f9f9b85e34)

Data: https://thegraph.com/explorer/subgraph/sushiswap/exchange

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  token(
      id:"TOKEN_ADDRESS",
      block: {number: BLOCK_NUMBER}
  )
  {
      derivedETH
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### BANK/USD

**Price Identifier Name:** BANKUSD

**Base Currency:** BANK

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/BANK

**Price Identifier Name:** USDBANK

**Base Currency:** USD

**Quote currency:** BANK

**Intended Collateral Currency:** BANK

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query BANK/ETH Price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the BANK/ETH price by the ETH/USD price and round to 6 decimals to get the BANK/USD price.
4. (for USD/BANK) Take the inverse of the result of step 3 (1/ BANK/USD), before rounding, to get the USD/BANK price. Then, round to 6 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from SushiSwap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.



# MASK

## MARKETS & DATA SOURCES

**Required questions**

Markets: Huobi and OKEx

* Huobi MASK/USDT: https://api.cryptowat.ch/markets/huobi/maskusdt/price
* OKEx MASK/USDT: https://api.cryptowat.ch/markets/okex/maskusdt/price
* Uniswap MASK/ETH : https://v2.info.uniswap.org/pair/0x4d5f135691f13f7f5949ab3343ac7dc6bd7df80b

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Huobi: https://api.cryptowat.ch/markets/huobi/maskusdt/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/maskusdt/ohlc?after=1617848822&before=1617848822&periods=60


Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - Every 60 seconds for CW. Every block for Uniswap.

Is an API key required to query these sources?

   - CW has a free tier, but requires an API key beyond that.

Is there a cost associated with usage?

   - Yes. Cryptowatch requires a purchase of credits beyond their free tier.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying both exchanges will cost 0.010 API credits).
   - Therefore, querying both exchanges can be performed 1000 times per day.
   - In other words, both exchanges can be queried at most every 86 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).


```js
MASKUSD: {
    type: "expression",
    expression: 
	SPOT_UNISWAP_USDT = UNISWAP_ETH * ETHUSD;
        median( SPOT_UNISWAP_USDT, SPOT_OKEX_USDT,SPOT_HUOBI_USDT);
    ,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      SPOT_OKEX_USDT: { type: "cryptowatch", exchange: "okex", pair: "maskusdt" },
      SPOT_HUOBI_USDT: { type: "cryptowatch", exchange: "huobi", pair: "maskusdt" },
      UNISWAP_ETH: {
            type: "uniswap",
            uniswapAddress: "0x4d5f135691f13f7f5949ab3343ac7dc6bd7df80b",
            twapLength: 2
          },
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

### MASK/USD

**Price Identifier Name:** MASKUSD

**Base Currency:** MASK

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/MASK

**Price Identifier Name:** USDMASK

**Base Currency:** USD

**Quote currency:** MASK

**Intended Collateral Currency:** MASK

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of MASK/USD at the price request timestamp on Huobi and OKEx. Recommended endpoints are provided in the markets and data sources section.

1. For the price request timestamp, query for the MASK/USDT prices on Huobi and OKEx and and the ETHUSD price by following the guidelines of UMIP-6. The open price of the 60-second OHLC period that this price request timestamp falls in should be used.
2. The median of these results should be taken
3. The median from step 2 should be rounded to six decimals to determine the MASKUSD price.
4. (for USD/MASK) Take the inverse of the result of step 2 (1/ MASK/USD), before rounding, to get the USD/MASK price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.



# SFI

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap, SushiSwap

Uniswap: [SFI/ETH](https://v2.info.uniswap.org/pair/0xc76225124f3caab07f609b1d147a31de43926cd6)

Sushiswap : [SFI/ETH](https://analytics.sushi.com/pairs/0x23a9292830fc80db7f563edb28d2fe6fb47f8624)

Data: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2 , https://thegraph.com/explorer/subgraph/sushiswap/exchange

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  token(
      id:"TOKEN_ADDRESS",
      block: {number: BLOCK_NUMBER}
  )
  {
      derivedETH
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### SFI/USD

**Price Identifier Name:** SFIUSD

**Base Currency:** SFI

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/SFI

**Price Identifier Name:** USDSFI

**Base Currency:** USD

**Quote currency:** SFI

**Intended Collateral Currency:** SFI

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query SFI/ETH Price from Uniswap and SushiSwap using 15-minute TWAP.
2. Take the median of the two prices.
3. Query the ETH/USD Price as per UMIP-6.
4. Multiply the SFI/ETH price by the ETH/USD price and round to 6 decimals to get the SFI/USD price.
5. (for USD/SFI) Take the inverse of the result of step 4 (1/ SFI/USD), before rounding, to get the USD/SFI price. Then, round to 6 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from Uniswap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.



# VSP

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap, SushiSwap

Uniswap: [VSP/ETH](https://v2.info.uniswap.org/pair/0x6d7b6dad6abed1dfa5eba37a6667ba9dcfd49077)

Sushiswap: [VSP/ETH](https://analytics.sushi.com/pairs/0x132eeb05d5cb6829bd34f552cde0b6b708ef5014)

Data: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2 , https://thegraph.com/explorer/subgraph/sushiswap/exchange

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  token(
      id:"TOKEN_ADDRESS",
      block: {number: BLOCK_NUMBER}
  )
  {
      derivedETH
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### VSP/USD

**Price Identifier Name:** VSPUSD

**Base Currency:** VSP

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/VSP

**Price Identifier Name:** USDVSP

**Base Currency:** USD

**Quote currency:** VSP

**Intended Collateral Currency:** VSP

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query VSP/ETH Price from Uniswap and Sushiswap using 15-minute TWAP.
2. Take the median of two values.
3. Query the ETH/USD Price as per UMIP-6.
4. Multiply the VSP/ETH price by the ETH/USD price and round to 6 decimals to get the VSP/USD price.
5. (for USD/VSP) Take the inverse of the result of step 4 (1/ VSP/USD), before rounding, to get the USD/VSP price. Then, round to 6 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from Uniswap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.






# FRAX

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap

Uniswap: [FRAX/USDC](https://v2.info.uniswap.org/pair/0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d)

Data: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  pair(id:"0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d") {
    token1Price
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### FRAX/USD

**Price Identifier Name:** FRAXUSD

**Base Currency:** FRAX

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/FRAX

**Price Identifier Name:** USDFRAX

**Base Currency:** USD

**Quote currency:** FRAX

**Intended Collateral Currency:** FRAX

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query FRAX/USDC Price from Uniswap using 2-hour TWAP and round to 6 decimals to get the FRAX/USD price.
2. (for USD/FRAX) Take the inverse of the result of step 1 (1/ FRAX/USD), before rounding, to get the USD/FRAX price. Then, round to 6 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from Uniswap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.




# DEXTF

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap

Uniswap: [DEXTF/ETH](https://v2.info.uniswap.org/pair/0xa1444ac5b8ac4f20f748558fe4e848087f528e00)

Data: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  token(
      id:"TOKEN_ADDRESS",
      block: {number: BLOCK_NUMBER}
  )
  {
      derivedETH
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### DEXTF/USD

**Price Identifier Name:** DEXTFUSD

**Base Currency:** DEXTF

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/DEXTF

**Price Identifier Name:** USDDEXTF

**Base Currency:** USD

**Quote currency:** DEXTF

**Intended Collateral Currency:** DEXTF

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query DEXTF/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the DEXTF/ETH price by the ETH/USD price and round to 6 decimals to get the DEXTF/USD price.
4. (for USD/DEXTF) Take the inverse of the result of step 3 (1/ DEXTF/USD), before rounding, to get the USD/DEXTF price. Then, round to 6 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from Uniswap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.




# ORN

## MARKETS & DATA SOURCES

**Required questions**

Market: Binance

* Binance ORN/USDT: https://api.cryptowat.ch/markets/binance/ornusdt/price
* Binance ORN/BTC : https://api.cryptowat.ch/markets/binance/ornbtc/price
* Uniswap ORN/ETH : https://v2.info.uniswap.org/pair/0x6c8b0dee9e90ea9f790da5daf6f5b20d23b39689

Data: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

How often is the provided price updated?

   - Every second for CW. Every block for Uniswap.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance[ORN/USDT]: https://api.cryptowat.ch/markets/binance/ornusdt/ohlc?after=1617848822&before=1617848822&periods=60
* Binance[ORN/BTC] : https://api.cryptowat.ch/markets/binance/ornbtc/ohlc?after=1617848822&before=1617848822&periods=60
* Uniswap [ORN/ETH] - Historical data can be fetched from the subgraph:
```
{
  token(
      id:"TOKEN_ADDRESS",
      block: {number: BLOCK_NUMBER}
  )
  {
      derivedETH
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - Every 60 seconds for CW. Every block for Uniswap.

Is an API key required to query these sources?

   -CW has a free tier, but requires an API key beyond that.

Is there a cost associated with usage?

   - Yes. Cryptowatch requires a purchase of credits beyond their free tier.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits.
   - Therefore, querying the exchange can be performed 2000 times per day.
   - In other words, exchange can be queried at most every 43 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).
and [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js)


```js
ORNUSD: {
    type: "expression",
    expression: 
	SPOT_UNISWAP_USDT = UNISWAP_ETH * ETHUSD;
	SPOT_BINANCE_ORNBTC_USDT = SPOT_BINANCE_USDT * BTCUSD
        median( SPOT_UNISWAP_USDT, SPOT_BINANCE_ORNBTC_USDT,SPOT_BINANCE_USDT);
    ,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      SPOT_BINANCE_USDT: { type: "cryptowatch", exchange: "binance", pair: "ornusdt" },
      SPOT_BINANCE_BTC: { type: "cryptowatch", exchange: "binance", pair: "ornbtc" },
      UNISWAP_ETH: {
            type: "uniswap",
            uniswapAddress: "0x6c8b0dee9e90ea9f790da5daf6f5b20d23b39689",
            twapLength: 2
          },
      ETHUSD: {
        type: "medianizer",
        minTimeBetweenUpdates: 60,
        medianizedFeeds: [
          { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
          { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
          { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
        ]
      },
      BTCUSD: {
        type: "medianizer",
        minTimeBetweenUpdates: 60,
        medianizedFeeds: [
          { type: "cryptowatch", exchange: "coinbase-pro", pair: "btcusd" },
          { type: "cryptowatch", exchange: "binance", pair: "btcusdt" },
          { type: "cryptowatch", exchange: "kraken", pair: "btcusd" }
        ]
      },
    }
  }
```

## TECHNICAL SPECIFICATIONS

### ORN/USD

**Price Identifier Name:** ORNUSD

**Base Currency:** ORN

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/ORN

**Price Identifier Name:** USDORN

**Base Currency:** USD

**Quote currency:** ORN

**Intended Collateral Currency:** ORN

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of ORN/USD at the price request timestamp on Binance. Recommended endpoints are provided in the markets and data sources section.

1. For the price request timestamp, query for the ORN/USDT and ORN/BTC prices on Binance and get BTCUSD price according to Expression feed to get ORNUSD price and the ETHUSD price by following the guidelines of UMIP-6. The open price of the 60-second OHLC period that this price request timestamp falls in should be used.
2. For the block of the price request timestamp, query for the ORNETH price from Uniswap.
3. Multiply the gathered ETHUSD price by ORNETH to get the Uniswap ORNUSD price.
4. Take the median of these.
5. Round to 6 decimals to get the ORNUSD price.
6. To get the USDORN price, voters should just take the inverse of the result of Step 4 (unrounded ORNUSD price) then round to 6 decimal places.



For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.




# BOND

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap

Uniswap: [BOND/USDC](https://v2.info.uniswap.org/pair/0x6591c4bcd6d7a1eb4e537da8b78676c1576ba244)

Data: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  pair(id:"0x6591c4bcd6d7a1eb4e537da8b78676c1576ba244") {
    token1Price
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### BOND/USD

**Price Identifier Name:** BONDUSD

**Base Currency:** BOND

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/BOND

**Price Identifier Name:** USDBOND

**Base Currency:** USD

**Quote currency:** BOND

**Intended Collateral Currency:** BOND

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query BOND/USDC Price from Uniswap using 1-hour TWAP and round to 6 decimals to get the BOND/USD price.
2. (for USD/BOND) Take the inverse of the result of step 1 (1/ BOND/USD), before rounding, to get the USD/BOND price. Then, round to 6 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from Uniswap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.


# PUNK-BASIC

## MARKETS & DATA SOURCES
**Required questions**

Markets: SushiSwap

SushiSwap: [PUNK-BASIC/NFTX](https://analytics.sushi.com/pairs/0x90825add1ad30d7dcefea12c6704a192be6ee94e) , 
[NFTX/ETH](https://analytics.sushi.com/pairs/0x31d64f9403e82243e71c2af9d8f56c7dbe10c178)

Data: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

How often is the provided price updated?

    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.

    - Historical data can be fetched from the subgraph:
```
{
  token(
      id:"TOKEN_ADDRESS",
      block: {number: BLOCK_NUMBER}
  )
  {
      derivedETH
  }
}
```

Do these sources allow for querying up to 74 hours of historical data?

    - Yes.

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

Is an API key required to query these sources?

    - No.

Is there a cost associated with usage?

    - No.

If there is a free tier available, how many queries does it allow for?

    - No limits at the moment.

What would be the cost of sending 15,000 queries?

     - $0

## PRICE FEED IMPLEMENTATION

These price identifiers use the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### PUNK-BASIC/USD

**Price Identifier Name:** PUNK-BASICUSD

**Base Currency:** PUNK-BASIC

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 8 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/PUNK-BASIC

**Price Identifier Name:** USDPUNK-BASIC

**Base Currency:** USD

**Quote currency:** PUNK-BASIC

**Intended Collateral Currency:** PUNK-BASIC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 8 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query PUNK-BASIC/NFTX Price from SushiSwap using 15-minute TWAP.
2. Query NFTX/ETH Price from SushiSwap using 15-minute TWAP.
3. Query the ETH/USD Price as per UMIP-6.
4. Multiply the PUNK-BASIC/NFTX with NFTX/ETH price and then multiply the result by the ETH/USD price and round to 8 decimals to get the PUNK-BASIC/USD price.
5. (for USD/PUNK-BASIC) Take the inverse of the result of step 3 (1/ PUNK-BASIC/USD), before rounding, to get the USD/PUNK-BASIC price. Then, round to 8 decimals.
```

It should be noted that this identifier is potentially prone to attempted manipulation because of its reliance on one pricing source. As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.

**What prices should be queried for and from which markets?**
- Prices are queried from SushiSwap and listed in the `Technical Specifications` section.

**Pricing interval**
- Every block

**Input processing**
- None.

**Result processing**
- See rounding rules in `Technical Specification`.

# Security considerations

Adding these new identifiers by themselves poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for these identifiers and also contemplate de-registering these identifiers if security holes are identified. As noted above, $UMA-holders should also consider re-defining these identifiers as liquidity in the underlying asset changes, or if added robustness (e.g. via TWAPs) are necessary to prevent market manipulation.
