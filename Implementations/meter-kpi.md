## Title

Meter KPI options

## Summary

[Meter](https://meter.io) is a native blockchain that would like to deploy a KPI option contract that pays users back for their lost funds due to a [hack](https://www.coindesk.com/business/2022/02/07/44m-stolen-in-hack-of-blockchain-infrastructure-firm-meter/). The options will have the following features:

 - If the Meter network repays users back in stablecoins the options will expire to zero. 
 - If the Meter network does not repay users back in stablecoins the options will expire based on the price of the MTRG token.

 The intention of this program is to instill confidence for the users of the chain and make an assured commitment by the Meter network to repay users in some capacity. The KPI options will be collateralised by the MTRG token.

## Rationale

There are 2 layers to this implementation: i) the definition of the repaying using stables and ii) getting the price of the MTRG price. This implementation will use have a two step settlement logic

The set up will work as follows: 

- The KPI options will be minted using the `General_KPI` identifier. 
- On deployment, the `enableEarlyExpiration` parameter will be set to `true` so that if the Meter Network publicly publishes an announcement that mentions the repaying of the hacked funds, the KPI options will expire to a value of zero. The identification of such announcement is any public account (such as Twitter, Medium, etc.) that publishes the repaying using stablecoins. The early expiry request will be resolved using the `YES_OR_NO_QUERY` from [UMIP-107](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md), If yes, the KPI options will expire. If no, the options will remain unchanged.
- If no such announcement is made, the KPI options will expire based on the price of the MTRG token, using the CoinGecko API. The token price logic will be passed through ancillary data. 

## Intended Ancillary Data

```
Metric: Meter token price measured in USD,
Aggregation:TWAP TVL for the provided time range,
<StartTWAP>:1648771200,
<EndTWAP>:1651363200,
Rounding:2
q: Did the Meter network repay back the hacked funds? The answer is valid if any public medium publishes the repaying using stablecoins from the Meter network. If the answer is YES, the contract will expire early. If no, the contract will remain live. p1:1 and p2:0
```

## Implementation
1. Voters should first determine if this is an "early expiration" price request - this can be designated in ancillary data by identifying that there is a key:value pair of earlyExpiration:1 present. If this is an "early expiration" price request, voters should resolve it as if the requested price identifier was YES_OR_NO_QUERY following instructions from UMIP-107 and no further post-processing is required. If this is not an early expiration the voters should ignore parameters q, p1, p2 and proceed with instructions in following steps.
2. Determine the price evaluation range from `StartTWAP` till `EndTWAP` as UNIX timestamps passed in the ancillary data.
3. For historical pricing series, use CoinGecko API endpoint: https://api.coingecko.com/api/v3/coins/{id}/market_chart/
4. Use the following details to construct the
      * `id`: meter
      * `vs_currency`:  measurement currency, should be set to "usd";
      * `from`: start timestamp (identified in Step 1);
      * `to`: end timestamp (identified in Step 1);
    * Example API request for the token pricing: https://api.coingecko.com/api/v3/coins/meter/market_chart/range?vs_currency=usd&from=1648771200&to=16513632000x42bbfa2e77757c645eeaad1655e0911a7553efbc/market_chart/range?vs_currency=eth&from=1648771200&to=1651363200

    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] value pairs. Note that returned CoinGecko timestamps are in milliseconds;
    * In case returned pricing interval is more frequent than 1 hour voters should extend the requested time range. This is necessary to have consistent pricing results independent on when the voters are calculating them.
    * Voters should verify that obtained price results agree with broad market consensus.
5. Once obtaining the prices, find the average price for given time range.
6. Use the table in post processing to find the price and resolve the contract using the payout per KPI option.

## Post processing

Once the TWAP value has been calculated, the options will expire based on the following payout function:

The payout thresholds should be equal to or above to jump to the next level.

| **MTRG Price ($)** | **MTRG Release** | **Payout per KPI token** |
|----------------|------------------|--------------------------|
| 0              | 37,988.37        |              0.2475397765|
| 10             | 37,988.37        |             0.2475397765 |
| 15             | 25,325.58        |             0.1650265177 |
| 20             | 18,994.19        |             0.1237699208 |
| 25             | 15,195.35        |            0.09901592364 |
| 30             | 12,662.79        |            0.08251325884 |
| 35             | 10,853.82        |            0.07072565043 |
| 40             | 9,497.09         |            0.06188492784 |
| 45             | 8,441.86         |            0.05500883922 |
| 50             | 7,597.67         |            0.04950792924 |
| 55             | 6,906.98         |            0.04500725579 |

## Intended Application

It is intended to deploy the documented KPI options on Meter network using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md).