## Title

baskPRICE-1221 Calculation

## Summary

BASK is BasketDAO governance token. This calculation is intended to track the BASK token price quoted in USD. The recommended method to query pricing data is to use CoinGecko API service, but this document will detail the calculation method so that it could be reproduced if CoinGecko was either not available or returning incorrect results.

## Intended Ancillary Data

Metric:BASK price quoted in USD,
Endpoint:"https://api.coingecko.com/api/v3/coins/ethereum/contract/0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb/market_chart/range?vs_currency=usd&from=1638288000&to=1640966400",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/baskprice-1221.md",
Key:prices[i][1] where prices[i][0] are the timestamps within the requested period in milliseconds,
Interval:hourly,
Aggregation:Peak value of minimum rolling 24-hour BASK price starting from 1638288000 timestamp,
Rounding:2

## Implementation

1. Fetch BASK token (contract address `0x44564d0bd94343f72e3c8a0d22308b7fa71db0bb` on Ethereum mainnet) USD price time series from the provided CoinGecko API endpoint for the 1 month period ending at request timestamp.
2. For each available BASK price data-point (Step 1) take the minimum value of any price that falls within last 24 hours before the respective timestamp.
3. Find the peak value of minimum rolling 24 hour BASK prices from Step 2 during the 1 month period before the request timestamp.
4. Round the peak value from Step 3 to 2 decimals before returning it as resolved price request.

Even though this implementation is based on CoinGecko pricing data, voters should verify that results agree with broad market consensus. In case CoinGecko data is not available or is considered corrupt, voters should independently calculate historical BASK prices following BASKUSD price identifier implementation from [UMIP-110](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-110.md).
