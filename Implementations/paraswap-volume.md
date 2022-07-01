## Title

Paraswap Volume KPI Option Calculation

## Summary

ParaSwap aggregates decentralized exchanges and other DeFi services in one comprehensive interface to streamline and facilitate users' interactions with decentralized finance on Ethereum and EVM-compatible chains. The Paraswap network wishes to incentivize increased volume to the network by offering the Paraswap community a linear option that targets an increase in trading volume.

## Intended Ancillary Data

```
Metric:Paraswap trade volume measured in USD,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/paraswap-volume.md",
StartTimestamp:<start_timestamp>,
StartTWAP:<start_timestamp>,
EndTWAP:<end_timestamp>,
Rounding:0
```

## Implementation

Subgraphs:

- https://api.thegraph.com/subgraphs/name/paraswap/paraswap-subgraph
- https://api.thegraph.com/subgraphs/name/paraswap/paraswap-subgraph-fantom
- https://api.thegraph.com/subgraphs/name/paraswap/paraswap-subgraph-avalanche
- https://api.thegraph.com/subgraphs/name/paraswap/paraswap-subgraph-bsc
- https://api.thegraph.com/subgraphs/name/paraswap/paraswap-subgraph-polygon

Paraswap wishes to track the total increase in cumulative volume over a period of time. The query that should be used is:

```
{
  swaps(first: 1000, orderBy: timestamp, orderDirection: desc, where:{timestamp_lte: timestamp.number, timestamp_gte: <StartTimestamp>}) {
    srcToken
    destToken
    srcAmount
    destAmount
    timestamp
  }
}
```

1. For each of the listed `Subgraphs` endpoints above, replace the `timestamp.number` value with the request timestamp, use `StartTimestamp` from ancillary data and run the swaps query shown above. Note: If necessary, use the skip variable `skip:1000` to iterate through a loop to query 1,000 swaps each time. Continually skip by 1,000 until all swap responses are returned.
2. From the returned results of step 1, record each returned `srcAmount`, `srcToken`, `destAmount`, `destToken` values returned.
3. Group all `srcToken` and `destToken` values returned from step 2 and sum the values of `srcAmount` and `destAmount` separately.
4. Scale down raw amounts calculated in Step 3 by each ERC-20 token contract decimals (or convert from wei for Ether).
5. For all swapped ERC-20 tokens / native token get the historical pricing series from CoinGecko for the evaluation period:
   - Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct a price API request with the following parameters:
     - `id`: CoinGecko platform id - should be set to the network according to the subgraph;
     - `contract_address`: ERC-20 token address;
     - `vs_currency`: volume measurement currency ("usd");
     - `from`: `StartTWAP` value (identified in ancillary data);
     - `to`: `EndTWAP` value (identified in ancillary data);
   - Note that for native token addresses returned from the subgraph as `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` should use a different endpoint (see [API documentation](https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__market_chart_range)). The `id` parameter for each network is:
    - Ethereum: "ethereum",
    - Polygon: "matic-network", 
    - Avalanche: "avalanche-2", 
    - BNB "binancecoin", 
    - Fantom: "fantom"
    This also might apply to some tokens that do not have their contract address registered by CoinGecko;
   - Example API request for WETH token on Polygon priced in USD: https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/market_chart/range?vs_currency=usd&from=1646092800&to=1648771200
   - Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] value pairs. Note that returned CoinGecko timestamps are in milliseconds;
   - In case returned pricing interval is more frequent than 1 hour voters should extend the requested time range. This is necessary to have consistent pricing results independent on when the voters are calculating them.
   - Voters should verify that obtained price results agree with broad market consensus.

Sum the returned token prices and divide by the number of price values. This value will be used for the average token price for swaps.

6. Multiply the values returned from steps 4 and 5.

7. Sum all returned values from step 6 and divide by 2. Round the value to 0 decimal places (e.g. 25.123 -> 25).

An example implementation script is provided [here](https://github.com/abg4/paraswap), but voters are encouraged to independently verify its calculation logic and results.

## Intended Application

It is intended to deploy the documented KPI options on Ethereum network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 1,000,000,000.

`collateralPerPair` parameter for the LSP contract would be set to 1 so that the maximum payout per KPI option would reach 1 PSP if the Paraswap network volume exceeds $1 billion.

Example 1: Paraswap achieves a cumulative volume of $250 million. The calculation would be 250,000,000 / 1,000,000,000 = 0.25 and 0.25 PSP would be allocated to the long token and 0.75 PSP would be allocated to the short token.

Example 1: Paraswap achieves a cumulative volume of $750 million. The calculation would be 750,000,000 / 1,000,000,000 = 0.75 and 0.75 PSP would be allocated to the long token and 0.25 PSP would be allocated to the short token.