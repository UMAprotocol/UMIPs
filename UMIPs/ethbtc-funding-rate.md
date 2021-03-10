## Headers
| UMIP-47    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add ETHBTC_FR as a price identifier              |
| Authors    | Sean Brown (smb2796), Kevin Chan (kevin-uma)  |
| Status     | Approved                                                                                                                                    |
| Created    | Feb 2, 2021   
| Discourse Link: TBD|  

## SUMMARY

The DVM should support price requests for a funding rate for the ETH/BTC UMA perpetual. This funding rate represents the change in a synthetic token's value per second.  

*Note*:
This funding rate identifier requires querying for the price of the synthetic token that will be created by a contract using this identifier. Throughout this UMIP, this synthetic will be referred to as ETHBTC-PERP. Since this synthetic has not yet been created, its specific details can not yet be included. This UMIP will be updated once the ETHBTC-PERP has been created to include its address, token name and AMM pool address.

## MOTIVATION

Without an expiry date to keep a synthetic token pegged to its underlying price, UMA’s perpetual contract requires that a funding rate be levied when there is a difference between the synthetic’s price and the underlying index. This will pressure the overvalued side to unwind its position or encourage the undervalued side to create a larger position. This mechanic is similar to what centralized exchanges use to keep their perpetual synthetics in line with its underlier.

Funding rate proposals and disputes function similarly to normal UMA price requests. On request, a proposer can post a bond and propose a new funding rate in return for a reward. If the funding rate proposal is not disputed within its liveness period, that proposed rate is then used to continuously adjust the value synthetic token sponsors' debt. If the proposed funding rate is successfully disputed, the proposer will lose their bond. The bond amount varies between each perpetual contract.

It should be noted that this is an altered price reporting from what has been used historically by UMA contracts. With the introduction of the [Optimistic Oracle](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-52.md) and new [EMP](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-54.md) and [Perpetual contract](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-53.md) templates, all funding rate and settlement price requests will be handled by the Optimistic Oracle, and will only be sent to the voters of the DVM in the case of a price or funding rate dispute.

*Note*:
For future funding rates, it is likely that a more generalized funding rate identifier should be created and used. A generalized funding rate identifier would be able to support any funding rate request by making use of [ancillary data](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-55.md#motivation--rationale). This UMIP is reduced in scope and specifically only creates a methodology for the ETHBTC funding rate and is being proposed so that this identifier can be used as an example of how a funding rate would work for a specific synthetic. 

## MARKETS & DATA SOURCES

- Markets:

Uniswap: ETHBTC_PERP/USDC
Coinbase Pro: ETH/BTC
Binance: ETH/BTC
Bitstamp: ETH/BTC

- Live Price Endpoints

Uniswap prices are on-chain and can be queried in a variety of methods.

Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/ethbtc/price
Binance: https://api.cryptowat.ch/markets/binance/ethbtc/price
Bitstamp: https://api.cryptowat.ch/markets/bitstamp/ethbtc/price

- Update time: 

Uniswap - every block. 
Cryptowatch: Every 60 seconds

- Historical Price Endpoints:

Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/ethbtc/ohlc?after=1613450520&before=1613450520&periods=60
Binance: https://api.cryptowat.ch/markets/binance/ethbtc/ohlc?after=1613450520&before=1613450520&periods=60
Bitstamp: https://api.cryptowat.ch/markets/bitstamp/ethbtc/ohlc?after=1613450520&before=1613450520&periods=60

- Do these sources allow for querying up to 74 hours of historical data? Yes
- How often is the provided price updated? 
- Is an API key required to query these sources? Cryptowatch has a free tier but bot operators will need an api key.
- Is there a cost associated with usage? Free tier available, but yes beyond that. 
- If there is a free tier available, how many queries does it allow for? 

The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying all three exchanges will cost 0.015 API credits).

Therefore, querying all three exchanges can be performed 665 times per day.

In other words, all three exchanges can be queried at most every 130 seconds.

- What would be the cost of sending 15,000 queries? Approximately $5.

## PRICE FEED IMPLEMENTATION
Bots that need to frequently calculate this price identifier will use price feeds that already exist in the UMA protocol repo.

To determine the ETHBTC rate, the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) is used.

To determine the ETHBTC_PERP synth price on Uniswap, the [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) is used.

To combine these rates in a mathematical expression, the [ExpressionPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) is used.

Price feed functionality to incorporate the CFRM and Token Scaling Multiplier (TSM) will still need to be built. Additionally, the CryptowatchPriceFeed does not currently support TWAP calculations, so this will need to be added.

Once these items are taken care of, a [default price feed config](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/DefaultPriceFeedConfigs.js) will be defined. Because some of this functionality is still being built out, this default price feed config will likely be different then what is shown below, but will follow this general patten.  

