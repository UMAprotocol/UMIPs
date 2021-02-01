## Headers
| UMIP-uVOL-DRAFT    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add uVOL-BTC-APR21 as a price identifier              |
| Authors    | Sean Brown (smb2796), Kevin Chan (kevin-uma), Tom Ibold (Tommy1231232) |
| Status     | Draft                                                                                                                                    |
| Created    | January 25, 2021   

## SUMMARY

The DVM should support price requests for the 30-day daily volatility of BTC/USD.

## MOTIVATION

The DVM currently does not support the 30-day day volatility of BTC/USD.

The volatility of Bitcoin is a major focus in the crypto and traditional finance world. Will the recent high volatility in Bitcoin continue throughout the year? Is Bitcoin too volatile to be considered a viable currency or safe haven asset? Whether volatility is considered high or low or where it will be in the future is always a debate.

In traditional finance there are several ways to express your view on the volatility of an asset. Most options traders would reflect this opinion on an asset by buying or selling options and delta hedging. This effectively neutralizes the price movement of the asset and isolates the value of the option. However, for an average trader this may be complex, costly and requires a lot of maintenance of the position. An easier way to reflect this view is through a futures contract on a volatility index. The most popular index is the VIX which is a volatility index on the S&P 500 that derives its value from a basket of index options. The centralized exchanges in the crypto world are borrowing this concept to create similar ways for users to trade the volatility of Bitcoin. For example, FTX designed BVOL tokens which use a basket of their MOVE contracts to effectively create a volatility index in a similar way. This requires a consistently deep and liquid options market which proves to be a challenge in crypto especially in the decentralized finance space.  

With the uVOL-BTC price identifier we can create a simple volatility index that can be used to create tokens with the EMP contract to speculate on the volatility of BTC/USD in a decentralized way.

## MARKETS & DATA SOURCES

- Markets: Binance, Coinbase Pro, Bitstamp
- Pairs: BTC/USD for Coinbase Pro and Bitstamp, BTC/USDT for Binance
- Live Price Endpoints

Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/btcusd/price
Binance: https://api.cryptowat.ch/markets/binance/btcusdt/price
Bitstamp: https://api.cryptowat.ch/markets/bitstamp/btcusd/price

- Update time: Every trade
- Historical Price Endpoints:

Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/btcusd/ohlc?after=1517443200&before=1517529600&periods=86400
Binance: https://api.cryptowat.ch/markets/binance/btcusdt/ohlc?after=1517443200&before=1517529600&periods=86400 
Bitstamp: https://api.cryptowat.ch/markets/bitstamp/btcusd/ohlc?after=1517443200&before=1517529600&periods=86400
Use the Open and Close price for each.

- Do these sources allow for querying up to 74 hours of historical data? Yes
- How often is the provided price updated? Prices will need to be queried on a daily basis. The examples provided query for daily OHLC candles.
- Is an API key required to query these sources? Free tier available, but API key likely necessary for bot operators.
- Is there a cost associated with usage? Yes, but there is a free tier available.
- If there is a free tier available, how many queries does it allow for? Range of 20,000-30,000.
- What would be the cost of sending 15,000 queries? Covered by the initial free tier allowance, but ~$5 after that has been used.

## PRICE FEED IMPLEMENTATION
For the creation of a BTC/USD volatility token, it is desired that the DVM return either the 30-day daily realized volatility of BTC/USD, or a 2-hour TWAP on the market price of uVOL-BTC. The type of price that the DVM will return is dependent on the timestamp the price request is made at. This timestamp is the expiry timestamp of the contract that is intended to use this price identifier, so the TWAP calculation is used pre-expiry and the 30-day daily realized volatility of BTC/USD calculation is used at expiry. This is very similar to the uGAS token and this design is outlined in [UMIP 22](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-22.md).

This pricing structure will allow for the creation of a tokenized futures contract that is collateralized at the expected price the 30-day daily realized volatility of BTC/USD price settlement, rather than the actual 30-day daily realized volatility of BTC/USD before expiry. This is important because the market price of a futures contract is based upon the expectation of the underlying price movement, rather than the current underlying price movement. Token minters should not be able to collateralize positions at a different price compared to the market price that they could sell the tokens for. This could lead to intentional and frequent under-collateralization, but is remedied by using the token’s market TWAP as the collateralization reference.

[Here](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) is a reference implementation for an off-chain price feed that calculates the TWAP of a token based on Uniswap price data. This feed should be used as a convenient way to query a realtime or historical price, but voters are encouraged to build their own off-chain price feeds.

## TECHNICAL SPECIFICATIONS
- Price Identifier Name: uVOL-BTC-APR21
- Base Currency: uVOL-BTC-APR21
- Quote currency: USDC
- Intended Collateral Currency: USDC
- Collateral Decimals: 0.000001 (6 decimals in more general trading format)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

