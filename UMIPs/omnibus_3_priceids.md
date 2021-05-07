## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | [Add BANDUSD, USDBAND, SDTUSD, USDSDT, KP3RUSD, USDKP3R, CREAMUSD, USDCREAM, LPOOLUSD, USDLPOOL, CHAINUSD, USDCHAIN, SANDUSD, USDSAND, ERNUSD, USDERN, POLSUSD and USDPOLS as price identifiers]                                                                                                  |
| Authors    | John Shutt (john@umaproject.org), Deepanshu Hooda (deepanshuhooda2000@gmail.com) |
| Status     | Draft                                                                                                                                  |
| Created    | May 2, 2021
| Link to Discourse    | [Link]()


# SUMMARY

The DVM should support price requests for the below price indices:
- BAND/USD
- USD/BAND
- SDT/USD
- USD/SDT
- KP3R/USD
- USD/KP3R
- CREAM/USD
- USD/CREAM
- LPOOL/USD
- USD/LPOOL
- CHAIN/USD
- USD/CHAIN
- SAND/USD
- USD/SAND
- ERN/USD
- USD/ERN
- POLS/USD
- USD/POLS  

The canonical identifiers should be `BANDUSD`, `USDBAND`, `SDTUSD`, `USDSDT`, `KP3RUSD`, `USDKP3R`, `CREAMUSD`, `USDCREAM`, `LPOOLUSD`, `USDLPOOL`, `CHAINUSD`, `USDCHAIN`, `SANDUSD`, `USDSAND`, `ERNUSD`, `USDERN`, `POLSUSD` and `USDPOLS`.
# MOTIVATION

1. What are the financial positions enabled by adding these price identifiers that do not already exist?

- These price identifiers allow the use of the base currencies as collateral for minting synthetics or call options. See also [the related collateral UMIP](https://github.com/UMAprotocol/UMIPs/blob/7f3205e3bf634f42f15bfc812bd3a09bf87ddddb/UMIPs/omnibus-3-collateral.md).

2. Please provide an example of a person interacting with a contract that uses these price identifiers.

- Any of the base currencies could be used to mint yield dollars or other synthetics, and liquidators could identify undercollateralized positions by comparing the USD value of the synthetic to the value of the locked collateral.
- Base currency call options could be minted and paid out based on the USD price of the base currency at expiry.
- KPI options tied to the price of the base currency could be minted, with a payout increasing as the base currency price increases.

# RATIONALE

All of these base currencies have deep liquidity on Uniswap, SushiSwap, or both, and some have good liquidity on centralized exchanges, as well. The specifications for each price identifier are based on how we can find the most accurate price for the base currency. So, if a token has deep liquidity and high volume on Uniswap but little or no CEX activity, we would use a Uniswap TWAP. If a token has deep liquidity and high volume on two CEXs and Uniswap, we would take the median of the three prices (with a TWAP for Uniswap).

# BAND

## MARKETS & DATA SOURCES

**Required questions**

Markets: Binance and Coinbase-Pro

* Binance BAND/USDT: https://api.cryptowat.ch/markets/binance/bandusdt/price
* Coinbase Pro BAND/USD: https://api.cryptowat.ch/markets/coinbase-pro/bandusd/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/bandusdt/ohlc?after=1617848822&before=1617848822&periods=60
* Coinbase-Pro: https://api.cryptowat.ch/markets/coinbase-pro/bandusd/ohlc?after=1617848822&before=1617848822&periods=60


Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying both exchanges will cost 0.010 API credits).
   - Therefore, querying both exchanges can be performed 1000 times per day.
   - In other words, both exchanges can be queried at most every 86 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### BAND/USD

**Price Identifier Name:** BANDUSD

**Base Currency:** BAND

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/BAND

**Price Identifier Name:** USDBAND

**Base Currency:** USD

**Quote currency:** BAND

