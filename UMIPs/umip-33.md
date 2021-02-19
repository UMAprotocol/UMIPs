# Disclaimer

The AMPLUSD price identifier has been deprecated. It is highly recommended that contract deployers do not use this identifier in its current state for new contracts. Price requests from contracts created after 02/20/21 00:00 UTC will likely not be resolved correctly. 

Reasoning: The new EMP template proposed in [UMIP-54](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-54.md) requires that all price identifiers be scaled to 18 decimals. There are live contracts using the old EMP template which require this price identifier to be scaled equal the number of decimals in USDC (6). Because of this, the DVM could return prices incorrectly for new contracts that use this identifier.

## Headers

- UMIP-33
- UMIP title: Add AMPLUSD, USDAMPL as price identifiers
- Author (alex, abgtrading30@gmail.com)
- Status: Approved
- Created: December 20, 2020

## Summary (2-5 sentences)

The DVM should support price requests for the AMPL/USD and USD/AMPL price index.

## Motivation

The DVM currently does not support the AMPL/USD or USD/AMPL price index.

Supporting the AMPLUSD and USDAMPL price identifiers would enable the creation of a synthetic AMPLUSD and USDAMPL token, backed by USD. Token minters could obtain short exposure on the AMPL/USD index, while token holders could go long or use synthetic AMPL for functional purposes.

There are multiple practical uses and trading strategies for synthetic AMPL which include avoiding rebases, minting tokens for short exposure, and hedging underlying AMPL exposure. Background on Ampleforth and its rebase mechanism can be found in the project whitepaper: https://www.ampleforth.org/papers/

There is little cost associated with adding this price identifier, as there are multiple free and easily accessible data sources available.

## Technical Specification

The definition of this identifier should be:

- Identifier name: AMPLUSD
- Base Currency: AMPL
- Quote Currency: USD
- Data Sources: FTX, Bitfinex, Gate.io
- Result Processing: Median
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 1 seconds
- Dispute timestamp rounding: down
- Scaling Decimals: 6 (1e6)

The definition of this identifier should be:

- Identifier name: USDAMPL
- Base Currency: USD
- Quote Currency: AMPL
- Data Sources: FTX, Bitfinex, Gate.io
- Result Processing: Median
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad market consensus.
- Price Steps: 0.000001 (6 decimals in more general trading format)
- Rounding: Closest, 0.5 up
- Pricing Interval: 1 seconds
- Dispute timestamp rounding: down
- Scaling Decimals: 18 (1e18)

## Rationale

Prices are primarily used by Priceless contracts to calculate a synthetic token’s redemptive value in case of liquidation or expiration. Contract counterparties also use the price index to ensure that sponsors are adequately collateralized.

There is a lot to consider when deciding Ampleforth’s data sources. Part of Ampleforth’s rebase mechanism uses a market oracle, Chainlink, for price feeds. Chainlink sources prices using aggregators (BraveNewCoin, Kaiko, and CryptoCompare) for its volume weighted price. This is problematic as Kaiko is not a free resource and CryptoCompare is only free for personal projects and capped at 250,000 lifetime calls.

Other factors that are relevant to the volume and price for AMPL:

- Compared to other ERC-20 tokens, there is a high level of complexity for centralized exchanges to integrate AMPL due to its daily changes in supply potentially limiting adoption.
- The project has set up liquidity mining (Geyser programs) to incentivize liquidity on decentralized exchanges (Uniswap, Sushiswap, Balancer).
- One of its centralized exchanges, Kucoin, suffered a hack in September. Since the hack, there have been moments where the Kucoin pairs have reflected a lower market price compared to other exchanges. This creates hesitation in using it as one of the main data sources even though it has a high percentage of reported centralized exchange volume.

The option being proposed is to use the spot market prices from FTX, Bitfinex, and Gate.io. As AMPL is added to more exchanges, the technical specification of this identifier could be modified to reflect more reliable exchanges based on volume.

Users should use these aggregators as a convenient way to query the price in real-time, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

## Implementation

The value of AMPLUSD and USDAMPL for a given timestamp can be determined with the following process:

