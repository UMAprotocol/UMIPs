## Title

2Pi KPI metrics calculation

## Summary

2Pi is a two sided decentralized transactional platform, connecting Fintechs with DeFi via single dAPIs. The goal of the KPI options program is to incentivize growth of multiple project metrics (TVL, market cap, number of transactions and user count) that is combined in one score. This document will detail the calculation method for getting individual KPI metrics and resolved score for the 2Pi project at the requested timestamp.

## Intended Ancillary Data

```
Metric:Combined KPI score for 2Pi,
Endpoint:"https://api.thegraph.com/subgraphs/name/gwydce/mumbai-pi",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/2pi-kpi.md",
Key:data.kpis[0].score,
Interval:request the last synced subgraph state at or before request timestamp,
Score:{"totalTVL":{"target":10000000,"weight":0.4},"marketCap":{"target":15000000,"weight":0.4},"holders":{"target":2000,"weight":0.1},"transactions":{"target":5000,"weight":0.1}},
Rounding:truncating to 6 decimals
```

***Note 1:** `Endpoint` will be updated in actual deployment once the subgraph is released for Polygon mainnet.*

***Note 2:** `Score` parameter will contain different `target` and `weight` parameters for each KPI options tranche.*


## Implementation

1. Construct subgraph query by making sure that `timestamp_lte` parameter corresponds to the price request timestamp, e.g.:
   ```
   {
     kpis(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_lte: 1643644800}) {
       id
       totalTVL
       marketCap
       holders
       transactions
       score
       timestamp
     }
   }
   ```
2. Perform `POST` request on the `Endpoint` (passed as a parameter from ancillary data) with request body from Step 1. As an illustration, `curl` request would look like:
   ```
   curl -X POST \
     -d '{"query": "{kpis(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_lte: 1643644800}) {id, totalTVL, marketCap, holders, transactions, score, timestamp}}"}' \
     'https://api.thegraph.com/subgraphs/name/gwydce/mumbai-pi'
   ```
3. Take a note on the combined KPI score metric from the returned subgraph response value corresponding to `Key` parameter from ancillary data.
4. At the time of authorship of this document the subgraph is configured to truncate the score down to 6 decimals. In case it is modified for greater precision voters should still truncate it to 6 decimals before returning it as resolved price request.

The voters should also verify that the combined KPI score is returned correctly based on the values of individual KPI components as returned by the subgraph. The values of each component target and weight should be set by parsing the JSON object passed as the `Score` parameter in the ancillary data. Actual values might change across different KPI option tranches, but as an illustration, the `Score` parameter in the Intended Ancillary Data section above would be interpreted as:

| Key          | Interpretation                                            | Target | Weight |
|--------------|-----------------------------------------------------------|--------|--------|
| totalTVL     | TVL for all 2Pi products                                  | $10MM  | 40%    |
| marketCap    | Market capitalization of 2Pi token                        | $15MM  | 40%    |
| holders      | Number of users holding 2Pi and stk2Pi tokens             | 2,000  | 10%    |
| transactions | Number of Deposit+Withdrawal transactions in 2Pi products | 5,000  | 10%    |

The value of each individual KPI component should be divided by its target multiplied by its weight. Each component should be capped at its maximum weight value so that the resulting score calculated as the sum of individual components is between 0 and 1.

## Fallback implementation

In case of technical issues with subgraph, suspected manipulation or when its not being synchronized for longer than 24 hours before the request timestamp voters should attempt to resolve the request by querying individual KPI components on-chain and aggregating the score based on the logic behind subgraph [source code implementation](https://github.com/2pinetwork/subgraphs).

Voters should take a note on the canonical list of 2Pi project contracts in the [documentation](https://docs.2pi.network/) once they are deployed on Polygon mainnet.

Note that the 2Pi is evolving project and at the time of price request it could have additional products that are not explicitly covered by the fallback methodology outlined below. In any case voters should watch for any 2Pi project updates and amendments in subgraph [source code](https://github.com/2pinetwork/subgraphs) and consider them as long as they align with the general spirit of this aggregated KPI metrics score calculation. Though the general score components, target values and their weights should be immutable over the life time of deployed KPI options.

### TVL

TVL covers 2Pi tokens held by the stk2Pi staking contract and tokens staked through Archimedes staking contract.

Amount of 2Pi tokens in the stk2Pi staking contract can be fetched by calling `balanceOf` method on 2Pi contract with stk2Pi address in the argument at the latest available block at or before the request timestamp. The result should be scaled down to 18 decimals.

In order to determine tokens staked through Archimedes one should first call `poolLength` method on the Archimedes staking contract to get number of pools available. Raw amount staked can be fetched by calling `balance` method (iterating through all pools starting from 0) on the Archimedes staking contract at the latest available block at or before the request timestamp. Pool tokens are identified by calling `poolInfo` method with pool index as argument and the first returned field is token address. Amount of tokens staked should be scaled down by each token's decimal count (calling `decimals` method on the token contract).

In order to determine USD price per staked token voters should follow the calculation logic in subgraph [source code](https://github.com/2pinetwork/subgraphs), but should check if that is consistent with broad market consensus at the price request timestamp. The obtained USD price for each token should be multiplied with amounts staked (both 2Pi in stk2Pi and tokens staked through Archimedes) and aggregated to get TVL in USD.

### Market capitalization

Market capitalization should be obtained by multiplying 2Pi token price in USD (see TVL section above) with amount of issued tokens. Amount of issued tokens is fetched calling `totalSupply` method on 2Pi contract at the latest available block at or before the request timestamp and scaled down to 18 decimals.

### Number of users

Voters should count number of unique account addresses holding either 2Pi or stk2Pi tokens with balance above 0 (except for zero address and 2Pi contract itself). This can be achieved by indexing all `Transfer` events on both contracts till the latest available block at or before the request timestamp and recalculating active user balances at the end of the period.

### Number of transactions

Voters should count total number of deposit and withdraw transactions by filtering events till the latest available block at or before the request timestamp:
* `Deposit` and `Withdraw` events emitted by the stk2Pi staking contract;
* `Deposit`, `Withdraw` and `EmergencyWithdraw` events emitted by the Archimedes staking contract.

## Intended Application

It is intended to deploy the documented KPI options on Polygon chain using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 1.

