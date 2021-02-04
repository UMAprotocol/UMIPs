## HEADERS
| UMIP-40     |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add BTC-BASIS-3M/USDC, BTC-BASIS-6M/USDC, ETH-BASIS-3M/USDC, ETH-BASIS-6M/USDC as price identifiers              |
| Authors    | Bae (bae@youmychicfila.com), K (k@youmychicfila.com) |
| Status     | Final                                                                                                                                    |
| Created    | January 18, 2020                                                                                                                           |
                                                                          
# SUMMARY 

The DVM should support price requests for both BTC-BASIS-3M/USDC, BTC-BASIS-6M/USDC, ETH-BASIS-3M/USDC, ETH-BASIS-6M/USDC price indices. BTC-BASIS-3M/USDC is defined as: min(max(100.0 * [1 + (F-S)/S], 75.0), 125.0), where `F` references a basket of BTC futures that are set to expire in March and `S` represents a basket of BTC spot prices. ETH-BASIS-3M/USDC is defined in the same way, except the `F` and `S` correspond to `ETH` futures and spot. Similarly, the `6M` `BTC` and `ETH` price identifiers would be the same formula except with futures that are set to expire in `June` instead of `March`.  

For closure:

BTC-BASIS-3M/USDC: min(max(100.0 * [1 + (F-S)/S], 75.0), 125.0), where F is a basket of 3 month BTC futures and S is a basket of BTC spot prices.
BTC-BASIS-6M/USDC: min(max(100.0 * [1 + (F-S)/S], 75.0), 125.0), where F is a basket of 6 month BTC futures and S is a basket of BTC spot prices.
ETH-BASIS-3M/USDC: min(max(100.0 * [1 + (F-S)/S], 75.0), 125.0), where F is a basket of 3 month ETH futures and S is a basket of ETH spot prices.
ETH-BASIS-6M/USDC: min(max(100.0 * [1 + (F-S)/S], 75.0), 125.0), where F is a basket of 6 month ETH futures and S is a basket of ETH spot prices.


# MOTIVATION


1. What are the financial positions enabled by creating this synthetic that do not already exist?

    Currently there does not exist an on-chain product on Ethereum that enables folks to deploy risk capital on the futures term structure on either BTC or ETH. Basis (difference between futures and spot) is a heavily popular product suite in the CeFi ecosystem that has nearly ~300mil+ ADV (average _daily_ volume) in this regime allocated to it, and with the rise of interest rate products on-chain, basis synthetics would be heavily useful for folks speculating on the steepening or flattening of the interest rate curve for BTC and ETH. 

2. Please provide an example of a person interacting with a contract that uses this price identifier. 

    If Alice thought that the term structure on BTC or ETH was rich, then she could sell ("flattener") BTC/ETH-BASIS-3M/6M on AMM pools that it exists on. If Alice thought that the term structure on BTC or ETH was cheap, then should buy ("steepener") BTC/ETH-BASIS-3M/6M on AMM pools that it exists on. If Bob thought that there's a contentious ETH fork that'd split hash appropriately and give value to both forks, then a short-basis positions would create an accretive value position for Bob as the utility of the spot would outpace the futures (depending on how CeFi exchanges resolved indices, but usually they pick a fork), and in this case could sell ETH-BASIS-3M/6M. If Bob thought that the 3m-6m basis is rich or cheap, then he could buy or sell a combination of 3m and 6m synths appropriately. Essentially, folks can express a supply/demand crunch for BTC or ETH in terms of the basis. 

3. Consider adding market data  

While there does not exist a liquid proxy for basis, one could attribute the absence of the ~40%+ APY on the front end of the curve prevalent in alt futures in '17/'18 to the rise of the hedgers / speculators on basis in '19/'20, where the monthly volumes on basis portfolios vastly exceeds most TVLs of any DeFi product. 

# MARKETS & DATA SOURCES

 **Required questions**

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    Okex, FTX, and Binance should be used to construct the price. These are 3 of the 4 most liquid (and highest ADV) exchanges in the world for BTC and ETH, and currently have ~40-50bil$ ADV traded. 

