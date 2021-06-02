# HEADERS
| UMIP [#]             |                                                                                                                                         |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title           | [Add BANDUSD, USDBAND, SDTUSD, USDSDT, KP3RUSD, USDKP3R, CREAMUSD, USDCREAM, CHAINUSD, USDCHAIN, ERNUSD and USDERN as price identifiers]|
| Authors              | John Shutt (john@umaproject.org), Deepanshu Hooda (deepanshuhooda2000@gmail.com), Aaron (bitznbrewz)                                    |
| Status               | Draft                                                                                                                                   |
| Created              | May 2, 2021                                                                                                                             |
| Link to Discourse    | [Link](https://discourse.umaproject.org/t/add-band-sdt-kp3r-cream-lpool-chain-and-sand-price-identifiers-draft/1145)                                                                                                                               |


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
- CHAIN/USD
- USD/CHAIN
- ERN/USD
- USD/ERN

The canonical identifiers should be `BANDUSD`, `USDBAND`, `SDTUSD`, `USDSDT`, `KP3RUSD`, `USDKP3R`, `CREAMUSD`, `USDCREAM`, `CHAINUSD`, `USDCHAIN`, `ERNUSD` and `USDERN`.

# MOTIVATION

These price identifiers would allow the above currencies to be used for the creation of synths using currencies.  These tokens were proposed to be used as collateral in UMIP #96.  Examples of synths that could be created using these currencies would be yield dollars or covered call options.

Proactively approving these price identifiers will make it easier for development teams and protocol treasuries to create new products using these ERC20 tokens and their price identifiers.

# RATIONALE

All of these base currencies have deep liquidity on Uniswap, SushiSwap, or both, and some have good liquidity on centralized exchanges, as well. The specifications for each price identifier are based on how we can find the most accurate price for the base currency. So, if a token has deep liquidity and high volume on Uniswap but little or no CEX activity, we would use a Uniswap TWAP. If a token has deep liquidity and high volume on two CEXs and Uniswap, we would take the median of the three prices (with a TWAP for Uniswap).

# BAND

## MARKETS & DATA SOURCES

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

Markets: SushiSwap, Uniswap

SushiSwap: [SDT/ETH](https://analytics.sushi.com/pairs/0x22def8cf4e481417cb014d9dc64975ba12e3a184)

Uniswap : [SDT/ETH](https://v2.info.uniswap.org/pair/0xc465c0a16228ef6fe1bf29c04fdb04bb797fd537)

Data: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange, https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

How often is the provided price updated?
    - On every Ethereum block (i.e. every ~15 seconds)

Provide recommended endpoints to query for historical prices from each market listed.
    - Historical data can be fetched from the subgraph:

Uniswap Query:
```

{
	pair (
    id:"0xc465c0a16228ef6fe1bf29c04fdb04bb797fd537",
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
  id:"0x22def8cf4e481417cb014d9dc64975ba12e3a184",
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

As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.


# KP3R

## MARKETS & DATA SOURCES

Markets: Binance, Sushiswap

Binance: [KP3R/BUSD](https://api.cryptowat.ch/markets/binance/kp3rbusd/price)
Sushiswap: [KP3R/ETH](https://analytics.sushi.com/pairs/0xaf988aff99d3d0cb870812c325c588d8d8cb7de8)

Provide recommended endpoints to query for historical prices from each market listed.

* Binance (using cryptowatch): https://api.cryptowat.ch/markets/binance/kp3rbusd/ohlc?after=1617848822&before=1617848822&periods=60
* Sushiswap (using The Graph): https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

```
{
 pair(
  id:"0xaf988aff99d3d0cb870812c325c588d8d8cb7de8",
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

Do these sources allow for querying up to 74 hours of historical data?
   - Yes.

How often is the provided price updated?
   - On Binance, the lower bound on the price update frequency is a minute.
   - On Sushiswap, the price is updated with every Ethereum block

Is an API key required to query these sources?
   - No

Is there a cost associated with usage?
   - Querying the subgraph is free, however, there is a cost for querying Cryptowatch

If there is a free tier available, how many queries does it allow for?
   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying both exchanges will cost 0.010 API credits).
   - Therefore, querying both exchanges can be performed 1000 times per day.
   - In other words, both exchanges can be queried at most every 86 seconds.

What would be the cost of sending 15,000 queries?
    - Approximately $5 using Cryptowatch
    - Free using the graph

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and
[UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).


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

1. When using Cryptowatch, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. Voters should query the KP3R/ETH Price from Sushiswap (using subgraph) using 15-minute TWAP
3. Voters should then query the ETH/USD price as per UMIP-6
4. Multiply the KP3R/ETH price by the ETH/USD price and round to 6 decimals to get the KP3R/USD price.
5. The median of the numbers from steps 1 and 4 should be taken
6. (for USD/KP3R) Take the inverse of the result of step 5 (1/ KP3R/USD) to get the USD/KP3R price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.


# CREAM

## MARKETS & DATA SOURCES

Markets: Binance and Sushiswap

Binance: [CREAM/BUSD](https://api.cryptowat.ch/markets/binance/creambusd/price)
Sushiswap: [CREAM/ETH](https://analytics.sushi.com/pairs/0xf169cea51eb51774cf107c88309717dda20be167)

Provide recommended endpoints to query for historical prices from each market listed.

* Binance: https://api.cryptowat.ch/markets/binance/creambusd/ohlc?after=1617848822&before=1617848822&periods=60
* Sushiswap (using The Graph): https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

```
{
 pair(
  id:"0xf169cea51eb51774cf107c88309717dda20be167",
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

Do these sources allow for querying up to 74 hours of historical data?
   - Yes.

How often is the provided price updated?
   - On Cryptowatch, the lower bound on the price update frequency is a minute.
   - On Sushiswap, the price is updated with every Ethereum block (~15 seconds)

Is an API key required to query these sources?
   - No.

Is there a cost associated with usage?
   - For Cryptowatch, yes.
   - For the subgraph, no.

If there is a free tier available, how many queries does it allow for?
   - The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits
   - There is no limit on the queries sent via the Sushiswap Subgraph

What would be the cost of sending 15,000 queries?
    - Approximately $5 using Cryptowatch
    - Free using the subgraph

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and
[UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js).


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

1. When using Cryptowatch, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. Voters should query the CREAM/ETH Price from Sushiswap (using subgraph) using 15-minute TWAP
3. Voters should then query the ETH/USD price as per UMIP-6
4. Multiply the CREAM/ETH price by the ETH/USD price and round to 6 decimals to get the CREAM/USD price.
5. The median of the numbers from steps 1 and 4 should be taken
6. (for USD/CREAM) Take the inverse of the result of step 5 (1/ CREAM/USD) to get the USD/CREAM price, and round to 6 decimals.


For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

# CHAIN

## MARKETS & DATA SOURCES


Market: Uniswap

Uniswap: [CHAIN/ETH](https://v2.info.uniswap.org/pair/0x33906431e44553411b8668543ffc20aaa24f75f9)
Data: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2

Provide recommended endpoints to query for historical prices from each market listed.
    - Historical data can be fetched from the subgraph:
```
{
 pair(
  id:"0x33906431e44553411b8668543ffc20aaa24f75f9",
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



# ERN

## MARKETS & DATA SOURCES

Uniswap v2: [ERN/ETH](https://v2.info.uniswap.org/pair/0x570febdf89c07f256c75686caca215289bb11cfc)
Uniswap v3: [ERN/ETH](https://info.uniswap.org/#/pools/0x07ed78c6c91ce18811ad281d0533819cf848075b)

Provided recommended endpoints to query for historical prices from each market listd.

* Uniswap V2: https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
* Uniswap V3: https://thegraph.com/explorer/subgraph/benesjan/uniswap-v3-subgraph


```
{
 pair(
  id:"0x570febdf89c07f256c75686caca215289bb11cfc",
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

```
{
 pool(
  id:"0x07ed78c6c91ce18811ad281d0533819cf848075b",
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

Do these sources allow for querying up to 74 hours of historical data?
   - Yes.

How often is the provided price updated?
   - The price is updated with every Ethereum block (~15 seconds)

Is an API key required to query these sources?
   - No.

Is there a cost associated with usage?
   - For the subgraph, no.

If there is a free tier available, how many queries does it allow for?
   - There is no limit on the queries sent via either of the subgraphs

What would be the cost of sending 15,000 queries?
    - Free using the subgraph

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

**Is your collateral currency already approved to be used by UMA financial contracts?:** In progress.

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

As always, voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the tokenholders are responsible for defining broad market consensus.