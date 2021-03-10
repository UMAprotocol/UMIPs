## Headers
| UMIP-Sushi    |                                                                                                                                          |
|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| UMIP Title | Add SUSHIUSD, USDSUSHI, XSUSHIUSD, USDXSUSHI as supported price identifiers              |
| Authors    | Sean Brown (smb2796)  |
| Status     | Draft                                                                                                                                    |
| Created    | March 10, 2021   
| Discourse Link |  

## SUMMARY

The DVM should support price requests for the price of SUSHI in USD, the price of xSUSHI in USD or the inverse of these.

## MOTIVATION

The DVM currently does not support these price identifiers. SUSHI and XSUSHI are also being proposed as supported collateral types, and using these as collateral together with these price identifiers would allow SUSHI or XSUSHI holders to get leverage on their holdings by minting yield-dollar type stablecoins. Adding SUSHI/USD and XSUSHI/USD will also allow for the creation of covered call options backed by SUSHI or XSUSHI.

## MARKETS & DATA SOURCES

- Markets: SushiSwap, Binance, Huobi
- Pairs: 

SushiSwap: SUSHI/ETH
Binance: SUSHI/USDT
Huobi: SUSHI/USDT
ETH/USD follows the methodology in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md).

- Live Price Endpoints: TBA
- Update time: Every second for CW. Every block for SushiSwap. 
- Historical Price Endpoints: TBA
- Do these sources allow for querying up to 74 hours of historical data? Yes
- How often is the provided price updated? Every 60 seconds for CW. Every block for SushiSwap.
- Is an API key required to query these sources? CW requires .
- Is there a cost associated with usage? Yes. Cryptowatch requires a purchase of credits beyond their free tier.
- If there is a free tier available, how many queries does it allow for? TBA.
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

TBA

## IMPLEMENTATION

### SUSHIUSD and USDSUSHI

1. For the price request timestamp, query for the SUSHIUSDT prices on Binance and Huobi and the ETHUSD price by following the guidelines of UMIP-6. The open price of the 60-second OHLC period that this price request timestamp falls in should be used.
2. For the block of the price request timestamp, query for the SUSHIETH price from SushiSwap.
3. Multiply the gathered ETHUSD price by SUSHIETH to get the SushiSwap SUSHIUSD price.
4. Take the median of these.
5. Round to 6 decimals to get the SUSHIUSD price.
6. To get the USDSUSHI price, voters should just take the inverse of SUSHIUSD from step 5.

### XSUSHIUSD and USDXSUSHI


## Security Considerations
