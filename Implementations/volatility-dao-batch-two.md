## Title

Volatility DAO Batch Two KPI

## Summary

The Volatility DAO wishes to use KPI options to incentivize the community to complete future DAO projects. This implementation doc is intended to be used with the General_KPI price identifier, and its return value will be determined by UMA proposer/voterss assessment of the Volatility DAO's completion of its objectives. These objectives and corresponding payouts are detailed in the *Implementation* section. 

## Intended Ancillary Data

```
Metric:Completion of various Volatility DAO governance projects,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/volatility-dao-batch-two.md",
Rounding:0
```

## Implementation

Potential prices to return will be discrete values between 0 and 100 and should be informed by the completion of the  goals listed in this document. Each goal has a percentage value associated with it, with completion of all goals corresponding to a 100 percent return value (or purely 100 for UMA voters). At the time of voting, voters should add up all values for each goal that have been met by the Volatility DAO as on the price request timestamp.

1. A value of 10 should be added to the total if a PIP to create and elect a Methodology Committee (a group that vets and creates PIPs for indices) has been passed.
2. A value of 5 should be added to the total if a PIP to implement a tip bot and the parameters for earning tips or additional VOLuntier2 tokens has been passed.
3. A value of 10 should be added to the total if Volatility DAO Twitter followers (https://twitter.com/VolatilityDao) were higher than 1000. This amount should be exceeded also on the price request timestamp.
4. A value of 10 should be added to the total if Volatility DAO Active Discord users (https://discord.gg/v75wdVeT) were higher than 500. This amount should be exceeded also on the price request timestamp.
5. A value of 5 should be added to the total if a PIP to elect DAO members to help run the DAO Github as well as create and manage a GitBook has been passed.
6. Maximum value of 30 should be added to the total depending on the number of products built on top of DAOracle indices. Each product built contributes 10 points.
7. A value of 15 should be added to the total if a new partnership within the Defi space has been identified and created by Volatility DAO.
8. Maximum value of 15 should be added to the total depending on the number of PIPs passed. This also may include PIPs passed as counted for reaching other goals stated above.
- 5 points for 1-5 PIPs
- 10 points for 6-10 PIPs
- 15 points for 11-15 PIPs

Additional information for UMA DVM participants:
- Approved PIPs can be observed in the Volatility DAO [Github Repo](https://github.com/Volatility-DAO/PIPS/tree/main/Approved) in the “Approved” directory.
- Within the Volatility DAO Discord is a channel called [#vol-kpi-metrics](https://discord.com/channels/807306992389062668/931235120269119488). This channel will be used to post and keep track of the above metric. Users will be able to verify products built on top of the DAOracle here and new partnerships that are created within the DeFi space.
