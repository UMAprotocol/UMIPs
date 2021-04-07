# Headers

| UMIP-74 | |
|---------|-|
| UMIP Title | Add ethVIX & iethVIX as price identifiers |
| Authors | dVIX Developers |
| Status | Last Call |
| Created | 03.31.2021 |
| Discourse | [Link](https://discourse.umaproject.org/t/add-ethvix-and-iethvix-price-identifiers/680) |


# Summary

ethVIX is a real-time index representing the expected volatility for ETH over the coming 14 days. iethVIX is the inverse of the ethVIX. When ethVIX moves up, iethVIX moves down by an equivalent percentage, and vice versa.

# Motivation

ethVIX and iethVIX allow for the trading of model-free expected volatility of ETH. ethVIX is best understood as a long volatility position while iethVIX is a short volatility position. The ethVIX index is very similar to the Cboe VIX which tracks the expected volatility of the S&P 500. By trading ethVIX or iethVIX traders can take long or short positions against volatility, either as a speculative trade itself or a hedge for other speculative trades.

Here are some examples of how traders might use ethVIX and iethVIX:
- In early March of 2020, 0xAlice believes that the global pandemic will greatly affect the price of ETH but she’s not sure if it will drop like the stock market or go up as a safe haven asset. She buys ethVIX for roughly 80 USDC per token. On Black Thursday (March 12th, 2020), the price of ETH drops significantly and the price of ethVIX moves to around 280 USDC. At expiration, 0xAlice redeems her ethVIX tokens while the price feed is still over 200 USDC.

- In March of 2021, the price of ETH goes up quickly in a bull market. This volatility causes ethVIX to rise to roughly 120 USDC. iethVIX drops inversely to 80 USDC. 0xCarol believes that the price of ETH will soon stabilize. She buys iethVIX at roughly 90 USDC on March 12. At expiry on March 19 the price feed has moved to 97.50 USDC and she redeems her tokens for that price.

# Markets & Data Sources

1. What markets should the price be queried from? It is recommended to have at least 3 markets.

    Currently ethVIX & iethVIX price feeds are derived Deribit ETH options data. Deribit currently consists of roughly 80- 90% of all ETH options volume. As decentralized options protocols become more robust, dVIX will create amended UMIPs with decentralized data sources. Currently, here is where the price feeds should be queried:

    - dVIX Protocol’s ethVIX & iethVIX price feeds
    - dVIX Protocol’s public website
    - dVIX Protocol’s IPFS log
    - Deribit ETH Options data

1. Which specific pairs should be queried from each market?

    - The dVIX API aggregates all options data that is needed for the calculation.
    - dVIX Protocol’s IPFS log provides a backup copy of this data.
    - For Deribit Options data, users need the bid/ask/mark/strike for the near term and next term ETH options.
      - Near Term - The expiry 5-13 days from current time.
      - Next Term- The expiry 15-23 days from current time.

1. Provide recommended endpoints to query for real-time prices from each market listed.

    These should match the data sources used in "Price Feed Implementation".

    - https://dvix.io/api/latest?asset=ETH

      Note: This endpoint provides a JSON response including the latest ethVIX (field: vix) and iethVIX (field: iVix) price along with the full options chain and other data points used in the calculation.

    - https://dvix.io/rawData

      Note: This webpage provides the exact same data as the API endpoint listed above. The content is formatted in a way intended to make validation easy for non-technical individuals.

1. How often is the provided price updated?

    - At most once every Ethereum block.
    - At least once every 15 minutes.

1. Provide recommended endpoints to query for historical prices from each market listed.

    - https://dvix.io/api/historicalData?asset=ETH

      Note: This endpoint does not provide the full options chain data. By default, the last 7 days of data will be provided.

1. Do these sources allow for querying up to 74 hours of historical data?

    Yes, the historicalData API endpoint provides the latest 7 days of history. However, it only provides the index prices. It does not provide the full options chains made available by the real-time price feed.

1. How often is the provided price updated?

    - At most once every Ethereum block.
    - At least once every 15 minutes.

1. Is an API key required to query these sources?

    No.

1. Is there a cost associated with usage?

    No.

1. If there is a free tier available, how many queries does it allow for?

    N/A

1. What would be the cost of sending 15,000 queries?

    N/A

# PRICE FEED IMPLEMENTATION

Please provide a link to your price feed pull request.
https://github.com/UMAprotocol/protocol/pull/2792

# TECHNICAL SPECIFICATIONS

## ethVIX

1. Price Identifier Name - ethVIX
2. Base Currency - USDC
3. Quote currency - USDC
4. Intended Collateral Currency - USDC
5. Collateral Decimals - 6 Decimals
6. Rounding - ethVIX and iethVIX price feeds are rounded to 2 decimal places.

## iethVIX

1. Price Identifier Name - iethVIX
2. Base Currency - USDC
3. Quote currency - USDC
4. Intended Collateral Currency - USDC
5. Collateral Decimals - 6 Decimals
6. Rounding - ethVIX and iethVIX price feeds are rounded to 2 decimal places.

# RATIONALE

We calculate ethVIX using the same methodology that underpins the Cboe Volatility Index® (VIX® Index), the premier volatility benchmark for the U.S. stock market. Unlike other measures of volatility, the ethVIX (and VIX) use a model-free market based approach. Using a model-free approach gives the best calculation of expected future volatility.
Currently ethVIX is calculated by using out-of-the-money (OTM) call and put options from Deribit. This choice was made because Deribit’s market currently consists of roughly 80-90% of all ETH options volume.

Manipulating the bids/asks on Deribit is the main vector of attack for changing the ethVIX price. Two things help to mitigate this attack. First, placing bids/asks that are not aligned with the market can be costly to an attacker if they are filled. Second, in certain cases when bids/asks become extremely skewed from their expected market prices, the price feeds use Deribit’s mark price instead of the bid/ask.
You can learn more about the approach used to calculate ethVIX in the [methodology paper](https://dvix.io/ethVIX_methodology.pdf).

The settlement price calculation and the standard price request calculation are the same for both the ethVIX and iethVIX. The settlement price calculation is always the value of the price feeds at 06:00 UTC on the day of the contract expiration.
	
# IMPLEMENTATION

1. What prices should be queried for and from which markets?

    - dVIX protocol ethVIX & iethVIX Price Feed Interface (https://github.com/UMAprotocol/protocol/pull/2792)
    - If the above fails users can use the dVIX API or Deribit data as described herein. Please see the methodology paper for the options markets and strikes needed.

1. Pricing interval

    - Ethereum Block prior to DVM call
    - If Deribit data has been obviously manipulated then fall back to the first block where data has not been manipulated. This block is at the discretion of voters.

1. Input processing

    - None if the price feed is used.
    - If the price feed is in dispute, please see the methodology paper for how to process the inputs.

1. Result processing

    - None if the price feed is used.
    - If the price feed is in dispute, please see the methodology paper for how to calculate the result.

The dVIX ethVIX & iethVIX price feeds should be used for both the settlement request and the standard price request. These can be found at https://dvix.io/api/latest?asset=ETH or for non-technical users at https://dvix.io/rawData. The settlement price is always the price of the feeds at 06:00 UTC on the day of contract expiry. Contracts will also expire at 06:00 UTC.

In cases where users feel that the dVIX price feeds cannot be trusted, the following steps should be taken to calculate the ethVIX & iethVIX price feeds.

## Step 1 - Use historical price feed.

- Users can get 7 days of historical price feeds at https://dvix.io/api/historicalData?asset=ETH. Users need to come to consensus and use the last trusted price.

- If a historical price feed cannot become agreed upon (e.g. it was too far in the past) or the end point api is not trusted then move onto Step 2.

## Step 2 - Calculate ethVIX & iethVIX from raw data.

Note: If users feel that the real-time data is compromised (e.g. a market-making cartel attack on Deribit), this calculation should be done once the data is considered safe again.

1.  Download the [methodology paper](https://dvix.io/ethVIX_methodology.pdf)
1.  Download the [verification spreadsheet](https://dvix.io/ethVIX_verification.xlsx)
1. Access the real-time data at https://dvix.io/rawData.

    - Note: Make sure to turn Auto-Refresh off as you will want the snapshot you’re reviewing to be persisted in the interface.

    - Alternatively a user can take a screenshot of the Near and Next Options Expiry on Deribit and get the current lending rate for ETH from [Aave](https://aave.com).
    - The **Near** Options chain is the Friday 08:00 UTC expiration that is 5-13 days from current time.
    - The **Next** Options chain is the Friday 08:00 UTC expiration that is 15-23 days from current time.

1. Open the verification spreadsheet and open the tab labeled “Deribit Data.”

    Fill the Green highlighted cells with the following information:

    - Input the Strike, Bid, and Ask for the Near Term and Next Term Calls and Puts. Note that the option chain does not need to fill all green cells going down. Green cells that are not used should contain `0`.

1. Open the tab labeled “ETH 14 Day Volatility”.

    Fill in the Yellow highlighted cells with the following information:

    - `B2` - Today’s Date and Time (UTC)

      Note: This is the time the data was queried or the screenshots were taken.

    - `D2` - Near Term Options Expiry Date and Time (UTC)
    - `F2` - Next Term Options Expiry Date and Time (UTC)

    Fill in the Orange highlighted cells with the following information:

    - `E13` & `G13` - Aave’s ETH Interest Rate for Lending.
      Note: these cells should contain the same number.

    For the Purple highlighted cells you may need to change some of the formulas. You may want to reference the white paper for the following changes.

    - Notice that `E42` & `E104` in the spreadsheet were the final strikes for the sample data. If they are also the final strikes for your calculation then no change needs to be made.

    - If they are not the final strikes then you need to calculate the final strikes with the following formula: `(FinalStrike - PreviousStrike) / 2`. `E42` and `E104` use this formula and you can copy and paste it to your final delta strikes.

    - Other Delta strikes need to be calculated with the following formula: `(NextStrike - PreviousStrike) / 2`. Cells `E20`-`E41` & Cells `E84`-`E103` use this formula. Make sure that all cells besides your first and last Delta strike use this formula.

    Fill the Grey highlighted cells with the following information:

    - `E148` - The first strike price less than or equal to cell `D148` in the series `B19`-`B75`. For example, in the sample data `1280` (`B25`) is the first strike below `1329.82` (`D148`).
    - `E152` - The first strike price less than or equal to cell `D152` in the series `B83`-`B139`. For example, in the sample data `1280` (`B87`) is the first strike below `1332.04` (`D152`).

# Security considerations

Adding these new price identifiers pose certain risks:

- Currently the options chain data used is from a centralized source (i.e. Deribit).
- Manipulation can occur on Deribit’s ETH options markets. As outlined previously this is mitigated in two ways:
  - It will be expensive if the attacker’s orders are filled.
  - In cases where prices are greatly misaligned with expected market prices the price feeds use the mark price instead of the bid/ask.
- To keep a 14-day average of volatility, the calculation rolls from one options expiry to another. This can lead to price swings but may also be a vector of attack.
  - To mitigate this, we are launching weekly-expiring contracts after the next term rollover and having them expire before it occurs again.
