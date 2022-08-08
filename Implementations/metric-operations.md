## Title

Supported operations on standartized KPI metric data sources.

## Summary

This document provides instructions on supported methods for operations on other standartized KPI metric data sources. This implementation should be used with the `General_KPI` price identifier.

## Intended Ancillary Data

This metric operations document should be used with following ancillary data parameter values some of which are optional as indicated below:

- `Metric:<DESCRIPTION>` where `<DESCRIPTION>`is short description reflecting the metric and units to be measured.
- `Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/metric-operations.md"` points to this implementation document.
- `Operation:<OPERATION>` where `<OPERATION>` represents string choice from the [supported operations](#supported-operations) from this document.
- `OperationParameters:<OPERATION_PARAMETERS>` where `OPERATION_PARAMETERS` represents JSON object with parameter key-value pairs to be used with the chosen `Operation`.
- `RequestTimestampOverride:<REQUEST_TIMESTAMP_OVERRIDE>` (optional) where  `<REQUEST_TIMESTAMP_OVERRIDE>` represents override value for price request timestamp.
- `AggregationPeriod:<AGGREGATION_PERIOD>` (optional) where `<AGGREGATION_PERIOD>` represents time period in seconds for any time series data processing. This parameter is mandatory if `AggregationMethod` was provided.
- `AggregationMethod:<AGGREGATION_METHOD>` (optional) where `<AGGREGATION_METHOD>` represents string choice from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) for time series data processing. This parameter is mandatory if `AggregationPeriod`  was provided.
- `PostProcessingMethod:<POST_PROCESSING_METHOD>` (optional) where `<POST_PROCESSING_METHOD>` represents string choice from the [supported post-processing functions](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/post-processing-functions.md). This parameter is mandatory if `PostProcessingParameters` was provided.
- `PostProcessingParameters:<POST_PROCESSING_PARAMETERS>` (optional) where `POST_PROCESSING_PARAMETERS` represents JSON object with parameter key-value pairs to be used with the `PostProcessingMethod`. This parameter is mandatory if `PostProcessingMethod` was provided.
- `RawRounding:<RAW_ROUNDING_DECIMALS>` (optional) where `<RAW_ROUNDING_DECIMALS>` represents `RawRounding` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on raw metric.
- `Scaling:<SCALING>` (optional) where `<SCALING>` represents `Scaling` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on raw rounded metric.
- `Rounding:<ROUNDING_DECIMALS>` (optional) where `<ROUNDING_DECIMALS>` represents `Rounding` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on resolved value.
- `ReturnFrom:<RETURN_FROM>` (optional) where `RETURN_FROM` represents string choice (`rawMetric` / `timeSeries`) instructing an early return from implementation steps when multiple operations are chained together.

Metric operations implementation can also include additional ancillary data parameters that can be inherited by other implementations of supported data source(s) or nested operation(s) that are being referenced within the `OperationParameters`.

## Implementation

### Off-chain storage

`metricParameters` and `metricParametersArray` elements of the `OperationParameters` parameter can also be stored off-chain using `metricParametersURL` or `metricParametersArrayURL` elements that represent URL links:

  - If `metricParametersURL` is provided verifiers should perform GET request on its string value in order to resolve its referenced JSON object to be used as if `metricParameters` was provided.
  - If `metricParametersArrayURL` is provided verifiers should perform GET request on its string value in order to resolve its referenced array of JSON objects to be used as if `metricParametersArray` was provided.

It is expected that off-chain storage of `metricParameters` or `metricParametersArray` might be used when not all implementation details of measured metric are known at the time of contract deployment. Though this introduces certain level of centralization risk that should be mitigated by requiring these to be stored on a hosting platform with full version control visibility. Verifiers should also check that the referenced values are consistent with the measured `Metric` parameter.

### Single timestamp operation

If `AggregationMethod` and `AggregationPeriod` parameters were not provided in the ancillary data the operation on the operand metrics should be performed at single daily timestamp, though the operand metrics themselves still can be calculated as aggregated metrics depending on the provided configuration. Below steps provide instructions for the case when `AggregationMethod` and `AggregationPeriod` parameters were not provided at the operation level:

1. Determine daily query timestamp for operation result data:
    - If `RequestTimestampOverride` parameter is provided its value should be used as an override for the actual price request timestamp. Though this should always be ignored if the provided `RequestTimestampOverride` value exceeds actual price request timestamp.
    - Daily query timestamp should be set to the closest 24:00 UTC timestamp at or before effective request timestamp expressed as numeric Unix timestamp.
