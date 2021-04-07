## Headers
| UMIP-73  |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------| 
| UMIP Title | Add BALUSD and USDBAL as supported price identifiers              |
| Authors    | Mhairi McAlpine (mhairi@UMAproject.org)  |
| Status     | Last Call                                                                                                                     
| Created    | March 30, 2021   
| [Discourse Link](https://discourse.umaproject.org/t/add-balusd-usdbal-as-supported-price-identifiers/512) |  

## SUMMARY

The DVM should support requests for the price of 1 BAL token in USD, or the price of 1 USD in BAL. The canonical price identifiers on-chain should be BALUSD and USDBAL.

## MOTIVATION

The DVM currently does not support these price identifiers. BAL is also being proposed as a supported collateral type and using BAL as collateral together with these price identifiers would allow BAL holders to get leverage on their holdings by minting yield-dollar type stablecoins. Adding BAL/USD will also allow for the creation of synthetic BAL, or more bespoke contracts such as covered call options backed by BAL.

## MARKETS & DATA SOURCES

- Contract Addresses:

[BAL](https://etherscan.io/address/0xba100000625a3754423978a60c9317c58a424e3d)

- Markets: Balancer, Binance, Coinbase Pro
- Pairs: 

Balancer: BAL/ETH

Binance: BAL/USDT

Coinbase Pro/USD

ETH/USD follows the methodology in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md).

- Live Price Endpoints:
  
Binance: https://api.cryptowat.ch/markets/binance/balusdt/price

Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/balusd/price

- Update time: Every second for CW. Every block for Balancer. 
- Historical Price Endpoints:

Binance: https://api.cryptowat.ch/markets/binance/balusdt/ohlc?after=1612880040&before=1612880040&periods=60

Coinbase Pro: https://api.cryptowat.ch/markets/coinbase-pro/balusd/ohlc?after=1612880040&before=1612880040&periods=60

Balancer : The 80/20 BAL/WETH Balancer pool should be used. The address is: [0x59A19D8c652FA0284f44113D0ff9aBa70bd46fB4](https://etherscan.io/address/0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4)

- Do these sources allow for querying up to 74 hours of historical data? Yes
- How often is the provided price updated? Every 60 seconds for CW. Every block for Balancer.
- Is an API key required to query these sources? CW has a free tier, but requires an API key beyond that.
- Is there a cost associated with usage? Yes. Cryptowatch requires a purchase of credits beyond their free tier.
- If there is a free tier available, how many queries does it allow for?

The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying the two exchanges will cost 0.010 API credits). This would allow for 1000 free queries per day.

- What would be the cost of sending 15,000 queries? $5.

## PRICE FEED IMPLEMENTATION
These price identifiers will use price feeds that already exist. Both will use the [Cryptowatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js), [Balancer](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) and [Expression](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/ExpressionPriceFeed.js) price feeds to get the price of BALUSD. 

The default price feed config for BALUSD would follow this pattern:

```
BALUSD: {
    type: "expression",
    expression: `
        SPOT_BALANCER = SPOT_BALANCER_ETH * ETHUSD;
        median(SPOT_BINANCE, SPOT_COINBASE-PRO, SPOT_BALANCER)
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      SPOT_BINANCE: { type: "cryptowatch", exchange: "binance", pair: "balusdt" },
      SPOT_COINBASE-PRO: { type: "cryptowatch", exchange: "coinbase-pro", pair: "balusd" },
      SPOT_BALANCER: { 
          type: "balancer", 
          balancerAddress: "0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4", 
          balancerTokenIn: "0xba100000625a3754423978a60c9317c58a424e3D",
          balancerTokenOut: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      },
      ETHUSD: {
        type: "medianizer",
        minTimeBetweenUpdates: 60,
        medianizedFeeds: [
            { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
            { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
            { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
        ]
        }
    }
}
```



## TECHNICAL SPECIFICATIONS

- Price Identifier Name: BALUSD
- Base Currency: BAL
- Quote currency: USD
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

- Price Identifier Name: USDBAL
- Base Currency: USD
- Quote currency: BAL
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)


## RATIONALE

The markets chosen for pricing BAL/USD were selected on the following basis 

  - Bal/Eth on Balancer as it is the highest volume market.

  - Bal/USDT on Binance as it is the second highest market and highest USD market.
  
  - Bal/USD on Coinbase Pro as it the most robust of the high volume exchanges and is available through Cryptowatch.


Typically it is best practice to use a TWAP when pricing with DEX markets. A TWAP is not used in this implementation because Balancer is only one of the three sources used for the median, so any irregular price action or attempted manipulation will be invalidated in most situations.

## IMPLEMENTATION

### BALUSD and USDBAL

1. For the price request timestamp, query for the BALUSD(T) prices on Binance and Coinbase Pro and and the ETHUSD price by following the guidelines of UMIP-6. The open price of the 60-second OHLC period that this price request timestamp falls in should be used.
2. For the block of the price request timestamp, query for the BALETH price from Balancer.
3. Multiply the gathered ETHUSD price by BALETH to get the Balancer BALUSD price.
4. Take the median of the BALUSD results from Balancer, Coinbase Pro and Binance.
5. Round to 6 decimals to get the BALUSD price.
6. To get the USDBAL price, voters should just take the inverse of the result of Step 4 (unrounded BALUSD price) then round to 6 decimal places.

As with all UMA price identifiers, voters are responsible for determining if the result of this calculation methodology differs from broad market consensus. This is meant to be vague as voters are responsible for defining broad market consensus. In these situations, the voters are responsible for coming to a consensus on the best alternative calculation methodology.

## Security Considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.
