## Headers

| UMIP-157            |                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------- |
| UMIP Title          | Add **ACROSS-V2** as a supported price identifier                                             |
| Authors             | Matt Rice                                                                                     |
| Status              | Approved                                                                                    |
| Created             | 03/30/2022                                                                                    |
| Discourse Link      |                                                                                               |

# Summary 

The DVM should support the ACROSS-V2 price identifier.

# Across V2 Architecture

This [documents](https://docs.across.to/how-across-works/how-across-guarantees-transfers) an overview of how Across fulfills bridge requests.

Across provides utility to users who want send or "bridge" tokens across chains. The way Across achieves this is by offering a market for lenders who credit users their desired tokens on their desired destination chain in exchange for receiving interest payments.

Imagine a user wants to bridge a stablecoin from an L2 to Ethereum. In Across, that user would "deposit" the stablecoin on an L2 contract and offer a fee in exchange for receiving the Ethereum equivalent of that stablecoin on Ethereum. "Relayers", also known as lenders, will compete to credit the user the equivalent stablecoin on Ethereum.

The lender will later receive a refund plus fee once the system has validated that their loan was transmitted correctly. A loan can be fulfilled improperly for many reasons, including setting the wrong fee, destination token, etc. The system validates batches of these loans at once via an optimistic challenge mechanism secured by the [UMA Oracle](https://docs.umaproject.org/protocol-overview/how-does-umas-oracle-work).

The fundamental architecture of this system is a "Hub and Spoke" model, where users and lenders who participate in the bridging of tokens interact with Spokes on the origin and destination networks, while the Hub pools capital on Ethereum and uses it to collateralize refunds to lenders. Liquidity Providers are therefore passive capital providers who interact with the Hub on Ethereum and earn fees for backstopping the system and allowing relayers to have flexibility when choosing the chain they want to be refunded on.

This UMIP will explain how to properly validate batches of these refunds, including all of the detail needed to verify that the fees are set and charged correctly. These batches of refunds are summarized on-chain within [Merkle Roots](https://www.youtube.com/watch?v=JXn4GqyS7Gg). In addition to a merkle root containing all of the refunds to be sent to lenders, an additional merkle root can be included that instructs the Hub and Spoke as to how to "rebalance" capital amongst themselves. Respectively, these two merkle roots are intuitively named the "Relayer Refund root" and the "Pool Rebalance root".

# Motivation

The ACROSS-V2 price identifier is intended to be used by off-chain agents to verify whether a bundle of bridge-related
transactions submitted to mainnet is valid.


# Data Specifications and Implementation

Note 1: the following details will often refer to the [Across V2](https://github.com/across-protocol/contracts-v2) repo
at commit hash: 0d8bb01605a850d8b72a32a494a9f9d762240311. This allows the UMIP to have a constant reference rather than
depending on a changing repository.

Note 2: when referencing "later" or "earlier" events, the primary sort should be on the block number, the secondary
sort should be on the `transactionIndex`, and the tertiary sort should be on the `logIndex`. See the section on [comparing events](#comparing-events-chronologically) for more details.

Note 3: wherever unspecified, sorting should be ascending by default, not descending.

Note 4: all event data should be identically returned by at least two independent, reputable RPC providers to give confidence in the integrity of the data.

# Definitions

## Comparing events chronologically
Smart contract transactions can emit events that conform to the specifications described in the "Returns" section of these [docs](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#contract-events). Specifically, an event is expected to have a unique combination of `blockNumber`, `transactionIndex` and `logIndex`. To compare events `e1` and `e2` chronologically, we can say
that `e1` is "earlier" than `e2` if `e1.blockNumber < e2.blockNumber` OR if `e1.blockNumber == e2.blockNumber && e1.transactionIndex < e2.transactionIndex` OR if `e1.blockNumber == e2.blockNumber && e1.transactionIndex == e2.transactionIndex && e1.logIndex < e2.logIndex`.

So, "earlier" events have a lower block number, transaction index, or log index, and we should compare event properties in that order.

## Valid bundle proposals
A root bundle can be proposed by calling `HubPool.proposeRootBundle()`, which will will emit a [`ProposedRootBundle`](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L148-L156) event.

The root bundle is valid once *all* of its `PoolRebalanceLeaves` are executed via `HubPool.executeRootBundle()`, which can only be called after the proposed root bundle's `challengePeriodEndTimestamp` is passed. 

## Comparing deposit events chronologically for different origin chains
Each deposit emits a [`quoteTimestamp`](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/SpokePool.sol#L125) parameter. This timestamp should be evaluated within the context of the Ethereum network, and should be mapped to the Ethereum block who's [`timestamp`](https://ethereum.org/en/developers/docs/data-and-analytics/block-explorers/#blocks) is closest to the `deposit.quoteTimestamp` but not greater (i.e. `block.timestamp` closest to and `<= deposit.quoteTimestamp`).

## Matching L1 tokens to Running Balances or Net Send Amounts
The [`RootBundleExecuted`](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L157-L166) event and [`PoolRebalanceLeaf`] structure both contain arrays: `l1Tokens`, `netSendAmounts`, `bundleLpFees`, and `runningBalances`. Each element in `l1Tokens` is an address corresponding to an ERC20 token deployed on Ethereum Mainnet. It should be mapped to the value in any of the other three arrays (`netSendAmounts`, `bundleLpFees`, and `runningBalances`) that shares the same index within the array.

For example, if `l1Tokens` is "[0x123,0x456,0x789]" and `netSendAmounts` is "[1,2,3]", then the "net send amount" for token with address "0x456" is equal to "2".

## Identifying running balances and incentive pool amounts for {token, chain} combinations

The `l1Tokens`, `netSendAmounts`, `bundleLpFees` arrays emitted in `RootBundleExecuted` events should be equal length so we can match each L1 token to a value in the following arrays. The `runningBalances` should be of length exactly twice the `l1Tokens` length. 

Let's say there are `X` L1 tokens. The values in `runningBalances[0:X-1]` are equal to the running balances, and the values in `runningBalances[X:2x-1]` are equal to the incentive pool amounts for each token. 

To find the running balance for a token at index `i` in the `l1Tokens` array, follow the steps [here](#matching-l1-tokens-to-running-balances-or-net-send-amounts).

To find the incentive pool for the same token at index `i`, simply return `runningBalances[X+i]` where `X` is the length of `l1Tokens`.

## Versions
The `ConfigStore` stores a "VERSION" value in the `globalConfig`. This is used to protect relayers and dataworkers from using outdated code when interacting with Across. The "VERSION" should be mapped to an integer string that can only increase over time. The "VERSION" is updated by calling `updateGlobalConfig` so it is emitted as an on-chain event. The block time of the event that included the "VERSION" indicates when that "VERSION" became active. Relayers should support the version at the quote timestamp for a deposit, otherwise they risk sending an invalid fill. Proposers and Disputers should support the latest version for a bundle block range to validate or propose a new bundle.

# Ancillary Data Specifications

The ancillary data only needs a single field: `ooRequester`, which should be the contract requesting the price from the
OO. Because that contract should contain enough information about the request for voters to resolve the validity of the
relay, no additional ancillary data is needed.

Example:

```
ooRequester:0x69CA24D3084a2eea77E061E2D7aF9b76D107b4f6
```

# Configuration Constants

## Global Constants
The following constants should reflect what is stored in the [`AcrossConfigStore`](https://etherscan.io/address/0x3b03509645713718b78951126e0a6de6f10043f5#code) contract deployed on Etherscan. This contract is owned by Across governance and acts as the source of truth for the following variables. The global variables currently stored in the above contract for this UMIP are:
- "MAX_POOL_REBALANCE_LEAF_SIZE"
- "MAX_RELAYER_REPAYMENT_LEAF_SIZE"
- "VERSION"
  - Across protocol version number. Supporting implementations should query this value against the value defined in their implementation to determine compatibility with the current protocol version. Failure to correctly evaluate the version number may mean that filled relays are not refunded from the HubPool, and may therefore result in loss of funds. For more information go [here](#versions).
- "DISABLED_CHAINS"
  - This must be a stringified list of chain ID numbers. This cannot contain the chain ID "1".

To query the value for any of the above constants, the `AcrossConfigStore` contract's `globalConfig(bytes32)` function should be called with the hex value of the variable name. For example, the "MAX_POOL_REBALANCE_LEAF_SIZE" can be queried by calling `globalConfig(toHex("MAX_POOL_REBALANCE_LEAF_SIZE"))` which is equivalent to `globalConfig("0x4d41585f504f4f4c5f524542414c414e43455f4c4541465f53495a45")`. For example, this might return 
>"25"

The following constants are currently specified in this UMIP directly, but should be moved to the `AcrossConfigStore` in the future. Once that happens, this UMIP can be amended to move the following constants in to the above section.
- "CHAIN_ID_LIST"=[1,10,137,288,42161] # Mainnet, Optimism, Polygon, Boba, Arbitrum

## Token Constants
The following constants are also stored in the `AcrossConfigStore` contract but are specific to an Ethereum token address. Therefore, they are fetched by querying the config store's `tokenConfig(address)` function.
- `uba`
  - This is a dictionary of parameters that defines a fee curve for the token. These parameters can be further subindexed by a route (e.g. using the key "1-10" or "42161-1") to create a specific fee curve for a token per route. The subkeys are:
      - `alpha`: This is a scalar value that is a constant percentage of each transfer that is allocated for LPs. This value can be determined by token and route-by-route.
      - `gamma`: This is a piecewise linear function (defined by tuples where the first elements are cut-off points and the second elements are values at those points) that determine additional LP fees as a function of utilization. This piecewise linear function can be determined by token and chain-by-chain.
          - `cutoff`
          - `value`
      - `omega`: This is a piecewise linear function (defined by tuples of cut-off points and the values at those points) that determine the balancing fees (rewards) that are imposed on (paid to) a user who makes a transfer involving a particular chain. There is a single piecewise linear function for each token/chain combination. A transfer will incur a balancing fee on both the origin and destination chains.
         - `cutoff`
         - `value`
      - `rebalance`
         - `threshold_lower`: See threshold_upper. If this is 0, then a reallocation of funds via running balance adjustments should never occur due to an outflow. If this is undefined, treat it as 0.
         - `threshold_upper`: For tokens/chains that have a supported bridge, these are the lower and upper threshold that trigger the reallocation of funds. i.e. If the running balance on a chain moves below (above) threshold_lower (threshold_upper) then the bridge moves funds from Ethereum to the chain (from the chain to Ethereum). If this is 0, then a reallocation of funds via running balance adjustments should never occur due to an inflow. If this is undefined, treat it as 0.
         - `target_lower`: See target_upper. If `threshold_lower` is undefined, this can be undefined, otherwise this must be defined.
         - `target_upper`: For tokens/chains that have a supported bridge, these are the values that are targeted whenever funds are reallocated. If `threshold_upper` is undefined, this can be undefined, otherwise this must be defined.
- `incentivePoolAdjustment`
  - Used by DAO to keep track of any donations made to add to `incentivePool` liquidity for this token and a chain. This is a dictionary with a key of `chainId` and a scalar value. 
- `ubaRewardMultiplier`
  - Used by DAO to scale rewards unilaterally. This is also a dictionary with a key of `chainId` and a scalar value.

For example, querying `tokenConfig("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")` might return:

```json
{
    "uba": {
      "alpha": {
          "default": 200000000000000,
          "1-10": 0,
          "1-137": 0,
          "1-42161": 0
      },
      "gamma": {
          "default": [
            [500000000000000000, 0],
            [650000000000000000, 500000000000000],
            [750000000000000000, 1000000000000000],
            [850000000000000000, 2500000000000000],
            [900000000000000000, 5000000000000000],
            [950000000000000000, 50000000000000000]
          ]
      },
      "omega": {
          "default": [
                [0, 0]
            ],
          "10": [
                [0, 0]
            ],
            "137": [
                [0, 0]
            ],
            "42161": [
                [0, 0]
            ],
      },
      "rebalance": {
          "default": {
              "threshold_lower": 0,
              "target_lower": 50000000000000000000,
              "threshold_upper": 150000000000000000000,
              "target_upper": 150000000000000000000
          },
          "10": {
              "threshold_lower": 150000000000000000000,
              "target_lower": 150000000000000000000,
              "threshold_upper": 150000000000000000000,
              "target_upper": 150000000000000000000
          },
          "137": {
              "threshold_lower": 150000000000000000000,
              "target_lower": 150000000000000000000,
              "threshold_upper": 150000000000000000000,
              "target_upper": 150000000000000000000
          },
          "42161": {
              "threshold_lower": 150000000000000000000,
              "target_lower": 150000000000000000000,
              "threshold_upper": 150000000000000000000,
              "target_upper": 150000000000000000000
          }
      },
      "incentivePoolAdjustment": { 
        "1": 10000000000000000000
      },
      "ubaRewardMultiplier": {
        "1": 0.95
      }
  }
}
```

_This UMIP will explain later how global and token-specific configuration settings are used._


## Across Agents

- User: Also known as a Depositor or Bridger. The User deposits tokens on an "origin" SpokePool contract and expects to receive their deposited amount less fees from a "destination" SpokePool on the destination chain.
- Relayer: Also known as a Lender. Credits the User their destination tokens less fees on the destination SpokePool, which is also known as a "relay" attempt. Receives a refund plus fees from the system after their loan is validated optimistically.
- Liquidity Provider (LP): Lends capital to the HubPool on Ethereum. Their capital is used to backstop refunds to Relayers and assure users that there is enough capital in the system to fulfill their bridge request. Earns interest for lending capital passively.
- Dataworker: Submits bundles of relay attempts that the system should refund. The bundles are validated optimistically over a challenge period.

## Across Fees

This section will first explain all of the fees charged to Across agents and then explain how the fees are collected. Across charges fees via the "UBA" fee model in order to incentivize agents to deposit or take refunds on SpokePools such that a target balance is maintained. For example, when a SpokePool has a target of 100 tokens, then it will reward users who deposit on it when it has 90 tokens and also reward relayers who take refunds from it when it has 110 tokens.

The following list of fees are charged in Across:

- System Fee: The sum of the LP fee and deposit balancing fee. This is included in the `realizedLpFeePct` for a deposit.
  - LP Fee: The portion of the deposit that goes to LPs.
  - Deposit Balancing Fee: The penalty or reward included in the System Fee to incentivize balancing the SpokePool on the origin chain.
- Relayer Fee: The fee paid to the relayer to relay the deposit. This might be the sum of the gas, capital and refund balancing fees to properly incentivize the relayer to fill the deposit. However, its up to the depositor to set the relayer fee how they wish. The Across protocol only requires that the relayer use the same relayer fee set by the depositor.
  - Relayer gas fee: The component of the Relayer Fee to account for expected gas expenditures on the destination chain.
  - Relayer capital fee: The component of the Relayer Fee to account for the expected relayer cost of lending capital to the user on the destination chain.
  - Refund balancing fee: The penalty or reward that is applied to the relayer’s refund to incentivize balancing the SpokePool on the refund chain. The user should estimate this based on where they believe their relayer will take a refund.

## Computing Deposit and Refund Balancing Fees

This section gives an overview for computing the fees charged to users and relayers to incentivize them to maintain a SpokePool's target balance. These are labeled as Balancing Fees in this UMIP. Balancing fees are charged to any agent who causes an Inflow or Outflow to a SpokePool via a "Bridging Event".

### Defining Bridging Events
A Bridging Event is a `Deposit`, `Fill` or `Refund` event, which are intuitively the only events that lead to inflows and outflows to and from a SpokePool. Every deposit is counted as a bridging event, but not all fills and refunds are. A fill is counted if it is the first valid fill for a deposit on another chain, and its `repaymentChainId` is set to the `destinationChainId`, i.e. the fill will eventually be taking funds out of the SpokePool via a refund. If a fill's `repaymentChainId` is not set equal to the `destinationChainId`, then a corresponding refund event on the `repaymentChainId` should be emitted in order to signal when the refund from the SpokePool on the repayment chain should be counted as an outflow. See the section on [validating Refunds](#finding-valid-relays) for  more details on matching refunds with fills.

For each SpokePool on `chainId`, there will be an ordered series of Bridging Events (sorted in [ascending](#comparing-events-chronologically) chronological order). To compute the balancing fee for any event `e` within `E` (the ordered series of Bridging Events), we need to determine the "Running Balance" and the "Incentive Pool" at the time that `e` was emitted. We also will need to select which Incentive Curve to use to find the balancing fee given the running balance and available incentive pool.

In the following sections we'll use "Deposit" interchangeably with "Inflow", to represent balance added to the SpokePool. We'll also use "Outflow" interchangeably with "Fills" and "Refunds", which represent balance subtracted from the SpokePool.

### Incentive Curve

The incentive curve is a mathematical function that will be deterministically defined by a set of [token-specific configuration variables stored in the ConfigStore](#token-constants). The balancing fee curve is a piecewise linear curve defined solely by `omega` and in this section we use `f(x)` and `omega` interchangeably.

There will be a different curve for each chain and token combination. Therefore the curve is a function `f_i_t(x)` where the input `x` is denominated as a "running balance", which represents the amount of balance held on a SpokePool on chain `i` at some point in time. `f_i_t(x)` is unique for chain ID `i` and token `t`. `f_i_t(x)` should return a percentage, representing a "marginal incentive fee" for the input `x` running balance.

These curves will be used to figure out how to charge fees for an inflow or outflow event `e` which adds or subtracts, respectively, to a SpokePool's running balance. Typically, the balancing fee will be equal to the negative of the integral between `e.amount + x` for inflows (or `x - e.amount` for outflows) and `x`. This is intuitively the integral between the opening marginal incentive fee and the closing incentive fee after the transferred amount is added to or subtracted from SpokePool's running balance:

$\text{Balancing Fee} = \int_{\text{Running Balance}_i}^{\text{Running Balance}_i + \text{e.amount}} f_{it}(x) dx$

When the Balancing Fee is positive, the fee is paid by the agent (i.e. User or Relayer) to the SpokePool. These fees contribute to a pot of penalties or an "incentive pool" out of which future negative Balancing Fees or "rewards" are paid out. 

This means that:

- For $z < x_l$ (i.e. the pool is under-capitalized) we must have:
$$\underbrace{\int_{z}^{x_l} \omega_d(x) dx}_{\text{rewards paid for depositing capital}} \leq \underbrace{\int_{x_l}^{z} \omega_f(x) dx}_{\text{penalties paid by fills}}$$

- For $z > x_u$ (i.e. the pool is over-capitalized) we must have:
$$\underbrace{\int_{z}^{x_u} \omega_f(x) dx}_{\text{rewards paid for doing fills}} \leq \underbrace{\int_{x_u}^{z} \omega_d(x) dx}_{\text{penalties paid by depositors}}$$

### Computing Balancing Fee using incentive pool size, running balance, and incentive curve for e

First we'll compute the "uncapped" balancing fee amount. This is equal to the inverse of the integral of the incentive curve between [`runningBalance`, `runningBalance + e.amount`] where `e.amount > 0` for deposits and `e.amount < 0` for refunds and fills.

Secondly, we need to determine the available amounts of incentives in case we need to cap the actual incentive fee. We already know this as the incentive pool size at the time of `e`.

Third, we need to determine the total amount of rewards that would need to be paid to bring the starting running balance back to target. Let's name this reward figure we are trying to compute `maxRewards`. `maxRewards` is equal to the integral on the incentive curve between [`zero_upper/lower_running_balance`, and `runningBalance`]. If this amount exceeds the `incentivePool` available, then we need to discount any rewards by  `(uncappedIncentiveFee - incentivePool) / uncappedIncentiveFee`, where `uncappedIncentiveFee` is the value we found in the first step of this section. This step ensures that the penalty pot is large enough to cover any potential future rewards.

So, in summary we will compute the `appliedIncentiveFee` which will be taken out of (or added to!) the recipient's deposit or the refund amount.

```
## Running balance right before e creates an inflow or outflow from SpokePool
openingRunningBalance = S

maxRewards = 0
uncappedIncentiveFee = 0

## Handling deposits
if (e is "Inflow"):

   ## Uncapped incentive fee owed to e before we apply any discounts based on size of penalty pool
   uncappedIncentiveFee = integral_incentive_curve[openingRunningBalance, openingRunningBalance + e.amount]

   ## Deposits are rewarded when openingRunningBalance is under the zero fee range
   if (openingRunningBalance < zero_lower_running_balance):
      maxRewards = integral_incentive_curve[openingRunningBalance, zero_lower_running_balance]

## Handling refunds and fills
if (e is "Outflow"):

   ## Uncapped incentive fee owed to e before we apply any discounts based on size of penalty pool
   uncappedIncentiveFee = integral_incentive_curve[openingRunningBalance - e.amount, openingRunningBalance]

   ## Refunds are rewarded when openingRunningBalance is over the zero fee range.
   if (openingRunningBalance > zero_upper_running_balance):
      maxRewards = integral_incentive_curve[zero_upper_running_balance, openingRunningBalance]

## Available penalty pot amount right before e creates an inflow or outflow
penaltyPotSize = P

appliedIncentiveFee = uncappedIncentiveFee

## Apply hardcoded multiplier if incentive fee is a reward instead of a penalty
if (appliedIncentiveFee < 0):
   appliedIncentiveFee *= UBA_REWARD_MULTIPLIER

## Discount fee if max reward exceeds penalty pot
if (maxRewards > P):
   
   ## If P << uncappedIncentiveFee, discountFactor approaches 100%. Capped at 100%
   discountFactor = min(1, (uncappedIncentiveFee - P) / uncappedIncentiveFee)
   appliedIncentiveFee *= 1 - discountFactor
```

The final reward is equal to `reward * ubaRewardMultiplier`, a convenient scaler variable set in the [config store](#token-constants).

The following sections explain how to find the specific inputs needed to [compute the incentive fee](#computing-incentive-fee-using-incentive-pool-size-running-balance-and-incentive-curve-for-e)

### Computing Running Balances for Bridging Inflow and Outflow Events

#### Finding the Opening Running Balance

Identify the last validated `runningBalance` included with a `bundleEndBlock` preceding `e`. To do this, we need to match the `PoolRebalanceLeaf` containing an `L1Token` matching `e`'s `L2Token` which also contains a `bundleEndBlock` most closely preceding `e` with the correct `e.chainId`.

For example if `e` is an inflow on chain 1, then find the latest validated running balance for chain `1` and if `e` is an outflow on chain 5, then find the latest validated running balance for chain `5`. 

To match `e`'s `L2Token` with an `L1Token`, follow the steps [here](#matching-l2-tokens-and-l1-tokens).

Let's name this preceding running balance the "Opening Balance". Let's also name the proposed bundle associated with this starting running balance as the "Preceding Validated Bundle".

In the next section, we'll find the "Closing Balance" for e: the running balance of the SpokePool after `e` is executed.

#### Finding the Closing Balance

Step through all events between the last validated bundle's end block and `e` (e.g. all `e`'s with blocks >= the `bundleEndBlock` for the chain `e.chainId` in the preceding validated bundle and <= `e.block`). For each bridging event, compute the total incentive fee following this [algorithm](#computing-incentive-fee-using-incentive-pool-size-running-balance-and-incentive-curve-for-e).

We now need to [break down](#breaking-down-the-incentive-fee) the total incentive fee into the LP Fee and Balancing Fee component parts. For each of these events preceding the target event `e`, add to the running balance the `e.amount - BalancingFee`. This means that running balances should only count the LP fee plus the event inflow/outflow minus Balancing fees.

If `e` is a partial fill, then it might result in a slow fill that needs to be accounted for as an Outflow from the SpokePool. Follow this section to [identify slow fills](#finding-slow-relays). In Across, partial fills must take repayment on the destination chain meaning that slow fills ultimately are Outflows in the same way that full fills are, so there isn't additional work needed to handle slow fills when computing closing running balances.

However, we do need to account for any full fills that produce a [Slow Fill Excess](#handling-slow-fill-excesses). Whenever one of the preceding events to `e` completes a full fill, there is the possibility for an excess that must be taken out of the running balance. This is because the full fill amount originally allocated as an Outflow for the slow fill, is now no longer needed. Subtract the running balance by the excess amount.

##### Handling running balance bounds
If at any point in time, the running balance exceeds the [threshold upper or lower running balance](#selecting-running-balance-bounds-for-bridging-event), then reset the running balance count to the "target lower" or "target upper". The running balance for computing the incentive fee for `e` is computed as if the running balance at the time of the event `e` was added to `e.amount`. The next bridge event `e_{i+1}` just will use the target running balance instead of the opening balance `+ e.amount`.

For example, if the `threshold_upper_bound=100`, `target_upper_bound=50`, then if the running balance exceeds 100, then reset it to 50. Similarly if the threshold lower bound is passed, then go to the target lower bound.

Once you get to `e`, stop and you have the running balance for `e`.

### Computing Incentive Pool for Bridging Event

#### Finding the Opening Incentive Pool

Similar to [finding the closing balance](#finding-the-closing-balance-for-e), we need to identify the last validated `incentivePool` included with a `bundleEndBlock` preceding `e`. Follow [these steps](#identifying-running-balances-and-incentive-pool-amounts-for-token-chain-combinations) to find the incentive pool size within a `runningBalance` array for the chain associated with `e`.

We now have the "Opening Incentive Pool" amount associated with a "Preceding Validated Bundle".

Finally, add the [incentive fee adjustment](#token-constants) to the Opening Incentive Pool amount to account for any donations to the pool. This rule implies that any time an Admin wants to donate to the incentive pool, they should increment the `incentiveFeeAdjustment` configuration variable to make sure that the [cap on the applied incentive fee](#computing-incentive-fee-using-incentive-pool-size-running-balance-and-incentive-curve-for-e) is raised.

#### Finding the Closing Incentive Pool size for e

Step through all events between the last validated bundle's end block and `e`. For each event, compute the total incentive fee charged to `e` using the steps in [this section](#computing-incentive-fee-using-incentive-pool-size-running-balance-and-incentive-curve-for-e). Break down the incentive fee into the LP Fee and the Balancing Fee by following [these steps](#breaking-down-the-incentive-fee). Each of these events preceding `e` should add their `BalancingFee` to the Incentive Pool, where the Balancing Fee is negative for rewards and positive for penalties (i.e. penalties add to the pot and rewards are withdrawn from the pot).

On the origin chain, add `depositBalancingFee * deposit.amount` to the incentive pool, and on the destination chain, add `refundBalancingFee * refundAmount` to the incentive pool. Balancing fees can be negative if they are rewards to the depositor or relayer. The "refundAmount" is equal to `((1 - (fill.realizedLpFeePct)) * deposit.amount)`, i.e. the original deposited amount minus the LP fee.

#### Selecting Incentive Curve for Bridging Event

Identify the [UBA Fee Curve Parameters](#token-constants) for the L1 token equivalent for `e` and the chain ID where `e` was emitted by finding the parameters preceding the `quoteTimestamp` for `e`. We use the `quoteTimestamp` in order to compare the L1 timestamp of `e` with the time that the UBA fee curve parameters were set in the `ConfigStore` on L1. 

If `e` is a deposit, then use `deposit.quoteTimestamp` and if `e` is a fill or refund, then first find the matched deposit for `e` and then use `deposit.quoteTimestamp`.

If `e` is a deposit, then find the Inflow Curve parameters, otherwise find the Outflow Curve parameters.

#### Selecting Running Balance Bounds for Bridging Event

Identify the [UBA Fee Curve Bounds](#token-constants) for the L1 token equivalent and chain for `e` similarly to finding the incentive curve for `e`.

### Collecting Fees in Across

_[This page](https://docs.across.to/how-across-works/fees) should provide an up to date overview of how the fee model is implemented in Across._

The Across contracts enforce that users receive their deposited amount minus the `relayerFeePct` and `realizedLpFeePct`. The `relayerFeePct` is set by the user and includes compensation to the Relayer for their cost of capital and gas expenditures on the destination chain. The `relayerFeePct` might also include enough to pay out the relayer's Refund Balancing Fee, but its ultimately up to the user to set this as high as they want to bid for a relayer's service. If the `relayerFeePct` is not large enough to fairly compensate a relayer, then the user can "speed up" their deposit by increasing the `relayerFeePct` by signing and broadcasting a message on-chain.

The `realizedLpFeePct` will be computed at relay time and set by the relayer. It should include the LP and Deposit Balancing fee using fee curve parameters defined on-chain. If the `realizedLpFeePct` is set incorrectly, then the relayer will not be refunded as the relay will not be included in a bundle of valid relays by the Dataworker.

The dataworker will need to compute the expected LP and Deposit Balancing fee for each relay and accumulate the LP fees in the `bundleLpFees`.

Any bridging action will contain Deposit and Refund Balancing Fees which are either penalties or rewards paid out on the origin and destination SpokePools respectively. The dataworker will need to recompute these balancing fees to determine the size of the incentive pool at the end of the bundle for each SpokePool, and payout correct refunds.

Deposit recipients specified in Inflows will ultimately receive `(1 - (deposit.relayerFeePct + fill.realizedLpFeePct)) * deposit.amount` from the relayer. In other words, relayers will send to deposit recipients the deposited amount minus the relayer fee and the deposit balancing fee. This amount refunded is the "refund amount".

Relayers will receive a refund out of the SpokePool's balance equal to `((1 - (fill.realizedLpFeePct)) * deposit.amount) * (1 - refundBalancingFee)`. This is equal to the amount that the relayer sent to the deposit recipient plus the `relayerFee` minus the refund balancing fee.

The running balances to set for a bundle are equal to the closing running balances following the final bridging event per chain in the bundle.

## UBA Fee Curve Parameters

UBA Fee Curves are defined completely by parameters set in the `ConfigStore` under a token configuration's `uba` key at a specific point in time. If there are no parameters set for a timestamp, then the following default values should be used:

### Running Balance Bounds

These are described in the `uba` dictionary (under the subkey `rebalance`) in the [config store](#token-constants). The following defaults are to be used if there is entry for a token.

- `threshold_lower_bound`
   - The default for this variable is 0.
- `target_lower_bound`
   - The default for this variable is INFINITY
- `threshold_upper_bound`
   - The default for this variable is 0.
- `target_upper_bound`
   - The default for this variable is INFINITY

### Computing the LP Fee

This fee is an additional fee charged to allow the bridge to stay operational during times of high bridge demand and reward LPs for backstopping all bridges.

The LP Fee will be structured as a constant plus a piecewise linear function of utilization. The linear functions are described solely by `alpha` and `gamma` in the [config store](#token-constants)'s `uba` dictionary. For each bridging event, LP's always earn $\alpha$, the baseline LP fee, plus some utilization portion. 

For now, `gamma` is an undefined curve so only `alpha` is charged as the LP fee. In the near future, `gamma` will be used as the function to integrate utilization pre and post relay over. The pre and post utilization values will depend only on the relay origin chain, destination chain, amount, and hub pool block number equivalent.

The Dataworker will sum the LP fees from a bundle of bridging events and them to the `bundleLpFees` array to return funds back to LPs. The `bundeLpFees` array is included in the [PoolRebalanceRoot](#constructing-the-poolrebalanceroot).

# Preliminary Information

The ooRequester address is expected to be an instance of the
[HubPool contract](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol).

If any of the expected details in the ooRequester are not available in the expected form because the HubPool does not
match the expected interface, the identifier should return `0`.

To get the proposal data, the voter should find events that match
[this signature](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L148-L156)
on the ooRequester. The event that describes this proposal is the matching event with the highest block number whose
timestamp is less than or equal to the timestamp of the price request. If there are two matching events that both
satisfy this criteria, then it can be resolved in one of two ways. If the timestamp matches the request timestamp,
then the [earlier event](#comparing-events-chronologically) is the one to be
used. If the timestamp is earlier than the request timestamp, the [later event](#comparing-events-chronologically) should be used.

# Proposal Information

From the selected event, one should be able to glean the following information:
- `bundleEvaluationBlockNumbers`
- `poolRebalanceRoot`
- `relayerRefundRoot`
- `slowRelayRoot`

## Determining block range for root bundle proposal
The `bundleEvaluationBlockNumbers` is an ordered array of end block numbers for each destination chain for this bundle. Which index
corresponds to which chain is denoted by the "CHAIN_ID_LIST" in the [global config](#global-constants).

To determine the start block number for each chainId, search for the latest
[RootBundleExecuted event](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L157-L166)
with a matching `chainId` while still being earlier than the timestamp of the request. Once that event is found, search
for the
[ProposeRootBundle](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L148-L156)
event that is as late as possible, but earlier than the RootBundleExecuted event we just identified. Once this proposal event is found, determine its
mapping of indices to `chainId` in its `bundleEvaluationBlockNumbers` array using "CHAIN_ID_LIST". For
each `chainId`, their starting block number is that chain's `bundleEvaluationBlockNumber + 1` in this previous [valid proposal](#valid-bundle-proposals) event.
Use this mechanism to determine the starting block numbers for each `chainId` represented in the original
`bundleEvaluationBlockNumbers`.

Note that the above rules require that the `bundleEvaluationBlockNumbers` for each `chainId` are strictly greater than the preceding [valid proposal's](#valid-bundle-proposals) `bundleEvaluationBlockNumbers` for the same `chainId`. The block range for each proposal starts at the preceding proposal's `bundleEvaluationBlockNumbers` plus 1 and go to the next `bundleEvaluationBlockNumbers`.

Note also that the above rules for determining an end block don't apply if the chain ID is in the "DISABLED_CHAINS" list. if a chain exists in DISABLED_CHAINS, the proposed bundle must reuse the bundle end block from the last valid proposal before it was added. Specifically, if a chain exists in DISABLED_CHAINS at the "mainnet" end block (chain ID 1) for a particular proposal, the end block for that chain should be identical to its value in the latest executed bundle.

Evaluate the
[crossChainContracts](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L59)
method on the HubPool contract (passing each `chainId`) at the block number of the proposal to determine the addresses
for the
[SpokePool contract](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/SpokePool.sol)
for each destination chain. We'll use these SpokePool addresses to query correct event data in the next section.

# Finding Valid Relays

For each destination chain, find all
[FilledRelay events](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/SpokePool.sol#L139-L100L155)
on its `SpokePool` between the starting block number and ending block number for that chain. For this query, exclude
any `FilledRelay` events that have `isSlowRelay` set to `true` or have `fillAmount` equal to `0`.

For all `FilledRelay` events, you can find the `SpokePool` address for the deposit's origin chain by querying
[CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L119)
and finding all matching events where the `l2ChainId` matches the `originChainId` value in the FilledRelay event. The
`spokePool` values in these events are all possible spoke pools that this deposit could have been from. 

We can't assume the latest
`SpokePool`s are used so that we don't block old deposits from being relayed. The actual spoke pool to use is the address in the last `CrossChainContractsSet` event emitted on Ethereum before the deposit on the origin chain was sent. (We can use [this methodology](#comparing-deposit-events-chronologically-for-different-origin-chains) to identify the `CrossChainContractsSet` Ethereum `block.timestamp` with the deposit's `quoteTimestamp`). 

Note: in the sections below, if the relay is considered to be invalid at any point, that relay must not be considered
when constructing the bundle.

For each `FilledRelay` event found earlier, a
[FundsDeposited](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/SpokePool.sol#L119-L130)
event should be found in one of the spoke pools for the originChainId where the following parameters match:

- `amount`
- `originChainId`
- `destinationChainId`
- `relayerFeePct`
- `depositId`
- `recipient`
- `depositor`
- `message`

## Matching L2 tokens and L1 tokens

Additionally, matching relays should have their `destinationToken` set such that the following process is satisfied:

1. Find the latest
   [SetRebalanceRoute](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L137-L141)
   events [with a block timestamp at or before the `quoteTimestamp`](#comparing-deposit-events-chronologically-for-different-origin-chains) in the associated `FundsDeposited` event where the
   `originChainId` and `originToken` match the `destinationChainId` and `destinationToken`. Pull the `l1Token` value
   from the matching event. If there is no matching event, the relay is invalid.
2. Search the `SetPoolRebalanceRoute` events for the same `l1Token` and `destinationChainId` before or at the
   `quoteTimestamp`. If there are any matching events later than the one found in step 1, the relay is invalid.
3. Using the `l1Token` value found in step 1, search for the latest `SetRebalanceRoute` event at or before the
   `quoteTimestamp` with that `l1Token` and with the `destinationChainId` that matches the `destinationChainId` value
   from the `FundsDeposited` event. If a match is found, the `destinationToken` should match the `destinationToken`
   value in the `FilledRelay` event. If they don't match or if no matching event is found, the relay is invalid.

## Validating realizedLpFeePct

To determine the validity of the `realizedLpFeePct` in the `FilledRelay` event, we must compute the [deposit balancing fee](#computing-deposit-and-refund-balancing-fees) for the matched deposit of the fill.

## Setting the realizedLpFeePct for a Fill

The `realizedLpFeePct` should be equal to deposit balancing fee plus the LP fee for the matched deposit.

# Finding Slow Relays

To determine all slow relays, follow the following process:

1. For all valid `FilledRelay` events above, group them by `originChainId` and `depositId`.
2. Remove all groups that contain a `FilledRelay` event where `totalFilledAmount` equals `amount`. This removes deposits that have been 100% filled.
3. Remove all groups that do not contain an event where `filledAmount` is nonzero and equal to `totalFilledAmount`. This keeps only deposits whose earliest fill is in this time range.

For all remaining groups, they should be stored in a list of slow relay groups.

## Computing Slow Relay payment amounts

For a given slow relay identified [above](#finding-slow-relays), we can compute the associated deposit's "unfilled amount" as `deposit.amount - latestFill.totalFilledAmount`, where `latestFill` is the last fill chronologically for a deposit. Since each fill increments `totalFilledAmount`, the `latestFill` can also be identified by sorting all fills associated wiht a deposit and keeping the fill with the largest `totalFilledAmount`. 

Note: Since  we eliminated all fills where `totalFilledAmount == deposit.amount`, the remaining "last fill" should have `totalFilledAmount < deposit.amount` AND have `totalFilledAmount > [all other fills for deposit].totaFilledAmount`.

## Slow Fill payout adjustments

Slow fills are implicitly created whenever there is at least one valid partial fill for a deposit, but where the deposit has not been filled completely at the time of the bundle being proposed.

Because the existing partial fill(s) have been successfully validated, the deposit has an associated `realizedLpFeePct`. If the resulting slow fill is ultimately executed, it inherits the same `realizedLpFeePct` as the previous validated partial fills. The recipient will therefore receive the deposited amount minus the `realizedLpFeePct`, which is equal to the deposit incentive fee.

However, slow fills are unlike normal fills in that there is no relayer who should be charged the refund balancing fee. Slow fills ultimately cause a token outflow from the destination spoke pool, so intuitively the slow fill should be charged the refund balancing fee.

The `payoutAdjustmentPct` is therefore set equal to the refund balancing fee percentage for the outflow amount at the time of the first partial fill `e` that triggered
the deposit. `payoutAdjustmentPct = refundBalancingFee / e.amount`.

Follow [this guide](#computing-deposit-and-refund-balancing-fees) to determine the refund balancing fee for `e`.

Slow fills always create outflows from the destination SpokePool, but its possible that follow-on partial fills can cause the slow fill execution to create a smaller outflow than originally earmarked for the fill. This is why the `payoutAdjustmentPct` is set as a percentage of the remaining fill amount.

# Constructing the PoolRebalanceRoot

To construct the `poolRebalanceRoot`, you need to form a list of running balances for unique chain and token combinations.

The running balance for a chain and token can be found by following [this section](#finding-the-closing-balance-for-e) up until the bundle end block for the `chain`. 

The bundle LP fees for the chain and token combination can be found by summing the [LP Fee components](#computing-the-lp-fee) for each bridging event in the bundle.

Set the `runningBalances` array equal to the running balances found above concatenated with a [closing incentive pool](#finding-the-closing-incentive-pool-size-for-e) array.

Set the `netSendAmounts` array equal to the sum of all manual running balance adjustments that occur when certain running balance [bounds are breached](#handling-running-balance-bounds).

## Finding the Preceding Running Balance for an L1 Token
We now need to add the preceding running balance value to the current one for a given `repaymentChainId` and `l1Token`.
For each `repaymentChainId` and `l1Token` combination, older
[RootBundleExecuted](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L157-L166) events
should be queried to find the preceding `RootBundleExecuted` event. This means identifying the most recent `RootBundleExecuted` event with a `chainId` matching the `repaymentChainId` and [identifying the `runningBalanceValue` at the index of the `l1Token`](#matching-l1-tokens-to-running-balances-or-net-send-amounts).

For each tuple of `l1Token` and `repaymentChainId`, we should have computed a total running balance value. In certain scenarios the bundle should "carry over" part of the running balance value to the `netSendAmount` parameter in the bundle proposal and "zero out" the running balance:

See [this section](#finding-the-running-balance-for-e) for computing the running balance for any bridging event. Over the course of a bundle, the running balance might exceed certain "running balance bounds". At these junctures, the running balance should be reset to the [target running balances](#selecting-running-balance-bounds-for-bridging-event). The amounts added to or subtracted from the current running balances to implement this "reset" should be accumulated throughout the bundle and set equal to the bundle's `netSendAmount` for the chain and token.

Take the above running balances and net send amounts and group them by only `repaymentChainId` and sort by `repaymentChainId`. Within
each group, sort by `l1Token`. If there are more than [`MAX_POOL_REBALANCE_LEAF_SIZE`](#global-constants) `l1Tokens`, a particular chain's leaf will
need to be broken up into multiple leaves, starting at `groupIndex` 0 and each subsequent leaf incrementing the
`groupIndex` value by 1.

Now that we have ordered leaves, we can assign each one a unique `leafId` starting from 0.

With all of that information, each leaf should be possible to construct in the format given
[here](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPoolInterface.sol#L13-L42).
Importantly, the `l1Tokens`, `bundleLpFees`, `netSendAmounts` and `runningBalances` arrays should all be the same length. The latter three arrays are values mapped to the `l1Tokens` entry of the same index. See [this section](#matching-l1-tokens-to-running-balances-or-net-send-amounts) to better explain how to map `l1Tokens` to the other three arrays.

Once the leaves are constructed, the merkle root can be constructed by hashing each leaf data structure using
Solidity's standard process of `keccak256(abi.encode(poolRebalanceLeaf))`. Once the leaves are hashed, the tree should
be constructed in the standard way such that it is verifyable using
[OpenZeppelin's MerkleProof](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/contracts/utils/cryptography/MerkleProof.sol)
library. See examples [here](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/742e85be7c08dff21410ba4aa9c60f6a033befb8/test/utils/cryptography/MerkleProof.test.js)
for how to construct these types of trees.

# Constructing RelayerRefundRoot

Let's assume that we've [identified groups of valid relays](#finding-valid-relays) for each `destinationChainId` and `l1Token` combination. All `FillRelay` events found for a particular `destinationChainId` and
`l1Token` that have `isSlowRelay` set to `false` will be referred to as
"fast relays" in this section.

For each combination of `destinationChainId` and `l1Token` that either a) has fast relays
or b) has a negative net send amount arising from [exceeding running balance bounds](#handling-running-balance-bounds), a RelayerRefundRoot must be constructed. The data structure is shown
[here](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/interfaces/SpokePoolInterface.sol#L9-L23).
One or more (in the case of leafs with more than [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) refunds) `RelayerRefundLeaf` will be
constructed for each of these applicable groups. The following defines how to construct each of these leaves given the
information about each group determined in the previous section.

The `amountToReturn` should be set to `max(-netSendAmount, 0)`.

The `l2TokenAddress` is the corresponding L2 token address for the `l1Token` in the previous section. Note: see [above section](#matching-l2-tokens-and-l1-tokens) for how to map L1 and L2 tokens via events on L1. This mapping should be done according to the highest
`quoteTimestamp` of any relays in the group. If no relays are present, then as of the previous successful proposal.

`refundAmounts` and `refundAddresses` are just computed by grouping the relays in this group by the `relayer` and
summing the `amount - (amount * lpFeePct / 1e18)` for each relay. These should be sorted in descending order of
`refundAmounts`. If two `refundAmounts` are equal, then they should be sorted by `relayer` address.

If there are more than [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) `refundAddresses` for a particular `l2TokenAddress` then
these should be split up into [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) element leaves (sorted as described above) with only
the first leaf for a particular `l2TokenAddress` able to contain a nonzero amountToReturn.

Once these are computed for all relays, the leaves (or groups of leaves for > 25 elements) should be sorted by
`chainId` as the primary index, then `l2TokenAddress` as the secondary index, and then the individual sorting
of > [`MAX_RELAYER_REPAYMENT_LEAF_SIZE`](#global-constants) element groups as the tertiary sorting. Once these are sorted, each leaf can be
given a `leafId` based on its index in the group, starting at 0.

Once these leaves are constructed, they can be used to form a merkle root as described in the previous section.


# Constructing SlowRelayRoot

To construct the SlowRelayRoot leaves as described
[here](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/interfaces/SpokePoolInterface.sol#L29-L49),
just form leaves based on all the slow relays found in the "Finding Slow Relays" section above. The information in the
relays should map directly to the leaf data structure.

Their primary sorting index should be `originChainId` and the secondary sorting index should be `depositId`.

You can then construct a merkle root similar to how it's done in the previous two sections.

# Determing the Result

Three conditions must be met for the proposal to be deemed valid:
1. The roots computed above match the ones in the proposal.
2. The poolRebalanceLeafCount specified in the proposal event matches the number of pool rebalance leaves computed in
   the PoolRebalanceRoot above.
3. `bundleEvaluationBlockNumbers` must include all `chainIds` that have a nonzero
   [CrossChainContractsSet](https://github.com/across-protocol/contracts-v2/blob/0d8bb01605a850d8b72a32a494a9f9d762240311/contracts/HubPool.sol#L119)
   at the time of proposal.
4. No obvious griefing or manipulation of the system is being performed via this proposal.

If the proposal is deemed invalid, return 0. If valid, return 1. Note: these values are scaled by `1e18`.
