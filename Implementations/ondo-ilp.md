## Headers

| UMIP-TBD           |                                                                                 |
| ------------------- | ------------------------------------------------------------------------------- |
| UMIP Title          | Add Ondo_ILP as supported price identifier                                  |
| Authors             | Alex (againes@umaproject.org)                   |
| Status              | DRAFT                                                                       |
| Created             | Feb. 28, 2022                                                                  |
| Discourse Link      | TBD |


# Summary

The DVM should support price requests for Ondo_ILP. The Ondo_ILP price identifier will allow [Ondo](https://ondo.finance/) to use the price identifier to track the impermanent loss protection metric for its vault product offering. This identifier will use ancillary data to guide voters to reach the impermanent loss calculation result correctly.

This UMIP outlines the critical considerations for any user of this identifier. The user acknowledges that extra steps are required to use the identifier to resolve the contract at expiry.

# Motivation

This identifier sets a general standard for calculating Ondo IL and removes the need to create individual proposals for each vault. The objective of this identifier is to provide impermanent loss protection to liquidity providers of Ondo vaults.

The user of the Ondo_ILP price identifier is intended to have the necessary ancillary data before deploying a contract.

# Data Specifications

All relevant price data is computed using information that can be found directly on the blockchain.

-----------------------------------------

- Price identifier name: `Ondo_ILP`
- Base Currency: Determined by the `VaultId`
- Quote Currency: NA
- Rounding: Round to 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
- Example price providers: Infura and Alchemy include information on Ondo vault contract events.
- Cost to use: [Infura](https://infura.io/) supports up to 100,000 requests per day for free and [Alchemy](https://www.alchemy.com/) allows 300,000,000 compute units/month for free along with archive data. You will need an archive node to perform the calculation using the script from the Price Feed Implementation below.
- Real-time price update frequency: Updated every block
- Historical price update frequency: Updated every block


# Ancillary Data Specifications

`VaultID`: Each Ondo Vault has a unique id number created by hashing the metadata on the Vault: asset pair, strategy contract, start time, investment time, and duration of the product. The `VaultID` is used to get event data for the vault to perform the IL calculation.

`VaultContractAddress`: Including the `VaultContractAddress` in the ancillary data lets Voters know which `VaultID` contract to check events for.

```
VaultID:0x02b9d144d64e12baa6b8f0ce82763fcef25c5b403c24eb299958bc077b7d9573,
VaultContractAddress:0x2bb8de958134afd7543d4063cafad0b7c6de08bc,
StartTimestamp:1644858900,
EndTimestamp:1647450900
```

Key-value pairs above are separated by newlines just for readability, but no newlines should be used in real application. When this ancillary data dictionary (without newlines) is stored as bytes, the result would be:

```
5661756c7449443a3078303262396431343464363465313262616136623866306365383237363366636566323563356234303363323465623239393935386263303737623764393537332c5661756c74436f6e7472616374416464726573733a3078326262386465393538313334616664373534336434303633636166616430623763366465303862632c537461727454696d657374616d703a313634343835383930302c456e6454696d657374616d703a31363437343530393030
```

A resource for finding the `VaultID` and `VaultContractAddress` is using the Ondo API. The API should only be used as a helpful resource with all data should be confirmed on the blockchain:
- [Tranche data](https://data.ondo.finance/v1/tranches): the `VaultId` corresponds with `vaultId` and `VaultContractAddress` with `contract` in the vault object.
- [Vault data](https://data.ondo.finance/v1/vaults): the `VaultId` corresponds with `id` and the `VaultContractAddress` corresponds with `contract`.

When designing ancillary data, the deployer should be aware that the total size of ancillary data cannot exceed 8192 bytes also accounting for any ancillary data stamping by Optimistic Oracle. This limit would be checked by the LSP creator contract upon contract deployment.

# Rationale

The user of this UMIP accepts responsibility to provide the information passed through via ancillary data is sufficient to resolve price requests. Suppose the user of the price identifier cannot give enough information for UMA token holders to determine the outcome. In that case, UMA token holders can resolve the price request to zero (unless other non-zero unresolvable state value was provided in the ancillary data). The payout to long Ondo_ILP token recipients in unresolvable state would depend on the actual financial product library (FPL) used, but for the most common [Linear LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) or [Binary LSP](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/BinaryOptionLongShortPairFinancialProductLibrary.sol) FPLs that would expire the long Ondo_ILP tokens in a worthless state.

# Implementation

When a price request is made, the following process should be followed:

1. Identify the `VaultId`, `VaultContractAddress`, `StartTimestamp` and `EndTimestamp` from the contracts ancillary data which will be used used to identify which Ondo vault impermanent loss is being calculated for. See the Ancillary Data Specifications section for more information on retrieving this data.
2. Use the `VaultContractAddress` from step 1 to call the `getVaultById` method with the `VaultId` as the argument and retrieve the `vaultStrategy` contract address and the `token` address for each tranche.
3. Identify the `poolAddress` by calling the `getVaultInfo` method on the `vaultStrategy` contract from step 2 using the `VaultId` as the argument.
4. Get total LP reserves by calling `getReserves()` method on the LP contract from Step 3 at the latest available block at or before each of the evaluation timestamps. This should return `token0` and `token1` balances as index 0 `_reserve0` and index 1 `_reserve1` respectively for each evaluation timestamp. Confirm these addresses match the `token` address for each tranche from step 2.
5. For both LP reserve tokens from Step 4 use the latest available pricing for each reserve currency before each of the evaluation timestamps from CoinGecko:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct price API request with following parameters:
      * `id`: CoinGecko platform id - Ondo vaults currently only use "ethereum";
      * `contract_address`: reserve token address from Step 4;
      * `vs_currency`: TVL measurement currency based on the passed `TVLCurrency` parameter in the ancillary data (e.g. "usd");
      * `from`: start timestamp (`StartTimestamp` parameter from the ancillary data);
      * `to`: end timestamp (`EndTimestamp` parameter from the ancillary data);
    * Note that some tokens might not be supported by CoinGecko on all chains  - in such case consult supported currency/platform list at https://api.coingecko.com/api/v3/coins/list?include_platform=true and replace to supported `id`  and `contract_address` for the same reserve token.
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] values. For each evaluation period (Step 1) choose the price at the latest timestamp before the evaluation timestamp (CoinGecko timestamps are in milliseconds);
    * Voters should verify that obtained price results agree with broad market consensus.
6. Scale down LP reserve balances from Step 4 with their respective decimals (call `decimals()` method on the token contracts from Step 2).
7. Multiply each LP reserve token balance from Step 6 with its price from Step 5 for each evaluation timestamp.
8. Sum both LP reserve balances returned from Step 7 to get the total value of the pool for each evaluation timestamp.
9. Get the total LP token supply by calling `totalSupply()` method on the LP contract from Step 3 at the latest available block at or before each evaluation timestamp. Get the portion of the pool balance owned by the vault by calling the `balanceOf()` method on the `poolAddress` using the `vaultStrategy` from step 2 as the argument. 
10. Divide the balance of the vault strategy by the total supply of the pool from step 9 to get the percentage of the pool owned by the vault.
11. Multiply the total reserve balances from step 8 by the percentage of the pool owned by the vault from step 10 to get the value of the vault for each evaluation timestamp.
12. Identify the value of the two reserve currencies from step 2 if liquidity had not been provided to the pool by using the `StartTimestamp` reserve balances from step 4 multiplied by the CoinGecko `EndTimestamp` prices from step 5. Sum these values together to get the total value of the pool for each evaluation timestamp.
13. Calculate impermanent loss by dividing the returned value from step 11 by the returned value from step 12 and subtracting 1. Multiply by 100 and round the returned value to 6 decimals to arrive at the final value as a percentage.

# Security Considerations

One of the main concerns is that someone with sufficient tokens for a pool chooses to manipulate the price. If a pool has little liquidity, a liquidity provider could potentially influence the price before the Redeemed event which would impact the impermanent loss calculation.

Another concern is if the ancillary data is constructed incorrectly or the data is not available. In the event this were to occur, UMA token holders are instructed to resolve the price request to zero.

Adding these new identifiers by themselves poses little security risk to the DVM or priceless financial contract users. However, anyone using these price identifiers should take care to parameterize their price requests appropriately for their use case.