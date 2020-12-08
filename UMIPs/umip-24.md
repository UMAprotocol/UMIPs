## Headers
 - UMIP 24
 - Title: Add DeFiPulseTVL_ALL and TVL_SUSHI_UNI_RATIO as supported price identifiers
 - Author:  Bryan Campbell (bryanjcampbell1@gmail.com)
 - Status: Draft
 - Created: November, 15, 2020


## Summary
The DVM should support price requests for the following Total Value Locked in USD (TVL) derivatives:

1) Sum of TVL for all projects on DeFi Pulse divided by 1,000,000,000
2) 10 USD multiplied by the ratio of TVL of Sushi Swap over Uniswap



## Motivation

The DVM currently does not support the previously mentioned price indices.
Adding TVL identifiers enables the creation of synthetic assets with a price that tracks the actual use of a DeFi protocol.  This stands in sharp contrast to the wild price swings DeFi governance tokens that are often uncorrelated to the use of the protocol.  The SUSHI/UNI ratio derivative is unique in that it tracks the relative health of two protocols.  


## Technical Specification

Identifier name: DeFiPulseTVL_ALL
Quote Currency: USD

Identifier name: TVL_SUSHI_UNI_RATIO
Quote Currency: USD

Source: https://data.defipulse.com/
Result Processing: None
Input Processing: None. Human intervention in extreme circumstances where the result differs from broad consensus.
Price Steps: 0.0001 
Rounding: Closest, 0.5 up
Decimal: 6 (1e6)
Pricing Interval: 60 seconds
Dispute timestamp rounding: down 


## Rationale

Price of DeFi Pulse API is free at Trial level and 95 USD for the Starter level.
It would require 200 GET requests per month in order to use up the credits offered at the Trial level.
At the time of writing, DeFi Pulse’s metrics are the most popular for measuring a project’s TVL. 

## Implementation (DeFiPulseTVL_ALL)

1) Sign up for the free Trial account from https://data.defipulse.com/
2) Call the API with https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?period=1w&api-key=********

The response object is an array of TVL values at hourly increments over the past week.

3) Find the object in the response array with a timestamp that is nearest, but not earlier than, the price request timestamp.

4) The value at the key “tvlUSD” is the TVL in USD that we want
5) Divide the value found at step 4 by 1,000,000,000 to get the settlement value of the DeFiPulseTVL_ALL price identifier


## Implementation (TVL_SUSHI_UNI_RATIO)
1) Sign up for the free Trial account from https://data.defipulse.com/
2) Call the API with https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=sushiswap&period=1w&api-key=********

The response object is an array of TVL values at hourly increments over the past week.

3) Find the object in the response array that corresponds to timestamp equal to time the synthetic token expired
4) The value at the key “tvlUSD” is the TVL in USD that we want
5) Repeat steps 1 through 4 with “uniswap” in place of “sushiswap” in the GET request
6) Divide the sushiswap TVL by the uniswapTVL and multiply by 10 USD to get the settlement value of the TVL_SUSHI_UNI_RATIO price identifier

At current TVL values, Uniswap has a higher TVL than SushiSwap.  The scale factor of 10 USD is used to keep the value of TVL_SUSHI_UNI_RATIO above 1 USD while  still being directly proportional to the ratio of TVL between the protocols.
 

## Backup Calculation of DeFiPulseTVL_ALL 


In the case that the the value from DeFi Pulse for DeFiPulseTVL_ALL at expiration is determined to differ from broad market consensus, the following is an example of how voters could arrive at a backup measurement of DeFiPulseTVL_ALL.


1) Gather all DeFiPulseTVL_ALL values from timestamps corresponding to the day the synthetic token expires
2) Determine which values are contentious off chain 
3) Remove contentious values 
4) Average the remaining values to get the settlement value 

## Backup Calculation of TVL_SUSHI_UNI_RATIO

In the case that the the values from DeFi Pulse for SushiSwap or Uniswap are determined to differ from broad market consensus, the following is an example of how votors could arrive at a backup measurement of TVL_SUSHI_UNI_RATIO.

Note: The following procedure uses a daily value of TVL as opposed to an hourly value

1) Go to the Uniswap Subgraph, https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
2)  Determine Id corresponding to the day that the synthetic token expires using the following
    
    ID = (unix timestamp for start of day) / 86400 
    
3) Run the following query, replacing ID with the number you found in step 2, to get the TVL of Uniswap

    {
        uniswapDayData(id:ID) 
        {
            totalLiquidityUSD
        }
    }
    
4) Go to the Sushiswap Subgraph, https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-exchange
5) Run the following query, replacing ID with the number you found in step 2, to get the TVL of Sushiswap
    
    {
        dayData(id:ID) 
        {
            liquidityUSD
        }
    }

6) Divide the value from step 5 by the value at step 3 and multiply by 10 USD to get the settlement value of the TVL_SUSHI_UNI_RATIO price identifier



## Security Considerations

There are concerns around using DeFi Pulse data as the primary source for determining price feeds. 

1) DeFi Pulse alone is not decentralized enough
2) DeFi Pulse is not fully transparent in how they calculate TVL
3) DeFi Pulse is fairly arbitrarily choosing what platforms to include in their calculation      

In the future it may be beneficial for the UMA community to develop our own, more transparent and decentralized calculation of TVL.

On the other hand, DeFi Pulse's TVL metric is so commonly referenced in larger crypto community that, for many, their metric defines TVL.  For that reason, even if we do decide to develop our own TVL All metric, the market may still see the need for a DeFiPulseTVL_ALL derivative that tokenizes DeFi Pulse's calculations. 

If DeFi Pulse suspends their api service a new price feed source will have to be determined.  The Graph and Dune Analytics offer alternatives for independent measurements.  Taking a median value was considered but due to the lack of standardization of the metric, values between DeFi Pulse, Graph, and Dune were often more than an order of magnitude apart. Appropriate scaling could be applied in the future with the development of a UMA community TVL metric.

There are likely some security considerations around using a price feed that is available with an hourly granularity. Contract creators should likely specify longer liquidation and withdrawal liveness times to allow for prices to be accurately reported. There could be large jumps in price resulting from the 1 hour lag that could result in unexpected liquidations for token sponsors.
