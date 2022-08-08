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
ChainName:<CHAIN_NAME>,
RequestTimestampOverride:<REQUEST_TIMESTAMP_OVERRIDE>,
AggregationPeriod:<AGGREGATION_PERIOD>,
AggregationMethod:<AGGREGATION_METHOD>,
PostProcessingMethod:<POST_PROCESSING_METHOD>,
PostProcessingParameters:<POST_PROCESSING_PARAMETERS>,
RawRounding:<RAW_ROUNDING_DECIMALS>,
Scaling:<SCALING>,
Rounding:<ROUNDING_DECIMALS>,
ReturnFrom:<RETURN_FROM>
```

***Note 1:** `ChainName`, `RequestTimestampOverride`, `RawRounding`, `Scaling`, `Rounding` and `ReturnFrom` are optional parameters.*

***Note 2:** `AggregationPeriod` and `AggregationMethod` are optional parameters, though if either of them is provided the other one must be present as well.*

***Note 3:** `PostProcessingMethod` and `PostProcessingParameters` are optional parameters, though if either of them is provided the other one must be present as well.*

Variables enclosed in angle brackets above are place-holders to be completed upon contract deployment based on the tracked project and its calculation parameters:

- `<PROJECT_NAME>`: Canonical name of the project whose TVL is being tracked at DefiLlama.
- `<PROJECT_SLUG>`: Project slug name to be appended to DefiLlama API endpoint.
- `<CHAIN_NAME>`: Chain name if TVL should be tracked only for a selected chain.
- `<REQUEST_TIMESTAMP_OVERRIDE>`: Override value for price request timestamp.
- `<AGGREGATION_PERIOD>`: Time period in seconds for any time series data processing.
- `<AGGREGATION_METHOD>`: String choice from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) for time series data processing.
- `<POST_PROCESSING_METHOD>`: String choice from the [supported post-processing functions](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/post-processing-functions.md).
- `POST_PROCESSING_PARAMETERS`: JSON object with parameter key-value pairs to be used with the `PostProcessingMethod`.
- `<RAW_ROUNDING_DECIMALS>`: Represents `RawRounding` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on raw metric.
- `<SCALING>`: Represents `Scaling` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on raw rounded metric.
- `<ROUNDING_DECIMALS>`: Represents `Rounding` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on resolved value.
- `<RETURN_FROM>`:  Represents string choice (`rawMetric` / `timeSeries`) instructing an early return from implementation steps when [additional operation](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/metric-operations.md) should be performed on this data source.


## Implementation

1. Query `GET` method on the DefiLlama API `Endpoint` listed in ancillary data. The returned JSON object should contain `tvl` array that consists of time series data objects with below listed keys. If `ChainName` parameter was passed in ancillary data the `tvl` array should be looked up as nested under the returned `chainTvls.<CHAIN_NAME>` object where `<CHAIN_NAME>` is replaced with the string value passed in `ChainName` parameter.
    - `date`: UNIX timestamp
    - `totalLiquidityUSD`: project TVL measured in USD for the timestamp at `date` value above
2. Determine evaluation timestamp(s) for TVL data:
    - If `RequestTimestampOverride` parameter is provided its value should be used as an override for the actual price request timestamp. Though this should always be ignored if the provided `RequestTimestampOverride` value exceeds actual price request timestamp.
    - If `AggregationPeriod` is not provided then only single TVL value should be evaluated at the latest available daily timestamp (24:00 UTC) that is at or before the effective price request timestamp.
    - If `AggregationPeriod` is provided then series of daily TVL values should be evaluated. The first evaluation timestamp is set by subtracting `AggregationPeriod` from the effective price request timestamp and identifying the closest available (at or after) daily timestamp (24:00 UTC). The last evaluation timestamp is set the same as for scenario without `AggregationPeriod` (above). All available daily timestamps (at 24:00 UTC) between the start and end evaluation (inclusive) should be evaluated.
3. Determine TVL values for all the evaluation timestamp(s) (Step 2) from the returned `tvl` array by taking `totalLiquidityUSD` value where item's `date` matches evaluation timestamp(s).
4. If due to performed [operation](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/metric-operations.md) on the metric its ancillary data has inherited `ReturnFrom` parameter the processing of this implementation should stop here and intermediate results should be passed for the processing of dependant operation:
    - If `ReturnFrom` parameter is set to `rawMetric` the obtained value of TVL from Step 3 should be paired with the latest daily query timestamp from Step 2 and passed as timestamp / metric key-value pair for the processing of dependant operation.
    - If `ReturnFrom` parameter is set to `timeSeries` the obtained array of daily evaluation timestamp / TVL key-value pairs from Step 3 should be passed for the processing of dependant operation.
5. If `AggregationMethod` is provided follow the instructions of the chosen method section from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) using the TVL time series for all the evaluation timestamps to derive single TVL value. In case the `AggregationMethod` was not provided or its string value is not supported use the last evaluated TVL data point for further processing.
6. If `RawRounding` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the raw TVL based on the value of `RawRounding` parameter and use it for further processing. Otherwise proceed with raw metric.
7. If `Scaling` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply scaling on the rounded TVL based on the value of `Scaling` parameter and use it for further processing. Otherwise proceed with unscaled TVL.
8. If `PostProcessingMethod` is provided follow the instructions of the chosen function section from the [supported post-processing functions](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/post-processing-functions.md) using the TVL metric from Step 7 and post-processing function parameters from `PostProcessingParameters`. Otherwise proceed with TVL from Step 7.
9. Follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the processed metric based on the value of `Rounding` parameter and return the result as resolved price.

The above instructions rely on DefiLlama API `Endpoint` being accessible at the time of price resolvement. If it is not available the voters should attempt to resolve TVL values following the same calculation logic as found in [DefiLlama adapter](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects) for the project with corresponding `<PROJECT_SLUG>` name.

The voters should also be aware that [DefiLlama adapter](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects) logic can be upgraded during the lifetime of requesting contract, hence they should use their human judgement to detect and mitigate any attempted malicious adapter upgrades.
