## Headers

| UMIP-136            |                                                    |
| ------------------- | -------------------------------------------------- |
| UMIP Title          | Add IS_RELAY_VALID as a supported price identifier |
| Authors             | Matt Rice                                          |
| Status              | Approved                                          |
| Created             | 2021-10-18                                         |

# Summary 

The DVM should support price requests for IS_RELAY_VALID.


# Motivation

IS_RELAY_VALID will allow the DVM to validate relay requests coming from Optimism or Arbitrum using the bridge contracts [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/insured-bridge).

This system will allow users on L2 to quickly transfer their funds back to L1 and avoid the long withdrawal waiting periods associated with the rollups for a marginal fee that will be paid to LPs that are willing to wait for the funds to transfer over the canonical bridge.

# Data Specifications and Implementation

Voters will need to use multiple contracts to assess the validity of a relay.

Each price request will come from a [BridgePool](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgePool.sol) contract deployed on mainnet. This will be encoded in the ancillary data under the key `requester`.

A canonical [BridgeAdmin](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgeAdmin.sol) contract is deployed on mainnet at [0x30B44C676A05F1264d1dE9cC31dB5F2A945186b6](https://etherscan.io/address/0x30b44c676a05f1264d1de9cc31db5f2a945186b6). Voters should validate that the `requester`'s `l1Token` method returns a valid ERC20 token address. When calling `whitelistedTokens(tokenAddress, 10)` (optimism) or `whitelistedTokens(tokenAddress, 42161)` (arbitrum) on the `BridgeAdmin` contract at the same block number of relay transaction, the second return value of at least one of these calls should be the requester address. If any of this is _not_ true, the relay should be considered invalid.

The ancillary data should also contain the field `relayHash`. This should match the `relayAncillaryData` field emitted by the `BridgePool` in the [DepositRelayed](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/core/contracts/insured-bridge/BridgePool.sol#L135-L141) event. If no event exists with that hash, the relay is invalid.

In the same event, the voter should see a `depositData` field containing `DepositData` struct. The `DepositData` struct should contain a `chainId` field. This field should be used to call `depositContracts(chainId)` on the `BridgeAdmin` contract (called at the latest block number at or before timestamp from `quoteTimestamp` field in the `DepositData` struct) and take the `depositContract` value in the struct (first element). This should be the deposit contract address on the chain specified by the chainId (arbitrum or optimism). The voter should query this contract for the [FundsDeposited](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/core/contracts-ovm/insured-bridge/implementation/BridgeDepositBox.sol#L73-L84) event to verify that its fields match the corresponding `DepositData` struct fields on mainnet exactly. If there is any difference, the relay is invalid.

In the `RelayData` struct in the DepositRelayed event queried earlier, there is a field called `realizedLpFeePct`. Note: the `RelayData` struct is called `relay` in the event, and to decode the `realizedFeePct` field, one may need to decode with web3.js/ethers and extract the 4th field, since structs are sommetimes decoded as tuples rather than a struct with named fields. This field is specifified by the relayer and needs to be computed using the `quoteTimestamp` specified in the `depositData`. The algorithm for computing the `realizedLpFeePct` is specified below where:

* <img src="https://render.githubusercontent.com/render/math?math=X"> denotes the size of a particular transaction someone is seeking to bridge
* <img src="https://render.githubusercontent.com/render/math?math=0 \leq U_t \leq 1"> denotes the utilization of the liquidity providers' capital prior to the transaction, i.e. the amount of the liquidity providers' capital that is in use prior to the current transaction
* <img src="https://render.githubusercontent.com/render/math?math=0 \leq \hat{U}_t \leq 1"> denotes the utilization of the liquidity providers' capital after to the transaction, i.e. the amount of the liquidity providers' capital that would be in use if the user chose to execute their transaction
* <img src="https://render.githubusercontent.com/render/math?math=\bar{U}"> denotes the "kink utilization" where the slope on the interest rate changes
* <img src="https://render.githubusercontent.com/render/math?math=R_0, R_1, R_2"> denotes the parameters governing the interest rate model slopes:
  * <img src="https://render.githubusercontent.com/render/math?math=R_0"> is the interest rate that would be charged at 0% utilization
  * <img src="https://render.githubusercontent.com/render/math?math=R_0 %2b R_1"> is the interest rate that would be charged at <img src="https://render.githubusercontent.com/render/math?math=\bar{U}\%25"> utilization
  * <img src="https://render.githubusercontent.com/render/math?math=R_0 %2b R_1 %2b R_2"> is the interest rate that would be charged at 100% utilization

An interest rate at any given amount of utilization would be given by the following equation:

<img src="https://render.githubusercontent.com/render/math?math=R(U_t) = R_0 %2b \frac{\min(\bar{U}, U_t)}{\bar{U}} R_1 %2b \frac{\max(0, U_t %2d \bar{U})}{1 %2d \bar{U}} R_2">

In our case for a loan, we must integrate over a range of utilizations because each dollar of the loan pushes up the interest rate for the next dollar of the loan. This effect is captured using an integral:

<img src="https://render.githubusercontent.com/render/math?math=R^a_t = \int_{U_t}^{\hat{U}_t} R(u) du">

To get the true rate charged on these loans, we need to de-annualize it to get the percentage:

<img src="https://render.githubusercontent.com/render/math?math=R^w_t = (1 %2b R^a_t)^{\frac{1}{52}} %2d 1">

<img src="https://render.githubusercontent.com/render/math?math=U_t"> can be fetched on-chain by calling `liquidityUtilizationCurrent` method on the `BridgePool` contract at the latest available block number at or before the `quoteTimestamp`. <img src="https://render.githubusercontent.com/render/math?math=\hat{U}_t"> can be fetched by calling `liquidityUtilizationPostRelay` method on the `BridgePool` contract at the same block number passing the `amount` field from the `DepositData` struct as `relayedAmount` parameter. Normally the `BridgePool` contract for calling these methods should be the same as the `requester`, but in the unlikely scenario when `BridgePool` gets migrated with pending deposits on L2 one should calculate the utilization ratio on the `BridgePool` contract that was active at the time of `quoteTimestamp`. In order to identify the previous `BridgePool` one should look up the last `WhitelistToken` event emitted by the deposit contract on L2 before the relayed transaction's `quoteTimestamp` and use the address from event's `bridgePool` field.

Since the notion of `block.timestamp` might be different on other L2 chains compared to main ethereum L1 EVM, deposit contracts on L2 allow setting the `quoteTimestamp` within 10 minute range from current time. In order to deterministically calculate LP fees based on pool utilization ratio the relayer should wait until L1 block timestamp reaches the `quoteTimestamp`. Any relayed transaction that is mined with earlier block timestamp than `quoteTimestamp` field from `DepositData` struct in the `DepositRelayed` event should be invalid.

Please see the example [implementation](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/sdk/src/across/feeCalculator.ts#L78-L82)) for more details.

The rate model parameters used for the above computation should be fetched on-chain from the `RateModelStore` contract deployed on mainnet at [0xd18fFeb5fdd1F2e122251eA7Bf357D8Af0B60B50](https://etherscan.io/address/0xd18fFeb5fdd1F2e122251eA7Bf357D8Af0B60B50) and governed by Across protocol [multi-signature account](https://etherscan.io/address/0xb524735356985d2f267fa010d681f061dff03715). Rate model parameters should be fetched by calling `l1TokenRateModels` method on the `RateModelStore` contract passing `l1Token` address as its argument at the block whose timestamp corresponds or is the latest available relative to the `quoteTimestamp` field.

The call to `l1TokenRateModels` should return a stringified JSON object containing the following key-value pairs:
* `UBar` corresponds to the <img src="https://render.githubusercontent.com/render/math?math=\bar{U}"> rate model parameter;
* `R0`, `R1` and `R2` correspond to <img src="https://render.githubusercontent.com/render/math?math=R_0">, <img src="https://render.githubusercontent.com/render/math?math=R_1"> and <img src="https://render.githubusercontent.com/render/math?math=R_2"> parameters respectively.

Rate model parameter values obtained above should be scaled down by 18 decimals.

In case the call to `l1TokenRateModels` returns anything that cannot be parsed to the exact key-value pairs mentioned above (e.g. missing or extra parameter included) the relay should be considered invalid.

If the algorithm above doesn't produce a matching `realizedLPFeePct` (after floor rounding the result expressed as decimal to 18 decimals), the relay is invalid. If the token is not listed in the table above, the relay is invalid.

If the relay is invalid, the price should be `0`. If the relay is valid, it should be `1`. Note: all price values should be scaled by `1e18`.

# Price Feed Implementation

See the [InsuredBridgePriceFeed.ts](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/InsuredBridgePriceFeed.ts) in the UMA price feeds directory.

## Ancillary Data Specifications

The ancillary data should specify two values: `relayHash` and `requester`. The former is a hash used to identify a relay, and the latter is the [BridgePool contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgePool.sol) that initiated the request.

# Security Considerations

This is a new identifier, and as long as there is a definitive answer for all requests, this should have no security impact on the UMA DVM.
