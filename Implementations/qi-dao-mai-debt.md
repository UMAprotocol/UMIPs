## Title

Calculation of borrowed MAI from QiDao vaults

## Summary

QiDao allows to borrow MAI stablecoin (pegged to $1) at 0% interest by locking collateral in vault contracts. The payout from these KPI options depends on the total amount of MAI stablecoin borrowed from vaults, thereby giving every recipient an incentive to grow the protocol.

This document will detail the calculation method for the amount of borrowed MAI through vaults across all supported chains at the request timestamp.

## Intended Ancillary Data

```
Metric:Amount of outstanding MAI debt in QiDao vaults,
Endpoint:"https://api.mai.finance/totalDebt",
Method:"https://github.com/UMAprotocol/UMIPs/blob/master/Implementations/qi-dao-mai-debt.md",
Interval:latest block before price request,
Rounding:2
```

## Implementation

Total borrowed MAI in QiDao vaults is determined by fetching on-chain data from all deployed vault contracts. Each supported collateral has its own distinct vault contract that should be monitored across supported chains. As of time of authorship of this document Polygon, Fantom, Avalanche and Arbitrum chains are supported by QiDao, but this could be extended to other chains in the future.

### Vault contracts

|Chain|Vault|Address|Subgraph|
|---|---|---|---|
|Polygon|MATIC|[0xa3Fa99A148fA48D14Ed51d610c367C61876997F1](https://polygonscan.com/address/0xa3Fa99A148fA48D14Ed51d610c367C61876997F1)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-mai-finance-og|
|Polygon|camWMATIC|[0x88d84a85A87ED12B8f098e8953B322fF789fCD1a](https://polygonscan.com/address/0x88d84a85A87ED12B8f098e8953B322fF789fCD1a)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-amwmatic-vaults|
|Polygon|WETH|[0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C](https://polygonscan.com/address/0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C)|https://api.thegraph.com/subgraphs/name/0xlaozi/mai-finance-weth-vaults|
|Polygon|camWETH|[0x11A33631a5B5349AF3F165d2B7901A4d67e561ad](https://polygonscan.com/address/0x11A33631a5B5349AF3F165d2B7901A4d67e561ad)|https://api.thegraph.com/subgraphs/name/0xlaozi/mai-finance-cam-weth-vaults|
|Polygon|camAAVE|[0x578375c3af7d61586c2C3A7BA87d2eEd640EFA40](https://polygonscan.com/address/0x578375c3af7d61586c2C3A7BA87d2eEd640EFA40)|https://api.thegraph.com/subgraphs/name/0xlaozi/mai-finance-cam-aave-vaults|
|Polygon|AAVE|[0x87ee36f780ae843A78D5735867bc1c13792b7b11](https://polygonscan.com/address/0x87ee36f780ae843A78D5735867bc1c13792b7b11)|https://api.thegraph.com/subgraphs/name/0xlaozi/mai-finance-aave-vaults|
|Polygon|LINK|[0x61167073E31b1DAd85a3E531211c7B8F1E5cAE72](https://polygonscan.com/address/0x61167073E31b1DAd85a3E531211c7B8F1E5cAE72)|https://api.thegraph.com/subgraphs/name/0xlaozi/mai-finance-link-vaults|
|Polygon|CRV|[0x98B5F32dd9670191568b661a3e847Ed764943875](https://polygonscan.com/address/0x98B5F32dd9670191568b661a3e847Ed764943875)|https://api.thegraph.com/subgraphs/name/0xlaozi/mai-finance-curve-vaults|
|Polygon|WBTC|[0x37131aEDd3da288467B6EBe9A77C523A700E6Ca1](https://polygonscan.com/address/0x37131aEDd3da288467B6EBe9A77C523A700E6Ca1)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-wbtc-vaults|
|Polygon|camWBTC|[0x7dDA5e1A389E0C1892CaF55940F5fcE6588a9ae0](https://polygonscan.com/address/0x7dDA5e1A389E0C1892CaF55940F5fcE6588a9ae0)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-cam-wbtc-vaults|
|Polygon|BAL|[0xf6906b1Cf79Ab14c79DdC7D763c1A517cF9968A5](https://polygonscan.com/address/0xf6906b1Cf79Ab14c79DdC7D763c1A517cF9968A5)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-bal-vaults|
|Polygon|dQUICK|[0x9e6e3e8161Fffb31a6030E56a3E024842567154F](https://polygonscan.com/address/0x9e6e3e8161Fffb31a6030E56a3E024842567154F)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-dquick-vaults|
|Polygon|BAL v2|[0x701A1824e5574B0b6b1c8dA808B184a7AB7A2867](https://polygonscan.com/address/0x701A1824e5574B0b6b1c8dA808B184a7AB7A2867)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-bal-vaults-v2|
|Polygon|dQUICK v2|[0x649Aa6E6b6194250C077DF4fB37c23EE6c098513](https://polygonscan.com/address/0x649Aa6E6b6194250C077DF4fB37c23EE6c098513)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-dquick-vaults-v2|
|Polygon|GHST|[0xF086dEdf6a89e7B16145b03a6CB0C0a9979F1433](https://polygonscan.com/address/0xF086dEdf6a89e7B16145b03a6CB0C0a9979F1433)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-ghst-vaults|
|Polygon|camDAI|[0xD2FE44055b5C874feE029119f70336447c8e8827](https://polygonscan.com/address/0xD2FE44055b5C874feE029119f70336447c8e8827)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-camdai-vaults|
|Fantom|WFTM|[0x1066b8FC999c1eE94241344818486D5f944331A0](https://ftmscan.com/address/0x1066b8FC999c1eE94241344818486D5f944331A0)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-fantom-vaults|
|Fantom|yvWFTM|[0x7efB260662a6FA95c1CE1092c53Ca23733202798](https://ftmscan.com/address/0x7efB260662a6FA95c1CE1092c53Ca23733202798)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-yvwftm-vaults|
|Fantom|yvDAI|[0x682E473FcA490B0adFA7EfE94083C1E63f28F034](https://ftmscan.com/address/0x682E473FcA490B0adFA7EfE94083C1E63f28F034)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-yvdai-vaults|
|Fantom|WETH|[0xD939c268C49c442F037E968F045ba02f499562D4](https://ftmscan.com/address/0xD939c268C49c442F037E968F045ba02f499562D4)|https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-fantom-eth-vaults|
|Fantom|AAVE|[0xdB09908b82499CAdb9E6108444D5042f81569bD9](https://ftmscan.com/address/0xdB09908b82499CAdb9E6108444D5042f81569bD9)||
|Fantom|SUSHI|[0x267bDD1C19C932CE03c7A62BBe5b95375F9160A6](https://ftmscan.com/address/0x267bDD1C19C932CE03c7A62BBe5b95375F9160A6)||
|Fantom|LINK|[0xd6488d586E8Fcd53220e4804D767F19F5C846086](https://ftmscan.com/address/0xd6488d586E8Fcd53220e4804D767F19F5C846086)||
|Fantom|BTC|[0xE5996a2cB60eA57F03bf332b5ADC517035d8d094](https://ftmscan.com/address/0xE5996a2cB60eA57F03bf332b5ADC517035d8d094)||
|Fantom|mooScreamBTC|[0x5563Cc1ee23c4b17C861418cFF16641D46E12436](https://ftmscan.com/address/0x5563Cc1ee23c4b17C861418cFF16641D46E12436)||
|Fantom|mooScreamDAI|[0xBf0ff8ac03f3E0DD7d8faA9b571ebA999a854146](https://ftmscan.com/address/0xBf0ff8ac03f3E0DD7d8faA9b571ebA999a854146)||
|Fantom|mooScreamETH|[0xC1c7eF18ABC94013F6c58C6CdF9e829A48075b4e](https://ftmscan.com/address/0xC1c7eF18ABC94013F6c58C6CdF9e829A48075b4e)||
|Fantom|mooScreamFTM|[0x3609A304c6A41d87E895b9c1fd18c02ba989Ba90](https://ftmscan.com/address/0x3609A304c6A41d87E895b9c1fd18c02ba989Ba90)||
|Fantom|mooScreamLINK|[0x8e5e4D08485673770Ab372c05f95081BE0636Fa2](https://ftmscan.com/address/0x8e5e4D08485673770Ab372c05f95081BE0636Fa2)||
|Fantom|mooBooBTC-FTM|[0xF34e271312e41Bbd7c451B76Af2AF8339D6f16ED](https://ftmscan.com/address/0xF34e271312e41Bbd7c451B76Af2AF8339D6f16ED)||
|Fantom|mooBooETH-FTM|[0x9BA01B1279B1F7152b42aCa69fAF756029A9ABDe](https://ftmscan.com/address/0x9BA01B1279B1F7152b42aCa69fAF756029A9ABDe)||
|Avalanche|mooAaveAVAX|[0xfA19c1d104F4AEfb8d5564f02B3AdCa1b515da58](https://snowtrace.io/address/0xfA19c1d104F4AEfb8d5564f02B3AdCa1b515da58)||
|Arbitrum|WETH|[0xF5c2B1b92456FE1B1208C63D8eA040D464f74a72](https://arbiscan.io/address/0xf5c2b1b92456fe1b1208c63d8ea040d464f74a72)||

In case QiDao protocol is expanded with new contracts and this document is not up to date the voters should refer to the canonical list of vault contract addresses at [MAI Finance Docs](https://docs.mai.finance/functions/smart-contract-addresses).

### Event log method

1. For each listed Vault contract above fetch all emitted `BorrowToken`, `PayBackToken`, `BuyRiskyVault` and `LiquidateVault` events emitted till the last available block relative to the request timestamp. Note that only one of `BuyRiskyVault` or `LiquidateVault` events are available for particular contract depending on Vault contract version.
2. Add up all `amount` fields from all `BorrowToken` events from Step 1 and scale down by 18 decimals. This represents the gross MAI token amount borrowed from vaults till request timestamp.
3. Add up all `amount` fields from all `PayBackToken` events from Step 1 and scale down by 18 decimals. This represents the gross MAI token amount repaid back to vaults till request timestamp.
4. Add up all `amountPaid` fields from all `BuyRiskyVault` events from Step 1 and scale down by 18 decimals. This represents the gross amount of burned MAI tokens as a result of liquidated debt positions in v1/v2 vaults till request timestamp.
5. Add up all `halfDebt` fields from all `LiquidateVault` events from Step 1 and scale down by 18 decimals. This represents the gross amount of paid back MAI tokens as a result of liquidated debt positions in v3 vaults till request timestamp.
6. Subtract gross repaid MAI debt (Step 3) and liquidated debt (Steps 4 and 5) from gross borrowed MAI (Step 2) to obtain net outstanding MAI debt in QiDao vaults.

### Subgraph method

It is acknowledged that above instructions might require significant effort to fetch event logs for all contracts across all supported chains especially considering that some of RPC endpoint providers limit the amount of event logs that can be fetched in one request for alternative chains. Hence, it could be more efficient to use indexing services (e.g. The Graph Protocol) for voters to verify total amount of borrowed MAI. Note that not all Vault contracts have subgraphs available, but it should be then possible to use contract call method (described in the next section) as newer Vault versions have implemented the `totalBorrowed` method.

1. Identify available subgraph API endpoints from the Vault contract list above.
2. Construct subgraph query by making sure that `number` parameter in the `block` object corresponds to the latest available block number relative to price request timestamp, e.g.:
   ```
   {
     protocols(first: 1, block: {number: 21215934}) {
       totalBorrowed
     }
   }
   ```
3. Perform `POST` request on each of API endpoints identified in Step 1. As an illustration, `curl` request for the MATIC Vault on Polygon would look like:
   ```
   curl -X POST \
     -d '{"query": "{protocols(first: 1, block: {number: 21215934}) {totalBorrowed}}"}' \
     'https://api.thegraph.com/subgraphs/name/0xlaozi/qi-dao-mai-finance-og'
   ```
4. Take a note on the raw borrowed MAI (`totalBorrowed` key value) from the returned subgraph response for each vault API endpoint and scale it down by 18 decimals.
5. Add up all outstanding MAI debt amounts in supported vault contracts from Step 4.

### Contract call method

Accounting of total borrowed amounts is correctly implemented only in the newest Vault contract versions, thus this method must be used only for those Vaults that have empty subgraph column in the Vault contracts table above.

1. Call the `totalBorrowed` method on each of supported Vault contracts (see note above) for the block number that is at or the latest before the request timestamp. Note that this method requires access to archive state node.
2. Take a note on the returned raw borrowed MAI from each of the contract calls in Step 1 and scale it down by 18 decimals.
3. Add up all outstanding MAI debt amounts in supported vault contracts from Step 2.

### Combining results

In case of event log method the results can be processed as is, but subgraph and contract call methods are complementary to each other (depending on vault contract version), hence their resulting MAI debt should be added together for further processing.

### API endpoint

For convenience QiDao protocol is serving the API endpoint passed as `Endpoint` parameter to the ancillary data. The returned value should be scaled down by 18 decimals to get outstanding MAI debt in all Vaults. As of time of authorship of this document it provides only real-time data that could be helpful for KPI option owners to track the value of their expected payouts. Before this API endpoint also implements historical lookback data the voters should follow the manual verification procedures detailed above.

## Post processing

Since QiDao has opted to provide minimum guaranteed payout of 1 Qi per KPI options token and currently the audited financial product libraries do not allow setting minimum payout floor above zero voters should perform post-processing on the borrowed MAI and return a value between 1 and 2 to the submitted price request:

1. Divide resolved MAI debt amount with maximum threshold of 7,500,000,000 MAI and add 1 to this ratio.
2. In case the MAI debt exceeds 7,500,000,000 MAI the resolved price should be capped at 2.
3. Round the resolved Qi payout above to 2 decimals before returning it as resolved price request.

## Intended Application

It is intended to deploy the documented KPI options on Polygon chain using [LSP contract](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/long-short-pair/LongShortPair.sol) with `General_KPI` price identifier approved in [UMIP-117](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-117.md). The contract would use [Linear LSP FPL](https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/LinearLongShortPairFinancialProductLibrary.sol) with the `lowerBound` set to 0 and `upperBound` set to 2.

`collateralPerPair` parameter for the LSP contract would be set to 2 so that the maximum payout per KPI option would reach 2 Qi if the outstanding vault debt is at or above 7,500,000,000 MAI.
