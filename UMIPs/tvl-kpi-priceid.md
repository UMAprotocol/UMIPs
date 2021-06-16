## Headers

| UMIP-X             |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add UMA_TVL_KPI as an approved price identifier|
| Authors             | Sean Brown        |
| Status              | Draft                                                         |
| Created             | June 16, 2021                                              |
| Discourse Link      |  |


# Summary 

The DVM should support price requests for the `UMA_TVL_KPI` price identifier. `UMA_TVL_KPI` is intended to be used with ancillary data to allow anyone to request a price based upon certain criteria that is generally associated with KPI Options. Optional ancillary data parameters include - `lower_price_bound`, `upper_price_bound`, `lower_tvl_bound`, `upper_tvl_bound`, `twapLength`, `scaling_factor`, `criteria_1 ... criteria_X`, `penalty_1 ... penalty_X`, `contract_address`.

This is intended to allow KPI Options deployers to use 1 price identifier to determine:
- An UMA contract's KPI Options payout based upon locked TVL.
- If certain `BINARY_QUESTION` like criteria has been met for a specific contract.

# Motivation

This price identifier will allow for a wide range of UMA TVL based KPI options to be deployed with a single price identifier.  

# Data Specifications 

It is not possible to define all of the specific data sources or markets for this identifier. Determination of data sources and results for `criteria` questions is left up to voters at the time of settlement, as the best method of determining the results for each request will depend on the criteria specified.

TVL data sources include:
- On-chain UMA contract information.
- CoinGecko prices for the collateral used by a contract.

# Price Feed Implementation

Pricing should only be needed at settlement. The exact pricing script used should be based off of the `contract_address`, `twapLength` and other parameters specified, as well as the collateral used by the specific contract tracked. [Here](https://github.com/UMAprotocol/protocol/blob/master/packages/merkle-distributor/kpi-options-helpers/calculate-uma-tvl.ts) is an example script to calculate the TVL of all registered UMA contracts. This should be adjusted to: perform the twap calculation and only query for the contract passed in `contract_address`.

# Technical Specifications

-----------------------------------------
- Price identifier name: UMA_TVL_KPI
- Base Currency: NA
- Quote Currency: NA
- Rounding: 2 decimal places.
- Estimated current value of price identifier: NA


## Ancillary Data Specifications

When converted from bytes to UTF-8, the ancillary data should be a dictionary object containing `contract_address`, `min_price`, `max_price`, `lower_tvl_bound`, `upper_tvl_bound`, `twapLength`, `criteria_1 ... criteria_X`, `penalty_1 ... penalty_X` keys and values:

```
contract_address:0x0f4e2a456aAfc0068a0718E3107B88d2e8f2bfEF, min_price:0.1, max_price:2, lower_tvl_bound:100000, upper_tvl_bound:10000000, twapLength:86400, criteria_1:Was a position in this contract ever undercapitalized (below 100% collateralized)?, penalty_1:100
```

When this ancillary data dictionary is stored as bytes, the result would be: `0x636f6e74726163745f616464726573733a3078306634653261343536614166633030363861303731384533313037423838643265386632626645462c206d696e5f70726963653a302e312c206d61785f70726963653a322c206c6f7765725f74766c5f626f756e643a3130303030302c2075707065725f74766c5f626f756e643a31303030303030302c20747761704c656e6774683a38363430302c2063726974657269615f313a576173206120706f736974696f6e20696e207468697320636f6e7472616374206576657220756e6465726361706974616c697a6564202862656c6f77203130302520636f6c6c61746572616c697a6564293f2c2070656e616c74795f313a313030`

The values are as follows:
- contract_address: The Ethereum or EVM compatible chain address of the EMP, LSP or Perpetual UMA contract. This contract's TVL is what should be factored into the TVL calculation.
- min_price: The minimum price that the KPI option can be worth. This value should not be scaled in the ancillary data. The KPI option price can only be settled below this price if criteria is not met. If all criteria is met, and TVL is equal to `lower_tvl_bound`, the KPI option will expire to the `min_price`.
- max_price: The maximum price that the KPI option can be worth. If all criteria is met, and TVL is equal to `upper_tvl_bound`, the KPI option will expire to the `max_price`.
- lower_tvl_bound: 


Default values to use if these key/value pairs are not defined or cannot be decoded correctly.
- contract_address: 
- min_price:
- max_price:
- lower_tvl_bound:
- upper_tvl_bound:
- twapLength:
- criteria_1:
- penalty_1:

When returned, the `min_price`, `max_price` or any value in between should be scaled by 1e18. Typically voter dapps in the UMA ecosystem abstract this scaling away from voters, so, more often than not, voters should input the values as they appear in the ancillary data. Price requestors should be mindful of this, and not scale their ancillary data inputs.

# Rationale

TO DO

# Implementation

TO DO

# Security Considerations

This construction sacrifices assurances of determinism in favor of greater price identifier flexibility. Users of this price identifier should be careful to construct ancillary data in the correct format. This price identifier is inherently less risky than most, since it is intended to be used in controlled KPI options contracts.

