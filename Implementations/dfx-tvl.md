## Title

DFX TVL KPI Options Calculation

## Summary

DFX is a decentralized exchange protocol with a dynamically tuned bonding curve optimized for fiat-backed stablecoins (like USDC, CADC, EURS, XSGD, etc.) using real-world FX price feeds. The goal of the KPI options program is to motivate TVL growth of DFX protocol and this document will detail the calculation method of DFX TVL measured in USD on Ethereum and Polygon chains.

## Rationale

As of time of authorship of this document DeFi Pulse and DefiLlama adapters for DFX protocol support tracking TVL only on Ethereum chain and the development of DFX Subgraph is work in progress, hence, voters would need to manually check DFX contract data on-chain at historical price request timestamp.

Since CoinGecko does not yet support pricing data for one of DFX pool currencies CADC and CoinMarketCap free tier does not provide access to historical data, the only feasible option is to use USD liquidity values tracked by DFX pool smart contracts. DFX pool contracts calculate these USD liquidity values by multiplying pool reserve balances with external oracle provided pricing. Since the oracle does not dictate the price, but rather provides a reference point for the pool bonding curve, note that the obtained USD value could slightly differ from real-time value of pool tokens on secondary markets.

The methodology listed in this document could be modified once historical pricing data becomes generally accessible for all DFX pool tokens or historical data indexing services cover DFX TVL on all chains.

## Intended Ancillary Data

```
Metric:TVL in DFX pool contracts measured in USD,
Endpoint:"<DFX_API_ENDPOINT>",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/dfx-tvl.md",
Key:<KEY>,
Interval:latest block before price request,
Rounding:0,
```
***Note:** <DFX_API_ENDPOINT> might not yet be available at the launch of KPI options, hence, `Endpoint` and `Key` parameters would be skipped. Voters would need to rely only on independent calculation based on this implementation document.*

## DFX Pool  Contracts

DFX TVL KPI options track value locked in following pool contracts:
* DFXv0.5 CADC on Ethereum: [0xa6c0cbcaebd93ad3c6c94412ec06aaa37870216d](https://etherscan.io/address/0xa6c0cbcaebd93ad3c6c94412ec06aaa37870216d)
* DFXv0.5 EURS on Ethereum: [0x1a4Ffe0DCbDB4d551cfcA61A5626aFD190731347](https://etherscan.io/address/0x1a4Ffe0DCbDB4d551cfcA61A5626aFD190731347)
* DFXv0.5 XSGD on Ethereum: [0x2baB29a12a9527a179Da88F422cDaaA223A90bD5](https://etherscan.io/address/0x2baB29a12a9527a179Da88F422cDaaA223A90bD5)
* DFXv0.5 NZDS on Ethereum: [0xE9669516e09f5710023566458F329cCE6437AaaC](https://etherscan.io/address/0xE9669516e09f5710023566458F329cCE6437AaaC)
* DFXv0.5 TRYB on Ethereum: [0xC574A613A3900e4314da13eB2287f13689A5b64D](https://etherscan.io/address/0xC574A613A3900e4314da13eB2287f13689A5b64D)
* DFXv0.5 XIDR on Ethereum: [0xdD39379AB7C93b9bAAE29E6eC03795d0bC99a889](https://etherscan.io/address/0xdd39379ab7c93b9baae29e6ec03795d0bc99a889)
* DFXv0.5 CADC on Polygon: [0x288Ab1b113C666Abb097BB2bA51B8f3759D7729e](https://polygonscan.com/address/0x288Ab1b113C666Abb097BB2bA51B8f3759D7729e)
* DFXv0.5 EURS on Polygon: [0xB72d390E07F40D37D42dfCc43E954Ae7c738Ad44](https://polygonscan.com/address/0xB72d390E07F40D37D42dfCc43E954Ae7c738Ad44)
* DFXv0.5 XSGD on Polygon: [0x8e3e9cB46E593Ec0CaF4a1Dcd6DF3A79a87b1fd7](https://polygonscan.com/address/0x8e3e9cB46E593Ec0CaF4a1Dcd6DF3A79a87b1fd7)
* DFXv0.5 NZDS on Polygon: [0x931d6A6cC3F992beee80a1A14a6530d34104B000](https://polygonscan.com/address/0x931d6a6cc3f992beee80a1a14a6530d34104b000)
* DFXv0.5 TRYB on Polygon: [0xeA75Cd0b12A8B48F5bDDaD37cEB15F8Cb3D2cC75](https://polygonscan.com/address/0xea75cd0b12a8b48f5bddad37ceb15f8cb3d2cc75)

The list above is based on the canonical DFX protocol [contracts repository](https://github.com/dfx-finance/contracts/blob/main/README.md) and would be amended once new pool contracts are developed by DFX protocol.

## Implementation

 1. For each DFX pool contract listed above call the `liquidity()` method at the latest available block at or before the request timestamp (access to Ethereum and Polygon archive nodes would be required). Take a note on the returned index 0 `total_` values from the request output.
 2. Scale down values from Step 1 by 18 decimals to obtain USD reference value of each pool.
 3. Sum all DFX pool USD values from Step 2.
 4. Round the obtained TVL from Step 3 to 0 decimal places before returning it as resolved price request.

## Intended Application

It is intended to deploy the documented KPI options with the same parameters both on Ethereum and Polygon chains using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contracts would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol).

