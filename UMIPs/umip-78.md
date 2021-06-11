## HEADERS
| UMIP-78     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add yUSDUSD, USDyUSD, RAIUSD, USDRAI, COMPUSD, USDCOMP, YFIUSD, USDYFI, ALCXUSD, USDALCX, MKRUSD, USDMKR, CRVUSD, USDCRV, RENUSD, USDREN, RGTUSD, USDRGT, NFTXUSD, and USDNFTX as price identifiers                                                                                                  |
| Authors    | John Shutt (john@umaproject.org) |
| Status     | Approved                                                                                                                                 |
| Created    | April 7, 2021
| Link to Discourse    | [Link](https://discourse.umaproject.org/t/add-yusdusd-usdyusd-compusd-usdcomp-yfiusd-usdyfi-alcxusd-usdalcx-runeusd-usdrune-alphausd-usdalpha-mkrusd-usdmkr-crvusd-usdcrv-renusd-usdren-rgtusd-usdrgt-nftxusd-usdnftx-rulerusd-and-usdruler-as-price-identifiers/714)

# SUMMARY

The DVM should support price requests for the below price indices:
- yUSD/USD
- USD/yUSD
- RAI/USD
- USD/RAI
- COMP/USD
- USD/COMP
- YFI/USD
- USD/YFI
- ALCX/USD
- USD/ALCX
- MKR/USD
- USD/MKR
- CRV/USD
- USD/CRV
- REN/USD
- USD/REN
- RGT/USD
- USD/RGT
- NFTX/USD
- USD/NFTX

The canonical identifiers should be `yUSDUSD`, `USDyUSD`, `RAIUSD`, `USDRAI`, `COMPUSD`, `USDCOMP`, `YFIUSD`, `USDYFI`, `ALCXUSD`, `USDALCX`, `MKRUSD`, `USDMKR`, `CRVUSD`, `USDCRV`, `RENUSD`, `USDREN`, `RGTUSD`, `USDRGT`, `NFTXUSD`, and `USDNFTX`

# MOTIVATION

1. What are the financial positions enabled by adding these price identifiers that do not already exist?

- These price identifiers allow the use of the base currencies as collateral for minting synthetics or call options. See also [the related collateral UMIP](https://github.com/UMAprotocol/UMIPs/pull/238).

2. Please provide an example of a person interacting with a contract that uses these price identifiers.

- Any of the base currencies could be used to mint yield dollars or other synthetics, and liquidators could identify undercollateralized positions by comparing the USD value of the synthetic to the value of the locked collateral.
- Base currency call options could be minted and paid out based on the USD price of the base currency at expiry.
- KPI options tied to the price of the base currency could be minted, with a payout increasing as the base currency price increases.

# RATIONALE

All of these base currencies have deep liquidity on Uniswap, SushiSwap, or both, and some have good liquidity on centralized exchanges, as well. The specifications for each price identifier are based on how we can find the most accurate price for the base currency. So, if a token has deep liquidity and high volume on Uniswap but little or no CEX activity, we would use a Uniswap TWAP. If a token has deep liquidity and high volume on two CEXs and Uniswap, we would take the median of the three prices (with a TWAP for Uniswap).

# yUSD

## MARKETS & DATA SOURCES

 **Required questions**

Markets: SushiSwap

SushiSwap: [yUSD/ETH](https://app.sushi.com/pair/0x382c4a5147fd4090f7be3a9ff398f95638f5d39e)

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

### yUSD/USD

**Price Identifier Name:** yUSDUSD

**Base Currency:** yUSD

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/yUSD

**Price Identifier Name:** USDyUSD

**Base Currency:** USD

**Quote currency:** yUSD

**Intended Collateral Currency:** yUSD

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query yUSD/ETH Price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the yUSD/ETH price by the ETH/USD price and round to 6 decimals to get the yUSD/USD price.
4. (for USD/yUSD) Take the inverse of the result of step 3 (1/ yUSD/USD), before rounding, to get the USD/yUSD price. Then, round to 6 decimals.
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

# RAI

## MARKETS & DATA SOURCES

 **Required questions**

Markets: Uniswap

Uniswap v2: [RAI/ETH](https://info.uniswap.org/pair/0x8ae720a71622e824f576b4a8c03031066548a3b1)

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

### RAI/USD

**Price Identifier Name:** RAIUSD

**Base Currency:** RAI

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/yUSD

**Price Identifier Name:** USDRAI

**Base Currency:** USD

**Quote currency:** RAI

**Intended Collateral Currency:** RAI

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query RAI/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the RAI/ETH price by the ETH/USD price and round to 6 decimals to get the RAI/USD price.
4. (for USD/RAI) Take the inverse of the result of step 3 (1/ RAI/USD), before rounding, to get the USD/RAI price. Then, round to 6 decimals.
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

# COMP

## MARKETS & DATA SOURCES

**Required questions**

Markets: Binance, OKEx, Coinbase Pro

* Binance COMP/USDT: https://api.cryptowat.ch/markets/binance/compusdt/price
* OKEx COMP/USDT: https://api.cryptowat.ch/markets/okex/compusdt/price
* Coinbase Pro COMP/USD: https://api.cryptowat.ch/markets/coinbase-pro/compusd/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/compusdt/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/compusdt/ohlc?after=1617848822&before=1617848822&periods=60
* Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/compusd/ohlc?after=1617848822&before=1617848822&periods=60

Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits).
   - Therefore, querying all three exchanges can be performed 665 times per day.
   - In other words, all three exchanges can be queried at most every 130 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### COMP/USD

**Price Identifier Name:** COMPUSD

**Base Currency:** COMP

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/COMP

**Price Identifier Name:** USDCOMP

**Base Currency:** USD

**Quote currency:** COMP

**Intended Collateral Currency:** COMP

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of COMP/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken
3. The median from step 2 should be rounded to six decimals to determine the COMPUSD price.
4. (for USD/COMP) Take the inverse of the result of step 2 (1/ COMP/USD) to get the USD/COMP price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# YFI

## MARKETS & DATA SOURCES
**Required questions**

Markets: Binance, OKEx, Coinbase Pro

* Binance YFI/USD: https://api.cryptowat.ch/markets/binance/yfiusdt/price
* OKEx YFI/USD: https://api.cryptowat.ch/markets/okex/yfiusdt/price
* Coinbase Pro YFI/USD: https://api.cryptowat.ch/markets/coinbase-pro/yfiusd/price

How often is the provided price updated?

   - The lower bound on the price update frequency for the Cryptowatch feeds is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/yfiusdt/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/yfiusdt/ohlc?after=1617848822&before=1617848822&periods=60
* Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/yfiusd/ohlc?after=1617848822&before=1617848822&periods=60

Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency for the Cryptowatch feeds is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes

If there is a free tier available, how many queries does it allow for?

   - For Cryptowatch, the free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying two exchanges will cost 0.015 API credits).
   - Therefore, querying all three exchanges can be performed 665 times per day.
   - In other words, all three exchanges can be queried at most every 130 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### YFI/USD

**Price Identifier Name:** YFIUSD

**Base Currency:** YFI

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/YFI

**Price Identifier Name:** USDYFI

**Base Currency:** USD

**Quote currency:** YFI

**Intended Collateral Currency:** YFI

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of YFI/USD at the price request timestamp on Kraken and Coinbase Pro. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints on Cryptowatch, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of the three results should be taken.
3. The median from step 2 should be rounded to six decimals to determine the YFIUSD price.
4. (for USD/YFI) Take the inverse of the result of step 2 (1/ YFI/USD) to get the USD/YFI price, and round to six decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# ALCX

## MARKETS & DATA SOURCES

 **Required questions**

Markets: SushiSwap

SushiSwap: [ALCX/ETH](https://app.sushi.com/pair/0xc3f279090a47e80990fe3a9c30d24cb117ef91a8)

Data: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

How often is the provided price updated?

    - On each Ethereum block (i.e. every ~15 seconds)

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

### ALCX/USD

**Price Identifier Name:** ALCXUSD

**Base Currency:** ALCX

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/ALCX

**Price Identifier Name:** USDALCX

**Base Currency:** USD

**Quote currency:** ALCX

**Intended Collateral Currency:** ALCX

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query ALCX/ETH Price from SushiSwap using 15-minutes TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the ALCX/ETH price by the ETH/USD price and round to 6 decimals to get the ALCX/USD price.
4. (for USD/ALCX) Take the inverse of the result of step 3 (1/ ALCX/USD), before rounding, to get the USD/ALCX price, and round to 6 decimals.
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

# MKR

## MARKETS & DATA SOURCES

**Required questions**

Markets: Binance, OKEx, Coinbase Pro

* Binance MKR/USDT: https://api.cryptowat.ch/markets/binance/mkrusdt/price
* OKEx MKR/USDT: https://api.cryptowat.ch/markets/okex/mkrusdt/price
* Coinbase Pro MKR/USD: https://api.cryptowat.ch/markets/coinbase-pro/mkrusd/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/mkrusdt/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/mkrusdt/ohlc?after=1617848822&before=1617848822&periods=60
* Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/mkrusd/ohlc?after=1617848822&before=1617848822&periods=60

Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits).
   - Therefore, querying all three exchanges can be performed 665 times per day.
   - In other words, all three exchanges can be queried at most every 130 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### MKR/USD

**Price Identifier Name:** MKRUSD

**Base Currency:** MKR

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/MKR

**Price Identifier Name:** USDMKR

**Base Currency:** USD

**Quote currency:** MKR

**Intended Collateral Currency:** MKR

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of MKR/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken.
3. The median from step 2 should be rounded to 6 decimals to determine the MKRUSD price.
4. (for USD/MKR) Take the inverse of the result of step 2 (1/ MKR/USD) to get the USD/MKR price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# CRV

## MARKETS & DATA SOURCES

**Required questions**

Markets: Binance, Huobi, OKEx

* Binance CRV/USDT: https://api.cryptowat.ch/markets/binance/crvusdt/price
* Huobi CRV/USDT: https://api.cryptowat.ch/markets/huobi/crvusdt/price
* OKEx CRV/USDT: https://api.cryptowat.ch/markets/okex/crvusdt/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/crvusdt/ohlc?after=1617848822&before=1617848822&periods=60
* Huobi: https://api.cryptowat.ch/markets/huobi/crvusdt/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/crvusdt/ohlc?after=1617848822&before=1617848822&periods=60

Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits).
   - Therefore, querying all three exchanges can be performed 665 times per day.
   - In other words, all three exchanges can be queried at most every 130 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### CRV/USD

**Price Identifier Name:** CRVUSD

**Base Currency:** CRV

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/CRV

**Price Identifier Name:** USDCRV

**Base Currency:** USD

**Quote currency:** CRV

**Intended Collateral Currency:** CRV

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of CRV/USD at the price request timestamp on Binance, Huobi, and OKEx. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken.
3. The median from step 2 should be rounded to 6 decimals to determine the CRVUSD price.
4. (for USD/CRV) Take the inverse of the result of step 2 (1/ CRV/USD) to get the USD/CRV price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# REN

## MARKETS & DATA SOURCES

**Required questions**

Markets: Coinbase Pro, Binance, OKEx

* Coinbase Pro CRV/USD: https://api.cryptowat.ch/markets/coinbase-pro/renusd/price
* Binance CRV/USDT: https://api.cryptowat.ch/markets/binance/renusdt/price
* OKEx CRV/USDT: https://api.cryptowat.ch/markets/okex/renusdt/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/renusd/ohlc?after=1617848822&before=1617848822&periods=60
* Binance: https://api.cryptowat.ch/markets/binance/renusd/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/renusd/ohlc?after=1617848822&before=1617848822&periods=60

Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits).
   - Therefore, querying all three exchanges can be performed 665 times per day.
   - In other words, all three exchanges can be queried at most every 130 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### REN/USD

