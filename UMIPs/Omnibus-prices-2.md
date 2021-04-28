## HEADERS
| UMIP [#]     |                                                                                                                                  |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | [Add LONUSD, USDLON, BANKUSD, USDBANK, MASKUSD, USDMASK, VSPUSD, USDVSP, SFIUSD, USDSFI, FRAXUSD, USDFRAX, DEXTFFUSD, USDDEXTF, ORNUSD, USDORN, BONDUSD, PUNK-BASICUSD and USDPUNK-BASIC as price identifiers]                                                                                                  |
| Authors    | John Shutt (john@umaproject.org), Deepanshu Hooda (deepanshuhooda2000@gmail.com) |
| Status     | Draft                                                                                                                                  |
| Created    | April 29, 2021
| Link to Discourse    | [Link]()


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

The canonical identifiers should be `LONUSD`, `USDLON`, `BANKUSD`, `USDBANK`, `MASKUSD`, `USDMASK`, `VSPUSD`, `USDVSP`, `SFIUSD`, `USDSFI`, `FRAXUSD`, `USDFRAX`, `DEXTFFUSD`, `USDDEXTF`, `ORNUSD`, `USDORN`, `BONDUSD`, `PUNK-BASICUSD` and `USDPUNK-BASIC`.
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

Market: OKEx

* OKEx LON/USDT: https://api.cryptowat.ch/markets/okex/lonusdt/price


How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* OKEx: https://api.cryptowat.ch/markets/okex/lonusdt/ohlc?after=1617848822&before=1617848822&periods=60


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
   - Therefore, querying exchange can be performed 2000 times per day.
   - In other words, exchange can be queried at most every 43 seconds.

What would be the cost of sending 15,000 queries?

    - Approximately $5

## PRICE FEED IMPLEMENTATION

These price identifiers use the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js).

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

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The result should be rounded to six decimals to determine the LONUSD price.
3. (for USD/LON) Take the inverse of the result of step 2 (1/ LON/USD) to get the USD/LON price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.


# BANK

## MARKETS & DATA SOURCES

 **Required questions**

Market: SushiSwap

SushiSwap: [BANK/ETH](https://analytics.sushi.com/pairs/0x938625591adb4e865b882377e2c965f9f9b85e34)

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

How often is the provided price updated?

   - The lower bound on the price update frequency is a minute.

Provide recommended endpoints to query for historical prices from each market listed.

* Huobi: https://api.cryptowat.ch/markets/huobi/maskusdt/ohlc?after=1617848822&before=1617848822&periods=60
* OKEx: https://api.cryptowat.ch/markets/okex/maskusdt/ohlc?after=1617848822&before=1617848822&periods=60


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

Voters should query for the price of MASK/USD at the price request timestamp on Coinbase Pro, Binance & OKEx. Recommended endpoints are provided in the markets and data sources section.

1. When using the recommended endpoints, voters should use the open price of the 1 minute OHLC period that the timestamp falls in.
2. The median of these results should be taken
3. The median from step 2 should be rounded to six decimals to determine the MASKUSD price.
4. (for USD/MASK) Take the inverse of the result of step 2 (1/ MASK/USD) to get the USD/MASK price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.



# SFI

## MARKETS & DATA SOURCES

 **Required questions**

Market: Uniswap

Uniswap: [SFI/ETH](https://info.uniswap.org/pair/0xc76225124f3caab07f609b1d147a31de43926cd6)

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
1. Query SFI/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the SFI/ETH price by the ETH/USD price and round to 6 decimals to get the SFI/USD price.
4. (for USD/SFI) Take the inverse of the result of step 3 (1/ SFI/USD), before rounding, to get the USD/SFI price. Then, round to 6 decimals.
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

Market: Uniswap

Uniswap: [VSP/ETH](https://info.uniswap.org/pair/0xc76225124f3caab07f609b1d147a31de43926cd6)

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
1. Query VSP/ETH Price from Uniswap using 15-minute TWAP.
2. Query the ETH/USD Price as per UMIP-6.
3. Multiply the VSP/ETH price by the ETH/USD price and round to 6 decimals to get the VSP/USD price.
4. (for USD/VSP) Take the inverse of the result of step 3 (1/ VSP/USD), before rounding, to get the USD/VSP price. Then, round to 6 decimals.
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



















