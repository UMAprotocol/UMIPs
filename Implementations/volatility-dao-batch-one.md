## Title

Volatilty DAO Batch One KPI

## Summary

The Volatility DAO wishes to use KPI options to incentivize the community to complete future DAO projects. This implementation doc is intended to be used with the General_KPI price identifier, and its return value will be determined by UMA proposer/voterss assessment of the Volatility DAO's completion of its objectives. These objectives and corresponding payouts are detailed in the *Implementation* section. 

## Intended Ancillary Data

```
Metric:Completion of various Volatility DAO governance projects,
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/volatility-dao-batch-one.md",
Rounding:0
```

## Implementation

Potential prices to return will be discrete values between 0 and 100 and should be informed by the completion of the  goals listed in this document. Each goal has a percentage value associated with it, with completion of all goals corresponding to a 100 percent return value (or purely 100 for UMA voters). At the time of voting, voters should add up all values for each goal that has been met by the Volatility DAO. 

Goal 1: A total value of 40 will be assigned based on the broader goal of if the DAO organizes and implements KPI Option Batch Two & the rollover mechanism. You can read more about rollover KPI Options at this link (https://forum.volatility.com/t/modifying-kpi-options-with-rollovers/67). The 40 "points" will be broken up into these smaller objectives.
  - 20 for the Batch Two KPIs and lifespan are defined, submitted as a proposal, and passed them in community governance.
  - 10 for proposing to allocate DAO VOL tokens to fund the Batch Two Options, submitting as a proposal, and passing in community governance. Minting the KPI Options Batch Two with UMA must also occur for this objective to be complete.
  - 10 implementation of rollover mechanism between Batch 1 and Batch 2.

Goal 2: A value of 30 will be added to the total if the POAPathon is created and launched. POAPathon is a POAP design competition that rewards designers that create the best POAP(s) across many DEFI projects. You can learn more about POAPathon in the [Discord](https://discord.gg/Xp58p6Csdx).

Goal 3: A value of 30 will be added to the total depending on some completion objectives regarding sponsored prizes within the POAPathon. A sponsored prize is a bounty or reward submitted by a team, DAO, or individual as part of the POAPathon. In order for a sponsored prize to qualify it needs to be valued at >= 100 DAI on the date/time the POAPathon officially starts. If a prize is not offered in DAI, Nomics.com or Coingecko can be used to determine the spot price of the exchange rate. Number of sponsored prizes and amounts can be verified at the site where the POAPathon is hosted (e.g. Gitcoin). Since that site is not yet live you can join the [Discord](https://discord.gg/Xp58p6Csdx) where you will be notified when that site is live. Voters should add the following values depending on the number of sponsored prizes there are.
- 10 - 1-20 prizes
- 20 - 21-45 prizes
- 30 - 46+ prizes