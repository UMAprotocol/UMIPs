## Title

Across Community Growth KPI


## Summary
Across Protocol is a new project that uses UMA's Optimistic Oracle for L2 to L1 token bridging. It would like to bootstrap its community by incentivizing UMA community contributors (superUMAns) to join and grow the Across community. This implementation doc details how the Across community size could be measured, which will be used to create a KPI option based upon community size. 


## Ancillary Data Specifications
Metric:Total number of members in the Across community on the day before expiry,
Endpoint:"https://statbot.net/dashboard/887426921892315137/overview",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/across-kpi.md",
Key:Total Members,
Rounding:0,
Interval:Daily with the day before the day that the expiry timestamp falls on being used

## Rationale

The intended recipients of these kpi options are limited to those that have already demonstrated to be trustworthy participants when building this community. Because of this, we believe it is unlikely that this metric will be manipulated by bad actors. Additionally, there will be active measures by community moderators to maintain an environment that will contribute to the long-term success of the protocol. 

The intention of this KPI option as an incentivization tool is to get people into the community during the early stages of our launch. Ultimately, the use case for this KPI option is to experiment with community bootstrapping.

The day before is used because Discord does not have an easy way to query for members at a specific timestamp. The day of would not be fitting, as the value could change depending on when proposers/voters refer to the stats dashboard. The day before represents the number of members at the end of the day preceding the price request, and will remain static. 

## Implementation

1. Using the discord server statbot dashboard, proposers/voters should refer to the `Total member count` table and use the `Total Member` value from the day preceding the day that the price request timestamp fell in.
2. The `Total Member` value should be returned as is with no rounding or transformation.


## Intended Use Case

This calculation is intended to be used with a KPI option that has FPL bounds of 0 and 1000, and a collateralPerPair of 1. As an example, 500 members would result in a KPI option value of 0.5 UMA.