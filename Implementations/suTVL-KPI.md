## Title:
SuperUMAn DAO TVL KPI Option

## Summary:
The KPI options minted through this implementation document are intended for distribution to the SuperUMAn DAO to incentive their members to continue the pursuit of increased TVL in Outcome financial contracts. This implementation doc is intended to be used with the General_KPI price identifier. These objectives and corresponding payouts are detailed in the Implementation section.

## Intended Ancillary Data:
Metric:"TVL in UMA LSP, OG, and OD contracts denominated in the price of 10k ETH",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/suTVL-KPI.md", Rounding:3, Scaling:0

## Implementation:

### LSP Contracts

1. Go to the [networks](https://github.com/UMAprotocol/protocol/tree/master/packages/core/networks) folder in the [UMA protocol monorepo](https://github.com/UMAprotocol/protocol). Each network file is represented by a chain Id json file. For each, check for `LongShortPairCreator` key-value pairs. An example would be:

    {
    "contractName": "LongShortPairCreator",
    "address": "0x439a990f83250FE2E5E6b8059F540af1dA1Ba04D"
    }

Check each network folders commit history to ensure all LongShortPairCreator active contracts are being included.

Note: [Chainlist.org](https://chainlist.org/) can be a good reference if mapping chain ID to the network name.

2. For each `address` value from step 1, fetch all `CreatedLongShortPair` events emitted by each LongShortPairCreator address and take note of the `longShortPair` parameter for each event.

3. For the list of contract addresses returned from step 2, call `expirationTimestamp` on each contract. Remove contracts that have an `expirationTimestamp` value less than the request timestamp so that you have a list of only active contracts.

4. For each address from the list from step 3, call the `collateralToken` method to retrieve the collateral token address for each LSP contract.

5. Call the `balanceOf()` method on the collateral contract from step 4 using the LSP contract address from step 2 as the argument at the latest available block at or before the request timestamp.

Determine the collateral balance for each of the three previous hours from the latest available block at or before the request timestamp. Sum these balances and divide the total by three to retrieve the value that will be used for the collateral token deposited into the LSP contract.

This [script](https://github.com/UMAprotocol/protocol/blob/master/packages/affiliates/liquidity-mining/FindBlockAtTimeStamp.js) can be used to find the block number closest to a given timestamp. 

6. Scale down the balances returned from Step 5 by calling the `decimals()` method on the collateral token contracts from Step 4.

7. For each returned values from Step 6, retrieve the latest available pricing at or before each of the evaluation timestamps from CoinGecko:
    * Based on CoinGecko [API documentation](https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range) construct price API request with the following parameters:
      * `id`: CoinGecko platform id - should be set based on the chainId from the networks folder;
      * `contract_address`: ERC-20 collateral token address from step 4;
      * `vs_currency`: Should be set to "eth";
      * `from`: should be set to a timestamp before the request timestamp that returns pricing intervals that are not less frequent than 1 hour to avoid inconsistent price intervals;
      * `to`: end timestamp (identified by `expirationTimestamp`);
    * Example API request for BOBA token pricing in USD: https://api.coingecko.com/api/v3/coins/ethereum/contract/0x42bbfa2e77757c645eeaad1655e0911a7553efbc/market_chart/range?vs_currency=eth&from=1646092800&to=1648771200
    * Locate the `prices` key value from CoinGecko API response - it should contain a list of [ timestamp, price ] value pairs. Note that returned CoinGecko timestamps are in milliseconds;
    * In case returned pricing interval is more frequent than 1 hour voters should extend the requested time range. This is necessary to have consistent pricing results independent of when the voters are calculating them.
    * Voters should verify that obtained price results agree with broad market consensus.

8. Multiply the values returned from step 6 and step 7. 

9. Sum the total values from step 8 and divide the value by 10,000. Round the returned value to 3 decimal places.

### Other Outcome TVL & contracts

At the time of writing, the LSP contract is currently the only active Outcome contract that has a TVL value. Outcome will also include optimistic distributor and optimistic governor contracts.

Optimistic distributor and optimistic governor contracts do not follow factory pattern, so supported Outcome contracts will be published on docs.

**Additional information for UMA DVM participants:**
      
## Intended Application:
It is intended to deploy the documented KPI Options on the Ethereum mainnet network using [LSP Contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with 'General_KPI' price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). This contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the 'lowerBound' set to 0 and the 'upperBound' set to 1.

'collateralPerPair' parameter for the LSP contract would be set to 1 so that the maximum payout per KPI option would reach 1 UMA if the max value denominated in 10k ETH is reached at the request timestamp.

Example 1: The SuperUMAn DAO achieves A TVL value of 2,000 ETH. The calculation would be 2,000 / 10,000 = 0.2 and 0.2 UMA would be allocated to the long token and 0.8 UMA would be allocated to the short token.

Example 2: The SuperUMAn DAO achieves A TVL value of 7,500 ETH. The calculation would be 7,500 / 10,000 = 0.75 and 0.75 UMA would be allocated to the long token and 0.25 UMA would be allocated to the short token.