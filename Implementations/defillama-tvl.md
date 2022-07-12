## Title

Standardized [DefiLlama](https://defillama.com/) TVL Calculation:

## Summary

This calculation is intended to track the TVL measured in USD for any project that has implemented a functioning [DefiLlama adapter](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects). This implementation should be used with the `General_KPI` price identifier.

## Intended Ancillary Data

```
Metric:<PROJECT_NAME> TVL measured in USD,
Endpoint:"https://api.llama.fi/protocol/<PROJECT_SLUG>",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/defillama-tvl.md",
Key:tvl[i].totalLiquidityUSD where tvl[i].date is the latest daily timestamp before the evaluated timestamp,
Interval:"Daily 24:00 UTC",
RequestTimestamp:<REQUEST_TIMESTAMP>,
AggregationPeriod:<AGGREGATION_PERIOD>,
AggregationMethod:<AGGREGATION_METHOD>,
PostProcessingMethod:<POST_PROCESSING_METHOD>,
PostProcessingParameters:<POST_PROCESSING_PARAMETERS>,
Rounding:<ROUNDING_DECIMALS>
```

***Note 1:** `RequestTimestamp` is optional parameter.*

***Note 2:** `AggregationPeriod` and `AggregationMethod` are optional parameters, though if either of them is provided the other one must be present as well.*

***Note 3:** `PostProcessingMethod` and `PostProcessingParameters` are optional parameters, though if either of them is provided the other one must be present as well.*

Variables enclosed in angle brackets above are place-holders to be completed upon contract deployment based on the tracked project and its calculation parameters:

- `<PROJECT_NAME>`: Canonical name of the project whose TVL is being tracked at DefiLlama.
- `<PROJECT_SLUG>`: Project slug name to be appended to DefiLlama API endpoint.
- `<REQUEST_TIMESTAMP>`: Override value for price request timestamp.
- `<AGGREGATION_PERIOD>`: Time period in seconds for any time series data processing.
- `<AGGREGATION_METHOD>`: String choice from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) for time series data processing.
- `<POST_PROCESSING_METHOD>`: URL link to the supported post-processing method.
- `POST_PROCESSING_PARAMETERS`: JSON object with parameter key-value pairs to be used within the `PostProcessingMethod`.
- `<ROUNDING_DECIMALS>`: Represents `Rounding` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md).


## Implementation

1. Query `GET` method on the DefiLlama API `Endpoint` listed in ancillary data. The returned JSON object should contain `tvl` array that consists of time series data objects with following keys:
    - `date`: UNIX timestamp
    - `totalLiquidityUSD`: project TVL measured in USD for the timestamp at `date` value above
2. Determine evaluation timestamp(s) for TVL data:
    - If `RequestTimestamp` parameter is provided its value should be used as an override for the actual price request timestamp. Though this should always be ignored if the provided `RequestTimestamp` value exceeds actual price request timestamp.
    - If `AggregationPeriod` is not provided then only single TVL value should be evaluated at the latest available daily timestamp that is at or before the effective price request timestamp.
    - If `AggregationPeriod` is provided then series of daily TVL values should be evaluated. The first evaluation timestamp is set by subtracting `AggregationPeriod` from the effective price request timestamp and identifying the closest available (at or after) daily timestamp. The last evaluation timestamp is set the same as for scenario without `AggregationPeriod` (above). All available daily timestamps between the start and end evaluation (inclusive) should be evaluated.
3. Determine TVL values for all the evaluation timestamp(s) (Step 2) from the returned `tvl` array by taking `totalLiquidityUSD` value where item's `date` matches evaluation timestamp(s).
4. If `AggregationMethod` is provided follow the instructions of the chosen method section from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) using the TVL time series for all the evaluation timestamps to derive single TVL value. In case the `AggregationMethod` was not provided or its string value is not supported use the last evaluated TVL data point for further processing.
5. If `PostProcessingMethod` is provided perform its referenced instructions using the resolved TVL metric (Step 4) and post-processing function parameters from `PostProcessingParameters`. Otherwise use the raw TVL metric.
6. Follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the processed metric based on the value of `Rounding` parameter and return the result as resolved price.

The above instructions rely on DefiLlama API `Endpoint` being accessible at the time of price resolvement. If it is not available the voters should attempt to resolve TVL values following the same calculation logic as found in [DefiLlama adapter](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects) for the project with corresponding `<PROJECT_SLUG>` name.

The voters should also be aware that [DefiLlama adapter](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects) logic can be upgraded during the lifetime of requesting contract, hence they should use their human judgement to detect and mitigate any attempted malicious adapter upgrades.
