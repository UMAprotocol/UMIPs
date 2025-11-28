## Headers

| UMIP-192       |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| UMIP Title     | Retire `ASSERT_TRUTH` as a supported price identifier                    |
| Authors        | Reinis Martinsons (reinis@umaproject.org)                                |
| Status         | Draft                                                                    |
| Created        | November 28, 2025                                                        |
| Discourse Link | XXX                                                                      |

## Summary

This proposal removes the whitelisted `ASSERT_TRUTH` price identifier (see [UMIP-170](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-170.md))
 used as the default price identifier for `OptimisticOracleV3` (OOV3). This is required to deprecate oSnap for
 integrations that have not disabled their oSnap module. Other integrations that are using `ASSERT_TRUTH` can migrate to
 the equivalent `ASSERT_TRUTH2` identifier proposed in [UMIP-191](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-191.md).

## Motivation

UMA’s oSnap product was launched in 2023 and allowed DAO's to use the optimistic oracle to execute offchain Snapshot
 proposals from their onchain treasury.

oSnap adoption and usage rates have stagnated in the last 12 months (see metrics [here](https://dune.com/risk_labs/osnap-metrics)).
 Risk Labs also believes oSnap has low potential for driving significant value to the UMA protocol. At the same time,
 the optimistic oracle's prediction market use case has seen massive growth and is clearly its highest value use case.
 Deprecating oSnap allows UMA and Risk Labs to focus on meeting Polymarket's scaling demand and improving the optimistic
 oracle's prediction market use case.

oSnap integrations can disable their oSnap module, but not all integrations can be contacted or will take action.
 Therefore retiring the `ASSERT_TRUTH` price identifier is required to ensure all oSnap integrations are deprecated
 before retiring supporting infrastructure.

Note: all remaining oSnap integrations are still encouraged to [disable their oSnap module](https://docs.uma.xyz/developers/osnap/disabling-osnap)
 to lower the security surface area of their DAO treasury.

Other integrations wanting to use the `ASSERT_TRUTH` price identifier should migrate to the new `ASSERT_TRUTH2` price
 identifier proposed in [UMIP-191](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-191.md).

## Technical Specification

`ASSERT_TRUTH` can be removed from identifier whitelists by calling the `removeSupportedIdentifier` function on the
 `IdentiferWhitelist` contract on every OOV3 supported chain and passing in the bytes representation of `ASSERT_TRUTH`.

## Implementation

Removing support for the `ASSERT_TRUTH` price identifier will make any subsequent OOV3 assertions using this identifier
 to revert. However, any existing unsettled assertions will not be affected.

This proposal will have the following undesirable effects on the `OptimisticOracleV3` contract:

1. OOV3 has a public constant `defaultIdentifier` that is set to `ASSERT_TRUTH`. This public read only function will be
 misleading after `ASSERT_TRUTH` is deprecated.
2. OOV3's  `assertTruthWithDefaults` function uses the `defaultIdentifier` as the assertion's identifier. After
 execution of this proposal, this function will always revert. However, this function is not actively used by any
 integrations.
3. Existing smart contracts that make OOV3 assertions may not be able to update their assertion's identifier from the
 deprecated `ASSERT_TRUTH` identifier. These integrations will need to update and redeploy their smart contracts to use
 the new `ASSERT_TRUTH2` identifier.

Risk Labs will reach out and coordinate with affected integrations and highlight these items in the UMA docs.

## Governance

- Discourse Discussion
- Onchain vote:
  - YES: retire the `ASSERT_TRUTH` price identifier on all OOV3 supported chains.
  - NO: do NOT retire the `ASSERT_TRUTH` price identifier.