## RATIONALE
The uVOL-BTC token is an expiring token that settles at the end of a month with the prior 30-day realized daily volatility in annualized terms. This is different from centralized and traditional volatility indices that use implied volatility of options and prices of other options like securities to derive an index of expected volatility. The use of realized volatility in this design is very similar to a [volatility swap](https://www.investopedia.com/terms/v/volatilityswap.asp) in traditional finance. We believe this will be a simple and transparent way for crypto users to trade the volatility of an asset like Bitcoin in a decentralized way. UMA token holders can easily calculate or verify the settlement price by using just their browser and a spreadsheet.

This price identifier will conditionally use a different price calculation methodology depending on the implied expiry state of the contract making the price request. This choice was made because a synthetic token, that is trading based on the future price of an underlying index, will have its price affected by expectations of the future movement of the underlying. If there is a large discrepancy in the synthetic’s price and the underlying index, arbitrageurs could take advantage of the difference in price by minting tokens at a rate determined by the underlying, abandoning their collateral to be liquidated and selling the tokens at the higher trading rate. Additionally, if a token is trading at a price that is higher than the notional value of the backing collateral, there would be no economic incentive for a liquidator to perform a liquidation.

A 2-hour TWAP was chosen to mitigate any risk of attempted price manipulation attempts on the market price of the synthetic. To meaningfully manipulate the price that token sponsors’ collateralization is calculated with, an attacker would have to manipulate the trading price of a token for an extended amount of time. This is described further in the Security Considerations section.

## IMPLEMENTATION
Voters should determine which pricing implementation to use depending on when the price request was submitted. 

**At Expiry**
If the price request's UTC timestamp is at or after 1619827200 (May 1, 2021 @ 12:00AM UTC), a price request uVOL-BTC for a given timestamp should be determined by performing the below for each data source (Coinbase Pro, Binance and Bitstamp):
1. Query the daily price of BTC/USD(T) over the past 31 days of a given timestamp starting with 1619827200.
2. Calculate the percentage change between each day over the 30-day time period independently for each market.
3. Take the standard deviation of this 30 observation data set. This can be done using a spreadsheet function such as [STDEV](https://support.google.com/docs/answer/3094054?hl=en) in Google Sheets or one can manually [calculate](https://www.investopedia.com/terms/s/standarddeviation.asp) this. The result is the standard deviation of a daily move and should be done independently for each market.
4. Multiply by the square root of 365 to annualize the result.  
5. Finally, multiply by 100 to produce the index value.
6. Take the median of the Coinbase Pro, Binance and Bitstamp results from step 5.
7. Round the median to 6 decimal places. 

An example of a hypothetical uVOL-BTC-DEC20 settle is illustrated in [this](https://docs.google.com/spreadsheets/d/1PJDithMqoCY4Y5ANPw0KPW6q8kPj2O62L8gflCkZ2OA/edit#gid=599037359) Google Sheet.

**Before Expiry**
If the price request's UTC timestamp is less than 1619827200 (May 1, 2021 @ 12:00AM UTC), voters will need to calculate a 2-hour TWAP for the uVOL-BTC-APR21 token's price in USDC. The following process should be used to calculate the TWAP.
1. The end TWAP timestamp equals the price request timestamp.
2. The start TWAP timestamp is defined by the end TWAP timestamp minus the TWAP period (2 hours in this case).
3. A single Uniswap price is defined for each timestamp as the price that the uVOL-BTC-APR21 / USDC pool returns in the latest block where the block timestamp is <= the price request timestamp.
4. The TWAP is an average of the prices for each timestamp between the start and end timestamps. Each price in this average will get an equal weight.
5. The final price should be returned with the synthetic token as the denominator of the price pair and should be rounded to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

## Security Considerations
Security considerations are focused on the use of the token price for monitoring collateral ratios.
- Token price manipulation - Under illiquid market conditions, an attacker could attempt to drive prices down to withdraw more collateral than normally allowed or drive prices up to trigger liquidations. However, it is important to note that almost all attacks that have been performed on DeFi projects are executed with flash loans, which allows the attacker to obtain leverage and instantaneously manipulate a price and extract collateral. Additionally, flash loans will have no effect on a tradable token price because the TWAP calculation is measured based on the price at the end of each block. Collateralization based off of a TWAP should make these attacks ineffective and would require attackers to use significantly more capital and take more risk to exploit any vulnerabilities.
- Mismatch between TWAP and gap higher in token price - An aggressive gap higher in the token price accompanied by real buying and then a follow through rally could create a concern. In this scenario we could see the TWAP of the token significantly lag the actual market price and create an opportunity for sponsors to mint tokens with less collateral than what they can sell them from in the market. It is important to note that this is an edge case scenario either driven by an irrational change in market expectations - as the 30-day realized daily volatility of BTC/USD should be slow moving by design - or it can be driven by a “fat finger” mistake which is a vulnerability to any market. Even in this edge case we believe the design of the token and the parameters chosen should mitigate risks. The current Expiring Multi Party (EMP) contract requires sponsors to mint tokens with enough collateral to meet the Global Collateral Ratio (GCR) which has stood well above 200% for other contracts. Therefore, assuming the GCR is similar for uVOL-BTC, the market would need to first rally at least 100% before potentially being exposed. If the sponsor wishes to withdraw collateral below the GCR they would request a “slow withdrawal” which would subject him to a 2 hour “liveness period” where anybody can liquidate the position if it fell below the required collateral ratio. The combination of the GCR and 2 hour “liveness period” allows the 2 hour TWAP to “catch up” to the market price and would protect from this scenario and deter sponsors from attempting to exploit it.

Security considerations, like the ones above, have been contemplated and addressed, but there is potential for security holes to emerge due to the novelty of this price identifier.

Additionally, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Contract deployers should also ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier or editing its implementation if security holes are identified.
