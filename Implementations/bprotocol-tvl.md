## Title
B. Protocol TVL Calculation:

## Summary

This calculation is intended to track the TVL of B. Protocol users in various lending platforms and will be used with the `General_KPI` price identifier. At the time of authorship, these lending platforms include Compound, Maker and Liquity but could be extended depending on B. Protocol governance and development.

The recommended querying methodology is to use DefiLlama’s TVL calculator. This implementation doc will also describe how the TVL calculation works behind the scenes, so that it could be reproduced by voters querying for on-chain data only.

## Intended Ancillary Data

```
Metric:TVL in BPRO financial contracts measured in USD,
Endpoint:"https://api.llama.fi/protocol/B.Protocol",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/bprotocol-tvl.md",
Key:totalLiquidityUSD,
Interval:Daily,
Rounding:0,
Scaling:0
```
***Note 1:** `totalLiquidityUSD` should be referenced for the timestamp that falls earlier but nearest to the price request timestamp.*  

## Implementation

With DeFiLlama:
1. Voters should query the endpoint listed in Intended Ancillary Data.
2. Voters should find the timestamp key in the `tvl` object that corresponds to the timestamp that is earlier but closest to the price request timestamp, and then use the corresponding `totalLiquidityUSD` value rounded to 0 decimal places.
3. If the `totalLiquidityUSD` is equal to or greater than 150,000,000, voters should return 3.
4. If the `totalLiquidityUSD` is less than 150,000,000, voters should return 1.

Without DeFiLlama:

### Compound TVL

1. Call `avatarList` on the Registry contract (0xbF698dF5591CaF546a7E087f5806E216aFED666A). This will query a list of all account addresses.
2. Call `getAllMarkets()` on the Compound comptrollerAddress contract (0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B). This returns cToken supply and borrow asset addresses.
3. For each cToken contract address returned in step 2, call `underlying` on the cToken contract address to determine the underlying token address. Since ETH does not have an underlying asset on Compound, for cETH (0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5) use WETH (0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2) as the underlying token.
4. Convert each account address balance from a cToken balance to its underlying token balance by calling `balanceOfUnderlying()` on the cToken contract using the account address as an argument.
5. Sum the underlying token balances returned in step 4 for each individual cToken. Multiply the total balance for each cToken by the exchange rate of the underlying asset returned in step 3 at the timestamp being used. Each cToken balance should be priced in USD for the same timestamp and the value should use the timestamp that falls earlier but nearest to the price request timestamp. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
6. Sum all cToken balances from step 5 which represents the total Compound TVL in USD.

### Maker TVL

1. Call `cdpi()` on the bTvlAddress contract (0x60312e01A2ACd1Dac68838C949c1D20C609B20CF). Use the bcdpmanagerAddress contract address (0x3f30c2381CD8B917Dd96EB2f1A4F96D91324BBed) as the argument which returns the number of existing CDPs.
2. Call `cdpTvl()` on the bTvlAddress contract (0x60312e01A2ACd1Dac68838C949c1D20C609B20CF) to return the value of each CDP denominated in ETH:
- For the first argument, use the bcdpmanagerAddress contract address (0x3f30c2381CD8B917Dd96EB2f1A4F96D91324BBed).
- For the second argument, start with 0 and call `cdpTvl()` at an increment of 1 until the parameter is equal to the returned `cdpi()` value in step 1.
- For the third argument, set the ilk parameter to 0x4554482d41000000000000000000000000000000000000000000000000000000 (ETH-A). 
3. Each CDP should be priced in ETH for the same timestamp. The value should use the timestamp that falls earlier but nearest to the price request timestamp. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
4. Sum all returned values from step 2. This represents the total balance of all CDPs as an ETH balance. Multiply the total balance by the price of ETH at the timestamp being used.

### Liquity TVL

1. Call `bamms()` on the bKeeperAddress contract (0xeaE019ef845A4Ffdb8829210De5D30aC6FbB5371). 
2. Call `getCompoundedLUSDDeposit()` on the stabilityPoolAddress contract (0x66017D22b0f8556afDd19FC67041899Eb65a21bb) using each returned output from step 1 as an argument.
3. Each pool should be priced in LUSD for the same timestamp. The value should use the timestamp that falls earlier but nearest to the price request timestamp. DeFiLlama estimates this by using aggregated CoinGecko prices, but all voters should verify that results agree with broad market consensus.
4. Sum the total of all returned values from step 2. This represents the total deposits as an LUSD value.

### Total TVL

1. Sum the values from step 6 for Compound TVL, step 4 for Maker TVL, and step 4 for Liquity TVL. This represents the TVL value calculated in USD for all assets locked across B.Protocol contracts on Ethereum.
2. If the returned value is equal to or greater than 150,000,000, voters should return 3.
3. If the returned value is less than 150,000,000, voters should return 1.

## Intended Application:

The use case is to use KPI options to incentivize TVL. The initial payout function is:
1. If the TVL of B. Protocol reaches or exceeds $150m, the KPI option will be worth 3 BPRO tokens.
2. If the TVL does not reach the $150m threshold, the KPI Options will be worth 1 BPRO.
