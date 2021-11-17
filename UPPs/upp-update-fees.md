## Status

Draft

## Summary

This UPP will adjust the final fees for all approved collateral types to around $1500.

## Rationale

So far final fees in UMA protocol had been targeted around $400, but this was set as the precedent before contracts could resolve price through Optimistic Oracle. This was a good balance between cost to users and preventing DVM spam at the time. After registering the Optimistic Oracle final fees are payable only when proposed prices are disputed, thus allowing to increase cost per DVM request.

As there are more projects building on top of UMA potential amount of DVM requests is increasing. In order to reduce burden on DVM and incentivize price resolvement through Optimistic Oracle this UPP proposes increasing final fees to around $1500.

Another factor considered was the minimum value of UMA holdings that would make spamming DVM profitable through inflationary voting rewards. During last couple of months median ratio of correct votes over snapshotted UMA supply was around 20%, hence each vote yielding 0.05 / 0.2 = 0.25%. So in order to profit from spamming DVM at $1500 final fee value one should hold at least 1500 / 0.25% = $600'000 worth of UMA. It is assumed that larger UMA holders would keep a longer term view and resist to spam DVM for short term gains.

## Specifics

[TBD]