**Intended Collateral Currency:** BAND

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of BAND/USD at the price request timestamp on Coinbase Pro and Binance. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken
3. The median from step 2 should be rounded to six decimals to determine the BANDUSD price.
4. (for USD/BAND) Take the inverse of the result of step 2 (1/ BAND/USD) to get the USD/BAND price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.


# SDT

## MARKETS & DATA SOURCES

 **Required questions**

Markets: SushiSwap, Uniswap

SushiSwap: [SDT/ETH](https://analytics.sushi.com/pairs/0x22def8cf4e481417cb014d9dc64975ba12e3a184)

Uniswap : [SDT/ETH](https://info.uniswap.org/pair/0xc465c0a16228ef6fe1bf29c04fdb04bb797fd537)

Data: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange, https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

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

### SDT/USD

**Price Identifier Name:** SDTUSD

**Base Currency:** SDT

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/SDT

**Price Identifier Name:** USDSDT

**Base Currency:** USD

**Quote currency:** SDT

**Intended Collateral Currency:** SDT

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query SDT/ETH Price from SushiSwap and Uniswap using 15-minute TWAP.
2. Take the median of the price from 2 sources.
3. Query the ETH/USD Price as per UMIP-6.
4. Multiply the SDT/ETH price by the ETH/USD price and round to 6 decimals to get the SDT/USD price.
5. (for USD/SDT) Take the inverse of the result of step 4 (1/ SDT/USD), before rounding, to get the USD/SDT price. Then, round to 6 decimals.
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


# KP3R

## MARKETS & DATA SOURCES

**Required questions**

Markets: Binance and Coinbase-Pro

* Binance KP3R/BUSD: https://api.cryptowat.ch/markets/binance/kp3rbusd/price
* OKEx KP3R/USDT: https://api.cryptowat.ch/markets/okex/kp3rusdt/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/kp3rbusd/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/kp3rusdt/ohlc?after=1617848822&before=1617848822&periods=60


Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying both exchanges will cost 0.010 API credits).
   - Therefore, querying both exchanges can be performed 1000 times per day.
   - In other words, both exchanges can be queried at most every 86 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### KP3R/USD

**Price Identifier Name:** KP3RUSD

**Base Currency:** KP3R

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/KP3R

**Price Identifier Name:** USDKP3R

**Base Currency:** USD

**Quote currency:** KP3R

**Intended Collateral Currency:** KP3R

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of KP3R/USD at the price request timestamp on OKEx and Binance. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken.
3. The median from step 2 should be rounded to six decimals to determine the KP3RUSD price.
4. (for USD/KP3R) Take the inverse of the result of step 2 (1/ KP3R/USD) to get the USD/KP3R price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.


# CREAM

## MARKETS & DATA SOURCES

**Required questions**

Markets: Binance and Coinbase-Pro

* Binance CREAM/BUSD: https://api.cryptowat.ch/markets/binance/creambusd/price
* FTX CREAM/USD: https://api.cryptowat.ch/markets/ftx/creamusd/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/creambusd/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/ftx/creamusd/ohlc?after=1617848822&before=1617848822&periods=60


Do these sources allow for querying up to 74 hours of historical data?

   - Yes.

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Is an API key required to query these sources?

   - No.

Is there a cost associated with usage?

   - Yes.

If there is a free tier available, how many queries does it allow for?

   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying both exchanges will cost 0.010 API credits).
   - Therefore, querying both exchanges can be performed 1000 times per day.
   - In other words, both exchanges can be queried at most every 86 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

## TECHNICAL SPECIFICATIONS

### CREAM/USD

**Price Identifier Name:** CREAMUSD

**Base Currency:** CREAM

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/CREAM

**Price Identifier Name:** USDCREAM

**Base Currency:** USD

**Quote currency:** CREAM

**Intended Collateral Currency:** CREAM

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of CREAM/USD at the price request timestamp on FTX and Binance. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken.
3. The median from step 2 should be rounded to six decimals to determine the CREAMUSD price.
4. (for USD/CREAM) Take the inverse of the result of step 2 (1/ CREAM/USD) to get the USD/CREAM price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.



