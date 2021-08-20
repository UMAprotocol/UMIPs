## Title

bdiFLIP-1221 Calculation

## Summary

BasketDAO DeFi Index (BDI) token provides diversified exposure to DeFi blue chips, and it is aimed at the long term passive investor as a safe set-and-forget investment. This calculation is intended to track the market capitalization of BDI relative to DeFiPulse Index (DPI) that is a market capitalization-weighted index which consists of the 10 most popular Ethereum-based DeFi tokens.

The recommended method to query market capitalization data is to use CoinGecko API service, but this document will detail the relative market capitalization calculation so that it could be reproduced if CoinGecko was either not available or returning incorrect results.

## Intended Ancillary Data

Metric:Market capitalization of BDI minus DPI market capitalization,
Endpoint:"https://api.coingecko.com/api/v3/coins/ethereum/contract/0x0309c98b1bffa350bcb3f9fb9780970ca32a5060/market_chart/range?vs_currency=usd&from=1638288000&to=1640966400 for BDI and https://api.coingecko.com/api/v3/coins/ethereum/contract/0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b/market_chart/range?vs_currency=usd&from=1638288000&to=1640966400 for DPI",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/bdiflip-1221.md",
Key:market_caps[i][1] where market_caps[i][0] are the timestamps within the requested period in milliseconds,
Interval:hourly,
Aggregation:Peak value of minimum rolling 24-hour difference (BDI-DPI) starting from 1638288000 timestamp,
Rounding:0

## Implementation

1. Fetch BDI token (contract address `0x0309c98b1bffa350bcb3f9fb9780970ca32a5060` on Ethereum mainnet) market capitalization time series from the provided CoinGecko API endpoint for the 1 month period ending at request timestamp.
2. Fetch DPI token (contract address `0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b` on Ethereum mainnet) market capitalization time series from the provided CoinGecko API endpoint for the 1 month period ending at request timestamp.
3. For each returned response timestamp from BDI request find the latest available DPI timestamp data-point and calculate the difference by subtracting DPI market capitalization (Step 2) from BDI market capitalization (Step 1).
4. For each available BDI data-point take the minimum value of any BDI-DPI market capitalization difference (Step 3) that falls within last 24 hours before the respective timestamp.
5. Find the peak value of minimum 24 hour BDI-DPI market capitalization differences from Step 4 during the 1 month period before the request timestamp.
6. In case the peak value from Step 5 is positive (i.e. BDI has sustained dominance of its market capitalization relative to DPI during any continuous 24 hour period of last month) voters should resolve the value of 1 to the price request. If this condition is not achieved voters should resolve the price request to 0.

Even though this implementation is based on CoinGecko pricing data, voters should verify that results agree with broad market consensus. In case CoinGecko data is not available or is considered corrupt, voters should independently calculate BDI and DPI market capitalization for each hourly period during the last month from the price request. Market capitalization should be calculated by multiplying token price with respective historical tokens outstanding. Note that access to archive node would be required to make `totalSupply()` requests on historical state. Token pricing should be calculated as median from 3 (if available) most liquid markets for BDI and DPI.
