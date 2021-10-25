## Headers

| UMIP-136            |                                                    |
| ------------------- | -------------------------------------------------- |
| UMIP Title          | Add IS_RELAY_VALID as a supported price identifier |
| Authors             | Matt Rice                                          |
| Status              | Last Call                                          |
| Created             | 2021-10-18                                         |

# Summary 

The DVM should support price requests for IS_RELAY_VALID.


# Motivation

IS_RELAY_VALID will allow the DVM to validate relay requests coming from Optimism or Arbitrum using the bridge contracts [here](https://github.com/UMAprotocol/protocol/tree/master/packages/core/contracts/insured-bridge).

This system will allow users on L2 to quickly transfer their funds back to L1 and avoid the long withdrawal waiting periods associated with the rollups for a marginal fee that will be paid to LPs that are willing to wait for the funds to transfer over the canonical bridge.

# Data Specifications and Implementation

Voters will need to use multiple contracts to assess the validity of a relay.

Each price request will come from a [BridgePool](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgePool.sol) contract deployed on mainnet. This will be encoded in the ancillary data under the key `requester`.

A canonical [BridgeAdmin](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgeAdmin.sol) contract will be deployed on mainnet at [0xde7130ceaf4345a12a2764f0dc50bc4899d7ec08](https://etherscan.io/address/0xde7130ceaf4345a12a2764f0dc50bc4899d7ec08). Voters should validate that the `requester`'s `l1Token` method returns a valid ERC20 token address. When calling `whitelistedTokens(tokenAddress, 10)` (optimism) or `whitelistedTokens(tokenAddress, 42161)` (arbitrum) on the `BridgeAdmin` contract, the second return value of at least one of these calls should be the requester address. If any of this is _not_ true, the relay should be considered invalid.

The ancillary data should also contain the field `relayHash`. This should match the `relayAncillaryData` field emitted by the `BridgePool` in the [DepositRelayed](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/core/contracts/insured-bridge/BridgePool.sol#L135-L141) event. If no event exists with that hash, the relay is invalid.

In the same event, the voter should see a `depositData` field containing `DepositData` struct. The `DepositData` struct should contain a `chainId` field. This field should be used to call `depositContracts(chainId)` on the `BridgeAdmin` contract and take the `depositContract` value in the struct (first element). This should be the deposit contract address on the chain specified by the chainId (arbitrum or optimism). The voter should query this contract for the [FundsDeposited](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/core/contracts-ovm/insured-bridge/implementation/BridgeDepositBox.sol#L73-L84) event to verify that its fields match the corresponding `DepositData` struct fields on mainnet exactly. If there is any difference, the relay is invalid.

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

Please see the example [implementation](https://github.com/UMAprotocol/protocol/blob/b588e83ca548a2a0d59b36f02ec9800afce28dec/packages/sdk/src/across/feeCalculator.ts#L78-L82)) for more details.

The rates used the above computation are drawn from Aave (where applicable):

| Asset | <img src="https://render.githubusercontent.com/render/math?math=\bar{U}">  | <img src="https://render.githubusercontent.com/render/math?math=R_0">  | <img src="https://render.githubusercontent.com/render/math?math=R_1">  | <img src="https://render.githubusercontent.com/render/math?math=R_2">  |
| ----- | --- | --- | --- | ---- |
| ETH   | 65% | 0%  | 8%  | 100% |
| USDC  | 80% | 0%  | 4%  | 100% |
| UMA   | 50% | 0%  | 5%  | 100% |

If the algorithm above doesn't produce a matching `realizedLPFeePct` (after rounding the result expressed as decimal to 18 decimals where less than 5 for the 19th decimal rounds down and 5 or above rounds up), the relay is invalid. If the token is not listed in the table above, the relay is invalid.

If the relay is invalid, the price should be `0`. If the relay is valid, it should be `1`. Note: all price values should be scaled by `1e18`.

# Price Feed Implementation

See the [InsuredBridgePriceFeed.ts](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/InsuredBridgePriceFeed.ts) in the UMA price feeds directory.

## Ancillary Data Specifications

The ancillary data should specify two values: `relayHash` and `requester`. The former is a hash used to identify a relay, and the latter is the [BridgePool contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/insured-bridge/BridgePool.sol) that initiated the request.

# Security Considerations

This is a new identifier, and as long as there is a definitive answer for all requests, this should have no security impact on the UMA DVM.
