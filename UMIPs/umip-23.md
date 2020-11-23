## Headers
 - UMIP 23
 - Title: Add TVL_ALL, TVL_AAVE and TVL_SUSHI_UNI_RATIO as a price a identifiers
 - Author:  Bryan Campbell (bryanjcampbell1@gmail.com)
 - Status: Draft
 - Created: November, 15, 2020


## Summary
The DVM should support price requests for the following Total Value Locked in USD (TVL) derivatives:

1) Sum of TVL for all projects on DeFi Pulse divided by 1,000,000,000
2) TVL of Aave divided by 100,000,000
3) 10 USD multiplied by the ratio of TVL of Sushi Swap over Uniswap



## Motivation

The DVM currently does not support the previously mentioned price indices.
Adding TVL identifiers enables the creation of synthetic assets with a price that tracks the actual use of a DeFi protocol.  This stands in sharp contrast to the wild price swings DeFi governance tokens that are often uncorrelated to the use of the protocol.
The SUSHI/UNI ratio derivative is unique in that it tracks the relative health of two protocols.  


## Technical Specification

Identifier name: TVL_ALL
Quote Currency: USD

Identifier name: TVL_AAVE
Quote Currency: USD

Identifier name: TVL_SUSHI_UNI_RATIO
Quote Currency: USD

Source: https://data.defipulse.com/
Result Processing: Median
Input Processing: None. Human intervention in extreme circumstances where the result differs from broad consensus.
Price Steps: 0.0001 
Rounding: Closest, 0.0001 up
Decimal: 6 (1e6)
Pricing Interval: 60 seconds
Dispute timestamp rounding: down 
  

## Rationale

Price of DeFi Pulse API is free at Trial level and 95 USD for the Starter level.
It would require 200 GET requests per month in order to use up the credits offered at the Trial level.
At the time of writing, DeFi Pulse’s metrics are the most popular for measuring a project’s TVL. 

## Implementation (TVL_ALL)

1) Sign up for the free Trial account from https://data.defipulse.com/
2) Call the API with https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?period=1w&api-key=********

The response object is an array of TVL values at hourly increments over the past week.

3) Find the object in the response array that corresponds to timestamp equal to time the synthetic token expired
4) The value at the key “tvlUSD” is the TVL in USD that we want
5) Divide the value found at step 4 by 1,000,000,000 to get the settlement value of the TVL_ALL price identifier

## Implementation (TVL_AAVE)
1) Sign up for the free Trial account from https://data.defipulse.com/
2)Call the API with https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=aave&period=1w&api-key=********

The response object is an array of TVL values at hourly increments over the past week.

3) Find the object in the response array that corresponds to timestamp equal to time the synthetic token expired
4) The value at the key “tvlUSD” is the TVL in USD that we want
5) Divide the value found at step 4 by 100,000,000 to get the settlement value of the TVL_AAVE price identifier

## Implementation (TVL_SUSHI_UNI_RATIO)
Repeat steps 1 through 4 in the TVL_AAVE implementation with “sushiswap” in place of “aave” in the GET request. Again, repeat steps 1 through 4 in the TVL_AAVE implementation with “uniswap” in place of “aave” in the GET request. 
 
Divide the sushiswap TVL by the uniswapTVL and multiply by 10 USD to get the settlement value of the TVL_SUSHI_UNI_RATIO price identifier

## Implementation (TVL_ALL)

1) Sign up for the free Trial account from https://data.defipulse.com/
2) Call the API with https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?period=1w&api-key=********

The response object is an array of TVL values at hourly increments over the past week.

3) Find the object in the response array that corresponds to timestamp equal to time the synthetic token expired
4) The value at the key “tvlUSD” is the TVL in USD that we want
5) Divide the value found at step 4 by 1,000,000,000 to get the settlement value of the TVL_ALL price identifier

## Manual Calculation of TVL 

In the unfortunate scenario that Defi Pulse data is down UMA holders can perform a manual calculation of TVL via the following

1) Call balanceOf on every ERC20 supported by the platform in question
2) Find the ETH value for each token as specified by the coingecko API
3) Multiply 1&2 for each token
4) Sum over all erc20 token types to get the TVL in ETH for all erc20 tokens
5) Add the platform’s ETH balance to the result of step 4
6) Use the ETH/USD value from coingecko to convert TVL in ETH to USD 
7) Every number in the above calculation should be rounded to 6 decimal places to ensure the community arrives at the same value to the decimal. 


## Security Considerations

There are concerns around using DeFi Pulse data as the sole source for determining price feeds.  At the time of writing, DeFi Pulse is the only convenient API available to access this metric.  In the worst case scenario, that Defi Pulse data is down, UMA holders can perform a manual calculation, as described above.


