*An UMIP number will be assigned by an editor. When opening a pull request to submit your UMIP, please use an abbreviated title in the filename. The file name should follow this format - "umip_add_priceidentifiername.md". Please remove this and all italicized instructions before submitting your pr. All bolded fields should be filled in before submission.*

## Headers

| UMIP                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add IS_RELAY_VALID as a supported price identifier |
| Authors             | Matt Rice                                                      |
| Status              | Draft                                                         |
| Created             | 2021-10-18                                          |
| Discourse Link      | **Create a post in [UMA's Discourse](https://discourse.umaproject.org/c/umips/18) and link here**            |

# Summary 

The DVM should support price requests for IS_RELAY_VALID.


# Motivation

IS_RELAY_VALID will allow the DVM to validate relay requests coming from Optimism or Arbitrum using the bridge contracts [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/insured-bridge).

This system will allow users on L2 to quickly transfer their funds back to L1 and avoid the long withdrawal waiting periods associated with the rollups for a marginal fee that will be paid to LPs that are willing to wait for the funds to transfer over the canonical bridge.

# Data Specifications

Voters will need to use multiple contracts to assess the validity of a relay.

Each price request will come from a [BridgePool](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgePool.sol) contract deployed on mainnet. This will be encoded in the ancillary data under the key `requester`.

A canonical [BridgeAdmin](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgeAdmin.sol) contract will be deployed on mainnet at (address TBD). Voters should validate that the `requester`'s `l1Token` method returns a valid ERC20 token address. When calling `whitelistedTokens(tokenAddress, 10)` (optimism) or `whitelistedTokens(tokenAddress, 42161)` (arbitrum), the second return value of at least one of these calls should be the requester address. If any of this is _not_ true, the relay should be considered invalid.

The ancillary data should also contain the field `relayHash`. This should have been emitted by the `BridgePool` with the [DepositRelayed](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/core/contracts/insured-bridge/BridgePool.sol#L135-L141) event. If no event exists with that hash, the relay is invalid.

In the same event, the voter should see a depositData field. The depositData struct should contain a chainId field. This field should be used to call `whitelistedTokens(mainnetTokenAddress, chainId)` and take the first argument. This first argument should be the deposit contract address on the chain specified by the chainId (arbitrum or optimism). The voter should query this contract for the [FundsDeposited](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/core/contracts-ovm/insured-bridge/implementation/BridgeDepositBox.sol#L73-L84) event to verify that its fields match the corresponding depositData struct fields on mainnet exactly. If there is any difference, the relay is invalid.

In the relayData struct in the DepositRelayed event queried earlier, there is a field called `realizedLpFeePct`. This field is specifified by the relayer and needs to be computed using the `quoteTimestamp` specified in the `depositData`. The algorithm for computing the `realizedLpFeePct` is specified here:

(TBD, [link to implementation](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/sdk/src/across/feeCalculator.ts#L78-L82) and uses AAVE interest rate models for each l1Token address).

If the algorithm above doesn't produce a matching `realizedLPFeePct`, the relay is invalid.


If the relay is invalid, the price should be `0`. If the relay is valid, it should be `1e18`.

# Price Feed Implementation

See the InsuredBridgePriceFeed.ts in the UMA price feeds directory.

## Ancillary Data Specifications

See Data Specifications.

# Rationale

TBD

# Implementation

TBD (see Data Specifications for now).

# Security Considerations

N/A.