```
ETHBTC_FR: {
    type: "expression",
    expression: `
        ETHBTC_FV = ETH/BTC * CFRM * TOKEN_SCALING;
        (ETHBTC_PERP - ETHBTC_FV) / (ETHBTC_FV) / 86400 * (-1)
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    priceFeedDecimals: 18,
    customFeeds: {
      ETHBTC_PERP: { type: "uniswap", twapLength: 3600, address: "0xETHBTC_PERP_POOL" },
      "ETH/BTC": {
            type: "medianizer",
            pair: "ethbtc",
            minTimeBetweenUpdates: 60,
            twapLength: 3600,
            medianizedFeeds: [
                { type: "cryptowatch", exchange: "coinbase-pro" },
                { type: "cryptowatch", exchange: "binance" },
                { type: "cryptowatch", exchange: "bitstamp" }
            ]
      }
    }
}
```

## TECHNICAL SPECIFICATIONS
- Price Identifier Name: ETHBTC_FR
- Base Currency: ETHBTC_FR
- Quote currency: None. This is a percentage.
- Scaling Decimals: 18
- Rounding: Round to nearest 18 decimal places (19th decimal place digit >= 5 rounds up and < 5 rounds down)
- Synthetic Name: To be added
- Synthetic Address: To be added
- AMM Pool Address: To be added
- AMM Pair: ETHBTC_PERP/USDC

## RATIONALE

To create an ETH/BTC perpetual, an ETHBTC funding rate is required. This funding rate will be used to keep the price of the ETHBTC-PERP synthetic pegged to the ETHBTC rate times the cumulative funding rate multiplier (CFRM) and Token Scaling Multiplier (TSM). The funding rate will be determined with the following formula:
- [ETHBTC-PERP - ETHBTC-FV] / ETHBTC-FV / 86400
- `ETHBTC-FV` denotes the ETHBTC price gathered with the methodology shown in [UMIP-2](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-2.md) multiplied by the CFRM and TSM.
- `ETHBTC-PERP` denotes the one hour TWAP of the synthetic created with this funding rate identifier. This synth will be pooled with USDC. 
- 86400 is the number of seconds in a day. Assuming all other prices stay constant, this effectively gives the funding rate per second that would need to be applied to move a synthetic token's value back to fair value in one day.  

A one hour TWAP is used for the ETHBTC-PERP and ETHBTC-FV rates. This calculation was modeled off of the [FTX Funding rate calculation](https://help.ftx.com/hc/en-us/articles/360027946571-Funding), which also uses a 1-hour TWAP.

## IMPLEMENTATION
To calculate the ETHBTC-FR, voters should use the following process:

1. Following the specifications in [UMIP-2](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-2.md), query for the 1-hour ETHBTC TWAP, ending at the disputed funding rate proposal timestamp. This will consist of ~60 queries for the close price of each 60 second price period in that hour.
2. For each query time that was used in the ETHBTC 1-hour TWAP, query for the cumulative funding rate multiplier (CFRM) at the same timestamps.
3. For each period within the 1-hour TWAP, the corresponding CFRM and ETHBTC rates should be multiplied to get the 1-hour TWAP of ETHBTC * CFRM. 
4. Query for the Token Scaling Multiplier (TSM) for the ETHBTC_PERP, and multiply this by the result from step 3 to get the ETHBTC-FV.
5. Query for the ETHBTC-PERP 1-hour TWAP from the listed AMM pool. This will return the ETHBTC-PERP's TWAP denominated in USDC.
6. Subtract the result of step 4 from the result of step 5. [ETHBTC-PERP - ETHBTC-FV].
7. Divide the result of step 6 by the ETHBTC-FV rate from step 4. [ETHBTC-PERP - ETHBTC-FV]/ETHBTC-FV.
8. Divide the result of step 7 by 86400 (# of seconds in a day) to get the funding rate per second. This should then be multiplied by -1. Voters should then round this result to 18 decimal places.

As always, voters should determine whether the returned funding rate differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

### Cumulative Funding Rate Multiplier (CFRM) Calculation

The contract specific CFRM is stored on-chain for each perpetual contract. Voters can query this on-chain data in any way that they wish, for the block that the funding rate request was made in. 

1. Call the `fundingRate` method on the ETHBTC-PERP.

The results will be in this format:

```
{
    rate,
    identifier,
    cumulativeMultiplier,
    updateTime,
    applicationTime,
    proposalTime
}
```

Voters should use the `cumulativeMultipler` field.

### Token Scaling Multiplier

Each perpetual contract is given a `tokenScaling` multiplier when launched. This parameter specifies how the tracked index should be scaled. This is for situations where the initial perpetual price is not set to the starting rate of the underlying index.

Voters will need query for `tokenScaling` on the ETHBTC_PERP contract and use this within the `ETHBTC_FV` calculation. 

## Security Considerations
Adding this identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of funding rate proposers and disputers that can correctly manage the funding rate process.

The self-referential nature of this identifier introduces additional security concerns. There is a possibility that ETHBTC-PERP price manipulation could be attempted to adjust the funding rate. Add more elaboration. 

Additionally, this is the first UMA identifier of its kind. With novelty comes extra risk, as it is possible that this implementation is flawed. If any issues are identified after approval, UMA voters can always edit this implementation or delist this price identifier. 