**Price Identifier Name:** RENUSD

**Base Currency:** REN

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/REN

**Price Identifier Name:** USDREN

**Base Currency:** USD

**Quote currency:** REN

**Intended Collateral Currency:** REN

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of REN/USD at the price request timestamp on Coinbase Pro, Binance, and OKEx. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken.
3. The median from step 2 should be rounded to six decimals to determine the RENUSD price.
4. (for USD/REN) Take the inverse of the result of step 2 (1/ REN/USD) to get the USD/REN price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# RGT

## MARKETS & DATA SOURCES

 **Required questions**

Markets: SushiSwap

SushiSwap: [RGT/ETH](https://app.sushi.com/pair/0x18a797c7c70c1bf22fdee1c09062aba709cacf04)

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

### RGT/USD

**Price Identifier Name:** RGTUSD

**Base Currency:** RGT

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/RGT

**Price Identifier Name:** USDRGT

**Base Currency:** USD

**Quote currency:** RGT

**Intended Collateral Currency:** RGT

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query RGT/ETH Price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the RGT/ETH price by the ETH/USD price and round to 6 decimals to get the RGT/USD price.
4. (for USD/RGT) Take the inverse of the result of step 3 (1/ RGT/USD), before rounding, to get the USD/RGT price, then round to 6 decimals.
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

# NFTX

## MARKETS & DATA SOURCES

 **Required questions**

Markets: SushiSwap

SushiSwap: [NFTX/ETH](https://app.sushi.com/pair/0x31d64f9403e82243e71c2af9d8f56c7dbe10c178)

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

### NFTX/USD

**Price Identifier Name:** NFTXUSD

**Base Currency:** NFTX

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/NFTX

**Price Identifier Name:** USDNFTX

**Base Currency:** USD

**Quote currency:** NFTX

**Intended Collateral Currency:** NFTX

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query NFTX/ETH Price from SushiSwap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the NFTX/ETH price by the ETH/USD price and round to 6 decimals to get the NFTX/USD price.
4. (for USD/NFTX) Take the inverse of the result of step 3 (1/ NFTX/USD), before rounding, to get the USD/NFTX price, then round to 6 decimals.
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
