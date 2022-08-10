## Title

Standardized [subgraph](https://thegraph.com/) query

## Summary

This calculation is intended to track custom metric for any project that has implemented a functioning [subgraph](https://thegraph.com/docs/en/developing/creating-a-subgraph/). This implementation should be used with the `General_KPI` price identifier.

## Intended Ancillary Data

This subgraph tracking implementation should be used with following ancillary data parameter values some of which are optional as indicated below:

- `Metric:<DESCRIPTION>` where `<DESCRIPTION>`is short description reflecting the metric and units to be measured.
- `Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/subgraph-query.md"` points to this implementation document.
- `Endpoint:"https://api.thegraph.com/subgraphs/name/<GITHUB_USER>/<SUBGRAPH_NAME>"` where `<GITHUB_USER>` is project's GitHub user name (used when creating hosted subgraph) and `<SUBGRAPH_NAME>` is the name of the queried subgraph on the hosted service. This parameter is not required and would be ignored when `SubgraphId` is provided.
- `SubgraphId:<SUBGRAPH_ID>` (optional) where `SUBGRAPH_ID` is the identifier of deployed subgraph when querying decentralized network.
- `Source:<SUBGRAPH_SOURCE>` where `<SUBGRAPH_SOURCE>` is URL link to the repository containing source code for the relevant subgraph.
- `QueryString:"<QUERY_STRING>"` where `<QUERY_STRING>` represents [GraphQL API](https://thegraph.com/docs/en/querying/graphql-api/) query string. `<QUERY_STRING>` can also include macros as detailed in the Implementation section. In order to support automated verification and proper ancillary data parsing all double quotes (`"`) within `<QUERY_STRING>` should be escaped by backslash (`\`).
- `CollectionKey:<COLLECTION_KEY>` (optional) where `<COLLECTION_KEY>` represents key path to collection containing tracked metrics under returned `data` object. `<COLLECTION_KEY>` can consist of single key string or concatenated key strings joined by dots (`.`) when nested elements should be processed. `CollectionKey` parameter should be passed only when the tracked metric is returned within a collection of entities.
- `MetricKey:<METRIC_KEY>` where `<METRIC_KEY>` represents key path to the tracked metric. If no `CollectionKey` is provided `<METRIC_KEY>` represents absolute key path under returned `data` object. If there is `CollectionKey` parameter then `<METRIC_KEY>` represents relative key path to the tracked metric within the returned collection of entities. `<METRIC_KEY>` can consist of single key string or concatenated key strings joined by dots (`.`) when nested elements should be processed.
- `TimestampKey:<TIMESTAMP_KEY>` (optional) where `<TIMESTAMP_KEY>` represents relative key path to the timestamp of the returned metric within the returned collection of entities. `<TIMESTAMP_KEY>` can consist of single key string or concatenated key strings joined by dots (`.`) when nested elements should be processed. `TimestampKey` is mandatory if `DailyAggregation` was provided and set to `true`.
- `ChainId:<CHAIN_ID>` (optional) where `<CHAIN_ID>` represents numeric chain identifier when query timestamp needs to be converted to the block number for the relevant chain.
- `RequestTimestampOverride:<REQUEST_TIMESTAMP_OVERRIDE>` (optional) where  `<REQUEST_TIMESTAMP_OVERRIDE>` represents override value for price request timestamp.
- `AggregationPeriod:<AGGREGATION_PERIOD>` (optional) where `<AGGREGATION_PERIOD>` represents time period in seconds for any time series data processing. This parameter is mandatory if `AggregationMethod` was provided while `TimestampKey` was not provided.
- `AggregationMethod:<AGGREGATION_METHOD>` (optional) where `<AGGREGATION_METHOD>` represents string choice from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) for time series data processing.
- `DailyAggregation:<DAILY_AGGREGATION>` (optional) where `<DAILY_AGGREGATION>` is boolean (`true` or `false`) representing whether the tracked metrics should be first totalled by daily intervals before performing other aggregation instructions.
- `PostProcessingMethod:<POST_PROCESSING_METHOD>` (optional) where `<POST_PROCESSING_METHOD>` represents string choice from the [supported post-processing functions](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/post-processing-functions.md). This parameter is mandatory if `PostProcessingParameters` was provided.
- `PostProcessingParameters:<POST_PROCESSING_PARAMETERS>` (optional) where `POST_PROCESSING_PARAMETERS` represents JSON object with parameter key-value pairs to be used with the `PostProcessingMethod`. This parameter is mandatory if `PostProcessingMethod` was provided.
- `RawRounding:<RAW_ROUNDING_DECIMALS>` (optional) where `<RAW_ROUNDING_DECIMALS>` represents `RawRounding` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on raw metric.
- `Scaling:<SCALING>` (optional) where `<SCALING>` represents `Scaling` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on raw rounded metric.
- `Rounding:<ROUNDING_DECIMALS>` (optional) where `<ROUNDING_DECIMALS>` represents `Rounding` value as per [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) applied on resolved value.
- `ReturnFrom:<RETURN_FROM>` (optional) where `RETURN_FROM` represents string choice (`rawMetric` / `timeSeries`) instructing an early return from implementation steps when [additional operation](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/metric-operations.md) should be performed on this data source.

## Implementation

1. Determine daily query timestamp for metric data:
    - If `RequestTimestampOverride` parameter is provided its value should be used as an override for the actual price request timestamp. Though this should always be ignored if the provided `RequestTimestampOverride` value exceeds actual price request timestamp.
    - Daily query timestamp should be set to the closest 24:00 UTC timestamp at or before effective request timestamp expressed as numeric Unix timestamp.
2. Process `QueryString` parameter to replace any supported macros with actual values:
    - `<QUERY_DTS>` should be replaced with the value of daily query timestamp.
    - `<QUERY_DTS-[N]D>` where `[N]` is expected to be integer value of days should be replaced by the value of daily query timestamp subtracted by `[N] * 86400` seconds. As an illustration, `<QUERY_DTS-30D>` would be replaced by the timestamp that is 30 days before the daily query timestamp.
    - `<QUERY_DBN>` should be replaced with the latest block number that is at or before the daily query timestamp.
    -  `<QUERY_DBN-[N]D>` where `[N]` is expected to be integer value of days should be replaced with the latest block number that is at or before the daily query timestamp that had been reduced by `[N] * 86400` seconds. As an illustration, `<QUERY_DBN-30D>` would be replaced by the corresponding block number for the timestamp that is 30 days before the daily query timestamp.
    - For `<QUERY_DBN>` and `<QUERY_DBN-[N]D>` macros above identify the relevant blockchain by the value of passed `ChainId` parameter (defaults to `1` for mainnet Ethereum if not explicitly provided). As a helper one can use Snapshot's [block finder query](https://blockfinder.snapshot.org), but verifiers are free to use their own tools to identify the matching block number.
    - `<PAGINATE>` indicates that the requested data contains multiple entries (`CollectionKey` parameter must have been provided) and the query should be paginated by the verifier querying the API multiple times.
        - On the first run `<PAGINATE>` should be replaced with `first:1000`. If the returned data contains exactly 1000 entries the query should be repeated by following the steps below.
        - On the second run `<PAGINATE>` should be replaced with `first:1000,skip:1000` and any repeated iterations should increment the value of `skip` key by `1000` (e.g. `first:1000,skip:2000` for the third run and so on).
        - Stop the repeated query if any of previous requests results in less than 1000 entries. Verifiers should aggregate the results of all queries combining returned entries under the `CollectionKey` path (see Step 5 below).
3. If `SubgraphId` parameter is not present this indicates usage of hosted service and API endpoint should be set to the value of `Endpoint` parameter. When `SubgraphId` is provided the API endpoint should be set to `"https://gateway.thegraph.com/api/<API_KEY>/subgraphs/id/<SUBGRAPH_ID>"` where `<API_KEY>` should be replaced with verifier's individual Graph [API key](https://thegraph.com/docs/en/querying/managing-api-keys/) and `<SUBGRAPH_ID>` replaced with the value of `SubgraphId` parameter.
4. Query `POST` method on the subgraph API endpoint from Step 3 with following JSON data object: `{"query": "<PROCESSED_QUERY>"}` where `<PROCESSED_QUERY>` should be replaced with the macro processed `QueryString` parameter from Step 2. The returned JSON object should contain `data` object with requested elements. In case verifiers do not have API keys for the decentralized network the processed query can still be manually executed on the playground interface at `"https://thegraph.com/explorer/subgraph?id=<SUBGRAPH_ID>&view=Playground"` where `SUBGRAPH_ID` should be replaced with the value of `SubgraphId` parameter.
5. Determine the value of tracked metric from the returned `data` object from Step 4:
    - If the `data` object contains single element for the tracked metric (this can also be deducted by the absence of `CollectionKey`parameter) traverse the nested elements of `data` object by following key path provided in `MetricKey` parameter where nested key strings are separated by dots (`.`). Use the value of identified key for the tracked metric at the daily query timestamp.
    - If the `data` object contains a collection of elements first identify the relevant collection by traversing the nested elements of `data` object with the key path provided in `CollectionKey` parameter where nested key strings are separated by dots (`.`). Then for each element of the identified collection traverse its elements by following key path provided in `MetricKey` parameter where nested key strings are separated by dots (`.`). Sum up the values of identified key elements within the collection to calculate the value of tracked metric at the daily query timestamp.
    - If due to performed [operation](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/metric-operations.md) on the metric its ancillary data has inherited `ReturnFrom` parameter set to `rawMetric` the obtained value of tracked metric from this Step 5 should be paired with the daily query timestamp from Step 1 and passed as timestamp /metric key-value pair for the processing of dependant operation. Otherwise proceed with the next steps in this implementation.
6. If `AggregationMethod` is provided follow the instructions of the chosen method section from the [supported aggregation methods](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/aggregation-methods.md) using the metric time series (see below) for all the daily timestamps to derive single metric value. In case the string value in `AggregationMethod` is not supported ignore the aggregation and use the value of tracked metric at the single daily timestamp.
    - If `TimestampKey` was not provided identify all daily timestamps at 24:00 UTC that are at or before effective request timestamp and not earlier than `AggregationPeriod` seconds before the effective request timestamp. Repeat the Steps 2 - 5 for each identified daily query timestamp to obtain an array of measured KPI metrics along with daily Unix timestamps for these data points to be processed by the selected aggregation method. If also `AggregationPeriod` is missing due to misconfiguration ignore the aggregation and fall back to the value of tracked metric at the single daily timestamp.
    - If `TimestampKey` was provided follow the same instructions as in Step 5, but do yet not sum up the values of identified key elements within the collection. Also in a similar manner use the `TimestampKey` parameter value with any nested key strings separated by dots (`.`) to identify corresponding Unix timestamps for each of the elements of tracked metric (obtained by traversing `MetricKey` path before). Determine the range from the lowest obtained timestamp to the highest and slice it in daily intervals ending at 24:00 UTC.
        - If the `DailyAggregation` is not present or set to `false` pick the last metric - timestamp pair by its timestamp value within each daily interval (if it includes any data). In case there are more than one data items for the same last daily timestamp the values of such metrics should be summed together. Process the selected series of metric - timestamp pairs by the selected aggregation method.
        - If the `DailyAggregation` is set to `true` sum up all metric values grouped by daily intervals where exact 24:00 UTC timestamps belong to the previous day. If particular day has no data its metric value should be set to `0`. Total metric value for each day should be paired with its ending 24:00 UTC timestamp and processed by the selected aggregation method.
    - If due to performed [operation](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/metric-operations.md) on the metric its ancillary data has inherited `ReturnFrom` parameter set to `timeSeries` the obtained array of timestamp / metric key-value pairs from this Step 6 should not be processed by the selected aggregation method and instead this raw timestamp / metric array should be passed for the processing of dependant operation. Otherwise proceed with the next steps in this implementation.
7. If `RawRounding` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the raw metric based on the value of `RawRounding` parameter and use it for further processing. Otherwise proceed with raw metric.
8. If `Scaling` is provided follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply scaling on the rounded raw metric based on the value of `Scaling` parameter and use it for further processing. Otherwise proceed with unscaled metric.
9. If `PostProcessingMethod` is provided follow the instructions of the chosen function section from the [supported post-processing functions](https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/post-processing-functions.md) using the metric from Step 8 and post-processing function parameters from `PostProcessingParameters`. Otherwise proceed with metric from Step 8.
10. Follow instructions in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md) to apply rounding on the processed metric based on the value of `Rounding` parameter and return the result as resolved price.

The above instructions rely on subgraph API endpoint being accessible at the time of price resolvement. If it is not available the voters should attempt to resolve KPI metric values following the same calculation logic as found in the linked `Source` repository.

The voters should also be aware that subgraphs can be upgraded during the lifetime of requesting contract, hence they should use their human judgement to detect and mitigate any attempted malicious subgraph upgrades.

Users of this subgraph implementation should be aware that the Graph protocol is planning to sunset the hosted service in Q1 2023. Hence, all contracts that are expected to expire after end of 2022 should use the decentralized subgraph network and provide the `SubgraphId` parameter instead of `Endpoint` for the hosted service.

## Example use case

As an illustration the below configuration of ancillary data would track 90 day TWAP of Idle Finance Senior wstETH tranche measured in ETH:

```
Metric:"TVL of IdleCDO AA Tranche - wstETH measured in ETH",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/subgraph-query.md",
Endpoint:"https://api.thegraph.com/subgraphs/name/samster91/idle-tranches",
QueryString:"{trancheInfos(<PAGINATE>,orderBy:timeStamp,orderDirection:desc,where:{Tranche:\"0x2688fc68c4eac90d9e5e1b94776cf14eade8d877\",timeStamp_lte:<QUERY_DTS>,timeStamp_gte:<QUERY_DTS-90D>}){timeStamp,contractValue}}",
CollectionKey:trancheInfos,
MetricKey:contractValue,
TimestampKey:timeStamp,
AggregationMethod:TWAP,
Scaling:-18,
Rounding:4
```

- `<PAGINATE>` in `QueryString` would ensure proper pagination since the query is expected to return more than 1000 entries.
- `<QUERY_DTS>` in `QueryString` would translate to `1659484800` (August 3, 2022 12:00:00 AM UTC) if the contract was expired at `1659554374`.
- `<QUERY_DTS-90D>` in `QueryString` would translate to `1651708800` (May 5, 2022 12:00:00 AM UTC) that is 90 days before `<QUERY_DTS>`.
- The first page of requested subgraph query would be processed as (indentation inserted for readability):

    ```
    {
      trancheInfos (
        first: 1000,
        orderBy: timeStamp,
        orderDirection: desc,
        where: {
          Tranche: "0x2688fc68c4eac90d9e5e1b94776cf14eade8d877",
          timeStamp_lte: 1659484800,
          timeStamp_gte: 1651708800
        }
      )
      {
        timeStamp,
        contractValue
      }
    }
    ```
- The above request would result in following returned data (truncated):

    ```
    {
      "data": {
        "trancheInfos": [
          {
            "timeStamp": "1659483368",
            "contractValue": "21181974578611372296598"
          },
          {
            "timeStamp": "1659479764",
            "contractValue": "21181974578611372296598"
          },
    ...
    ```
- The query would be repeated iterating over 1000 entry intervals by adding `skip: 1000,`, `skip: 2000,` and so on after `first: 1000`.
- `CollectionKey` (`trancheInfos` above) contains series of data entries where each element has `contractValue` as `MetricKey` and `timeStamp` as `TimestampKey`.
- Only the last timestamp metric for each day within the 90 day period would be processed with `TWAP` `AggregationMethod`.
- Since `contractValue` is returned in units of Wei, `Scaling:-18` would ensure translation to units of ETH.
- `Rounding:4` would ensure TVL expressed in ETH would be rounded to 4 decimals before returned as resolved price.