## Headers
 - UMIP 70
 - Title: Add AAVE_TVL, COMPOUND_TVL, SUSHISWAP_TVL, UNISWAP_TVL, BADGER_TVL, DODO_TVL, BZX_TVL, OPIUM_TVL, and PIEDAO_TVL as supported price identifiers
 - Author:  Bryan Campbell (bryanjcampbell1@gmail.com)
 - Status: DRAFT
 - Created: March, 22, 2021


## Summary
The DVM should support price requests for the following Total Value Locked (TVL) derivatives:

1) Aave TVL divided by 1,000,000,000
2) Compound TVL divided by 1,000,000,000
3) SushiSwap TVL divided by 1,000,000,000
4) Uniswap TVL divided 1,000,000,000
5) Badger DAO TVL divided 1,000,000,000
6) Dodo TVL divided 1,000,000,000
7) bZx TVL divided 1,000,000,000
8) Tornado Cash TVL divided 1,000,000,000
9) Opium Network TVL divided 1,000,000,000
10) PieDAO TVL divided 1,000,000,000


## Motivation

The DVM currently does not support the previously mentioned price indices.
Adding project specific TVL identifiers enables the creation of synthetic assets with a price that tracks the actual use of a DeFi protocol.  


## Technical Specification

### PLACEHOLDER_TVL
- Quote Currency: USD
- Source: https://data.defipulse.com/
- Result Processing: None
- Input Processing: None. Human intervention in extreme circumstances where the result differs from broad consensus.
- Rounding: Round to nearest 3 decimal places (fourth decimal place digit >= 5 rounds up and < 5 rounds down)
- Intended Collateral Type: USDC
- Scaling Decimals: 18 (1e18)
- Pricing Interval: 60 minutes
- Dispute timestamp rounding: down 


## Rationale

Price of DeFi Pulse API is free at Trial level and 95 USD for the Starter level.
It would require 200 GET requests per month in order to use up the credits offered at the Trial level.
At the time of writing, DeFi Pulse’s metrics are the most popular for measuring a project’s TVL. 


## Implementation

The following procedure uses DeFi Pulse Data API and can be utilized to determine the value of any of the price identifiers listed in the title of this UMIP.  To avoid unnecessary repition, "PLACEHOLDER_TVL" and "placeholder" are stand ins for the price id and name of the abovementioned projects. 

API docs can be found at https://docs.defipulse.com/api-docs-by-provider/defi-pulse-data/total-value-locked/total-value-locked


1) Sign up for the free Trial account from https://data.defipulse.com/
2) Call the API with https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=placeholderp&period=1w&api-key=********

The response object is an array of TVL values at hourly increments over the past week.

3) Find the object in the response array that corresponds to timestamp equal to time the synthetic token expired
4) The value at the key “tvlUSD” is the TVL that we want
5) Divide the value found at step 4 by 1,000,000,000 to get the settlement value of the PLACEHOLDER_TVL price identifier


## ## Backup Calculation

In the case that the the value from DeFi Pulse for any project at expiration is determined to differ from broad market consensus, the following are examples of how voters could arrive at a backup measurement.

1) Use Historical TVL values from the defillama API. Docs can be found at https://0xngmi.gitbook.io/defillama/api
2) Use TVL values from individual project's subgraphs


## Security Considerations

There are concerns around using DeFi Pulse data as the primary source for determining price feeds. 

1) DeFi Pulse alone is not decentralized enough
2) DeFi Pulse is not fully transparent in how they calculate TVL
3) DeFi Pulse is fairly arbitrarily choosing what platforms to include in their calculation      

If DeFi Pulse suspends their api service a new price feed source will have to be determined.  DeFi Llama offers a free and completely open API with historical values for TVL.  This is an excellent secondary option.

There are likely some security considerations around using a price feed that is available with an hourly granularity. Contract creators should likely specify longer liquidation and withdrawal liveness times to allow for prices to be accurately reported. There could be large jumps in price resulting from the 1 hour lag that could result in unexpected liquidations for token sponsors.
