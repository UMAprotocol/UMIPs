## Headers

| UMIP-CVX            |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add CVXUSD and USDCVX as supported price identifiers |
| Authors             | petro                    |
| Status              | Draft                                                     |
| Created             | December 10, 2021                                                 |



# Summary

The DVM should support price requests for CVX/USD and USD/CVX pair.

The canonical identifier should be `CVXUSD` and `USDCVX`.

# Motivation

At the moment, DVM, does not support the requested price identifiers.

CVX is the native token of Convex Finance with different utilities within the protocol:

- Stake to earn fees from Curve LPs
- Receives fees of tokenized CRV (cvxCRV)
- Voting rights to decide allocation of `veCRV` towards Curve's gauge weights (only when vote-lock).

At the broader ecosystem level, there is not available on-chain the price feed of `CVX` expressed in dollar denomination, which could be quite helpful of getting an unbiases feed on-chain for different purposes, for example: providing `CVX` as collateral in a protocol and having a way to calculate its value in dollar denomination.


# Data Specifications

- Price identifier name: CVXUSD and USDCVX

- Market and pairs:
    - CVX/USDT: [Okex](https://www.okex.com/markets/spot-info/cvx-usdt)
    - CVX/WETH: [Sushiswap](https://analytics.sushi.com/pairs/0x05767d9ef41dc40689678ffca0608878fb3de906)
    - CVX/WETH: [Uniswap-v3](https://info.uniswap.org/#/pools/0x2e4784446a0a06df3d1a040b03e1680ee266c35a)
    - ETH/USD(T): Refer to ETHUSD in [UMIP-6](https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-6.md)

- Example data providers:
    - CVX/USDT: CryptoWatch

- Real-time data update frequency:
    - CryptoWatch: updated every trade
    - AMM pools: updated every block mined

# Price feed implementation

This price identifier uses the [CryptoWatchPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/CryptoWatchPriceFeed.ts) and [UniswapPriceFeed](https://github.com/UMAprotocol/protocol/blob/master/packages/financial-templates-lib/src/price-feed/UniswapPriceFeed.ts) with the example configuration below:

```
  "CVXUSD": {
    type: "expression",
     expression: ` 
      convex_usd_sushi = ETHUSD * CVX_WETH_SUSHI;
      convex_usd_uni = ETHUSD * CVX_WETH_UNI;
      median( convex_usd_sushi, convex_usd_uni, CVX_USD_OKEX )
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      CVX_WETH_SUSHI: {
        type: "uniswap",
        uniswapAddress: "0x05767d9EF41dC40689678fFca0608878fb3dE906",
        twapLength: 300
      },
      CVX_WETH_UNI: {
        type: "uniswap",
        version: "v3",
        uniswapAddress: "0x2E4784446A0a06dF3D1A040b03e1680Ee266c35a",
        twapLength: 300
      },
      CVX_USD_OKEX: { type: "cryptowatch", exchange: "okex", pair: "cvxusdt", twapLength: 300 },
    },
  },
  "USDCVX": {
    type: "expression",
    expression: "1 / CVXUSD",
  },
  ```

  # Technical Specifications

- Price identifier name: CVXUSD
- Base Currency: CVX
- Quote Currency: USD
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 26.63043060 (10 Dec 2021 15:00:00 UTC)
-----------------------------------------
- Price identifier name: USDCVX
- Base Currency: USD
- Quote Currency: CVX
- Rounding: Round to 8 decimal places (ninth decimal place digit >= 5 rounds up and < 5 rounds down)
- Estimated current value of price identifier: 0.03755102 (10 Dec 2021 15:00:00 UTC)

# Rationale

CVX token has predominant volume in Sushiswap at the time of writing the UMIP with average volume of 11M, folowed by the Uniswap pool with average volume of 700k over the past month, which will be supplemented by the CEXs feed. For this price identifier it is also assumed that 1 USDT = 1 USD holds at all times.

CVX has predominant liquidity and volume activity in the AMMs paired with WETH. In order to mitigate attempted price manipulation 5 minute TWAP would be applied.


# Implementation

```
1. Query CVX/WETH price from Uniswap v3 and SushiSwap using 5-minute TWAP.
2. Query the WETH/USD price as per UMIP-6.
3. Multiply each of CVX/WETH prices in step 1 with ETH/USD price from step 2.
4. Take the open CVX/USDT price of the 1 minute OHLC period that the timestamp falls in from Okex.
5. Take the median of all results from step 3 and 4.
6. Round result from step 5 to 8 decimals to get the CVXUSD price.
7. (for USDCVX) Take the inverse of the result of step 5.
8. (for USDCVX) Round result from step 7 to 8 decimals to get the USDCVX price.
```

Voters should ensure that their results do not differ from broad market consensus. This is meant to be vague as the token-holders are responsible for defining broad market consensus.

# Security considerations

The inclusion of this requested price identifier should not present a security concern for DVM.

Liquidity is ample specially in the Sushiswap pool, currently over 150M, it should allow the usage of its price feed, even for liquidatable contracts.