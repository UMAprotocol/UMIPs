## Title

Calculation of borrowed MAI from QiDao vaults

## Summary

QiDao allows to borrow MAI stablecoin (pegged to $1) at 0% interest by locking collateral in vault contracts. The payout from these KPI options depends on the total amount of MAI stablecoin borrowed from vaults, thereby giving every recipient an incentive to grow the protocol.

This document will detail the calculation method for the amount of borrowed MAI through vaults across all supported chains at the request timestamp.

## Intended Ancillary Data

```
Metric:Amount of outstanding MAI debt in QiDao vaults,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/qi-dao-mai-debt.md",
Interval:latest block before price request,
Rounding:2
```

## Implementation

Total borrowed MAI in QiDao vaults is determined by fetching on-chain event data from all deployed vault contracts. Each supported collateral has its own distinct vault contract that should be monitored across supported chains. As of time of authorship of this document Polygon, Fantom and Avalanche chains are supported by QiDao, but this could be extended to other chains in the future.

### Event log method

1. Voters should identify all listed Vault contracts across all supported chains as listed in [MAI Finance documentation](https://docs.mai.finance/functions/smart-contract-addresses).
2. For each identified Vault contract from Step 1 fetch all emitted `BorrowToken`, `PayBackToken` and `BuyRiskyVault` events emitted till the last available block relative to the request timestamp.
3. Add up all `amount` fields from all `BorrowToken` events from Step 2 and scale down by 18 decimals. This represents the gross MAI token amount borrowed from vaults till request timestamp.
4. Add up all `amount` fields from all `PayBackToken` events from Step 2 and scale down by 18 decimals. This represents the gross MAI token amount repaid back to vaults till request timestamp.
5. Add up all `amountPaid` fields from all `BuyRiskyVault` events from Step 2 and scale down by 18 decimals. This represents the gross amount of burned MAI tokens as a result of liquidated debt positions in vaults till request timestamp.
6. Subtract gross repaid MAI debt (Step 4) and liquidated debt (Step 5) from gross borrowed MAI (Step 3) to obtain net outstanding MAI debt in QiDao vaults.

### Subgraph method

It is acknowledged that above instructions might require significant effort to fetch event logs for all contracts across all supported chains especially considering that some of RPC endpoint providers limit the amount of event logs that can be fetched in one request for alternative chains. Hence, it could be more efficient to use indexing services (e.g. The Graph Protocol) for voters to verify total amount of borrowed MAI. At the time of authorship of this document MAI Finance have set up subgraphs for all vaults on Polygon chain. Once the subgraphs are available for all supported chains this could become the primary method for calculating the amount of borrowed MAI tokens.

1. Identify subgraph API endpoints for all QiDao vaults across all supported chains (TBD once provided by MAI Finance).
2. Construct subgraph query by making sure that `number` parameter in the `block` object corresponds to the latest available block number relative to price request timestamp, e.g.:
   ```
   {
     protocols(first: 1, block: {number: 21215934}) {
       totalBorrowed
     }
   }
   ```
3. Perform `POST` request on each of API endpoints identified in Step 1. As an illustration, `curl` request for the MATIC Vault on Polygon would look like:
   ```
   curl -X POST \
     -d '{"query": "{protocols(first: 1, block: {number: 21215934}) {totalBorrowed}}"}' \
     'https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-mai-finance-og'
   ```
4. Take a note on the raw borrowed MAI (`totalBorrowed` key value) from the returned subgraph response for each vault API endpoint and scale it down by 18 decimals.
5. Add up all outstanding MAI debt amounts in all vaults across all chains from Step 4.

## Post processing

Since QiDao has opted to provide minimum guaranteed payout of 1 Qi per KPI options token and currently the audited financial product libraries do not allow setting minimum payout floor above zero voters should perform post-processing on the borrowed MAI and return a value between 1 and 2 to the submitted price request:

1. Divide resolved MAI debt amount with maximum threshold of 7,500,000,000 MAI and add 1 to this ratio.
2. In case the MAI debt exceeds 7,500,000,000 MAI the resolved price should be capped at 2.
3. Round the resolved Qi payout above to 2 decimals before returning it as resolved price request.

## Intended Application

It is intended to deploy the documented KPI options on Polygon chain using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 2.

`collateralPerPair` parameter for the LSP contract would be set to 2 so that the maximum payout per KPI option would reach 2 Qi if the outstanding vault debt is at or above 7,500,000,000 MAI.
