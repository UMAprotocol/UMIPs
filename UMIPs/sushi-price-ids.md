## Headers
| UMIP-Sushi    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add SUSHIUSD, USDSUSHI, XSUSHIUSD, USDXSUSHI as supported price identifiers              |
| Authors    | Sean Brown (smb2796)  |
| Status     | Draft                                                                                                                                    |
| Created    | March 10, 2021   
| Discourse Link |  

## SUMMARY

The DVM should support price requests for SUSHI/USD, USD/SUSHI, XSUSHI/USD or USD/XSUSHI.

## MOTIVATION

The DVM currently does not support these price identifiers. SUSHI and XSUSHI are also being proposed as supported collateral types, and using these as collateral together with these price identifiers would allow SUSHI or XSUSHI holders to get leverage on their holdings by minting yield-dollar type stablecoins. Adding SUSHI/USD and XSUSHI/USD will also allow for the creation of synthetic Sushi or XSUSHI, or more bespoke contracts such as covered call options backed by SUSHI or XSUSHI.

## MARKETS & DATA SOURCES

- Contract Addresses:

[SUSHI](https://etherscan.io/address/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2)
[XSUSHI](https://etherscan.io/address/0x8798249c2e607446efb7ad49ec89dd1865ff4272)
[SUSHI/ETH LP](https://etherscan.io/address/0x795065dcc9f64b5614c407a6efdc400da6221fb0)

- Markets: SushiSwap, Binance, Huobi
- Pairs: 

SushiSwap: SUSHI/ETH
Binance: SUSHI/USDT
Huobi: SUSHI/USDT
ETH/USD follows the methodology in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md).

- Live Price Endpoints:
  
Binance: https://api.cryptowat.ch/markets/binance/sushiusdt/price
Huobi: https://api.cryptowat.ch/markets/huobi/sushiusdt/price

- Update time: Every second for CW. Every block for SushiSwap. 
- Historical Price Endpoints:

Binance: https://api.cryptowat.ch/markets/binance/sushiusdt/ohlc?after=1612880040&before=1612880040&periods=60
Huobi: https://api.cryptowat.ch/markets/huobi/sushiusdt/ohlc?after=1612880040&before=1612880040&periods=60
SushiSwap: 

- Do these sources allow for querying up to 74 hours of historical data? Yes
- How often is the provided price updated? Every 60 seconds for CW. Every block for SushiSwap.
- Is an API key required to query these sources? CW has a free tier, but requires an API key beyond that.
- Is there a cost associated with usage? Yes. Cryptowatch requires a purchase of credits beyond their free tier.
- If there is a free tier available, how many queries does it allow for?

The free tier is limited to 10 API credits per 24-hours; the cost of querying the market price of a given exchange is 0.005 API credits (i.e. querying the two exchanges will cost 0.010 API credits). This would allow for 1000 free queries per day.

- What would be the cost of sending 15,000 queries? $5.

## PRICE FEED IMPLEMENTATION
These price identifiers will use price feeds that already exist. Both will use the [Cryptowatch](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.js) and [Uniswap](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.js) price feeds to get the price of SUSHIUSD, and the XSUSHI identifiers will also use the [LPPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/LPPriceFeed.js) to determine the amount of SUSHI that each XSUSHI is redeemable for.

## TECHNICAL SPECIFICATIONS

- Price Identifier Name: SUSHIUSD
- Base Currency: SUSHI
- Quote currency: USD
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

- Price Identifier Name: USDSUSHI
- Base Currency: USD
- Quote currency: SUSHI
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

- Price Identifier Name: XSUSHIUSD
- Base Currency: XSUSHI
- Quote currency: USD
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

- Price Identifier Name: USDXSUSHI
- Base Currency: USD
- Quote currency: XSUSHI
- Scaling Decimals: 18 (1e18)
- Rounding: Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)

## RATIONALE

The three markets chosen for pricing SUSHI/USD were picked because they are three of the highest daily trading volume markets available.

SushiSwap has lower daily volume than some other CEXs like OKEx, but it seems correct to use SushiSwap since it is SUSHI's native market and will assumably continue to have one of the highest trading volumes.

Typically it is best practice to use a TWAP when pricing with DEX markets. A TWAP is not used in this implementation because SushiSwap is only one of the three sources used for the median, so any irregular price action or attempted manipulation will be invalidated anyways.

## IMPLEMENTATION

### SUSHIUSD and USDSUSHI

1. For the price request timestamp, query for the SUSHIUSDT prices on Binance and Huobi and the ETHUSD price by following the guidelines of UMIP-6. The open price of the 60-second OHLC period that this price request timestamp falls in should be used.
2. For the block of the price request timestamp, query for the SUSHIETH price from SushiSwap.
3. Multiply the gathered ETHUSD price by SUSHIETH to get the SushiSwap SUSHIUSD price.
4. Take the median of these.
5. Round to 6 decimals to get the SUSHIUSD price.
6. To get the USDSUSHI price, voters should just take the inverse of SUSHIUSD from step 5.

### XSUSHIUSD and USDXSUSHI

As noted in the Rationale section, XSUSHI is a LP token given specifically to SUSHI token stakers. 1 XSUSHI is equivalent to a number of SUSHI tokens represented by the total amount of SUSHI locked in the XSUSHI contract divided by the total supply of XSUSHI.

1. At the block that the price request timestamp is at, the `balanceOf` [SUSHI](https://etherscan.io/address/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2) for the XSUSHI contract address, [0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272](https://etherscan.io/address/0x8798249c2e607446efb7ad49ec89dd1865ff4272), needs to be queried for.
2. Voters should then query for the `totalSupply` of XSUSHI in the same block.
3. The `balanceOf` SUSHI should be divided by the `totalSupply` of XSUSHI to determine the number of SUSHI that each XSUSHI is worth.
4. The price of SUSHIUSD should then be gathered in the same manner as explained in the section above.
5. The result of step 3 and step 4 should be multiplied to get the price of XSUSHIUSD. Voters should then round this result to 6 decimal places.
6. USDXSUSHI follows the same pattern except adds the additional step of taking the inverse of the XSUSHIUSD result. 

## Security Considerations

Adding this new identifier by itself poses little security risk to the DVM or priceless financial contract users. However, anyone deploying a new priceless token contract referencing this identifier should take care to parameterize the contract appropriately to the reference asset’s volatility and liquidity characteristics to avoid the loss of funds for synthetic token holders. Additionally, the contract deployer should ensure that there is a network of liquidators and disputers ready to perform the services necessary to keep the contract solvent.

There are some security considerations associated with adding a low float token like XSUSHI as collateral. These are explained further in the XSUSHI collateral UMIP. 

$UMA-holders should evaluate the ongoing cost and benefit of supporting price requests for this identifier and also contemplate de-registering this identifier if security holes are identified. As noted above, $UMA-holders should also consider re-defining this identifier as liquidity in the underlying asset changes, or if added robustness (eg via TWAPs) are necessary to prevent market manipulation.