1. AMPL/USD should be queried from Gate.io, Bitfinex, and FTX for that timestamp rounded to the nearest second. The results of these queries should be kept at the level of precision they are returned at.
2. The median of the AMPL/USD results should then be taken and determined whether that median differs from broad market consensus.
3. This result should be rounded to six decimal places.
4. The inverse of the AMPL/USD median from step 2 is then taken (1/AMPLUSD) to determine the USD/AMPL price.
5. The USD/AMPL result should be rounded to six decimal places. 
6. The value for the USD/AMPL results should then be compared to determine whether the median differs from broad market consensus.

This is meant to be vague as the tokenholders are responsible for defining broad market consensus. Ultimately, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.

While it's important for tokenholders to have redundancy in their sources, bots and users that interact with the system in real time need fast sources of price information. In these cases, it can be assumed that the exchange median is accurate enough.

The chosen AMPL/USD and USD/AMPL endpoints are:

1. FTX - AMPL/USDT
```
   https://ftx.com/api/markets/AMPL/USDT // price
```
2. Gate.io - AMPL/USDT
```
   https://api.gateio.ws/api/v4/spot/tickers?currency_pair=AMPL_USDT // last
```
3. Bitfinex - AMPL/USD
   
```
      https://api-pub.bitfinex.com/v2/tickers?symbols=tAMPUSD // LAST_PRICE
```
```
  // from Bitfinex documentation on how trading pairs are returned
  [
    SYMBOL,
    BID, 
    BID_SIZE, 
    ASK, 
    ASK_SIZE, 
    DAILY_CHANGE, 
    DAILY_CHANGE_RELATIVE, 
    LAST_PRICE, 
    VOLUME, 
    HIGH, 
    LOW
  ]
```

Historical Data

Dispute bots and voters will need to query the historical data. Below are the historical end points with examples:
1. FTX - AMPL/USDT

```
https://ftx.com/api/markets/${token}/candles?resolution=${resolution}&limit=${limit}&start_time=${start_time}&end_time=${end_time}  // close

Example: https://ftx.com/api/markets/AMPL/USDT/candles?resolution=60&limit=1&start_time=1608811200&end_time=1608811200
```

2. Gate.io - AMPL/USDT
```
https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=${token}&limit=${limit}&interval=${interval}&from=${from}&to=${to}

Example: https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=AMPL_USDT&limit=1&interval=1m&from=1608811200&to=1608811200
```

The result is reported as an element within a JSON array. The close price is used: 
 - Unix timestamp in seconds
 - Trading volume,
 - Close price,
 - Highest price,
 - Lowest price
 - Open price

3. Bitfinex - AMPL/USD

```
https://api.cryptowat.ch/markets/{exchange}/{pair}/ohlc?before={before}&after={after} // ClosePrice

// Data is returned as the following
[
  CloseTime,
  OpenPrice,
  HighPrice,
  LowPrice,
  ClosePrice,
  Volume,
  QuoteVolume
]

Example: https://api.cryptowat.ch/markets/bitfinex/amplusd/ohlc?before=1608811200&after=1608811200
```
As an example of how one might go about constructing a feed programmatically, here is a standalone script with minimal dependencies that calculate the current price and historical price:
- AMPLUSD and USDAMPL historical price calculation: https://gist.github.com/abg4/ef494aeace3c779fc49f1f774da349ff
- AMPLUSD and USDAMPL current price calculation: https://gist.github.com/abg4/ea3fc6a24e0c1c1bce05b49b47110ce4

As always, double-check the implementation as well as include additional measures for reliability to ensure reasonable assumptions around when the graph or cryptowatch isn't available. 

Additionally, CryptoWatch API is a useful reference. This feed should be used as a convenient way to query the price in realtime, but should not be used as a canonical source of truth for voters. Users are encouraged to build their own offchain price feeds that depend on other sources.

Voters are responsible for determining if the result of this process differs from broad market consensus. This is meant to be vague as $UMA tokenholders are responsible for defining broad market consensus.

This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.


## Security considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eq via TWAPs) are necessary to prevent market manipulation.