2.  Which specific pairs should be queried from each market?

    FTX: BTC/USDT, BTC-0326, BTC-0625
    Binance: BTC/USDT, BTCUSD Quarterly 0326, BTCUSD Quarterly 0625
    Okex: BTC/USDT, BTC-USD-210326, BTC-USD-210625

3. Provide recommended endpoints to query for real-time prices from each market listed. 

    FTX: [BTC](https://ftx.com/api/markets/BTC/USDT), [BTC-0326](https://ftx.com/api/markets/BTC-0326), [BTC-0625](https://ftx.com/api/markets/BTC-0625)

    Binance: [BTC](https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT), [BTC_210326](https://dapi.binance.com/dapi/v1/aggTrades?symbol=btcusd_210326), [BTC_210625](https://dapi.binance.com/dapi/v1/aggTrades?symbol=btcusd_210625)

    Okex: [BTC](https://www.okex.com/api/spot/v3/instruments/BTC-USDT/ticker/), [BTC-USD-210326](https://www.okex.com/api/futures/v3/instruments/BTC-USD-210326/ticker/), [BTC-USD-210625](https://www.okex.com/api/futures/v3/instruments/BTC-USD-210625/ticker/)

    
4. How often is the provided price updated?

   The lower bound on the price update frequency is a minute.

5. Provide recommended endpoints to query for historical prices from each market listed. 

   FTX, use this endpoint: https://ftx.com/api/markets/BTC/USDT/candles?resolution=15&limit=1&start_time=1608241140&end_time=1608241150
   Okex, use this endpoint: https://www.okex.com/api/futures/v3/instruments/BTC-USD-210625/history/candles?start=2021-01-20T02:31:00.000Z&granularity=60
   Binance, use this endpoint: https://dapi.binance.com/dapi/v1/aggTrades?symbol=btcusd_210326&limit=100&startTime=1611437831000&endTime=1611537831000

6.  Do these sources allow for querying up to 74 hours of historical data? 

   Yes

7.  How often is the provided price updated?

   The lower bound on the price update frequency is a minute.

8. Is an API key required to query these sources? 

   No

9. Is there a cost associated with usage? 

   No

10. If there is a free tier available, how many queries does it allow for?

   The lower bound on the number of queries allowed per hour is >> 1000. 

11.  What would be the cost of sending 15,000 queries?

   In the context of the above answers, doesn't make a ton of sense given there is no explicit price attached to it. 

<br>

# PRICE FEED IMPLEMENTATION

The [price feed implementation](https://github.com/UMAprotocol/protocol/pull/2457) is heavily-based on @Nick's [PR](https://github.com/UMAprotocol/protocol/pull/2354/files) for a BasketSpreadPriceFeed.

# TECHNICAL SPECIFICATIONS

**1. Price Identifier Name** - BTC-BASIS-3M/USDC, BTC-BASIS-6M/USDC, ETH-BASIS-3M/USDC, ETH-BASIS-6M/USDC

**2. Base Currency** - BTC-BASIS-3M, BTC-BASIS-6M, ETH-BASIS-3M, ETH-BASIS-6M

**3. Quote currency** - USDC

**4. Intended Collateral Currency** - USDC

- Does the value of this collateral currency match the standalone value of the listed quote currency? 

    Yes, it does.

- Is your collateral currency already approved to be used by UMA financial contracts? If no, submit a UMIP to have the desired collateral currency approved for use. 

    Yes, it is.

**5. Collateral Decimals** - 6 decimals.

**6. Rounding** - Rounded to 6 decimals in accordance with above.

- **Note** - this should always be less than or equal to the `Intended Collateral Currency` field.

<br>

# RATIONALE

- Why this implementation of the identifier as opposed to other implementation designs?

This question can be answered three-fold: 1) the choice of BTC and ETH for the basis was chosen as they are currently the two highest market cap coins with the most liquid futures markets. In the future, we plan to add others as well. 2) the maturity of the basis was chosen to be the two closest maturities (3m - March and 6m- June) as they are the most liquid / highest ADV 3) the choice of the 3 exchanges is explained below, but essentially they are 3 out of the 4 top exchanges globally for ADV/liquidity/reputation.

- What is the reasoning for min + max bounds on the px identifier?

Per some of the feedback, CeFi exchanges already have clamps around their swap funding rates to mitigate a persistent dislocation, and based on empirical analysis the +-25% bounds on the basis for both BTC and ETH seemed more than generous, and adds to the economic security around the synthetics to ensure sponsors do not get liquidated in a way that is not consistent with the term structure itself.

- What analysis can you provide on where to get the most robust prices? (Robust as in legitimate liquidity, legitimate volume, price discrepancies between exchanges, and trading volume between exchanges)

As mentioned in the initial section, Binance, Okex, and FTX are 3 out of the 4 most liquid / highest ADV exchanges in the world for derivatives and spot markets and reputed to be of extremely high quality with low probability of the exchange defaulting. The last few months, Binance regularly has had higher than 20 bil ADV, Okex >10bil, and FTX > 2bil. The wide consensus is that the BTC futures, ETH futures, BTC spot, and ETH spot are of the highest legitimate liquidity/volume + minimal price discrepancies from other exchanges.

- What is the potential for the price to be manipulated on the chosen exchanges?

Extremely low. Even to move the BTC or ETH spot/futures markets a percent, it'd require more than a few dozen million given the efficiency of the liquidity provision on these exchanges. Even in cascading liquidations on the future market, the basis has historically held up strongly given the liquidity on the spot and futures markets. 

- Should the prices have any processing (e.g., TWAP)? 

Not required to have a TWAP/VWAP/etc. 

<br>

# IMPLEMENTATION


1. **What prices should be queried for and from which markets?**

    FTX: BTC/USDT, BTC-0326, BTC-0625
    Binance: BTC/USDT, BTCUSD Quarterly 0326, BTCUSD Quarterly 0625
    Okex: BTC/USDT, BTC0326Quarterly, BTC0625Bi-Quarterly

2. **Pricing interval**

    1 minute

3. **Input processing**

    None. Human intervention in extreme circumstances where the result differs from broad market consensus.

4. **Result processing** 

    For BTC futures prices, the median of the prices from the 3 exchanges should be used. For BTC spot prices, the median of the prices from the 3 spot exchanges should be used. Same for ETH.

    As an example, for BTC-BASIS-3M, the formula is min(max(100.0 * [1 + (F-S)/S], 75.0), 125.0), where F would be a median of the 3 futures prices as mentioned above and S would be a median as well of the 3 spot prices, and the result would be rounded to 6 decimals.

<br>

# Security considerations

**Example questions**

1. Where could manipulation occur?

As discussed in the `What is the potential for the price to be manipulated on the chosen exchanges?`, manipulation could occur at either at the spot layer or the futures layer on each of the each of the aforementioned exchanges. To disrupt BTC or ETH spot of futures on the biggest exchanges globally would require capital at the highest scale, and the dislocation, were it to be caused, would be short-dated due to the efficiency of those markets. 

Further, towards expiration, the front-month futures will become less liquid and easier to manipulate in terms of required capital. As such, we will ensure that the expiration of the synths using these price identifiers will expire a week _before_ any of the constituent futures in the basket expire. This way, we will minimize this attack vector.

Lastly, as a form of manipulation resistance, per some of the feedback, CeFi exchanges already have clamps around their swap funding rates to mitigate a persistent dislocation, and based on empirical analysis the +-25% bounds on the basis for both BTC and ETH seemed more than generous, and adds to the economic security around the synthetics to ensure sponsors do not get liquidated in a way that is not consistent with the term structure itself.

2. How could this price ID be exploited?

Mentioned above. 

3. Do the instructions for determining the price provide people with enough certainty?

Yes.

4. What are current or future concern possibilities with the way the price identifier is defined?

When the 3m and 6m expire, we'd have to recreate another set of price identifiers to encode maturity into the price identifier. However, when I spoke to Matt recently, I understand that there are upcoming DVM upgrades that'd enable passing in additional state so as to not create price identifier bloat, or in this case, recreating one every time there is a new future.

5. Are there any concerns around if the price identifier implementation is deterministic?

No.
