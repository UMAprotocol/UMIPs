These instructions are expected to be used with the `General_KPI` price identifier in conjunction with a dedicated `Method` document that requires aggregation of time series data. The instructions in the referenced `Method` document should have passed an array of measured KPI metrics along with Unix timestamps for these data points. 

Below sections provide instructions where each of section names corresponds to the supported values for the `AggregationMethod` parameter values passed in the ancillary data.

## `TWAP`

Evaluated KPI metrics series should be sorted by their timestamps and each KPI metric element (except the last one) should be weighted by the time distance in seconds to the next evaluated KPI element in order to return time weighted average as the aggregated KPI metric.

## `MAX`

The highest value KPI metric element from the evaluated time series should be returned as aggregated KPI metric.

## `MIN`

The lowest value KPI metric element from the evaluated time series should be returned as aggregated KPI metric.