# LPOOL

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap

Uniswap: [LPOOL/ETH](https://info.uniswap.org/pair/0x2f85e11f6f12ead6af643f083a34e001030d2a6f)

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

### LPOOL/USD

**Price Identifier Name:** LPOOLUSD

**Base Currency:** LPOOL

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/LPOOL

**Price Identifier Name:** USDLPOOL

**Base Currency:** USD

**Quote currency:** LPOOL

**Intended Collateral Currency:** LPOOL

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query LPOOL/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the LPOOL/ETH price by the ETH/USD price and round to 6 decimals to get the LPOOL/USD price.
4. (for USD/LPOOL) Take the inverse of the result of step 3 (1/ LPOOL/USD), before rounding, to get the USD/LPOOL price. Then, round to 6 decimals.
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

# CHAIN

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap

Uniswap: [CHAIN/ETH](https://info.uniswap.org/pair/0x33906431e44553411b8668543ffc20aaa24f75f9)

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

### CHAIN/USD

**Price Identifier Name:** CHAINUSD

**Base Currency:** CHAIN

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/CHAIN

**Price Identifier Name:** USDCHAIN

**Base Currency:** USD

**Quote currency:** CHAIN

**Intended Collateral Currency:** CHAIN

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query CHAIN/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the CHAIN/ETH price by the ETH/USD price and round to 6 decimals to get the CHAIN/USD price.
4. (for USD/CHAIN) Take the inverse of the result of step 3 (1/ CHAIN/USD), before rounding, to get the USD/CHAIN price. Then, round to 6 decimals.
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


# SAND
## MARKETS & DATA SOURCES

**Required questions**

Markets: Binance, OKEx, Huobi

* Binance SAND/USDT: https://api.cryptowat.ch/markets/binance/sandusdt/price
* OKEx SAND/USDT: https://api.cryptowat.ch/markets/okex/sandusdt/price
* Huobi SAND/USDT: https://api.cryptowat.ch/markets/huobi/sandusdt/price

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/sandusdt/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/sandusdt/ohlc?after=1617848822&before=1617848822&periods=60
* Huobi: https://api.cryptowat.ch/markets/huobi/sandusdt/ohlc?after=1617848822&before=1617848822&periods=60

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

### SAND/USD

**Price Identifier Name:** SANDUSD

**Base Currency:** SAND

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/SAND

**Price Identifier Name:** USDSAND

**Base Currency:** USD

**Quote currency:** SAND

**Intended Collateral Currency:** SAND

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

Voters should query for the price of SAND/USD at the price request timestamp on Huobi, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken
3. The median from step 2 should be rounded to six decimals to determine the SANDUSD price.
4. (for USD/SAND) Take the inverse of the result of step 2 (1/ SAND/USD) to get the USD/SAND price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.




# ERN

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap

Uniswap: [ERN/ETH](https://info.uniswap.org/pair/0x570febdf89c07f256c75686caca215289bb11cfc)

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

### ERN/USD

**Price Identifier Name:** ERNUSD

**Base Currency:** ERN

**Quote currency:** USD

**Intended Collateral Currency:** USDC

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** Yes.

### USD/ERN

**Price Identifier Name:** USDERN

**Base Currency:** USD

**Quote currency:** ERN

**Intended Collateral Currency:** ERN

**Scaling Decimals:** 18 (1e18)

**Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

**Does the value of this collateral currency match the standalone value of the listed quote currency?:** Yes.

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

## IMPLEMENTATION

```
1. Query ERN/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the ERN/ETH price by the ETH/USD price and round to 6 decimals to get the ERN/USD price.
4. (for USD/ERN) Take the inverse of the result of step 3 (1/ ERN/USD), before rounding, to get the USD/ERN price. Then, round to 6 decimals.
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



