These instructions are expected to be used with the `General-KPI` price identifier in conjunction with a dedicated `Method` document that requires off-chain post-processing of the resolved KPI metric.

Below sections provide post-processing instructions where each of section names corresponds to the supported values for the `PostProcessingMethod` parameter values passed in the ancillary data. `PostProcessingParameters` passed in the ancillary data should be a JSON object with key-value pairs representing named function parameters as detailed below.

## `STEPWISE`

### Function parameters

- `milestones`: dynamic array containing 2 element arrays where the first element represents KPI metric milestone and the second element represents its price value.

### Implementation

1. KPI metric milestone values should be unique numerical values across all `milestones` array elements. Though if they were repeated due to user misconfiguration only the last `milestones` element with the same KPI metric should be used ignoring all preceding elements with duplicate KPI metric.
2. Sort `milestones` elements in descending order by their KPI metric milestone values.
3. Iterate over the sorted `milestones` elements and compare their KPI milestone value with the resolved KPI metric. If the resolved KPI metric is larger or equal to the evaluated KPI milestone then stop processing and return the corresponding price value. In case resolved KPI metric is below all KPI milestones resolve the price as set in `Unresolved` parameter form ancillary data or`0` if `Unresolved` was not provided.

### Example

```
PostProcessingParameters:{"milestones":[[0,1],[10000,2],[20000,5]]},Unresolved:0.1
```

As an illustration the above configuration from ancillary data would resolve price as follows:

- If KPI metric is negative `0.1` price should be resolved (based on `Unresolved` parameter);
- If KPI metric is at least `0` but lower than `10000` resolve price to `1`;
- If KPI metric is at least `10000` but lower than `20000` resolve price to `2`;
- If KPI metric is `20000` or higher resolve price to `5`.