2. Inspect `OperationParameters` value to identify its `metricParameters` or `metricParametersArray` element. Only one of these elements should be present depending on the chosen `Operation`. Value of `metricParameters` is single JSON object while value of `metricParametersArray`is an array of JSON objects containing ancillary data parameters for any directly referenced KPI metrics (or other operations) that will be used as operand(s). In addition to provided ancillary data the operand should also inherit those parameters from the dependent operation that were not provided with following exception:
    - the `ReturnFrom` parameter in the operand configuration should be set to `rawMetric`.
3. Resolve all the operand implementation(s) considering parameter inheritance rules from Step 2 as if they were separate price request(s). These should resolve to single timestamp / metric pair for each operand.
4. Proceed with instructions on the chosen `Operation` at [supported operations](#supported-operations) section passing `OperationParameters` object where its `metricParameters` element should be replaced with resolved timestamp / metric key-value pair from Step 3 or `metricParametersArray` replaced with an array of resolved timestamp / metric key-value pairs in the same order as their ancillary data parameters were provided in `metricParametersArray`.
5. If due to chained operations the ancillary data at the operation level includes `ReturnFrom` parameter set to `rawMetric` the calculated intermediary operation result from Step 4 should be paired with the daily query timestamp from Step 1 and returned as timestamp / metric key-value pair for the processing on the dependant operation. Otherwise proceed with the next steps in this implementation.
6. If `RawRounding` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the raw operation result based on the value of `RawRounding` parameter and use it for further processing. Otherwise proceed with raw metric.
7. If `Scaling` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply scaling on the rounded raw metric based on the value of `Scaling` parameter and use it for further processing. Otherwise proceed with unscaled metric.
8. If `PostProcessingMethod` is provided follow the instructions of the chosen function section from the [supported post-processing functions](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/post-processing-functions.md) using the metric from Step 7 and post-processing function parameters from `PostProcessingParameters`. Otherwise proceed with metric from Step 7.
8. Follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the processed metric based on the value of `Rounding` parameter and return the result as resolved price.

### Operation over time series

If `AggregationMethod` and `AggregationPeriod` parameters were provided in the ancillary data at the operation level the operation on the operand metrics should be performed at every daily timestamp (24:00 UTC) over the configured time period following instructions below:

1. Inspect `OperationParameters` value to identify its `metricParameters` or `metricParametersArray` element. Only one of these elements should be present depending on the chosen `Operation`. Value of `metricParameters` is single JSON object while value of `metricParametersArray`is an array of JSON objects containing ancillary data parameters for any directly referenced KPI metrics (or other operations) that will be used as operand(s). In addition to provided ancillary data the operand should also inherit those parameters from the dependent operation that were not provided with following exception:
    - `AggregationMethod` and `AggregationPeriod` parameters should always be overridden in operand(s) from the configuration at the operation level;
    - the `ReturnFrom` parameter in the operand configuration should be set to `timeSeries`.
2. Resolve all the operand implementation(s) considering parameter inheritance rules from Step 1 as if they were separate price request(s). These should resolve to an array of timestamp / metric pairs targeting the same time period for each operand (though some of data points could be missing depending on data availability).
3. Transform all time series data from Step 2 by rounding up all the timestamps to the end of day UTC except for 24:00 UTC that should be kept unmodified.
4. Transform all time series data from Step 3 to fill in any missing end of day UTC with previous available values for respective time series.
5. In case of multiple operands identify time series with the latest start timestamp and discard all elements from other time series that fall before this timestamp.
6. In case of multiple operands identify time series with the latest end timestamp and fill up missing end of day UTC with previous available values till this timestamp for all the remaining time series. As a result of Steps 5 and 6 all time series should have values for the same set of daily timestamps.
7. Depending on the number of operands:
    - In case of single operand for each resolved timestamp from Step 4 proceed with instructions on the chosen `Operation` at [supported operations](#supported-operations) section passing `OperationParameters` object where its `metricParameters` element should be replaced with the processed timestamp / metric key-value pair.
    - In case of multiple operands first group their resolved timestamp / metric key-value pairs in arrays for each of obtained timestamps from Step 6 in the same order as their ancillary data parameters were provided in `metricParametersArray`. Then for each resolved timestamp proceed with instructions on the chosen `Operation` at [supported operations](#supported-operations) section passing `OperationParameters` object where its `metricParametersArray` element should be replaced with an array of resolved timestamp / metric key-value pairs for the respective operands.
8. Match all operation results from Step 7 with their operand timestamps (these should match across all operands) to form array of timestamp / result key-value pairs.
9. If due to chained operations the ancillary data at the operation level includes `ReturnFrom` parameter set to `timeSeries` the obtained intermediary time series results from Step 8 should be returned for the processing on the dependant operation. Otherwise proceed with the next steps in this implementation.
10.  Follow the instructions of the chosen `AggregationMethod` section from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) using the operation time series from Step 9 for all the daily timestamps to derive single operation value.
11. If `RawRounding` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the raw operation result based on the value of `RawRounding` parameter and use it for further processing. Otherwise proceed with raw metric.
12. If `Scaling` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply scaling on the rounded raw metric based on the value of `Scaling` parameter and use it for further processing. Otherwise proceed with unscaled metric.
13. If `PostProcessingMethod` is provided follow the instructions of the chosen function section from the [supported post-processing functions](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/post-processing-functions.md) using the metric from  Step 12 and post-processing function parameters from `PostProcessingParameters`. Otherwise proceed with metric from Step 12.
14. Follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the processed metric based on the value of `Rounding` parameter and return the result as resolved price.

Note that not all `Operation` types support time series data (see details in [supported operations](#supported-operations) section), and when aggregation was requested on unsupported operation due to misconfiguration the verifiers should ignore `AggregationMethod` and `AggregationPeriod` parameters and proceed with instructions in the [Single timestamp operation](#single-timestamp-operation) section above. This should also be used as a fall-back mechanism if operation over time series is impossible to resolve due to missing data.

## Supported Operations

Below sections provide instructions where each of section names corresponds to the supported values for the `Operation` parameter values passed in the ancillary data. `OperationParameters` passed in the ancillary data should be a JSON object with key-value pairs representing named function parameters as detailed below. Only one of selected operations should be followed for resolving KPI metric request.

All the operations require either one of below described members of `OperationParameters`:

- `metricParameters`: JSON object containing ancillary data parameters for the operand that should should be resolved to single timestamp / metric key-value pair based on the [Implementation](#implementation) section.
- `metricParametersArray`: an array of JSON objects containing ancillary data parameters for operands that should be resolved to an array of timestamp / metric key-value pairs based on the [Implementation](#implementation) section.

### `SUM`

#### Function parameters

- `metricParametersArray`

#### Operation

Sum up all the metric values from the resolved `metricParametersArray` to get the total metric value.

`SUM` supports operation over time series for aggregation.

### `AVG`

#### Function parameters

- `metricParametersArray`

#### Operation

Sum up all the metric values from the resolved `metricParametersArray` and divide by its element count to get the average metric value.

`AVG` supports operation over time series for aggregation.

### `MAX`

#### Function parameters

- `metricParametersArray`

#### Operation

Select the largest metric value from the resolved `metricParametersArray`.

`MAX` **does not** support operation over time series for aggregation.

### `MIN`

#### Function parameters

- `metricParametersArray`

#### Operation

Select the lowest metric value from the resolved `metricParametersArray`.

`MIN` **does not** support operation over time series for aggregation.

### `DIFF`

#### Function parameters

- `metricParametersArray`: this should be restricted to exactly 2 element array.

#### Operation

Subtract the second element metric value from the first element metric value from the resolved `metricParametersArray` to obtain difference between provided metrics.

`DIFF` **does not** support operation over time series for aggregation.

### `CONV`

#### Function parameters

- `metricParameters`
- `priceIdentifier`: string choice among price identifiers approved by UMA governance. Only price identifiers with available base and quote currencies are supported.
- `inverse`: (optional) boolean choice on whether resolved `priceIdentifier` price should be inverted.

#### Operation

1. Identify the timestamp key from the resolved `metricParameters`.
2. Resolve the value of `priceIdentifier` at the timestamp from Step 1 following instructions of [UMIP](https://github.com/UMAprotocol/UMIPs/tree/master/UMIPs) for the selected `priceIdentifier`. Custom ancillary data for such price request is not supported.
3. Depending on the status of `inverse` parameter:
    - if `inverse` is not provided or set to `false` multiply the metric value from the resolved `metricParameters` with resolved `priceIdentifier` from Step 2.
    - if `inverse` is provided and set to `true` divide the metric value from the resolved `metricParameters` by resolved `priceIdentifier` from Step 2.

`CONV` supports operation over time series for aggregation.
