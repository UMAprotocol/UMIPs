## Headers

| UMIP                |                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| UMIP Title          | Add TOKEN_PRICE as a supported price identifier                                                  |
| Authors             | Reinis Martinsons (reinis@umaproject.org)                                                        |
| Status              | Draft                                                                                            |
| Created             | July 23, 2021                                                                                    |
| Discourse Link      | [UMA's Discourse](https://discourse.umaproject.org/t/create-general-token-price-identifier/1265) |

# Summary

The DVM should support price requests for TOKEN_PRICE identifier that returns a price of any fungible token expressed in units of another fungible token, cryptocurrency or fiat currency. Ancillary data will guide voters in identifying which token should be priced, what should be its quote currency, which markets should be queried and any other processing instructions for resolving a particular price request.

This UMIP outlines the critical considerations for any user of this identifier. The user acknowledges that extra steps are required to use the identifier for their specific TOKEN_PRICE to resolve at expiry.

# Motivation

This price identifier will allow a deployer to use any UMA-approved collateral token to be locked in Long Short Pair (LSP) contracts for issuing range bonds, success tokens, call options or any other financial instrument parameterized in its specific financial product library without the need for a use-specific UMIP. This will considerably reduce the time and effort involved in creating a contract where no such identifier exists.

Even though currently users of LSP contracts would most likely benefit from this generic price identifier, it could also be used by any other contract integrating with Optimistic Oracle as long as it is able to set custom ancillary data, and it could even be used in future versions of EMP contracts once this functionality is implemented.

# Data Specifications

-----------------------------------------
- Price identifier name: TOKEN_PRICE
- Markets & Pairs: Should be inferred from the `configuration` parameter from the ancillary data
- Example data providers: Should be inferred from the `configuration` parameter from the ancillary data
- Cost to use: Should be free to use unless mentioned in the optional `access` parameter from the ancillary data
- Real-time data update frequency: Not applicable for non-liquidable contracts like LSP
- Historical data update frequency:
  - AMM, liquidity pool composition or vault token pricing in underlying token: updated every block (e.g. ~15 seconds for Ethereum)
  - CEX & Forex pricing: Depends on the actual data provider set in the `configuration` parameter from the ancillary data, but generally the lower bound on the price update frequency should be a minute (or any longer period between two consecutive trades)

# Price Feed Implementation

This price identifier can use any price feed from the [UMA protocol repository](https://github.com/UMAprotocol/protocol/tree/master/packages/financial-templates-lib/src/price-feed) as long as it allows pricing the collateral token quoted in the required other token, crypto currency or fiat currency. The actual price feed configuration should be passed as JSON formatted object in the `configuration` parameter from the ancillary data.

If the required application needs a new price feed implementation, the user of this price identifier can develop its own price feed and open the Pull Request. In case of new price feed implementation the user should wait before it is reviewed and merged into the main (master) branch of the [UMA protocol repository](https://github.com/UMAprotocol/protocol) in order for other proposers/disputers and UMA voters being able to run the price feed script with the passed configuration from the ancillary data.

## Ancillary Data Specifications

When converting ancillary data to UTF8 string it must contain price request parameters expressed as a list of key-value pairs delimited by `,` (commas) and each key-value pair further delimited by `:` (colons). If a value should contain `,` or `:` characters, such value should be enclosed in double quotes. The below listed key parameters will be used to instruct voters how to resolve a given price request for this identifier and request timestamp:
- `base`: Collateral token symbol that should be priced in the submitted price request.
- `baseAddress`: `base` token deployment address on Ethereum network (or any other network if `baseChain` parameter is provided). In case the token is deployed on several networks the user of this price identifier is free to select any network as long as it allows correctly identifying the required base token.
- `baseChain` (optional): ChainID number for the network where base token is deployed. If omitted, Ethereum mainnet would be assumed.
- `quote`: Quote currency symbol in which the `base` token should be priced in
- `quoteDetails`: Additional details to unambiguously identify the quote currency. For cryptocurrencies or fiat currencies this should be the full name of the currency. For fungible tokens it should be the token address on Ethereum network or any other network if accompanied by its ChainID in this parameter.
- `rounding`: This is an integer number defining how many digits should remain to the right of the decimal delimiter after rounding the obtained price.
- `access` (optional): In case data sources in the `configuration` parameter require any special access tokens, this parameter should describe the source for acquiring access and any associated costs, as well as provide the key variable name for the `PRICEFEED_CONFIG` environment variable.
- `fallback`: Data endpoint(s) to use as a fallback mechanism either for the whole `base`/`quote` price request or resolving part of failing data source components (e.g. alternative for Token/ETH when calculating Token/USD). When providing alternative data source components it should be clearly indicated for which part of calculation this fallback source should be used.
- `unresolved` (optional): This is numeric value that voters should return for unresolvable price request (defaults to zero if omitted).
- `configuration`: Price feed configuration formatted as a JSON object that can be used to construct a price feed by [CreatePriceFeed.js](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CreatePriceFeed.js). Please consult UMA documentation covering the selection and configuration of price feed for more details. Also note that default UMA price feed configuration is formatted as JavaScript objects, thus all key names should be enclosed in doublequotes, no comments are allowed, math expressions should be kept in one line and there should be no trailing commas after the last element in JSON. Even though technically proposer/dispute bots would be able to pick up any correctly formatted configuration for available price feed implementation, this price feed configuration should only be used for pricing the `base` token in terms of the `quote` currency.

When designing the ancillary data TOKEN_PRICE user should be aware that the total size of ancillary data cannot exceed 8192 bytes also accounting for any ancillary data stamping by Optimistic Oracle. This limit would be checked by the LSP creator contract upon the deployment.

As an example, possible ancillary data for UMA token priced in USD (as specified in UMAUSD in [UMIP-57](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-57.md)) if the user was using TOKEN_PRICE price identifier instead:

```
base:UMA,baseAddress:0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828,quote:USD,quoteDetails:United States Dollar,rounding:6,fallback:"https://www.coingecko.com/en/coins/uma",configuration:{
    "type": "medianizer",
    "minTimeBetweenUpdates": 60,
    "twapLength": 3600,
    "medianizedFeeds": [
      { "type": "cryptowatch", "exchange": "coinbase-pro", "pair": "umausd" },
      { "type": "cryptowatch", "exchange": "binance", "pair": "umausdt" },
      { "type": "cryptowatch", "exchange": "okex", "pair": "umausdt" }
    ]
  }
```

When this ancillary data dictionary is stored as bytes, the result would be (based on [this tool](https://www.rapidtables.com/convert/number/ascii-to-hex.html)):

```
0x626173653a554d412c62617365416464726573733a3078303446613064323335433461626634426346343738376146344346343437444535373265463832382c71756f74653a5553442c71756f746544657461696c733a556e697465642053746174657320446f6c6c61722c726f756e64696e673a362c66616c6c6261636b3a2268747470733a2f2f7777772e636f696e6765636b6f2e636f6d2f656e2f636f696e732f756d61222c636f6e66696775726174696f6e3a7b0a202020202274797065223a20226d656469616e697a6572222c0a20202020226d696e54696d654265747765656e55706461746573223a2036302c0a2020202022747761704c656e677468223a20333630302c0a20202020226d656469616e697a65644665656473223a205b0a2020202020207b202274797065223a202263727970746f7761746368222c202265786368616e6765223a2022636f696e626173652d70726f222c202270616972223a2022756d6175736422207d2c0a2020202020207b202274797065223a202263727970746f7761746368222c202265786368616e6765223a202262696e616e6365222c202270616972223a2022756d617573647422207d2c0a2020202020207b202274797065223a202263727970746f7761746368222c202265786368616e6765223a20226f6b6578222c202270616972223a2022756d617573647422207d0a202020205d0a20207d
```

# Rationale

The technical implementation of this price identifier is to allow flexibility for DAO treasuries to configure their own price feed. Scalability at the cost of security trade-off occurs when off-loading the configuration externally.

The user of this UMIP accepts the responsibility to provide the information passed through via ancillary data is sufficient to resolve price requests.

# Implementation

1. Voters should decode the ancillary data and add the JSON object from the `configuration` parameter as a value (naming its key to be unique) to `defaultConfigs` dictionary object in [DefaultPriceFeedConfigs.js](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js). As an example, choosing `UMAUSD_CUSTOM` as key name from the example in Ancillary Data Specifications section would become:
   ```
   const defaultConfigs = {
     // Leave other price feed configs here
     "UMAUSD_CUSTOM": {
       "type": "medianizer",
       "minTimeBetweenUpdates": 60,
       "twapLength": 3600,
       "medianizedFeeds": [
         { "type": "cryptowatch", "exchange": "coinbase-pro", "pair": "umausd" },
         { "type": "cryptowatch", "exchange": "binance", "pair": "umausdt" },
         { "type": "cryptowatch", "exchange": "okex", "pair": "umausdt" }
       ]
     }
   }
   ```
2. In case there are syntax issues with the passed price feed `configuration` voters should attempt to fix it as long as it is unambiguously possible to infer the intended price sources and the calculation logic from this parameter.
3. Prepare the `.env` file in the root of UMA [protocol](https://github.com/UMAprotocol/protocol) repository - it should contain `CUSTOM_NODE_URL` variable pointing to Ethereum node (full archive node is required in case the price feed configuration depends on fetching historical state) and `PRICE_FEED_CONFIG={"lookback":300000}`. `lookback` value of 300000 seconds ensures that prices can be looked up historically during the maximum DVM resolvement period of 72 hours plus added reserve for any required TWAP start period before that. In case `access` parameter is passed on in the ancillary data, voters should also follow the instructions mentioned in this parameter and add any required API key to the `PRICE_FEED_CONFIG` dictionary object.
4. Voters should run the price feed with the selected key name as `--identifier` and requested timestamp as `--time` parameter from the root of UMA [protocol](https://github.com/UMAprotocol/protocol) repository. Following on the example above, the command would be:
   ```
   yarn truffle exec ./packages/core/scripts/local/getHistoricalPrice.js --network mainnet_mnemonic --identifier UMAUSD_CUSTOM --time 1626984000
   ```
5. Obtained price feed script value should be rounded leaving `rounding` number of digits after the decimal delimiter. If the next digit after `rounding` equals or is larger than 5, then price should be rounded up, otherwise it should be rounded down. In case the `rounding` parameter is not provided or it is not possible to interpret its value, voters should apply default rounding of 6 digits after the decimal delimiter.
6. It might be possible that some data sources do not return price data for the requested timestamp due to lack of trading activity or any other technical reason causing the price feed script to fail. In case the price feed `configuration` contains alternative pricing routes for the same asset pair (e.g. when calculating median), voters should reconfigure it without the failing data source and attempt to calculate the requested price from the remaining data sources.
7. In case it is not possible to resolve the requested price either due to lack of trading activity in the specified markets or the `configuration` parameter being misconfigured, voters should attempt to resolve the price from the passed `fallback` parameter:
   - Unless other guidance is provided in the `fallback` parameter, voters should assume that the provided endpoint should be queried for the price of `base` expressed in the `quote` currency.
   - If `fallback` includes multiple price data endpoints for the same pair, the obtained prices should be medianized.
   - If `fallback` includes price data endpoints for multiple pairs, the obtained prices should be combined in attempt to calculate `base` expressed in the `quote` currency.
   - In case either `base` or `quote` are interest bearing, vault, liquidity pool or similar tokens that can be converted to their underlying token(s) at the smart contract level, but there are no direct trading markets for obtaining reliable price information, on-chain data should be used to express either `base` or `quote` tokens in terms of their underlying token(s) and then combine it with other pair pricing data from the provided endpoint(s) in the `fallback` parameter to obtain `base` expressed in `quote` currency.
8. In case the fallback mechanism is required, but the provided `fallback` parameter is misconfigured or the provided data endpoints become unavailable: 
   - Voters should attempt to identify relevant markets for involved trading pairs in order to calculate `base` expressed in units of `quote` using the guidance provided in step 7 above.
   - In case the ancillary data passed does not allow to identify the requested `base` token, voters can assume `base` to be the collateral currency of the requesting contract if it allows to unambiguously identify it. Note that currently all financial contracts developed by UMA do have single collateral currency, but this might change in the future and Optimistic Oracle integrations are not restricted to UMA developed financial contracts.
   - In case the ancillary data passed does not allow to identify the requested `quote` currency, voters can assume it to be USD (United States Dollar) by default.
9. Voters should use human judgement on whether the obtained results could be a reasonable estimation for the price of `base` token expressed in terms of `quote` currency and ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus, but some of example issues to check out are:
   - Whether the passed price feed `configuration` has any implicit assumptions on the pegging of any trading pairs that do not hold true at the time of the price request that should be corrected accordingly (e.g. a stablecoin has lost its peg to USD).
   - Whether an attempted price manipulation can be detected for any of involved trading pairs that should be corrected with additional price period protection (e.g. TWAP). Voters should apply special attention to this in case the value locked in the requesting contract is substantial relative to the liquidity in any of involved trading pair markets.
10. In case of the lack of any available trading markets at the time of price request (e.g. due to delisting) UMA token holders should resolve the price request to zero. Though, the optionally passed `unresolved` parameter in the ancillary data might set any other non-zero fallback value that the voters should return as a last resort for otherwise unresolvable price request and voters should respect this fallback value to the extent it is unambiguously recognizable in the passed ancillary data.

# Security considerations

Anyone deploying a new contract referencing this TOKEN_PRICE identifier should take care to parameterize the contract appropriately to avoid the loss of funds for end users. Particularly, contract deployers should verify that running the price feed script with the passed `configuration` parameter in the ancillary data yields the expected price result before funding the contract.

It is technically possible to launch a financial contract referencing this TOKEN_PRICE identifier before there is any trading market available by setting the price feed `configuration` parameter that should be expected to work at the time of the price request (e.g. either by guessing CEX trading pair identifier pattern or using deterministic pool addresses for Uniswap pairs). In this case both funders of such financial contracts and end users buying the minted synthetic tokens should accept the risk of loosing part or all of invested funds if there is no public trading market available at the time of price request and UMA voters have to resolve the price request to `unresolved` parameter or zero.

The same risk scenario described above also applies to any other trading pair that had available markets at the time of deployment, but due to dried up liquidity or delisting there is no public pricing data available at the time of price request for UMA voters to resolve it. Hence, in case this TOKEN_PRICE identifier is used by DAO treasuries to sell derivative financial products backed by native project token, it should be the responsibility of project team to ensure that the native project token is listed with sufficient liquidity at the time of price request so that it can be resolved by UMA voters. End users buying such financial products should also carefully observe the availability of public trading data and evaluate the financial ability of project team to ensure adequate trading activity for its native project token.

Even though currently this TOKEN_PRICE identifier would most likely be used in LSP contracts one could also use it in EMP contracts if they would support setting custom ancillary data in the future versions. In such scenario end users should take special care to verify the provided price feed configuration. For specific price identifiers UMIP reviewers and UMA voters are providing additional security layer, but for the generic TOKEN_PRICE identifier the responsibility to check price feed configuration is shifted on end users. Hence, before funding such contracts end users should verify that custom ancillary data is consistent, it includes valid and working price feed configuration, risk of sharp movements in price or market manipulation attacks is limited, as well as there is sufficient liquidity in collateral market allowing liquidators to purchase collateral and mint synthetic tokens to liquidate positions before the whole contract gets undercollateralized.

The users of this TOKEN_PRICE identifier accept that its use can result in loss of funds either due to misconfiguration or external market conditions. Even though UMA holders are incentivized to use the best effort in resolving correct price requests, under no circumstances UMA token holders should be held liable for either not resolving price request or resolving price that differs from broader market consensus.
