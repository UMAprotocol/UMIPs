## Headers
| UMIP-103                |                                                               |
| ------------------- | ------------------------------------------------------------- |
| UMIP Title          | Add OPENUSD and USDOPEN as supported price identifiers |
| Authors             | Logan F [logan@opendao.io]                                                     |
| Status              | Approved                                                        |
| Created             | May 20th, 2021                                              |
| Discourse Link      | https://discourse.umaproject.org/t/add-openusd-and-usdopen-as-a-supported-price-identifiers/1116            |

# Summary 

The DVM should support price requests for OPENUSD and USDOPEN.


# Motivation

The DVM currently does not support the OPENUSD and USDOPEN price indexes.

Supporting the OPENUSD and USDOPEN price identifiers would enable the creation of a call option primitive for OPEN tokens, creating a new opportunity for the OPEN token holders who would be able to write the option and provide liquidity against it.

OPEN has a circulating supply of 10.6 Million OPEN coins and a max supply of 100 Million. Bilaxy and Uniswap are the most active markets, with a total market cap of $9,614,853 at the time of writing. More information on OpenDAO can be found on the website: https://opendao.io/


# Data Specifications

Prices should be calculated using the OPEN/ETH and OPEN/USDT price on Uniswap.

Due to low volume and being dispersed across chains, it is recommended to employ a 5-minute TWAP.

-----------------------------------------
- **Price identifier name:** OPENUSD
- **Markets & Pairs:**  
  - *Uniswap*: OPEN/ETH 
  - *Uniswap*: OPEN/USDT
- **Example data providers:** Uniswap - Direct
- **Cost to use:** Free
- **Real-time data update frequency: Frequency** - On every Ethereum block (i.e. every ~15 seconds)
- **Historical data update frequency: Frequency** - hourly

# Price Feed Implementation
```
OPENUSD: {
    type: "expression",
    expression: `
      median(OPENETH * ETHUSD, OPENUSDT)
    `,
    lookback: 7200,
    minTimeBetweenUpdates: 60,
    customFeeds: {
      OPENETH: {
        type: "uniswap",
        uniswapAddress: "0x1dDf85Abdf165d2360B31D9603B487E0275e3928",
        twapLength: 300
      },
      OPENUSDT: {
        type: "uniswap",
        uniswapAddress: "0x507d84fe072Fe62A5F2e1F917Be8Cc58BdC53eF8",
        twapLength: 300
      },
      ETHUSD: {
        type: "medianizer",
        minTimeBetweenUpdates: 60,
        medianizedFeeds: [
          { type: "cryptowatch", exchange: "coinbase-pro", pair: "ethusd" },
          { type: "cryptowatch", exchange: "binance", pair: "ethusdt" },
          { type: "cryptowatch", exchange: "kraken", pair: "ethusd" }
        ]
      },
    }
  },
```

# Technical Specifications

-----------------------------------------
- **Price identifier name:**  OPENUSD
- **Base Currency:** OPEN
- **Quote Currency:** USD
- **Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
- **Estimated current value of price identifier:** ~$0.617732 on May 23rd 10:32 (GMT-7)

- **Price identifier name:**  USDOPEN
- **Base Currency:** USD
- **Quote Currency:** OPEN
- **Rounding:** Round to nearest 6 decimal places (seventh decimal place digit >= 5 rounds up and < 5 rounds down)
- **Estimated current value of price identifier:** ~1.618825 $OPEN on May 23rd 10:32 (GMT-7)

# Rationale

The addition of OPENUSD and USDOPEN fits into a larger goal of advancing the adoption of the UMA protocol. 

For example: Bob could write the option and provide LP against it, which means he makes fees from the trading of the option which can be quite healthy.

Bob risks losing his collateral if the strike price is reached, but Bob would probably not lock all of his tokens in the option contract (unless he does not believe the price is likely to be reached at all). If the price is reached then the appreciation in the token price for the rest of his holdings would more than cover any losses.

In addition, OpenDAO will be proposing that these synths be whitelisted for UMA liquidity mining. This process would take OPEN tokens out of circulation, creating upward price pressure. It also adds up as TVL, which in turn would be an bull signal for OPEN token price as well as UMA token price (given that it uses UMA contracts underneath.)

There are a few further concerns which will be further addressed, in the *Security Considerations* section.

**Note:** Bilaxy Volume was excluded from the price feed: questionable trading data.

# Implementation

Voters should query for the price of USDOPEN at the price request timestamp on Uniswap. 

1. For the price request timestamp, query for the OPEN/USDT price on Uniswap using a 5 minute TWAP.

2. Query the ETHUSD price by following the guidelines of UMIP-6.

3. Query OPENETH Price from Uniswap using 5 minute TWAP.

4. Take the average of: the price from step 1 *and* the result from multiplying the results from step 2 and step 3.

5. The result should be rounded to six decimals to determine the OPENUSD price.

6. (for USDOPEN) Take the inverse of the result of step 5 (1/ OPENUSD), before rounding, to get the USD/OPEN price, and round to 6 decimals.

For both implementations, voters should determine whether the returned price differs from broad market consensus. This is meant to provide flexibility in any unforeseen circumstances as voters are responsible for defining broad market consensus.

This is only a reference implementation, how one queries the exchanges should be varied and determined by the voter to ensure that there is no central point of failure.



# Security Considerations

Concerns regarding volume and data sources should be reconsidered, as the  this identifier is only intended to be used currently for fully covered call options which will have no liquidation bots running.

Issues regarding the number of unlocked tokens on the market have been addressed, as 67.7 million OPEN tokens (67.7% of total supply) have been  locked with Team Finance for 1 year. Details can be found on Medium via this link:

https://medium.com/opendao/open-token-lock-191e8c3bc9e7

**The address where the tokens are locked is here:**
https://etherscan.io/token/0x69e8b9528cabda89fe846c67675b5d73d463a916?a=0xc77aab3c6d7dab46248f3cc3033c856171878bd5
